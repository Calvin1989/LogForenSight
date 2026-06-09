# AI Log Security Analyzer

**本地优先、零信任、高可解释性的 Web 日志安全分析工具。**

[![CI Status](https://github.com/Calvin1989/ai-log-security-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/ai-log-security-analyzer/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v2.1--local-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

AI Log Security Analyzer 是一款专为安全分析师和开发者设计的 Web 日志分析引擎。它能够快速解析 Nginx 与 Apache 访问日志，通过确定性的规则引擎识别安全风险，并将其聚合成高层级的安全事件。

---

## 🌟 核心亮点

- **🔒 本地优先 (Local-first)**: 核心逻辑完全在浏览器或本地后端运行，日志绝不出本地，无需担心隐私泄露。
- **🧠 确定性与可解释性 (Explainable)**: 拒绝“黑盒”分析。每一个发现都由透明规则驱动，并附带完整的命中详情与原始日志证据。
- **🚫 零基础设施 (Zero-Infra)**: 无需数据库，无需外部 API，无需连接大模型 (LLM)，启动即用。
- **🗂️ 多文件案件分析 (v2.0)**: 支持将多个日志文件作为一个 case 联合分析，保留每个 source file 的解析质量统计，适合按站点、时间段或事件窗口进行调查。
- **📁 本地案例工作区 (v2.1)**: 用户可将分析结果主动保存为案例 (Saved Cases)，支持按标题/标签搜索、按风险等级过滤，并提供 JSON 导入导出功能。
- **📊 深度聚合与演进**: 从原子级的风险点 (Findings) 到逻辑聚合的安全事件 (Incidents)，再到自动化生成的管理层摘要 (Executive Summary)。
- **🔄 闭环工作流**: 支持报告对比 (Report Comparison)、脱敏分享 (Sanitized Report) 以及多格式导出。

---

## 🚀 快速开始

### 方式 A: Docker 一键启动 (推荐)

```bash
docker compose up --build
```
访问 [http://localhost:5173](http://localhost:5173) 即可开始分析。

### 方式 B: 本地开发启动

**1. 后端 (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. 前端 (Vue 3)**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ 功能概览

### 1. 智能检测与解释
- **Rule-driven Detection**: 涵盖高频扫描、敏感路径探测、异常客户端检测。
- **Rule Tuning UI (v1.9)**: 支持在 UI 界面临时调整规则阈值、黑名单列表和启用状态，实时观察分析结果变化；在 batch 模式下会明确提示调优将应用于整个批量集合。
- **Rule Coverage (v1.8)**: 实时展示系统规则覆盖情况，清晰告知哪些规则被触发，哪些未触发。
- **Rule Match Details**: 展示命中字段、命中值列表及命中频次。

### 2. 分析师视图
- **Saved Case Workspace (v2.1)**: 提供独立的本地工作区，支持保存分析快照、管理案例列表、添加标签以及批量导出/导入案例元数据。
- **Multi-file Batch Analysis (v2.0)**: 前端支持多文件上传，后端通过 `POST /api/analyze/batch` 将多个日志文件作为同一个分析案例处理。
- **Per-source Parse Quality**: 在总体解析质量之外，保留每个 source file 的 `total_lines`、`parsed_lines`、`skipped_lines`、`parse_rate` 与 `detected_format` 统计。
- **Attack Timeline**: 还原攻击者的行为轨迹，支持按严重程度和 IP 过滤。
- **Incident Aggregation**: 自动识别行为模式，将零散请求聚合成具备业务意义的安全事件。
- **Recent Analyses Labels**: Recent Analyses 会对批量案例显示 `Batch` 标签，帮助分析师快速区分单文件和案件级分析记录。
- **Report Comparison**: 追踪风险趋势，直观对比不同时间段或不同站点的风险变化。

### 3. 报告与分享
- **Executive Summary**: 为管理层提供直观的风险评分 (0-100) 和核心指标摘要。
- **Sanitized Sharing**: 内置脱敏引擎，一键生成隐藏敏感 IP 和 Token 的合规报告。
- **Multi-format Export**: 支持导出 Markdown 报告、CSV 明细及 JSON 统计摘要。

---

## 🏗️ 技术架构

项目采用前后端分离架构，强调轻量化与可测试性：

- **Frontend**: Vue 3 + Vite + Composables。采用零依赖 i18n 实现中英文实时切换，并支持多文件上传与本地历史记录。
- **Backend**: Python 3.11 + FastAPI + Pydantic。逻辑层划分为 Parser, Detector, IncidentBuilder 等模块，并通过批量分析接口聚合多文件案例。
- **Quality**: 全面的自动化测试覆盖 (Pytest & Vitest)，确保检测逻辑与 UI 渲染的鲁棒性。

详情请参考 [架构文档](docs/architecture.md)。

---

## 项目状态

| 项目 | 状态说明 |
| :--- | :--- |
| **当前版本** | `v2.1-local` (Stable) |
| **后端测试** | ![Pytest](https://img.shields.io/badge/Pytest-65%20passed-green.svg) |
| **前端测试** | ![Vitest](https://img.shields.io/badge/Vitest-114%20passed-green.svg) |
| **Docker** | ![Docker](https://img.shields.io/badge/Docker--Compose-passed-blue.svg) |
| **多语言** | 支持 中文 / English 实时切换 |
| **部署方式** | Local-first / No database / No external API / No LLM |

---

## 🛡️ 安全与隐私

- **Data Privacy**: 本工具仅作为处理引擎，不存储您的任何日志数据。
- **Best-effort Sanitization**: 脱敏引擎基于启发式正则，分享报告前请务必复核关键敏感信息。

---

## 🔗 更多资源

- [Portfolio Showcase](docs/portfolio.md) - 技术深度与面试亮点
- [演示指南](docs/demo.md) - 5 分钟完整功能演示脚本
- [版本演进](docs/release_notes.md) - 从 MVP 到 v2.0 的路线图
- [API 契约](docs/api_contract.md) - 后端接口详细定义

---

**AI Log Security Analyzer** - 让日志分析回归本地，让安全发现真实可见。
