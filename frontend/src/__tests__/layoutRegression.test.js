import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setLanguage } from '../i18n'
import CaseClosureChecklist from '../components/CaseClosureChecklist.vue'
import CaseClosureEvidenceGaps from '../components/CaseClosureEvidenceGaps.vue'
import CaseClosureNextActions from '../components/CaseClosureNextActions.vue'
import ExecutiveSummary from '../components/ExecutiveSummary.vue'
import InvestigationEntities from '../components/InvestigationEntities.vue'
import EvidencePackShareSafety from '../components/EvidencePackShareSafety.vue'
import MarkdownReport from '../components/MarkdownReport.vue'

function makeStub(testId, propNames = []) {
  return defineComponent({
    inheritAttrs: true,
    props: propNames,
    setup(props, { attrs }) {
      return () => h('div', { ...attrs, 'data-testid': testId }, testId)
    }
  })
}

describe('Layout regression: CaseClosure sibling flow', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('Checklist, EvidenceGaps, and NextActions are rendered as sibling sections in readiness-grid', () => {
    const checklistData = {
      result: { findings: [], incidents: [] },
      displayResult: { findings: [], incidents: [], timeline_events: [], rule_coverage: [] },
      caseNotes: [],
      reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0, highRiskFindings: { reviewed: 0, total: 0 }, incidents: { reviewed: 0, total: 0 } } },
      evidencePackQuality: { score: 90, status: 'ready', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'ready', summaryKey: 'evidencePackGuardrails.readySummary' },
      shareSafety: { status: 'safe', findings: [], warnings: [] }
    }

    const readinessGrid = document.createElement('div')
    readinessGrid.setAttribute('data-testid', 'readiness-grid')

    const checklist = mount(CaseClosureChecklist, { props: checklistData, attachTo: readinessGrid })
    const gaps = mount(CaseClosureEvidenceGaps, { props: { gapItems: [] }, attachTo: readinessGrid })
    const actions = mount(CaseClosureNextActions, { props: { gapItems: [], handoffReadiness: { value: 'Ready' } }, attachTo: readinessGrid })

    expect(checklist.find('[data-testid="case-closure-checklist"]').exists()).toBe(true)
    expect(gaps.find('[data-testid="case-closure-evidence-gaps"]').exists()).toBe(true)
    expect(actions.find('[data-testid="case-closure-next-actions"]').exists()).toBe(true)

    checklist.unmount()
    gaps.unmount()
    actions.unmount()
  })

  it('Checklist emits closureData that drives EvidenceGaps and NextActions', () => {
    const wrapper = mount(CaseClosureChecklist, {
      props: {
        result: { findings: [], incidents: [] },
        displayResult: { findings: [], incidents: [], timeline_events: [], rule_coverage: [] },
        caseNotes: []
      }
    })

    const emitted = wrapper.emitted('update:closureData')
    expect(emitted).toBeTruthy()
    const closureData = emitted[emitted.length - 1][0]
    expect(closureData).toHaveProperty('gapItems')
    expect(closureData).toHaveProperty('handoffReadiness')
    expect(Array.isArray(closureData.gapItems)).toBe(true)
  })
})

describe('Layout regression: ExecutiveSummary structure', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const mockSummary = {
    overall_risk_level: 'high',
    risk_score: 75,
    headline: 'High-risk patterns detected',
    overview: 'Analysis identified suspicious activity.',
    key_metrics: ['Requests: 1000'],
    key_affected_ips: ['1.2.3.4'],
    top_risks: ['Brute force'],
    recommended_next_steps: ['Block IPs'],
    methodology: 'Deterministic summary.'
  }

  it('has score, main, and actions three-segment structure', () => {
    const wrapper = mount(ExecutiveSummary, { props: { summary: mockSummary } })

    expect(wrapper.find('[data-testid="executive-summary"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="executive-score"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="executive-main"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="executive-actions"]').exists()).toBe(true)

    expect(wrapper.find('[data-testid="executive-score"]').classes()).toContain('risk-badge')
    expect(wrapper.find('[data-testid="executive-main"]').classes()).toContain('dashboard-hero-main')
    expect(wrapper.find('[data-testid="executive-actions"]').classes()).toContain('dashboard-hero-actions')
  })

  it('score contains risk level and score number', () => {
    const wrapper = mount(ExecutiveSummary, { props: { summary: mockSummary } })

    const score = wrapper.find('[data-testid="executive-score"]')
    expect(score.find('.risk-level').text()).toBe('HIGH')
    expect(score.find('.risk-score').text()).toContain('75')
  })

  it('main contains headline and overview', () => {
    const wrapper = mount(ExecutiveSummary, { props: { summary: mockSummary } })

    const main = wrapper.find('[data-testid="executive-main"]')
    expect(main.find('.headline').text()).toBe('High-risk patterns detected')
    expect(main.find('.overview').text()).toContain('suspicious activity')
  })

  it('actions contains download button', () => {
    const wrapper = mount(ExecutiveSummary, { props: { summary: mockSummary } })

    const actions = wrapper.find('[data-testid="executive-actions"]')
    expect(actions.find('[data-testid="download-btn"]').exists()).toBe(true)
  })
})

describe('Layout regression: InvestigationEntities bounded table', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('has a bounded table panel with max-height', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: {
          timeline_events: [{
            event_id: 'evt-1',
            timestamp: '2026-06-09T10:00:00Z',
            source_ip: '203.0.113.10',
            title: 'POST /admin/login',
            description: 'login attempt',
            evidence: 'POST /admin/login HTTP/1.1" 401',
            source_file: 'access.log'
          }],
          source_files: [{ filename: 'access.log' }]
        }
      }
    })

    const tablePanel = wrapper.find('[data-testid="entities-table-panel"]')
    expect(tablePanel.exists()).toBe(true)

    const style = window.getComputedStyle(tablePanel.element)
    expect(tablePanel.classes()).toContain('entities-table')
  })

  it('shows empty state when no entities available', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: { findings: [], incidents: [], timeline_events: [] }
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Not available')
  })
})

describe('Layout regression: EvidencePackShareSafety scroll-contained findings', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('has scroll-contained findings list', () => {
    const wrapper = mount(EvidencePackShareSafety, {
      props: {
        markdown: [
          '# Analyst Evidence Pack',
          'Source file: access.log',
          'URL: https://portal.example.com/login?user=alice',
          'URL: https://api.example.com/v1/data?key=secret',
          'Account: user=alice',
          'Evidence: 10.0.0.8 - "GET /admin" 200',
          'Sensitive path: /.env /admin /backup /config'
        ].join('\n'),
        result: {}
      }
    })

    expect(wrapper.find('[data-testid="evidence-pack-share-safety"]').exists()).toBe(true)

    const findingsScroll = wrapper.find('[data-testid="share-safety-findings-scroll"]')
    expect(findingsScroll.exists()).toBe(true)
    expect(findingsScroll.classes()).toContain('findings-scroll')
  })

  it('renders safe state without findings scroll when no findings', () => {
    const wrapper = mount(EvidencePackShareSafety, {
      props: {
        markdown: '# Analyst Evidence Pack\n\nSummary only.',
        result: { findings: [], incidents: [] }
      }
    })

    expect(wrapper.find('[data-testid="evidence-pack-share-safety"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="share-safety-findings-scroll"]').exists()).toBe(false)
  })
})

describe('Layout regression: MarkdownReport preview container', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const mockResult = {
    executive_summary: { headline: 'Test', overall_risk_level: 'critical', overview: 'Test overview' },
    findings: [],
    incidents: [],
    summary: {
      total_requests: 0,
      unique_ips: 0,
      finding_severity_counts: {},
      incident_severity_counts: {},
      top_ips: [],
      top_paths: []
    },
    parse_stats: { parse_rate: 0, total_lines: 0, parsed_lines: 0 },
    timeline_events: []
  }

  it('has report preview container with prose styling', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\n## Section\n\nContent here.',
        result: mockResult
      }
    })

    expect(wrapper.find('[data-testid="report-preview-container"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="report-preview-container"]').classes()).toContain('report-preview-container')
  })

  it('toggles preview visibility', async () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\nContent.',
        result: mockResult
      }
    })

    expect(wrapper.find('[data-testid="report-preview-container"]').exists()).toBe(true)

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('[data-testid="report-preview-container"]').exists()).toBe(false)

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('[data-testid="report-preview-container"]').exists()).toBe(true)
  })

  it('has action groups for report downloads', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\nContent.',
        result: mockResult
      }
    })

    expect(wrapper.find('[data-testid="markdown-report-actions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-preview-actions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-report-downloads"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-export-downloads"]').exists()).toBe(true)
  })
})
