import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TriagePanel from '../components/TriagePanel.vue'
import * as storage from '../utils/triageStorage'

// Mock i18n
vi.mock('../i18n', () => ({
  t: (key) => key
}))

// Mock storage
vi.mock('../utils/triageStorage', () => ({
  getTriageState: vi.fn(() => ({})),
  saveTriageItem: vi.fn((caseId, key, data) => ({ [key]: data })),
  clearTriageState: vi.fn(),
  exportTriageSummary: vi.fn(() => '# Summary'),
  listTriageItems: vi.fn(() => [])
}))

describe('TriagePanel.vue', () => {
  const mockAnalysisResult = {
    incidents: [{ id: 'inc-1', title: 'Incident 1', description: 'Desc 1' }],
    findings: [{ rule_id: 'rule-1', title: 'Finding 1', description: 'Desc 2' }]
  }
  const caseId = 'case-123'

  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

  it('renders empty state when no triage data', () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: { incidents: [], findings: [] } }
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('triage.empty')
  })

  it('renders findings and incidents', () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    const rows = wrapper.findAll('.triage-row')
    expect(rows).toHaveLength(2)
    expect(wrapper.text()).toContain('Incident 1')
    expect(wrapper.text()).toContain('Finding 1')
  })

  it('updates status when changed', async () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    const select = wrapper.find('.triage-row select')
    await select.setValue('investigating')
    
    expect(storage.saveTriageItem).toHaveBeenCalled()
    expect(storage.saveTriageItem.mock.calls[0][1]).toBe('incident:inc-1')
    expect(storage.saveTriageItem.mock.calls[0][2].status).toBe('investigating')
  })

  it('updates priority when changed', async () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    const prioritySelect = wrapper.findAll('.triage-row select')[1]
    await prioritySelect.setValue('critical')
    
    expect(storage.saveTriageItem).toHaveBeenCalled()
    expect(storage.saveTriageItem.mock.calls[0][2].priority).toBe('critical')
  })

  it('updates notes on blur', async () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('New notes')
    await textarea.trigger('blur')
    
    expect(storage.saveTriageItem).toHaveBeenCalled()
    expect(storage.saveTriageItem.mock.calls[0][2].notes).toBe('New notes')
  })

  it('filters by status', async () => {
    // Mock storage to return one triaged item
    storage.getTriageState.mockReturnValueOnce({
      'incident:inc-1': { status: 'mitigated', priority: 'medium' }
    })
    
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    
    const statusFilter = wrapper.find('.triage-controls .filter-select')
    await statusFilter.setValue('open')
    
    // Incident 1 is mitigated, Finding 1 is open (default)
    expect(wrapper.findAll('.triage-row')).toHaveLength(1)
    expect(wrapper.text()).toContain('Finding 1')
  })

  it('calls exportTriageSummary on export click', async () => {
    storage.getTriageState.mockReturnValueOnce({ 'incident:inc-1': { status: 'open' } })
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    
    // Mock URL.createObjectURL
    window.URL.createObjectURL = vi.fn(() => 'blob:url')
    window.URL.revokeObjectURL = vi.fn()
    
    await wrapper.find('.action-btn').trigger('click')
    expect(storage.exportTriageSummary).toHaveBeenCalled()
  })
})
