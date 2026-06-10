<template>
  <section class="case-notes-container">
    <div class="case-notes-header">
      <div class="header-main">
        <h3>{{ t('caseNotes.title') }}</h3>
        <span class="local-badge">{{ t('caseNotes.localOnly') }}</span>
      </div>
      <button class="primary-btn" @click="startCreate">
        {{ isEditing ? t('caseNotes.cancel') : t('caseNotes.add') }}
      </button>
    </div>

    <div v-if="isEditing" class="editor-card">
      <div class="editor-grid">
        <label class="field">
          <span>{{ t('caseNotes.type') }}</span>
          <select v-model="draft.type">
            <option v-for="option in noteTypes" :key="option" :value="option">
              {{ t(`caseNotes.${option}`) }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>{{ t('caseNotes.noteTitle') }}</span>
          <input
            v-model="draft.title"
            type="text"
            maxlength="160"
            :placeholder="t('caseNotes.noteTitle')"
          >
        </label>
      </div>

      <label class="field">
        <span>{{ t('caseNotes.noteBody') }}</span>
        <textarea
          v-model="draft.body"
          rows="5"
          :placeholder="t('caseNotes.noteBody')"
        ></textarea>
      </label>

      <div class="editor-actions">
        <button class="primary-btn" @click="submitNote">
          {{ t('caseNotes.save') }}
        </button>
        <button class="secondary-btn" @click="cancelEdit">
          {{ t('caseNotes.cancel') }}
        </button>
      </div>
    </div>

    <div v-if="notes.length === 0" class="empty-state">
      {{ t('caseNotes.empty') }}
    </div>

    <div v-else class="notes-list">
      <article v-for="note in notes" :key="note.id" class="note-card">
        <div class="note-head">
          <div class="note-title-group">
            <span class="note-type-tag" :class="note.type">
              {{ t(`caseNotes.${note.type}`) }}
            </span>
            <h4>{{ note.title || t('caseNotes.untitled') }}</h4>
          </div>
          <div class="note-actions">
            <button class="link-btn" @click="startEdit(note)">
              {{ t('caseNotes.edit') }}
            </button>
            <button class="link-btn danger" @click="removeNote(note.id)">
              {{ t('caseNotes.delete') }}
            </button>
          </div>
        </div>

        <p class="note-body">{{ note.body || t('caseNotes.noBody') }}</p>

        <div class="note-meta">
          <span>{{ t('caseNotes.createdAt') }}: {{ formatTimestamp(note.createdAt) }}</span>
          <span>{{ t('caseNotes.updatedAt') }}: {{ formatTimestamp(note.updatedAt) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { t } from '../i18n'
import {
  NOTE_TYPES,
  addCaseNote,
  deleteCaseNote,
  loadCaseNotes,
  updateCaseNote
} from '../utils/caseNotesStorage'

const emit = defineEmits(['notes-change'])

const props = defineProps({
  caseId: {
    type: String,
    default: ''
  }
})

const noteTypes = NOTE_TYPES

const notes = ref(loadCaseNotes(props.caseId))
const editingNoteId = ref('')
const draft = reactive({
  type: 'observation',
  title: '',
  body: ''
})

watch(() => props.caseId, (newCaseId) => {
  notes.value = loadCaseNotes(newCaseId)
  cancelEdit()
  emit('notes-change', notes.value)
}, { immediate: true })

const isEditing = computed(() => Boolean(editingNoteId.value))

function resetDraft() {
  draft.type = 'observation'
  draft.title = ''
  draft.body = ''
}

function persist(nextNotes) {
  notes.value = nextNotes
  emit('notes-change', nextNotes)
}

function startCreate() {
  if (isEditing.value && editingNoteId.value === 'new') {
    cancelEdit()
    return
  }

  editingNoteId.value = 'new'
  resetDraft()
}

function startEdit(note) {
  editingNoteId.value = note.id
  draft.type = note.type
  draft.title = note.title
  draft.body = note.body
}

function cancelEdit() {
  editingNoteId.value = ''
  resetDraft()
}

function submitNote() {
  const payload = {
    type: draft.type,
    title: draft.title.trim(),
    body: draft.body.trim()
  }

  const nextNotes = editingNoteId.value === 'new'
    ? addCaseNote(props.caseId, payload)
    : updateCaseNote(props.caseId, editingNoteId.value, payload)

  persist(nextNotes)
  cancelEdit()
}

function removeNote(noteId) {
  persist(deleteCaseNote(props.caseId, noteId))
  if (editingNoteId.value === noteId) {
    cancelEdit()
  }
}

function formatTimestamp(value) {
  if (!value) return '-'

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}
</script>

<style scoped>
.case-notes-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.case-notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-main h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #212529;
}

.local-badge {
  font-size: 0.7rem;
  background: #f1f3f5;
  color: #6c757d;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.editor-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.field span {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.editor-actions,
.note-actions {
  display: flex;
  gap: 0.75rem;
}

.primary-btn,
.secondary-btn,
.link-btn {
  cursor: pointer;
  font-size: 0.85rem;
}

.primary-btn {
  background: #1971c2;
  color: white;
  border: 1px solid #1971c2;
  border-radius: 4px;
  padding: 0.5rem 0.9rem;
  font-weight: 600;
}

.primary-btn:hover {
  background: #1864ab;
}

.secondary-btn {
  background: white;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem 0.9rem;
}

.link-btn {
  background: none;
  border: none;
  color: #1971c2;
  padding: 0;
  text-decoration: underline;
}

.link-btn.danger {
  color: #c92a2a;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.note-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.note-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.note-title-group h4 {
  margin: 0;
  font-size: 1rem;
  color: #212529;
}

.note-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.note-type-tag.observation {
  background: #e7f5ff;
  color: #1971c2;
}

.note-type-tag.hypothesis {
  background: #f3f0ff;
  color: #6741d9;
}

.note-type-tag.action {
  background: #fff4e6;
  color: #d9480f;
}

.note-type-tag.decision {
  background: #ebfbee;
  color: #2b8a3e;
}

.note-body {
  margin: 0.85rem 0;
  white-space: pre-wrap;
  color: #495057;
}

.note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .case-notes-header,
  .note-head {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
