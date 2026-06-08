# AI Log Security Analyzer

**Local-first, explainable web log security analysis for Nginx and Apache access logs.**

Local-first Web log security analysis with rule-based findings, aggregated incidents, evidence-driven reports, and sanitized sharing.

## Why this project is different

- **Local-first privacy**: All analysis happens on your machine. No logs are ever uploaded to a cloud service or stored in an external database.
- **Rule-based findings**: Every security risk is identified by transparent, configurable rules, not a "black box" model.
- **Aggregated incidents**: Automatically groups individual suspicious events into high-level security incidents (e.g., "Reconnaissance") for better context.
- **Attack timeline**: Provides a chronological narrative of the attack, helping you understand the sequence of events.
- **Sanitized sharing**: Built-in engine to redact sensitive information like IPs and tokens, making it safe to share reports with stakeholders.
- **Analyst exports**: Supports exporting filtered data to CSV and JSON for further investigation in external tools.
- **No database / no external API**: Zero infrastructure overhead. Just run the app and start analyzing.

## Current Status

**Current local milestone: v1.4-local**

| Feature | Status |
| :--- | :--- |
| **CI / Tests** | ![Passing](https://img.shields.io/badge/CI-Passing-brightgreen) |
| **Unit Tests** | ![Coverage](https://img.shields.io/badge/Coverage-90%25-brightgreen) |
| **Docker** | ![Ready](https://img.shields.io/badge/Docker-Ready-blue) |

*Note: Badges are illustrative of current local build status.*

## 核心差异化优势

- **Rule-based Findings**: 基于精准规则的底层检测，确保每一个风险点都有据可查。
- **Rule Match Details**: 每个风险点均包含结构化的命中详情（命中次数、命中字段、命中值列表），提供透明的检测逻辑解释。
- **Aggregated Incidents**: 智能聚合相关风险点为“安全事件”，为分析师提供行为意图层面的深度洞察。
- **Evidence-driven Analysis**: 每一个结论都附带原始日志证据，拒绝“黑盒”分析，方便人工二次校验。
- **Sanitized Sharing**: 内置脱敏引擎，支持一键生成隐藏敏感信息（IP/Token）的安全报告，方便合规分享。
- **Local-first Design**: 核心逻辑完全本地运行，不依赖云端 API 或外部数据库，确保敏感日志不出本地。

## 功能特性

- **高效解析**: 快速解析标准 Nginx 和 Apache access.log (Combined Format)，提取 IP、路径、状态码等关键字段。
- **多格式支持**: 内置自动识别逻辑，支持手动指定 Nginx 或 Apache 格式。
- **解析质量统计**: 提供详细的解析成功率、跳过行数统计及**跳过行样本预览**，帮助用户快速定位并修复日志格式不兼容问题。
    *   *注：`samples/nginx_access_sample.log` 故意包含一条错误行用于演示此功能。*
- **威胁检测**: 涵盖高频访问、路径扫描、敏感路径探测、异常 User-Agent 等多维度检测。
- **Explainable Detection**: 增强的检测结果可解释性，每个 Finding 包含命中次数、命中字段和命中值列表，并支持前端展开/收起查看。
- **Severity Distribution**: 提供直观的风险等级分布统计，分别展示 Findings 和 Incidents 的 High/Medium/Low 数量。
- **智能聚合**: 自动将同一 IP 的多个可疑行为聚合成高级别的安全事件（如 Reconnaissance, Directory Scanning）。
- **Attack Timeline View**: 按照时间顺序展示关键安全事件，帮助分析师还原攻击全过程，支持按严重程度和 IP 进行本地过滤。
- **隐私保护**: 提供“脱敏报告”功能，自动隐藏 IP 后两段及敏感 Query 参数，支持安全地分享分析结论。
    *   **注意**：脱敏基于正则表达式，为 Best-effort 尝试（包括对报告中的解析错误样本进行脱敏），分享前仍建议人工检查敏感信息是否完全清除。
- **结构化展示**: 现代化的 Web 界面，包含统计看板、当前规则展示、事件视图和风险卡片。
- **本地筛选与导出**: 支持对“安全事件”和“风险点”进行实时本地筛选，支持一键将筛选后的结果导出为 JSON，并支持**长证据列表的折叠与展开**。
- **清空当前结果**: 提供“Clear Current Result”功能，允许快速清空当前页面的分析结果及选定文件，而不影响本地历史记录。
- **最近分析记录**: 自动在浏览器本地保存最近 5 次分析结果（存储于 `localStorage`），支持快速回溯历史分析，无需重复上传。
    *   **注意**：脱敏报告下载在历史回溯场景下，若未缓存脱敏结果且没有原始文件，可能需要重新上传日志文件。
- **Markdown 报告**: 自动生成专业安全报告，支持在线预览及本地下载。
- **分析师工作流导出**:
    - **Filtered CSV/JSON Export**: 支持将当前筛选后的“安全事件”或“风险点”直接导出为 CSV 或 JSON 文件，方便导入 Excel 或其他分析工具。
    - **Summary JSON Export**: 支持导出包含核心统计指标、严重程度分布和解析质量的摘要 JSON 文件，不含冗长的原始日志证据。
    - **安全提示**: 所有导出功能均附带安全提醒，防止在分享原始导出数据时泄露敏感信息。

## 技术栈

- **后端**: Python 3.11+, FastAPI, Pydantic, Pytest
- **前端**: Vue 3 (Composition API), Vite, composables for state management
- **CI/CD**: GitHub Actions (Backend tests, Frontend tests/build, Docker config)
- **文档**: Markdown

## 项目结构

```text
ai-log-security-analyzer/
├── backend/                # 后端核心逻辑
│   ├── app/                # 应用代码 (Parser, Detector, Incident Builder, etc.)
│   ├── tests/              # 单元测试与 API 测试
│   └── requirements.txt    # 依赖声明
├── frontend/               # Vue 3 前端代码
│   ├── src/                # 组件与逻辑
│   └── package.json        # 前端依赖
├── docs/                   # 项目说明文档 (Architecture, Demo, API Contract)
├── samples/                # 示例日志文件
└── README.md               # 项目主页
```

## 快速开始

### 1. 后端启动 (CLI 或 API)

```bash
cd backend
pip install -r requirements.txt

# 方式 A: 启动 API 服务 (推荐)
uvicorn app.main:app --reload

# 方式 B: 使用命令行工具直接分析
python -m app.cli ../samples/nginx_access_sample.log
```

### 2. 前端启动

```bash
cd frontend
npm install
npm run dev

# 运行前端测试
npm run test
```
访问 [http://localhost:5173](http://localhost:5173) 即可开始使用。详细演示步骤请参考 [演示指南](docs/demo.md)。

### 3. 使用 Docker Compose (一键启动)

如果你安装了 Docker，可以使用以下命令快速启动整个环境：

```bash
# 启动所有服务
docker compose up --build

# 停止并移除容器
docker compose down
```
启动后，访问 [http://localhost:5173](http://localhost:5173) 即可。

## Custom Rules Configuration

You can customize the detection rules by modifying `config/rules.yaml`. The following parameters are supported:

- `high_frequency_threshold`: Number of requests from a single IP to trigger a "High Frequency" finding.
- `path_scanning_404_threshold`: Number of 404 errors from a single IP to trigger a "Path Scanning" finding.
- `sensitive_paths`: A list of URL paths to monitor (e.g., `/.env`, `/admin`).
- `suspicious_user_agents`: A list of keywords to look for in User-Agents (e.g., `sqlmap`, `nikto`).

### Applying Rules

- **CLI**: Use the `--rules` flag:
  ```bash
  python -m app.cli logs.log --rules ../config/rules.yaml
  ```
- **Docker**: The `config/rules.yaml` file is automatically mounted and used.
- **API (Local)**: Set the `RULES_FILE` environment variable before starting the server.

## 当前限制

- 目前仅支持标准 Nginx 和 Apache Combined 日志格式。
- 目前仅在本地运行，未提供生产环境部署方案。

## 后续计划 (按优先级)

1.  **AI 智能总结**: 接入可选的本地 LLM (如 Ollama) 为事件提供更精准的修复建议。
2.  **导出格式扩展**: 支持 PDF 或 HTML 格式的报告导出。
3.  **更多日志支持**: 兼容 Fail2ban, ModSecurity 等更多安全日志格式。

## 架构参考

关于项目的详细分层设计与数据流，请查看 [架构说明](docs/architecture.md)。
