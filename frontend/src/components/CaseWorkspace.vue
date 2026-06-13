<template>
  <section class="workspace-container">
    <div class="workspace-header">
      <div class="header-main">
        <h3>{{ t('workspace.title') }}</h3>
        <span class="local-badge">{{ t('workspace.localOnly') }}</span>
      </div>
      <div class="header-actions">
        <button @click="handleExport" class="action-btn" :disabled="cases.length === 0">
          {{ t('workspace.export') }}
        </button>
        <button @click="triggerImport" class="action-btn">
          {{ t('workspace.import') }}
        </button>
        <input 
          type="file" 
          ref="importFile" 
          style="display: none" 
          accept=".json" 
          @change="handleImport"
        />
        <button v-if="cases.length > 0" @click="handleClear" class="clear-btn danger">
          {{ t('workspace.clearAll') }}
        </button>
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
  background: white;
  border: 1px solid #e9ecef;
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
  color: #212529;
}

.local-badge {
  font-size: 0.7rem;
  background: #f1f3f5;
  color: #6c757d;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: white;
  border: 1px solid #ced4da;
  color: #495057;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background: none;
  border: none;
  color: #6c757d;
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
  border: 1px solid #ced4da;
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
  color: #adb5bd;
  border: 2px dashed #f1f3f5;
  border-radius: 8px;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.case-item {
  display: flex;
  border: 1px solid #e9ecef;
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
  color: #212529;
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
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.separator {
  color: #dee2e6;
}

.case-stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: #495057;
}

.stat strong {
  color: #212529;
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.tag {
  font-size: 0.7rem;
  background: #f1f3f5;
  color: #495057;
  padding: 1px 6px;
  border-radius: 8px;
}

.case-actions {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: #f8f9fa;
  border-left: 1px solid #e9ecef;
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


/* v2.38 workflow polish: workspace controls and case rows */
.workspace-container,
.empty-state,
.case-item,
.filter-input,
.filter-select {
  border-radius: 8px;
}

.action-btn,
.clear-btn,
.delete-btn,
.filter-input,
.filter-select,
.case-item {
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.action-btn:hover:not(:disabled),
.clear-btn:hover,
.delete-btn:hover,
.case-item:hover {
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.filter-input:hover,
.filter-select:hover {
  border-color: #adb5bd;
}

.action-btn:focus-visible,
.clear-btn:focus-visible,
.delete-btn:focus-visible,
.filter-input:focus-visible,
.filter-select:focus-visible {
  outline: 2px solid #74c0fc;
  outline-offset: 2px;
}

.case-item:hover {
  border-color: #d0d7de;
}

.case-item:focus-within {
  border-color: #74c0fc;
  box-shadow: 0 0 0 3px rgba(116, 192, 252, 0.2);
}

.case-mode-tag,
.tag,
.local-badge {
  letter-spacing: 0.02em;
}

.timestamp {
  flex-shrink: 0;
}

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



/* Frontend-wide interaction polish */
:where(button, [role="button"], input, select, textarea, a):focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.22);
  outline-offset: 2px;
}

:where(button, [role="button"]) {
  -webkit-tap-highlight-color: transparent;
}

:where(input, select, textarea) {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  :where(*) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

</style>
