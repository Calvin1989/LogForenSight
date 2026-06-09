# LogForenSight

Local-first security log triage, IOC extraction, detection explainability, and analyst evidence pack export.

**本地优先、零信任、高可解释性的 Web 日志安全分析与处置工具。**

[![CI Status](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/release_target-v2.9.1--local-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 项目定位

LogForenSight 面向安全分析师、DFIR 实践者、蓝队工程师和开发者，聚焦 `security log analysis`、`incident response`、`threat hunting`、`ioc extraction` 等真实分析场景。它不是一个“把日志丢进去看 AI 怎么说”的演示页面，而是一条可复核、可导出、可本地保存的确定性分析链路。

当前版本覆盖的真实工作流包括：

- 单文件与多文件日志分析，适合从单次访问排查扩展到案件级分析。
- Nginx / Apache access log parsing，并提供 parse quality、skipped samples 和 source files 归因。
- deterministic rule detection，将原始请求转成结构化 findings。
- incident aggregation，把相关 findings 聚合为更适合处置的 incidents。
- Executive Summary，提供面向管理层或展示场景的确定性风险摘要。
- Saved Case Workspace，用于本地保存、搜索、过滤、导入导出案例。
- Analyst Triage Workflow，支持状态、优先级、备注与处置跟踪。
- IOC / Investigation Entities extraction，提取 IP、账号、URL、路径、HTTP 方法、状态码和 source files。
- Detection Explainability drilldown，帮助分析师查看规则依据、命中指标和证据片段。
- Analyst Evidence Pack export，输出适合交接、复盘和工单流转的 Markdown 证据包。
- Evidence Pack metadata / privacy note / validation summary，强化导出结果的说明性与可审计性。
- v2.9 triage status summary 与 `Needs review` / `待复核` 提示，帮助分析师快速识别未处置或仍需关注的对象。

## 为什么不使用大模型 / LLM

这个项目刻意不把核心检测建立在 LLM 之上，原因不是“反对 AI”，而是安全日志分析在很多场景下更需要可复现、可审计、可本地落地的能力。

- **可复现性**: 相同输入日志经过相同规则，得到相同 findings、incidents 和摘要结果，便于回归测试、交叉复核和面试演示。
- **本地隐私**: 安全日志通常包含 IP、路径、账号、请求参数和业务痕迹，不适合默认上传给第三方模型服务。
- **零外部 API**: 默认不依赖外部 API、云端推理或第三方智能服务，离线环境和受限环境也能运行。
- **可审计性**: deterministic rules 比黑盒生成式输出更容易解释“为什么命中”“为什么聚合”“为什么给出这个风险等级”。
- **工程稳定性**: 对日志安全分析来说，规则驱动更适合作为稳定基线，避免提示词漂移、模型版本变化和不可控输出。

## 核心功能

- **日志解析**: 支持 single-file / multi-file log analysis，覆盖 Nginx / Apache access log parsing，并展示解析质量反馈。
- **检测与聚合**: 使用 deterministic rule detection 生成 findings，并进行 incident aggregation。
- **摘要输出**: 自动生成 Executive Summary，提供确定性的风险分数、风险等级和关键指标。
- **案件工作区**: 提供 Saved Case Workspace，本地保存案例，支持搜索、过滤、JSON 导入导出与历史管理。
- **分析师处置**: 提供完整的 Analyst Triage Workflow，支持 `Open / Investigating / Mitigated / False Positive` 状态、优先级和备注。
- **待复核提示**: 在 Findings 和 Incidents 中提供 `Needs review` / `待复核` 提示，并显示 v2.9 triage status summary。
- **调查实体抽取**: 执行 IOC / Investigation Entities extraction，统一展示去重计数、时间范围和关联 source files。
- **检测解释**: 提供 Detection Explainability drilldown，展示规则上下文、严重程度依据、命中指标、证据片段和建议动作。
- **证据导出**: 支持 Analyst Evidence Pack export，包含 Evidence Pack metadata、privacy note、validation summary 以及 triage 内容。
- **双语界面**: 前端保留 bilingual UI，适合中文主导使用，也方便英文关键词检索与展示。

## 技术栈

- **前端**: Vue 3、Vite、组合式逻辑、轻量双语 UI。
- **后端**: Python 3.11、FastAPI、Pydantic。
- **验证**: Pytest、Vitest、Docker Compose。
- **运行方式**: local-first、无数据库、零外部 API、无 LLM 依赖。

## 核心架构

项目的主链路可以概括为：

1. 上传单个或多个 Web access logs。
2. 解析为结构化记录，并返回 parse quality 与 skipped samples。
3. 执行 deterministic detection rules，生成 findings。
4. 执行 incident aggregation，将相关 findings 组织为 incidents。
5. 生成 Executive Summary、Investigation Entities、Detection Explainability 等分析视图。
6. 在 Analyst Triage Workflow 中补充状态、优先级与分析师备注。
7. 通过 Saved Case Workspace 将结果持久化到本地案例空间。
8. 导出 Markdown 报告或 Analyst Evidence Pack，形成交接与复盘材料。

## 本地优先设计

- 日志解析、检测、处置、案例保存和导出都以本地使用为默认前提。
- 不要求外部数据库，不依赖外部 API，也不把日志默认发送给第三方服务。
- Saved Case Workspace 在保留分析结果的同时避免直接把原始日志文本作为默认存档内容。
- Analyst Evidence Pack export 强调 privacy note 和 validation summary，帮助说明哪些信息来自本地规则、哪些内容经过脱敏或摘要。
- 这种 local-first 设计更适合隐私敏感环境、实验室环境、内网演示和面试讲解。

## 适合面试讲解的技术点

- 日志解析与解析质量反馈：如何从原始 access logs 得到结构化记录，并对 skipped lines 给出可见反馈。
- Finding -> Incident 聚合：如何把离散命中整理为更贴近真实事件的 incident 视图。
- Deterministic Executive Summary：如何生成稳定、可复核、可展示的高层摘要。
- Local-first Case Workspace：如何在不引入数据库的情况下完成案例保存、搜索与迁移。
- Triage Workflow：如何把“检测结果”进一步推进到“可处置状态管理”。
- IOC extraction：如何从 findings / incidents / report context 中抽取 Investigation Entities。
- Detection explainability：如何让每条 finding 都能回溯到规则依据、命中指标和证据。
- Evidence Pack export：如何产出适合 handoff、ticket、复盘的 Markdown 证据包。
- Bilingual UI：如何用轻量方案同时支持中文和英文界面。
- Privacy by design：如何在本地优先前提下处理日志、导出、脱敏和元数据边界。

## 快速开始

### Docker

```bash
docker compose up --build
```

前端默认访问地址为 [http://localhost:5173](http://localhost:5173)。

### 本地开发

后端：

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

前端：

```bash
cd frontend
npm install
npm run dev
```

如需排查 Windows 端口占用，请参考 `docs/release_notes.md` 中已有说明；本次文档修订不修改默认端口，也不改变 `npm run dev` 行为。

## Demo 路径

建议按下面的顺序演示项目：

1. 上传单个 Nginx 或 Apache 日志，展示 parse quality 和 findings。
2. 上传多个日志文件，展示 multi-file analysis 与 source file 归因。
3. 查看 findings 到 incidents 的聚合结果，以及 Executive Summary。
4. 展示 Investigation Entities 和 IOC extraction 的去重结果。
5. 展开 Detection Explainability drilldown，说明规则依据和证据片段。
6. 演示 Analyst Triage Workflow，补充状态、优先级、备注与 `Needs review` 提示。
7. 保存到 Saved Case Workspace，展示本地案例管理。
8. 导出 Analyst Evidence Pack，说明 metadata、privacy note 和 validation summary。

## 文档导航

- [Demo Guide](docs/demo.md)
- [Portfolio Showcase](docs/portfolio.md)
- [Release Notes](docs/release_notes.md)
- [API Contract](docs/api_contract.md)
- [Architecture](docs/architecture.md)
- [GitHub Listing Guidance](docs/github_listing.md)
- [Screenshots Plan](docs/screenshots/README.md)

## GitHub Topics 建议

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

## 项目边界与后续方向

- 当前聚焦 Web access log analysis，不扩展为通用 SIEM 或云原生日志平台。
- 当前核心价值是 deterministic、local-first、可解释、可导出，而不是追求大模型生成式能力。
- 当前保留轻量部署和零外部依赖边界，不引入数据库、队列、云服务或额外基础设施。
- 后续如果继续演进，更适合在规则能力、导出质量、案例管理和调查视图上深化，而不是牺牲可复现性去换取不可控的智能化包装。

## License

MIT
