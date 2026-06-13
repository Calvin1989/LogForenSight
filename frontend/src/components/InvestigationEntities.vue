<template>
  <Card class="investigation-entities" data-testid="investigation-entities">
    <CardHeader>
      <div class="entity-header-grid">
        <div class="entity-header-left">
          <CardTitle>{{ t('entities.title') }} ({{ entities.length }})</CardTitle>
          <p class="intro-text">{{ t('entities.intro') }}</p>
        </div>
        <div class="entity-header-right" v-if="entities.length > 0">
          <div
            v-for="summary in typeSummaries"
            :key="summary.type"
            class="metric-tile"
          >
            <span class="metric-tile-label">{{ entityTypeLabel(summary.type) }}</span>
            <span class="metric-tile-value">{{ summary.count }}</span>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="entities.length === 0" class="empty-state">
        {{ t('evidencePack.notAvailable') }}
      </div>

      <div v-else class="entities-table" data-testid="entities-table-panel">
        <div class="entity-row entity-header">
          <span>{{ t('entities.type') }}</span>
          <span>{{ t('entities.value') }}</span>
          <span>{{ t('common.count') }}</span>
          <span>{{ t('entities.firstSeen') }}</span>
          <span>{{ t('entities.lastSeen') }}</span>
          <span>{{ t('entities.relatedSourceFiles') }}</span>
        </div>

        <div
          v-for="entity in entities"
          :key="`${entity.type}:${entity.value}`"
          class="entity-row"
        >
          <span class="type-label">{{ entityTypeLabel(entity.type) }}</span>
          <span class="entity-value">{{ entity.value }}</span>
          <span>{{ entity.count }}</span>
          <span>{{ formatTimestamp(entity.firstSeen) }}</span>
          <span>{{ formatTimestamp(entity.lastSeen) }}</span>
          <span>{{ formatSourceFiles(entity.relatedSourceFiles) }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t, currentLanguage } from '../i18n'
import { extractInvestigationEntities } from '../utils/iocExtraction'

const props = defineProps({
  analysisResult: {
    type: Object,
    default: null
  }
})

const extractionResult = computed(() => extractInvestigationEntities(props.analysisResult))
const entities = computed(() => extractionResult.value.entities)
const typeSummaries = computed(() => {
  return Object.entries(extractionResult.value.countsByType)
    .map(([type, count]) => ({ type, count }))
    .sort((left, right) => left.type.localeCompare(right.type))
})

function entityTypeLabel(type) {
  return t(`entities.types.${type}`, type)
}

function formatTimestamp(value) {
  if (!value) return t('evidencePack.notAvailable')

  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) {
    return value
  }

  return timestamp.toLocaleString(currentLanguage.value === 'zh' ? 'zh-CN' : 'en-US')
}

function formatSourceFiles(sourceFiles) {
  return Array.isArray(sourceFiles) && sourceFiles.length > 0
    ? sourceFiles.join(', ')
    : t('evidencePack.notAvailable')
}
</script>

<style scoped>
.investigation-entities {
  margin-bottom: 0;
}

.entity-header-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
}

.entity-header-left h3 {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--foreground);
}

.intro-text {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.entity-header-right {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
}

.metric-tile {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.375rem 0.5rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  min-width: 5rem;
}

.metric-tile-label {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  font-weight: 600;
}

.metric-tile-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
}

.entities-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-height: 20rem;
  overflow-y: auto;
}

.entity-row {
  display: grid;
  grid-template-columns: minmax(100px, 1.2fr) minmax(160px, 2fr) repeat(3, minmax(80px, 1fr)) minmax(140px, 1.6fr);
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--border);
  align-items: center;
  font-size: 0.71875rem;
}

.entity-row:first-child {
  border-top: none;
}

.entity-header {
  background: var(--surface-subtle);
  font-weight: 700;
  color: var(--text-secondary);
  position: sticky;
  top: 0;
  z-index: 1;
}

.type-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.entity-value {
  font-family: Consolas, "Courier New", monospace;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--muted-foreground);
  background: var(--surface-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

@media (max-width: 900px) {
  .entity-header-grid {
    grid-template-columns: 1fr;
  }

  .entity-header-right {
    grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  }

  .entity-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 390px) {
  .entity-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .entity-header {
    display: none;
  }

  .metric-tile {
    min-width: auto;
  }
}
</style>
