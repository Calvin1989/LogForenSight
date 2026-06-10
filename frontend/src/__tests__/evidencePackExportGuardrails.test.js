import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import EvidencePackExportGuardrails from '../components/EvidencePackExportGuardrails.vue'

describe('EvidencePackExportGuardrails.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('renders empty state', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: null,
        reviewReadiness: null,
        result: null,
        triageState: {},
        caseNotes: []
      }
    })

    expect(wrapper.text()).toContain('Evidence Pack Export Guardrails')
    expect(wrapper.text()).toContain('Run an analysis to review Evidence Pack export guardrails.')
  })

  it('renders ready decision', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: { score: 95 },
        reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 }, checks: [] },
        result: { findings: [], incidents: [] },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note.' }]
      }
    })

    expect(wrapper.text()).toContain('Ready')
    expect(wrapper.text()).toContain('95')
  })

  it('renders review recommended decision', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: { score: 82 },
        reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 }, checks: [] },
        result: { findings: [], incidents: [] },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note.' }]
      }
    })

    expect(wrapper.text()).toContain('Review recommended')
    expect(wrapper.text()).toContain('Evidence Pack quality score is below the ready-for-handoff threshold.')
  })

  it('renders not ready decision', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: { score: 60 },
        reviewReadiness: { status: 'attention', summary: { requiredBlockers: 1 }, checks: [] },
        result: { findings: [], incidents: [] },
        triageState: {},
        caseNotes: []
      }
    })

    expect(wrapper.text()).toContain('Not ready')
    expect(wrapper.text()).toContain('Case notes are missing.')
  })

  it('renders blockers and recommendations', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: { score: 92 },
        reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 }, checks: [] },
        result: {
          findings: [{ rule_id: 'rule-1', severity: 'high' }],
          incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
        },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note.' }]
      }
    })

    expect(wrapper.text()).toContain('High-risk findings still need analyst review.')
    expect(wrapper.text()).toContain('Incidents still need triage updates.')
    expect(wrapper.text()).toContain('Review all high and critical findings before handoff.')
    expect(wrapper.text()).toContain('Add triage status for all incidents before handoff.')
  })

  it('shows the export-not-blocked message', () => {
    const wrapper = mount(EvidencePackExportGuardrails, {
      props: {
        quality: { score: 95 },
        reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 }, checks: [] },
        result: { findings: [], incidents: [] },
        triageState: {},
        caseNotes: [{ id: 'note-1', body: 'Analyst note.' }]
      }
    })

    expect(wrapper.text()).toContain('Guardrails do not block export')
  })
})
