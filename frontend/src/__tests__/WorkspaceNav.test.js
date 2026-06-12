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
    expect(workspaceButton.text()).toContain('Current')
    expect(overviewButton.attributes('disabled')).toBeDefined()
    expect(overviewButton.text()).toContain('Locked')
    expect(overviewButton.text()).toContain('Scan the summary')

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
    expect(wrapper.get('[data-testid="workspace-nav-rules"]').text()).toContain('Ready')
  })

  it('renders navigation copy and helper text in both zh and en', () => {
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
    expect(zhWrapper.text()).toContain('上传日志、查看最近分析')
    expect(zhWrapper.get('[data-testid="workspace-nav-helper"]').text()).toContain('结果型视图会在完成一次分析后自动解锁')

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
    expect(enWrapper.text()).toContain('Start new log analysis')
    expect(enWrapper.get('[data-testid="workspace-nav-helper"]').text()).toContain('Result-focused views unlock automatically')
  })
})
