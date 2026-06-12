<template>
  <section
    v-if="analysisResult"
    class="analysis-context-bar"
    data-testid="analysis-context-bar"
    :aria-label="t('analysisContext.ariaLabel')"
  >
    <div class="context-metrics">
      <span class="context-pill context-pill-primary">
        {{ modeLabel }}
      </span>
      <span v-if="isBatch" class="context-pill">
        {{ sourceFilesLabel }}
      </span>
      <span class="context-pill">
        {{ requestCountLabel }}
      </span>
      <span class="context-pill">
        {{ parseRateLabel }}
      </span>
      <span class="context-pill">
        {{ findingsIncidentsLabel }}
      </span>
    </div>

    <p
      v-if="isBatch && sourceNamesLabel"
      class="source-summary"
      data-testid="analysis-context-sources"
    >
      {{ sourceNamesLabel }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  analysisResult: {
    type: Object,
    default: null
  }
})

const isBatch = computed(() => {
  return props.analysisResult?.analysis_mode === 'batch'
})

const sourceFiles = computed(() => {
  if (Array.isArray(props.analysisResult?.source_files)) {
    return props.analysisResult.source_files
  }

  return []
})

const parseRatePercent = computed(() => {
  return Math.round((props.analysisResult?.parse_stats?.parse_rate || 0) * 100)
})

const requestCount = computed(() => {
  return props.analysisResult?.summary?.total_requests || 0
})

const findingsCount = computed(() => {
  return Array.isArray(props.analysisResult?.findings) ? props.analysisResult.findings.length : 0
})

const incidentsCount = computed(() => {
  return Array.isArray(props.analysisResult?.incidents) ? props.analysisResult.incidents.length : 0
})

const modeLabel = computed(() => {
  return isBatch.value ? t('analysisContext.batchAnalysis') : t('analysisContext.singleAnalysis')
})

const sourceFilesLabel = computed(() => {
  const count = sourceFiles.value.length
  const key = count === 1 ? 'analysisContext.sourceFile' : 'analysisContext.sourceFiles'
  return t(key, { count })
})

const requestCountLabel = computed(() => {
  const key = requestCount.value === 1 ? 'analysisContext.request' : 'analysisContext.requests'
  return t(key, { count: requestCount.value })
})

const parseRateLabel = computed(() => {
  return t('analysisContext.parseRate', { percent: parseRatePercent.value })
})

const findingsIncidentsLabel = computed(() => {
  const findingsKey = findingsCount.value === 1 ? 'analysisContext.finding' : 'analysisContext.findings'
  const incidentsKey = incidentsCount.value === 1 ? 'analysisContext.incident' : 'analysisContext.incidents'

  return `${t(findingsKey, { count: findingsCount.value })} / ${t(incidentsKey, { count: incidentsCount.value })}`
})

const sourceNamesLabel = computed(() => {
  const visibleNames = sourceFiles.value.slice(0, 2).map((sourceFile) => {
    return formatSourceName(sourceFile?.filename || '')
  }).filter(Boolean)

  if (visibleNames.length === 0) {
    return ''
  }

  const remainingCount = sourceFiles.value.length - visibleNames.length
  const suffix = remainingCount > 0 ? ` ${t('analysisContext.moreFiles', { count: remainingCount })}` : ''

  return `${visibleNames.join(', ')}${suffix}`
})

function formatSourceName(filename) {
  if (!filename) return ''
  return filename.split(/[\\/]/).pop()
}
</script>

<style scoped>
.analysis-context-bar {
  margin-top: 0.9rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.context-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.context-pill {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #d0d7de;
  background: #ffffff;
  color: #495057;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.4;
}

.context-pill-primary {
  border-color: #a5d8ff;
  background: #e7f5ff;
  color: #1864ab;
}

.source-summary {
  margin: 0.65rem 0 0;
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.45;
  word-break: break-word;
}

@media (max-width: 768px) {
  .analysis-context-bar {
    padding: 0.75rem 0.8rem;
  }
}
</style>
