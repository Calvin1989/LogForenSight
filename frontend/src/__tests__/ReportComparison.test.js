import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportComparison from '../components/ReportComparison.vue'

describe('ReportComparison.vue', () => {
  const mockHistory = [
    {
      id: '1',
      file_name: 'log1.log',
      analyzed_at: '2023-01-01T10:00:00Z',
      result: {
        summary: { risk_score: 20, top_ips: [], top_paths: [] },
        executive_summary: { risk_score: 20, overall_risk_level: 'Low' },
        findings: [],
        incidents: [],
        parse_stats: { parse_rate: 0.9 }
      }
    },
    {
      id: '2',
      file_name: 'log2.log',
      analyzed_at: '2023-01-01T11:00:00Z',
      result: {
        summary: { risk_score: 50, top_ips: [], top_paths: [] },
        executive_summary: { risk_score: 50, overall_risk_level: 'Medium' },
        findings: [{ rule_id: 'r1', title: 'F1', severity: 'high' }],
        incidents: [],
        parse_stats: { parse_rate: 0.95 }
      }
    }
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows graceful message when less than 2 history records', () => {
    const wrapper = mount(ReportComparison, {
      props: { history: [mockHistory[0]] }
    })
    expect(wrapper.find('.empty-state').text()).toContain('需要至少两个历史分析记录')
  })

  it('renders selectors when at least 2 history records exist', () => {
    const wrapper = mount(ReportComparison, {
      props: { history: mockHistory }
    })
    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(2)
    expect(wrapper.find('.compare-btn').exists()).toBe(true)
  })

  it('performs comparison and shows results after selection', async () => {
    const wrapper = mount(ReportComparison, {
      props: { history: mockHistory }
    })

    const selects = wrapper.findAll('select')
    await selects[0].setValue('1')
    await selects[1].setValue('2')

    await wrapper.find('.compare-btn').trigger('click')

    expect(wrapper.find('.results-ui').exists()).toBe(true)
    expect(wrapper.find('.delta-value').text()).toBe('+30') // 50 - 20
    expect(wrapper.find('.narrative-summary h4').text()).toBe('安全风险显著上升')
  })

  it('localizes finding and incident titles in Chinese mode', async () => {
    const zhHistory = [
      {
        id: '1',
        file_name: 'log1.log',
        result: {
          findings: [],
          incidents: []
        }
      },
      {
        id: '2',
        file_name: 'log2.log',
        result: {
          findings: [{ rule_id: 'path_scanning', title: 'Path Scanning Detected', severity: 'high' }],
          incidents: [{ title: 'Anomalous High Frequency Traffic', severity: 'high', source_ip: '1.2.3.4' }]
        }
      }
    ]

    const wrapper = mount(ReportComparison, {
      props: { history: zhHistory }
    })

    const selects = wrapper.findAll('select')
    await selects[0].setValue('1')
    await selects[1].setValue('2')
    await wrapper.find('.compare-btn').trigger('click')

    const addedFindings = wrapper.find('.change-group.added')
    expect(addedFindings.text()).toContain('检测到路径扫描')

    const addedIncidents = wrapper.findAll('.change-group.added')[1]
    expect(addedIncidents.text()).toContain('异常高频访问流量')
  })

  it('triggers download when download button is clicked', async () => {
    // Mock download logic
    const createObjectURLMock = vi.fn(() => 'blob:abc')
    const revokeObjectURLMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    const mockAnchor = { href: '', download: '', click: vi.fn(), style: {} }
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor
      return originalCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    const wrapper = mount(ReportComparison, {
      props: { history: mockHistory }
    })

    // Select and compare first to show the download button
    await wrapper.findAll('select')[0].setValue('1')
    await wrapper.findAll('select')[1].setValue('2')
    await wrapper.find('.compare-btn').trigger('click')

    await wrapper.find('.download-btn').trigger('click')

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toContain('report_comparison')
  })
})
