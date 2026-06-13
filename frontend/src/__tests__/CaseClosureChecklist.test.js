import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import CaseClosureChecklist from '../components/CaseClosureChecklist.vue'

function mountChecklist(props = {}) {
  return mount(CaseClosureChecklist, {
    props
  })
}

describe('CaseClosureChecklist.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('renders checklist items with complete data', () => {
    const wrapper = mountChecklist({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1' }]
      },
      displayResult: {
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1' }],
        timeline_events: [{ id: 'evt-1' }],
        rule_coverage: [{ rule_id: 'rule-1' }]
      },
      caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
      reviewReadiness: {
        status: 'ready',
        summary: {
          requiredBlockers: 0,
          highRiskFindings: { reviewed: 1, total: 1 },
          incidents: { reviewed: 1, total: 1 }
        }
      },
      evidencePackQuality: {
        score: 95,
        status: 'ready',
        summary: { maxScore: 100 }
      },
      exportGuardrails: {
        decision: 'ready',
        summaryKey: 'evidencePackGuardrails.readySummary'
      },
      shareSafety: {
        status: 'safe',
        findings: [],
        warnings: []
      }
    })

    expect(wrapper.text()).toContain('Case closure checklist')
    expect(wrapper.text()).toContain('Findings reviewed / available')
    expect(wrapper.text()).toContain('Incidents triaged / available')
    expect(wrapper.get('[data-testid="case-closure-item-findings"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-incidents"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-timeline"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-rule-coverage"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-case-notes"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-review-readiness"]').text()).toContain('Ready')
    expect(wrapper.get('[data-testid="case-closure-item-quality-score"]').text()).toContain('95 / 100')
    expect(wrapper.get('[data-testid="case-closure-item-export-guardrails"]').text()).toContain('Ready')
    expect(wrapper.get('[data-testid="case-closure-item-share-safety"]').text()).toContain('Safe')
    expect(wrapper.get('[data-testid="case-closure-item-handoff-readiness"]').text()).toContain('Ready')
  })

  it('emits closureData with gapItems and handoffReadiness', () => {
    const wrapper = mountChecklist({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1' }]
      },
      displayResult: {
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1' }],
        timeline_events: [{ id: 'evt-1' }],
        rule_coverage: [{ rule_id: 'rule-1' }]
      },
      caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
      reviewReadiness: {
        status: 'ready',
        summary: { requiredBlockers: 0, highRiskFindings: { reviewed: 1, total: 1 }, incidents: { reviewed: 1, total: 1 } }
      },
      evidencePackQuality: { score: 95, status: 'ready', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'ready', summaryKey: 'evidencePackGuardrails.readySummary' },
      shareSafety: { status: 'safe', findings: [], warnings: [] }
    })

    const emitted = wrapper.emitted('update:closureData')
    expect(emitted).toBeTruthy()
    const lastEmit = emitted[emitted.length - 1][0]
    expect(lastEmit).toHaveProperty('gapItems')
    expect(lastEmit).toHaveProperty('handoffReadiness')
    expect(lastEmit.handoffReadiness.value).toContain('Ready')
    expect(Array.isArray(lastEmit.gapItems)).toBe(true)
  })

  it('does not crash when result and summaries are missing', () => {
    const wrapper = mountChecklist({
      result: null,
      displayResult: null,
      caseNotes: undefined,
      reviewReadiness: null,
      evidencePackQuality: null,
      exportGuardrails: null,
      shareSafety: null
    })

    expect(wrapper.text()).toContain('Case closure checklist')
    expect(wrapper.get('[data-testid="case-closure-item-findings"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-incidents"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-timeline"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-rule-coverage"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-case-notes"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-handoff-readiness"]').text()).toContain('Unavailable')

    const emitted = wrapper.emitted('update:closureData')
    expect(emitted).toBeTruthy()
    const lastEmit = emitted[emitted.length - 1][0]
    expect(lastEmit.handoffReadiness.value).toContain('Unavailable')
  })

  it('shows available missing and unavailable states for collection-based items', () => {
    const wrapper = mountChecklist({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'medium' }],
        incidents: []
      },
      displayResult: {
        findings: [{ rule_id: 'rule-1', severity: 'medium' }],
        incidents: [],
        timeline_events: [],
        rule_coverage: undefined
      },
      caseNotes: []
    })

    expect(wrapper.get('[data-testid="case-closure-item-findings"]').text()).toContain('Available')
    expect(wrapper.get('[data-testid="case-closure-item-incidents"]').text()).toContain('Missing')
    expect(wrapper.get('[data-testid="case-closure-item-timeline"]').text()).toContain('Missing')
    expect(wrapper.get('[data-testid="case-closure-item-rule-coverage"]').text()).toContain('Unavailable')
    expect(wrapper.get('[data-testid="case-closure-item-case-notes"]').text()).toContain('Missing')

    const emitted = wrapper.emitted('update:closureData')
    const lastEmit = emitted[emitted.length - 1][0]
    expect(lastEmit.gapItems.length).toBeGreaterThan(0)
  })

  it('shows summary states for review readiness quality guardrails and share safety', () => {
    const wrapper = mountChecklist({
      result: { findings: [], incidents: [] },
      displayResult: {
        findings: [],
        incidents: [],
        timeline_events: [],
        rule_coverage: []
      },
      caseNotes: [],
      reviewReadiness: {
        status: 'attention',
        summary: { requiredBlockers: 2 }
      },
      evidencePackQuality: {
        score: 45,
        status: 'partial',
        summary: { maxScore: 100 }
      },
      exportGuardrails: {
        decision: 'review_recommended',
        summaryKey: 'evidencePackGuardrails.reviewRecommendedSummary'
      },
      shareSafety: {
        status: 'attention',
        findings: [{ id: 'rawEvidenceSnippets' }],
        warnings: [{ id: 'manualReviewRecommended' }]
      }
    })

    expect(wrapper.get('[data-testid="case-closure-item-review-readiness"]').text()).toContain('Attention needed')
    expect(wrapper.get('[data-testid="case-closure-item-quality-score"]').text()).toContain('45 / 100')
    expect(wrapper.get('[data-testid="case-closure-item-quality-score"]').text()).toContain('Partial')
    expect(wrapper.get('[data-testid="case-closure-item-export-guardrails"]').text()).toContain('Review recommended')
    expect(wrapper.get('[data-testid="case-closure-item-share-safety"]').text()).toContain('Attention')

    const emitted = wrapper.emitted('update:closureData')
    const lastEmit = emitted[emitted.length - 1][0]
    expect(lastEmit.gapItems.length).toBeGreaterThan(0)
    expect(lastEmit.handoffReadiness.value).toContain('Needs review')
  })

  it('derives handoff readiness as ready needs review or unavailable', () => {
    const readyWrapper = mountChecklist({
      displayResult: {
        timeline_events: [{ id: 'evt-1' }],
        rule_coverage: [{ rule_id: 'rule-1' }]
      },
      reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 } },
      evidencePackQuality: { score: 92, status: 'ready', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'ready', summaryKey: 'evidencePackGuardrails.readySummary' },
      shareSafety: { status: 'safe', findings: [], warnings: [] }
    })
    expect(readyWrapper.get('[data-testid="case-closure-item-handoff-readiness"]').text()).toContain('Ready')

    const readyEmit = readyWrapper.emitted('update:closureData')
    const readyLastEmit = readyEmit[readyEmit.length - 1][0]
    expect(readyLastEmit.handoffReadiness.value).toContain('Ready')

    const reviewWrapper = mountChecklist({
      reviewReadiness: { status: 'attention', summary: { requiredBlockers: 1 } },
      evidencePackQuality: { score: 78, status: 'good', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'review_recommended', summaryKey: 'evidencePackGuardrails.reviewRecommendedSummary' },
      shareSafety: { status: 'review_recommended', findings: [{ id: 'ipAddresses' }], warnings: [] }
    })
    expect(reviewWrapper.get('[data-testid="case-closure-item-handoff-readiness"]').text()).toContain('Needs review')

    const reviewEmit = reviewWrapper.emitted('update:closureData')
    const reviewLastEmit = reviewEmit[reviewEmit.length - 1][0]
    expect(reviewLastEmit.handoffReadiness.value).toContain('Needs review')

    const unavailableWrapper = mountChecklist()
    expect(unavailableWrapper.get('[data-testid="case-closure-item-handoff-readiness"]').text()).toContain('Unavailable')
  })
})
