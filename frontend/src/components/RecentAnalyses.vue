<template>
  <section class="history-container">
    <div class="history-header">
      <h3>{{ t('history.title') }}</h3>
      <Button v-if="history.length > 0" @click="$emit('clear')" variant="ghost" size="sm">
        {{ t('history.clearHistory') }}
      </Button>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      {{ t('history.emptyState') }}
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
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.empty-state {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-style: italic;
  text-align: center;
  padding: 1.5rem 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  padding: 0.85rem 1rem;
  background: var(--surface-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid transparent;
}

.history-item:hover {
  background: #e7f5ff;
  border-color: #a5d8ff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.history-item:focus-visible {
  outline: 2px solid #74c0fc;
  outline-offset: 2px;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--foreground);
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 1rem;
}

.item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.stat-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 8px;
  text-transform: uppercase;
}

.stat-tag.format { background: var(--surface-subtle); color: var(--text-secondary); }
.stat-tag.success { background: #ebfbee; color: #2b8a3e; }
.stat-tag.incident { background: #fff5f5; color: #e03131; }
.stat-tag.finding { background: #fff9db; color: #f08c00; }
.stat-tag.skip { background: #fff0f6; color: #c2255c; }
.stat-tag.cached { background: #e3fafc; color: #0b7285; }
.stat-tag.tuned { background: #e7f5ff; color: #1971c2; border: 1px solid #a5d8ff; }
.stat-tag.batch { background: #f3f0ff; color: #6741d9; border: 1px solid #d0bfff; }

</style>
