import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisContextBar from '../components/AnalysisContextBar.vue'
import { setLanguage } from '../i18n'

const singleResult = {
  analysis_mode: 'single',
  summary: {
    total_requests: 13
  },
  parse_stats: {
    parse_rate: 1,
    detected_format: 'combined'
  },
  findings: [{ id: 'F1' }, { id: 'F2' }, { id: 'F3' }, { id: 'F4' }],
  incidents: [{ id: 'I1' }]
}

const batchResult = {
  analysis_mode: 'batch',
  summary: {
    total_requests: 16
  },
  parse_stats: {
    parse_rate: 1,
    detected_format: 'combined'
  },
  findings: [{ id: 'F1' }, { id: 'F2' }, { id: 'F3' }, { id: 'F4' }],
  incidents: [{ id: 'I1' }],
  source_files: [
    { filename: 'samples/demo_batch_part1.log' },
    { filename: 'samples/demo_batch_part2.log' },
    { filename: 'samples/demo_batch_part3.log' }
  ]
}

describe('AnalysisContextBar.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders compact single-analysis metrics in English', () => {
    setLanguage('en')

    const wrapper = mount(AnalysisContextBar, {
      props: {
        analysisResult: singleResult
      }
    })

    expect(wrapper.get('[data-testid="analysis-context-bar"]').text()).toContain('Single analysis')
    expect(wrapper.text()).toContain('13 requests')
    expect(wrapper.text()).toContain('Parse rate 100%')
    expect(wrapper.text()).toContain('4 findings / 1 incident')
    expect(wrapper.find('[data-testid="analysis-context-sources"]').exists()).toBe(false)
  })

  it('renders batch source summary and trims file paths in English', () => {
    setLanguage('en')

    const wrapper = mount(AnalysisContextBar, {
      props: {
        analysisResult: batchResult
      }
    })

    expect(wrapper.text()).toContain('Batch analysis')
    expect(wrapper.text()).toContain('3 source files')
    expect(wrapper.text()).toContain('16 requests')
    expect(wrapper.text()).toContain('Parse rate 100%')
    expect(wrapper.text()).toContain('4 findings / 1 incident')
    expect(wrapper.get('[data-testid="analysis-context-sources"]').text()).toContain('demo_batch_part1.log, demo_batch_part2.log +1 more')
    expect(wrapper.text()).not.toContain('samples/demo_batch_part1.log')
  })

  it('renders translated labels in Chinese', () => {
    setLanguage('zh')

    const wrapper = mount(AnalysisContextBar, {
      props: {
        analysisResult: batchResult
      }
    })

    expect(wrapper.text()).toContain('批量分析')
    expect(wrapper.text()).toContain('3 个来源文件')
    expect(wrapper.text()).toContain('解析率 100%')
    expect(wrapper.text()).toContain('4 个风险点 / 1 个安全事件')
    expect(wrapper.get('[data-testid="analysis-context-sources"]').text()).toContain('demo_batch_part1.log, demo_batch_part2.log +1 个文件')
  })
})
