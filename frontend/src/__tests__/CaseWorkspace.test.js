import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CaseWorkspace from '../components/CaseWorkspace.vue'
import * as storage from '../utils/caseWorkspaceStorage'

// Mock i18n
vi.mock('../i18n', () => ({
  t: (key) => key
}))

// Mock storage
vi.mock('../utils/caseWorkspaceStorage', () => ({
  deleteCase: vi.fn(),
  clearCases: vi.fn(),
  exportCases: vi.fn(() => '[]'),
  importCases: vi.fn(),
  listCases: vi.fn(() => [])
}))

describe('CaseWorkspace.vue', () => {
  const mockCases = [
    {
      id: '1',
      title: 'Critical Attack',
      risk_level: 'CRITICAL',
      risk_score: 95,
      finding_count: 5,
      incident_count: 1,
      created_at: '2023-01-01T10:00:00Z',
      tags: ['sql-injection', 'prod']
    },
    {
      id: '2',
      title: 'Normal Traffic',
      risk_level: 'LOW',
      risk_score: 10,
      finding_count: 0,
      incident_count: 0,
      created_at: '2023-01-02T10:00:00Z',
      tags: ['test']
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    window.alert = vi.fn()
  })

  it('renders empty state when no cases', () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: [] }
    })
    expect(wrapper.text()).toContain('workspace.empty')
  })

  it('renders list of cases', () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    expect(wrapper.findAll('.case-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('Critical Attack')
    expect(wrapper.text()).toContain('Normal Traffic')
  })

  it('filters cases by search query', async () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    const searchInput = wrapper.find('.filter-input')
    await searchInput.setValue('Critical')
    
    expect(wrapper.findAll('.case-item')).toHaveLength(1)
    expect(wrapper.text()).toContain('Critical Attack')
  })

  it('filters cases by risk level', async () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    const riskSelect = wrapper.find('.filter-select')
    await riskSelect.setValue('LOW')
    
    expect(wrapper.findAll('.case-item')).toHaveLength(1)
    expect(wrapper.text()).toContain('Normal Traffic')
  })

  it('emits select event when a case is clicked', async () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    await wrapper.find('.case-main').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0][0]).toEqual(mockCases[0])
  })

  it('calls deleteCase and emits refresh on delete click', async () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    await wrapper.find('.delete-btn').trigger('click')
    expect(storage.deleteCase).toHaveBeenCalledWith('1')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('calls clearCases and emits refresh on clear all click', async () => {
    const wrapper = mount(CaseWorkspace, {
      props: { cases: mockCases }
    })
    await wrapper.find('.clear-btn').trigger('click')
    expect(storage.clearCases).toHaveBeenCalled()
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })
})
