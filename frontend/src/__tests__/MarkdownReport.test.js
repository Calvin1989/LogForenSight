import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownReport from '../components/MarkdownReport.vue'

describe('MarkdownReport.vue', () => {
  const mockMarkdown = `# AI 日志安全分析报告\n\n**生成时间**: 2026-06-08\n\n## 管理层摘要\n\n### 检测到极高风险 Web 攻击活动\n\n- 风险 1\n- 风险 2\n\n> 注意事项\n\n| 字段 | 值 |\n| :--- | :--- |\n| 总计 | 100 |\n\n\`\`\`\nRAW_LOG_EVIDENCE\n\`\`\``

  const mockResult = {
    executive_summary: { headline: 'Test', overall_risk_level: 'critical', overview: 'Test overview' },
    findings: [],
    incidents: [],
    summary: {
      total_requests: 0,
      unique_ips: 0,
      finding_severity_counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      incident_severity_counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      top_ips: [],
      top_paths: []
    },
    parse_stats: { parse_rate: 0, total_lines: 0, parsed_lines: 0 },
    timeline_events: []
  }

  it('renders rendered markdown in preview and removes markdown symbols', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: mockMarkdown,
        result: mockResult
      }
    })

    const preview = wrapper.find('.report-preview-container')
    expect(preview.exists()).toBe(true)

    // Check symbols removal
    const text = preview.text()
    expect(text).not.toContain('# ')
    expect(text).not.toContain('**')
    expect(text).toContain('AI 日志安全分析报告')
    expect(text).toContain('生成时间')
    expect(text).toContain('管理层摘要')

    // Check parsing quality text
    expect(text).toContain('解析成功率')
  })

  it('downloads raw markdown when download button is clicked', async () => {
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

    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: mockMarkdown,
        result: mockResult
      }
    })

    await wrapper.find('.download-btn.raw').trigger('click')

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toBe('security_report.md')
  })

  it('downloads evidence pack markdown when button is clicked', async () => {
    const createObjectURLMock = vi.fn(() => 'blob:evidence')
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

    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: mockMarkdown,
        result: mockResult,
        caseId: 'case-1'
      }
    })

    await wrapper.find('.download-btn.evidence-pack').trigger('click')

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toContain('analyst_evidence_pack_')
  })

  it('renders action groups containers', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: mockMarkdown,
        result: mockResult
      }
    })

    expect(wrapper.find('[data-testid="markdown-report-actions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-preview-actions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-report-downloads"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-export-downloads"]').exists()).toBe(true)
  })

  it('toggles preview when toggle button is clicked', async () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: mockMarkdown,
        result: mockResult
      }
    })

    // Initial state should be preview visible
    expect(wrapper.find('.report-preview-container').exists()).toBe(true)

    // Click to hide
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('.report-preview-container').exists()).toBe(false)

    // Click again to show
    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.find('.report-preview-container').exists()).toBe(true)
  })
})
