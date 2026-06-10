import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CaseNotesPanel from '../components/CaseNotesPanel.vue'

let noteStore = {}

vi.mock('../i18n', () => ({
  t: (key) => {
    const labels = {
      'caseNotes.title': 'Case Notes / Decision Log',
      'caseNotes.localOnly': 'Local storage only',
      'caseNotes.add': 'Add Note',
      'caseNotes.type': 'Type',
      'caseNotes.observation': 'Observation',
      'caseNotes.hypothesis': 'Hypothesis',
      'caseNotes.action': 'Action',
      'caseNotes.decision': 'Decision',
      'caseNotes.noteTitle': 'Note Title',
      'caseNotes.noteBody': 'Note Body',
      'caseNotes.save': 'Save Note',
      'caseNotes.delete': 'Delete',
      'caseNotes.edit': 'Edit',
      'caseNotes.cancel': 'Cancel',
      'caseNotes.createdAt': 'Created at',
      'caseNotes.updatedAt': 'Updated at',
      'caseNotes.empty': 'No case notes yet',
      'caseNotes.untitled': 'Untitled note',
      'caseNotes.noBody': 'No note body provided.'
    }
    return labels[key] || key
  }
}))

vi.mock('../utils/caseNotesStorage', () => ({
  NOTE_TYPES: ['observation', 'hypothesis', 'action', 'decision'],
  loadCaseNotes: vi.fn((caseId = 'default') => [...(noteStore[caseId || 'default'] || [])]),
  addCaseNote: vi.fn((caseId = 'default', note) => {
    const key = caseId || 'default'
    const newNote = {
      id: `note-${Date.now()}`,
      type: note.type,
      title: note.title,
      body: note.body,
      createdAt: '2026-06-10T10:00:00.000Z',
      updatedAt: '2026-06-10T10:00:00.000Z'
    }
    noteStore[key] = [newNote, ...(noteStore[key] || [])]
    return [...noteStore[key]]
  }),
  updateCaseNote: vi.fn((caseId = 'default', noteId, patch) => {
    const key = caseId || 'default'
    noteStore[key] = (noteStore[key] || []).map((note) => (
      note.id === noteId
        ? { ...note, ...patch, updatedAt: '2026-06-10T11:00:00.000Z' }
        : note
    ))
    return [...noteStore[key]]
  }),
  deleteCaseNote: vi.fn((caseId = 'default', noteId) => {
    const key = caseId || 'default'
    noteStore[key] = (noteStore[key] || []).filter((note) => note.id !== noteId)
    return [...noteStore[key]]
  })
}))

describe('CaseNotesPanel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    noteStore = {}
  })

  it('renders empty state', () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    expect(wrapper.text()).toContain('No case notes yet')
  })

  it('adds a note', async () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    await wrapper.find('.primary-btn').trigger('click')
    await wrapper.find('input').setValue('Suspicious pattern')
    await wrapper.find('textarea').setValue('Observed repeated 401 responses.')
    await wrapper.find('.editor-actions .primary-btn').trigger('click')

    expect(wrapper.text()).toContain('Suspicious pattern')
    expect(wrapper.text()).toContain('Observed repeated 401 responses.')
  })

  it('edits a note', async () => {
    noteStore['case-1'] = [{
      id: 'note-1',
      type: 'observation',
      title: 'Before edit',
      body: 'Original body',
      createdAt: '2026-06-10T09:00:00.000Z',
      updatedAt: '2026-06-10T09:00:00.000Z'
    }]

    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    await wrapper.find('.note-actions .link-btn').trigger('click')
    await wrapper.find('input').setValue('After edit')
    await wrapper.find('textarea').setValue('Updated body')
    await wrapper.find('.editor-actions .primary-btn').trigger('click')

    expect(wrapper.text()).toContain('After edit')
    expect(wrapper.text()).toContain('Updated body')
  })

  it('deletes a note', async () => {
    noteStore['case-1'] = [{
      id: 'note-1',
      type: 'observation',
      title: 'Delete me',
      body: 'To be removed',
      createdAt: '2026-06-10T09:00:00.000Z',
      updatedAt: '2026-06-10T09:00:00.000Z'
    }]

    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    await wrapper.find('.note-actions .link-btn.danger').trigger('click')

    expect(wrapper.text()).not.toContain('Delete me')
    expect(wrapper.text()).toContain('No case notes yet')
  })

  it('supports type labels', () => {
    noteStore['case-1'] = [{
      id: 'note-1',
      type: 'decision',
      title: 'Block source',
      body: 'Apply temporary block.',
      createdAt: '2026-06-10T09:00:00.000Z',
      updatedAt: '2026-06-10T09:00:00.000Z'
    }]

    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    expect(wrapper.text()).toContain('Decision')
  })

  it('emits and persists notes correctly', async () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })

    await wrapper.find('.primary-btn').trigger('click')
    await wrapper.find('select').setValue('hypothesis')
    await wrapper.find('input').setValue('Possible credential stuffing')
    await wrapper.find('textarea').setValue('Need to validate against other signals.')
    await wrapper.find('.editor-actions .primary-btn').trigger('click')

    const emissions = wrapper.emitted('notes-change')
    expect(emissions).toBeTruthy()
    expect(noteStore['case-1']).toHaveLength(1)
    expect(noteStore['case-1'][0].type).toBe('hypothesis')
    expect(emissions.at(-1)?.[0][0].title).toBe('Possible credential stuffing')
  })
})
