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
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
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
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}



.clear-btn {
  background: none;
  border: none;
  color: var(--muted-foreground);
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
}

.clear-btn.danger:hover {
  color: #dc3545;
}

.workspace-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
}

.filter-input, .filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
}

.filter-select {
  width: auto;
  min-width: 150px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-tertiary);
  border: 2px dashed var(--border);
  border-radius: 8px;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.case-item {
  display: flex;
  border: 1px solid var(--border);
  border-left: 4px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.case-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.case-main {
  flex: 1;
  padding: 1rem;
  cursor: pointer;
}

.case-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}

.case-title {
  font-weight: 600;
  color: var(--foreground);
  font-size: 1rem;
}

.case-mode-tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 600;
}

.case-mode-tag.batch {
  background: #e7f5ff;
  color: #1971c2;
}

.case-mode-tag.single {
  background: #f8f9fa;
  color: #495057;
}

.case-info {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--muted-foreground);
  margin-bottom: 0.75rem;
}

.separator {
  color: var(--border);
}

.case-stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.stat strong {
  color: var(--foreground);
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.tag {
  font-size: 0.7rem;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  padding: 1px 6px;
  border-radius: 8px;
}

.case-actions {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: var(--surface-subtle);
  border-left: 1px solid var(--border);
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.delete-btn:hover {
  opacity: 1;
}

/* Risk Levels */
.risk-critical { border-left-color: #721c24; }
.risk-high { border-left-color: #dc3545; }
.risk-medium { border-left-color: #fd7e14; }
.risk-low { border-left-color: #ffc107; }
.risk-info { border-left-color: #17a2b8; }




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
