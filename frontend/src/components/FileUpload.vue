<template>
  <section class="upload-section">
    <div class="file-input-group">
      <input 
        type="file" 
        id="logFile" 
        accept=".log,.txt" 
        @change="onFileChange"
      />
      <label for="logFile" class="file-label">
        {{ internalSelectedFile ? internalSelectedFile.name : 'Choose a .log or .txt file' }}
      </label>
    </div>

    <div class="options-group">
      <label for="logFormat">Log Format:</label>
      <select id="logFormat" v-model="logFormat" class="format-select">
        <option value="auto">Auto Detect</option>
        <option value="nginx">Nginx</option>
        <option value="apache">Apache</option>
      </select>
    </div>

    <button 
      @click="$emit('analyze', internalSelectedFile, logFormat)" 
      :disabled="!internalSelectedFile || loading"
      class="analyze-btn"
    >
      {{ loading ? 'Analyzing...' : 'Analyze' }}
    </button>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyze'])
const internalSelectedFile = ref(null)
const logFormat = ref('auto')

const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    internalSelectedFile.value = file
  }
}
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
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
  padding: 0.4rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  outline: none;
}

.format-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

#logFile {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
}

.file-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-label:hover {
  border-color: #adb5bd;
  background: #f1f3f5;
}

.analyze-btn {
  padding: 0.75rem 2.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.analyze-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.analyze-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
