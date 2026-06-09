import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RecentAnalyses from '../components/RecentAnalyses.vue'
import { setLanguage } from '../i18n'

describe('RecentAnalyses', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('renders batch tag for batch records', () => {
    const wrapper = mount(RecentAnalyses, {
      props: {
        history: [
          {
            id: '1',
            analyzed_at: '2026-06-09T10:00:00.000Z',
            file_name: 'Batch: first.log + 1 more',
            log_format: 'combined',
            parse_rate: 1,
            incidents_count: 0,
            findings_count: 0,
            skipped_lines: 0,
            analysis_mode: 'batch'
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Batch')
  })

  it('renders batch and tuned tags together without conflict', () => {
    const wrapper = mount(RecentAnalyses, {
      props: {
        history: [
          {
            id: '1',
            analyzed_at: '2026-06-09T10:00:00.000Z',
            file_name: 'Batch: first.log + 2 more',
            log_format: 'combined',
            parse_rate: 0.95,
            incidents_count: 1,
            findings_count: 2,
            skipped_lines: 3,
            isBatch: true,
            is_tuned: true
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Batch')
    expect(wrapper.text()).toContain('Tuned')
  })
})
