# LogForenSight

Local-first security log triage, IOC extraction, detection explainability, and analyst evidence pack export.

[![CI Status](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/release_target-v2.7--local-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

LogForenSight 是一个面向安全分析师、DFIR 实践者、蓝队工程师和开发者的本地优先 Web 日志分析工作台。它聚焦 `security log analysis`、`incident response`、`threat hunting` 和 `IOC extraction`，用确定性规则把原始访问日志转换成可复核、可导出的调查结果。

## 一眼看懂

- **这是什么**: 一个基于 `FastAPI` + `Vue` 的 local-first 安全日志分析工具，支持 Nginx / Apache 访问日志解析、批量案件分析和结构化导出。
- **解决什么问题**: 帮助分析师把零散日志快速整理为 findings、incidents、Investigation Entities、Detection Explainability 和 analyst evidence pack，减少手工筛查成本。
- **适合谁**: 适合做 incident response、DFIR、threat hunting、SOC 值守、内网安全排查，以及需要可演示安全作品集的开发者。
- **核心功能**: log parsing、deterministic detection、incident aggregation、case workspace、triage workflow、IOC extraction、detection explainability、evidence pack export。
- **为什么 local-first**: 日志和分析结果默认留在本地，不依赖外部 API、数据库或 LLM，更适合隐私敏感和离线审计场景。

## Why LogForenSight?

- **Local-first, no external API**: 关键分析流程在本地浏览器和本地后端完成，默认不把日志发送到第三方服务。
- **Deterministic rules, no LLM dependency**: 所有检测结果由透明规则生成，相同输入得到相同输出，便于复核、回归和演示。
- **Triage workflow**: 不只停留在“发现风险”，还支持分析师做状态跟踪、优先级标记和处置备注。
- **IOC / Investigation Entities**: 自动抽取 IP、账号、URL、路径、HTTP 方法、HTTP 状态码和 source files，方便追踪调查对象。
- **Detection explainability drilldown**: 每条 finding 都可以展开查看规则上下文、严重程度依据、命中指标和证据片段。
- **Analyst evidence pack export**: 一键导出适合工单、复盘和交接的 Markdown 证据包，形成完整调查留痕。

## Core Workflow

1. Upload one or more web access logs.
2. Parse logs into structured records with parse quality stats.
3. Run deterministic detection rules and generate findings.
4. Aggregate related findings into incidents.
5. Review Investigation Entities and detection explainability.
6. Add analyst triage status, priority, and notes.
7. Save the result into the local case workspace.
8. Export an analyst evidence pack for handoff or reporting.

## Quick Start

### Docker

```bash
docker compose up --build
```

Frontend 默认访问地址为 [http://localhost:5173](http://localhost:5173)。

### Local Development

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

如需排查 Windows 端口问题，请参考 `docs/release_notes.md` 中的说明；README 不修改默认端口，也不改变 `npm run dev` 行为。

## Feature Snapshot

- **Security log analysis**: 解析 Nginx / Apache 访问日志，并展示 parse quality、skipped samples 和 source file 归因。
- **Incident response / DFIR workflow**: 从 findings 到 incidents，再到 triage notes 和 evidence pack，形成完整调查链路。
- **IOC extraction**: 本地提取 Investigation Entities，统一展示去重计数、时间范围和 related source files。
- **Detection explainability**: 提供每条 finding 的规则上下文、严重程度 rationale、命中指标、证据片段和建议动作。
- **Case workspace**: 支持保存案例、搜索过滤、导入导出和本地历史管理。
- **Portfolio-ready output**: 支持 Markdown 报告、sanitized report、comparison view 和 analyst evidence pack export。

## Tech Stack

- **Frontend**: Vue 3, Vite, composables, lightweight bilingual UI
- **Backend**: Python 3.11, FastAPI, Pydantic
- **Validation**: Pytest, Vitest, Docker Compose
- **Operating model**: local-first, no database, no external API, no LLM dependency

## Project Status

| Item | Status |
| :--- | :--- |
| Stable baseline | `v2.6.1-local` |
| Current release target | `v2.7-local` |
| Focus | GitHub discoverability and release polish |
| Deployment style | Local-first / No database / No external API / No LLM |

## Docs

- [Portfolio Showcase](docs/portfolio.md)
- [Demo Guide](docs/demo.md)
- [Release Notes](docs/release_notes.md)
- [GitHub Listing Guidance](docs/github_listing.md)
- [Screenshots Plan](docs/screenshots/README.md)
- [API Contract](docs/api_contract.md)

## GitHub Topics

建议在 GitHub 仓库 Topics 中使用以下标签：

```text
security-tools
log-analysis
incident-response
dfir
threat-hunting
ioc-extraction
detection-engineering
fastapi
vue
local-first
```

## License

MIT

**LogForenSight** brings local-first security log triage and explainable evidence generation into a compact analyst workflow.
