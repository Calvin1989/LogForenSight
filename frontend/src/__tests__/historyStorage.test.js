import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRecentAnalyses, saveAnalysisRecord, updateAnalysisRecord, clearRecentAnalyses } from '../utils/historyStorage'

describe('historyStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('getRecentAnalyses returns [] when localStorage is empty', () => {
    expect(getRecentAnalyses()).toEqual([])
  })

  it('saveAnalysisRecord puts new record at the beginning', () => {
    const record1 = { id: '1', file_name: 'log1.log' }
    const record2 = { id: '2', file_name: 'log2.log' }
    
    saveAnalysisRecord(record1)
    const history = saveAnalysisRecord(record2)
    
    expect(history[0].id).toBe('2')
    expect(history[1].id).toBe('1')
  })

  it('saveAnalysisRecord limits to 5 records', () => {
    for (let i = 1; i <= 6; i++) {
      saveAnalysisRecord({ id: i.toString() })
    }
    const history = getRecentAnalyses()
    expect(history.length).toBe(5)
    expect(history[0].id).toBe('6')
    expect(history[4].id).toBe('2')
  })

  it('clearRecentAnalyses clears history', () => {
    saveAnalysisRecord({ id: '1' })
    clearRecentAnalyses()
    expect(getRecentAnalyses()).toEqual([])
  })

  it('returns [] when JSON in localStorage is corrupted', () => {
    // Mock console.warn to keep test output clean
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    localStorage.setItem('ai_log_security_analyzer_recent_analyses', 'invalid-json')
    
    const result = getRecentAnalyses()
    
    expect(result).toEqual([])
    expect(localStorage.getItem('ai_log_security_analyzer_recent_analyses')).toBeNull()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('updateAnalysisRecord can add sanitized_result to a record', () => {
    saveAnalysisRecord({ id: '1', file_name: 'log1.log' })
    const sanitizedData = { report_markdown: '# Sanitized' }
    
    const history = updateAnalysisRecord('1', { sanitized_result: sanitizedData })
    expect(history[0].sanitized_result).toEqual(sanitizedData)
    
    const stored = getRecentAnalyses()
    expect(stored[0].sanitized_result).toEqual(sanitizedData)
  })
})
