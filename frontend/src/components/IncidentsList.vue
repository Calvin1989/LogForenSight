<template>
  <section class="result-card">
    <div class="incidents-intro">
      <h2>{{ t('incidents.title') }} ({{ incidents.length }})</h2>
      <p class="intro-text">
        {{ t('incidents.intro') }}
      </p>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>{{ t('common.severity') }}:</label>
        <select v-model="severityFilter" class="filter-select">
          <option value="all">{{ t('incidents.allSeverities') }}</option>
          <option value="high">{{ translateSeverity('high') }}</option>
          <option value="medium">{{ translateSeverity('medium') }}</option>
          <option value="low">{{ translateSeverity('low') }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ t('common.sourceIp') }}:</label>
        <input
          v-model="ipSearch"
          type="text"
          :placeholder="t('common.searchPlaceholder')"
          class="filter-input"
        />
      </div>

      <button 
        v-if="isFiltered" 
        @click="clearFilters" 
        class="clear-btn"
      >
        {{ t('actions.clear') }}
      </button>

      <div v-if="isFiltered" class="filter-stats">
        {{ t('incidents.showingIncidents', 'Showing {filtered} of {total} incidents').replace('{filtered}', filteredIncidents.length).replace('{total}', incidents.length) }}
      </div>

      <div class="action-group">
        <button 
          @click="copyJson" 
          :disabled="filteredIncidents.length === 0"
          class="copy-btn"
          :title="t('actions.copyJson')"
        >
          {{ copyStatus ? t('common.copied') : t('actions.copyJson') }}
        </button>
        <button 
          @click="exportJson" 
          :disabled="filteredIncidents.length === 0"
          class="export-btn"
          :title="t('actions.downloadJson')"
        >
          {{ t('actions.downloadJson') }}
        </button>
        <button 
          @click="exportCsv" 
          :disabled="filteredIncidents.length === 0"
          class="export-btn"
          :title="t('actions.downloadCsv')"
        >
          {{ t('actions.downloadCsv') }}
        </button>
      </div>
    </div>

    <div v-if="filteredIncidents.length > 0" class="export-warning">
      {{ t('incidents.exportWarning') }}
    </div>

    <div v-if="filteredIncidents.length === 0" class="empty-state">
      {{ incidents.length === 0 ? t('incidents.emptyState') : t('common.noMatch') }}
    </div>

    <div v-else class="incidents-list">
      <div v-for="incident in filteredIncidents" :key="incident.incident_id" class="incident-item">
        <div class="incident-header">
          <span class="severity-badge" :data-severity="incident.severity.toLowerCase()">
            {{ translateSeverity(incident.severity).toUpperCase() }}
          </span>
          <h3>{{ incident.title }}</h3>
          <span class="ip-badge">{{ incident.source_ip }}</span>
          <span v-if="showNeedsReview(incident)" class="triage-badge needs-review">
            {{ t('triage.needsReview') }}
          </span>
        </div>
        
        <div class="incident-body">
          <p class="summary">{{ incident.summary }}</p>
          <div v-if="getFormattedUpdatedAt(incident) || getAnalystNote(incident)" class="triage-meta">
            <span v-if="getFormattedUpdatedAt(incident)">
              <strong>{{ t('triage.lastUpdated') }}:</strong> {{ getFormattedUpdatedAt(incident) }}
            </span>
            <span v-if="getAnalystNote(incident)">
              <strong>{{ t('triage.analystNote') }}:</strong> {{ getAnalystNote(incident) }}
            </span>
          </div>
          
          <div class="meta-info">
            <span><strong>{{ t('common.confidence') }}:</strong> {{ translateRiskLevel(incident.confidence).toUpperCase() }}</span>
            <span><strong>{{ t('incidents.rulesInvolved') }}:</strong> {{ incident.related_rule_ids.join(', ') }}</span>
          </div>

          <div v-if="incident.recommendations.length > 0" class="recommendations">
            <strong>{{ t('incidents.recommendedActions') }}:</strong>
            <ul>
              <li v-for="(rec, index) in incident.recommendations" :key="index">{{ rec }}</li>
            </ul>
          </div>

          <div v-if="incident.evidence.length > 0" class="evidence-preview">
            <div class="evidence-header">
              <strong>{{ t('incidents.evidenceSamples') }}:</strong>
              <button 
                v-if="incident.evidence.length > 2" 
                @click="toggleEvidence(incident.incident_id)" 
                class="toggle-evidence-btn"
              >
                {{ expandedIncidents.has(incident.incident_id) ? t('actions.showLess') : t('actions.showAllEvidence') }}
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
import { downloadJson, downloadTextFile, convertIncidentsToCsv } from '../utils/exportUtils'
import { t, translateSeverity, translateRiskLevel } from '../i18n'
import { getTriageItemUpdatedAt, needsTriageReview } from '../utils/triageStorage'

const props = defineProps({
  incidents: {
    type: Array,
    required: true
  },
  triageState: {
    type: Object,
    default: () => ({})
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

const getIncidentTriage = (incident) => {
  return props.triageState[`incident:${incident.incident_id || incident.id}`]
}

const showNeedsReview = (incident) => {
  return needsTriageReview(getIncidentTriage(incident))
}

const getFormattedUpdatedAt = (incident) => {
  const rawValue = getTriageItemUpdatedAt(getIncidentTriage(incident))
  if (!rawValue) return ''

  const parsed = new Date(rawValue)
  return Number.isNaN(parsed.getTime()) ? rawValue : parsed.toLocaleString()
}

const getAnalystNote = (incident) => {
  return getIncidentTriage(incident)?.notes || ''
}

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

const exportJson = () => {
  if (filteredIncidents.value.length === 0) return
  const filename = `incidents_export_${new_date_str()}.json`
  downloadJson(filename, filteredIncidents.value)
}

const exportCsv = () => {
  if (filteredIncidents.value.length === 0) return
  const filename = `incidents_export_${new_date_str()}.csv`
  const csv = convertIncidentsToCsv(filteredIncidents.value)
  downloadTextFile(filename, csv, 'text/csv')
}

const new_date_str = () => {
  return new Date().toISOString().split('T')[0]
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

.copy-btn, .export-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn {
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
  color: #495057;
}

.copy-btn:hover:not(:disabled) {
  background-color: #dee2e6;
}

.export-btn {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  color: #495057;
}

.export-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.copy-btn:disabled, .export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-warning {
  font-size: 0.8rem;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
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

.triage-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.triage-badge.needs-review {
  background: #fff3bf;
  color: #8f5b00;
  border: 1px solid #ffe066;
}

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

.triage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
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
