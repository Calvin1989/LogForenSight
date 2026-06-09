import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAnalysisState } from '../composables/useAnalysisState'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import * as api from '../api'
import * as historyStorage from '../utils/historyStorage'

// Mock the modules that use analysis API and historyStorage
vi.mock('../api', () => ({
  analyzeBatchFiles: vi.fn(),
  analyzeLogFile: vi.fn(),
  analyzeLogFileSanitized: vi.fn(),
  analyzeLogWithTuning: vi.fn(),
  fetchRuleConfig: vi.fn(() => Promise.resolve({}))
}))

vi.mock('../utils/historyStorage', () => ({
  getRecentAnalyses: vi.fn(() => []),
  saveAnalysisRecord: vi.fn((r) => [r]),
  updateAnalysisRecord: vi.fn((id, p) => []),
  clearRecentAnalyses: vi.fn()
}))

// Helper to test composable
const TestComponent = defineComponent({
  setup() {
    const state = useAnalysisState()
    return { ...state }
  },
  render() { return h('div') }
})

describe('useAnalysisState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchRuleConfig.mockResolvedValue({})
    historyStorage.getRecentAnalyses.mockReturnValue([])
    historyStorage.saveAnalysisRecord.mockImplementation((record) => [record])
    historyStorage.updateAnalysisRecord.mockImplementation(() => [])
  })

  it('clearCurrentResult clears all relevant states', async () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm

    // Set some state
    vm.result = { summary: {} }
    vm.error = 'some error'
    vm.selectedFile = new File([], 'test.log')
    vm.selectedRecordId = '123'
    vm.sanitizingReport = true

    vm.clearCurrentResult()

    expect(vm.result).toBeNull()
    expect(vm.error).toBeNull()
    expect(vm.selectedFile).toBeNull()
    expect(vm.selectedRecordId).toBeNull()
    expect(vm.sanitizingReport).toBe(false)
  })

  it('handleRestoreRecord restores result and related state', () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm
    
    const mockRecord = {
      id: '123',
      result: { summary: { total_requests: 10 } },
      log_format: 'nginx'
    }

    vm.handleRestoreRecord(mockRecord)

    expect(vm.result).toEqual(mockRecord.result)
    expect(vm.selectedLogFormat).toBe('nginx')
    expect(vm.selectedRecordId).toBe('123')
    expect(vm.selectedFile).toBeNull()
    expect(vm.error).toBeNull()
  })

  it('handleClearHistory clears recentAnalyses', () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm
    
    vm.recentAnalyses = [{ id: '1' }]
    vm.selectedRecordId = '1'

    vm.handleClearHistory()

    expect(vm.recentAnalyses).toEqual([])
    expect(vm.selectedRecordId).toBeNull()
  })

  it('handleAnalyze uses batch API when receiving multiple files', async () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm
    const files = [new File(['a'], 'first.log'), new File(['b'], 'second.log')]
    const mockResult = {
      analysis_mode: 'batch',
      summary: { total_requests: 2 },
      parse_stats: { parse_rate: 1, skipped_lines: 0, detected_format: 'combined' },
      incidents: [],
      findings: []
    }
    api.analyzeBatchFiles.mockResolvedValue(mockResult)

    await vm.handleAnalyze(files, 'auto')

    expect(api.analyzeBatchFiles).toHaveBeenCalledWith(files, { logFormat: 'auto' })
    expect(api.analyzeLogFile).not.toHaveBeenCalled()
    const savedRecord = historyStorage.saveAnalysisRecord.mock.calls[0][0]
    expect(savedRecord.file_name).toBe('Batch: first.log + 1 more')
    expect(savedRecord.analysis_mode).toBe('batch')
    expect(savedRecord.isBatch).toBe(true)
    expect(savedRecord.selectedFile).toBeUndefined()
  })

  it('handleAnalyze keeps single-file API for a one-item File array', async () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm
    const file = new File(['a'], 'single.log')
    const mockResult = {
      analysis_mode: 'single',
      summary: { total_requests: 1 },
      parse_stats: { parse_rate: 1, skipped_lines: 0, detected_format: 'nginx' },
      incidents: [],
      findings: []
    }
    api.analyzeLogFile.mockResolvedValue(mockResult)

    await vm.handleAnalyze([file], 'apache')

    expect(api.analyzeLogFile).toHaveBeenCalledWith(file, 'apache')
    expect(api.analyzeBatchFiles).not.toHaveBeenCalled()
  })
})
