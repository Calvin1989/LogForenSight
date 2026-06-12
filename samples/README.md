# Demo Samples

这些样例用于 Workspace Browser Smoke 和本地演示，帮助快速走通 LogForenSight 的上传、分析、调查与导出链路。

## 推荐 Smoke 顺序

1. 在 Workspace 上传 `demo_access.log`，完成单文件上传 smoke。
2. 观察分析成功后是否自动进入 Overview，并检查 parse quality、summary、severity、entities 和 top lists。
3. 切换到 Investigation、Triage / Review、Evidence Pack、Markdown Report、Rules，确认各 view 可正常进入。
4. 回到 Workspace，再批量上传 `demo_batch_part1.log` 与 `demo_batch_part2.log`。
5. 检查 batch 结果中的 `Source Files`、跨文件聚合结果、Evidence Pack 预览与 Markdown Report。

## 样例说明

- `demo_access.log`: 单文件上传 smoke 样例。用于覆盖 Workspace -> Overview -> Investigation -> Triage / Review -> Evidence Pack -> Markdown Report -> Rules 的基础浏览器 smoke。
- `demo_batch_part1.log` + `demo_batch_part2.log`: 批量上传 smoke 样例。用于覆盖 Workspace 批量上传、`/api/analyze/batch`、`Source Files` 明细、跨文件 source attribution，以及 batch 结果下的 Overview / Investigation / Evidence Pack / Markdown Report / Rules 浏览器 smoke。

## 样例内容设计

- 日志采用 Nginx / Apache 常见的 combined log 风格，便于 parser 自动识别。
- 样例包含正常请求、404、敏感路径探测、可疑 User-Agent，以及重复来源 IP 请求。
- `demo_access.log` 中包含单文件可读的高频与探测行为，适合手工 smoke。
- `demo_batch_part1.log` 与 `demo_batch_part2.log` 将同一来源 IP 的行为拆分到两个文件中，适合验证 batch 视图与 `source_files` 返回。

## 预期覆盖范围

- Workspace: 上传单文件与批量文件，查看最近分析与结果切换入口。
- Overview: Summary、Executive Summary、Severity、Parse Stats、Investigation Entities。
- Investigation: Timeline、Incidents、Findings、Rule Coverage。
- Evidence Pack: Quality、Export Guardrails、Share Safety、Export Preview。
- Markdown Report: 预览与导出入口。
- Rules: Rule Config 与 Rule Tuning 浏览 smoke。

## 数据说明

- 所有 demo IP 均使用文档保留网段：`192.0.2.x`、`198.51.100.x`、`203.0.113.x`。
- 样例为合成日志，仅用于本地 smoke、演示和测试。
- 样例不包含真实 secret、token、邮箱、个人数据或真实用户行为。
- 域名使用 `.invalid` 保留后缀，仅用于本地演示与测试。
