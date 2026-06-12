import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import { setLanguage } from '../i18n'

const baseItems = [
  { key: 'workspace', labelKey: 'workspaceNav.workspace', disabled: false },
  { key: 'overview', labelKey: 'workspaceNav.overview', disabled: true },
  { key: 'rules', labelKey: 'workspaceNav.rules', disabled: false }
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
    expect(overviewButton.attributes('disabled')).toBeDefined()
    expect(overviewButton.text()).toContain('Locked')

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
  })

  it('renders navigation copy in both zh and en', () => {
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
