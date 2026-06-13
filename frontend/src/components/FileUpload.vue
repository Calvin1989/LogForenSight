<template>
  <section class="upload-section">
    <div class="upload-row">
      <div class="file-input-group">
        <input
          type="file"
          id="logFile"
          accept=".log,.txt"
          multiple
          @change="onFileChange"
        />
        <label for="logFile" class="file-label" data-testid="file-label">
          {{ selectedFileLabel }}
        </label>
      </div>

      <div class="options-group">
        <label for="logFormat">{{ t('upload.logFormat') }}</label>
        <select id="logFormat" v-model="logFormat" class="format-select">
          <option value="auto">{{ t('upload.autoDetect') }}</option>
          <option value="nginx">Nginx</option>
          <option value="apache">Apache</option>
        </select>
      </div>
    </div>

    <Button
      @click="emitAnalyze"
      :disabled="selectedFiles.length === 0 || props.loading"
      :aria-disabled="selectedFiles.length === 0 || props.loading"
      :aria-busy="props.loading"
      class="analyze-btn"
      :class="{ 'is-loading': props.loading }"
      data-testid="analyze-btn"
    >
      {{ analyzeButtonLabel }}
    </Button>

    <div v-if="props.loading" class="loading-status" data-testid="upload-loading-status">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>{{ t('upload.analysisInProgress') }}</span>
    </div>

    <div v-if="props.error && !props.loading" class="error-callout" role="alert" data-testid="upload-error-callout">
      <div class="error-title">{{ t('upload.analysisFailed') }}</div>
      <div class="error-reason">{{ props.error }}</div>
      <div class="error-hint">{{ t('upload.retryHint') }}</div>
    </div>

    <p v-if="selectedFiles.length === 0 && !props.loading" class="upload-hint" data-testid="upload-hint">
      {{ t('upload.selectFileHint') }}
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { t } from '../i18n'
import { Button } from '@/components/ui/button'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['analyze'])
const selectedFiles = ref([])
const logFormat = ref('auto')

const selectedFileLabel = computed(() => {
  if (selectedFiles.value.length === 1) {
    return selectedFiles.value[0].name
  }
  if (selectedFiles.value.length > 1) {
    return t('upload.selectedFiles', { count: selectedFiles.value.length })
  }
  return t('upload.chooseFile')
})

const analyzeButtonLabel = computed(() => {
  if (props.loading) {
    return t('actions.analyzing')
  }
  if (selectedFiles.value.length > 1) {
    return t('upload.analyzeFiles', { count: selectedFiles.value.length })
  }
  return t('actions.analyze')
})

const onFileChange = (event) => {
  selectedFiles.value = Array.from(event.target.files || [])
}

const emitAnalyze = () => {
  if (selectedFiles.value.length === 0) return
  const payload = selectedFiles.value.length === 1 ? selectedFiles.value[0] : selectedFiles.value
  emit('analyze', payload, logFormat.value)
}
</script>

<style scoped>
.upload-section {
  display: flex;
  align-items: stretch;
  gap: 0.875rem;
}

.upload-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.file-input-group {
  position: relative;
  flex: 1;
  min-width: 10rem;
}

.options-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.options-group label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.format-select {
  padding: 0.4375rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface-elevated);
  font-size: 0.8125rem;
  cursor: pointer;
  outline: none;
}

.format-select:focus-visible {
  border-color: var(--ring);
}

#logFile {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
}

.file-label {
  display: block;
  padding: 0.4375rem 0.75rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color 0.1s ease;
}

.file-label:hover {
  border-color: var(--ring);
}

#logFile:focus-visible + .file-label {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.analyze-btn {
  flex-shrink: 0;
}

.analyze-btn.is-loading {
  position: relative;
  pointer-events: none;
}

.analyze-btn.is-loading::after {
  content: '';
  display: inline-block;
  width: 0.75em;
  height: 0.75em;
  margin-left: 0.375rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

.upload-hint {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.loading-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.loading-spinner {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--border);
  border-top-color: var(--foreground);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-callout {
  margin-top: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: oklch(0.97 0.02 25);
  border: 1px solid oklch(0.88 0.06 25);
  border-left: 3px solid oklch(0.55 0.2 25);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.75rem;
  color: oklch(0.4 0.15 25);
}

.error-title {
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.error-reason {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.error-hint {
  font-size: 0.6875rem;
  color: oklch(0.5 0.12 25);
}

@media (max-width: 640px) {
  .upload-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.625rem;
  }

  .upload-row {
    flex-direction: column;
    align-items: stretch;
  }

  .options-group {
    justify-content: space-between;
  }

  .file-label,
  .format-select,
  .analyze-btn {
    width: 100%;
  }
}
</style>
