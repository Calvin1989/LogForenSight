import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAnalysisState } from '../composables/useAnalysisState'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

// Mock the modules that use analysis API and historyStorage
vi.mock('../api', () => ({
  analyzeLogFile: vi.fn(),
  analyzeLogFileSanitized: vi.fn(),
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
})
