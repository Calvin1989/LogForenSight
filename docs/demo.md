# 演示指南 (Demo Guide)

本指南用于在 5-8 分钟内稳定展示 **LogForenSight** 的完整本地分析链路：上传日志、验证解析质量、查看 findings / incidents、检查 Investigation Entities、展开 Detection Explainability、补充 triage 信息，并导出 Evidence Pack。

---

## 准备阶段

### 启动方式

- 一体启动：`docker compose up --build`
- 或分别启动：

```powershell
cd backend
uvicorn app.main:app --reload
```

```powershell
cd frontend
npm run dev
```

- 前端默认地址：`http://localhost:5173`
- 推荐目标受众：安全分析师、DFIR 面试官、蓝队负责人、对 local-first 工具感兴趣的工程团队

### 推荐 Demo 样例

- `samples/demo_access.log`
  - 适合展示单文件完整链路。
  - 重点展示 parse quality、敏感路径探测、404 burst、可疑 User-Agent、incident 聚合、Investigation Entities、Detection Explainability、triage 和 Evidence Pack。
- `samples/demo_batch_part1.log` + `samples/demo_batch_part2.log`
  - 适合展示 multi-file batch 分析。
  - 重点展示 `Source Files` 明细、跨文件 source attribution、同一来源 IP 的 findings / incidents 聚合，以及批量 case 的 Investigation Entities。
- `samples/nginx_access_sample.log` / `samples/apache_access_sample.log`
  - 适合做 parser smoke check。
  - 如果只做一次完整演示，优先使用新的 `demo_*.log` 文件。

---

## 推荐 Demo Path

1. 启动后端和前端。
2. 上传 sample log。
3. 查看 parse quality。
4. 查看 findings / incidents。
5. 查看 Investigation Entities。
6. 展开 Detection Explainability。
7. 添加 triage notes。
8. 导出 Evidence Pack。

这条路径适合 README、Portfolio、面试演示和本地试跑，能够在最短时间内串起当前版本最完整、最稳定的分析师工作流。

---

## 单文件演示脚本

建议先上传 `samples/demo_access.log`。

### 1. 启动后端和前端

- **动作**: 打开页面，确认后端健康、前端可访问。
- **解说**: “LogForenSight 是一个 local-first security log triage 工具。日志分析、规则命中解释和导出都在本地完成，不依赖外部 API 或 LLM。”

### 2. 上传 sample log

- **动作**: 上传 `demo_access.log`。
- **展示点**: 页面无需额外配置即可进入分析结果页。
- **解说**: “这份样例使用可公开展示的保留地址，适合稳定演示从上传到导出的完整链路。”

### 3. 查看 Parse Quality

- **展示点**: `Parse Stats` / `Parse Quality` 区域。
- **解说**: “先确认日志被稳定解析。对于真实排查，解析质量永远优先于可视化包装。”
- **说明**: `demo_access.log` 设计为干净可解析样例，适合展示稳定 parser 行为。

### 4. 查看 Findings / Incidents

- **展示点**: `Security Findings` 和 `Incidents`。
- **建议强调**:
  - 可看到敏感路径探测与可疑 User-Agent。
  - 同一来源 IP 的相关 findings 会被聚合成更便于处置的 incident。
  - `/login` 的重复访问可帮助展示高频请求和登录探测类分析语境。

### 5. 查看 Investigation Entities

- **展示点**: `Investigation Entities`。
- **建议强调**:
  - 可看到 IP、path、HTTP method、HTTP status，以及与 source file 相关的实体。
  - 这些实体适合用于 analyst handoff、IOC 摘录和后续调查。

### 6. 展开 Detection Explainability

- **动作**: 在一个 finding 下点击 `Show explanation` / `展开解释`。
- **展示点**: 规则上下文、严重程度依据、命中字段、证据片段、关联实体。
- **解说**: “这里不是黑盒判断，而是可复核的 deterministic explanation。”

### 7. 添加 Triage Notes

- **展示点**: `Analyst Triage Workflow`。
- **动作**: 为一个 incident 设置状态为 `Investigating`、优先级为 `Critical`，并添加备注，例如“继续核对源 IP 是否为外部扫描器”。
- **解说**: “这一步把检测结果变成可跟踪的分析师动作。”

### 8. 导出 Evidence Pack

- **动作**: 点击 `Download Evidence Pack` / `下载证据包`。
- **解说**: “Evidence Pack 会把 findings、incidents、Investigation Entities、Detection Explainability 和 triage 信息整理成便于交接的 Markdown 证据包。”

---

## 批量演示脚本

建议第二轮上传 `samples/demo_batch_part1.log` 和 `samples/demo_batch_part2.log`。

- **目标**: 展示多文件作为同一个 case 统一分析。
- **重点观察**:
  - `Parse Stats` 中的 `Source Files` 明细。
  - 同一来源 IP 跨文件累计后的 findings / incidents。
  - Investigation Entities 中的 `source_file` 关联结果。
- **推荐话术**: “这更接近真实场景，分析师经常需要把不同时间片或不同来源的 access log 作为同一个事件窗口统一排查。”

---

## 讲解要点

- **Local-first**: 日志不默认离开本地。
- **Deterministic**: 相同输入得到相同结果，便于复核、测试和演示。
- **Analyst-friendly**: 从 parse quality 到 triage 与 export，链路完整。
- **Explainable**: 每条 detection 都能说明为什么命中。
- **Exportable**: 结果可以直接沉淀为可交接证据。
