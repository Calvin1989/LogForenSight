import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import EvidencePackExportPreview from '../components/EvidencePackExportPreview.vue'
import { setLanguage } from '../i18n'

const sampleResult = {
  analysis_mode: 'single',
  summary: {
    total_requests: 20,
    unique_ips: 1,
    total_4xx: 3,
    total_5xx: 0,
    finding_severity_counts: { high: 1 },
    incident_severity_counts: { high: 1 }
  },
  executive_summary: {
    headline: 'Suspicious traffic detected',
    overall_risk_level: 'high',
    risk_score: 88,
    overview: 'Potential brute force activity was observed.',
    key_metrics: ['1 finding', '1 incident']
  },
  parse_stats: {
    total_lines: 20,
    parsed_lines: 20,
    skipped_lines: 0,
    parse_rate: 1,
    detected_format: 'nginx',
    requested_format: 'auto',
    source_files: [
      {
        filename: 'access.log',
        total_lines: 20,
        parsed_lines: 20,
        skipped_lines: 0,
        parse_rate: 1,
        detected_format: 'nginx'
      }
    ]
  },
  findings: [
    {
      rule_id: 'high_frequency_ip',
      title: 'Suspicious traffic',
      severity: 'high',
      description: 'Burst activity detected.',
      recommendation: 'Review the source.',
      matched_count: 4,
      matched_fields: ['source_ip'],
      matched_values: ['1.2.3.4'],
      evidence: ['1.2.3.4 - - [10/Jun/2026:10:00:00 +0000] "GET /login HTTP/1.1" 401']
    }
  ],
  incidents: [
    {
      incident_id: 'inc-1',
      title: 'Incident 1',
      severity: 'high',
      source_ip: '1.2.3.4',
      confidence: 'high',
      summary: 'Grouped suspicious activity.',
      related_rule_ids: ['high_frequency_ip'],
      recommendations: ['Review incident'],
      evidence: ['Sample incident evidence']
    }
  ],
  timeline_events: [],
  rule_coverage: [
    {
      rule_id: 'high_frequency_ip',
      title: 'High Frequency IP',
      severity: 'high',
      enabled: true,
      triggered: true,
      finding_count: 1,
      incident_count: 1,
      explanation: 'Detects burst traffic.'
    }
  ]
}

const sampleProps = {
  result: sampleResult,
  triageState: {
    'finding:high_frequency_ip': {
      status: 'investigating',
      priority: 'high',
      notes: 'Analyst review in progress.'
    },
    'incident:inc-1': {
      status: 'mitigated',
      priority: 'high',
      notes: 'Source blocked.'
    }
  },
  caseNotes: [
    {
      id: 'note-1',
      type: 'observation',
      title: 'Credential abuse pattern',
      body: 'Repeated failed logins observed.',
      createdAt: '2026-06-10T10:00:00Z',
      updatedAt: '2026-06-10T10:05:00Z'
    }
  ],
  caseId: 'case-1'
}

describe('EvidencePackExportPreview.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })

    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false)
    })
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders empty state when no result', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        result: null,
        triageState: {},
        caseNotes: [],
        caseId: 'current-analysis'
      }
    })

    expect(wrapper.text()).toContain('Evidence Pack Export Preview')
    expect(wrapper.text()).toContain('Run an analysis to preview the Evidence Pack export.')
  })

  it('renders title', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    expect(wrapper.text()).toContain('Evidence Pack Export Preview')
  })

  it('toggles preview open and closed', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    expect(wrapper.find('[data-testid="evidence-pack-preview"]').exists()).toBe(false)

    await wrapper.find('.preview-btn').trigger('click')
    expect(wrapper.find('[data-testid="evidence-pack-preview"]').exists()).toBe(true)

    await wrapper.find('.preview-btn').trigger('click')
    expect(wrapper.find('[data-testid="evidence-pack-preview"]').exists()).toBe(false)
  })

  it('preview contains Evidence Pack Markdown title and content', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    await wrapper.find('.preview-btn').trigger('click')

    const preview = wrapper.find('[data-testid="evidence-pack-preview"]')
    expect(preview.text()).toContain('# Analyst Evidence Pack')
    expect(preview.text()).toContain('Suspicious traffic')
    expect(preview.text()).toContain('## Investigation Review Readiness')
    expect(preview.text()).toContain('## Evidence Pack Quality Score')
    expect(preview.text()).toContain('## Evidence Pack Export Guardrails')
  })

  it('copy button calls clipboard writeText when available', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    await wrapper.find('.copy-btn').trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('# Analyst Evidence Pack'))
    expect(wrapper.text()).toContain('Markdown copied.')
  })

  it('copy failure fallback does not throw', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('clipboard unavailable'))
      }
    })

    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false)
    })

    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    await wrapper.find('.copy-btn').trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(wrapper.text()).toContain('Copy failed. Please select and copy manually.')
  })
})
