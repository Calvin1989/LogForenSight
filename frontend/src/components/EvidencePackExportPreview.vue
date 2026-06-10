<template>
  <section class="preview-container">
    <div class="preview-header">
      <div>
        <h3>{{ t('evidencePackPreview.title') }}</h3>
        <p v-if="result" class="summary-text">
          {{ t('evidencePackPreview.previewLabel') }}
        </p>
      </div>

      <div v-if="result" class="preview-actions">
        <button type="button" class="preview-btn" @click="togglePreview">
          {{ isOpen ? t('evidencePackPreview.hidePreview') : t('evidencePackPreview.showPreview') }}
        </button>
        <button type="button" class="preview-btn copy-btn" @click="copyMarkdown">
          {{ t('evidencePackPreview.copyMarkdown') }}
        </button>
      </div>
    </div>

    <div v-if="!result" class="empty-state">
      {{ t('evidencePackPreview.empty') }}
    </div>

    <template v-else>
      <p
        v-if="copyFeedbackKey"
        class="copy-feedback"
        :class="{ error: copyFeedbackKey === 'evidencePackPreview.copyFailed' }"
      >
        {{ t(copyFeedbackKey) }}
      </p>

      <div v-if="isOpen" class="preview-body">
        <div class="preview-label">{{ t('evidencePackPreview.previewLabel') }}</div>
        <pre data-testid="evidence-pack-preview" class="preview-markdown">{{ previewMarkdown }}</pre>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { currentLanguage, t } from '../i18n'
import { buildEvidencePackMarkdown } from '../utils/evidencePackExport'

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  triageState: {
    type: Object,
    default: () => ({})
  },
  caseNotes: {
    type: Array,
    default: () => []
  },
  reviewReadiness: {
    type: Object,
    default: null
  },
  evidencePackQuality: {
    type: Object,
    default: null
  },
  exportGuardrails: {
    type: Object,
    default: null
  },
  caseId: {
    type: String,
    default: 'current-analysis'
  }
})

const isOpen = ref(false)
const copyFeedbackKey = ref('')
let copyFeedbackTimer = null

const previewMarkdown = computed(() => {
  currentLanguage.value

  if (!props.result) {
    return ''
  }

  const options = {
    caseId: props.caseId,
    triageState: props.triageState,
    caseNotes: props.caseNotes,
    language: currentLanguage.value
  }

  if (props.reviewReadiness) {
    options.reviewReadiness = props.reviewReadiness
  }

  if (props.evidencePackQuality) {
    options.evidencePackQuality = props.evidencePackQuality
  }

  if (props.exportGuardrails) {
    options.evidencePackExportGuardrails = props.exportGuardrails
  }

  return buildEvidencePackMarkdown(props.result, options)
})

function togglePreview() {
  isOpen.value = !isOpen.value
}

function showCopyFeedback(key) {
  copyFeedbackKey.value = key

  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer)
  }

  copyFeedbackTimer = window.setTimeout(() => {
    copyFeedbackKey.value = ''
    copyFeedbackTimer = null
  }, 1800)
}

function fallbackCopy(text) {
  if (typeof document === 'undefined' || !document.body) {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    return typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyMarkdown() {
  if (!previewMarkdown.value) {
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(previewMarkdown.value)
      showCopyFeedback('evidencePackPreview.copySuccess')
      return
    }
  } catch {
    if (fallbackCopy(previewMarkdown.value)) {
      showCopyFeedback('evidencePackPreview.copySuccess')
      return
    }
  }

  if (fallbackCopy(previewMarkdown.value)) {
    showCopyFeedback('evidencePackPreview.copySuccess')
    return
  }

  showCopyFeedback('evidencePackPreview.copyFailed')
}

onBeforeUnmount(() => {
  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer)
  }
})
</script>

<style scoped>
.preview-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.preview-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preview-btn {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 0.5rem 0.85rem;
  background: #f8f9fa;
  color: #212529;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.preview-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.copy-btn {
  background: #eef7ff;
  border-color: #b6d4fe;
  color: #0b5ed7;
}

.copy-feedback {
  margin: 1rem 0 0;
  color: #2b8a3e;
  font-size: 0.92rem;
  font-weight: 600;
}

.copy-feedback.error {
  color: #c92a2a;
}

.preview-body {
  margin-top: 1rem;
}

.preview-label {
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 700;
}

.preview-markdown {
  margin: 0;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
  color: #212529;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 26rem;
  overflow: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
  }

  .preview-actions {
    width: 100%;
  }
}
</style>
