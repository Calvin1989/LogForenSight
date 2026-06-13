<template>
  <Card class="stats-card" data-testid="parse-stats-card">
    <CardHeader class="card-header">
      <CardTitle>{{ t('parse.title') }}</CardTitle>
      <div class="parse-rate" :class="rateClass">
        {{ (stats.parse_rate * 100).toFixed(1) }}% {{ t('parse.success') }}
      </div>
    </CardHeader>
    <CardContent>
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
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
.card-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
}

.parse-rate {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.rate-good { background: oklch(0.95 0.05 145); color: oklch(0.4 0.12 145); }
.rate-warn { background: oklch(0.95 0.06 85); color: oklch(0.5 0.12 85); }
.rate-bad { background: oklch(0.95 0.04 25); color: oklch(0.45 0.15 25); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--border);
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  padding: 0.625rem 0.875rem;
  background: var(--surface-elevated);
}

.stat-item .label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-item .value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
}

.value.success { color: oklch(0.45 0.14 145); }
.value.warning { color: oklch(0.55 0.14 85); }

.format-info {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding-top: 0.625rem;
  border-top: 1px solid var(--border);
}

.separator {
  margin: 0 0.5rem;
  color: var(--border);
}

.parse-warning {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--surface-subtle);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parse-warning .icon { font-size: 1rem; }
.parse-warning .text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.skipped-samples {
  margin-top: 1.5rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.skipped-samples h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.sample-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-subtle);
  border-radius: 8px;
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
  color: var(--muted-foreground);
}

.reason {
  font-size: 0.7rem;
  color: #e03131;
  font-family: monospace;
  background: var(--surface-subtle);
  padding: 0.1rem 0.3rem;
  border-radius: 8px;
}

.sample-content {
  margin: 0;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

.source-files {
  margin-top: 1.5rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.source-files h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.source-files-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.source-row {
  display: grid;
  grid-template-columns: minmax(140px, 2fr) repeat(5, minmax(70px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  font-size: 0.8rem;
  border-top: 1px solid var(--border);
  align-items: center;
}

.source-row:first-child {
  border-top: none;
}

.source-header {
  background: var(--surface-subtle);
  font-weight: 700;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .source-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

</style>
