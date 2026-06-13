import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExecutiveSummary from '../components/ExecutiveSummary.vue'
import { setLanguage } from '../i18n'

describe('ExecutiveSummary.vue', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const mockSummary = {
    overall_risk_level: 'high',
    risk_score: 75,
    headline: 'High-risk suspicious access patterns detected',
    overview: 'Security analysis identified 5 incidents and 10 risk findings.',
    key_metrics: ['Total Requests: 1000', 'Unique IPs: 50'],
    key_affected_ips: ['1.2.3.4', '5.6.7.8'],
    top_risks: ['Sensitive Path Access (Incident)', 'Brute Force Attempt (Finding)'],
    recommended_next_steps: ['Block top IPs', 'Review logs'],
    methodology: 'Deterministic summary generated from local rule findings.'
  }

  it('renders correctly when summary is provided', () => {
    const wrapper = mount(ExecutiveSummary, {
      props: { summary: mockSummary }
    })

    expect(wrapper.find('.risk-level').text()).toBe('HIGH')
    expect(wrapper.find('.risk-score').text()).toBe('75/100')
    expect(wrapper.find('.headline').text()).toBe(mockSummary.headline)
    expect(wrapper.find('.overview').text()).toBe(mockSummary.overview)
    expect(wrapper.find('.risk-badge').classes()).toContain('high')

    const metrics = wrapper.findAll('.detail-section:nth-child(1) li')
    expect(metrics.length).toBe(2)
    expect(metrics[0].text()).toBe('Total Requests: 1000')

    const ips = wrapper.findAll('.ip-tag')
    expect(ips.length).toBe(2)
    expect(ips[0].text()).toBe('1.2.3.4')
  })

  it('gracefully hides when summary is null', () => {
    const wrapper = mount(ExecutiveSummary, {
      props: { summary: null }
    })
    expect(wrapper.find('.executive-summary').exists()).toBe(false)
  })

  it('triggers download when download button is clicked', () => {
    // Mock URL methods
    const createObjectURLMock = vi.fn(() => 'blob:abc')
    const revokeObjectURLMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    // Mock anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    }

    // Spy on document.createElement and only mock for 'a'
    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockAnchor
      return originalCreateElement(tagName)
    })

    // Also mock appendChild and removeChild to avoid issues with mockAnchor
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const wrapper = mount(ExecutiveSummary, {
      props: { summary: mockSummary }
    })

    wrapper.find('.download-btn').trigger('click')

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(createObjectURLMock).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })
})
