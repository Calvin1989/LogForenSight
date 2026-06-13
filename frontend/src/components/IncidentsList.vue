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
          <label for="incidents-severity-filter">{{ t('common.severity') }}:</label>
          <select id="incidents-severity-filter" v-model="severityFilter" class="filter-select" :aria-label="t('common.severity')">
            <option value="all">{{ t('incidents.allSeverities') }}</option>
            <option value="high">{{ translateSeverity('high') }}</option>
            <option value="medium">{{ translateSeverity('medium') }}</option>
            <option value="low">{{ translateSeverity('low') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="incidents-ip-search">{{ t('common.sourceIp') }}:</label>
          <Input
            id="incidents-ip-search"
            v-model="ipSearch"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            class="filter-input"
            :aria-label="t('common.sourceIp')"
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
      copyStatus.value = t('common.copied')
    } else {
      throw new Error('Clipboard API not available')
    }
  } catch (err) {
    console.error('Failed to copy JSON:', err)
    copyStatus.value = t('common.copyFailed')
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
  margin-bottom: 0;
}

.incidents-intro {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.incidents-intro h2 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  color: var(--foreground);
}

.intro-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.625rem;
  background: var(--surface-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.filter-select, .filter-input {
  padding: 0.3125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  outline: none;
}

.filter-select:focus, .filter-input:focus {
  border-color: var(--ring);
}

.filter-stats {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.action-group {
  margin-left: auto;
}

.export-warning {
  font-size: 0.75rem;
  color: oklch(0.55 0.12 85);
  background-color: oklch(0.97 0.04 85);
  border: 1px solid oklch(0.9 0.06 85);
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--muted-foreground);
  font-style: italic;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.incidents-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.incident-item {
  border: none;
  border-left: 3px solid var(--border);
  border-radius: 0;
  padding: 0.75rem 0.875rem;
  background: var(--surface-elevated);
  transition: background-color 0.1s ease;
}

.incident-item:hover {
  background: var(--surface-subtle);
}

.incident-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.incident-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  flex-grow: 1;
  color: var(--foreground);
}

.severity-badge {
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: #eee;
}

.severity-badge[data-severity="high"] { background: oklch(0.55 0.2 25); color: white; }
.severity-badge[data-severity="medium"] { background: oklch(0.7 0.15 55); color: white; }
.severity-badge[data-severity="low"] { background: oklch(0.55 0.12 200); color: white; }

.triage-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
}

.triage-badge.needs-review {
  background: oklch(0.95 0.08 85);
  color: oklch(0.5 0.12 85);
  border: 1px solid oklch(0.88 0.08 85);
}

.ip-badge {
  background: var(--surface-subtle);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.summary {
  font-size: 0.8125rem;
  font-weight: 400;
  margin-bottom: 0.625rem;
  color: var(--foreground);
  line-height: 1.5;
  overflow-wrap: anywhere;
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
  font-size: 0.8125rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: oklch(0.55 0.18 350);
  font-family: var(--font-mono);
}

@media (max-width: 390px) {
  .filter-controls,
  .incident-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .action-group {
    flex-direction: column;
  }

  .action-group button {
    width: 100%;
  }
}
</style>
