import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RuleCoverage from '../components/RuleCoverage.vue'
import { setLanguage } from '../i18n'

describe('RuleCoverage.vue', () => {
  beforeEach(() => {
    setLanguage('en')
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
  })

  const mockCoverage = [
    {
      rule_id: 'high_frequency_ip',
      title: 'High Frequency Request',
      description: 'Detects high request volume',
      severity: 'medium',
      enabled: true,
      triggered: true,
      finding_count: 1,
      incident_count: 1,
      matched_count: 10,
      matched_fields: ['ip'],
      sample_matched_values: ['1.1.1.1'],
      sample_evidence: ['ev1'],
      related_incident_ids: ['inc1'],
      explanation: 'Explanation for high frequency'
    },
    {
      rule_id: 'path_scanning',
      title: 'Path Scanning Detected',
      description: 'Detects 404 scanning',
      severity: 'high',
      enabled: true,
      triggered: false,
      finding_count: 0,
      incident_count: 0,
      matched_count: 0,
      matched_fields: [],
      sample_matched_values: [],
      sample_evidence: [],
      related_incident_ids: [],
      explanation: 'Explanation for path scanning'
    }
  ]

  it('renders overview stats correctly', () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: mockCoverage }
    })

    expect(wrapper.find('.stat-value').text()).toBe('2') // Total
    const stats = wrapper.findAll('.stat-value')
    expect(stats[1].text()).toBe('2') // Enabled
    expect(stats[2].text()).toBe('1') // Triggered
    expect(stats[3].text()).toBe('1') // Not Triggered
  })

  it('renders triggered and not triggered rules', () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: mockCoverage }
    })

    const items = wrapper.findAll('.rule-item')
    expect(items.length).toBe(2)

    expect(items[0].classes()).toContain('is-triggered')
    expect(items[1].classes()).not.toContain('is-triggered')

    expect(items[0].text()).toContain('TRIGGERED')
    expect(items[1].text()).toContain('NOT TRIGGERED')
  })

  it('filters rules by status', async () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: mockCoverage }
    })

    const select = wrapper.find('select')
    await select.setValue('triggered')

    expect(wrapper.findAll('.rule-item').length).toBe(1)
    expect(wrapper.find('.rule-item').text()).toContain('High Frequency Request')

    await select.setValue('not_triggered')
    expect(wrapper.findAll('.rule-item').length).toBe(1)
    expect(wrapper.find('.rule-item').text()).toContain('Path Scanning Detected')
  })

  it('toggles evidence display', async () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: mockCoverage }
    })

    const triggeredItem = wrapper.find('.is-triggered')
    expect(triggeredItem.find('.evidence-list').exists()).toBe(false)

    const toggleBtn = triggeredItem.find('.toggle-btn')
    await toggleBtn.trigger('click')

    expect(triggeredItem.find('.evidence-list').exists()).toBe(true)
    expect(triggeredItem.find('.evidence-list').text()).toContain('ev1')
  })

  it('handles empty data gracefully', () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: [] }
    })

    expect(wrapper.find('.empty-card').exists()).toBe(true)
    expect(wrapper.find('.empty-card').text()).toContain('No rule coverage data available')
  })

  it('handles localization switch', async () => {
    const wrapper = mount(RuleCoverage, {
      props: { ruleCoverage: mockCoverage }
    })

    expect(wrapper.find('h3').text()).toBe('Rule Coverage & Detection Explainability')

    setLanguage('zh')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('h3').text()).toBe('规则覆盖与检测解释')
  })
})
