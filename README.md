# LogForenSight

**本地优先、零信任、高可解释性的 Web 日志安全分析工具。**

[![CI Status](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v2.5--local-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

LogForenSight 是一款专为安全分析师和开发者设计的 Web 日志分析引擎。它能够快速解析 Nginx 与 Apache 访问日志，通过确定性的规则引擎识别安全风险，并将其聚合成高层级的安全事件。

---

## 🌟 核心亮点

- **🔒 本地优先 (Local-first)**: 核心逻辑完全在浏览器或本地后端运行，日志绝不出本地，无需担心隐私泄露。
- **🧠 确定性与可解释性 (Explainable)**: 拒绝“黑盒”分析。每一个发现都由透明规则驱动，并附带完整的命中详情与原始日志证据。
- **🚫 零基础设施 (Zero-Infra)**: 无需数据库，无需外部 API，无需连接大模型 (LLM)，启动即用。
- **🗂️ 多文件案件分析 (v2.0)**: 支持将多个日志文件作为一个 case 联合分析，保留每个 source file 的解析质量统计，适合按站点、时间段或事件窗口进行调查。
- **📁 本地案例工作区 (v2.1)**: 用户可将分析结果主动保存为案例 (Saved Cases)，支持按标题/标签搜索、按风险等级过滤，并提供 JSON 导入导出功能。
- **🩺 分析师处置工作流 (v2.2)**: 支持对每个风险点 (Finding) 和安全事件 (Incident) 进行本地处置标记（状态、优先级、备注），并支持导出 Markdown 处置摘要。
- **📦 分析师证据包导出 (v2.4)**: 支持将当前分析结果导出为结构化 Markdown 证据包，整合严重程度摘要、时间轴、规则覆盖、处置信息与案例元数据，便于粘贴到工单或安全报告。
- **🧭 IOC / 调查实体提取 (v2.5)**: 本地提取 IP、账号、URL、路径、HTTP 方法、HTTP 状态码和 batch source files，并在 UI 与 Evidence Pack 中统一展示，便于快速调查与归因。
- **🧠 Detection Explainability Drilldown (v2.6)**: 为每条风险点提供本地静态的可解释性 drilldown：规则信息、严重程度判定依据、命中上下文、命中指标 / 关键字 / 正则提示、证据片段、推荐分析师操作以及相关调查实体，并在 Evidence Pack 中以独立章节导出。
- **📊 深度聚合与演进**: 从原子级的风险点 (Findings) 到逻辑聚合的安全事件 (Incidents)，再到自动化生成的管理层摘要 (Executive Summary)。
- **🔄 闭环工作流**: 支持报告对比 (Report Comparison)、脱敏分享 (Sanitized Report) 以及多格式导出。

---

## 🚀 快速开始

### 方式 A: Docker 一键启动 (推荐)

```bash
docker compose up --build
```
访问 [http://localhost:5173](http://localhost:5173) 即可开始分析。

### 方式 B: 本地开发启动

**1. 后端 (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. 前端 (Vue 3)**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ 功能概览

### 1. 智能检测与解释
- **Rule-driven Detection**: 涵盖高频扫描、敏感路径探测、异常客户端检测。
- **Rule Tuning UI (v1.9)**: 支持在 UI 界面临时调整规则阈值、黑名单列表和启用状态，实时观察分析结果变化；在 batch 模式下会明确提示调优将应用于整个批量集合。
- **Rule Coverage (v1.8)**: 实时展示系统规则覆盖情况，清晰告知哪些规则被触发，哪些未触发。
- **Rule Match Details**: 展示命中字段、命中值列表及命中频次。

### 2. 分析师视图
- **Saved Case Workspace (v2.1)**: 提供独立的本地工作区，支持保存分析快照、管理案例列表、添加标签以及批量导出/导入案例元数据。
- **Multi-file Batch Analysis (v2.0)**: 前端支持多文件上传，后端通过 `POST /api/analyze/batch` 将多个日志文件作为同一个分析案例处理。
- **Per-source Parse Quality**: 在总体解析质量之外，保留每个 source file 的 `total_lines`、`parsed_lines`、`skipped_lines`、`parse_rate` 与 `detected_format` 统计。
- **Attack Timeline**: 还原攻击者的行为轨迹，支持按严重程度和 IP 过滤。
- **Incident Aggregation**: 自动识别行为模式，将零散请求聚合成具备业务意义的安全事件。
- **Investigation Entities (v2.5)**: 从 findings、incidents、timeline、report context 与 batch source file metadata 中本地提取 IOC / investigation entities，并提供稳定排序、去重计数、首次/最后出现时间及相关来源文件信息。
- **Detection Explainability Drilldown (v2.6)**: 每条风险点支持本地可展开的 `Detection Explainability` / `检测可解释性` 面板，展示规则 ID/名称/说明、严重程度判定依据、命中字段/消息上下文、命中指标（IP / 路径 / HTTP 方法 / 状态 / User-Agent / 关键字 / 次数）、证据片段（带截断提示）、推荐分析师操作（按严重程度分级）以及与该 finding 关联的调查实体；缺数据时显示 `Not available` / `暂无数据`，不会报错。
- **Recent Analyses Labels**: Recent Analyses 会对批量案例显示 `Batch` 标签，帮助分析师快速区分单文件和案件级分析记录。
- **Report Comparison**: 追踪风险趋势，直观对比不同时间段或不同站点的风险变化。

### 3. 报告与分享
- **Executive Summary**: 为管理层提供直观的风险评分 (0-100) 和核心指标摘要。
- **Analyst Evidence Pack Export (v2.4)**: 在报告区域提供 `Download Evidence Pack` / `下载证据包` 入口，导出包含 Findings、Incidents、Timeline、Rule Coverage、Parse Stats、batch source files、Triage 与 Case metadata 的 Markdown 证据包。
- **Evidence Enrichment (v2.5)**: Evidence Pack 新增 `Investigation Entities` / `调查实体` 章节，导出去重后的 IP、账号、URL、路径、HTTP 方法、HTTP 状态码、source files，以及计数、时间范围和来源文件关联。
- **Detection Explainability in Evidence Pack (v2.6)**: Evidence Pack 新增 `Detection Explainability` / `检测可解释性` 章节，为每条 finding 输出本地静态的规则信息、严重程度判定依据、命中上下文、命中指标表格、截断后的证据片段、按严重程度分级的推荐分析师操作以及相关调查实体列表。
- **Sanitized Sharing**: 内置脱敏引擎，一键生成隐藏敏感 IP 和 Token 的合规报告。
- **Multi-format Export**: 支持导出 Markdown 报告、CSV 明细及 JSON 统计摘要。

---

## 🏗️ 技术架构

项目采用前后端分离架构，强调轻量化与可测试性：

- **Frontend**: Vue 3 + Vite + Composables。采用零依赖 i18n 实现中英文实时切换，并支持多文件上传与本地历史记录。
- **Backend**: Python 3.11 + FastAPI + Pydantic。逻辑层划分为 Parser, Detector, IncidentBuilder 等模块，并通过批量分析接口聚合多文件案例。
- **Quality**: 全面的自动化测试覆盖 (Pytest & Vitest)，确保检测逻辑与 UI 渲染的鲁棒性。

详情请参考 [架构文档](docs/architecture.md)。

---

## 项目状态

| 项目 | 状态说明 |
| :--- | :--- |
| **当前版本** | `v2.6-local` |
| **后端测试** | ![Pytest](https://img.shields.io/badge/Pytest-65%20passed-green.svg) |
| **前端测试** | ![Vitest](https://img.shields.io/badge/Vitest-154%20passed-green.svg) |
| **Docker** | ![Docker](https://img.shields.io/badge/Docker--Compose-passed-blue.svg) |
| **多语言** | 支持 中文 / English 实时切换 |
| **部署方式** | Local-first / No database / No external API / No LLM |

---

## 📦 Evidence Pack Export

- 入口位置：分析结果页底部的 Markdown 报告区域，与现有报告下载按钮并列。
- 按钮文案：英文 `Download Evidence Pack`，中文 `下载证据包`。
- 导出格式：当前版本提供本地 Markdown 导出，不上传数据、不调用外部 API、不新增数据库。
- 导出内容：Generated timestamp、Severity summary、Executive summary、Findings、Incidents、Investigation Entities、Timeline highlights、Rule coverage、Parse stats、batch source files、Triage 状态/优先级/备注，以及已保存案例的 metadata。
- 缺失数据处理：若当前分析缺少某些可选字段，导出内容会显示 `Not available` / `暂无数据`，不会中断导出。

---

## 🧠 Detection Explainability Drilldown

- 入口位置：分析结果区中 `Security Findings` / `安全风险点` 卡片下，每条 finding 都附带 `Show explanation` / `展开解释` 按钮，展开后展示本地静态的 `Detection Explainability` / `检测可解释性` 面板。
- 展示内容：
  - **Rule Context**: Rule ID、Rule Name、Rule Description（优先复用后端 `rule_coverage` 中的 `explanation` / `description`，缺失时使用 finding 自身 `description`）。
  - **Severity Rationale**: 根据严重程度 (critical / high / medium / low / info) 输出本地静态的判定依据。
  - **Matched Field / Message Context**: 命中字段、命中值、Source IP、Path、Method、Status 等上下文。
  - **Matched Indicator / Keyword / Regex Hints**: 命中指标分类（IP / Path / Method / Status / User-Agent / Keyword / Count），稳定排序。
  - **Evidence Snippet**: 第一条 evidence 自动截断（80-600 字符，默认 280），超过限制会显示 `truncated for display` 提示。
  - **Recommended Analyst Action**: 按严重程度分级的本地静态建议（critical/high 优先复核与隔离、medium 关联分析、low 记录监控、info 仅登记）。
  - **Related IOCs / Investigation Entities**: 优先关联 v2.5 提取结果中的 IP / 路径 / User-Agent 等实体；缺数据时显示 `Not available` / `暂无数据`。
- Evidence Pack 集成：`Download Evidence Pack` / `下载证据包` 现在会额外输出 `Detection Explainability` 章节，结构与 UI 面板保持一致，便于贴入工单或安全报告。
- 隐私：所有可解释性内容均由前端纯函数在本地生成，不上传数据、不调用外部 API、不引入 LLM 或威胁情报源。

---

## 🧭 IOC / Investigation Entities

- 入口位置：分析结果区中的 `Investigation Entities` / `调查实体` 卡片，位于 `Parse Stats` 之后、`Incidents` 之前。
- 提取范围：优先复用已有 `findings`、`incidents`、`timeline_events`、`report_markdown` 与 `source_files` 上下文，不调用外部 API、不上传数据。
- 提取类型：IPv4、用户名/账号、`http://` / `https://` URL、Linux/Windows/HTTP 请求路径、HTTP 方法、HTTP 状态码、batch source files。
- 输出内容：稳定排序后的 `type`、`value`、`count`、`first seen`、`last seen`、`related source files`，便于测试、调查与报告阅读。
- 缺失数据处理：没有可提取实体时显示 `Not available` / `暂无数据`，不会报错。

---

## ❓ Troubleshooting (常见问题)

### Windows 端口占用 (WinError 10013)
在 Windows 环境下启动后端时，可能会遇到 `[Errno 10013] An attempt was made to access a socket in a way forbidden by its access permissions` 错误。

这通常是因为默认端口 `8000` 被 Windows 服务、Hyper-V、WSL、Docker 或某些 VPN 客户端保留。

**1. 检查保留端口范围**
运行以下命令查看当前系统保留的端口范围：
```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

**2. 使用备用端口启动**
如果 `8000` 端口被占用，请指定一个未被保留的端口（如 `18080`）：
- **后端**: `uvicorn app.main:app --reload --host 127.0.0.1 --port 18080`
- **前端**: 如果后端使用了备用端口，需要临时调整 `frontend/src/api.js` 或 `vite.config.js` 中的代理配置。当前默认代理配置指向 `http://localhost:8000`。

---

## 🛡️ 安全与隐私

- **Data Privacy**: 本工具仅作为处理引擎，不存储您的任何日志数据。
- **Best-effort Sanitization**: 脱敏引擎基于启发式正则，分享报告前请务必复核关键敏感信息。

---

## 🔗 更多资源

- [Portfolio Showcase](docs/portfolio.md) - 技术深度与面试亮点
- [演示指南](docs/demo.md) - 5 分钟完整功能演示脚本
- [版本演进](docs/release_notes.md) - 从 MVP 到 v2.0 的路线图
- [API 契约](docs/api_contract.md) - 后端接口详细定义

---

**LogForenSight** - 让日志分析回归本地，让安全发现真实可见。
