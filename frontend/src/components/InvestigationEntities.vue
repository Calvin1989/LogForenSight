<template>
  <Card class="investigation-entities" data-testid="investigation-entities">
    <CardHeader>
      <div class="section-header">
        <div>
          <CardTitle>{{ t('entities.title') }} ({{ entities.length }})</CardTitle>
          <p class="intro-text">{{ t('entities.intro') }}</p>
        </div>
        <div class="type-summary" v-if="entities.length > 0">
          <span
            v-for="summary in typeSummaries"
            :key="summary.type"
            class="summary-pill"
          >
            {{ entityTypeLabel(summary.type) }}: {{ summary.count }}
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="entities.length === 0" class="empty-state">
        {{ t('evidencePack.notAvailable') }}
      </div>

      <div v-else class="entities-table">
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
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0 0 0.4rem 0;
  font-size: 1.25rem;
  color: var(--foreground);
}

.intro-text {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.9rem;
}

.type-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.summary-pill {
  background: var(--surface-subtle);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.entities-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.entity-row {
  display: grid;
  grid-template-columns: minmax(120px, 1.2fr) minmax(180px, 2fr) repeat(3, minmax(100px, 1fr)) minmax(180px, 1.6fr);
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
  align-items: center;
  font-size: 0.85rem;
}

.entity-row:first-child {
  border-top: none;
}

.entity-header {
  background: var(--surface-subtle);
  font-weight: 700;
  color: var(--text-secondary);
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
  padding: 2rem;
  color: var(--muted-foreground);
  background: var(--surface-subtle);
  border-radius: 8px;
}

@media (max-width: 900px) {
  .section-header {
    flex-direction: column;
  }

  .type-summary {
    justify-content: flex-start;
  }

  .entity-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}


</style>
