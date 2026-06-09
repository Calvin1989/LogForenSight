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
      language: 'en'
    })

    expect(markdown).toContain('# Analyst Evidence Pack')
    expect(markdown).toContain('## Severity summary')
    expect(markdown).toContain('## Executive summary')
    expect(markdown).toContain('## Case metadata')
    expect(markdown).toContain('## Findings list')
    expect(markdown).toContain('## Incidents list')
    expect(markdown).toContain('## Investigation entities')
    expect(markdown).toContain('## Timeline highlights')
    expect(markdown).toContain('## Rule coverage')
    expect(markdown).toContain('## Triage summary')
    expect(markdown).toContain('Saved Case 1')
    expect(markdown).toContain('Tracking repeated login requests.')
    expect(markdown).toContain('Temporary block applied.')
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
      language: 'en'
    })

    expect(markdown).toContain('Not available')
    expect(markdown).toContain('## Findings list')
    expect(markdown).toContain('## Incidents list')
    expect(markdown).toContain('## Investigation entities')
    expect(markdown).toContain('## Triage summary')
  })
})
