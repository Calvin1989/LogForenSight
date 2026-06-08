<template>
  <section class="result-card">
    <div class="header-with-action">
      <h2>Markdown Report</h2>
      <div class="button-group">
        <button 
          @click="showPreview = !showPreview" 
          class="toggle-btn"
        >
          {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
        </button>
        <button 
          v-if="reportMarkdown" 
          @click="downloadRawReport" 
          class="download-btn raw"
        >
          Download Report (.md)
        </button>
        <button 
          v-if="reportMarkdown" 
          @click="$emit('download-sanitized')" 
          :disabled="sanitizing || !sanitizedAvailable"
          class="download-btn sanitized"
        >
          {{ sanitizing ? 'Processing...' : 'Download Sanitized (.md)' }}
        </button>
      </div>
    </div>
    
    <div v-if="!sanitizedAvailable" class="warning-banner">
      Sanitized download requires the original file. Please re-upload the log or use a history entry with cached sanitized result.
    </div>

    <div class="info-banner">
      Sanitized report masks IP addresses and sensitive parameters for safer sharing. Please review before external use.
    </div>

    <pre v-if="showPreview" class="report-preview">{{ reportMarkdown }}</pre>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  reportMarkdown: {
    type: String,
    required: true
  },
  sanitizing: {
    type: Boolean,
    default: false
  },
  sanitizedAvailable: {
    type: Boolean,
    default: true
  }
})

const showPreview = ref(true)

defineEmits(['download-sanitized'])

const triggerDownload = (content, filename) => {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadRawReport = () => {
  if (!props.reportMarkdown) return
  triggerDownload(props.reportMarkdown, 'security_report.md')
}
</script>

<style scoped>
.result-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-with-action h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #495057;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.download-btn {
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: #e9ecef;
}

.download-btn.raw {
  background-color: #28a745;
}
.download-btn.raw:hover {
  background-color: #218838;
}

.download-btn.sanitized {
  background-color: #17a2b8;
}
.download-btn.sanitized:hover:not(:disabled) {
  background-color: #138496;
}
.download-btn.sanitized:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.mini-error {
  font-size: 0.85rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.info-banner {
  font-size: 0.85rem;
  color: #666;
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-left: 4px solid #17a2b8;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
}

.warning-banner {
  font-size: 0.85rem;
  color: #856404;
  background-color: #fff3cd;
  padding: 0.75rem 1rem;
  border-left: 4px solid #ffc107;
  margin-bottom: 1rem;
  border-radius: 0 4px 4px 0;
}

.report-preview {
  background: #212529;
  color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  white-space: pre-wrap;
}
</style>
