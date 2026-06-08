# AI Log Security Analyzer

**本地优先、可解释的 Nginx 与 Apache 访问日志安全分析工具。**

提供基于规则的风险发现、安全事件聚合、证据驱动报告以及脱敏分享功能，专注于本地 Web 日志安全分析。

## 核心差异化优势

- **本地优先的隐私保护**: 所有分析逻辑均在您的本地机器运行。日志绝不会上传至云端服务，也不会存储在外部数据库中。
- **基于规则的风险发现**: 每一个安全风险点均由透明、可配置的规则识别，拒绝“黑盒”模型。
- **智能事件聚合**: 自动将零散的嫌疑事件聚合成高层级的安全事件（如“侦察行为”），提供更完整的上下文。
- **攻击时间轴 (Attack Timeline)**: 提供攻击行为的时间线叙述，帮助您理清事件发生的先后顺序。
- **Executive Summary (v1.6)**: 自动生成面向管理层或 Portfolio 的高层级、确定性安全摘要。包含风险评分（0-100）、风险等级（Critical 到 Informational）、核心指标、顶级风险点及修复建议。**完全基于规则，不依赖 LLM 或外部 API。**
- **报告对比 (Report Comparison, v1.7)**: 支持对比两次历史分析结果，直观展示风险评分、严重程度分布、新增/消失的风险点及安全事件的变化趋势。
- **安全脱敏分享**: 内置脱敏引擎，可自动屏蔽 IP 和 Token 等敏感信息，确保生成的报告可以安全地分享给相关方。
- **分析师工作流导出**: 支持将筛选后的数据导出为 CSV 和 JSON，方便在外部工具中进行进一步调查。
- **无数据库 / 无外部 API**: 零基础设施开销。直接运行应用即可开始分析。

## 项目状态

**当前本地版本: v1.7-local**

| 项目 | 状态 |
| :--- | :--- |
| **CI / 测试** | [![CI Status](https://github.com/Calvin1989/ai-log-security-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Calvin1989/ai-log-security-analyzer/actions/workflows/ci.yml) |
| **后端测试** | pytest，本地最近验证 46 passed |
| **前端测试** | Vitest，本地最近验证 47 passed |
| **Docker** | docker compose config 本地验证通过，CI 中执行配置校验 |

## 核心功能

- **Rule-based Findings**: 基于精准规则的底层检测，确保每一个风险点都有据可查。
- **Rule Match Details**: 每个风险点均包含结构化的命中详情（命中次数、命中字段、命中值列表），提供透明的检测逻辑解释。
- **Aggregated Incidents**: 智能聚合相关风险点为“安全事件”，为分析师提供行为意图层面的深度洞察。
- **Evidence-driven Analysis**: 每一个结论都附带原始日志证据，拒绝“黑盒”分析，方便人工二次校验。
- **Sanitized Sharing**: 内置脱敏引擎，支持一键生成隐藏敏感信息（IP/Token）的安全报告，方便合规分享。
- **Local-first Design**: 核心逻辑完全本地运行，不依赖云端 API 或外部数据库，确保敏感日志不出本地。

## 详细特性

- **高效解析**: 快速解析标准 Nginx 和 Apache access.log (Combined Format)，提取 IP、路径、状态码等关键字段。
- **多格式支持**: 内置自动识别逻辑，支持手动指定 Nginx 或 Apache 格式。
- **解析质量统计**: 提供详细的解析成功率、跳过行数统计及**跳过行样本预览**，帮助用户快速定位并修复日志格式不兼容问题。
    *   *注：`samples/nginx_access_sample.log` 故意包含一条错误行用于演示此功能。*
- **威胁检测**: 涵盖高频访问、路径扫描、敏感路径探测、异常 User-Agent 等多维度检测。
- **Explainable Detection**: 增强的检测结果可解释性，每个 Finding 包含命中次数、命中字段和命中值列表，并支持前端展开/收起查看。
- **Severity Distribution**: 提供直观的风险等级分布统计，分别展示 Findings 和 Incidents 的 High/Medium/Low 数量。
- **智能聚合**: 自动将同一 IP 的多个可疑行为聚合成高级别的安全事件（如 Reconnaissance, Directory Scanning）。
- **Attack Timeline View**: 按照时间顺序展示关键安全事件，帮助分析师还原攻击全过程，支持按严重程度和 IP 进行本地过滤。
- **Executive Summary (v1.6)**: 自动生成面向管理层或 Portfolio 的高层级、确定性安全摘要。包含风险评分（0-100）、风险等级（Critical 到 Informational）、核心指标、顶级风险点及修复建议。**完全基于规则，不依赖 LLM 或外部 API。**
- **Report Comparison (v1.7)**: 提供“报告对比”功能，允许用户从“最近分析记录”中选择两个报告进行对比。系统会自动计算风险评分差值、严重程度分布变化，并列出新增、消失和持续存在的风险点 (Findings) 与安全事件 (Incidents)。支持导出对比报告 Markdown。
- **隐私保护**: 提供“脱敏报告”功能，自动隐藏 IP 后两段及敏感 Query 参数，支持安全地分享分析结论。
    *   **注意**：脱敏基于正则表达式，为 Best-effort 尝试（包括对报告中的解析错误样本进行脱敏），分享前仍建议人工检查敏感信息是否完全清除。
- **结构化展示**: 现代化的 Web 界面，包含统计看板、当前规则展示、事件视图和风险卡片。
- **本地筛选与导出**: 支持对“安全事件”和“风险点”进行实时本地筛选，支持一键将筛选后的结果导出为 JSON，并支持**长证据列表的折叠与展开**。
- **清空当前结果**: 提供“Clear Current Result”功能，允许快速清空当前页面的分析结果及选定文件，而不影响本地历史记录。
- **最近分析记录**: 自动在浏览器本地保存最近 5 次分析结果（存储于 `localStorage`），支持快速回溯历史分析，无需重复上传。
    *   **注意**：脱敏报告下载在历史回溯场景下，若未缓存脱敏结果且没有原始文件，可能需要重新上传日志文件。
- **多语言支持 (v1.7.1)**: 前端界面支持 **中文 / English** 切换。
    *   默认语言为中文。
    *   语言偏好自动保存在浏览器的 `localStorage` 中。
    *   **注意**: 后端报告正文和规则标题暂时保持规则定义语言。
- **规则覆盖与检测解释 (v1.8)**: 展示启用规则、触发规则、未触发规则、命中字段、证据样例，增强检测过程的可解释性。
- **Markdown 报告**: 自动生成专业安全报告，支持在线预览及本地下载。
- **分析师工作流导出**:
    - **Filtered CSV/JSON Export**: 支持将当前筛选后的“安全事件”或“风险点”直接导出为 CSV 或 JSON 文件，方便导入 Excel 或其他分析工具。
    - **Summary JSON Export**: 支持导出包含核心统计指标、严重程度分布和解析质量的摘要 JSON 文件，不含冗长的原始日志证据。
    - **安全提示**: 所有导出功能均附带安全提醒，防止在分享原始导出数据时泄露敏感信息。

## 技术栈

- **后端**: Python 3.11+, FastAPI, Pydantic, Pytest
- **前端**: Vue 3 (Composition API), Vite, composables 状态管理
- **CI/CD**: GitHub Actions (后端测试、前端测试与构建、Docker 配置)
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

## 🚀 快速开始

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

## 自定义规则配置

您可以通过修改 `config/rules.yaml` 来自定义检测规则。目前支持以下参数：

- `high_frequency_threshold`: 单个 IP 触发“高频访问 (High Frequency)”风险点的请求数阈值。
- `path_scanning_404_threshold`: 单个 IP 触发“路径扫描 (Path Scanning)”风险点的 404 错误数阈值。
- `sensitive_paths`: 需要监控的敏感 URL 路径列表（例如：`/.env`, `/admin`）。
- `suspicious_user_agents`: User-Agent 中需要识别的嫌疑关键词列表（例如：`sqlmap`, `nikto`）。

### 应用规则

- **CLI**: 使用 `--rules` 标志：
  ```bash
  python -m app.cli logs.log --rules ../config/rules.yaml
  ```
- **Docker**: `config/rules.yaml` 文件会被自动挂载并使用。
- **API (本地)**: 在启动服务器前设置 `RULES_FILE` 环境变量。

## 当前限制

- 目前仅支持标准 Nginx 和 Apache Combined 日志格式。
- 目前仅在本地运行，未提供生产环境部署方案。

## 后续计划 (按优先级)

1.  **AI 智能总结**: 接入可选的本地 LLM (如 Ollama) 为事件提供更精准的修复建议。
2.  **导出格式扩展**: 支持 PDF 或 HTML 格式的报告导出。
3.  **更多日志支持**: 兼容 Fail2ban, ModSecurity 等更多安全日志格式。

## 架构参考

关于项目的详细分层设计与数据流，请查看 [架构说明](docs/architecture.md)。
