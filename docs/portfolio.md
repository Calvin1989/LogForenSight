# Portfolio Showcase: AI Log Security Analyzer

本文档深入探讨了 **AI Log Security Analyzer** 的核心设计理念、技术选型以及适合在面试或技术分享中展示的核心技术亮点。

---

## 🎯 项目定位

本项目定位为一款 **轻量级、确定性、本地优先** 的 Web 日志分析工具。它并非要替代传统的 SIEM (如 ELK, Splunk)，而是填补了“快速、隐私、无基础设施开销”的本地分析场景空白。

在 v2.0 中，项目从 **single log analyzer** 进一步升级为 **case-level multi-file analysis** 工具。在 v2.1 中，引入了 **Saved Case Workspace**，将临时分析历史提升为受控的、可管理的本地工作区。

### 为什么不使用大模型 (LLM)？
1.  **确定性**: 安全分析需要 100% 的可复现性。基于规则的引擎能够保证相同输入必得相同输出。
2.  **效率**: 解析数万条日志，传统的正则与逻辑匹配速度远超 LLM 接口调用。
3.  **成本与隐私**: 零成本运行，且不涉及将敏感的服务器日志发送给第三方大模型供应商。

---

## 💻 技术栈

-   **Frontend**: Vue 3 (Composition API), Vite, CSS Variables (Bilingual UI support).
-   **Backend**: Python 3.11, FastAPI, Pydantic, YAML-based config.
-   **Infrastructure**: Docker, Docker Compose, GitHub Actions (CI).
-   **Testing**: Pytest (Backend), Vitest (Frontend).

---

## 🧠 核心架构

项目遵循 **“数据驱动，逻辑分层”** 的原则：

1.  **Parser 层**: 负责处理日志格式兼容性（Nginx/Apache），并提供详细的解析质量指标。
2.  **Detector 层**: 基于 `rules.yaml` 执行原子级的威胁匹配。
3.  **Aggregation 层**: 将原子级的 Findings 聚合成具备上下文意义的 Incidents。
4.  **Reporting 层**: 生成 Markdown 报告、脱敏版本及确定性的 Executive Summary。
5.  **Batch Case Workflow (v2.0)**: 支持多文件上传、统一分析、按 source file 归因与解析质量展示，贴近真实分析师工作流。

---

## 🔥 适合面试讲解的 5 个技术点

### 1. 日志解析与健壮性处理
-   **挑战**: 不同版本的 Web 服务器日志格式可能存在细微差异。
-   **方案**: 实现了基于正则的自动识别引擎，并引入了“解析质量看板”。
-   **亮点**: 能够捕捉解析失败的样本行并返回给前端展示，帮助用户快速诊断日志格式问题。

### 2. Finding -> Incident 的智能聚合
-   **挑战**: 单个 IP 可能会触发数百个低级别的安全风险（如 404 扫描）。
-   **方案**: 设计了聚合逻辑，根据攻击者的 IP、行为特征和时间窗口，将原子发现转换为逻辑事件（如 “Intensive Directory Scanning”）。
-   **亮点**: 极大降低了安全分析师的认知负荷。

### 3. 确定性的 Executive Summary 生成
-   **挑战**: 如何在不使用 AI 的情况下，生成看起来很“智能”的摘要？
-   **方案**: 建立了一套基于风险权重的计分模型 (0-100)，并根据发现的严重程度分布、事件频率自动套用结构化模板。
-   **亮点**: 实现了完全本地化、秒级的专业安全报告生成。

### 4. 零依赖的中英文实时切换 (Bilingual UI)
-   **挑战**: 在不引入 vue-i18n 等大型库的情况下，实现全站国际化。
-   **方案**: 编写了轻量级的 i18n 辅助函数，利用 Vue 3 的 `reactive` 和 `watch` 实现偏好持久化。
-   **亮点**: 极简代码实现，满足轻量级项目的展示需求。

### 5. Rule Coverage / Detection Explainability
-   **挑战**: 安全工具常被诟病为“黑盒”，用户不知道漏掉了什么。
-   **方案**: 实现了规则覆盖面板，展示所有启用规则的状态、触发次数、命中字段以及真实的证据样例。
-   **亮点**: 增强了工具的透明度和用户信任感。

### 6. 从单日志到案件级分析 (v2.0)
-   **挑战**: 真实排查往往需要同时查看多个站点、时间片或代理层导出的日志，而不是孤立地分析单一文件。
-   **方案**: 引入 multi-file batch analysis，将多个文件统一送入一个共享检测管线，同时保留每个 source file 的 `parse_rate`、`detected_format` 与 `skipped_samples`。
-   **亮点**: 兼顾 analyst workflow、source attribution 和 explainability，让项目从“日志解析器”提升为“本地案件分析工作台”。

### 7. 本地案例工作区与隐私快照 (v2.1)
-   **挑战**: 分析历史在浏览器刷新或清理后可能丢失，且保存完整分析结果可能占用过多存储。
-   **方案**: 实现了本地 Case Workspace，支持将分析结果快照化。在存储时，通过递归检查剔除 File 对象和原始大文本日志。
-   **亮点**: 实现了“零数据库”下的案件持久化，支持 JSON 导入导出，增强了工具在离线环境下的生产力。

### 8. Local-first Privacy as a Product Choice
-   **挑战**: 安全日志通常包含 IP、路径、令牌与业务标识，天然具有隐私和合规敏感性。
-   **方案**: 坚持 local-first 设计，不引入数据库，不依赖外部 API，不调用 LLM；分析、摘要、导出全部在本地完成。
-   **亮点**: 能把“隐私保护”从技术约束转化为产品卖点，特别适合面试中阐述架构边界与取舍。

---

## 🚧 项目边界与后续方向

### 边界 (Non-Goals)
-   **不替代 SIEM**: 不做实时告警，不做海量数据持久化。
-   **不做威胁情报**: 专注于日志本身的行为分析，不调用外部 IP 库。

### 后续方向
-   **Baseline Drift**: 增加对流量基准漂移的分析。
-   **Offline Rule Packs**: 支持导入社区编写的离线规则包。
-   **Cross-case Comparison**: 在已有本地历史之上，强化批量案件之间的纵向对比能力。
