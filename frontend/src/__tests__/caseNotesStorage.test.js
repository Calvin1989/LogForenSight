import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEY,
  addCaseNote,
  deleteCaseNote,
  getCaseNotesSummary,
  loadCaseNotes,
  saveCaseNotes,
  updateCaseNote
} from '../utils/caseNotesStorage'

describe('caseNotesStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('load empty returns []', () => {
    expect(loadCaseNotes('case-1')).toEqual([])
  })

  it('add note works', () => {
    const notes = addCaseNote('case-1', {
      type: 'observation',
      title: 'Suspicious login pattern',
      body: 'Repeated 401 responses from the same IP.'
    })

    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({
      type: 'observation',
      title: 'Suspicious login pattern',
      body: 'Repeated 401 responses from the same IP.'
    })
    expect(notes[0].id).toBeTruthy()
    expect(notes[0].createdAt).toBeTruthy()
    expect(notes[0].updatedAt).toBeTruthy()
  })

  it('update note works', () => {
    const [created] = addCaseNote('case-1', {
      type: 'hypothesis',
      title: 'Credential stuffing',
      body: 'Could be automated login attempts.'
    })

    const notes = updateCaseNote('case-1', created.id, {
      type: 'decision',
      title: 'Escalate to SecOps',
      body: 'Need immediate review.'
    })

    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({
      id: created.id,
      type: 'decision',
      title: 'Escalate to SecOps',
      body: 'Need immediate review.',
      createdAt: created.createdAt
    })
    expect(notes[0].updatedAt).not.toBe(created.createdAt)
  })

  it('delete note works', () => {
    const [created] = addCaseNote('case-1', {
      type: 'action',
      title: 'Temporary block',
      body: 'Block the source IP on WAF.'
    })

    expect(deleteCaseNote('case-1', created.id)).toEqual([])
  })

  it('corrupted localStorage fallback works', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, '{invalid-json')

    expect(loadCaseNotes('case-1')).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('notes are scoped by caseId', () => {
    addCaseNote('case-a', {
      type: 'observation',
      title: 'A',
      body: 'Case A'
    })
    addCaseNote('case-b', {
      type: 'decision',
      title: 'B',
      body: 'Case B'
    })

    expect(loadCaseNotes('case-a')).toHaveLength(1)
    expect(loadCaseNotes('case-a')[0].title).toBe('A')
    expect(loadCaseNotes('case-b')).toHaveLength(1)
    expect(loadCaseNotes('case-b')[0].title).toBe('B')
  })

  it('gracefully falls back when caseId is missing', () => {
    addCaseNote('', {
      type: 'observation',
      title: 'No case id',
      body: 'Uses the default context.'
    })

    expect(loadCaseNotes()).toHaveLength(1)
  })

  it('sorts notes by updatedAt descending', () => {
    saveCaseNotes('case-sort', [
      {
        id: 'older',
        type: 'observation',
        title: 'Older',
        body: 'Older note',
        createdAt: '2026-06-09T10:00:00.000Z',
        updatedAt: '2026-06-09T10:00:00.000Z'
      },
      {
        id: 'newer',
        type: 'decision',
        title: 'Newer',
        body: 'Newer note',
        createdAt: '2026-06-09T11:00:00.000Z',
        updatedAt: '2026-06-09T12:00:00.000Z'
      }
    ])

    expect(loadCaseNotes('case-sort').map((note) => note.id)).toEqual(['newer', 'older'])
  })

  it('returns summary metadata', () => {
    saveCaseNotes('case-summary', [
      {
        id: '1',
        type: 'observation',
        title: 'Observed',
        body: 'Body',
        createdAt: '2026-06-09T10:00:00.000Z',
        updatedAt: '2026-06-09T10:00:00.000Z'
      },
      {
        id: '2',
        type: 'decision',
        title: 'Decided',
        body: 'Body',
        createdAt: '2026-06-09T11:00:00.000Z',
        updatedAt: '2026-06-09T11:30:00.000Z'
      }
    ])

    expect(getCaseNotesSummary('case-summary')).toMatchObject({
      total: 2,
      lastUpdatedAt: '2026-06-09T11:30:00.000Z',
      countsByType: {
        observation: 1,
        hypothesis: 0,
        action: 0,
        decision: 1
      }
    })
  })
})
