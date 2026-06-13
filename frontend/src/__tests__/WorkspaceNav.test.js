import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import { setLanguage } from '../i18n'

const baseItems = [
  { key: 'workspace', labelKey: 'workspaceNav.workspace', descriptionKey: 'workspaceNav.workspaceDescription', disabled: false },
  { key: 'overview', labelKey: 'workspaceNav.overview', descriptionKey: 'workspaceNav.overviewDescription', disabled: true },
  { key: 'rules', labelKey: 'workspaceNav.rules', descriptionKey: 'workspaceNav.rulesDescription', disabled: false }
]

describe('WorkspaceNav.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('marks the current active view and disables locked entries', async () => {
    setLanguage('en')

    const wrapper = mount(WorkspaceNav, {
      props: {
        items: baseItems,
        activeView: 'workspace'
      }
    })

    const workspaceButton = wrapper.get('[data-testid="workspace-nav-workspace"]')
    const overviewButton = wrapper.get('[data-testid="workspace-nav-overview"]')

    expect(workspaceButton.attributes('aria-current')).toBe('page')
    expect(workspaceButton.classes()).toContain('active')
    expect(workspaceButton.find('.nav-dot.active').exists()).toBe(true)
    expect(overviewButton.attributes('disabled')).toBeDefined()
    expect(overviewButton.classes()).toContain('disabled')
    expect(overviewButton.find('.nav-dot.locked').exists()).toBe(true)
    expect(overviewButton.text()).toContain('Overview')

    await overviewButton.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('emits selected view for enabled entries', async () => {
    setLanguage('en')

    const wrapper = mount(WorkspaceNav, {
      props: {
        items: baseItems,
        activeView: 'workspace'
      }
    })

    await wrapper.get('[data-testid="workspace-nav-rules"]').trigger('click')

    expect(wrapper.emitted('select')).toEqual([['rules']])
    expect(wrapper.get('[data-testid="workspace-nav-rules"]').find('.nav-dot').exists()).toBe(true)
  })

  it('renders navigation labels in both zh and en', () => {
    setLanguage('zh')
    const zhWrapper = mount(WorkspaceNav, {
      props: {
        items: baseItems,
        activeView: 'workspace'
      }
    })

    expect(zhWrapper.text()).toContain('工作区导航')
    expect(zhWrapper.text()).toContain('工作区')
    expect(zhWrapper.text()).toContain('概览')

    setLanguage('en')
    const enWrapper = mount(WorkspaceNav, {
      props: {
        items: baseItems,
        activeView: 'workspace'
      }
    })

    expect(enWrapper.text()).toContain('Workspace Navigation')
    expect(enWrapper.text()).toContain('Workspace')
    expect(enWrapper.text()).toContain('Overview')
  })
})
