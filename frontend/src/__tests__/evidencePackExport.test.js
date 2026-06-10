import { beforeEach, describe, expect, it } from 'vitest'
import { setLanguage } from '../i18n'
import { buildEvidencePackMarkdown } from '../utils/evidencePackExport'

describe('evidencePackExport', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('builds a structured markdown evidence pack with triage and case data', () => {
    const markdown = buildEvidencePackMarkdown({
      analysis_mode: 'batch',
      summary: {
        total_requests: 120,
        unique_ips: 4,
        total_4xx: 12,
        total_5xx: 1,
        finding_severity_counts: { high: 1, medium: 1 },
        incident_severity_counts: { high: 1 }
      },
      executive_summary: {
        headline: 'Critical suspicious activity detected',
        overall_risk_level: 'high',
        risk_score: 82,
        overview: 'High-risk suspicious traffic was detected.',
        key_metrics: ['120 requests analyzed', '2 findings detected']
      },
      parse_stats: {
        total_lines: 120,
        parsed_lines: 118,
        skipped_lines: 2,
        parse_rate: 0.983,
        detected_format: 'nginx',
        requested_format: 'auto',
        source_files: [
          {
            filename: 'web-1.log',
            total_lines: 60,
            parsed_lines: 59,
            skipped_lines: 1,
            parse_rate: 0.983,
            detected_format: 'nginx'
          }
        ]
      },
      findings: [
        {
          rule_id: 'high_frequency_ip',
          title: 'High Frequency IP',
          severity: 'high',
          description: 'A source IP exceeded the threshold for user=alice on https://portal.example.com/login.',
          recommendation: 'Rate limit the source.',
          matched_count: 25,
          matched_fields: ['source_ip'],
          matched_values: ['1.2.3.4'],
          evidence: ['1.2.3.4 - GET /login HTTP/1.1" 401 src_user=alice'],
          metadata: {
            source_file: 'web-1.log',
            path: 'C:\\inetpub\\wwwroot\\web.config'
          }
        }
      ],
      incidents: [
        {
          incident_id: 'inc-1',
          title: 'Anomalous High Frequency Traffic',
          severity: 'high',
          source_ip: '1.2.3.4',
          confidence: 'high',
          summary: 'Burst traffic from a single source.',
          related_rule_ids: ['high_frequency_ip'],
          recommendations: ['Enable rate limiting'],
          evidence: ['1.2.3.4 - GET /']
        }
      ],
      timeline_events: [
        {
          timestamp: '2026-06-09T10:00:00Z',
          title: 'High Frequency Activity',
          severity: 'high',
          source_ip: '1.2.3.4',
          description: 'Burst traffic detected.',
          evidence: 'GET /login HTTP/1.1" 401',
          source_file: 'web-1.log'
        }
      ],
      rule_coverage: [
        {
          rule_id: 'high_frequency_ip',
          title: 'High Frequency IP',
          severity: 'high',
          enabled: true,
          triggered: true,
          finding_count: 1,
          incident_count: 1,
          explanation: 'Detects unusually high request volumes.'
        },
        {
          rule_id: 'path_scanning',
          title: 'Path Scanning',
          severity: 'medium',
          enabled: true,
          triggered: false,
          finding_count: 0,
          incident_count: 0,
          explanation: 'Detects repeated 404 probes.'
        }
      ]
    }, {
      caseId: 'case-1',
      caseRecord: {
        id: 'case-1',
        title: 'Saved Case 1',
        source_name: 'batch:web-1.log',
        tags: ['prod', 'waf'],
        notes: 'Escalated to SecOps.',
        created_at: '2026-06-09T10:01:00Z',
        updated_at: '2026-06-09T10:02:00Z'
      },
      triageState: {
        'finding:high_frequency_ip': {
          status: 'investigating',
          priority: 'high',
          notes: 'Tracking repeated login requests.',
          updated_at: '2026-06-09T10:03:00Z'
        },
        'incident:inc-1': {
          status: 'mitigated',
          priority: 'critical',
          notes: 'Temporary block applied.',
          updated_at: '2026-06-09T10:04:00Z'
        }
      },
      caseNotes: [
        {
          id: 'note-1',
          type: 'observation',
          title: 'Observed credential stuffing pattern',
          body: 'Multiple failed logins from the same IP against the login endpoint.',
          createdAt: '2026-06-09T10:05:00Z',
          updatedAt: '2026-06-09T10:06:00Z'
        }
      ],
      language: 'en'
    })

    expect(markdown).toContain('# Analyst Evidence Pack')
    expect(markdown).toContain('## Case metadata')
    expect(markdown).toContain('**Product**: LogForenSight')
    expect(markdown).toContain('**Export type**: Analyst Evidence Pack')
    expect(markdown).toContain('**Analysis scope**: batch case')
    expect(markdown).toContain('**Findings count**: 1')
    expect(markdown).toContain('**Incidents count**: 1')
    expect(markdown).toContain('**Investigation entities count**:')
    expect(markdown).toContain('**Triage records count**: 2')
    expect(markdown).toContain('## Local-first Privacy Note')
    expect(markdown).toContain('This evidence pack was generated locally by LogForenSight.')
    expect(markdown).toContain('## Validation Summary')
    expect(markdown).toContain('**Analysis method**: deterministic local rules')
    expect(markdown).toContain('**Detection explainability**: Included when findings are available')
    expect(markdown).toContain('**Analyst triage**: Included when triage state exists')
    expect(markdown).toContain('**Evidence source**: uploaded/local log-derived analysis result')
    expect(markdown).toContain('**Raw logs**: Do not include full raw log content in this evidence pack.')
    expect(markdown).toContain('## Severity summary')
    expect(markdown).toContain('## Executive summary')
    expect(markdown).toContain('## Case record details')
    expect(markdown).toContain('## Findings list')
    expect(markdown).toContain('## Incidents list')
    expect(markdown).toContain('## Investigation entities')
    expect(markdown).toContain('## Analyst Case Notes / Decision Log')
    expect(markdown).toContain('## Investigation Review Readiness')
    expect(markdown).toContain('## Timeline highlights')
    expect(markdown).toContain('## Rule coverage')
    expect(markdown).toContain('## Triage summary')
    expect(markdown).toContain('Saved Case 1')
    expect(markdown).toContain('Tracking repeated login requests.')
    expect(markdown).toContain('Temporary block applied.')
    expect(markdown).toContain('Observed credential stuffing pattern')
    expect(markdown).toContain('Multiple failed logins from the same IP against the login endpoint.')
    expect(markdown).toContain('**Overall status**: Ready')
    expect(markdown).toContain('**High-risk findings reviewed**: Ready')
    expect(markdown).toContain('**Incidents reviewed**: Ready')
    expect(markdown).toContain('**Analyst case notes recorded**: Ready')
    expect(markdown).toContain('**Evidence Pack readiness**: Ready')
    expect(markdown).toContain('Matched rules')
    expect(markdown).toContain('Unmatched rules')
    expect(markdown).toContain('web-1.log')
    expect(markdown).toContain('IP Address')
    expect(markdown).toContain('alice')
    expect(markdown).toContain('https://portal.example.com/login')
    expect(markdown).toContain('C:\\inetpub\\wwwroot\\web.config')
  })

  it('returns fallback text instead of crashing when optional data is missing', () => {
    const markdown = buildEvidencePackMarkdown({
      summary: {},
      findings: [],
      incidents: []
    }, {
      caseId: 'case-missing',
      triageState: {},
      caseNotes: [],
      language: 'en'
    })

    expect(markdown).toContain('## Case metadata')
    expect(markdown).toContain('**Product**: LogForenSight')
    expect(markdown).toContain('**Export type**: Analyst Evidence Pack')
    expect(markdown).toContain('## Local-first Privacy Note')
    expect(markdown).toContain('## Validation Summary')
    expect(markdown).toContain('Not available')
    expect(markdown).toContain('## Findings list')
    expect(markdown).toContain('## Incidents list')
    expect(markdown).toContain('## Investigation entities')
    expect(markdown).toContain('## Analyst Case Notes / Decision Log')
    expect(markdown).toContain('## Investigation Review Readiness')
    expect(markdown).toContain('No analyst case notes recorded.')
    expect(markdown).toContain('**Evidence Pack readiness**: Attention')
    expect(markdown).toContain('## Triage summary')
  })

  it('does not break existing Evidence Pack section ordering when case notes are added', () => {
    const markdown = buildEvidencePackMarkdown({
      summary: {},
      findings: [],
      incidents: []
    }, {
      caseId: 'case-order',
      triageState: {},
      caseNotes: [{
        id: 'note-1',
        type: 'decision',
        title: 'Decision made',
        body: 'Proceed with monitoring.',
        createdAt: '2026-06-09T10:00:00Z',
        updatedAt: '2026-06-09T10:00:00Z'
      }],
      language: 'en'
    })

    expect(markdown.indexOf('## Case record details')).toBeLessThan(markdown.indexOf('## Analyst Case Notes / Decision Log'))
    expect(markdown.indexOf('## Analyst Case Notes / Decision Log')).toBeLessThan(markdown.indexOf('## Investigation Review Readiness'))
    expect(markdown.indexOf('## Investigation Review Readiness')).toBeLessThan(markdown.indexOf('## Parse stats'))
    expect(markdown.indexOf('## Parse stats')).toBeLessThan(markdown.indexOf('## Findings list'))
  })

  it('exports a fallback when review readiness is not available', () => {
    const markdown = buildEvidencePackMarkdown({
      summary: {},
      findings: [],
      incidents: []
    }, {
      caseId: 'case-no-readiness',
      triageState: {},
      caseNotes: [],
      reviewReadiness: null,
      language: 'en'
    })

    expect(markdown).toContain('## Investigation Review Readiness')
    expect(markdown).toContain('Review readiness was not available for this export.')
    expect(markdown).toContain('## Analyst Case Notes / Decision Log')
  })

  it('includes a Detection Explainability chapter with per-finding rule context, rationale and recommended action', () => {
    const markdown = buildEvidencePackMarkdown({
      summary: {
        total_requests: 120,
        unique_ips: 4,
        finding_severity_counts: { high: 1 }
      },
      findings: [
        {
          rule_id: 'high_frequency_ip',
          title: 'High Frequency IP',
          severity: 'high',
          description: 'A source IP exceeded the threshold for user=alice.',
          recommendation: 'Rate limit the source.',
          matched_count: 25,
          matched_fields: ['source_ip'],
          matched_values: ['1.2.3.4'],
          evidence: ['1.2.3.4 - GET /login HTTP/1.1" 401 src_user=alice'],
          metadata: {
            source_ip: '1.2.3.4',
            path: '/login',
            method: 'GET',
            status: '401',
            source_file: 'web-1.log'
          }
        }
      ],
      incidents: [],
      rule_coverage: [
        {
          rule_id: 'high_frequency_ip',
          title: 'High Frequency IP',
          severity: 'high',
          enabled: true,
          triggered: true,
          finding_count: 1,
          incident_count: 0,
          explanation: 'Detects unusually high request volumes from the same source.'
        }
      ]
    }, {
      caseId: 'case-2',
      triageState: {},
      language: 'en'
    })

    expect(markdown).toContain('## Detection Explainability')
    expect(markdown).toContain('**Rule ID**: high_frequency_ip')
    expect(markdown).toContain('**Rule Name**: High Frequency IP')
    expect(markdown).toContain('Detects unusually high request volumes')
    expect(markdown).toContain('HIGH')
    expect(markdown).toContain('**Recommended Analyst Action**')
    expect(markdown).toContain('Prioritize review')
    expect(markdown).toContain('**Related IOCs / Investigation Entities**')
    expect(markdown).toContain('1.2.3.4')
    expect(markdown).toContain('**Matched Indicator / Keyword / Regex Hints**')
  })

  it('renders a Chinese explainability chapter when language is zh', () => {
    setLanguage('zh')
    const markdown = buildEvidencePackMarkdown({
      summary: {},
      findings: [
        {
          rule_id: 'high_frequency_ip',
          title: '高频访问',
          severity: 'high',
          description: '超出阈值',
          recommendation: '限流',
          matched_count: 10,
          matched_fields: ['source_ip'],
          matched_values: ['1.2.3.4'],
          evidence: ['1.2.3.4 - GET /login HTTP/1.1" 401'],
          metadata: { source_ip: '1.2.3.4' }
        }
      ],
      incidents: []
    }, {
      caseId: 'case-zh',
      triageState: {},
      caseNotes: [],
      language: 'zh'
    })

    expect(markdown).toContain('## 检测可解释性 (Detection Explainability)')
    expect(markdown).toContain('**规则 ID**')
    expect(markdown).toContain('**规则名称**')
    expect(markdown).toContain('**严重程度判定依据**')
    expect(markdown).toContain('**推荐分析师操作**')
    expect(markdown).toContain('**相关调查实体 (Related IOCs / Entities)**')
  })

  it('falls back to Not available inside the explainability chapter when finding data is missing', () => {
    const markdown = buildEvidencePackMarkdown({
      summary: {},
      findings: [
        {
          rule_id: '',
          title: '',
          severity: 'low',
          description: '',
          recommendation: '',
          evidence: [],
          matched_count: 0,
          matched_fields: [],
          matched_values: []
        }
      ],
      incidents: []
    }, {
      caseId: 'case-empty',
      triageState: {},
      language: 'en'
    })

    expect(markdown).toContain('## Detection Explainability')
    expect(markdown).toContain('**Severity Rationale**')
    expect(markdown).toContain('**Recommended Analyst Action**')
    expect(markdown).toContain('Document the observation')
  })
})
