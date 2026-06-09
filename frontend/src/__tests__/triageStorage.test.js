import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as storage from '../utils/triageStorage'

describe('triageStorage', () => {
  const caseId = 'test-case-123';
  const STORAGE_KEY = `ai-log-security-analyzer:triage:v1:${caseId}`;

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should get empty triage state initially', () => {
    expect(storage.getTriageState(caseId)).toEqual({})
  })

  it('should save and retrieve a triage item', () => {
    const itemKey = 'finding:rule-1';
    const data = { status: 'investigating', priority: 'high', notes: 'Testing' };
    
    storage.saveTriageItem(caseId, itemKey, data);
    
    const state = storage.getTriageState(caseId);
    expect(state[itemKey]).toBeDefined();
    expect(state[itemKey].status).toBe('investigating');
    expect(state[itemKey].updated_at).toBeDefined();
  })

  it('should list triage items', () => {
    storage.saveTriageItem(caseId, 'finding:1', { status: 'open', priority: 'low' });
    storage.saveTriageItem(caseId, 'incident:A', { status: 'mitigated', priority: 'high' });
    
    const items = storage.listTriageItems(caseId);
    expect(items).toHaveLength(2);
    expect(items.find(i => i.key === 'finding:1')).toBeDefined();
  })

  it('should delete a triage item', () => {
    storage.saveTriageItem(caseId, 'finding:1', { status: 'open' });
    storage.deleteTriageItem(caseId, 'finding:1');
    expect(storage.getTriageState(caseId)).toEqual({});
  })

  it('should clear triage state for a case', () => {
    storage.saveTriageItem(caseId, 'finding:1', { status: 'open' });
    storage.clearTriageState(caseId);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  })

  it('should export triage summary as markdown', () => {
    const analysisResult = { title: 'Test Analysis' };
    const triageState = {
      'finding:rule-1': { status: 'open', priority: 'high', notes: 'Notes', updated_at: '2023-01-01T10:00:00Z' }
    };
    
    const md = storage.exportTriageSummary(caseId, analysisResult, triageState);
    expect(md).toContain('# Analyst Triage Summary');
    expect(md).toContain('finding');
    expect(md).toContain('rule-1');
    expect(md).toContain('open');
  })

  it('should handle malformed JSON in localStorage', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, 'invalid-json')
    expect(storage.getTriageState(caseId)).toEqual({})
    expect(console.error).toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
