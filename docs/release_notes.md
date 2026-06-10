# 版本演进 (Release Notes)

本文档记录了 **LogForenSight** 从原型到成熟工具的演进过程。

---

## [v2.12.2-local] - Case Notes Timestamp Monotonicity Fix

- **CI / Test Stability**: 修复 `Case Notes` 在 GitHub Actions 等高速环境下的时间戳竞争问题，避免创建后立即更新时 `updatedAt === createdAt` 导致测试偶发失败。
- **Timestamp Monotonicity**: 在 `frontend/src/utils/caseNotesStorage.js` 中新增安全 helper，确保 `updateCaseNote` 生成的 `updatedAt` 严格晚于既有 `updatedAt` 与 `createdAt`。
- **Focused Scope**: 本次仅修复前端本地存储里的 Case Notes 时间戳单调递增逻辑，并补强对应测试；不修改 UI、不修改后端、不改变 parser / detector / incident aggregation 行为，也不引入新依赖。

---

## v2.12.1-local - Case Notes Documentation Polish

Documentation-only follow-up for v2.12-local.

- Makes Analyst Case Notes / Decision Log more visible in README and demo flow.
- Clarifies that notes can be exported in Analyst Evidence Pack.
- No frontend, backend, parser, detector, storage, dependency, or port changes.

---

## [v2.12-local] - Analyst Case Notes / Decision Log
- **Analyst Case Notes / Decision Log**: 新增独立的本地优先案件备注面板，支持记录 Observation、Hypothesis、Action、Decision 四类分析师笔记。
- **Local-first Storage**: 备注按 caseId 或当前 analysis context 写入浏览器本地存储，不复用 triage key，不引入后端、数据库或新依赖。
- **Evidence Pack Integration**: 导出的 Analyst Evidence Pack 新增 `Analyst Case Notes / Decision Log` / `分析师案件备注 / 决策日志` 章节，便于交接和复盘。
- **No Parser / Detector Behavior Change**: 不修改 parser、detector、incident aggregation 核心逻辑，不改变默认端口，不引入后端 API 变更。

---

## [v2.11-local] - CI / Release Hygiene
- **CI / Release Hygiene**: 对当前本地优先工作流做小步卫生增强，保持 GitHub 仓库、PR 流程和发布文档更加稳定、清晰、可复核。
- **Release Checklist Polish**: 更新 `docs/release_checklist.md`，补齐从干净 `main` 起步、禁止 `git add .`、旧名 grep、backend/frontend 验证、`docker compose config`、git whitespace 检查、tag 推送、归档校验、SHA256 与 GitHub Release 创建等步骤。
- **Workflow Alignment**: 让 CI 中的步骤命名与发布清单术语保持一致，减少本地验证和 GitHub Actions 之间的理解偏差。
- **No Runtime Behavior Change**: 不修改 backend app code、frontend 主要 UI、parser / detector / incident aggregation 核心逻辑，也不调整依赖版本和默认端口。

---

## [v2.10-local] - Demo Sample Polish
- **Demo Sample Polish**: 新增 `samples/demo_access.log`、`samples/demo_batch_part1.log` 与 `samples/demo_batch_part2.log`，用于稳定展示从上传日志到导出 Evidence Pack 的完整本地分析链路。
- **Recommended Demo Path**: 更新 `docs/demo.md`，明确推荐样例、单文件与批量演示方式，以及 `parse quality -> findings / incidents -> Investigation Entities -> Detection Explainability -> triage -> Evidence Pack` 的演示顺序。
- **Samples README**: 新增 `samples/README.md`，说明推荐演示顺序、样例用途与保留地址 / 非真实数据约束。
- **Documentation-only / Sample-only Release**: 本版本不修改 parser / detector / incident aggregation 行为，不引入新依赖，不调整默认端口，不改变运行时逻辑。

---

## [v2.9.2-local] - README Visual Polish
- **README Visual Polish**: 优化 `README.md` 第一屏展示，加入更清晰的 Hero 短句、badge 组合、`30 秒看懂` 摘要和更靠前的快速开始入口。
- **Chinese-first Style Retained**: 继续保持中文主导说明，同时保留少量英文定位与 GitHub SEO keywords，不改成英文 README。
- **Structure and Rhythm Upgrade**: 新增 emoji 节奏、小节亮点表格、Mermaid workflow、表格化文档导航，并将长说明下移到后半部分。
- **Documentation-only Patch**: 不新增截图，不修改前端/后端业务逻辑，不引入新依赖，不调整默认端口。

---

## [v2.9.1-local] - README Chinese Style Polish
- **README Chinese-first Polish**: 将 `README.md` 从偏 GitHub listing 的英文结构调整回中文主导的项目文档风格，保留顶部简短英文定位，但主体叙述以中文为主。
- **Keyword Preservation**: 在合适位置保留 `security log analysis`、`incident response`、`threat hunting`、`ioc extraction` 等 GitHub 可检索关键词，但不再让 README 首页变成英文营销页。
- **Documentation-only Patch**: 仅更新 `README.md`、`CHANGELOG.md` 与本文件，不修改前端/后端业务逻辑、不引入新依赖、不调整默认端口。
- **No Behavior Change**: 前端与后端运行行为保持不变，Docker 配置、测试代码和业务代码均不做变更。

---

## [v2.9-local] - Analyst Triage UX Polish
- **Status Summary**: 在 Analyst Triage 区域新增更明确的状态汇总，按 `Open / Investigating / Mitigated / False Positive` 展示当前 case 的 triage 分布，并在没有记录时显示 `No triage records yet` / `暂无处置记录`。
- **Needs Review Indicator**: 在 Findings 和 Incidents 列表中为尚未 triage 或仍为 `open` 的条目增加轻量 `Needs review` / `待复核` 提示，帮助分析师快速识别待处理对象。
- **Triage Metadata Hints**: 复用现有 triage state 中的 `updated_at` / `updatedAt` 与 `notes` 字段，在列表和 triage 面板中更清楚地展示 `Last updated` / `最近更新` 与 `Analyst note` / `分析师备注`。
- **Compatibility**: 不修改后端 API、不改变 parser / detector / incident aggregation 逻辑、不迁移 localStorage key，也不引入新依赖。

---

## [v2.8-local] - Analyst Evidence Pack Metadata Polish
- **Case Metadata Summary**: 在 Analyst Evidence Pack 顶部新增更正式的 `Case metadata` 区块，汇总 Product、Export type、Generated at、Case ID、Case title、Source files、Analysis scope 以及 findings / incidents / entities / triage counts。
- **Local-first Privacy Note**: 新增本地优先隐私说明，明确导出流程不依赖外部 API、云服务、数据库或 LLM。
- **Validation Summary**: 新增简洁的验证摘要，说明 deterministic local rules、Detection Explainability、Analyst Triage、evidence source 和 raw log exposure boundary。
- **Compatibility**: 保持现有 Markdown 导出结构稳定；缺失 case metadata、entities、triage 或 source files 时仍使用 `Not available` / `暂无数据` 风格，不报错。

---

## [v2.7-local] - GitHub Discoverability / Release Polish
- **README Positioning Refresh**: 首页文案调整为更适合 GitHub 搜索与快速理解的项目定位，突出 local-first、security log triage、IOC extraction、detection explainability 和 analyst evidence pack export。
- **Repository Listing Guidance**: 新增 `docs/github_listing.md`，提供 GitHub description、topics、short intro、portfolio bullets 和 release snapshot 命名建议。
- **Portfolio / Demo / Screenshot Updates**: 更新 `docs/portfolio.md`、`docs/demo.md` 和 `docs/screenshots/README.md`，让项目展示路径更贴近当前真实功能链路。
- **No Behavior Change**: 本版本聚焦文档与展示优化，不修改默认端口、不改变 `npm run dev` 行为、不引入新依赖、不修改业务逻辑。

---

## [v2.6-local] - Detection Explainability Drilldown
- **Per-Finding Explainability**: 每条 finding 都附带 `Show explanation` / `展开解释` 按钮，展开后展示本地静态的 `Detection Explainability` / `检测可解释性` 面板，包含 Rule ID / Name / Description、严重程度判定依据、命中上下文、命中指标 (IP/Path/Method/Status/UA/Keyword/Count)、截断后的证据片段、按严重程度分级的推荐分析师操作、以及与该 finding 关联的调查实体。
- **Pure-Function Utility**: 新增 `frontend/src/utils/findingExplainability.js`，作为纯函数生成结构化的解释；新增 `frontend/src/components/FindingExplainability.vue` 在 `FindingsList` 中渲染 drilldown。
- **Evidence Pack Integration**: `Download Evidence Pack` / `下载证据包` 额外输出 `Detection Explainability` / `检测可解释性` 章节，结构与 UI 面板保持一致。
- **Bilingual & Fallback**: 全部 UI 文案接入现有 i18n（中/英），缺数据时显示 `Not available` / `暂无数据`，不报错；不修改后端 API schema，不调用外部 API/LLM/威胁情报。
- **Validation Snapshot**: Backend `65 passed`，Frontend `154 passed`，`npm run build` passed，`docker compose config` passed。

---

## [v2.2.1-local] - Test Polish & Noise Cleanup
- **测试输出优化**: 清理了前端测试中的 `console.error` 噪音和 `jsdom` 导航警告，使 CI 输出更清爽、专业。
- **导出逻辑测试**: 增强了导出功能的测试覆盖，确保在无真实浏览器环境下的逻辑正确性。
- **验证快照**: Backend `65 passed`，Frontend `129 passed` (clean output)，`npm run build` passed。

## [v2.2-local] - Analyst Triage Workflow
- **分析师处置面板**: 在分析结果页新增独立的处置区块，支持对 Findings 和 Incidents 进行状态管理。
- **状态跟踪**: 提供 Open, Investigating, Mitigated, False Positive 四种标准状态。
- **优先级与备注**: 支持设置 Critical, High, Medium, Low 优先级，并允许分析师输入详细的处置备注。
- **本地持久化**: 处置状态基于 `caseId` 自动保存于 `localStorage`，支持在重新加载案例时自动恢复。
- **Markdown 摘要导出**: 支持一键导出包含统计指标和明细表的处置摘要报告。
- **验证快照**: Backend `65 passed`，Frontend `129 passed`，`npm run build` passed，`docker compose config` passed。

## [v2.1-local] - Saved Case Workspace
- **本地案例工作区**: 引入独立的 Saved Cases 视图，将临时分析历史提升为受控的案件存档。
- **主动保存工作流**: 支持用户为当前分析结果设置标题、标签和备注，并持久化到本地。
- **搜索与过滤**: 支持按标题/标签全局搜索，以及按风险等级对已保存案例进行过滤。
- **导入导出 (JSON)**: 提供案例元数据的导出与导入功能，方便在不同设备间迁移分析快照。
- **隐私保护快照**: 存储逻辑自动剔除原始日志文本与 File 对象，确保在保存案例的同时不泄露原始日志。
- **验证快照**: Backend `65 passed`，Frontend `114 passed`，`npm run build` passed，`docker compose config` passed。

## [v2.0-local] - Multi-file Batch Analysis
- **Multi-file Case Analysis**: 支持将多个日志文件作为同一个安全案例统一分析，从单文件日志分析升级为案件级分析工作流。
- **Backend Endpoint**: 新增 `POST /api/analyze/batch`，支持 `multipart/form-data` 多文件上传，并保留统一的 `log_format` 控制。
- **Frontend Batch Workflow**: 前端支持一次选择多个日志文件，Recent Analyses 会为批量记录显示 `Batch` 标签。
- **Per-source Parse Quality**: 在聚合统计之外，保留每个 source file 的解析质量、格式识别结果与跳过样本，便于定位问题文件。
- **Rule Tuning Batch Hint**: 在 batch 模式下明确提示临时调优将应用于整个批量集合，而不是单个文件。
- **Validation Snapshot**: Backend `65 passed`，Frontend `20 passed / 97 passed`，`npm run build` passed，`docker compose config` passed。
- **Local-first by Design**: 整个 v2.0 工作流仍然不依赖数据库、不调用外部服务、不连接 LLM。

## [v1.9] - Interactive Rule Tuning
- **规则调优 UI**: 提供交互式面板，支持在不修改配置文件的前提下，临时调整检测阈值和敏感词列表。
- **单次请求 Override**: 后端新增支持单次分析请求的规则覆盖逻辑，结果实时反映在 UI 中。
- **禁用规则支持**: 支持临时禁用特定规则，以减少误报或关注特定威胁。
- **Rule Coverage 联动**: 调优后的规则状态（如禁用、阈值变化）会实时同步到规则覆盖视图。

## [v1.8] - Rule Coverage & Explainability
- **规则覆盖面板**: 实时展示系统已加载的规则，以及哪些规则在当前分析中被触发。
- **检测解释增强**: 每一个 Finding 现在都包含详细的规则解释，帮助非安全背景的用户理解风险。
- **证据样例脱敏**: 自动对 Rule Coverage 中的证据样例进行脱敏处理。

## [v1.7] - Report Comparison & Bilingual UI
- **报告对比**: 支持选择两个历史分析记录，对比风险分值、严重程度分布及增量变化。
- **双语切换 (v1.7.1)**: 前端支持中文/英文一键切换，偏好自动保存。
- **本地历史增强**: 优化了 `localStorage` 的存储结构，确保历史记录的兼容性。

## [v1.6] - Executive Summary
- **高管摘要**: 自动化生成面向非技术人员的安全总结。
- **确定性风险评分**: 引入基于规则权重的 0-100 计分模型。
- **摘要下载**: 支持导出独立的 Executive Summary Markdown 文件。

## [v1.4] - Attack Timeline
- **攻击时间轴**: 将安全事件按时间顺序线性排列，还原攻击者路径。
- **实时过滤**: 支持按严重程度和来源 IP 对时间轴进行秒级筛选。

## [v1.3] - Analyst Workflow
- **多格式导出**: 新增对 CSV 和 JSON 格式的导出支持。
- **证据管理**: 引入证据列表的折叠与展开功能，提升处理大量日志时的 UI 性能。

## [v1.2] - Severity Distribution
- **风险分布**: 增加可视化统计看板，展示 Findings 与 Incidents 的等级分布。
- **解析质量看板**: 详细统计解析成功率，并展示跳过行的原始样本。

## [v1.1] - Match Details & Sanitization
- **命中详情**: Findings 增加“命中字段”和“命中值”列表。
- **脱敏引擎**: 首次引入本地脱敏逻辑，支持隐藏 IP 后两段。

## [v1.0] - Local-first MVP
- **核心解析引擎**: 支持 Nginx 和 Apache 的基本解析。
- **事件聚合逻辑**: 首次实现从单行日志到 Incident 的初步聚合。
- **CLI 模式**: 提供基础的命令行分析功能。
