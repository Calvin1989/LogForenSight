import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IncidentsList from '../components/IncidentsList.vue'

describe('IncidentsList.vue', () => {
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
})
