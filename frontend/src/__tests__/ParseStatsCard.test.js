import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ParseStatsCard from '../components/ParseStatsCard.vue'
import { setLanguage } from '../i18n'

describe('ParseStatsCard', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const defaultStats = {
    total_lines: 100,
    parsed_lines: 95,
    skipped_lines: 5,
    parse_rate: 0.95,
    detected_format: 'nginx',
    requested_format: 'auto',
    skipped_samples: []
  }

  it('renders correctly with stats and shadcn card wrapper', () => {
    const wrapper = mount(ParseStatsCard, {
      props: { stats: defaultStats }
    })

    expect(wrapper.find('[data-testid="parse-stats-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Parsing Quality')
    expect(wrapper.text()).toContain('95.0% Success')
    expect(wrapper.text()).toContain('Total Lines100')
    expect(wrapper.text()).toContain('Parsed95')
    expect(wrapper.text()).toContain('Skipped5')
  })

  it('shows warning when skipped_lines > 0', () => {
    const wrapper = mount(ParseStatsCard, {
      props: { stats: defaultStats }
    })

    expect(wrapper.find('.parse-warning').exists()).toBe(true)
    expect(wrapper.find('.value.warning').exists()).toBe(true)
  })

  it('does not show warning when skipped_lines is 0', () => {
    const wrapper = mount(ParseStatsCard, {
      props: {
        stats: { ...defaultStats, skipped_lines: 0, parse_rate: 1.0 }
      }
    })

    expect(wrapper.find('.parse-warning').exists()).toBe(false)
    expect(wrapper.find('.value.warning').exists()).toBe(false)
  })

  it('displays skipped samples when provided', () => {
    const statsWithSamples = {
      ...defaultStats,
      skipped_samples: [
        { line_number: 10, reason: 'Format mismatch', content: 'invalid line' }
      ]
    }

    const wrapper = mount(ParseStatsCard, {
      props: { stats: statsWithSamples }
    })

    expect(wrapper.find('.skipped-samples').exists()).toBe(true)
    expect(wrapper.text()).toContain('Line 10')
    expect(wrapper.text()).toContain('Format mismatch')
    expect(wrapper.text()).toContain('invalid line')
  })

  it('renders source files details when source_files exists', () => {
    const wrapper = mount(ParseStatsCard, {
      props: {
        stats: {
          ...defaultStats,
          source_files: [
            {
              filename: 'web-1.log',
              total_lines: 50,
              parsed_lines: 45,
              skipped_lines: 5,
              parse_rate: 0.9,
              detected_format: 'combined'
            }
          ]
        }
      }
    })

    expect(wrapper.text()).toContain('Source Files')
    expect(wrapper.text()).toContain('web-1.log')
    expect(wrapper.text()).toContain('Parsed Lines')
    expect(wrapper.text()).toContain('90.0%')
  })

  it('does not crash when source_files is missing', () => {
    const wrapper = mount(ParseStatsCard, {
      props: { stats: defaultStats }
    })

    expect(wrapper.find('.source-files').exists()).toBe(false)
  })
})
