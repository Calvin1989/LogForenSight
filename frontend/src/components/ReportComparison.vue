<template>
  <section class="comparison-container">
    <div class="comparison-header">
      <h3>{{ t('comparison.title') }}</h3>
      <div class="header-actions">
        <Button v-if="comparison" @click="downloadMarkdown" variant="outline" size="sm" class="download-btn">
          {{ t('comparison.downloadReport') }}
        </Button>
      </div>
    </div>

    <!-- Selection UI -->
    <div v-if="history.length < 2" class="empty-state">
      {{ t('comparison.atLeastTwo').replace('{count}', history.length) }}
    </div>

    <div v-else class="selection-ui">
      <div class="selector-group">
        <div class="selector">
          <label>{{ t('comparison.baseline') }}:</label>
          <select v-model="baseId">
            <option disabled value="">{{ t('comparison.selectBaseline') }}</option>
            <option v-for="record in history" :key="'base-' + record.id" :value="record.id">
              {{ record.file_name }} ({{ formatDate(record.analyzed_at) }})
            </option>
          </select>
        </div>

        <div class="selector">
          <label>{{ t('comparison.target') }}:</label>
          <select v-model="targetId">
            <option disabled value="">{{ t('comparison.selectTarget') }}</option>
            <option v-for="record in history" :key="'target-' + record.id" :value="record.id">
              {{ record.file_name }} ({{ formatDate(record.analyzed_at) }})
            </option>
          </select>
        </div>

        <Button @click="performComparison" :disabled="!baseId || !targetId || baseId === targetId" variant="default" class="compare-btn">
          {{ t('comparison.startComparison') }}
        </Button>
      </div>
    </div>

    <!-- Comparison Results -->
    <div v-if="comparison" class="results-ui">
      <div class="narrative-summary">
        <h4>{{ comparison.narrative.headline }}</h4>
        <p class="overview">{{ comparison.narrative.overview }}</p>
        <p class="key-changes">{{ comparison.narrative.keyChanges }}</p>
      </div>

      <div class="delta-cards">
        <div class="delta-card" :class="{ 'risk-up': comparison.summary.riskScoreDelta > 0, 'risk-down': comparison.summary.riskScoreDelta < 0 }">
          <div class="delta-label">{{ t('comparison.riskScoreDelta') }}</div>
          <div class="delta-value">{{ comparison.summary.riskScoreDelta > 0 ? '+' : '' }}{{ comparison.summary.riskScoreDelta }}</div>
        </div>
        <div class="delta-card">
          <div class="delta-label">{{ t('comparison.findingsDelta') }}</div>
          <div class="delta-value">{{ comparison.summary.totalFindingsDelta > 0 ? '+' : '' }}{{ comparison.summary.totalFindingsDelta }}</div>
        </div>
        <div class="delta-card">
          <div class="delta-label">{{ t('comparison.incidentsDelta') }}</div>
          <div class="delta-value">{{ comparison.summary.totalIncidentsDelta > 0 ? '+' : '' }}{{ comparison.summary.totalIncidentsDelta }}</div>
        </div>
        <div class="delta-card">
          <div class="delta-label">{{ t('comparison.parseRateDelta') }}</div>
          <div class="delta-value">{{ comparison.summary.parseRateDelta > 0 ? '+' : '' }}{{ comparison.summary.parseRateDelta.toFixed(1) }}%</div>
        </div>
      </div>

      <div class="severity-grid">
        <h4>{{ t('comparison.severityDistributionDelta') }}</h4>
        <div class="severity-items">
          <div v-for="s in comparison.severityChanges" :key="s.severity" class="severity-item">
            <span class="sev-tag" :class="s.severity">{{ translateSeverity(s.severity) }}</span>
            <span class="sev-counts">{{ s.baseCount }} &rarr; {{ s.targetCount }}</span>
            <span class="sev-delta" :class="{ 'plus': s.delta > 0, 'minus': s.delta < 0 }">
              ({{ s.delta > 0 ? '+' : '' }}{{ s.delta }})
            </span>
          </div>
        </div>
      </div>

      <div class="changes-grid">
        <div class="change-section">
          <h4>{{ t('comparison.findingsChanges') }}</h4>
          <div class="change-list">
            <div v-if="comparison.findingChanges.added.length > 0" class="change-group added">
              <h5>{{ t('comparison.added') }} ({{ comparison.findingChanges.added.length }})</h5>
              <ul>
                <li v-for="(f, i) in comparison.findingChanges.added.slice(0, 5)" :key="'f-add-'+i">
                  <span class="sev-dot" :class="f.severity"></span> {{ f.title }}
                </li>
                <li v-if="comparison.findingChanges.added.length > 5" class="more">{{ t('comparison.andOthers').replace('{count}', comparison.findingChanges.added.length - 5) }}</li>
              </ul>
            </div>
            <div v-if="comparison.findingChanges.removed.length > 0" class="change-group removed">
              <h5>{{ t('comparison.removed') }} ({{ comparison.findingChanges.removed.length }})</h5>
              <ul>
                <li v-for="(f, i) in comparison.findingChanges.removed.slice(0, 5)" :key="'f-rem-'+i">
                  <span class="sev-dot" :class="f.severity"></span> {{ f.title }}
                </li>
                <li v-if="comparison.findingChanges.removed.length > 5" class="more">{{ t('comparison.andOthers').replace('{count}', comparison.findingChanges.removed.length - 5) }}</li>
              </ul>
            </div>
            <div v-if="comparison.findingChanges.added.length === 0 && comparison.findingChanges.removed.length === 0" class="no-changes">
              {{ t('comparison.findingsNoChanges') }}
            </div>
          </div>
        </div>

        <div class="change-section">
          <h4>{{ t('comparison.incidentsChanges') }}</h4>
          <div class="change-list">
            <div v-if="comparison.incidentChanges.added.length > 0" class="change-group added">
              <h5>{{ t('comparison.added') }} ({{ comparison.incidentChanges.added.length }})</h5>
              <ul>
                <li v-for="(inc, i) in comparison.incidentChanges.added.slice(0, 5)" :key="'inc-add-'+i">
                  <span class="sev-dot" :class="inc.severity"></span> {{ inc.title }} ({{ inc.source_ip }})
                </li>
                <li v-if="comparison.incidentChanges.added.length > 5" class="more">{{ t('comparison.andOthers').replace('{count}', comparison.incidentChanges.added.length - 5) }}</li>
              </ul>
            </div>
            <div v-if="comparison.incidentChanges.removed.length > 0" class="change-group removed">
              <h5>{{ t('comparison.removed') }} ({{ comparison.incidentChanges.removed.length }})</h5>
              <ul>
                <li v-for="(inc, i) in comparison.incidentChanges.removed.slice(0, 5)" :key="'inc-rem-'+i">
                  <span class="sev-dot" :class="inc.severity"></span> {{ inc.title }} ({{ inc.source_ip }})
                </li>
                <li v-if="comparison.incidentChanges.removed.length > 5" class="more">{{ t('comparison.andOthers').replace('{count}', comparison.incidentChanges.removed.length - 5) }}</li>
              </ul>
            </div>
            <div v-if="comparison.incidentChanges.added.length === 0 && comparison.incidentChanges.removed.length === 0" class="no-changes">
              {{ t('comparison.incidentsNoChanges') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { compareAnalyses, generateComparisonMarkdown } from '../utils/comparisonUtils'
import { downloadTextFile } from '../utils/exportUtils'
import { t, translateSeverity, currentLanguage } from '../i18n'
import { Button } from '@/components/ui/button'

const props = defineProps({
  history: {
    type: Array,
    required: true
  }
})

const baseId = ref('')
const targetId = ref('')
const comparison = ref(null)

// Clear comparison if history changes and items disappear
watch(() => props.history, (newHistory) => {
  if (baseId.value && !newHistory.find(r => r.id === baseId.value)) baseId.value = ''
  if (targetId.value && !newHistory.find(r => r.id === targetId.value)) targetId.value = ''
  if (!baseId.value || !targetId.value) comparison.value = null
}, { deep: true })

// Re-run comparison if language changes to update narrative
watch(currentLanguage, () => {
  if (baseId.value && targetId.value) {
    performComparison()
  }
})

const performComparison = () => {
  const baseRecord = props.history.find(r => r.id === baseId.value)
  const targetRecord = props.history.find(r => r.id === targetId.value)

  if (baseRecord && targetRecord) {
    comparison.value = compareAnalyses(baseRecord, targetRecord, { language: currentLanguage.value })
  }
}

const downloadMarkdown = () => {
  if (!comparison.value) return
  const md = generateComparisonMarkdown(comparison.value, { language: currentLanguage.value })
  const dateStr = new Date().toISOString().split('T')[0]
  downloadTextFile(`report_comparison_${dateStr}.md`, md, 'text/markdown')
}

const formatDate = (isoString) => {
  if (!isoString) return 'Unknown'
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.comparison-container {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.comparison-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.empty-state {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  text-align: center;
  padding: 1.5rem 0;
  background: var(--surface-subtle);
  border-radius: 8px;
}

.selection-ui {
  background: var(--surface-subtle);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.selector-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.selector {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 200px;
}

.selector label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.selector select {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--surface-elevated);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.selector select:hover {
  border-color: #adb5bd;
}

.selector select:focus-visible {
  outline: none;
  border-color: #74c0fc;
  box-shadow: 0 0 0 3px rgba(116,192,252,0.25);
}

.results-ui {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
}

.narrative-summary {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface-subtle);
  border-radius: 8px;
  border-left: 4px solid #339af0;
}

.narrative-summary h4 {
  margin: 0 0 0.5rem 0;
  color: var(--foreground);
}

.overview {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-secondary);
}

.key-changes {
  font-size: 0.9rem;
  color: var(--muted-foreground);
  margin: 0;
}

.delta-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.delta-card {
  padding: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
  transition: box-shadow 0.15s ease;
}

.delta-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.delta-card.risk-up { border-top: 3px solid #fa5252; background: #fff5f5; }
.delta-card.risk-down { border-top: 3px solid #40c057; background: #ebfbee; }

.delta-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.delta-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
}

.severity-grid {
  margin-bottom: 2rem;
}

.severity-grid h4 {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.severity-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.severity-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.8rem;
  background: var(--surface-subtle);
  border-radius: 8px;
  font-size: 0.85rem;
}

.sev-tag {
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 0.15rem 0.35rem;
  border-radius: 8px;
}

.sev-tag.critical { background: #fff5f5; color: #e03131; }
.sev-tag.high { background: #fff5f5; color: #fa5252; }
.sev-tag.medium { background: #fff9db; color: #f08c00; }
.sev-tag.low { background: #ebfbee; color: #2b8a3e; }
.sev-tag.info, .sev-tag.informational { background: #e7f5ff; color: #1971c2; }

.sev-counts {
  color: var(--text-secondary);
  font-family: monospace;
}

.sev-delta.plus { color: #e03131; font-weight: 600; }
.sev-delta.minus { color: #2b8a3e; font-weight: 600; }

.changes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.change-section h4 {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.change-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.change-group {
  padding: 0.85rem 1rem;
  border-radius: 8px;
}

.change-group.added { background: #ebfbee; border: 1px solid #d3f9d8; }
.change-group.removed { background: var(--surface-subtle); border: 1px solid var(--border); }

.change-group h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.change-group.added h5 { color: #2b8a3e; }
.change-group.removed h5 { color: var(--text-tertiary); }

.change-group ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.change-group li {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sev-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sev-dot.critical { background: #e03131; }
.sev-dot.high { background: #fa5252; }
.sev-dot.medium { background: #fab005; }
.sev-dot.low { background: #40c057; }
.sev-dot.info, .sev-dot.informational { background: #339af0; }

.more {
  font-style: italic;
  color: var(--text-tertiary);
  font-size: 0.75rem !important;
}

.no-changes {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-style: italic;
}

</style>
