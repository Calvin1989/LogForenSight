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
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.triage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-main h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--foreground);
}

.local-badge {
  font-size: 0.7rem;
  background: var(--surface-subtle);
  color: var(--muted-foreground);
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.triage-summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.triage-status-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.triage-status-summary.empty {
  color: var(--muted-foreground);
}

.summary-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.summary-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.summary-card {
  background: var(--surface-subtle);
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-card.danger {
  background: #fff5f5;
  color: #c92a2a;
}

.summary-card .label {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.summary-card.danger .label {
  color: #c92a2a;
}

.summary-card .value {
  font-size: 1.25rem;
  font-weight: 700;
}

.triage-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-select {
  padding: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
}

.triage-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.triage-row {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.row-info {
  margin-bottom: 1rem;
}

.item-type-tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 8px;
  margin-right: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
}

.item-type-tag.incident { background: #e7f5ff; color: #1971c2; }
.item-type-tag.finding { background: #fff4e6; color: #d9480f; }

.item-id {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-desc {
  font-size: 0.85rem;
  color: var(--muted-foreground);
  margin: 0.25rem 0 0 0;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--surface-subtle);
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
}

.note-chip {
  max-width: 100%;
  word-break: break-word;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--surface-subtle);
  padding: 0.75rem;
  border-radius: 8px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-group label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.input-group select, .input-group textarea {
  padding: 0.3rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
}

.input-group.full-width {
  flex: 1;
  min-width: 250px;
}

.input-group textarea {
  min-height: 40px;
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
