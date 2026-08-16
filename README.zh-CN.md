# 🚀 Harness · VSCode 多智能体开发平台

> **一个插件，装下三个团队。** 把 VSCode 从"编辑器"升级为"AI 指挥中心"——代码、运维、数据分析，一套内核全搞定。

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22-brightgreen.svg" alt="Node.js >= 22">
  <img src="https://img.shields.io/badge/VSCode-%3E%3D1.90-blue.svg" alt="VSCode >= 1.90">
  <img src="https://img.shields.io/badge/BYOK-✅%20自带Key-blueviolet.svg" alt="BYOK">
  <img src="https://img.shields.io/badge/内核-DeepSeek--Harness-orange.svg" alt="DeepSeek-Harness">
</p>

🌏 [English Documentation](./README.md)

---

## 💡 为什么是 Harness？

市面上的 VSCode AI 插件——Cline、Roo、Claude Code——**全部是"单一代码智能体"**。只能写代码，Agent 内核写死，无法扩展场景，没有审计，闭源的更不能商用。

**Harness 是 IDE 内通用智能体运行平台**：依托 DeepSeek-Harness 插件化 Agent 内核（MIT 开源、可商用、可私有化），在 VSCode 中统一承载：

| | 🧑‍💻 代码智能体 | 🛠️ 运维智能体 | 📊 数据分析智能体 |
|---|---|---|---|
| **能力** | 项目重构 · Bug 修复 · Shell 执行 · Git 操作 · Debug | Docker / K8s 操作 · 服务器日志分析 · 集群排查 | SQL 查询 · CSV 清洗 · Python 分析 · 报表生成 |
| **给谁用** | 开发者 | 运维 / SRE | 分析师 / 数据工程师 |

**换插件 = 换业务场景**，一套客户端走天下。这是国内首个**可私有化、可审计、可自定义多角色智能体、可企业管控**的 VSCode 原生智能体平台。

## ⚡ 杀手级特性

- 🖥️ **一键启停**：`Ctrl+Shift+P` → `Harness: 启动服务`，秒级拉起本地 Harness，完整 WebUI 直接内嵌侧边栏
- 🔗 **工作区自动绑定**：Agent 工作目录跟随当前项目，切工作区即隔离，多项目并行不串台
- 🔑 **BYOK 自由换模型**：DeepSeek、Claude、任意 OpenAI 兼容接口，你的 Key 你做主，数据不出本机
- 🧩 **100% 继承 Harness 全部能力**：不是阉割版聊天框，是完整 Agent 运行时——长任务断点续跑、子 Agent 编排、沙箱执行全都有
- 🧹 **零僵尸进程**：插件关闭 / 窗口重载自动强杀进程树，后台干干净净
- 🛡️ **环境前置强校验**：Node.js 22+ 自动检测，缺失弹窗引导安装
- 🚪 **端口智能避让**：3124 被占用？自动向后探测，永不冲突
- 🌐 **WSL / SSH 远程兼容**：远程开发环境下端口自动转发，照常使用
- 🔒 **MIT 开源**：合法商用二次开发，没有 Claude Code 那种"闭源不可分发"的锁链

## 📋 环境要求

| 依赖 | 版本 |
|---|---|
| VSCode | ≥ 1.90 |
| Node.js（含 npx） | ≥ 22 |

## 📦 安装

### 方式一：VSIX 安装包（推荐）

1. 从 [Releases](../../releases) 下载最新 `vscode-harness-<版本号>.vsix`
2. VSCode 中 `Ctrl+Shift+P` → `Extensions: Install from VSIX…` → 选择文件
3. 重启 VSCode 即可使用

### 方式二：源码构建

```bash
git clone https://github.com/yx-prog/vscode-harness.git
cd vscode-harness
npm install
npm run package          # 生成 vscode-harness-<版本号>.vsix
```

然后按方式一安装生成的 `.vsix`。

### 方式三：开发模式

```bash
npm install
# 在 VSCode 中按 F5，启动扩展开发宿主
```

## 🚀 快速开始

1. **安装插件**（见上文）
2. **配置 API Key**（可选，详见下文 [配置 LLM Key](#-配置-llm-keybyok)）
3. **启动**：点击左侧活动栏 Harness 图标，或 `Ctrl+Shift+P` → `Harness: 启动服务`
4. **开工**：直接在侧边栏 WebUI 中与智能体对话

> ⏳ 首次启动需通过 npx 下载 Harness 运行时，请耐心等待数分钟；之后启动秒开。

## ⚙️ 使用方式

### 启动 / 停止 / 重启

| 操作 | 方式 |
|---|---|
| 启动 | 活动栏图标 → **🚀 启动 Harness** 按钮，或 `Ctrl+Shift+P` → `Harness: 启动服务` |
| 停止 | `Ctrl+Shift+P` → `Harness: 停止服务` |
| 重启 | `Ctrl+Shift+P` → `Harness: 重启服务` |
| 打开面板 | `Ctrl+Shift+P` → `Harness: 打开 Harness 面板`，或点击状态栏图标 |

### 状态栏

状态栏实时显示服务状态：

- `$(hubot) Harness` — 未启动
- `$(sync~spin) Harness 启动中…` — 启动中
- `$(vm-active) Harness :3124` — 运行中（显示实际端口）
- `$(error) Harness 异常` — 启动失败（点击打开面板查看详情）

### 🔑 配置 LLM Key（BYOK）

两种方式任选其一：

**方式 A：在插件设置中配置**（Key 以环境变量注入本地进程）

`文件 → 首选项 → 设置`，搜索 `harness`，填入：

| 配置项 | 示例 |
|---|---|
| `harness.provider` | `deepseek` / `anthropic` / `openai-compatible` |
| `harness.apiKey` | `sk-xxxxxxxx` |
| `harness.baseUrl` | `https://api.deepseek.com/v1` |
| `harness.model` | `deepseek-chat` |

**方式 B：在 Harness WebUI 中配置**（VSCode 设置里不存任何 Key）

先启动服务，再在内嵌的 Harness WebUI 中直接配置模型供应商——与独立使用 Harness 完全一致。

> 🔒 本地个人模式下，Key 只注入你自己机器上的 Harness 进程，服务运行在 localhost，不会上传到任何地方。

### 工作区绑定

Agent 工作目录自动跟随当前打开的 VSCode 工作区。切换项目即切换 Agent 上下文，多项目互不干扰。

### 远程开发（WSL / SSH / 容器）

VSCode 连接远程环境时，Harness 在远程环境内启动，插件自动建立端口转发（`vscode.asExternalUri`），侧边栏 WebUI 照常可达，无需额外配置。

### 自动启动

将 `harness.autoStart` 设为 `true`，打开工作区时自动启动 Harness。

## 🛠️ 故障排查

| 问题 | 解决方法 |
|---|---|
| 提示 Node.js 未检测到 / 版本过低 | 到 [nodejs.org](https://nodejs.org/) 安装 Node.js 22+，重启 VSCode |
| 首次启动特别慢 | 正常现象——正在通过 npx 下载运行时。必要时调大 `harness.startupTimeout` |
| 提示"60 秒内未就绪" | 打开输出面板（频道：`Harness`）查看日志；检查 npm 源网络连通性 |
| 端口 3124 被占用 | 插件自动向后探测（3125、3126…）。如需指定端口，释放该端口或修改 `harness.port` |
| 侧边栏 WebUI 空白 | 点击状态栏图标重新打开面板；重启服务 |
| 关闭 VSCode 后仍有残留进程？ | 不应发生——关闭时自动强杀进程树。万一出现：Linux/macOS 执行 `pkill -f "@deepseek-ai/dsh"`；Windows 按 PID 过滤后 `taskkill /F` |

## ⚙️ 配置项参考

| 配置 | 默认值 | 说明 |
|---|---|---|
| `harness.dshPackage` | `@deepseek-ai/dsh@0.1.0-rc.6` | Harness CLI 包名（锁定稳定 rc 版本，不自动更新） |
| `harness.port` | `3124` | 本地服务端口（占用自动递增） |
| `harness.autoStart` | `false` | 打开工作区时自动启动 |
| `harness.provider` | `deepseek` | LLM 提供方：`deepseek` / `anthropic` / `openai-compatible` |
| `harness.apiKey` | 空 | 你的 API Key（留空则在 WebUI 内配置） |
| `harness.baseUrl` | 空 | OpenAI 兼容接口地址 |
| `harness.model` | 空 | 默认模型名 |
| `harness.startupTimeout` | `60` | 等待就绪超时秒数 |

## 🏗️ 架构

```
┌─────────────────────────────────────────────┐
│        VSCode 插件（Harness 客户端）          │
│  进程管理 · 工作区绑定 · 环境检测 · WebView    │
├─────────────────────────────────────────────┤
│        DeepSeek-Harness（Agent 运行时）       │
│  思考循环 · 工具调度 · 子Agent编排 · 插件系统   │
│  代码Agent │ 运维Agent │ 数据分析Agent         │
└─────────────────────────────────────────────┘
         BYOK：你的 Key，直接连 DeepSeek / Claude / 任意兼容接口
```

## 🗺️ Roadmap

- **V1.0（当前）**：稳定 IFrame 版 · 多 Agent 原型 · BYOK 个人模式
- **V1.5**：预研 ACP 原生协议 · 体验优化
- **V2.0**：原生 Chat-Participant · 深度 IDE 融合
- **V3.0 企业版**：密钥池管控 · 全量会话审计 · 高危操作审批 · SSO · 私有化部署

企业版能力（统一密钥管理、操作审计、权限审批、私有化内网部署）正在路上——**数据不出内网**的硬需求，Harness 为你兜底。

## ❓ FAQ

**Q：和 Cline / Roo 有什么区别？**
A：它们是一个代码 Agent；Harness 是运行平台——代码、运维、数据分析多 Agent 一套内核，且全链路可审计、可私有化。

**Q：我的 API Key 会传到服务器吗？**
A：不会。本地个人模式下，Key 只注入你自己机器上的 Harness 进程，服务也是 localhost 本地运行。

**Q：为什么要求 Node.js 22+？**
A：Harness 运行时需要现代 Node 特性，22+ 保证稳定。

**Q：能商用吗？**
A：能。MIT 协议，可自由二次开发、私有化部署、商业分发。

## 🔨 开发

```bash
npm install       # 安装依赖
npm run compile   # 类型检查（tsc）
npm run build     # esbuild 打包 → dist/extension.js
npm run watch     # 修改自动重新打包
npm run package   # 生成 .vsix
```

在 VSCode 中按 **F5** 启动扩展开发宿主调试。

## 📄 License

[MIT](./LICENSE)

---

<p align="center">
  <b>用 Harness，一个 IDE，驾驭你的所有智能体。</b>
</p>
