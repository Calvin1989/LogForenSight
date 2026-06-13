<template>
  <div
    v-if="analysisResult"
    class="compact-summary-strip analysis-context-bar"
    data-testid="analysis-context-bar"
    :aria-label="t('analysisContext.ariaLabel')"
  >
    <span class="compact-stat-pill is-primary">
      {{ modeLabel }}
    </span>
    <span v-if="isBatch" class="compact-stat-pill">
      {{ sourceFilesLabel }}
    </span>
    <span class="compact-stat-pill">
      {{ requestCountLabel }}
    </span>
    <span class="compact-stat-pill">
      {{ parseRateLabel }}
    </span>
    <span class="compact-stat-pill">
      {{ findingsIncidentsLabel }}
    </span>
    <span
      v-if="isBatch && sourceNamesLabel"
      class="compact-stat-pill"
      data-testid="analysis-context-sources"
      :title="sourceNamesLabel"
    >
      {{ sourceNamesLabel }}
    </span>
  </div>
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
  max-width: 100%;
  overflow: hidden;
}
</style>
