<template>
  <section class="result-card">
    <div class="incidents-intro">
      <h2>Aggregated Security Incidents ({{ incidents.length }})</h2>
      <p class="intro-text">
        Incidents are grouped from related findings to help analysts understand overall attack behavior and intent.
      </p>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>Severity:</label>
        <select v-model="severityFilter" class="filter-select">
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Source IP:</label>
        <input 
          v-model="ipSearch" 
          type="text" 
          placeholder="Search IP..." 
          class="filter-input"
        />
      </div>

      <button 
        v-if="isFiltered" 
        @click="clearFilters" 
        class="clear-btn"
      >
        Clear Filters
      </button>

      <div v-if="isFiltered" class="filter-stats">
        Showing {{ filteredIncidents.length }} of {{ incidents.length }} incidents
      </div>

      <div class="action-group">
        <button 
          @click="copyJson" 
          :disabled="filteredIncidents.length === 0"
          class="copy-btn"
          title="Copy filtered incidents as JSON"
        >
          {{ copyStatus || 'Copy Filtered JSON' }}
        </button>
      </div>
    </div>

    <div v-if="filteredIncidents.length === 0" class="empty-state">
      {{ incidents.length === 0 ? 'No major security incidents aggregated.' : 'No incidents match your filters.' }}
    </div>

    <div v-else class="incidents-list">
      <div v-for="incident in filteredIncidents" :key="incident.incident_id" class="incident-item">
        <div class="incident-header">
          <span class="severity-badge" :data-severity="incident.severity.toLowerCase()">
            {{ incident.severity.toUpperCase() }}
          </span>
          <h3>{{ incident.title }}</h3>
          <span class="ip-badge">{{ incident.source_ip }}</span>
        </div>
        
        <div class="incident-body">
          <p class="summary">{{ incident.summary }}</p>
          
          <div class="meta-info">
            <span><strong>Confidence:</strong> {{ incident.confidence.toUpperCase() }}</span>
            <span><strong>Rules Involved:</strong> {{ incident.related_rule_ids.join(', ') }}</span>
          </div>

          <div v-if="incident.recommendations.length > 0" class="recommendations">
            <strong>Recommended Actions:</strong>
            <ul>
              <li v-for="(rec, index) in incident.recommendations" :key="index">{{ rec }}</li>
            </ul>
          </div>

          <div v-if="incident.evidence.length > 0" class="evidence-preview">
            <div class="evidence-header">
              <strong>Evidence Samples:</strong>
              <button 
                v-if="incident.evidence.length > 2" 
                @click="toggleEvidence(incident.incident_id)" 
                class="toggle-evidence-btn"
              >
                {{ expandedIncidents.has(incident.incident_id) ? 'Show less' : 'Show all evidence' }}
              </button>
            </div>
            <ul>
              <li v-for="(ev, index) in getVisibleEvidence(incident)" :key="index">
                <code>{{ ev }}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  incidents: {
    type: Array,
    required: true
  }
})

const severityFilter = ref('all')
const ipSearch = ref('')
const copyStatus = ref('')
const expandedIncidents = ref(new Set())

const isFiltered = computed(() => {
  return severityFilter.value !== 'all' || ipSearch.value !== ''
})

const filteredIncidents = computed(() => {
  return props.incidents.filter(incident => {
    const matchesSeverity = severityFilter.value === 'all' || incident.severity.toLowerCase() === severityFilter.value
    const matchesIp = incident.source_ip.toLowerCase().includes(ipSearch.value.toLowerCase())
    return matchesSeverity && matchesIp
  })
})

const clearFilters = () => {
  severityFilter.value = 'all'
  ipSearch.value = ''
}

const toggleEvidence = (id) => {
  const newSet = new Set(expandedIncidents.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedIncidents.value = newSet
}

const getVisibleEvidence = (incident) => {
  if (expandedIncidents.value.has(incident.incident_id)) {
    return incident.evidence
  }
  return incident.evidence.slice(0, 2)
}

const copyJson = async () => {
  if (filteredIncidents.value.length === 0) return
  
  try {
    const json = JSON.stringify(filteredIncidents.value, null, 2)
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

.incidents-intro {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 1rem;
}

.incidents-intro h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  color: #2c3e50;
}

.intro-text {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
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

.incidents-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.incident-item {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fff;
  transition: border-color 0.2s;
}

.incident-item:hover {
  border-color: #ced4da;
}

.incident-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.incident-header h3 {
  margin: 0;
  font-size: 1.25rem;
  flex-grow: 1;
  color: #343a40;
}

.severity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #eee;
}

.severity-badge[data-severity="high"] { background: #dc3545; color: white; }
.severity-badge[data-severity="medium"] { background: #fd7e14; color: white; }
.severity-badge[data-severity="low"] { background: #17a2b8; color: white; }

.ip-badge {
  background: #f1f3f5;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
  border: 1px solid #dee2e6;
}

.summary {
  font-size: 1.05rem;
  font-weight: 400;
  margin-bottom: 1.25rem;
  color: #212529;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 1.25rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.recommendations {
  margin-bottom: 1.25rem;
}

.recommendations strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
}

.recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
}

.recommendations li {
  margin-bottom: 0.25rem;
}

.evidence-preview {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
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

.evidence-preview strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
}

.evidence-preview ul {
  margin: 0;
  padding-left: 1.5rem;
}

.evidence-preview code {
  font-size: 0.85rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: #e83e8c;
  font-family: 'Courier New', Courier, monospace;
}
</style>
