import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { log, isWindows, findFreePort, waitForServer, sleep } from './utils';

export type ServerState = 'stopped' | 'starting' | 'running' | 'error';

export interface ServerInfo {
  state: ServerState;
  port?: number;
  url?: string;
  error?: string;
}

/**
 * dsh 本地服务进程管理：
 * - spawn 启动 npx @deepseek-ai/dsh web --port {port} --cwd {工作区}
 * - 启动前端口探测，被占用自动向后递增
 * - 启动后 HTTP 轮询等待就绪
 * - dispose / stop 强制杀死整个进程树，杜绝僵尸进程
 */
export class ServerManager implements vscode.Disposable {
  private process: ChildProcess | undefined;
  private _state: ServerState = 'stopped';
  private _port: number | undefined;
  private _error: string | undefined;

  private readonly _onStateChanged = new vscode.EventEmitter<ServerInfo>();
  /** 状态变化事件（状态栏、WebView 面板监听） */
  readonly onStateChanged = this._onStateChanged.event;

  get state(): ServerState {
    return this._state;
  }

  get port(): number | undefined {
    return this._port;
  }

  get url(): string | undefined {
    return this._port ? `http://127.0.0.1:${this._port}` : undefined;
  }

  private setState(state: ServerState, error?: string): void {
    this._state = state;
    this._error = error;
    this._onStateChanged.fire(this.info());
  }

  /** 启动 Harness 服务 */
  async start(cwd: string): Promise<ServerInfo> {
    if (this._state === 'running' || this._state === 'starting') {
      return this.info();
    }

    const config = vscode.workspace.getConfiguration('harness');
    const pkg = config.get<string>('dshPackage', '@deepseek-ai/dsh');
    const basePort = config.get<number>('port', 3124);
    const timeout = config.get<number>('startupTimeout', 60);

    // 端口探测：被占用自动向后递增
    const port = await findFreePort(basePort);
    if (port === undefined) {
      this.setState('error', `端口 ${basePort}~${basePort + 9} 全部被占用，请释放端口或修改 harness.port 配置`);
      return this.info();
    }
    if (port !== basePort) {
      log(`端口 ${basePort} 被占用，改用端口 ${port}`, 'warn');
    }

    const url = `http://127.0.0.1:${port}`;
    this._port = port;
    this.setState('starting');
    log(`启动 Harness：npx -y ${pkg} web --port ${port} --cwd ${cwd}`);
    log('首次启动需要下载 Harness 运行时，请耐心等待…', 'warn');

    const npx = isWindows ? 'npx.cmd' : 'npx';
    const args = ['-y', pkg, 'web', '--port', String(port), '--cwd', cwd];

    try {
      this.process = spawn(npx, args, {
        cwd,
        env: { ...process.env, ...this.buildEnv(config) },
        stdio: ['ignore', 'pipe', 'pipe'],
        // POSIX 下独立进程组，便于 stop 时整组强杀；Windows 用 taskkill /T 杀进程树
        detached: !isWindows,
      });
    } catch (err) {
      this.setState('error', `启动 Harness 进程失败：${String(err)}`);
      return this.info();
    }

    const proc = this.process;
    proc.stdout?.on('data', (d: Buffer) => log(`[dsh] ${d.toString().trimEnd()}`));
    proc.stderr?.on('data', (d: Buffer) => log(`[dsh] ${d.toString().trimEnd()}`, 'warn'));
    proc.on('error', (err) => {
      log(`Harness 进程错误：${err.message}`, 'error');
    });
    proc.on('close', (code) => {
      // 被 stop() 主动 kill 时 state 已是 stopped，不重复报错
      if (this._state !== 'stopped') {
        this.process = undefined;
        this.setState('error', `Harness 进程意外退出（code: ${code}），请查看输出面板日志`);
      }
    });

    // 轮询等待服务就绪
    const ready = await waitForServer(url, timeout);
    if (ready) {
      log(`Harness 已就绪：${url}`);
      this.setState('running');
    } else {
      log(`Harness 在 ${timeout} 秒内未就绪（${url}），终止进程`, 'error');
      this.killProcess();
      this._port = undefined;
      this.setState('error', `Harness 在 ${timeout} 秒内未就绪，已终止进程，请查看输出面板日志`);
    }
    return this.info();
  }

  /** 停止服务（强杀进程树） */
  async stop(): Promise<void> {
    if (this._state === 'stopped') {
      return;
    }
    log('停止 Harness 服务…');
    this.killProcess();
    this._port = undefined;
    this.setState('stopped');
  }

  /** 重启服务 */
  async restart(cwd: string): Promise<ServerInfo> {
    await this.stop();
    // 等端口完全释放
    await sleep(500);
    return this.start(cwd);
  }

  /** 按 BYOK 配置构建注入进程的环境变量 */
  private buildEnv(config: vscode.WorkspaceConfiguration): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = {};
    const key = (config.get<string>('apiKey', '') || '').trim();
    const baseUrl = (config.get<string>('baseUrl', '') || '').trim();
    const model = (config.get<string>('model', '') || '').trim();
    const provider = config.get<string>('provider', 'deepseek');

    if (key) {
      switch (provider) {
        case 'anthropic':
          env.ANTHROPIC_API_KEY = key;
          break;
        case 'openai-compatible':
          env.OPENAI_API_KEY = key;
          break;
        default:
          env.DEEPSEEK_API_KEY = key;
      }
    }
    if (baseUrl) {
      env.OPENAI_BASE_URL = baseUrl;
      env.DEEPSEEK_BASE_URL = baseUrl;
    }
    if (model) {
      env.HARNESS_MODEL = model;
    }
    return env;
  }

  /** 强制结束进程树 */
  private killProcess(): void {
    const proc = this.process;
    this.process = undefined;
    if (!proc || proc.pid === undefined) {
      return;
    }
    try {
      if (isWindows) {
        // /T 杀死整个进程树，/F 强制
        spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        // detached 启动的进程在独立进程组，负 PID 整组 SIGKILL
        process.kill(-proc.pid, 'SIGKILL');
      }
    } catch {
      // 进程可能已自行退出
    }
    // 兜底：直接杀父进程
    if (proc.exitCode === null && !proc.killed) {
      try {
        proc.kill('SIGKILL');
      } catch {
        /* 已退出 */
      }
    }
  }

  info(): ServerInfo {
    return { state: this._state, port: this._port, url: this.url, error: this._error };
  }

  dispose(): void {
    this.killProcess();
    this._onStateChanged.dispose();
  }
}
