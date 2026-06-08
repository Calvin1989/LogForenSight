import { t, translateSeverity, translateRiskLevel } from '../i18n';
import { localizeAnalysisForDisplay } from './localizedAnalysis';

/**
 * Builds a localized Markdown report from the analysis results.
 */
export function buildLocalizedMarkdownReport(analysis, language) {
  if (!analysis) return '';
  if (language === 'en') return analysis.report_markdown;

  const displayData = localizeAnalysisForDisplay(analysis, language);
  const { summary, executive_summary: exec, parse_stats: parse, findings, incidents, timeline_events: timeline } = displayData;

  let md = `# AI 日志安全分析报告\n\n`;
  md += `**生成时间**: ${new Date().toLocaleString()}\n\n`;

  // 1. Executive Summary
  md += `## 管理层摘要\n\n`;
  md += `### ${exec.headline}\n\n`;
  md += `**整体风险等级**: ${translateRiskLevel(exec.overall_risk_level).toUpperCase()} (${exec.risk_score}/100)\n\n`;
  md += `${exec.overview}\n\n`;

  md += `#### 核心指标\n`;
  exec.key_metrics.forEach(m => md += `- ${m}\n`);

  md += `\n#### 主要风险\n`;
  exec.top_risks.forEach(r => md += `- ${r}\n`);

  md += `\n#### 推荐的后续行动\n`;
  exec.recommended_next_steps.forEach(s => md += `- ${s}\n`);

  md += `\n---\n*${exec.methodology}*\n\n`;

  // 2. Overview Statistics
  md += `## 概览统计\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `| :--- | :--- |\n`;
  md += `| 总请求数 | ${summary.total_requests} |\n`;
  md += `| 唯一 IP 数 | ${summary.unique_ips} |\n`;
  md += `| 4xx 错误 | ${summary.total_4xx} |\n`;
  md += `| 5xx 错误 | ${summary.total_5xx} |\n`;
  md += `\n`;

  // 3. Severity Distribution
  md += `## 严重程度分布\n\n`;
  md += `### 风险点严重程度\n\n`;
  md += `| 严重程度 | 数量 |\n`;
  md += `| :--- | :--- |\n`;
  Object.entries(summary.finding_severity_counts).forEach(([sev, count]) => {
    md += `| ${translateSeverity(sev).toUpperCase()} | ${count} |\n`;
  });
  md += `\n`;

  // 4. Parsing Quality
  md += `## 解析质量\n\n`;
  md += `- **解析成功率**: ${(parse.parse_rate * 100).toFixed(2)}%\n`;
  md += `- **总行数**: ${parse.total_lines}\n`;
  md += `- **已解析行数**: ${parse.parsed_lines}\n`;
  md += `- **已跳过行数**: ${parse.skipped_lines}\n`;
  md += `- **检测到的格式**: ${parse.detected_format}\n\n`;

  // 5. Attack Timeline
  if (timeline && timeline.length > 0) {
    md += `## 攻击时间轴\n\n`;
    timeline.forEach(ev => {
      md += `### [${ev.timestamp}] ${ev.title}\n`;
      md += `- **严重程度**: ${translateSeverity(ev.severity).toUpperCase()}\n`;
      md += `- **源 IP**: ${ev.source_ip}\n`;
      md += `- **描述**: ${ev.description}\n\n`;
    });
  }

  // 6. Security Incidents
  if (incidents && incidents.length > 0) {
    md += `## 安全事件\n\n`;
    incidents.forEach(inc => {
      md += `### ${inc.title}\n`;
      md += `- **严重程度**: ${translateSeverity(inc.severity).toUpperCase()}\n`;
      md += `- **源 IP**: ${inc.source_ip}\n`;
      md += `- **置信度**: ${translateRiskLevel(inc.confidence)}\n`;
      md += `- **摘要**: ${inc.summary}\n`;
      md += `- **修复建议**:\n`;
      inc.recommendations.forEach(r => md += `  - ${r}\n`);
      md += `\n`;
    });
  }

  // 7. Risk Findings
  if (findings && findings.length > 0) {
    md += `## 风险点\n\n`;
    findings.forEach(f => {
      md += `### ${f.title} (${f.rule_id})\n`;
      md += `- **严重程度**: ${translateSeverity(f.severity).toUpperCase()}\n`;
      md += `- **描述**: ${f.description}\n`;
      md += `- **修复建议**: ${f.recommendation}\n\n`;
    });
  }

  // 8. Rule Coverage
  if (displayData.rule_coverage && displayData.rule_coverage.length > 0) {
    md += `## 规则覆盖与检测解释\n\n`;
    md += `| 规则 | 严重程度 | 是否启用 | 是否触发 | 风险点 | 安全事件 | 解释 |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    displayData.rule_coverage.forEach(item => {
      const enabled = item.enabled ? '✅ 是' : '❌ 否';
      const triggered = item.triggered ? '🎯 是' : '⚪ 否';
      md += `| ${item.title} | ${translateSeverity(item.severity).toUpperCase()} | ${enabled} | ${triggered} | ${item.finding_count} | ${item.incident_count} | ${item.explanation} |\n`;
    });
    md += `\n`;
  }

  // 9. Traffic Analysis (Top IPs/Paths)
  md += `## 流量分析\n\n`;
  md += `### Top 5 IP\n\n`;
  md += `| IP 地址 | 请求数 |\n`;
  md += `| :--- | :--- |\n`;
  summary.top_ips.forEach(item => md += `| ${item.ip} | ${item.count} |\n`);
  md += `\n`;

  md += `### Top 5 路径\n\n`;
  md += `| 路径 | 请求数 |\n`;
  md += `| :--- | :--- |\n`;
  summary.top_paths.forEach(item => md += `| ${item.path} | ${item.count} |\n`);
  md += `\n`;

  return md;
}

/**
 * Builds localized Markdown for Executive Summary only.
 */
export function buildLocalizedExecutiveSummaryMarkdown(analysis, language) {
  if (!analysis) return '';
  const displayData = localizeAnalysisForDisplay(analysis, language);
  const { executive_summary: exec } = displayData;

  let md = `# ${language === 'zh' ? '管理层摘要' : 'Executive Summary'}\n\n`;
  md += `## ${exec.headline}\n\n`;
  md += `**${language === 'zh' ? '整体风险等级' : 'Overall Risk Level'}**: ${translateRiskLevel(exec.overall_risk_level).toUpperCase()} (${exec.risk_score}/100)\n\n`;
  md += `${exec.overview}\n\n`;

  md += `### ${language === 'zh' ? '核心指标' : 'Key Metrics'}\n`;
  exec.key_metrics.forEach(m => md += `- ${m}\n`);

  md += `\n### ${language === 'zh' ? '主要风险' : 'Top Risks'}\n`;
  exec.top_risks.forEach(r => md += `- ${r}\n`);

  md += `\n### ${language === 'zh' ? '推荐的后续行动' : 'Recommended Next Steps'}\n`;
  exec.recommended_next_steps.forEach(s => md += `- ${s}\n`);

  md += `\n---\n*${exec.methodology}*`;

  return md;
}
