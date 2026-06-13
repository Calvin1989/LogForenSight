import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SeverityDistribution from '../components/SeverityDistribution.vue'
import { setLanguage } from '../i18n'

describe('SeverityDistribution.vue', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('renders correctly with given counts', () => {
    const findingSeverityCounts = { high: 2, medium: 1, low: 0 }
    const incidentSeverityCounts = { high: 1, medium: 0, low: 0 }

    const wrapper = mount(SeverityDistribution, {
      props: { findingSeverityCounts, incidentSeverityCounts }
    })

    expect(wrapper.find('[data-testid="severity-distribution"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Severity Distribution')
    expect(wrapper.text()).toContain('Finding Severity')
    expect(wrapper.text()).toContain('Incident Severity')

    const findingCard = wrapper.find('[data-testid="finding-distribution"]')
    const findingItems = findingCard.findAll('.severity-item')

    expect(findingItems[0].find('.severity-label').text()).toBe('High')
    expect(findingItems[0].find('.count').text()).toBe('2')

    expect(findingItems[1].find('.severity-label').text()).toBe('Medium')
    expect(findingItems[1].find('.count').text()).toBe('1')

    expect(findingItems[2].find('.severity-label').text()).toBe('Low')
    expect(findingItems[2].find('.count').text()).toBe('0')

    const incidentCard = wrapper.find('[data-testid="incident-distribution"]')
    const incidentItems = incidentCard.findAll('.severity-item')

    expect(incidentItems[0].find('.severity-label').text()).toBe('High')
    expect(incidentItems[0].find('.count').text()).toBe('1')
  })

  it('renders default counts when props are missing', () => {
    const wrapper = mount(SeverityDistribution)

    const counts = wrapper.findAll('.count')
    counts.forEach(count => {
      expect(count.text()).toBe('0')
    })
  })

  it('calculates bar widths correctly', () => {
    const findingSeverityCounts = { high: 2, medium: 2, low: 0 }
    const wrapper = mount(SeverityDistribution, {
      props: { findingSeverityCounts }
    })

    const bars = wrapper.findAll('.bar')
    expect(bars[0].attributes('style')).toContain('width: 50%')
    expect(bars[1].attributes('style')).toContain('width: 50%')
    expect(bars[2].attributes('style')).toContain('width: 0%')
  })

  it('has root data-testid="severity-distribution"', () => {
    const wrapper = mount(SeverityDistribution)

    expect(wrapper.find('[data-testid="severity-distribution"]').exists()).toBe(true)
  })

  it('has finding and incident distribution cards', () => {
    const wrapper = mount(SeverityDistribution)

    expect(wrapper.find('[data-testid="finding-distribution"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="incident-distribution"]').exists()).toBe(true)
  })

  it('renders English i18n labels when language is en', () => {
    setLanguage('en')
    const wrapper = mount(SeverityDistribution)

    expect(wrapper.text()).toContain('Severity Distribution')
    expect(wrapper.text()).toContain('Finding Severity')
    expect(wrapper.text()).toContain('Incident Severity')
  })

  it('renders Chinese i18n labels when language is zh', () => {
    setLanguage('zh')
    const wrapper = mount(SeverityDistribution)

    expect(wrapper.text()).toContain('严重程度分布')
    expect(wrapper.text()).toContain('风险点严重程度')
    expect(wrapper.text()).toContain('安全事件严重程度')
  })
})
