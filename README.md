# 🚀 Harness · Multi-Agent Platform for VSCode

> **One extension. Three teams.** Turn VSCode from "just an editor" into an AI command center — coding, ops, and data analysis agents powered by a single runtime.

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22-brightgreen.svg" alt="Node.js >= 22">
  <img src="https://img.shields.io/badge/VSCode-%3E%3D1.90-blue.svg" alt="VSCode >= 1.90">
  <img src="https://img.shields.io/badge/BYOK-Bring%20Your%20Own%20Key-blueviolet.svg" alt="BYOK">
  <img src="https://img.shields.io/badge/Core-DeepSeek--Harness-orange.svg" alt="DeepSeek-Harness">
</p>

🌏 [中文文档](./README.zh-CN.md)

---

## 💡 Why Harness?

Every mainstream VSCode AI extension — Cline, Roo, Claude Code — is **a single coding agent**. One skill, a hard-wired agent kernel, no extensibility, no audit trail, and the closed-source ones can't even be commercially redistributed.

**Harness is a general-purpose agent runtime inside your IDE.** Built on the DeepSeek-Harness pluggable agent kernel (MIT-licensed, commercially reusable, private-deployable), it unifies:

| | 🧑‍💻 Coding Agent | 🛠️ Ops Agent | 📊 Data Agent |
|---|---|---|---|
| **Skills** | Refactoring · Bug fixing · Shell execution · Git ops · Debugging | Docker / K8s operations · Server log analysis · Cluster troubleshooting | SQL queries · CSV cleaning · Python analysis · Report generation |
| **For** | Developers | SRE / DevOps | Analysts / Data engineers |

**Swap a plugin = switch a business scenario.** One client, every scenario. The first VSCode-native agent platform that is **self-hostable, auditable, multi-role customizable, and enterprise-controllable**.

## ⚡ Killer Features

- 🖥️ **One-click start/stop**: `Ctrl+Shift+P` → `Harness: Start Server` — the full Harness WebUI embeds right into your sidebar in seconds
- 🔗 **Workspace auto-binding**: agent working directory follows your current project; switch workspaces, keep them isolated
- 🔑 **BYOK, swap models freely**: DeepSeek, Claude, or any OpenAI-compatible endpoint. Your key, your rules, your data stays on your machine
- 🧩 **100% of Harness capabilities**: not a stripped-down chatbox — a complete agent runtime with long-task resume, sub-agent orchestration, and sandboxed execution
- 🧹 **Zero zombie processes**: processes are force-killed on extension shutdown or window reload — nothing lingers in the background
- 🛡️ **Preflight environment checks**: Node.js 22+ auto-detected, with a guided installer popup when missing
- 🚪 **Smart port avoidance**: 3124 taken? It probes forward automatically — conflicts never happen
- 🌐 **WSL / SSH remote ready**: automatic port forwarding in remote environments
- 🔒 **MIT licensed**: legally free to fork, commercialize, and redistribute — no closed-source lock-in

## 📋 Requirements

| Dependency | Version |
|---|---|
| VSCode | ≥ 1.90 |
| Node.js (with npx) | ≥ 22 |

## 📦 Installation

### Option 1: Install from VSIX (recommended)

1. Download the latest `vscode-harness-<version>.vsix` from [Releases](../../releases)
2. In VSCode: `Ctrl+Shift+P` → `Extensions: Install from VSIX…` → select the file
3. Restart VSCode and you're ready to go

### Option 2: Build from source

```bash
git clone https://github.com/yx-prog/vscode-harness.git
cd vscode-harness
npm install
npm run package          # produces vscode-harness-<version>.vsix
```

Then install the generated `.vsix` as in Option 1.

### Option 3: Development mode

```bash
npm install
# Press F5 in VSCode to launch the Extension Development Host
```

## 🚀 Quick Start

1. **Install** the extension (see above)
2. **Configure your API key** (optional — see [Configuring your LLM key](#-configuring-your-llm-key) below)
3. **Start**: click the Harness icon in the Activity Bar, or `Ctrl+Shift+P` → `Harness: Start Server`
4. **Work**: chat with agents directly in the sidebar WebUI

> ⏳ The first launch downloads the Harness runtime via npx — give it a few minutes. Subsequent launches are near-instant.

## ⚙️ Usage

### Start / Stop / Restart

| Action | How |
|---|---|
| Start | Activity Bar icon → **🚀 Start Harness** button, or `Ctrl+Shift+P` → `Harness: Start Server` |
| Stop | `Ctrl+Shift+P` → `Harness: Stop Server` |
| Restart | `Ctrl+Shift+P` → `Harness: Restart Server` |
| Open panel | `Ctrl+Shift+P` → `Harness: Open Panel`, or click the status bar item |

### Status bar

The status bar shows live service state:

- `$(hubot) Harness` — stopped
- `$(sync~spin) Harness 启动中…` — starting
- `$(vm-active) Harness :3124` — running (shows the actual port)
- `$(error) Harness 异常` — failed (click to open the panel for details)

### 🔑 Configuring your LLM key (BYOK)

There are two ways — pick either:

**Way A: In the extension settings** (key is injected into the local process as an environment variable)

`File → Preferences → Settings` → search `harness` and set:

| Setting | Example |
|---|---|
| `harness.provider` | `deepseek` / `anthropic` / `openai-compatible` |
| `harness.apiKey` | `sk-xxxxxxxx` |
| `harness.baseUrl` | `https://api.deepseek.com/v1` |
| `harness.model` | `deepseek-chat` |

**Way B: In the Harness WebUI** (leaves nothing in VSCode settings)

Start the service first, then configure providers directly inside the embedded Harness WebUI — exactly like using Harness standalone.

> 🔒 In local personal mode, your key is only injected into the Harness process on your own machine. The service runs on localhost. Nothing is uploaded anywhere.

### Workspace binding

The agent working directory automatically follows your currently opened workspace folder. Switching projects switches the agent's context — multiple projects never mix.

### Remote development (WSL / SSH / Containers)

When VSCode is connected to a remote environment, Harness starts inside that environment and the extension automatically sets up port forwarding (`vscode.asExternalUri`) so the WebUI stays reachable in the sidebar. No extra configuration needed.

### Auto-start

Set `harness.autoStart` to `true` to launch Harness automatically when the workspace opens.

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| "Node.js not detected / version too old" | Install Node.js 22+ from [nodejs.org](https://nodejs.org/), then restart VSCode |
| First launch is very slow | Normal — the runtime is being downloaded via npx. Increase `harness.startupTimeout` if needed |
| "Server not ready in 60s" | Open the Output panel (channel: `Harness`) for logs; check your network access to the npm registry |
| Port 3124 already in use | Harness auto-probes forward (3125, 3126…). To use a specific port, free it or change `harness.port` |
| WebUI blank in the sidebar | Click the status bar item to reopen the panel; restart the service |
| Process left running after closing VSCode? | Shouldn't happen — shutdown force-kills the process tree. If it ever does: `pkill -f "@deepseek-ai/dsh"` (Linux/macOS) or `taskkill /F /IM node.exe` filter by PID (Windows) |

## ⚙️ Configuration Reference

| Setting | Default | Description |
|---|---|---|
| `harness.dshPackage` | `@deepseek-ai/dsh@0.1.0-rc.6` | Harness CLI package (version-pinned to a stable rc; no auto-updates) |
| `harness.port` | `3124` | Local server port (auto-increments if occupied) |
| `harness.autoStart` | `false` | Start Harness automatically when the workspace opens |
| `harness.provider` | `deepseek` | LLM provider: `deepseek` / `anthropic` / `openai-compatible` |
| `harness.apiKey` | empty | Your API key (leave empty to configure inside the WebUI) |
| `harness.baseUrl` | empty | OpenAI-compatible endpoint URL |
| `harness.model` | empty | Default model name |
| `harness.startupTimeout` | `60` | Seconds to wait for the server to become ready |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│        VSCode Extension (Harness client)     │
│  Process mgmt · Workspace binding · WebView  │
├─────────────────────────────────────────────┤
│        DeepSeek-Harness (Agent runtime)      │
│  Agent loop · Tool dispatch · Sub-agents     │
│  Coding │ Ops │ Data Analysis agents         │
└─────────────────────────────────────────────┘
         BYOK: your key, straight to DeepSeek /
         Claude / any OpenAI-compatible endpoint
```

## 🗺️ Roadmap

- **V1.0 (current)**: stable IFrame edition · multi-agent prototypes · BYOK personal mode
- **V1.5**: research the ACP native protocol · UX polish
- **V2.0**: native Chat-Participant · deep IDE integration
- **V3.0 Enterprise**: centralized key management · full session audit · high-risk operation approval · SSO · private deployment

Enterprise capabilities (unified key management, operation audit, permission approval, on-prem deployment) are on the way — for teams whose data must never leave the intranet.

## ❓ FAQ

**Q: How is this different from Cline / Roo?**
A: They are single coding agents. Harness is a runtime platform — coding, ops, and data analysis agents over one kernel, with a full audit trail and private-deployment capability.

**Q: Is my API key sent to any server?**
A: No. In local personal mode, the key is injected only into the Harness process on your own machine; the service runs on localhost.

**Q: Why Node.js 22+?**
A: The Harness runtime requires modern Node features. 22+ guarantees stability.

**Q: Can I use this commercially?**
A: Yes. MIT licensed — free to fork, modify, self-host, and redistribute commercially.

## 🔨 Development

```bash
npm install       # install dependencies
npm run compile   # type check (tsc)
npm run build     # bundle with esbuild → dist/extension.js
npm run watch     # rebuild on change
npm run package   # build the .vsix
```

Press **F5** in VSCode to launch the Extension Development Host with the extension loaded.

## 📄 License

[MIT](./LICENSE)

---

<p align="center">
  <b>Harness — one IDE, all your agents.</b>
</p>
