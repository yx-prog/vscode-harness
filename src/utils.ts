import * as vscode from 'vscode';
import * as os from 'os';
import * as http from 'http';
import * as net from 'net';

/** 插件输出面板（Output Channel） */
let output: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!output) {
    output = vscode.window.createOutputChannel('Harness');
  }
  return output;
}

/** 统一日志输出：info 静默写入，warn/error 自动弹出输出面板 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const ch = getOutputChannel();
  const time = new Date().toLocaleTimeString();
  ch.appendLine(`[${time}] [${level.toUpperCase()}] ${message}`);
  if (level !== 'info') {
    ch.show(true);
  }
}

export const isWindows = process.platform === 'win32';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 检测 TCP 端口是否空闲（监听失败 = 被占用） */
export function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

/** 从 start 开始向后探测，返回第一个空闲端口（最多 attempts 个） */
export async function findFreePort(start: number, attempts = 10): Promise<number | undefined> {
  for (let i = 0; i < attempts; i++) {
    const port = start + i;
    if (await isPortFree(port)) {
      return port;
    }
  }
  return undefined;
}

/** HTTP GET 探测：只要有任何响应（含非 2xx）即视为服务就绪 */
export function probeHttp(url: string, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/** 轮询等待服务就绪，超时返回 false */
export async function waitForServer(
  url: string,
  timeoutSeconds: number,
  intervalMs = 500
): Promise<boolean> {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    if (await probeHttp(url)) {
      return true;
    }
    await sleep(intervalMs);
  }
  return false;
}

/** 获取当前工作区路径；未打开工作区时回退到用户主目录 */
export function getWorkspacePath(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const fallback = os.homedir();
  const path = folder?.uri.fsPath ?? fallback;
  if (!folder) {
    log(`未检测到打开的工作区，回退到用户主目录：${path}`, 'warn');
  }
  return path;
}

/** 是否运行在远程环境（WSL / SSH / Container） */
export function isRemote(): boolean {
  return vscode.env.remoteName !== undefined;
}
