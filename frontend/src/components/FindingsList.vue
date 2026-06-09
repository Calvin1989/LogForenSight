<template>
  <section class="result-card">
    <h2>{{ t('findings.title') }} ({{ findings.length }})</h2>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>{{ t('common.severity') }}:</label>
        <select v-model="severityFilter" class="filter-select">
          <option value="all">{{ t('common.all') }}</option>
          <option value="high">{{ translateSeverity('high') }}</option>
          <option value="medium">{{ translateSeverity('medium') }}</option>
          <option value="low">{{ translateSeverity('low') }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ t('common.rule') }}:</label>
        <select v-model="ruleFilter" class="filter-select">
          <option value="all">{{ t('findings.allRules') }}</option>
          <option v-for="rule in availableRules" :key="rule" :value="rule">
            {{ rule }}
          </option>
        </select>
      </div>
      
      <div class="filter-group search">
        <label>{{ t('common.search') }}:</label>
        <input
          v-model="textSearch"
          type="text"
          :placeholder="t('findings.searchPlaceholder')"
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
        {{ t('findings.showingFindings', 'Showing {filtered} of {total}').replace('{filtered}', filteredFindings.length).replace('{total}', findings.length) }}
      </div>

      <div class="action-group">
        <button 
          @click="copyJson" 
          :disabled="filteredFindings.length === 0"
          class="copy-btn"
          :title="t('actions.copyJson')"
        >
          {{ copyStatus ? t('common.copied') : t('actions.copyJson') }}
        </button>
        <button 
          @click="exportJson" 
          :disabled="filteredFindings.length === 0"
          class="export-btn"
          :title="t('actions.downloadJson')"
        >
          {{ t('actions.downloadJson') }}
        </button>
        <button 
          @click="exportCsv" 
          :disabled="filteredFindings.length === 0"
          class="export-btn"
          :title="t('actions.downloadCsv')"
        >
          {{ t('actions.downloadCsv') }}
        </button>
      </div>
    </div>

    <div v-if="filteredFindings.length > 0" class="export-warning">
      {{ t('incidents.exportWarning') }}
    </div>

    <div v-if="filteredFindings.length === 0" class="empty-state">
      {{ findings.length === 0 ? t('findings.emptyState') : t('findings.noMatch') }}
    </div>

    <div v-else class="findings-list">
      <div v-for="(finding, index) in filteredFindings" :key="index" class="finding-item">
        <div class="finding-header">
          <span class="severity-badge" :data-severity="finding.severity.toLowerCase()">
            {{ translateSeverity(finding.severity).toUpperCase() }}
          </span>
          <h3>{{ finding.title }}</h3>
          <span class="rule-id">{{ t('common.rule') }}: {{ finding.rule_id }}</span>
          <span v-if="showNeedsReview(finding)" class="triage-badge needs-review">
            {{ t('triage.needsReview') }}
          </span>
        </div>
        <p class="finding-desc"><strong>{{ t('common.description') }}:</strong> {{ finding.description }}</p>
        <p class="finding-rec"><strong>{{ t('common.recommendation') }}:</strong> {{ finding.recommendation }}</p>
        <div v-if="getFormattedUpdatedAt(finding) || getAnalystNote(finding)" class="triage-meta">
          <span v-if="getFormattedUpdatedAt(finding)">
            <strong>{{ t('triage.lastUpdated') }}:</strong> {{ getFormattedUpdatedAt(finding) }}
          </span>
          <span v-if="getAnalystNote(finding)">
            <strong>{{ t('triage.analystNote') }}:</strong> {{ getAnalystNote(finding) }}
          </span>
        </div>

        <div class="finding-actions">
          <button
            class="explainability-toggle"
            :aria-expanded="expandedExplanations.has(index)"
            @click="toggleExplanation(index)"
          >
            <span class="toggle-icon">{{ expandedExplanations.has(index) ? '▼' : '▶' }}</span>
            <span>{{ expandedExplanations.has(index) ? t('findings.hideExplanation') : t('findings.showExplanation') }}</span>
            <span class="toggle-meta">{{ t('findings.explainability') }}</span>
          </button>
        </div>

        <FindingExplainability
          v-if="expandedExplanations.has(index)"
          :finding="finding"
          :analysisResult="analysisContext"
        />
        
        <div v-if="hasMatchedDetails(finding)" class="finding-matched-details">
          <div class="matched-details-header">
            <strong>{{ t('findings.matchedDetails') }}:</strong>
          </div>
          <div class="matched-info">
            <span class="matched-stat">{{ t('common.count') }}: <strong>{{ finding.matched_count || 0 }}</strong></span>
            <span class="matched-stat">{{ t('findings.fields') }}: <code>{{ (finding.matched_fields || []).join(', ') }}</code></span>
          </div>
          <div class="matched-values-list" v-if="finding.matched_values && finding.matched_values.length > 0">
            <div class="matched-values-header">
              <span class="values-label">{{ t('findings.values') }}:</span>
              <button 
                v-if="finding.matched_values.length > 5" 
                @click="toggleMatchedValues(index)" 
                class="toggle-matched-btn"
              >
                {{ expandedMatchedValues.has(index) ? t('actions.showLess') : t('actions.showAllMatchedValues') }}
              </button>
            </div>
            <div class="matched-tags">
              <span v-for="(val, vIdx) in getVisibleMatchedValues(finding, index)" :key="vIdx" class="matched-tag">
                {{ val }}
              </span>
              <span v-if="finding.matched_values.length > 5 && !expandedMatchedValues.has(index)" class="matched-tag-more">
                +{{ finding.matched_values.length - 5 }} {{ t('common.more') }}
              </span>
            </div>
          </div>
        </div>

        <div class="finding-evidence">
          <div class="evidence-header">
            <strong>{{ t('common.evidence') }}:</strong>
            <button 
              v-if="finding.evidence.length > 2" 
              @click="toggleEvidence(index)" 
              class="toggle-evidence-btn"
            >
              {{ expandedFindings.has(index) ? t('actions.showLess') : t('actions.showAllEvidence') }}
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
import { downloadJson, downloadTextFile, convertFindingsToCsv } from '../utils/exportUtils'
import { t, translateSeverity } from '../i18n'
import FindingExplainability from './FindingExplainability.vue'
import { getTriageItemUpdatedAt, needsTriageReview } from '../utils/triageStorage'

const props = defineProps({
  findings: {
    type: Array,
    required: true
  },
  analysisResult: {
    type: Object,
    default: null
  },
  triageState: {
    type: Object,
    default: () => ({})
  }
})

const severityFilter = ref('all')
const ruleFilter = ref('all')
const textSearch = ref('')
const copyStatus = ref('')
const expandedFindings = ref(new Set())
const expandedMatchedValues = ref(new Set())
const expandedExplanations = ref(new Set())

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

const analysisContext = computed(() => {
  if (props.analysisResult) return props.analysisResult
  return { findings: props.findings }
})

const getFindingTriage = (finding) => {
  return props.triageState[`finding:${finding.rule_id}`]
}

const showNeedsReview = (finding) => {
  return needsTriageReview(getFindingTriage(finding))
}

const getFormattedUpdatedAt = (finding) => {
  const rawValue = getTriageItemUpdatedAt(getFindingTriage(finding))
  if (!rawValue) return ''

  const parsed = new Date(rawValue)
  return Number.isNaN(parsed.getTime()) ? rawValue : parsed.toLocaleString()
}

const getAnalystNote = (finding) => {
  return getFindingTriage(finding)?.notes || ''
}

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

const toggleExplanation = (index) => {
  const newSet = new Set(expandedExplanations.value)
  if (newSet.has(index)) {
    newSet.delete(index)
  } else {
    newSet.add(index)
  }
  expandedExplanations.value = newSet
}

const getVisibleEvidence = (finding, index) => {
  if (expandedFindings.value.has(index)) {
    return finding.evidence
  }
  return finding.evidence.slice(0, 2)
}

const hasMatchedDetails = (finding) => {
  return (finding.matched_fields && finding.matched_fields.length > 0) || 
         (finding.matched_values && finding.matched_values.length > 0)
}

const toggleMatchedValues = (index) => {
  const newSet = new Set(expandedMatchedValues.value)
  if (newSet.has(index)) {
    newSet.delete(index)
  } else {
    newSet.add(index)
  }
  expandedMatchedValues.value = newSet
}

const getVisibleMatchedValues = (finding, index) => {
  const values = finding.matched_values || []
  if (expandedMatchedValues.value.has(index)) {
    return values
  }
  return values.slice(0, 5)
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

const exportJson = () => {
  if (filteredFindings.value.length === 0) return
  const filename = `findings_export_${new_date_str()}.json`
  downloadJson(filename, filteredFindings.value)
}

const exportCsv = () => {
  if (filteredFindings.value.length === 0) return
  const filename = `findings_export_${new_date_str()}.csv`
  const csv = convertFindingsToCsv(filteredFindings.value)
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

.triage-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.triage-badge.needs-review {
  background: #fff3bf;
  color: #8f5b00;
  border: 1px solid #ffe066;
}

.finding-desc, .finding-rec {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.triage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.finding-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 0 0;
}

.explainability-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: #e7f5ff;
  border: 1px solid #a5d8ff;
  color: #1971c2;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.explainability-toggle:hover {
  background: #d0ebff;
  border-color: #74c0fc;
}

.explainability-toggle .toggle-icon {
  font-size: 0.7rem;
  line-height: 1;
}

.explainability-toggle .toggle-meta {
  font-weight: 400;
  color: #495057;
  font-size: 0.75rem;
  border-left: 1px solid #a5d8ff;
  padding-left: 0.4rem;
}

.finding-matched-details {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f1f3f5;
  border-radius: 4px;
  border-left: 4px solid #adb5bd;
}

.matched-details-header {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.matched-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.matched-stat code {
  background: #e9ecef;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  color: #495057;
}

.matched-values-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.values-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

.toggle-matched-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.matched-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.matched-tag {
  font-size: 0.75rem;
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: #495057;
  font-family: monospace;
}

.matched-tag-more {
  font-size: 0.75rem;
  color: #6c757d;
  font-style: italic;
  align-self: center;
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
