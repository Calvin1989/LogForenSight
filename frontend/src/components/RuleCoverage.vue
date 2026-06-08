<template>
  <section class="result-card" v-if="ruleCoverage && ruleCoverage.length > 0">
    <div class="card-header">
      <h2>{{ t('ruleCoverage.title') }}</h2>
      <p class="subtitle">{{ t('ruleCoverage.subtitle') }}</p>
    </div>

    <!-- Overview Stats -->
    <div class="coverage-stats">
      <div class="stat-item">
        <span class="stat-value">{{ ruleCoverage.length }}</span>
        <span class="stat-label">{{ t('ruleCoverage.totalRules') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ enabledCount }}</span>
        <span class="stat-label">{{ t('ruleCoverage.enabledRules') }}</span>
      </div>
      <div class="stat-item triggered">
        <span class="stat-value">{{ triggeredCount }}</span>
        <span class="stat-label">{{ t('ruleCoverage.triggeredRules') }}</span>
      </div>
      <div class="stat-item untriggered">
        <span class="stat-value">{{ ruleCoverage.length - triggeredCount }}</span>
        <span class="stat-label">{{ t('ruleCoverage.notTriggeredRules') }}</span>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>{{ t('common.status') }}:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="all">{{ t('ruleCoverage.filterAll') }}</option>
          <option value="triggered">{{ t('ruleCoverage.filterTriggered') }}</option>
          <option value="not_triggered">{{ t('ruleCoverage.filterNotTriggered') }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ t('common.severity') }}:</label>
        <select v-model="severityFilter" class="filter-select">
          <option value="all">{{ t('common.all') }}</option>
          <option value="high">{{ translateSeverity('high') }}</option>
          <option value="medium">{{ translateSeverity('medium') }}</option>
          <option value="low">{{ translateSeverity('low') }}</option>
        </select>
      </div>

      <div class="action-group">
        <button @click="copyJson" class="copy-btn" :title="t('ruleCoverage.copyJson')">
          {{ copyStatus ? t('common.copied') : t('ruleCoverage.copyJson') }}
        </button>
        <button @click="exportJson" class="export-btn" :title="t('ruleCoverage.downloadJson')">
          {{ t('ruleCoverage.downloadJson') }}
        </button>
        <button @click="exportMarkdown" class="export-btn" :title="t('ruleCoverage.downloadMarkdown')">
          {{ t('ruleCoverage.downloadMarkdown') }}
        </button>
      </div>
    </div>

    <div v-if="filteredRules.length === 0" class="empty-state">
      {{ t('findings.noMatch') }}
    </div>

    <div v-else class="rules-list">
      <div v-for="(rule, index) in filteredRules" :key="rule.rule_id" class="rule-item" :class="{ 'is-triggered': rule.triggered }">
        <div class="rule-header">
          <div class="rule-title-group">
            <span class="severity-badge" :data-severity="rule.severity.toLowerCase()">
              {{ translateSeverity(rule.severity).toUpperCase() }}
            </span>
            <h3>{{ rule.title }}</h3>
            <span class="rule-id">{{ rule.rule_id }}</span>
          </div>
          <div class="rule-badges">
            <span v-if="rule.enabled" class="status-badge enabled">ENABLED</span>
            <span v-if="rule.triggered" class="status-badge triggered">TRIGGERED</span>
            <span v-else class="status-badge untriggered">NOT TRIGGERED</span>
          </div>
        </div>

        <div class="rule-content">
          <div class="rule-info-grid">
            <div class="info-block">
              <label>{{ t('common.description') }}:</label>
              <p>{{ rule.description }}</p>
            </div>
            <div class="info-block">
              <label>{{ t('ruleCoverage.explanation') }}:</label>
              <p class="explanation-text">{{ rule.explanation }}</p>
            </div>
          </div>

          <div v-if="rule.triggered" class="rule-metrics">
            <div class="metric">
              <span class="metric-label">{{ t('ruleCoverage.findings') }}:</span>
              <span class="metric-value">{{ rule.finding_count }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">{{ t('ruleCoverage.incidents') }}:</span>
              <span class="metric-value">{{ rule.incident_count }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">{{ t('common.count') }}:</span>
              <span class="metric-value">{{ rule.matched_count }}</span>
            </div>
          </div>

          <div v-if="rule.triggered && rule.matched_fields.length > 0" class="rule-fields">
            <label>{{ t('ruleCoverage.matchedFields') }}:</label>
            <div class="field-tags">
              <code v-for="field in rule.matched_fields" :key="field" class="field-tag">{{ field }}</code>
            </div>
          </div>

          <div v-if="rule.triggered && rule.sample_matched_values.length > 0" class="rule-values">
            <label>{{ t('ruleCoverage.matchedValues') }}:</label>
            <div class="value-tags">
              <span v-for="val in rule.sample_matched_values" :key="val" class="value-tag">{{ val }}</span>
            </div>
          </div>

          <div v-if="rule.triggered && rule.sample_evidence.length > 0" class="rule-evidence">
            <div class="evidence-header">
              <label>{{ t('ruleCoverage.sampleEvidence') }}:</label>
              <button @click="toggleEvidence(rule.rule_id)" class="toggle-btn">
                {{ expandedRules.has(rule.rule_id) ? t('ruleCoverage.hideEvidence') : t('ruleCoverage.showEvidence') }}
              </button>
            </div>
            <ul v-if="expandedRules.has(rule.rule_id)" class="evidence-list">
              <li v-for="(ev, evIdx) in rule.sample_evidence" :key="evIdx">
                <code>{{ ev }}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  <div v-else-if="ruleCoverage && ruleCoverage.length === 0" class="result-card empty-card">
    <p>{{ t('ruleCoverage.noData') }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { t, translateSeverity } from '../i18n'
import { downloadJson, downloadTextFile } from '../utils/exportUtils'

const props = defineProps({
  ruleCoverage: {
    type: Array,
    default: () => []
  }
})

const statusFilter = ref('all')
const severityFilter = ref('all')
const copyStatus = ref('')
const expandedRules = ref(new Set())

const enabledCount = computed(() => {
  return props.ruleCoverage.filter(r => r.enabled).length
})

const triggeredCount = computed(() => {
  return props.ruleCoverage.filter(r => r.triggered).length
})

const filteredRules = computed(() => {
  return props.ruleCoverage.filter(rule => {
    const matchesStatus = statusFilter.value === 'all' ||
      (statusFilter.value === 'triggered' && rule.triggered) ||
      (statusFilter.value === 'not_triggered' && !rule.triggered)

    const matchesSeverity = severityFilter.value === 'all' ||
      rule.severity.toLowerCase() === severityFilter.value

    return matchesStatus && matchesSeverity
  })
})

const toggleEvidence = (ruleId) => {
  const newSet = new Set(expandedRules.value)
  if (newSet.has(ruleId)) {
    newSet.delete(ruleId)
  } else {
    newSet.add(ruleId)
  }
  expandedRules.value = newSet
}

const copyJson = async () => {
  try {
    const json = JSON.stringify(props.ruleCoverage, null, 2)
    await navigator.clipboard.writeText(json)
    copyStatus.value = 'Copied!'
    setTimeout(() => { copyStatus.value = '' }, 2000)
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}

const exportJson = () => {
  const filename = `rule_coverage_${new Date().toISOString().split('T')[0]}.json`
  downloadJson(filename, props.ruleCoverage)
}

const exportMarkdown = () => {
  const filename = `rule_coverage_${new Date().toISOString().split('T')[0]}.md`

  let md = `# Rule Coverage Report\n\n`
  md += `| Rule | Severity | Enabled | Triggered | Findings | Incidents | Explanation |\n`
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`

  props.ruleCoverage.forEach(item => {
    md += `| ${item.title} | ${item.severity.toUpperCase()} | ${item.enabled ? 'Yes' : 'No'} | ${item.triggered ? 'Yes' : 'No'} | ${item.finding_count} | ${item.incident_count} | ${item.explanation} |\n`
  })

  downloadTextFile(filename, md, 'text/markdown')
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

.card-header {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 0.5rem;
}

.result-card h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #495057;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.coverage-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.stat-item.triggered .stat-value { color: #dc3545; }
.stat-item.untriggered .stat-value { color: #6c757d; }

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

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

.filter-select {
  padding: 0.35rem 0.6rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
  background: white;
}

.action-group {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
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

.export-btn {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  color: #495057;
}

.copy-btn:hover, .export-btn:hover {
  background-color: #dee2e6;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background: #fff;
  transition: border-color 0.2s;
}

.rule-item.is-triggered {
  border-left: 4px solid #dc3545;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.rule-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.rule-title-group h3 {
  margin: 0;
  font-size: 1.05rem;
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
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.severity-badge[data-severity="high"] { background: #f8d7da; color: #721c24; }
.severity-badge[data-severity="medium"] { background: #fff3cd; color: #856404; }
.severity-badge[data-severity="low"] { background: #d1ecf1; color: #0c5460; }

.status-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.5rem;
}

.status-badge.enabled { background: #e2e3e5; color: #383d41; }
.status-badge.triggered { background: #f8d7da; color: #721c24; }
.status-badge.untriggered { background: #e2e3e5; color: #6c757d; opacity: 0.7; }

.rule-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.info-block label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #495057;
  margin-bottom: 0.25rem;
}

.info-block p {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.explanation-text {
  font-style: italic;
  color: #666;
}

.rule-metrics {
  display: flex;
  gap: 2rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2c3e50;
}

.rule-fields, .rule-values, .rule-evidence {
  margin-top: 0.75rem;
}

.rule-fields label, .rule-values label, .rule-evidence label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #495057;
  display: block;
  margin-bottom: 0.4rem;
}

.field-tags, .value-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.field-tag {
  font-size: 0.75rem;
  background: #e9ecef;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}

.value-tag {
  font-size: 0.75rem;
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.evidence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.evidence-list {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
}

.evidence-list li {
  margin-bottom: 0.25rem;
}

.evidence-list code {
  font-size: 0.8rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: #e83e8c;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.empty-card {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

@media (max-width: 600px) {
  .coverage-stats {
    grid-template-columns: 1fr 1fr;
  }
  .rule-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
