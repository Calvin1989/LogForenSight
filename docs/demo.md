# 演示指南 (Demo Guide)

本指南用于在 5-8 分钟内展示 **LogForenSight** 当前最完整、最适合 portfolio / GitHub 展示的安全分析链路。

---

## 准备阶段

- 启动环境：`docker compose up --build`
- 准备文件：`samples/nginx_access_sample.log`、`samples/apache_access_sample.log`，以及任意第 3 个可复用的 Web 访问日志样本
- 建议目标受众：安全分析师、DFIR 面试官、蓝队负责人、对 local-first 工具感兴趣的工程团队

---

## Recommended Demo Path

1. Start backend/frontend
2. Upload sample log
3. Review findings/incidents
4. Inspect Investigation Entities
5. Expand Detection Explainability
6. Add triage notes
7. Export Analyst Evidence Pack

这条路径最适合 GitHub README、面试展示和 portfolio 讲解，能够在最短时间内串起当前版本最完整的分析师工作流。

---

## 演示脚本 (5-8 分钟)

### 1. 启动与定位 (1 分钟)

- **动作**: 展示 Docker 启动后的首页，或分别启动 `backend` / `frontend` 开发环境。
- **解说**: “LogForenSight 是一个 local-first security log triage 工具，专注 incident response、DFIR 和 threat hunting。日志不需要上传到第三方服务，也不依赖外部 API 或 LLM。”

### 2. 上传样本并验证解析质量 (1 分钟)

- **动作**: 切换顶部栏的 **"中文 | English"** 开关，上传 `nginx_access_sample.log`。
- **展示点**: `Parse Stats`、自动格式识别、解析失败样本行。
- **解说**: “第一步先看日志是否被稳定解析。对于真实排查，解析质量比炫酷可视化更关键。”

### 3. Review Findings / Incidents (1 分钟)

- **展示点**: `Security Findings` 和 `Incidents`。
- **解说**: “系统先做 deterministic detection，再把相关 findings 聚合为 incidents，帮助分析师从原始日志过渡到可行动的调查对象。”

### 4. 批量案件分析 (1 分钟)

- **动作**: 重新选择 2-3 个日志文件，演示多文件上传。
- **展示点**: 页面仍返回同一个案例级结果，但解析质量卡片增加 **Source Files** 明细表。
- **解说**: “多文件 batch 分析可以把多个站点、时间片或事件窗口的日志统一纳入一个 case，贴近真实排查流程。”

### 5. Investigation Entities 与 IOC 提取 (1 分钟)

- **展示点**: **Investigation Entities** 卡片。
- **解说**: “这里会本地提取 IP、账号、URL、路径、HTTP 方法、状态码和 source files。它能帮助分析师快速看到调查对象，而不是手工从原始日志里逐条复制。”

### 6. Detection Explainability Drilldown (1 分钟)

- **展示点**: **Rule Coverage & Detection Explainability** 面板。
- **动作**: 在一个 finding 下点击 **"Show explanation"** / **"展开解释"**。
- **解说**: “我们拒绝‘黑盒’。在这里可以看到规则上下文、严重程度依据、命中指标、证据片段以及建议的分析师动作。”

### 7. 交互式规则调优 (1 分钟)

- **动作**: 打开 **Temporary Rule Tuning** 面板。
- **动作**: 调整 “高频访问阈值” (例如从 10 改为 5)，点击 **"应用调优并重新分析"**。
- **展示点**: 观察 **Findings** 和 **Rule Coverage** 的实时变化。
- **展示点**: 如果当前是 batch 分析，指出面板中的 batch hint，说明调优将作用于整个批量集合。
- **解说**: “支持实时调优。分析师可以临时调整规则阈值或禁用特定规则，观察其对结果的影响，而无需修改任何配置文件。”

### 8. 案例工作区与持久化 (1 分钟)

- **动作**: 点击分析结果上方的 **"保存为案例"** 按钮，输入一个标题（如 `Case: Project X Attack`）。
- **展示点**: 页面中出现 **Case Workspace** 列表，显示刚才保存的案例，包含风险评分和标签。
- **解说**: “本地案例工作区让分析结果可以被复用、过滤和导出，同时避免把原始日志大文本直接持久化。”

### 9. 分析师处置工作流 (1 分钟)

- **展示点**: 页面底部的 **Analyst Triage Workflow** 面板。
- **动作**: 为一个高危 incident 设置状态为 **"Investigating"**，优先级为 **"Critical"**，并输入备注“正在排查源 IP 归属”。
- **动作**: 说明 triage 状态会和 case 关联保存。
- **解说**: “这一步把‘检测结果’转化为‘调查动作’，也让工具更贴近真实 analyst workflow。”

### 10. 证据包与合规分享导出 (1 分钟)

- **动作**: 滚动到页面底部，点击 **"Download Evidence Pack"** / **"下载证据包"**。
- **动作**: 再按需演示 **"下载 Markdown 报告 (.md)"** 和 **"下载脱敏报告 (.md)"**。
- **解说**: “当前版本最适合展示的导出能力是 Analyst Evidence Pack。它把 findings、incidents、Investigation Entities、Detection Explainability 和 triage 信息打包成便于交接的 Markdown 证据包。”

### 11. 本地历史与趋势分析 (可选)

- **动作**: 在 **Recent Analyses** 中查看批量记录，确认它显示了 **Batch** 标签。
- **动作**: 在 **Report Comparison** 中选择两条记录进行对比。
- **解说**: “如果时间允许，可以补充展示本地历史与报告对比，说明项目不仅能分析一次结果，还支持趋势复盘。”

---

## 关键技术总结 (Takeaways)

- **Local-first**: 隐私优先，不依赖外部 API。
- **Case Workspace**: 完整的本地案件生命周期管理。
- **Case-level Workflow**: 支持从单文件分析升级到多文件案件分析。
- **IOC Extraction**: 调查实体抽取提升调查效率。
- **Explainability**: 规则透明，证据确凿。
- **Evidence Pack**: 适合 analyst handoff 和 portfolio 展示。
- **Zero-Infra**: 零基础设施，启动即用。
- **Bilingual**: 友好的国际化支持。
