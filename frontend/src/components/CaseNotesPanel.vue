<template>
  <section class="case-notes-container">
    <div class="case-notes-header">
      <div class="header-main">
        <h3>{{ t('caseNotes.title') }}</h3>
        <span class="local-badge">{{ t('caseNotes.localOnly') }}</span>
      </div>
      <Button class="primary-btn" variant="default" size="sm" @click="startCreate">
        {{ isEditing ? t('caseNotes.cancel') : t('caseNotes.add') }}
      </Button>
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
        <Button class="primary-btn" variant="default" size="sm" @click="submitNote" data-testid="save-note-btn">
          {{ t('caseNotes.save') }}
        </Button>
        <Button variant="outline" size="sm" @click="cancelEdit">
          {{ t('caseNotes.cancel') }}
        </Button>
      </div>
    </div>

    <div class="save-feedback-slot" data-testid="save-feedback">
      <p v-if="saveFeedback" class="save-feedback">{{ saveFeedback }}</p>
    </div>

    <div v-if="notes.length === 0" class="empty-state" data-testid="case-notes-empty">
      <h4>{{ t('caseNotes.empty') }}</h4>
      <p>{{ t('caseNotes.emptyHint') }}</p>
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
            <Button class="link-btn" variant="link" size="sm" @click="startEdit(note)">
              {{ t('caseNotes.edit') }}
            </Button>
            <Button variant="link" size="sm" class="link-btn danger" @click="removeNote(note.id)">
              {{ t('caseNotes.delete') }}
            </Button>
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
import { Button } from '@/components/ui/button'
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
const saveFeedback = ref('')
let saveFeedbackTimer = null
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
  showSaveFeedback()
}

function showSaveFeedback() {
  saveFeedback.value = t('caseNotes.saved')
  if (saveFeedbackTimer) clearTimeout(saveFeedbackTimer)
  saveFeedbackTimer = window.setTimeout(() => {
    saveFeedback.value = ''
    saveFeedbackTimer = null
  }, 1800)
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
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  margin-top: 0;
}

.case-notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-main h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--foreground);
}

.local-badge {
  font-size: 0.5625rem;
  background: var(--muted);
  color: var(--text-tertiary);
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.editor-card {
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.625rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.625rem;
}

.field span {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  box-sizing: border-box;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--ring);
  outline: none;
}

.field textarea {
  resize: vertical;
}

.editor-actions,
.note-actions {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.save-feedback-slot {
  height: 1.5rem;
  display: flex;
  align-items: center;
}

.save-feedback {
  font-size: 0.75rem;
  font-weight: 600;
  color: oklch(0.4 0.12 145);
  margin: 0;
  animation: feedback-fade 1.8s ease forwards;
}

@keyframes feedback-fade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.empty-state h4 {
  margin: 0 0 0.25rem;
  font-size: 0.8125rem;
  color: var(--foreground);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.note-card {
  border: none;
  border-radius: 0;
  padding: 0.625rem 0.75rem;
  background: var(--surface-elevated);
}

.note-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.note-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.note-title-group h4 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--foreground);
}

.note-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.note-type-tag.observation {
  background: var(--accent);
  color: var(--foreground);
}

.note-type-tag.hypothesis {
  background: oklch(0.95 0.04 300);
  color: oklch(0.4 0.1 300);
}

.note-type-tag.action {
  background: oklch(0.97 0.04 60);
  color: oklch(0.45 0.1 60);
}

.note-type-tag.decision {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.note-body {
  margin: 0.5rem 0;
  white-space: pre-wrap;
  color: var(--text-secondary);
  font-size: 0.71875rem;
  line-height: 1.5;
}

.note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.625rem;
  color: var(--text-tertiary);
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

@media (max-width: 390px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .note-actions {
    flex-direction: column;
  }
}
</style>
