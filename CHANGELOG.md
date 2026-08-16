# Changelog

🌏 [中文变更日志](./CHANGELOG.zh-CN.md)

## [0.1.0] - 2026-08-16 (V1.0 MVP, first release)

- One-click start / stop / restart of the DeepSeek-Harness local service (`npx @deepseek-ai/dsh web`, pinned to the stable `0.1.0-rc.6`)
- Automatic binding to the current VSCode workspace (isolated agent working directory)
- Full Harness WebUI embedded in the sidebar (IFrame, 100% of the official capabilities)
- BYOK support: custom API key / base URL / model, injected into the local process as environment variables
- Node.js 22+ preflight environment checks with guided installer popup
- Automatic port probing with forward increment, readiness polling on startup
- Force-kill of the background process tree on extension shutdown / window reload — no zombie processes
- WSL / SSH remote port-forwarding compatibility (`vscode.asExternalUri`)
- Live service state in the status bar (stopped / starting / running / error)
