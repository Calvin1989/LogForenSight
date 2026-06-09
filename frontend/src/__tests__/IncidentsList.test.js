import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IncidentsList from '../components/IncidentsList.vue'
import { setLanguage } from '../i18n'

describe('IncidentsList.vue', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const mockIncidents = [
    {
      incident_id: 'inc1',
      title: 'Incident 1',
      severity: 'high',
      source_ip: '1.1.1.1',
      confidence: 'high',
      summary: 'Summary 1',
      related_rule_ids: ['rule1'],
      evidence: ['ev1'],
      recommendations: ['rec1']
    }
  ]

  it('renders export buttons', () => {
    const wrapper = mount(IncidentsList, {
      props: { incidents: mockIncidents }
    })

    expect(wrapper.find('.export-btn[title*="JSON"]').exists()).toBe(true)
    expect(wrapper.find('.export-btn[title*="CSV"]').exists()).toBe(true)
    expect(wrapper.find('.export-warning').exists()).toBe(true)
  })

  it('disables buttons when no results match filter', async () => {
    const wrapper = mount(IncidentsList, {
      props: { incidents: mockIncidents }
    })

    // Search for non-existent IP
    await wrapper.find('.filter-input').setValue('9.9.9.9')
    
    const exportButtons = wrapper.findAll('.export-btn')
    exportButtons.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
    expect(wrapper.find('.export-warning').exists()).toBe(false)
  })

  it('shows Needs review for incidents without triage or with open status', () => {
    const wrapper = mount(IncidentsList, {
      props: {
        incidents: [
          ...mockIncidents,
          {
            incident_id: 'inc2',
            title: 'Incident 2',
            severity: 'medium',
            source_ip: '2.2.2.2',
            confidence: 'medium',
            summary: 'Summary 2',
            related_rule_ids: ['rule2'],
            evidence: ['ev2'],
            recommendations: []
          }
        ],
        triageState: {
          'incident:inc1': { status: 'open', priority: 'medium' }
        }
      }
    })

    expect(wrapper.findAll('.triage-badge.needs-review')).toHaveLength(2)
    expect(wrapper.text()).toContain('Needs review')
  })

  it('hides Needs review for mitigated incidents and shows triage metadata', () => {
    const wrapper = mount(IncidentsList, {
      props: {
        incidents: mockIncidents,
        triageState: {
          'incident:inc1': {
            status: 'mitigated',
            priority: 'high',
            notes: 'Contained at edge',
            updated_at: '2026-06-09T10:00:00Z'
          }
        }
      }
    })

    expect(wrapper.find('.triage-badge.needs-review').exists()).toBe(false)
    expect(wrapper.text()).toContain('Last updated')
    expect(wrapper.text()).toContain('Analyst note')
    expect(wrapper.text()).toContain('Contained at edge')
  })
})
