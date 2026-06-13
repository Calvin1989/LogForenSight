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
        <label for="logFile" class="file-label">
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
      class="analyze-btn"
    >
      {{ analyzeButtonLabel }}
    </Button>
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

.upload-hint {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 0.25rem;
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
