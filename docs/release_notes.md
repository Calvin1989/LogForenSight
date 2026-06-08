# 版本演进 (Release Notes)

本文档记录了 **AI Log Security Analyzer** 从原型到成熟工具的演进过程。

---

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
