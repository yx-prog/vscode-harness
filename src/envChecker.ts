import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { log } from './utils';

export interface EnvCheckResult {
  ok: boolean;
  issues: string[];
  nodeVersion?: string;
}

interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/** 运行命令并捕获输出（用于版本检测，非交互） */
function runCapture(cmd: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    try {
      const child = spawn(cmd, args, { shell: process.platform === 'win32' });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.on('error', (err) => resolve({ code: null, stdout, stderr: err.message }));
      child.on('close', (code) => resolve({ code, stdout, stderr }));
    } catch (err) {
      resolve({ code: null, stdout: '', stderr: String(err) });
    }
  });
}

/** 解析 node --version 输出（如 v22.14.0 → 22） */
function parseNodeMajor(version: string): number | undefined {
  const m = /v?(\d+)\./.exec(version.trim());
  return m ? Number(m[1]) : undefined;
}

/** 检测 Node.js 是否 >= 22 */
export async function checkNode(): Promise<{ ok: boolean; version?: string }> {
  const r = await runCapture('node', ['--version']);
  const major = parseNodeMajor(r.stdout);
  if (r.code !== 0 || major === undefined) {
    return { ok: false };
  }
  return { ok: major >= 22, version: r.stdout.trim() };
}

/** 检测 npx 是否可用 */
export async function checkNpx(): Promise<boolean> {
  const r = await runCapture('npx', ['--version']);
  return r.code === 0 && r.stdout.trim().length > 0;
}

/**
 * 完整环境前置校验（Node 22+ / npx）。
 * 失败时弹窗引导用户前往 Node.js 官网下载。
 */
export async function ensureEnvironment(): Promise<EnvCheckResult> {
  const issues: string[] = [];

  const node = await checkNode();
  if (!node.ok) {
    issues.push(
      node.version
        ? `当前 Node 版本 ${node.version}，Harness 需要 Node.js 22 及以上`
        : '未检测到 Node.js，Harness 需要 Node.js 22 及以上'
    );
  }

  if (!(await checkNpx())) {
    issues.push('未检测到 npx（随 Node.js 附带），请安装 Node.js 22+');
  }

  if (issues.length > 0) {
    log(`环境检测失败：${issues.join('；')}`, 'error');
    const goDownload = await vscode.window.showErrorMessage(
      `Harness 环境检测失败：${issues.join('；')}`,
      '前往 Node.js 官网下载'
    );
    if (goDownload) {
      await vscode.env.openExternal(vscode.Uri.parse('https://nodejs.org/zh-cn/download'));
    }
    return { ok: false, issues, nodeVersion: node.version };
  }

  log(`环境检测通过：Node ${node.version}`);
  return { ok: true, issues: [], nodeVersion: node.version };
}
