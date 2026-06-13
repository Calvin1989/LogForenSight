<template>
  <section class="triage-container">
    <div class="triage-header">
      <div class="header-main">
        <h3>{{ t('triage.title') }}</h3>
        <span class="local-badge">{{ t('triage.localOnly') }}</span>
      </div>
      <div class="header-actions">
        <Button @click="handleExport" variant="outline" size="sm" :disabled="!hasTriageData" class="action-btn">
          {{ t('triage.exportMarkdown') }}
        </Button>
        <Button v-if="hasTriageData" @click="handleClear" variant="ghost" size="sm">
          {{ t('actions.clear') }}
        </Button>
      </div>
    </div>

    <div class="triage-status-summary" :class="{ empty: !hasTriageData }">
      <span class="summary-label">{{ t('triage.statusSummary') }}</span>
      <span class="summary-text">
        {{ hasTriageData ? statusSummaryText : t('triage.noRecords') }}
      </span>
    </div>

    <div class="triage-summary-cards" v-if="hasTriageData">
      <div class="summary-card">
        <span class="label">{{ t('triage.open') }}</span>
        <span class="value">{{ stats.open }}</span>
      </div>
      <div class="summary-card">
        <span class="label">{{ t('triage.investigating') }}</span>
        <span class="value">{{ stats.investigating }}</span>
      </div>
      <div class="summary-card">
        <span class="label">{{ t('triage.mitigated') }}</span>
        <span class="value">{{ stats.mitigated }}</span>
      </div>
      <div class="summary-card">
        <span class="label">{{ t('triage.falsePositive') }}</span>
        <span class="value">{{ stats.false_positive }}</span>
      </div>
      <div class="summary-card danger" v-if="stats.criticalPriority > 0">
        <span class="label">{{ t('triage.critical') }}</span>
        <span class="value">{{ stats.criticalPriority }}</span>
      </div>
    </div>

    <div class="triage-controls">
      <select v-model="statusFilter" class="filter-select">
        <option value="">{{ t('triage.filterStatus') }}</option>
        <option value="open">{{ t('triage.open') }}</option>
        <option value="investigating">{{ t('triage.investigating') }}</option>
        <option value="mitigated">{{ t('triage.mitigated') }}</option>
        <option value="false_positive">{{ t('triage.falsePositive') }}</option>
      </select>
      <select v-model="priorityFilter" class="filter-select">
        <option value="">{{ t('triage.filterPriority') }}</option>
        <option value="critical">{{ t('triage.critical') }}</option>
        <option value="high">{{ t('triage.high') }}</option>
        <option value="medium">{{ t('triage.medium') }}</option>
        <option value="low">{{ t('triage.low') }}</option>
      </select>
    </div>

    <div class="triage-list">
      <div v-if="visibleItems.length === 0" class="empty-state">
        {{ t('triage.empty') }}
      </div>
      
      <div v-for="item in visibleItems" :key="item.key" class="triage-row">
        <div class="row-info">
          <span class="item-type-tag" :class="item.type">{{ t(`triage.${item.type}`) }}</span>
          <span class="item-id">{{ item.id }}</span>
          <p class="item-desc">{{ item.description }}</p>
          <div v-if="hasItemMetadata(item.key)" class="item-meta">
            <span v-if="getFormattedUpdatedAt(item.key)" class="meta-chip">
              {{ t('triage.lastUpdated') }}: {{ getFormattedUpdatedAt(item.key) }}
            </span>
            <span v-if="getTriageNote(item.key)" class="meta-chip note-chip">
              {{ t('triage.analystNote') }}: {{ getTriageNote(item.key) }}
            </span>
          </div>
        </div>
        
        <div class="row-actions">
          <div class="input-group">
            <label>{{ t('triage.status') }}</label>
            <select 
              :value="getTriageValue(item.key, 'status', 'open')" 
              @change="updateItem(item.key, 'status', $event.target.value)"
            >
              <option value="open">{{ t('triage.open') }}</option>
              <option value="investigating">{{ t('triage.investigating') }}</option>
              <option value="mitigated">{{ t('triage.mitigated') }}</option>
              <option value="false_positive">{{ t('triage.falsePositive') }}</option>
            </select>
          </div>
          
          <div class="input-group">
            <label>{{ t('triage.priority') }}</label>
            <select 
              :value="getTriageValue(item.key, 'priority', 'medium')" 
              @change="updateItem(item.key, 'priority', $event.target.value)"
            >
              <option value="critical">{{ t('triage.critical') }}</option>
              <option value="high">{{ t('triage.high') }}</option>
              <option value="medium">{{ t('triage.medium') }}</option>
              <option value="low">{{ t('triage.low') }}</option>
            </select>
          </div>
          
          <div class="input-group full-width">
            <label>{{ t('triage.notes') }}</label>
            <textarea 
              :value="getTriageValue(item.key, 'notes', '')" 
              @blur="updateItem(item.key, 'notes', $event.target.value)"
              :placeholder="t('triage.notes')"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { ref, computed, watch } from 'vue'
import { t } from '../i18n'
import * as storage from '../utils/triageStorage'

const emit = defineEmits(['triage-state-change'])

const props = defineProps({
  caseId: {
    type: String,
    required: true
  },
  analysisResult: {
    type: Object,
    required: true
  }
})

const statusFilter = ref('')
const priorityFilter = ref('')

// Local copy of triage state to trigger reactivity
const triageState = ref(storage.getTriageState(props.caseId))

watch(() => props.caseId, (newCaseId) => {
  triageState.value = storage.getTriageState(newCaseId)
}, { immediate: true })

watch(triageState, (newState) => {
  emit('triage-state-change', newState)
}, { immediate: true, deep: true })

const hasTriageData = computed(() => Object.keys(triageState.value).length > 0)

const allItems = computed(() => {
  const items = []
  
  // Incidents
  if (props.analysisResult.incidents) {
    props.analysisResult.incidents.forEach(inc => {
      items.push({
        key: `incident:${inc.incident_id || inc.id}`,
        type: 'incident',
        id: inc.title,
        description: inc.description || inc.summary
      })
    })
  }
  
  // Findings
  if (props.analysisResult.findings) {
    props.analysisResult.findings.forEach(f => {
      items.push({
        key: `finding:${f.rule_id}`,
        type: 'finding',
        id: f.title,
        description: f.description
      })
    })
  }
  
  return items
})

const visibleItems = computed(() => {
  return allItems.value.filter(item => {
    const data = triageState.value[item.key] || { status: 'open', priority: 'medium' }
    const matchesStatus = !statusFilter.value || data.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || data.priority === priorityFilter.value
    return matchesStatus && matchesPriority
  })
})

const stats = computed(() => {
  const s = {
    ...storage.getTriageStatusCounts(triageState.value),
    criticalPriority: 0
  }
  Object.values(triageState.value).forEach(data => {
    if (data.priority === 'critical' || data.priority === 'high') s.criticalPriority++
  })
  return s
})

const statusSummaryText = computed(() => {
  return t('triage.statusSummaryText', {
    open: stats.value.open,
    investigating: stats.value.investigating,
    mitigated: stats.value.mitigated,
    falsePositive: stats.value.false_positive
  })
})

const getTriageValue = (key, field, fallback) => {
  return triageState.value[key]?.[field] ?? fallback
}

const getTriageItem = (key) => {
  return triageState.value[key]
}

const getTriageNote = (key) => {
  return getTriageItem(key)?.notes || ''
}

const getFormattedUpdatedAt = (key) => {
  const rawValue = storage.getTriageItemUpdatedAt(getTriageItem(key))
  if (!rawValue) return ''

  const parsed = new Date(rawValue)
  return Number.isNaN(parsed.getTime()) ? rawValue : parsed.toLocaleString()
}

const hasItemMetadata = (key) => {
  return Boolean(getFormattedUpdatedAt(key) || getTriageNote(key))
}

const updateItem = (itemKey, field, value) => {
  const current = triageState.value[itemKey] || { status: 'open', priority: 'medium', notes: '' }
  const newData = { ...current, [field]: value }
  triageState.value = storage.saveTriageItem(props.caseId, itemKey, newData)
}

const handleClear = () => {
  if (confirm(t('triage.confirmClear'))) {
    storage.clearTriageState(props.caseId)
    triageState.value = {}
  }
}

const handleExport = () => {
  const md = storage.exportTriageSummary(props.caseId, props.analysisResult, triageState.value)
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `triage-summary-${props.caseId}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.triage-container {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 0;
}

.triage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-main h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--foreground);
}

.local-badge {
  font-size: 0.5625rem;
  background: var(--muted);
  color: var(--text-tertiary);
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.header-actions {
  display: flex;
  gap: 0.375rem;
}

.triage-summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 1rem;
}

.triage-status-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.625rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.triage-status-summary.empty {
  color: var(--text-tertiary);
}

.summary-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.summary-card {
  background: var(--surface-elevated);
  padding: 0.5rem 0.625rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-card.danger {
  background: oklch(0.97 0.02 25);
  color: oklch(0.5 0.15 25);
}

.summary-card .label {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-card.danger .label {
  color: oklch(0.5 0.15 25);
}

.summary-card .value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.triage-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter-select {
  padding: 0.3125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  outline: none;
}

.filter-select:focus {
  border-color: var(--ring);
}

.triage-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.triage-row {
  border: none;
  border-radius: 0;
  padding: 0.75rem 0.875rem;
  background: var(--surface-elevated);
}

.row-info {
  margin-bottom: 0.5rem;
}

.item-type-tag {
  font-size: 0.5625rem;
  padding: 0.0625rem 0.3125rem;
  border-radius: var(--radius-sm);
  margin-right: 0.375rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.item-type-tag.incident { background: var(--accent); color: var(--foreground); }
.item-type-tag.finding { background: oklch(0.97 0.04 60); color: oklch(0.45 0.1 60); }

.item-id {
  font-weight: 600;
  font-size: 0.8125rem;
}

.item-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.125rem 0 0 0;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.625rem;
  color: var(--text-secondary);
  background: var(--surface-subtle);
  border-radius: 999px;
  padding: 0.0625rem 0.375rem;
}

.note-chip {
  max-width: 100%;
  word-break: break-word;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  background: var(--surface-subtle);
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-sm);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.input-group label {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.input-group select, .input-group textarea {
  padding: 0.3125rem 0.375rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

.input-group.full-width {
  flex: 1;
  min-width: 200px;
}

.input-group textarea {
  min-height: 2rem;
  resize: vertical;
}

@media (max-width: 720px) {
  .triage-header,
  .triage-controls,
  .header-actions,
  .row-actions {
    align-items: stretch;
  }

  .triage-header,
  .triage-controls,
  .header-actions {
    flex-direction: column;
  }
}
</style>
