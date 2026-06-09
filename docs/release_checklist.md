# Release Checklist (v2.0 Batch Analysis Edition)

本清单用于确保 **LogForenSight** 的版本发布达到 Portfolio 展示级别。

---

## 1. 核心逻辑验证
- [ ] **后端测试**: `cd backend && python -m pytest` (预期 65 passed)。
- [ ] **前端测试**: `cd frontend && npm run test` (预期 20 passed / 97 passed)。
- [ ] **构建校验**: `cd frontend && npm run build` (确保生产环境静态资源生成无误)。
- [ ] **容器验证**: `docker compose config` 无语法错误，`docker compose up` 可正常启动。

## 2. 国际化与渲染 (Bilingual & Render)
- [ ] **中英文切换**: 首页、统计卡片、Findings/Incidents 列表、Rule Tuning 面板实时翻译切换正常。
- [ ] **Markdown 预览**: 页面底部的 Markdown 报告预览不包含 `#`、`**` 等源码符号，表格和列表渲染美观。
- [ ] **持久化**: 刷新页面后，语言偏好和本地历史记录 (Recent Analyses) 依然存在。

## 3. 功能完整性 (Portfolio Features)
- [ ] **Multi-file Batch Analysis**: 能够一次上传 2-3 个日志文件并返回统一案件分析结果。
- [ ] **Per-source Parse Quality**: 解析质量区域展示 Source Files 明细，包括每个文件的 `parse_rate` 与 `detected_format`。
- [ ] **Batch History Labels**: Recent Analyses 中的批量记录显示 `Batch` 标签。
- [ ] **Rule Tuning**: 能够临时调整阈值并重新分析，观察结果变化，且不修改 `rules.yaml`。
- [ ] **Batch Hint**: 在 batch 模式下，Rule Tuning 面板明确提示调优作用于整个批量集合。
- [ ] **Executive Summary**: 包含风险评分、风险等级、核心指标和 methodology 说明。
- [ ] **Report Comparison**: 能够成功对比两个历史记录，并导出对比 Markdown。
- [ ] **Rule Coverage**: 显示所有预设规则的状态，包含调优后的启用/禁用状态。
- [ ] **脱敏引擎**: 下载的 Sanitized Report 中 IP 地址已部分掩码 (如 `1.2.x.x`)。

## 4. 仓库质量 (Repo Polish)
- [ ] **README.md**: 包含 v2.0 batch analysis、local-first/no database/no external API/no LLM 的最新说明。
- [ ] **CHANGELOG.md**: 记录了 v2.0-local 的多文件案件分析与相关测试更新。
- [ ] **Portfolio Docs**: `docs/portfolio.md` 和 `docs/release_notes.md` 已就绪。
- [ ] **Git Hygiene**: `git show --check HEAD` 干净（无 trailing whitespace）。
- [ ] **Samples**: `samples/` 目录下包含有效的 Nginx 和 Apache 示例日志。

## 5. 发布后确认
- [ ] 标签指向正确的提交。
- [ ] 远程分支与本地同步。
- [ ] GitHub 首页展示效果符合预期。
