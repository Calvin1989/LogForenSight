<template>
  <section class="history-container">
    <div class="history-header">
      <h3>{{ t('history.title') }}</h3>
      <Button v-if="history.length > 0" @click="$emit('clear')" variant="ghost" size="sm">
        {{ t('history.clearHistory') }}
      </Button>
    </div>

    <div v-if="history.length === 0" class="empty-state" data-testid="recent-analyses-empty">
      <p>{{ t('history.emptyState') }}</p>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="record in history" 
        :key="record.id" 
        class="history-item"
        @click="$emit('select', record)"
      >
        <div class="item-main">
          <div class="file-name">{{ record.display_name || record.file_name || '-' }}</div>
          <div class="timestamp">{{ formatDate(record.analyzed_at) }}</div>
        </div>
        
        <div class="item-stats">
          <span v-if="record.log_format" class="stat-tag format">{{ record.log_format }}</span>
          <span class="stat-tag success">{{ formatParseRate(record.parse_rate) }} {{ t('history.parsed') }}</span>
          <span v-if="record.incidents_count > 0" class="stat-tag incident">{{ record.incidents_count }} {{ t('history.incidents') }}</span>
          <span v-if="record.findings_count > 0" class="stat-tag finding">{{ record.findings_count }} {{ t('history.findings') }}</span>
          <span v-if="record.skipped_lines > 0" class="stat-tag skip">{{ record.skipped_lines }} {{ t('history.skipped') }}</span>
          <span v-if="record.analysis_mode === 'batch' || record.isBatch" class="stat-tag batch">{{ t('history.batch') }}</span>
          <span v-if="record.is_tuned" class="stat-tag tuned">{{ t('history.tuned') }}</span>
          <span v-if="record.sanitized_result" class="stat-tag cached">{{ t('history.sanitizedCached') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { t } from '../i18n'
import { Button } from '@/components/ui/button'

defineProps({
  history: {
    type: Array,
    required: true
  }
})

defineEmits(['select', 'clear'])

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatParseRate = (parseRate) => {
  const normalized = typeof parseRate === 'number' ? parseRate : 0
  return `${(normalized * 100).toFixed(0)}%`
}
</script>

<style scoped>
.history-container {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.875rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-header h3 {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.empty-state {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: center;
  padding: 1rem 0;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.history-item {
  padding: 0.4375rem 0.625rem;
  background: var(--surface-elevated);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.history-item:hover {
  background: var(--surface-subtle);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.file-name {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--foreground);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timestamp {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.stat-tag {
  font-size: 0.5rem;
  font-weight: 600;
  padding: 0.0625rem 0.25rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.3;
}

.stat-tag.format { background: var(--muted); color: var(--text-secondary); }
.stat-tag.success { background: oklch(0.95 0.05 145); color: oklch(0.4 0.12 145); }
.stat-tag.incident { background: oklch(0.95 0.04 25); color: oklch(0.45 0.15 25); }
.stat-tag.finding { background: oklch(0.95 0.06 85); color: oklch(0.5 0.12 85); }
.stat-tag.skip { background: oklch(0.95 0.04 350); color: oklch(0.45 0.12 350); }
.stat-tag.cached { background: oklch(0.95 0.04 200); color: oklch(0.4 0.08 200); }
.stat-tag.tuned { background: var(--accent); color: var(--foreground); border: 1px solid var(--border); }
.stat-tag.batch { background: var(--muted); color: var(--text-secondary); border: 1px solid var(--border); }

@media (max-width: 390px) {
  .item-main {
    flex-direction: column;
    gap: 0.125rem;
  }

  .timestamp {
    margin-left: 0;
  }
}
</style>
