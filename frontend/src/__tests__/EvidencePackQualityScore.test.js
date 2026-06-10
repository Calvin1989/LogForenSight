import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import EvidencePackQualityScore from '../components/EvidencePackQualityScore.vue'

describe('EvidencePackQualityScore.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('renders empty state', () => {
    const wrapper = mount(EvidencePackQualityScore, {
      props: {
        result: null,
        triageState: {},
        caseNotes: [],
        reviewReadiness: null
      }
    })

    expect(wrapper.text()).toContain('Evidence Pack Quality Score')
    expect(wrapper.text()).toContain('Run an analysis to calculate Evidence Pack quality.')
  })

  it('renders score', () => {
    const wrapper = mount(EvidencePackQualityScore, {
      props: {
        result: {
          findings: [],
          incidents: [],
          summary: {
            top_ips: [{ ip: '1.2.3.4', count: 1 }]
          }
        },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
        reviewReadiness: { status: 'ready' }
      }
    })

    expect(wrapper.text()).toContain('100 / 100')
  })

  it('renders checklist items', () => {
    const wrapper = mount(EvidencePackQualityScore, {
      props: {
        result: {
          findings: [],
          incidents: []
        },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
        reviewReadiness: { status: 'ready' }
      }
    })

    expect(wrapper.text()).toContain('High-risk findings reviewed')
    expect(wrapper.text()).toContain('Incidents triaged')
    expect(wrapper.text()).toContain('Case notes present')
    expect(wrapper.text()).toContain('Investigation entities present')
    expect(wrapper.text()).toContain('Review readiness ready')
  })

  it('renders ready state when score is high', () => {
    const wrapper = mount(EvidencePackQualityScore, {
      props: {
        result: {
          findings: [],
          incidents: [],
          summary: {
            top_ips: [{ ip: '1.2.3.4', count: 1 }]
          }
        },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
        reviewReadiness: { status: 'ready' }
      }
    })

    expect(wrapper.text()).toContain('Ready')
  })

  it('renders attention and missing states when score is low', () => {
    const wrapper = mount(EvidencePackQualityScore, {
      props: {
        result: {
          findings: [{ rule_id: 'rule-1', severity: 'high' }],
          incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
        },
        triageState: {},
        caseNotes: [],
        reviewReadiness: null
      }
    })

    expect(wrapper.text()).toContain('Missing')
    expect(wrapper.text()).toContain('Attention')
    expect(wrapper.text()).toContain('Review all high and critical findings before export.')
    expect(wrapper.text()).toContain('Record at least one case note before export.')
  })
})
