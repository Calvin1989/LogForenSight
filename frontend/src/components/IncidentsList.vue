<template>
  <Card class="result-card">
    <CardHeader>
      <div class="incidents-intro">
        <CardTitle>{{ t('incidents.title') }} ({{ incidents.length }})</CardTitle>
        <p class="intro-text">
          {{ t('incidents.intro') }}
        </p>
      </div>
    </CardHeader>
    <CardContent>
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
          <Input
            v-model="ipSearch"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            class="filter-input"
          />
        </div>

        <Button
          v-if="isFiltered"
          @click="clearFilters"
          variant="ghost"
          size="sm"
        >
          {{ t('actions.clear') }}
        </Button>

        <div v-if="isFiltered" class="filter-stats">
          {{ t('incidents.showingIncidents', 'Showing {filtered} of {total} incidents').replace('{filtered}', filteredIncidents.length).replace('{total}', incidents.length) }}
        </div>

        <div class="action-group">
          <Button
            @click="copyJson"
            :disabled="filteredIncidents.length === 0"
            variant="outline"
            size="sm"
            class="export-btn"
            :title="t('actions.copyJson')"
          >
            {{ copyStatus ? t('common.copied') : t('actions.copyJson') }}
          </Button>
          <Button
            @click="exportJson"
            :disabled="filteredIncidents.length === 0"
            variant="outline"
            size="sm"
            class="export-btn"
            :title="t('actions.downloadJson')"
          >
            {{ t('actions.downloadJson') }}
          </Button>
          <Button
            @click="exportCsv"
            :disabled="filteredIncidents.length === 0"
            variant="outline"
            size="sm"
            class="export-btn"
            :title="t('actions.downloadCsv')"
          >
            {{ t('actions.downloadCsv') }}
          </Button>
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
                <Button
                  v-if="incident.evidence.length > 2"
                  @click="toggleEvidence(incident.incident_id)"
                  variant="link"
                  size="sm"
                >
                  {{ expandedIncidents.has(incident.incident_id) ? t('actions.showLess') : t('actions.showAllEvidence') }}
                </Button>
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
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  margin-bottom: 2rem;
}

.incidents-intro {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 1rem;
}

.incidents-intro h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  color: var(--foreground);
}

.intro-text {
  font-size: 0.9rem;
  color: var(--muted-foreground);
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: var(--surface-subtle);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-select, .filter-input {
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}

.filter-select:focus, .filter-input:focus {
  border-color: #80bdff;
}

.filter-stats {
  font-size: 0.85rem;
  color: var(--muted-foreground);
}

.action-group {
  margin-left: auto;
}

.export-warning {
  font-size: 0.8rem;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--muted-foreground);
  font-style: italic;
  background: var(--surface-subtle);
  border-radius: 8px;
}

.incidents-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.incident-item {
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--surface-elevated);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
  color: var(--foreground);
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
  background: var(--surface-subtle);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.summary {
  font-size: 1.05rem;
  font-weight: 400;
  margin-bottom: 1.25rem;
  color: var(--foreground);
  line-height: 1.5;
}

.triage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--muted-foreground);
}

.meta-info {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: var(--muted-foreground);
  margin-bottom: 1.25rem;
  background: var(--surface-subtle);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.recommendations {
  margin-bottom: 1.25rem;
}

.recommendations strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
}

.recommendations li {
  margin-bottom: 0.25rem;
}

.evidence-preview {
  background: var(--surface-subtle);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
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

.evidence-preview strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
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
