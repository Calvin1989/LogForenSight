<template>
  <div class="container">
    <header>
      <h1>{{ t('app.title') }}</h1>
      <p>{{ t('app.subtitle') }}</p>
      <LanguageToggle />
    </header>

    <main>
      <FileUpload 
        :loading="loading" 
        @analyze="handleAnalyze" 
      />

      <div class="main-actions" v-if="result || error || selectedFile">
        <button @click="clearCurrentResult" class="clear-current-btn">
          {{ t('app.clearCurrentResult') }}
        </button>
        <button v-if="result" @click="onSaveCase" class="save-case-btn">
          {{ t('workspace.saveCase') }}
        </button>
      </div>

      <RecentAnalyses 
        :history="recentAnalyses" 
        @select="handleRestoreRecord"
        @clear="handleClearHistory"
      />

      <CaseWorkspace
        :cases="savedCases"
        @select="onSelectCase"
        @refresh="handleRefreshCases"
      />

      <ReportComparison
        :history="recentAnalyses"
      />

      <div v-if="rules" class="config-section">
        <RuleConfigPanel :rules="rules" />
      </div>

      <RuleTuningPanel
        v-if="rules"
        :initialConfig="rules"
        :isAnalyzing="loading"
        :hasFile="!!selectedFile"
        :warnings="tuningWarnings"
        @apply="handleApplyTuning"
        @reset="handleResetTuning"
      />

      <div v-if="displayResult && displayResult.rule_coverage" id="rule-coverage" class="coverage-section">
        <RuleCoverage :ruleCoverage="displayResult.rule_coverage" />
      </div>

      <div v-if="rulesError" class="mini-warning">
        {{ t('app.rulesError', 'Note: Could not load rule configuration ({error}). Using defaults.').replace('{error}', rulesError) }}
      </div>

      <div v-if="error" class="error-msg">
        {{ t('app.error', 'Error: {error}').replace('{error}', error) }}
      </div>

      <div v-if="displayResult" id="analysis-results" class="results-container">
        <SummaryCards :summary="displayResult.summary" />

        <ExecutiveSummary :summary="displayResult.executive_summary" />

        <SeverityDistribution 
          :findingSeverityCounts="displayResult.summary.finding_severity_counts"
          :incidentSeverityCounts="displayResult.summary.incident_severity_counts"
        />

        <TimelineView :timelineEvents="displayResult.timeline_events || []" />

        <ParseStatsCard :stats="displayResult.parse_stats" />

        <IncidentsList :incidents="displayResult.incidents" />

        <div class="side-by-side">
          <TopList 
            :title="t('app.topIps')"
            :items="displayResult.summary.top_ips"
            itemKey="ip"
            :itemLabel="t('app.ipAddress')"
          />
          <TopList
            :title="t('app.topPaths')"
            :items="displayResult.summary.top_paths"
            itemKey="path"
            :itemLabel="t('app.path')"
          />
        </div>

        <FindingsList :findings="displayResult.findings" />

        <MarkdownReport
          :result="displayResult"
          :reportMarkdown="displayResult.report_markdown"
          :file="selectedFile"
          :sanitizing="sanitizingReport"
          :sanitizedAvailable="isSanitizedAvailable"
          @download-sanitized="handleDownloadSanitized"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t, currentLanguage } from './i18n'
import { localizeAnalysisForDisplay } from './utils/localizedAnalysis'
import LanguageToggle from './components/LanguageToggle.vue'
import { useAnalysisState } from './composables/useAnalysisState'
import FileUpload from './components/FileUpload.vue'
import SummaryCards from './components/SummaryCards.vue'
import ExecutiveSummary from './components/ExecutiveSummary.vue'
import TopList from './components/TopList.vue'
import FindingsList from './components/FindingsList.vue'
import MarkdownReport from './components/MarkdownReport.vue'
import IncidentsList from './components/IncidentsList.vue'
import RuleCoverage from './components/RuleCoverage.vue'
import RuleConfigPanel from './components/RuleConfigPanel.vue'
import RuleTuningPanel from './components/RuleTuningPanel.vue'
import ParseStatsCard from './components/ParseStatsCard.vue'
import SeverityDistribution from './components/SeverityDistribution.vue'
import TimelineView from './components/TimelineView.vue'
import RecentAnalyses from './components/RecentAnalyses.vue'
import ReportComparison from './components/ReportComparison.vue'
import CaseWorkspace from './components/CaseWorkspace.vue'

const {
  loading,
  result,
  error,
  selectedFile,
  sanitizingReport,
  rules,
  rulesError,
  recentAnalyses,
  savedCases,
  tuningWarnings,
  handleAnalyze,
  handleApplyTuning,
  handleResetTuning,
  handleRestoreRecord,
  handleClearHistory,
  handleSaveCase,
  handleRefreshCases,
  clearCurrentResult,
  handleDownloadSanitized,
  isSanitizedAvailable
} = useAnalysisState()

const displayResult = computed(() => {
  return localizeAnalysisForDisplay(result.value, currentLanguage.value)
})

const onSaveCase = () => {
  const defaultTitle = result.value.analysis_mode === 'batch'
    ? `Batch Case: ${new Date().toLocaleString()}`
    : `Case: ${selectedFile.value?.name || 'Manual Save'}`

  const title = prompt(t('workspace.caseTitle'), defaultTitle)
  if (title === null) return // Cancelled

  handleSaveCase(title)
  alert(t('workspace.saved'))
}

const onSelectCase = (caseItem) => {
  // Restore from snapshot
  result.value = caseItem.result_snapshot
  // Since it's a snapshot, we don't have the original file
  selectedFile.value = null
  error.value = null

  // Scroll to results
  nextTick(() => {
    const el = document.getElementById('analysis-results')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  })
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.main-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.clear-current-btn, .save-case-btn {
  padding: 0.6rem 1.2rem;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-current-btn:hover, .save-case-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

.save-case-btn {
  background-color: #e7f5ff;
  color: #1971c2;
  border-color: #a5d8ff;
}

.save-case-btn:hover {
  background-color: #d0ebff;
  border-color: #74c0fc;
}

.error-msg {
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.mini-warning {
  font-size: 0.85rem;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .side-by-side {
    grid-template-columns: 1fr;
  }
}
</style>
