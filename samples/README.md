# Demo Samples

这些样例用于演示 LogForenSight 的本地安全日志分析链路。

## 推荐演示顺序

1. 上传 `demo_access.log`，查看 parse quality、findings 和 incidents。
2. 上传 `demo_batch_part1.log` 与 `demo_batch_part2.log`，查看 multi-file source attribution。
3. 查看 Investigation Entities。
4. 展开 Detection Explainability。
5. 在 Triage Workflow 中标记状态、优先级和备注。
6. 导出 Analyst Evidence Pack。

## 样例说明

- `demo_access.log`: 单文件演示样例。可稳定展示 parse quality、敏感路径探测、404 burst、可疑 User-Agent、incident 聚合、Investigation Entities、Detection Explainability、triage 与 Evidence Pack 导出。
- `demo_batch_part1.log` + `demo_batch_part2.log`: 多文件批量演示样例。适合展示 `Source Files` 明细、同一来源 IP 跨文件聚合、source file attribution，以及批量 case 的实体提取结果。
- `nginx_access_sample.log` / `apache_access_sample.log`: 现有格式样例，适合做 parser smoke check；推荐演示优先使用新的 `demo_*.log` 文件。

## 数据说明

- 所有 demo IP 均使用文档保留网段。
- 样例不包含真实用户、真实 token 或真实业务数据。
- 域名使用 `.invalid` 保留后缀，仅用于本地演示与测试。
- 样例仅用于本地演示与测试。
