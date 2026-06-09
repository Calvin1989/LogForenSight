import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TriagePanel from '../components/TriagePanel.vue'
import * as storage from '../utils/triageStorage'

// Mock i18n
vi.mock('../i18n', () => ({
  t: (key, params) => {
    if (key === 'triage.statusSummaryText') {
      return `Open: ${params.open} · Investigating: ${params.investigating} · Mitigated: ${params.mitigated} · False positive: ${params.falsePositive}`
    }
    return key
  }
}))

// Mock storage
vi.mock('../utils/triageStorage', () => ({
  getTriageState: vi.fn(() => ({})),
  saveTriageItem: vi.fn((caseId, key, data) => ({ [key]: data })),
  clearTriageState: vi.fn(),
  exportTriageSummary: vi.fn(() => '# Summary'),
  listTriageItems: vi.fn(() => []),
  getTriageStatusCounts: vi.fn((state = {}) => {
    const counts = { open: 0, investigating: 0, mitigated: 0, false_positive: 0 }
    Object.values(state).forEach((item) => {
      if (item?.status && counts[item.status] !== undefined) {
        counts[item.status] += 1
      }
    })
    return counts
  }),
  getTriageItemUpdatedAt: vi.fn((item) => item?.updated_at || item?.updatedAt || '')
}))

describe('TriagePanel.vue', () => {
  const mockAnalysisResult = {
    incidents: [{ incident_id: 'inc-1', title: 'Incident 1', summary: 'Desc 1' }],
    findings: [{ rule_id: 'rule-1', title: 'Finding 1', description: 'Desc 2' }]
  }
  const caseId = 'case-123'

  beforeEach(() => {
    vi.clearAllMocks()
    storage.getTriageState.mockReturnValue({})
    window.confirm = vi.fn(() => true)
  })

  it('renders empty state and fallback summary when no triage data', () => {
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: { incidents: [], findings: [] } }
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('triage.empty')
    expect(wrapper.text()).toContain('triage.noRecords')
  })

  it('renders triage status summary counts', () => {
    storage.getTriageState.mockReturnValue({
      'finding:rule-1': { status: 'open', priority: 'medium' },
      'finding:rule-2': { status: 'investigating', priority: 'high' },
      'incident:inc-1': { status: 'mitigated', priority: 'low' },
      'incident:inc-2': { status: 'false_positive', priority: 'low' }
    })

    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: { incidents: [], findings: [] } }
    })

    expect(wrapper.text()).toContain('Open: 1 · Investigating: 1 · Mitigated: 1 · False positive: 1')
    expect(wrapper.text()).toContain('triage.falsePositive')
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
    storage.getTriageState.mockReturnValue({
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

  it('shows last updated and analyst note metadata when available', () => {
    storage.getTriageState.mockReturnValue({
      'finding:rule-1': {
        status: 'investigating',
        priority: 'high',
        notes: 'Needs follow-up',
        updated_at: '2026-06-09T12:00:00Z'
      }
    })

    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })

    expect(wrapper.text()).toContain('triage.lastUpdated')
    expect(wrapper.text()).toContain('triage.analystNote')
    expect(wrapper.text()).toContain('Needs follow-up')
  })

  it('calls exportTriageSummary on export click', async () => {
    storage.getTriageState.mockReturnValue({ 'incident:inc-1': { status: 'open' } })
    const wrapper = mount(TriagePanel, {
      props: { caseId, analysisResult: mockAnalysisResult }
    })
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectURL = vi.fn(() => 'blob:url')
    const revokeObjectURL = vi.fn()
    window.URL.createObjectURL = createObjectURL
    window.URL.revokeObjectURL = revokeObjectURL
    
    // Mock anchor element and its click method
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    await wrapper.find('.action-btn').trigger('click')

    expect(storage.exportTriageSummary).toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalled()
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toContain('triage-summary')

    vi.restoreAllMocks()
  })
})
