import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as storage from '../utils/caseWorkspaceStorage'

describe('caseWorkspaceStorage', () => {
  const STORAGE_KEY = 'ai-log-security-analyzer:case-workspace:v1'

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should list empty cases initially', () => {
    expect(storage.listCases()).toEqual([])
  })

  it('should save and list a case', () => {
    const mockCase = {
      id: 'case-1',
      title: 'Test Case',
      risk_score: 85,
      finding_count: 10,
      incident_count: 2,
      result_snapshot: { summary: {} }
    }

    const saved = storage.saveCase(mockCase)
    expect(saved.title).toBe('Test Case')
    expect(saved.created_at).toBeDefined()
    expect(saved.updated_at).toBeDefined()

    const list = storage.listCases()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('case-1')
  })

  it('should get a case by id', () => {
    const mockCase = { id: 'case-1', title: 'Test' }
    storage.saveCase(mockCase)
    
    const fetched = storage.getCase('case-1')
    expect(fetched.title).toBe('Test')
    
    expect(storage.getCase('non-existent')).toBeNull()
  })

  it('should delete a case', () => {
    storage.saveCase({ id: 'case-1', title: 'Test 1' })
    storage.saveCase({ id: 'case-2', title: 'Test 2' })
    
    storage.deleteCase('case-1')
    
    const list = storage.listCases()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('case-2')
  })

  it('should clear all cases', () => {
    storage.saveCase({ id: 'case-1', title: 'Test' })
    storage.clearCases()
    expect(storage.listCases()).toEqual([])
  })

  it('should export cases as JSON', () => {
    const mockCase = { id: 'case-1', title: 'Test' }
    storage.saveCase(mockCase)
    
    const exported = storage.exportCases()
    const parsed = JSON.parse(exported)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe('case-1')
  })

  it('should import cases', () => {
    const importData = [
      { id: 'imp-1', title: 'Imported 1' },
      { id: 'imp-2', title: 'Imported 2' }
    ]
    
    storage.importCases(importData)
    const list = storage.listCases()
    expect(list).toHaveLength(2)
    expect(list.some(c => c.id === 'imp-1')).toBe(true)
  })

  it('should throw error when saving File objects', () => {
    const mockCase = {
      id: 'case-err',
      title: 'Error Case',
      file: new File([''], 'test.log')
    }
    
    expect(() => storage.saveCase(mockCase)).toThrow()
  })

  it('should handle malformed JSON in localStorage', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, 'invalid-json')
    expect(storage.listCases()).toEqual([])
    expect(console.error).toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
