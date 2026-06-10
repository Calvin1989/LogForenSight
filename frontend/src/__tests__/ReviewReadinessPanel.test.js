import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import ReviewReadinessPanel from '../components/ReviewReadinessPanel.vue'

let caseNotesSummaryStore = {}

vi.mock('../utils/caseNotesStorage', () => ({
  getCaseNotesSummary: vi.fn((caseId = 'current-analysis') => {
    const summary = caseNotesSummaryStore[caseId] || { total: 0, notes: [] }
    return {
      caseId,
      total: summary.total ?? summary.notes.length,
      countsByType: {},
      lastUpdatedAt: '',
      notes: summary.notes || []
    }
  })
}))

describe('ReviewReadinessPanel.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    caseNotesSummaryStore = {}
    setLanguage('en')
  })

  it('renders empty state', () => {
    const wrapper = mount(ReviewReadinessPanel, {
      props: {
        result: null,
        triageState: {},
        caseId: 'case-empty'
      }
    })

    expect(wrapper.text()).toContain('Run an analysis to review investigation readiness.')
  })

  it('renders checklist items', () => {
    caseNotesSummaryStore['case-1'] = {
      notes: [{ id: 'note-1', title: 'Decision' }]
    }

    const wrapper = mount(ReviewReadinessPanel, {
      props: {
        result: {
          findings: [{ rule_id: 'rule-1', severity: 'high' }],
          incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
        },
        triageState: {
          'finding:rule-1': { status: 'investigating' },
          'incident:inc-1': { status: 'mitigated' }
        },
        caseId: 'case-1'
      }
    })

    expect(wrapper.text()).toContain('Investigation Review Readiness')
    expect(wrapper.text()).toContain('High-risk findings reviewed')
    expect(wrapper.text()).toContain('Incidents reviewed')
    expect(wrapper.text()).toContain('Analyst case notes recorded')
    expect(wrapper.text()).toContain('Evidence Pack readiness')
  })

  it('shows attention when high-risk findings are unreviewed', () => {
    const wrapper = mount(ReviewReadinessPanel, {
      props: {
        result: {
          findings: [{ rule_id: 'rule-1', severity: 'critical' }],
          incidents: []
        },
        triageState: {},
        caseId: 'case-2'
      }
    })

    expect(wrapper.text()).toContain('Attention needed')
    expect(wrapper.text()).toContain('1 of 1 pending review')
  })

  it('shows ready when required checks pass', () => {
    caseNotesSummaryStore['case-3'] = {
      notes: [{ id: 'note-1', body: 'Documented decision.' }]
    }

    const wrapper = mount(ReviewReadinessPanel, {
      props: {
        result: {
          findings: [{ rule_id: 'rule-1', severity: 'high' }],
          incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
        },
        triageState: {
          'finding:rule-1': { status: 'mitigated' },
          'incident:inc-1': { status: 'investigating' }
        },
        caseId: 'case-3'
      }
    })

    expect(wrapper.text()).toContain('Ready')
    expect(wrapper.text()).toContain('Required review checks are complete and the Evidence Pack is ready to export.')
  })

  it('renders bilingual labels when language changes', () => {
    caseNotesSummaryStore['case-4'] = {
      notes: [{ id: 'note-1' }]
    }

    const result = {
      findings: [{ rule_id: 'rule-1', severity: 'high' }],
      incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
    }
    const triageState = {
      'finding:rule-1': { status: 'mitigated' },
      'incident:inc-1': { status: 'mitigated' }
    }

    const enWrapper = mount(ReviewReadinessPanel, {
      props: { result, triageState, caseId: 'case-4' }
    })
    expect(enWrapper.text()).toContain('Investigation Review Readiness')
    expect(enWrapper.text()).toContain('High-risk findings reviewed')

    setLanguage('zh')

    const zhWrapper = mount(ReviewReadinessPanel, {
      props: { result, triageState, caseId: 'case-4' }
    })
    expect(zhWrapper.text()).toContain('调查复核准备度')
    expect(zhWrapper.text()).toContain('高风险发现已复核')
  })
})
