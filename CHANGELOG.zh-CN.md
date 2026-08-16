# 变更日志

🌏 [English Changelog](./CHANGELOG.md)

## [0.1.0] - 2026-08-16（V1.0 MVP 首个版本）

- 一键启动 / 停止 / 重启 DeepSeek-Harness 本地服务（`npx @deepseek-ai/dsh web`，默认锁定 `0.1.0-rc.6` 稳定版本）
- 自动绑定当前 VSCode 工作区目录（Agent 工作目录隔离）
- 侧边栏内置 Harness 完整 WebUI（IFrame 嵌入，100% 继承官方全部能力）
- BYOK 支持：自定义 API Key / Base URL / 模型，环境变量注入本地进程
- Node.js 22+ 环境前置检测，缺失弹窗引导安装
- 端口占用自动探测递增，启动轮询就绪检测
- 插件关闭 / 窗口重载自动强杀后台进程，杜绝僵尸进程
- WSL / SSH 远程环境端口转发兼容（`vscode.asExternalUri`）
- 状态栏实时显示服务状态（未启动 / 启动中 / 运行中 / 异常）
