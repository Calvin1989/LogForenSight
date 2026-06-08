<template>
  <section class="result-card">
    <h2>Security Findings ({{ findings.length }})</h2>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>Severity:</label>
        <select v-model="severityFilter" class="filter-select">
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Rule:</label>
        <select v-model="ruleFilter" class="filter-select">
          <option value="all">All Rules</option>
          <option v-for="rule in availableRules" :key="rule" :value="rule">
            {{ rule }}
          </option>
        </select>
      </div>
      
      <div class="filter-group search">
        <label>Search:</label>
        <input 
          v-model="textSearch" 
          type="text" 
          placeholder="Title, desc, evidence..." 
          class="filter-input"
        />
      </div>

      <button 
        v-if="isFiltered" 
        @click="clearFilters" 
        class="clear-btn"
      >
        Clear
      </button>

      <div v-if="isFiltered" class="filter-stats">
        Showing {{ filteredFindings.length }} of {{ findings.length }}
      </div>

      <div class="action-group">
        <button 
          @click="copyJson" 
          :disabled="filteredFindings.length === 0"
          class="copy-btn"
          title="Copy filtered findings as JSON"
        >
          {{ copyStatus || 'Copy JSON' }}
        </button>
      </div>
    </div>

    <div v-if="filteredFindings.length === 0" class="empty-state">
      {{ findings.length === 0 ? 'No risks detected.' : 'No findings match your filters.' }}
    </div>

    <div v-else class="findings-list">
      <div v-for="(finding, index) in filteredFindings" :key="index" class="finding-item">
        <div class="finding-header">
          <span class="severity-badge" :data-severity="finding.severity.toLowerCase()">
            {{ finding.severity.toUpperCase() }}
          </span>
          <h3>{{ finding.title }}</h3>
          <span class="rule-id">Rule: {{ finding.rule_id }}</span>
        </div>
        <p class="finding-desc"><strong>Description:</strong> {{ finding.description }}</p>
        <p class="finding-rec"><strong>Recommendation:</strong> {{ finding.recommendation }}</p>
        <div class="finding-evidence">
          <div class="evidence-header">
            <strong>Evidence:</strong>
            <button 
              v-if="finding.evidence.length > 2" 
              @click="toggleEvidence(index)" 
              class="toggle-evidence-btn"
            >
              {{ expandedFindings.has(index) ? 'Show less' : 'Show all evidence' }}
            </button>
          </div>
          <ul>
            <li v-for="(ev, evIdx) in getVisibleEvidence(finding, index)" :key="evIdx">
              <code>{{ ev }}</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  findings: {
    type: Array,
    required: true
  }
})

const severityFilter = ref('all')
const ruleFilter = ref('all')
const textSearch = ref('')
const copyStatus = ref('')
const expandedFindings = ref(new Set())

const availableRules = computed(() => {
  const rules = new Set(props.findings.map(f => f.rule_id))
  return Array.from(rules).sort()
})

const isFiltered = computed(() => {
  return severityFilter.value !== 'all' || ruleFilter.value !== 'all' || textSearch.value !== ''
})

const filteredFindings = computed(() => {
  return props.findings.filter(finding => {
    const matchesSeverity = severityFilter.value === 'all' || finding.severity.toLowerCase() === severityFilter.value
    const matchesRule = ruleFilter.value === 'all' || finding.rule_id === ruleFilter.value
    
    const searchLower = textSearch.value.toLowerCase()
    const matchesText = textSearch.value === '' || 
      finding.title.toLowerCase().includes(searchLower) ||
      finding.description.toLowerCase().includes(searchLower) ||
      finding.evidence.some(ev => ev.toLowerCase().includes(searchLower))
      
    return matchesSeverity && matchesRule && matchesText
  })
})

const clearFilters = () => {
  severityFilter.value = 'all'
  ruleFilter.value = 'all'
  textSearch.value = ''
}

const toggleEvidence = (index) => {
  const newSet = new Set(expandedFindings.value)
  if (newSet.has(index)) {
    newSet.delete(index)
  } else {
    newSet.add(index)
  }
  expandedFindings.value = newSet
}

const getVisibleEvidence = (finding, index) => {
  if (expandedFindings.value.has(index)) {
    return finding.evidence
  }
  return finding.evidence.slice(0, 2)
}

const copyJson = async () => {
  if (filteredFindings.value.length === 0) return
  
  try {
    const json = JSON.stringify(filteredFindings.value, null, 2)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(json)
      copyStatus.value = 'Copied!'
    } else {
      throw new Error('Clipboard API not available')
    }
  } catch (err) {
    console.error('Failed to copy JSON:', err)
    copyStatus.value = 'Copy failed'
  } finally {
    setTimeout(() => {
      copyStatus.value = ''
    }, 2000)
  }
}
</script>

<style scoped>
.result-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.result-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #495057;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 0.5rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group.search {
  flex-grow: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

.filter-select, .filter-input {
  padding: 0.35rem 0.6rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
  width: 100%;
}

.filter-select {
  width: auto;
  min-width: 80px;
}

.filter-select:focus, .filter-input:focus {
  border-color: #80bdff;
}

.clear-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.clear-btn:hover {
  color: #0056b3;
}

.filter-stats {
  font-size: 0.85rem;
  color: #6c757d;
  white-space: nowrap;
}

.action-group {
  margin-left: auto;
}

.copy-btn {
  padding: 0.35rem 0.75rem;
  background-color: #212529;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover:not(:disabled) {
  background-color: #343a40;
}

.copy-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 6px;
}

.findings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.finding-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background: #fff;
}

.finding-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.finding-header h3 {
  margin: 0;
  font-size: 1.1rem;
  flex-grow: 1;
}

.rule-id {
  font-size: 0.75rem;
  color: #6c757d;
  font-family: monospace;
  background: #f1f3f5;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
}

.severity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #eee;
}

.severity-badge[data-severity="high"] { background: #f8d7da; color: #721c24; }
.severity-badge[data-severity="medium"] { background: #fff3cd; color: #856404; }
.severity-badge[data-severity="low"] { background: #d1ecf1; color: #0c5460; }

.finding-desc, .finding-rec {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.finding-evidence {
  margin-top: 1rem;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
}

.evidence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.evidence-header strong {
  margin-bottom: 0 !important;
}

.toggle-evidence-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.toggle-evidence-btn:hover {
  color: #0056b3;
}

.finding-evidence ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.finding-evidence code {
  font-size: 0.85rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: #e83e8c;
  font-family: 'Courier New', Courier, monospace;
}
</style>
