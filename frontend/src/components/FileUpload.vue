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

    <button 
      @click="emitAnalyze"
      :disabled="selectedFiles.length === 0 || props.loading"
      class="analyze-btn"
    >
      {{ analyzeButtonLabel }}
    </button>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { t } from '../i18n'

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
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2px dashed #d7e3f1;
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
  color: #495057;
}

.format-select {
  padding: 0.48rem 0.8rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.format-select:hover {
  border-color: #adb5bd;
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
  background: white;
  border: 1px solid #ced4da;
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

.analyze-btn {
  padding: 0.78rem 2.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.analyze-btn:hover:not(:disabled) {
  background-color: #0056b3;
  box-shadow: 0 10px 22px rgba(0, 86, 179, 0.18);
}

.analyze-btn:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.22);
  outline-offset: 3px;
}

.analyze-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
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
  .analyze-btn,
  .format-select {
    width: 100%;
  }
}


/* Frontend-wide interaction polish */
:where(button, [role="button"], input, select, textarea, a):focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.22);
  outline-offset: 2px;
}

:where(button, [role="button"]) {
  -webkit-tap-highlight-color: transparent;
}

:where(input, select, textarea) {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  :where(*) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

</style>
