import * as vscode from 'vscode';
import { log, isRemote } from './utils';
import { ServerManager, ServerInfo } from './serverManager';

/**
 * 侧边栏 WebView 管理：
 * - IFrame 嵌入本地 Harness WebUI（100% 继承官方能力）
 * - 服务未启动时展示欢迎页 + 一键启动按钮
 * - WSL/SSH 远程环境用 vscode.asExternalUri 做端口转发兼容
 */
export class WebviewManager implements vscode.Disposable {
  private view: vscode.WebviewView | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly server: ServerManager) {
    // 服务状态变化 → 推送面板刷新
    this.disposables.push(server.onStateChanged((info) => this.postState(info)));
  }

  /** 由 extension.ts 在 registerWebviewViewProvider 时调用 */
  resolve(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.buildHtml(view.webview);

    // 面板内按钮（启动/停止/重启）→ 复用已注册命令
    view.webview.onDidReceiveMessage(
      (msg: { type?: string }) => {
        switch (msg.type) {
          case 'start':
            void vscode.commands.executeCommand('harness.start');
            break;
          case 'stop':
            void vscode.commands.executeCommand('harness.stop');
            break;
          case 'restart':
            void vscode.commands.executeCommand('harness.restart');
            break;
          default:
            break;
        }
      },
      undefined,
      this.disposables
    );

    this.postState(this.server.info());
  }

  /** 服务就绪后手动刷新 IFrame（启动流程结束时调用） */
  refresh(): void {
    this.postState(this.server.info());
  }

  /** 计算 IFrame 地址：远程环境走 asExternalUri 端口转发 */
  private async getFrameUrl(port: number): Promise<string> {
    const local = `http://127.0.0.1:${port}`;
    if (!isRemote()) {
      return local;
    }
    try {
      const external = await vscode.env.asExternalUri(vscode.Uri.parse(local));
      log(`远程环境端口转发：${local} → ${external.toString()}`);
      return external.toString();
    } catch (err) {
      log(`asExternalUri 转发失败，回退本地地址：${String(err)}`, 'warn');
      return local;
    }
  }

  /** 把最新服务状态推送到面板 */
  private postState(info: ServerInfo): void {
    if (!this.view) {
      return;
    }
    void (async () => {
      const frameUrl = info.port ? await this.getFrameUrl(info.port) : '';
      await this.view!.webview.postMessage({
        type: 'state',
        state: info.state,
        port: info.port,
        url: info.url,
        frameUrl,
        error: info.error,
      });
    })();
  }

  private buildHtml(webview: vscode.Webview): string {
    // 允许 iframe 加载本地 HTTP 服务；远程转发地址可能是 https
    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src ${webview.cspSource}`,
      'frame-src http://127.0.0.1:* http://localhost:* https:',
      `img-src ${webview.cspSource} https:`,
    ].join('; ');

    return /* html */ `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { padding: 0; margin: 0; display: flex; flex-direction: column; height: 100vh; }
    #panel { flex: 1; display: flex; flex-direction: column; }
    #status { display: none; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; padding: 0 16px; }
    #status h2 { font-size: 15px; margin-bottom: 4px; }
    #status p { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 4px 0; }
    #status .error { color: var(--vscode-errorForeground); }
    button { cursor: pointer; border: none; border-radius: 2px; padding: 6px 14px; margin: 8px 4px 0 0; font-size: 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    #frame { flex: 1; border: none; width: 100%; display: none; }
    .spinner { width: 24px; height: 24px; border: 3px solid var(--vscode-progressBar-background); border-top-color: transparent; border-radius: 50%; animation: spin 0.9s linear infinite; margin-bottom: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="panel">
    <iframe id="frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    <div id="status">
      <div class="spinner" id="spinner" style="display:none"></div>
      <h2 id="title">Harness 未启动</h2>
      <p id="desc">一键启动 DeepSeek-Harness，在 VSCode 内使用代码 / 运维 / 数据分析多智能体</p>
      <p id="err" class="error"></p>
      <div>
        <button id="startBtn">🚀 启动 Harness</button>
        <button id="stopBtn" class="secondary" style="display:none">停止服务</button>
      </div>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const frame = document.getElementById('frame');
    const status = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    const title = document.getElementById('title');
    const desc = document.getElementById('desc');
    const err = document.getElementById('err');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    let currentState = 'stopped';

    function render(msg) {
      currentState = msg.state;
      err.textContent = msg.error || '';
      switch (msg.state) {
        case 'running':
          status.style.display = 'none';
          spinner.style.display = 'none';
          if (frame.src !== msg.frameUrl) { frame.src = msg.frameUrl; }
          frame.style.display = 'block';
          break;
        case 'starting':
          status.style.display = 'flex';
          frame.style.display = 'none';
          spinner.style.display = 'block';
          title.textContent = 'Harness 启动中…';
          desc.textContent = '正在拉取运行时并启动服务，首次启动需要下载，请耐心等待';
          startBtn.style.display = 'none';
          stopBtn.style.display = 'none';
          break;
        case 'error':
          status.style.display = 'flex';
          frame.style.display = 'none';
          spinner.style.display = 'none';
          title.textContent = 'Harness 启动异常';
          desc.textContent = '请查看输出面板（Harness）获取详细日志';
          startBtn.style.display = 'inline-block';
          startBtn.textContent = '🔄 重新启动';
          stopBtn.style.display = 'none';
          break;
        default:
          status.style.display = 'flex';
          frame.style.display = 'none';
          spinner.style.display = 'none';
          title.textContent = 'Harness 未启动';
          desc.textContent = '一键启动 DeepSeek-Harness，在 VSCode 内使用代码 / 运维 / 数据分析多智能体';
          startBtn.style.display = 'inline-block';
          startBtn.textContent = '🚀 启动 Harness';
          stopBtn.style.display = 'none';
      }
    }

    startBtn.addEventListener('click', () => vscode.postMessage({ type: currentState === 'error' ? 'restart' : 'start' }));
    stopBtn.addEventListener('click', () => vscode.postMessage({ type: 'stop' }));

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'state') { render(msg); }
    });
  </script>
</body>
</html>`;
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
