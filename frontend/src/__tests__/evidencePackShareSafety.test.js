import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import EvidencePackShareSafety from '../components/EvidencePackShareSafety.vue'

describe('EvidencePackShareSafety.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('renders empty state', () => {
    const wrapper = mount(EvidencePackShareSafety, {
      props: {
        markdown: '',
        result: null
      }
    })

    expect(wrapper.text()).toContain('Evidence Pack Share Safety Review')
    expect(wrapper.text()).toContain('Run an analysis to review share safety indicators before sharing the Evidence Pack.')
  })

  it('renders safe state when no indicators are detected', () => {
    const wrapper = mount(EvidencePackShareSafety, {
      props: {
        markdown: '# Analyst Evidence Pack\n\nSummary only.',
        result: { findings: [], incidents: [] }
      }
    })

    expect(wrapper.text()).toContain('Safe')
    expect(wrapper.text()).toContain('No obvious sharing risk indicators were detected.')
    expect(wrapper.text()).toContain('Share through the usual workflow')
  })

  it('renders attention state with findings and warnings', () => {
    const wrapper = mount(EvidencePackShareSafety, {
      props: {
        markdown: [
          '# Analyst Evidence Pack',
          'Source file: access.log',
          'Sensitive path probe: /.env /admin /backup',
          'URL: https://portal.example.com/login?user=alice',
          'Account: user=alice',
          'Evidence: 10.0.0.8 - - [10/Jun/2026:10:00:00 +0000] "GET /backup HTTP/1.1" 200'
        ].join('\n'),
        result: {}
      }
    })

    expect(wrapper.text()).toContain('Attention')
    expect(wrapper.text()).toContain('Detected 1 URLs with query strings')
    expect(wrapper.text()).toContain('Detected 3 sensitive paths')
    expect(wrapper.text()).toContain('raw evidence snippets')
    expect(wrapper.text()).toContain('does not block export and does not auto-redact')
  })
})
