# 版本演进 (Release Notes)

本文档记录了 **LogForenSight** 从原型到成熟工具的演进过程。

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
