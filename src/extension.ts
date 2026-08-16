import * as vscode from 'vscode';
import { log, getWorkspacePath } from './utils';
import { ensureEnvironment } from './envChecker';
import { ServerManager, ServerInfo } from './serverManager';
import { WebviewManager } from './webviewManager';

/**
 * 插件入口：命令注册、视图注册、状态栏、生命周期。
 * 生命周期保障：ServerManager / WebviewManager 均注册进 subscriptions，
 * 插件停用（含窗口重载）时 dispose 自动强杀后台 dsh 进程。
 */
export function activate(context: vscode.ExtensionContext): void {
  log('Harness 插件激活');

  const server = new ServerManager();
  const webview = new WebviewManager(server);
  context.subscriptions.push(server, webview);

  // 状态栏：实时显示服务状态，点击打开面板
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'harness.focus';
  statusBar.text = '$(hubot) Harness';
  statusBar.tooltip = 'Harness 多智能体平台（未启动）';
  statusBar.show();
  context.subscriptions.push(
    statusBar,
    server.onStateChanged((info) => updateStatusBar(statusBar, info))
  );

  // 启动服务（含环境前置校验）
  context.subscriptions.push(
    vscode.commands.registerCommand('harness.start', async () => {
      const env = await ensureEnvironment();
      if (!env.ok) {
        return;
      }
      const cwd = getWorkspacePath();
      const info = await server.start(cwd);
      if (info.state === 'running') {
        vscode.window.showInformationMessage(`Harness 已启动：${info.url}（工作目录：${cwd}）`);
        webview.refresh();
      } else {
        vscode.window.showErrorMessage(`Harness 启动失败：${info.error ?? '未知错误'}`);
      }
    })
  );

  // 停止服务
  context.subscriptions.push(
    vscode.commands.registerCommand('harness.stop', async () => {
      await server.stop();
      vscode.window.showInformationMessage('Harness 已停止');
    })
  );

  // 重启服务
  context.subscriptions.push(
    vscode.commands.registerCommand('harness.restart', async () => {
      const env = await ensureEnvironment();
      if (!env.ok) {
        return;
      }
      const cwd = getWorkspacePath();
      const info = await server.restart(cwd);
      if (info.state === 'running') {
        vscode.window.showInformationMessage(`Harness 已重启：${info.url}`);
        webview.refresh();
      }
    })
  );

  // 聚焦 Harness 侧边栏面板
  context.subscriptions.push(
    vscode.commands.registerCommand('harness.focus', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.harness');
    })
  );

  // 侧边栏 WebView 视图
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('harness.webview', {
      resolveWebviewView(view) {
        webview.resolve(view);
      },
    })
  );

  // 可配置自动启动
  if (vscode.workspace.getConfiguration('harness').get<boolean>('autoStart')) {
    void vscode.commands.executeCommand('harness.start');
  }
}

/** 状态栏文案随服务状态联动 */
function updateStatusBar(item: vscode.StatusBarItem, info: ServerInfo): void {
  switch (info.state) {
    case 'running':
      item.text = `$(vm-active) Harness :${info.port}`;
      item.tooltip = `运行中：${info.url}`;
      break;
    case 'starting':
      item.text = '$(sync~spin) Harness 启动中…';
      item.tooltip = '正在启动 Harness 服务';
      break;
    case 'error':
      item.text = '$(error) Harness 异常';
      item.tooltip = info.error ?? '启动异常，点击打开面板';
      break;
    default:
      item.text = '$(hubot) Harness';
      item.tooltip = 'Harness 多智能体平台（未启动）';
  }
}

export function deactivate(): void {
  // ServerManager 已注册进 subscriptions，dispose 会自动强杀后台进程
  log('Harness 插件停用，后台进程已清理');
}
