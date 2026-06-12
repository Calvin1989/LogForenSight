import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, ref } from 'vue'
import { setLanguage } from '../i18n'

function makeStub(testId, propNames = [], textFactory) {
  return defineComponent({
    inheritAttrs: true,
    props: propNames,
    setup(props, { attrs }) {
      return () => h(
        'div',
        {
          ...attrs,
          'data-testid': testId
        },
        textFactory ? textFactory(props, attrs) : testId
      )
    }
  })
}

const hoisted = vi.hoisted(() => ({
  state: {},
  handlers: {
    handleAnalyze: vi.fn(async () => {}),
    handleApplyTuning: vi.fn(async () => {}),
    handleResetTuning: vi.fn(),
    handleRestoreRecord: vi.fn(),
    handleClearHistory: vi.fn(),
    handleSaveCase: vi.fn(),
    handleRefreshCases: vi.fn(),
    clearCurrentResult: vi.fn(),
    handleDownloadSanitized: vi.fn()
  },
  getTriageStateMock: vi.fn(() => ({})),
  loadCaseNotesMock: vi.fn(() => []),
  buildReviewReadinessMock: vi.fn(() => ({
    status: 'ready',
    summary: {
      requiredBlockers: 0,
      highRiskFindings: { reviewed: 1, total: 1 },
      incidents: { reviewed: 1, total: 1 }
    },
    checks: []
  })),
  buildEvidencePackQualityMock: vi.fn(() => ({
    score: 95,
    status: 'ready',
    summary: { maxScore: 100, totalChecks: 4, passedChecks: 4 },
    checks: []
  })),
  buildEvidencePackExportGuardrailsMock: vi.fn(() => ({
    decision: 'ready',
    severity: 'success',
    summaryKey: 'evidencePackGuardrails.noBlockers',
    blockers: [],
    recommendations: []
  })),
  buildEvidencePackMarkdownMock: vi.fn(() => '# Analyst Evidence Pack\n\n## Evidence Pack Quality Score\nReady'),
  buildEvidencePackShareSafetyMock: vi.fn(() => ({
    status: 'safe',
    summaryKey: 'evidencePackShareSafety.noFindings',
    findings: [],
    warnings: [],
    recommendations: []
  }))
}))

hoisted.state.loading = ref(false)
hoisted.state.result = ref(null)
hoisted.state.currentCaseId = ref('current-analysis')
hoisted.state.caseNotesContextId = ref('analysis-test-context')
hoisted.state.error = ref(null)
hoisted.state.selectedFile = ref(null)
hoisted.state.sanitizingReport = ref(false)
hoisted.state.rules = ref({
  source: 'default',
  high_frequency_threshold: 10,
  path_scanning_404_threshold: 5,
  sensitive_paths: ['/admin'],
  suspicious_user_agents: ['sqlmap']
})
hoisted.state.rulesError = ref(null)
hoisted.state.recentAnalyses = ref([])
hoisted.state.savedCases = ref([])
hoisted.state.tuningWarnings = ref([])
hoisted.state.isSanitizedAvailable = computed(() => true)

vi.mock('../composables/useAnalysisState', () => ({
  useAnalysisState: () => ({
    ...hoisted.state,
    ...hoisted.handlers
  })
}))

vi.mock('../utils/localizedAnalysis', () => ({
  localizeAnalysisForDisplay: (value) => value
}))

vi.mock('../utils/triageStorage', () => ({
  getTriageState: (...args) => hoisted.getTriageStateMock(...args)
}))

vi.mock('../utils/caseNotesStorage', () => ({
  loadCaseNotes: (...args) => hoisted.loadCaseNotesMock(...args)
}))

vi.mock('../utils/reviewReadiness', () => ({
  buildReviewReadiness: (...args) => hoisted.buildReviewReadinessMock(...args)
}))

vi.mock('../utils/evidencePackQuality', () => ({
  buildEvidencePackQuality: (...args) => hoisted.buildEvidencePackQualityMock(...args)
}))

vi.mock('../utils/evidencePackExportGuardrails', () => ({
  buildEvidencePackExportGuardrails: (...args) => hoisted.buildEvidencePackExportGuardrailsMock(...args)
}))

vi.mock('../utils/evidencePackExport', () => ({
  buildEvidencePackMarkdown: (...args) => hoisted.buildEvidencePackMarkdownMock(...args)
}))

vi.mock('../utils/evidencePackShareSafety', () => ({
  buildEvidencePackShareSafety: (...args) => hoisted.buildEvidencePackShareSafetyMock(...args)
}))

vi.mock('../components/LanguageToggle.vue', () => ({
  default: makeStub('language-toggle')
}))
vi.mock('../components/FileUpload.vue', () => ({
  default: makeStub('file-upload')
}))
vi.mock('../components/RecentAnalyses.vue', () => ({
  default: makeStub('recent-analyses')
}))
vi.mock('../components/CaseWorkspace.vue', () => ({
  default: makeStub('case-workspace')
}))
vi.mock('../components/ReportComparison.vue', () => ({
  default: makeStub('report-comparison')
}))
vi.mock('../components/RuleConfigPanel.vue', () => ({
  default: makeStub('rule-config-panel')
}))
vi.mock('../components/RuleTuningPanel.vue', () => ({
  default: makeStub('rule-tuning-panel')
}))
vi.mock('../components/SummaryCards.vue', () => ({
  default: makeStub('summary-cards')
}))
vi.mock('../components/ExecutiveSummary.vue', () => ({
  default: makeStub('executive-summary')
}))
vi.mock('../components/SeverityDistribution.vue', () => ({
  default: makeStub('severity-distribution')
}))
vi.mock('../components/ParseStatsCard.vue', () => ({
  default: makeStub('parse-stats-card')
}))
vi.mock('../components/InvestigationEntities.vue', () => ({
  default: makeStub('investigation-entities')
}))
vi.mock('../components/TopList.vue', () => ({
  default: makeStub('top-list')
}))
vi.mock('../components/TimelineView.vue', () => ({
  default: makeStub('timeline-view')
}))
vi.mock('../components/IncidentsList.vue', () => ({
  default: makeStub('incidents-list')
}))
vi.mock('../components/FindingsList.vue', () => ({
  default: makeStub('findings-list')
}))
vi.mock('../components/TriagePanel.vue', () => ({
  default: makeStub('triage-panel', ['caseId', 'analysisResult'])
}))
vi.mock('../components/CaseNotesPanel.vue', () => ({
  default: makeStub('case-notes-panel')
}))
vi.mock('../components/ReviewReadinessPanel.vue', () => ({
  default: makeStub('review-readiness-panel')
}))
vi.mock('../components/CaseClosureChecklist.vue', () => ({
  default: makeStub('case-closure-checklist', ['shareSafety'])
}))
vi.mock('../components/EvidencePackQualityScore.vue', () => ({
  default: makeStub('evidence-pack-quality-score', ['triageState'], (props) => `triage:${Object.keys(props.triageState || {}).length}`)
}))
vi.mock('../components/EvidencePackExportGuardrails.vue', () => ({
  default: makeStub('evidence-pack-export-guardrails')
}))
vi.mock('../components/EvidencePackShareSafety.vue', () => ({
  default: makeStub('evidence-pack-share-safety')
}))
vi.mock('../components/EvidencePackExportPreview.vue', () => ({
  default: makeStub('evidence-pack-export-preview', ['shareSafetyTargetId'], (props) => `share-target:${props.shareSafetyTargetId}`)
}))
vi.mock('../components/MarkdownReport.vue', () => ({
  default: makeStub('markdown-report')
}))
vi.mock('../components/RuleCoverage.vue', () => ({
  default: makeStub('rule-coverage')
}))

const sampleResult = {
  summary: {
    finding_severity_counts: { HIGH: 1 },
    incident_severity_counts: { HIGH: 1 },
    top_ips: [{ ip: '1.1.1.1' }],
    top_paths: [{ path: '/admin' }]
  },
  executive_summary: {
    overall_risk_level: 'HIGH'
  },
  parse_stats: {
    parse_rate: 0.98,
    total_lines: 100,
    parsed_lines: 98,
    skipped_lines: 2
  },
  findings: [{ rule_id: 'RULE-1', title: 'Finding 1' }],
  incidents: [{ id: 'INC-1', incident_id: 'INC-1', title: 'Incident 1' }],
  timeline_events: [{ timestamp: '2026-06-12T00:00:00Z', title: 'Event' }],
  rule_coverage: [{ rule_id: 'RULE-1', title: 'Rule 1', severity: 'high', enabled: true, triggered: true }],
  report_markdown: '# Report'
}

let App

function resetState() {
  hoisted.state.loading.value = false
  hoisted.state.result.value = null
  hoisted.state.currentCaseId.value = 'current-analysis'
  hoisted.state.caseNotesContextId.value = 'analysis-test-context'
  hoisted.state.error.value = null
  hoisted.state.selectedFile.value = null
  hoisted.state.sanitizingReport.value = false
  hoisted.state.rules.value = {
    source: 'default',
    high_frequency_threshold: 10,
    path_scanning_404_threshold: 5,
    sensitive_paths: ['/admin'],
    suspicious_user_agents: ['sqlmap']
  }
  hoisted.state.rulesError.value = null
  hoisted.state.recentAnalyses.value = []
  hoisted.state.savedCases.value = []
  hoisted.state.tuningWarnings.value = []

  hoisted.handlers.handleAnalyze.mockClear()
  hoisted.handlers.handleApplyTuning.mockClear()
  hoisted.handlers.handleResetTuning.mockClear()
  hoisted.handlers.handleRestoreRecord.mockClear()
  hoisted.handlers.handleClearHistory.mockClear()
  hoisted.handlers.handleSaveCase.mockClear()
  hoisted.handlers.handleRefreshCases.mockClear()
  hoisted.handlers.clearCurrentResult.mockClear()
  hoisted.handlers.handleDownloadSanitized.mockClear()

  hoisted.getTriageStateMock.mockReset()
  hoisted.getTriageStateMock.mockReturnValue({})
  hoisted.loadCaseNotesMock.mockReset()
  hoisted.loadCaseNotesMock.mockReturnValue([])
  hoisted.buildReviewReadinessMock.mockClear()
  hoisted.buildEvidencePackQualityMock.mockClear()
  hoisted.buildEvidencePackExportGuardrailsMock.mockClear()
  hoisted.buildEvidencePackMarkdownMock.mockClear()
  hoisted.buildEvidencePackShareSafetyMock.mockClear()
}

describe('App.vue workspace shell', () => {
  beforeEach(async () => {
    App = (await import('../App.vue')).default
    localStorage.clear()
    setLanguage('en')
    resetState()
  })

  it('defaults to workspace view, shows navigation, and disables result-only views without a result', () => {
    const wrapper = mount(App)

    expect(wrapper.get('[data-testid="workspace-shell"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workspace-nav"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workspace-view-workspace"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Start a fresh investigation here')
    expect(wrapper.find('[data-testid="workspace-view-overview"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="workspace-nav-overview"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="workspace-nav-investigation"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="workspace-nav-evidencePack"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="workspace-nav-markdownReport"]').attributes('disabled')).toBeDefined()
  })

  it('switches between enabled views and renders grouped components when a result exists', async () => {
    hoisted.state.result.value = sampleResult

    const wrapper = mount(App)

    await wrapper.get('[data-testid="workspace-nav-overview"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-overview"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="summary-cards"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="parse-stats-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('high-level risk picture')

    await wrapper.get('[data-testid="workspace-nav-investigation"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-investigation"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="timeline-view"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="rule-coverage"]').exists()).toBe(true)

    await wrapper.get('[data-testid="workspace-nav-triageReview"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-triageReview"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="triage-panel"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="case-closure-checklist"]').exists()).toBe(true)

    await wrapper.get('[data-testid="workspace-nav-evidencePack"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-evidencePack"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="evidence-pack-quality-score"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="evidence-pack-export-preview"]').exists()).toBe(true)

    await wrapper.get('[data-testid="workspace-nav-markdownReport"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-markdownReport"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="markdown-report"]').exists()).toBe(true)

    await wrapper.get('[data-testid="workspace-nav-rules"]').trigger('click')
    expect(wrapper.get('[data-testid="workspace-view-rules"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="rule-config-panel"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="rule-tuning-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Inspect rules and tuning settings')
  })

  it('hydrates triageState in App even before triage view mounts', async () => {
    hoisted.state.result.value = sampleResult
    hoisted.getTriageStateMock.mockReturnValue({
      'finding:RULE-1': { status: 'mitigated', priority: 'high' }
    })

    const wrapper = mount(App)

    expect(wrapper.find('[data-testid="triage-panel"]').exists()).toBe(false)

    await wrapper.get('[data-testid="workspace-nav-evidencePack"]').trigger('click')

    expect(wrapper.get('[data-testid="evidence-pack-quality-score"]').text()).toContain('triage:1')
  })

  it('keeps share safety and preview together in evidencePack view and preserves the anchor target id', async () => {
    hoisted.state.result.value = sampleResult

    const wrapper = mount(App)

    await wrapper.get('[data-testid="workspace-nav-evidencePack"]').trigger('click')

    const shareSafety = wrapper.get('#evidence-pack-share-safety')
    const preview = wrapper.get('[data-testid="evidence-pack-export-preview"]')

    expect(shareSafety.exists()).toBe(true)
    expect(preview.text()).toContain('share-target:evidence-pack-share-safety')
  })
})
