import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import EvidencePackExportPreview from '../components/EvidencePackExportPreview.vue'
import { setLanguage } from '../i18n'
import { buildEvidencePackMarkdown } from '../utils/evidencePackExport'
import { buildEvidencePackExportGuardrails } from '../utils/evidencePackExportGuardrails'
import { buildEvidencePackQuality } from '../utils/evidencePackQuality'
import { buildEvidencePackShareSafety } from '../utils/evidencePackShareSafety'
import { buildReviewReadiness } from '../utils/reviewReadiness'

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

const sampleReviewReadiness = buildReviewReadiness({
  result: sampleResult,
  triageState: sampleProps.triageState,
  caseNotes: sampleProps.caseNotes
})

const sampleEvidencePackQuality = buildEvidencePackQuality({
  result: sampleResult,
  triageState: sampleProps.triageState,
  caseNotes: sampleProps.caseNotes,
  reviewReadiness: sampleReviewReadiness
})

const sampleExportGuardrails = buildEvidencePackExportGuardrails({
  quality: sampleEvidencePackQuality,
  reviewReadiness: sampleReviewReadiness,
  result: sampleResult,
  triageState: sampleProps.triageState,
  caseNotes: sampleProps.caseNotes
})

const sampleShareSafetyMarkdown = buildEvidencePackMarkdown(sampleResult, {
  caseId: sampleProps.caseId,
  triageState: sampleProps.triageState,
  caseNotes: sampleProps.caseNotes,
  reviewReadiness: sampleReviewReadiness,
  evidencePackQuality: sampleEvidencePackQuality,
  evidencePackExportGuardrails: sampleExportGuardrails,
  language: 'en'
})

const sampleShareSafety = buildEvidencePackShareSafety({
  markdown: sampleShareSafetyMarkdown,
  result: sampleResult
})

sampleProps.reviewReadiness = sampleReviewReadiness
sampleProps.evidencePackQuality = sampleEvidencePackQuality
sampleProps.exportGuardrails = sampleExportGuardrails
sampleProps.shareSafety = sampleShareSafety

describe('EvidencePackExportPreview.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-11T10:45:46Z'))

    localStorage.clear()
    setLanguage('en')

    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn()
    })

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
    vi.useRealTimers()
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
    expect(wrapper.find('[data-testid="copy-section-button"]').exists()).toBe(false)
  })

  it('renders title', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    expect(wrapper.text()).toContain('Evidence Pack Export Preview')
  })

  it('renders handoff summary bar with four status entries', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    const summaryBar = wrapper.find('[data-testid="evidence-pack-handoff-summary-bar"]')
    expect(summaryBar.exists()).toBe(true)
    expect(summaryBar.text()).toContain('Handoff summary')
    expect(summaryBar.text()).toContain('Investigation Review Readiness')
    expect(summaryBar.text()).toContain('Evidence Pack Quality Score')
    expect(summaryBar.text()).toContain('Evidence Pack Export Guardrails')
    expect(summaryBar.text()).toContain('Evidence Pack Share Safety Review')
  })

  it('renders an export manifest card with key metadata and closure summary', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    const manifestCard = wrapper.find('[data-testid="evidence-pack-export-manifest"]')
    expect(manifestCard.exists()).toBe(true)
    expect(manifestCard.text()).toContain('Export manifest')
    expect(manifestCard.text()).toContain('Generated at')
    expect(manifestCard.text()).toContain('Source counts')
    expect(manifestCard.text()).toContain('Status summary')
    expect(manifestCard.text()).toContain('Closure summary')
    expect(manifestCard.text()).toContain('Findings')
    expect(manifestCard.text()).toContain('Incidents')
    expect(manifestCard.text()).toContain('Gap count')
    expect(manifestCard.text()).toContain('Next action count')
    expect(manifestCard.text()).toContain('Export compatibility')
    expect(manifestCard.text()).toContain('Compatible')
    expect(manifestCard.text()).toContain('Only low-risk manifest fields are eligible for future export')
    expect(manifestCard.text()).toContain('2026-06-11T10:45:46.000Z')
  })

  it('renders neutral handoff summary states when upstream data is unavailable', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        ...sampleProps,
        reviewReadiness: null,
        evidencePackQuality: null,
        exportGuardrails: null,
        shareSafety: null
      }
    })

    const summaryBar = wrapper.find('[data-testid="evidence-pack-handoff-summary-bar"]')
    expect(summaryBar.exists()).toBe(true)
    expect(summaryBar.text()).toContain('Not available')
    expect(summaryBar.text()).toContain('Status unavailable')
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

  it('renders a section navigator with key Evidence Pack entries', async () => {
    const shareSafetyTarget = document.createElement('div')
    shareSafetyTarget.id = 'evidence-pack-share-safety'
    document.body.appendChild(shareSafetyTarget)

    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        ...sampleProps,
        shareSafetyTargetId: 'evidence-pack-share-safety'
      }
    })

    await wrapper.find('.preview-btn').trigger('click')

    const navigatorPanel = wrapper.find('[data-testid="evidence-pack-section-navigator"]')
    expect(navigatorPanel.exists()).toBe(true)
    expect(navigatorPanel.text()).toContain('Section navigator')
    expect(navigatorPanel.text()).toContain('Investigation Review Readiness')
    expect(navigatorPanel.text()).toContain('Evidence Pack Quality Score')
    expect(navigatorPanel.text()).toContain('Evidence Pack Export Guardrails')
    expect(navigatorPanel.text()).toContain('Evidence Pack Share Safety Review')

    const qualityButton = navigatorPanel.findAll('button').find((button) => {
      return button.text().includes('Evidence Pack Quality Score')
    })
    const qualitySection = wrapper.find('#evidence-pack-preview-quality-score')

    expect(qualityButton).toBeTruthy()
    expect(qualitySection.exists()).toBe(true)
    await qualityButton.trigger('click')

    wrapper.unmount()
    shareSafetyTarget.remove()
  })

  it('omits missing navigator targets without crashing the preview UI', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        ...sampleProps,
        shareSafetyTargetId: 'missing-share-safety-section'
      }
    })

    await wrapper.find('.preview-btn').trigger('click')

    const navigatorPanel = wrapper.find('[data-testid="evidence-pack-section-navigator"]')
    expect(navigatorPanel.exists()).toBe(true)
    expect(navigatorPanel.text()).not.toContain('Evidence Pack Share Safety Review')
    expect(wrapper.find('[data-testid="evidence-pack-preview"]').text()).toContain('# Analyst Evidence Pack')
  })

  it('copy button calls clipboard writeText when available', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        ...sampleProps,
        shareSafetyTargetId: 'missing-share-safety-section'
      }
    })

    await wrapper.find('.preview-btn').trigger('click')

    await wrapper.find('.copy-btn').trigger('click')
    await flushPromises()

    const expectedMarkdown = buildEvidencePackMarkdown(sampleResult, {
      caseId: sampleProps.caseId,
      triageState: sampleProps.triageState,
      caseNotes: sampleProps.caseNotes,
      reviewReadiness: sampleProps.reviewReadiness,
      evidencePackQuality: sampleProps.evidencePackQuality,
      evidencePackExportGuardrails: sampleProps.exportGuardrails,
      language: 'en'
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedMarkdown)
    expect(navigator.clipboard.writeText.mock.calls[0][0]).not.toContain('Section navigator')
    expect(navigator.clipboard.writeText.mock.calls[0][0]).not.toContain('Evidence Pack Share Safety Review')
    expect(navigator.clipboard.writeText.mock.calls[0][0]).not.toContain('Handoff summary')
    expect(navigator.clipboard.writeText.mock.calls[0][0]).not.toContain('Export manifest')
    expect(navigator.clipboard.writeText.mock.calls[0][0]).not.toContain('Export compatibility')
    expect(wrapper.text()).toContain('Markdown copied.')
  })

  it('renders copy section actions for parsed markdown sections and copies only the targeted section content', async () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: sampleProps
    })

    await wrapper.find('.preview-btn').trigger('click')

    const qualitySection = wrapper.find('[data-section-key="quality-score"]')
    expect(qualitySection.exists()).toBe(true)
    expect(qualitySection.find('[data-testid="copy-section-button"]').exists()).toBe(true)

    await qualitySection.find('[data-testid="copy-section-button"]').trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)

    const copiedSection = navigator.clipboard.writeText.mock.calls[0][0]
    expect(copiedSection).toContain('## Evidence Pack Quality Score')
    expect(copiedSection).toContain('### Checklist item results')
    expect(copiedSection).not.toContain('## Investigation Review Readiness')
    expect(copiedSection).not.toContain('## Evidence Pack Export Guardrails')
    expect(copiedSection).not.toContain('Section navigator')
    expect(copiedSection).not.toContain('Copy section')
    expect(copiedSection).not.toContain('Handoff summary')
    expect(copiedSection).not.toContain('Export manifest')
    expect(copiedSection).not.toContain('Export compatibility')
    expect(wrapper.text()).toContain('Section copied.')
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

  it('shows section copy fallback feedback without affecting full markdown copy feedback', async () => {
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

    await wrapper.find('.preview-btn').trigger('click')

    const qualitySection = wrapper.find('[data-section-key="quality-score"]')
    await qualitySection.find('[data-testid="copy-section-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Section copy failed. Please select and copy manually.')
    expect(wrapper.text()).not.toContain('Markdown copied.')
  })
})
