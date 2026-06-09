# Portfolio Showcase: LogForenSight

本文档将 **LogForenSight** 重新组织为更适合 portfolio、面试和技术分享的展示版本，重点强调“问题定义 -> 解决方案 -> 技术亮点 -> 安全工作流 -> 验证状态”。

---

## Problem

安全团队经常面对同一类痛点：

- Web 访问日志数量大，但原始文本缺少调查上下文。
- 许多安全演示工具只做“检测”，没有把 findings 串成 analyst workflow。
- 将敏感日志发送给外部 API、数据库或 LLM，往往会引入隐私与合规顾虑。
- 传统 SIEM 过重，不适合本地快速排查、作品集展示或离线 DFIR 场景。

---

## Solution

LogForenSight 提供了一条 local-first 的安全分析链路，把原始日志转化为可复核、可解释、可导出的调查结果：

1. log parsing
2. deterministic detection
3. incident aggregation
4. case workspace
5. triage workflow
6. IOC extraction
7. detection explainability
8. evidence pack export

这让项目不只是“日志解析器”，而是一个适合 incident response、DFIR、threat hunting 和 portfolio 展示的轻量级 analyst workbench。

---

## Technical Highlights

### 1. Parsing with quality feedback

- 自动识别 Nginx / Apache 访问日志格式。
- 暴露 `parse_rate`、`skipped_lines` 和失败样本，便于快速定位格式问题。
- 在多文件 batch 场景下保留 per-source parse stats，增强 source attribution。

### 2. Deterministic detection over black-box AI

- 基于规则和阈值执行安全检测，输出可复现、可回归的分析结果。
- 不依赖 LLM，不需要外部推理服务，适合可验证的安全演示。
- 支持 Rule Coverage 和规则调优，便于解释为什么命中、为什么没命中。

### 3. Incident aggregation for analyst readability

- 将原子级 findings 聚合成更适合人类处理的 incidents。
- 降低安全分析师的认知负荷，减少“同一 IP 重复刷屏”的问题。
- 让项目从单条规则命中展示，提升到 case-level investigation 视角。

### 4. Investigation Entities / IOC extraction

- 从 findings、incidents、timeline、report context 和 source files 中提取调查实体。
- 聚合 IP、账号、URL、路径、HTTP 方法、HTTP 状态码和 source files。
- 让调查对象先于原始日志暴露，提升 DFIR 和 threat hunting 效率。

### 5. Detection explainability drilldown

- 每条 finding 均可展开查看规则上下文、严重程度依据、命中指标和证据片段。
- 将“可解释性”从静态文案提升为逐条 findings 的 drilldown 体验。
- 便于面试中回答“你的工具如何避免黑盒”的问题。

### 6. Analyst evidence pack export

- 将 findings、incidents、Investigation Entities、Detection Explainability 和 triage 信息导出为 Markdown 证据包。
- 适合工单交接、内部复盘、portfolio 截图和 GitHub release snapshot。
- 保持 local-first，不依赖数据库和外部服务。

---

## Security Workflow

LogForenSight 当前最完整的安全工作流如下：

1. 上传一个或多个 Web 日志文件。
2. 解析并评估日志质量。
3. 运行确定性检测规则并生成 findings。
4. 将 findings 聚合为 incidents。
5. 浏览 Investigation Entities 识别调查对象。
6. 展开 Detection Explainability 查看规则依据与证据。
7. 为 findings / incidents 添加 triage notes、状态和优先级。
8. 保存为本地 case，并导出 analyst evidence pack。

这个链路比单纯的“发现列表”更贴近真实安全分析师的工作方式。

---

## Local-first Design

### 为什么坚持 local-first

- **隐私**: 日志、IOC 和证据默认留在本地。
- **确定性**: 相同输入稳定输出，适合验证与演示。
- **成本**: 无外部 API、无数据库、无 SaaS 依赖。
- **可移植**: Docker、本地开发环境和离线展示都较轻量。

### 为什么不依赖 LLM

- 安全场景更重视可复现性与证据链完整性。
- 规则检测对访问日志这类结构化文本更高效。
- 不把敏感日志发送给第三方模型服务，本身就是产品卖点。

---

## Validation Status

- **Stable baseline**: `v2.6.1-local`
- **Current release target**: `v2.7-local`
- **Core stack**: Vue 3 + Vite, Python 3.11 + FastAPI, Docker Compose
- **Validation model**: Pytest, Vitest, `npm run build`, `docker compose config`
- **Scope note**: 当前版本主要强化 GitHub discoverability、portfolio readiness 和 release polish，不改业务逻辑

---

## Interview Angle

如果需要在面试中用 30-60 秒概述项目，可以这样表达：

> LogForenSight is a local-first security log triage tool built with FastAPI and Vue. It parses web access logs, runs deterministic detection, aggregates incidents, extracts investigation entities, explains each detection, and exports an analyst evidence pack without relying on external APIs, databases, or LLMs.
