<template>
  <div class="stats-card">
    <div class="card-header">
      <h3>{{ t('parse.title') }}</h3>
      <div class="parse-rate" :class="rateClass">
        {{ (stats.parse_rate * 100).toFixed(1) }}% {{ t('parse.success') }}
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <span class="label">{{ t('parse.totalLines') }}</span>
        <span class="value">{{ stats.total_lines }}</span>
      </div>
      <div class="stat-item">
        <span class="label">{{ t('parse.parsed') }}</span>
        <span class="value success">{{ stats.parsed_lines }}</span>
      </div>
      <div class="stat-item">
        <span class="label">{{ t('parse.skipped') }}</span>
        <span class="value" :class="{ 'warning': stats.skipped_lines > 0 }">{{ stats.skipped_lines }}</span>
      </div>
    </div>

    <div class="format-info">
      <span>{{ t('parse.format') }}: <strong>{{ stats.detected_format }}</strong></span>
      <span class="separator">|</span>
      <span>{{ t('parse.requested') }}: <strong>{{ stats.requested_format }}</strong></span>
    </div>

    <div v-if="stats.skipped_lines > 0" class="parse-warning">
      <span class="icon">⚠️</span>
      <span class="text">{{ t('parse.warning') }}</span>
    </div>

    <div v-if="stats.skipped_samples && stats.skipped_samples.length > 0" class="skipped-samples">
      <h4>{{ t('parse.skippedSamples') }}</h4>
      <div v-for="sample in stats.skipped_samples" :key="sample.line_number" class="sample-item">
        <div class="sample-meta">
          <span class="line-num">{{ t('common.line') }} {{ sample.line_number }}</span>
          <span class="reason">{{ sample.reason }}</span>
        </div>
        <pre class="sample-content">{{ sample.content }}</pre>
      </div>
    </div>

    <div v-if="sourceFiles.length > 0" class="source-files">
      <h4>{{ t('parse.sourceFiles') }}</h4>
      <div class="source-files-table">
        <div class="source-row source-header">
          <span>{{ t('parse.filename') }}</span>
          <span>{{ t('parse.totalLines') }}</span>
          <span>{{ t('parse.parsedLines') }}</span>
          <span>{{ t('parse.skippedLines') }}</span>
          <span>{{ t('parse.parseRate') }}</span>
          <span>{{ t('parse.detectedFormat') }}</span>
        </div>
        <div v-for="file in sourceFiles" :key="file.filename" class="source-row">
          <span>{{ file.filename }}</span>
          <span>{{ file.total_lines }}</span>
          <span>{{ file.parsed_lines }}</span>
          <span>{{ file.skipped_lines }}</span>
          <span>{{ ((file.parse_rate || 0) * 100).toFixed(1) }}%</span>
          <span>{{ file.detected_format }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { currentAnalysisResult } from '../composables/useAnalysisState'
import { t } from '../i18n'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const rateClass = computed(() => {
  if (props.stats.parse_rate >= 0.95) return 'rate-good'
  if (props.stats.parse_rate >= 0.8) return 'rate-warn'
  return 'rate-bad'
})

const sourceFiles = computed(() => {
  if (Array.isArray(props.stats?.source_files)) {
    return props.stats.source_files
  }
  if (Array.isArray(currentAnalysisResult.value?.source_files)) {
    return currentAnalysisResult.value.source_files
  }
  return []
})
</script>

<style scoped>
.stats-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #495057;
}

.parse-rate {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.rate-good { background: #ebfbee; color: #2b8a3e; }
.rate-warn { background: #fff9db; color: #f08c00; }
.rate-bad { background: #fff5f5; color: #e03131; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 0.75rem;
  color: #868e96;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-item .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
}

.value.success { color: #2b8a3e; }
.value.warning { color: #f08c00; }

.format-info {
  font-size: 0.8rem;
  color: #6c757d;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f3f5;
}

.separator {
  margin: 0 0.5rem;
  color: #dee2e6;
}

.parse-warning {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff9db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parse-warning .icon { font-size: 1rem; }
.parse-warning .text {
  font-size: 0.8rem;
  color: #856404;
  font-weight: 500;
}

.skipped-samples {
  margin-top: 1.5rem;
  border-top: 1px solid #f1f3f5;
  padding-top: 1rem;
}

.skipped-samples h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.sample-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.sample-item:last-child {
  margin-bottom: 0;
}

.sample-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.line-num {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6c757d;
}

.reason {
  font-size: 0.7rem;
  color: #e03131;
  font-family: monospace;
  background: #fff5f5;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.sample-content {
  margin: 0;
  font-family: monospace;
  font-size: 0.8rem;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-all;
}

.source-files {
  margin-top: 1.5rem;
  border-top: 1px solid #f1f3f5;
  padding-top: 1rem;
}

.source-files h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.source-files-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.source-row {
  display: grid;
  grid-template-columns: minmax(140px, 2fr) repeat(5, minmax(70px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  font-size: 0.8rem;
  border-top: 1px solid #f1f3f5;
  align-items: center;
}

.source-row:first-child {
  border-top: none;
}

.source-header {
  background: #f8f9fa;
  font-weight: 700;
  color: #495057;
}

@media (max-width: 768px) {
  .source-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
