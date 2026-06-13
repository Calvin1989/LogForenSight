<template>
  <section class="upload-section">
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
      <label for="logFormat">{{ t('upload.logFormat') }}:</label>
      <select id="logFormat" v-model="logFormat" class="format-select">
        <option value="auto">{{ t('upload.autoDetect') }}</option>
        <option value="nginx">Nginx</option>
        <option value="apache">Apache</option>
      </select>
    </div>

    <Button
      @click="emitAnalyze"
      :disabled="selectedFiles.length === 0 || props.loading"
      size="lg"
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
  flex-direction: column;
  align-items: center;
  gap: 1.35rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(180deg, var(--surface-elevated) 0%, var(--shell-bg) 100%);
  border: 2px dashed var(--border);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.file-input-group {
  position: relative;
}

.options-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.format-select {
  padding: 0.48rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--surface-elevated);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.format-select:hover {
  border-color: var(--muted-foreground);
}

.format-select:focus-visible {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.2);
}

#logFile {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
}

.file-label {
  display: inline-block;
  min-width: 12rem;
  padding: 0.85rem 1.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.file-label:hover {
  border-color: #9ec5fe;
  background: #f4f9ff;
  box-shadow: 0 8px 20px rgba(13, 110, 253, 0.08);
}

#logFile:focus-visible + .file-label {
  outline: 3px solid rgba(13, 110, 253, 0.22);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .upload-section {
    align-items: stretch;
    padding: 1.25rem;
  }

  .options-group {
    align-items: stretch;
    flex-direction: column;
    gap: 0.45rem;
  }

  .file-label,
  .format-select {
    width: 100%;
  }
}

</style>
