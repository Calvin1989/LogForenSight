# Release Checklist (v1.9 Rule Tuning Edition)

本清单用于确保 **AI Log Security Analyzer** 的版本发布达到 Portfolio 展示级别。

---

## 1. 核心逻辑验证
- [ ] **后端测试**: `cd backend && python -m pytest` (预期 58 passed)。
- [ ] **前端测试**: `cd frontend && npm run test` (预期 84 passed)。
- [ ] **构建校验**: `cd frontend && npm run build` (确保生产环境静态资源生成无误)。
- [ ] **容器验证**: `docker compose config` 无语法错误，`docker compose up` 可正常启动。

## 2. 国际化与渲染 (Bilingual & Render)
- [ ] **中英文切换**: 首页、统计卡片、Findings/Incidents 列表、Rule Tuning 面板实时翻译切换正常。
- [ ] **Markdown 预览**: 页面底部的 Markdown 报告预览不包含 `#`、`**` 等源码符号，表格和列表渲染美观。
- [ ] **持久化**: 刷新页面后，语言偏好和本地历史记录 (Recent Analyses) 依然存在。

## 3. 功能完整性 (Portfolio Features)
- [ ] **Rule Tuning**: 能够临时调整阈值并重新分析，观察结果变化，且不修改 `rules.yaml`。
- [ ] **Executive Summary**: 包含风险评分、风险等级、核心指标和 methodology 说明。
- [ ] **Report Comparison**: 能够成功对比两个历史记录，并导出对比 Markdown。
- [ ] **Rule Coverage**: 显示所有预设规则的状态，包含调优后的启用/禁用状态。
- [ ] **脱敏引擎**: 下载的 Sanitized Report 中 IP 地址已部分掩码 (如 `1.2.x.x`)。

## 4. 仓库质量 (Repo Polish)
- [ ] **README.md**: 包含最新的 GitHub Actions badge，项目定位清晰。
- [ ] **CHANGELOG.md**: 记录了从 v1.0 到 v1.8.1 的所有重要变更。
- [ ] **Portfolio Docs**: `docs/portfolio.md` 和 `docs/release_notes.md` 已就绪。
- [ ] **Git Hygiene**: `git show --check HEAD` 干净（无 trailing whitespace）。
- [ ] **Samples**: `samples/` 目录下包含有效的 Nginx 和 Apache 示例日志。

## 5. 发布后确认
- [ ] 标签指向正确的提交。
- [ ] 远程分支与本地同步。
- [ ] GitHub 首页展示效果符合预期。
