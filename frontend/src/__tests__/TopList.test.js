import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TopList from '../components/TopList.vue'
import { setLanguage } from '../i18n'

describe('TopList', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const defaultProps = {
    title: 'Top IPs',
    itemKey: 'ip',
    itemLabel: 'IP Address',
    items: [
      { ip: '192.168.1.10', count: 12 },
      { ip: '10.0.0.5', count: 7 }
    ]
  }

  it('renders title, item label, count label, and rows', () => {
    const wrapper = mount(TopList, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('Top IPs')
    expect(wrapper.text()).toContain('IP Address')
    expect(wrapper.text()).toContain('Count')
    expect(wrapper.text()).toContain('192.168.1.10')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('10.0.0.5')
    expect(wrapper.text()).toContain('7')
  })

  it('preserves item-cell title attribute for truncated values', () => {
    const wrapper = mount(TopList, {
      props: defaultProps
    })

    const cells = wrapper.findAll('.item-cell')
    expect(cells[0].attributes('title')).toBe('192.168.1.10')
    expect(cells[1].attributes('title')).toBe('10.0.0.5')
  })

  it('has root data-testid="top-list"', () => {
    const wrapper = mount(TopList, {
      props: defaultProps
    })

    expect(wrapper.find('[data-testid="top-list"]').exists()).toBe(true)
  })

  it('renders Chinese common.count when setLanguage(\'zh\')', () => {
    setLanguage('zh')
    const wrapper = mount(TopList, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('数量')
  })

  it('renders English common.count when setLanguage(\'en\')', () => {
    setLanguage('en')
    const wrapper = mount(TopList, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('Count')
  })
})
