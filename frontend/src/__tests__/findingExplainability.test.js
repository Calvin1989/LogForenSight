import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FindingExplainability from '../components/FindingExplainability.vue'
import { setLanguage } from '../i18n'

const baseFinding = {
  rule_id: 'high_frequency_ip',
  title: 'High Frequency Request',
  severity: 'high',
  description: 'IP 1.1.1.1 exceeded the high frequency threshold.',
  recommendation: 'Rate limit the source.',
  evidence: [
    '1.1.1.1 - GET /login HTTP/1.1" 401 src_user=alice (2026-06-09T10:00:00Z)'
  ],
  matched_count: 25,
  matched_fields: ['source_ip', 'path'],
  matched_values: ['1.1.1.1', '/login'],
  metadata: {
    source_ip: '1.1.1.1',
    ip: '1.1.1.1',
    path: '/login',
    method: 'GET',
    status: '401',
    source_file: 'web-1.log'
  }
}

const baseAnalysis = {
  findings: [baseFinding],
  entities: [
    { type: 'ip', value: '1.1.1.1', count: 30, firstSeen: '2026-06-09T09:00:00Z', lastSeen: '2026-06-09T11:00:00Z' },
    { type: 'path', value: '/login', count: 25, firstSeen: '2026-06-09T09:00:00Z', lastSeen: '2026-06-09T11:00:00Z' }
  ],
  rule_coverage: [
    {
      rule_id: 'high_frequency_ip',
      title: 'High Frequency Request',
      description: 'Detects repeated requests from a single source.',
      explanation: 'Detects unusually high request volumes from the same source.',
      severity: 'high',
      enabled: true,
      triggered: true
    }
  ]
}

describe('FindingExplainability.vue', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('renders the full drilldown when the finding and analysis are complete', () => {
    const wrapper = mount(FindingExplainability, {
      props: { finding: baseFinding, analysisResult: baseAnalysis }
    })

    expect(wrapper.text()).toContain('Rule Context')
    expect(wrapper.text()).toContain('high_frequency_ip')
    expect(wrapper.text()).toContain('High Frequency Request')
    expect(wrapper.text()).toContain('Detects unusually high request volumes')
    expect(wrapper.text()).toContain('Severity Rationale')
    expect(wrapper.text()).toContain('HIGH')
    expect(wrapper.text()).toContain('Matched Field / Message Context')
    expect(wrapper.text()).toContain('1.1.1.1')
    expect(wrapper.text()).toContain('/login')
    expect(wrapper.text()).toContain('Matched Indicator / Keyword / Regex Hints')
    expect(wrapper.text()).toContain('Evidence Snippet')
    expect(wrapper.text()).toContain('1.1.1.1 - GET /login')
    expect(wrapper.text()).toContain('Recommended Analyst Action')
    expect(wrapper.text()).toContain('Prioritize review')
    expect(wrapper.text()).toContain('Related IOCs / Investigation Entities')
  })

  it('renders the Not available fallback when the finding is empty', () => {
    const wrapper = mount(FindingExplainability, {
      props: { finding: {}, analysisResult: baseAnalysis }
    })

    expect(wrapper.text()).toContain('Severity Rationale')
    expect(wrapper.text()).toContain('Recommended Analyst Action')
    expect(wrapper.text()).toContain('No related entities available')
  })

  it('omits rule context when no rule metadata is available', () => {
    const wrapper = mount(FindingExplainability, {
      props: {
        finding: {
          ...baseFinding,
          rule_id: '',
          title: '',
          description: '',
          matched_fields: [],
          matched_values: [],
          metadata: { ip: '8.8.8.8' }
        },
        analysisResult: {}
      }
    })

    expect(wrapper.text()).not.toContain('Rule Context')
    expect(wrapper.text()).toContain('Severity Rationale')
    expect(wrapper.text()).toContain('Matched Field / Message Context')
  })

  it('truncates long evidence snippets and shows the truncation marker', () => {
    const longFinding = {
      ...baseFinding,
      evidence: ['a'.repeat(800)]
    }
    const wrapper = mount(FindingExplainability, {
      props: { finding: longFinding, analysisResult: baseAnalysis, evidenceLimit: 120 }
    })

    const snippet = wrapper.find('.evidence-snippet code').text()
    expect(snippet.length).toBeLessThanOrEqual(120)
    expect(wrapper.text()).toContain('(truncated for display)')
  })

  it('shows a "no related entities" message when the analysis has no entities', () => {
    const wrapper = mount(FindingExplainability, {
      props: { finding: baseFinding, analysisResult: { findings: [baseFinding] } }
    })

    expect(wrapper.text()).toContain('No related entities available')
  })

  it('renders localized labels in Chinese', () => {
    setLanguage('zh')
    const wrapper = mount(FindingExplainability, {
      props: { finding: baseFinding, analysisResult: baseAnalysis }
    })

    expect(wrapper.text()).toContain('规则信息')
    expect(wrapper.text()).toContain('严重程度判定依据')
    expect(wrapper.text()).toContain('命中上下文')
    expect(wrapper.text()).toContain('证据片段')
    expect(wrapper.text()).toContain('推荐分析师操作')
    expect(wrapper.text()).toContain('相关调查实体')
  })

  it('exposes a stable data-testid for integration testing', () => {
    const wrapper = mount(FindingExplainability, {
      props: { finding: baseFinding, analysisResult: baseAnalysis }
    })

    expect(wrapper.find('[data-testid="finding-explainability"]').exists()).toBe(true)
  })
})
