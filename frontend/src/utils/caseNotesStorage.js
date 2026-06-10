const STORAGE_KEY = 'logforensight.caseNotes.v1'
const DEFAULT_CASE_ID = 'current-analysis'
const NOTE_TYPES = ['observation', 'hypothesis', 'action', 'decision']

function normalizeCaseId(caseId) {
  return typeof caseId === 'string' && caseId.trim()
    ? caseId.trim()
    : DEFAULT_CASE_ID
}

function getStorageRoot() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return {}

  try {
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (error) {
    console.error('Failed to parse case notes storage:', error)
    return {}
  }
}

function saveStorageRoot(root) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root))
  } catch (error) {
    console.error('Failed to persist case notes storage:', error)
  }
}

function sortNotes(notes) {
  return [...notes].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt || left.createdAt || 0)
    const rightTime = Date.parse(right.updatedAt || right.createdAt || 0)

    if (rightTime !== leftTime) {
      return rightTime - leftTime
    }

    return String(right.id || '').localeCompare(String(left.id || ''))
  })
}

function normalizeNote(note) {
  if (!note || typeof note !== 'object') return null

  const createdAt = typeof note.createdAt === 'string' && note.createdAt
    ? note.createdAt
    : new Date().toISOString()
  const updatedAt = typeof note.updatedAt === 'string' && note.updatedAt
    ? note.updatedAt
    : createdAt
  const type = NOTE_TYPES.includes(note.type) ? note.type : 'observation'

  return {
    id: typeof note.id === 'string' && note.id ? note.id : createCaseNoteId(),
    type,
    title: typeof note.title === 'string' ? note.title : '',
    body: typeof note.body === 'string' ? note.body : '',
    createdAt,
    updatedAt
  }
}

function normalizeNotes(notes) {
  if (!Array.isArray(notes)) return []

  return sortNotes(
    notes
      .map((note) => normalizeNote(note))
      .filter(Boolean)
  )
}

export function createCaseNoteId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadCaseNotes(caseId) {
  const safeCaseId = normalizeCaseId(caseId)
  const root = getStorageRoot()
  return normalizeNotes(root[safeCaseId])
}

export function saveCaseNotes(caseId, notes) {
  const safeCaseId = normalizeCaseId(caseId)
  const root = getStorageRoot()
  const normalized = normalizeNotes(notes)
  root[safeCaseId] = normalized
  saveStorageRoot(root)
  return normalized
}

export function addCaseNote(caseId, note) {
  const now = new Date().toISOString()
  const nextNote = normalizeNote({
    ...note,
    createdAt: note?.createdAt || now,
    updatedAt: note?.updatedAt || now
  })

  return saveCaseNotes(caseId, [nextNote, ...loadCaseNotes(caseId)])
}

export function updateCaseNote(caseId, noteId, patch = {}) {
  if (!noteId) return loadCaseNotes(caseId)

  const notes = loadCaseNotes(caseId)
  const now = new Date().toISOString()
  const updatedNotes = notes.map((note) => {
    if (note.id !== noteId) return note

    return normalizeNote({
      ...note,
      ...patch,
      id: note.id,
      createdAt: note.createdAt,
      updatedAt: patch.updatedAt || now
    })
  })

  return saveCaseNotes(caseId, updatedNotes)
}

export function deleteCaseNote(caseId, noteId) {
  if (!noteId) return loadCaseNotes(caseId)
  return saveCaseNotes(caseId, loadCaseNotes(caseId).filter((note) => note.id !== noteId))
}

export function getCaseNotesSummary(caseId) {
  const notes = loadCaseNotes(caseId)
  const countsByType = NOTE_TYPES.reduce((accumulator, type) => {
    accumulator[type] = 0
    return accumulator
  }, {})

  notes.forEach((note) => {
    countsByType[note.type] = (countsByType[note.type] || 0) + 1
  })

  return {
    caseId: normalizeCaseId(caseId),
    total: notes.length,
    countsByType,
    lastUpdatedAt: notes[0]?.updatedAt || notes[0]?.createdAt || '',
    notes
  }
}

export function copyCaseNotes(fromCaseId, toCaseId) {
  return saveCaseNotes(toCaseId, loadCaseNotes(fromCaseId))
}

export { DEFAULT_CASE_ID, NOTE_TYPES, STORAGE_KEY }
