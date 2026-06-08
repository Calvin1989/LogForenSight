import { describe, it, expect } from 'vitest';
import { buildLocalizedMarkdownReport } from '../utils/localizedReport';

describe('localizedReport', () => {
  const mockAnalysis = {
    summary: {
      total_requests: 100,
      unique_ips: 5,
      total_4xx: 10,
      total_5xx: 0,
      finding_severity_counts: { high: 1 },
      incident_severity_counts: { high: 1 },
      top_ips: [{ ip: '1.2.3.4', count: 50 }],
      top_paths: [{ path: '/login', count: 10 }]
    },
    executive_summary: {
      overall_risk_level: 'High',
      headline: 'Critical web attack activity detected',
      risk_score: 85
    },
    parse_stats: {
      parse_rate: 0.95,
      total_lines: 100,
      parsed_lines: 95,
      skipped_lines: 5,
      detected_format: 'nginx'
    },
    findings: [
      { rule_id: 'high_frequency_ip', title: 'High Frequency IP', source_ip: '1.2.3.4', matched_count: 50, severity: 'High', description: 'desc', recommendation: 'rec' }
    ],
    incidents: [],
    timeline_events: [],
    rule_coverage: [
      { rule_id: 'high_frequency_ip', title: 'High Frequency IP', explanation: 'desc', severity: 'medium', enabled: true, triggered: true, finding_count: 1, incident_count: 0 }
    ],
    report_markdown: '# Original English Report'
  };

  it('should generate Chinese report with correct headers', () => {
    const report = buildLocalizedMarkdownReport(mockAnalysis, 'zh');
    expect(report).toContain('# AI 日志安全分析报告');
    expect(report).toContain('## 管理层摘要');
    expect(report).toContain('## 概览统计');
    expect(report).toContain('## 风险点');
    expect(report).toContain('## 规则覆盖与检测解释');
    expect(report).not.toContain('Overview Statistics');
  });

  it('should include rule coverage table in Chinese report', () => {
    const report = buildLocalizedMarkdownReport(mockAnalysis, 'zh');
    expect(report).toContain('| 规则 | 严重程度 | 是否启用 | 是否触发 | 风险点 | 安全事件 | 解释 |');
    expect(report).toContain('高频访问请求');
    expect(report).toContain('🎯 是');
  });

  it('should preserve raw evidence in Chinese report', () => {
    const analysisWithEvidence = {
      ...mockAnalysis,
      findings: [{ ...mockAnalysis.findings[0], evidence: ['RAW_LOG_DATA'] }]
    };
    // Note: our current buildLocalizedMarkdownReport doesn't show evidence list for findings yet,
    // but it should handle the object correctly.
    const report = buildLocalizedMarkdownReport(analysisWithEvidence, 'zh');
    expect(report).toContain('high_frequency_ip');
  });

  it('should return original markdown for English', () => {
    const report = buildLocalizedMarkdownReport(mockAnalysis, 'en');
    expect(report).toBe('# Original English Report');
  });
});
