import { describe, it, expect } from 'vitest';
import { localizeAnalysisForDisplay, localizeFinding, localizeIncident, localizeExecutiveSummary, localizeRuleCoverage } from '../utils/localizedAnalysis';

describe('localizedAnalysis', () => {
  const mockAnalysis = {
    summary: { total_requests: 100, unique_ips: 5 },
    executive_summary: {
      overall_risk_level: 'High',
      headline: 'Critical web attack activity detected',
      risk_score: 85
    },
    findings: [
      { rule_id: 'high_frequency_ip', title: 'High Frequency IP', source_ip: '1.2.3.4', matched_count: 50, severity: 'High' }
    ],
    incidents: [
      { title: 'Anomalous High Frequency Traffic', source_ip: '1.2.3.4', related_rule_ids: ['high_frequency_ip'], confidence: 'High', severity: 'High' }
    ],
    timeline_events: [
      { title: 'High Frequency Activity', timestamp: '2026-06-08 10:00:00', source_ip: '1.2.3.4', severity: 'High', description: 'detected' }
    ],
    rule_coverage: [
      { rule_id: 'high_frequency_ip', title: 'High Frequency Request', explanation: 'Original explanation', severity: 'medium' }
    ]
  };

  it('should localize rule coverage for Chinese', () => {
    const item = mockAnalysis.rule_coverage[0];
    const localized = localizeRuleCoverage(item, 'zh');
    expect(localized.title).toBe('高频访问请求');
    expect(localized.explanation).toBe('检测在当前日志中请求量异常偏高的来源 IP。');
  });

  it('should localize findings for Chinese', () => {
    const finding = mockAnalysis.findings[0];
    const localized = localizeFinding(finding, 'zh');
    expect(localized.title).toBe('高频访问请求');
    expect(localized.description).toContain('1.2.3.4');
    expect(localized.description).toContain('50');
  });

  it('should localize incidents for Chinese', () => {
    const incident = mockAnalysis.incidents[0];
    const localized = localizeIncident(incident, 'zh');
    expect(localized.title).toBe('异常高频访问流量');
    expect(localized.summary).toContain('1.2.3.4');

    const intensiveIncident = { title: 'Intensive Directory Scanning', source_ip: '1.2.3.4', related_rule_ids: [], confidence: 'High', severity: 'High' };
    const localizedIntensive = localizeIncident(intensiveIncident, 'zh');
    expect(localizedIntensive.title).toBe('密集目录扫描');
  });

  it('should localize executive summary for Chinese', () => {
    const exec = mockAnalysis.executive_summary;
    const localized = localizeExecutiveSummary(exec, mockAnalysis, 'zh');
    expect(localized.headline).toBe('检测到高风险可疑访问行为');
    expect(localized.overview).toContain('100');
    expect(localized.overview).toContain('1');
    expect(localized.methodology).toContain('本地规则命中');
  });

  it('should not modify original evidence', () => {
    const findingWithEvidence = { ...mockAnalysis.findings[0], evidence: ['RAW_LOG_EVIDENCE'] };
    const localized = localizeFinding(findingWithEvidence, 'zh');
    expect(localized.evidence).toEqual(['RAW_LOG_EVIDENCE']);
  });

  it('should return original analysis for English', () => {
    const localized = localizeAnalysisForDisplay(mockAnalysis, 'en');
    expect(localized).toEqual(mockAnalysis);
  });
});
