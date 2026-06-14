# LogForenSight

> Local-first security log triage for explainable, exportable, privacy-aware evidence handoff.

**LogForenSight** 是一个本地优先的 Web 访问日志安全分析与处置工作台。它将 Nginx / Apache access log 解析、确定性检测、incident 聚合、IOC / investigation entities 抽取、triage、case notes、review readiness、Evidence Pack 导出和 UX 级错误/加载反馈整合在一个可复核的本地工作流中。

[![CI Status](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/LogForenSight/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v2.42--local-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
![Local-first](https://img.shields.io/badge/local--first-yes-brightgreen)
![No LLM Required](https://img.shields.io/badge/LLM-not_required-blue)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)
![Vue](https://img.shields.io/badge/frontend-Vue_3-42b883)
![shadcn-vue](https://img.shields.io/badge/UI-shadcn--vue-black)
![Evidence Pack](https://img.shields.io/badge/evidence_pack-Markdown-purple)

---

## 30 秒看懂

LogForenSight 不是 SIEM，也不是把敏感日志交给外部模型的聊天式分析工具。它面向本地排查、演示和 portfolio 场景，强调：

- **确定性检测**：同一日志和规则得到稳定结果，便于测试、复核和演示。
- **可解释 findings**：每条 detection 展示规则依据、命中字段、证据片段和建议动作。
- **Incident 聚合**：将分散 findings 聚合成更适合分析师处理的安全事件。
- **Investigation Entities**：抽取 IP、路径、URL、账号、HTTP 方法、状态码和 source file。
- **Triage / Review Cockpit**：维护 findings / incidents 的状态、优先级、备注和复核就绪度。
- **Evidence Pack 导出**：生成可交接的 Markdown 证据包，包含 review readiness、quality score、guardrails 和 share-safety 提示。
- **本地优先**：无数据库、无外部 API、无 LLM 依赖，默认不让日志离开本机。
- **产品化前端**：基于 Vue 3、Vite 和 shadcn-vue primitives，提供紧凑 dashboard、响应式布局、空状态、加载状态和错误反馈。

---

## v2.42-local 最新状态

当前稳定版本：`v2.42-local`

| 项目 | 状态 |
|---|---|
| Backend validation | `python -m pytest` → 65 passed |
| Frontend validation | `npm run test` → 51 files / 368 tests passed |
| Frontend build | `npm run build` → passed |
| Docker validation | `docker compose config` → valid |
| Latest release focus | analysis loading/error states + smoke guards |

v2.39-v2.42 主要完成了前端产品化收尾：shadcn-vue dashboard layout、视觉系统 polish、UX 状态反馈、可访问性、响应式、错误/加载状态和 smoke regression tests。

---

## 功能亮点

| 能力 | 说明 |
|---|---|
| Log parsing | 解析 Nginx / Apache access logs，并展示 parse quality。 |
| Deterministic detection | 基于本地 YAML 规则检测敏感路径、404 burst、可疑 UA 等行为。 |
| Incident aggregation | 将 findings 聚合成可处置 incidents。 |
| Investigation entities | 自动抽取 IP、URL、path、HTTP method/status、source file 等调查对象。 |
| Detection explainability | 解释每条 finding 的规则、严重程度、证据和建议动作。 |
| Analyst triage | 支持 Open / Investigating / Mitigated / False Positive、优先级和备注。 |
| Case workspace | 本地保存、搜索、导入/导出分析案例。 |
| Case notes | 记录 Observation、Hypothesis、Action、Decision。 |
| Review readiness | 导出前检查 high/critical findings、incidents、case notes 和 handoff readiness。 |
| Evidence Pack | 生成 Markdown 交接材料，包含质量评分、导出提示、分享安全检查。 |
| UX states | 分析中、后端不可达、空文件、不支持格式、数据不足、copy/save/export disabled 都有明确反馈。 |
| Layout regression | 覆盖 dashboard 结构、bounded scroll、sibling sections、UX 状态和 i18n keys。 |

---

## 快速开始

### 一体启动

```powershell
docker compose up --build
```

访问：

```text
http://localhost:5173
```

### 分别启动

后端：

```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

前端：

```powershell
cd frontend
npm install
npm run dev
```

推荐先上传 `samples/demo_access.log` 完成单文件演示，再上传 `samples/demo_batch_part1.log` 与 `samples/demo_batch_part2.log` 演示多文件 batch 分析。

---

## 推荐演示路径

1. 上传 demo access log。
2. 查看 parse stats / source files / analysis context。
3. 查看 executive summary、severity distribution、summary cards。
4. 查看 findings、incidents、timeline。
5. 检查 investigation entities 与 detection explainability。
6. 在 triage/review 中设置状态、优先级和备注。
7. 添加 case notes / decision log。
8. 检查 review readiness、case closure checklist、evidence gaps、next actions。
9. 打开 Evidence Pack，检查 quality score、export guardrails、share safety 和 preview。
10. 复制或下载 Markdown 报告 / Evidence Pack。
11. 切换中英文，确认 UX feedback 和 error/loading 文案一致。

---

## 技术栈

| 层级 | 技术 |
|---|---|
| Frontend | Vue 3, Vite, shadcn-vue primitives, bilingual UI |
| Backend | Python, FastAPI, Pydantic |
| Detection | Local deterministic rules in YAML |
| Storage | Browser local storage for case workspace / triage / notes |
| Export | CSV / JSON / Markdown download from frontend utilities |
| Validation | Pytest, Vitest, Vite build, Docker Compose config |
| Runtime | Local-first, no database, no external API, no LLM dependency |

---

## 验证命令

```powershell
cd backend
python -m pytest
```

```powershell
cd frontend
npm run test
npm run build
```

```powershell
cd ..
docker compose config
git diff --check
```

v2.42-local release gate：Backend 65 passed，Frontend 51 files / 368 tests passed，build passed，Docker config valid，working tree clean。

---

## 文档导航

| 文档 | 内容 |
|---|---|
| `docs/demo.md` | 本地演示脚本和讲解顺序 |
| `docs/architecture.md` | 后端、前端、数据流和本地优先架构 |
| `docs/api_contract.md` | FastAPI 请求 / 响应契约 |
| `docs/portfolio.md` | Portfolio / 面试展示说明 |
| `docs/release_notes.md` | 版本演进摘要 |
| `docs/release_checklist.md` | 发布流程和质量门禁 |
| `docs/github_listing.md` | GitHub description、topics、release snapshot 文案 |
| `docs/screenshots/README.md` | 截图规划 |
| `samples/README.md` | Demo sample 日志说明 |

---

## GitHub Topics 建议

`security-tools` · `log-analysis` · `incident-response` · `dfir` · `threat-hunting` · `ioc-extraction` · `detection-engineering` · `fastapi` · `vue` · `shadcn-vue` · `local-first`

---

## 项目边界

LogForenSight 当前聚焦 **Web access log analysis** 和本地可复核分析师工作流。它不是通用 SIEM、云原生日志平台、实时告警系统或 LLM SOC copilot。

当前核心价值：

- deterministic
- local-first
- explainable
- exportable
- analyst-friendly
- portfolio-ready

---

## License

MIT
