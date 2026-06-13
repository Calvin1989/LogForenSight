<template>
  <section class="workspace-container">
    <div class="workspace-header">
      <div class="header-main">
        <h3>{{ t('workspace.title') }}</h3>
        <span class="local-badge">{{ t('workspace.localOnly') }}</span>
      </div>
      <div class="header-actions">
        <Button variant="outline" size="sm" @click="handleExport" :disabled="cases.length === 0">
          {{ t('workspace.export') }}
        </Button>
        <Button variant="outline" size="sm" @click="triggerImport">
          {{ t('workspace.import') }}
        </Button>
        <input 
          type="file" 
          ref="importFile" 
          style="display: none" 
          accept=".json" 
          @change="handleImport"
        />
        <Button variant="ghost" size="sm" class="danger clear-btn" v-if="cases.length > 0" @click="handleClear">
          {{ t('workspace.clearAll') }}
        </Button>
      </div>
    </div>

    <div class="workspace-controls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t('workspace.search')"
          class="filter-input"
        />
      </div>
      <div class="filter-box">
        <select v-model="riskFilter" class="filter-select">
          <option value="">{{ t('workspace.filterRisk') }}</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
          <option value="INFO">INFO</option>
        </select>
      </div>
    </div>

    <div v-if="filteredCases.length === 0" class="empty-state">
      {{ searchQuery || riskFilter ? t('workspace.noMatches') : t('workspace.empty') }}
    </div>

    <div v-else class="case-list">
      <div 
        v-for="item in filteredCases" 
        :key="item.id" 
        class="case-item"
        :class="getRiskClass(item.risk_level)"
      >
        <div class="case-main" @click="$emit('select', item)">
          <div class="case-title-row">
            <span class="case-title">{{ item.title }}</span>
            <span class="case-mode-tag" :class="item.is_batch ? 'batch' : 'single'">
              {{ item.is_batch ? t('workspace.batchCase') : t('workspace.singleCase') }}
            </span>
          </div>
          <div class="case-info">
            <span class="source-name">{{ item.source_name }}</span>
            <span class="separator">|</span>
            <span class="timestamp">{{ formatDate(item.created_at) }}</span>
          </div>
          <div class="case-stats">
            <span class="stat">
              <strong>{{ item.risk_score }}</strong> {{ t('workspace.score') }}
            </span>
            <span class="stat">
              <strong>{{ item.finding_count }}</strong> {{ t('workspace.findings') }}
            </span>
            <span class="stat">
              <strong>{{ item.incident_count }}</strong> {{ t('workspace.incidents') }}
            </span>
          </div>
          <div v-if="item.tags && item.tags.length > 0" class="case-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="case-actions">
          <button @click.stop="handleDelete(item.id)" class="delete-btn" :title="t('workspace.delete')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { t } from '../i18n'
import { Button } from '@/components/ui/button'
import * as storage from '../utils/caseWorkspaceStorage'

const props = defineProps({
  cases: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'refresh'])

const searchQuery = ref('')
const riskFilter = ref('')
const importFile = ref(null)

const filteredCases = computed(() => {
  return props.cases.filter(c => {
    const matchesSearch = !searchQuery.value || 
      c.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(searchQuery.value.toLowerCase())))
    
    const matchesRisk = !riskFilter.value || c.risk_level === riskFilter.value
    
    return matchesSearch && matchesRisk
  })
})

const formatDate = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRiskClass = (level) => {
  if (!level) return ''
  return `risk-${level.toLowerCase()}`
}

const handleDelete = (id) => {
  if (confirm(t('workspace.confirmDelete'))) {
    storage.deleteCase(id)
    emit('refresh')
  }
}

const handleClear = () => {
  if (confirm(t('workspace.confirmClear'))) {
    storage.clearCases()
    emit('refresh')
  }
}

const handleExport = () => {
  const data = storage.exportCases()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-cases-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const triggerImport = () => {
  importFile.value.click()
}

const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      storage.importCases(data)
      emit('refresh')
      alert(t('workspace.importSuccess'))
    } catch (err) {
      console.error('Failed to import cases:', err)
      alert(t('workspace.importError'))
    }
  }
  reader.readAsText(file)
  event.target.value = '' // Reset input
}
</script>

<style scoped>
.workspace-container {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 0;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
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

.clear-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.clear-btn.danger:hover {
  color: oklch(0.55 0.2 25);
}

.workspace-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.search-box {
  flex: 1;
}

.filter-input, .filter-select {
  width: 100%;
  padding: 0.3125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  outline: none;
}

.filter-input:focus, .filter-select:focus {
  border-color: var(--ring);
}

.filter-select {
  width: auto;
  min-width: 120px;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.case-item {
  display: flex;
  border: none;
  border-left: 3px solid var(--border);
  border-radius: 0;
  overflow: hidden;
  transition: background-color 0.1s ease;
  background: var(--surface-elevated);
}

.case-item:hover {
  background: var(--surface-subtle);
}

.case-main {
  flex: 1;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
}

.case-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.case-title {
  font-weight: 600;
  color: var(--foreground);
  font-size: 0.8125rem;
}

.case-mode-tag {
  font-size: 0.5625rem;
  padding: 0.0625rem 0.3125rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.case-mode-tag.batch {
  background: var(--accent);
  color: var(--foreground);
}

.case-mode-tag.single {
  background: var(--muted);
  color: var(--text-secondary);
}

.case-info {
  display: flex;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-bottom: 0.375rem;
}

.separator {
  color: var(--border);
}

.case-stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat strong {
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.375rem;
}

.tag {
  font-size: 0.5625rem;
  background: var(--muted);
  color: var(--text-secondary);
  padding: 0.0625rem 0.3125rem;
  border-radius: var(--radius-sm);
}

.case-actions {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  background: var(--surface-subtle);
  border-left: 1px solid var(--border);
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  opacity: 0.4;
  transition: opacity 0.1s ease;
}

.delete-btn:hover {
  opacity: 1;
}

/* Risk Levels */
.risk-critical { border-left-color: oklch(0.45 0.18 25); }
.risk-high { border-left-color: oklch(0.55 0.2 25); }
.risk-medium { border-left-color: oklch(0.7 0.15 55); }
.risk-low { border-left-color: oklch(0.75 0.15 85); }
.risk-info { border-left-color: oklch(0.55 0.12 200); }

@media (max-width: 720px) {
  .workspace-controls,
  .workspace-header,
  .header-actions {
    align-items: stretch;
  }

  .workspace-controls,
  .header-actions {
    flex-direction: column;
  }
}
</style>
