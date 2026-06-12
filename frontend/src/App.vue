<template>
  <div class="container">
    <header>
      <h1>{{ t('app.title') }}</h1>
      <p>{{ t('app.subtitle') }}</p>
      <LanguageToggle />
    </header>

    <main>
      <div v-if="displayResult" id="analysis-results" class="results-anchor" aria-hidden="true"></div>

      <WorkspaceShell>
        <template #nav>
          <WorkspaceNav
            :items="navigationItems"
            :activeView="activeView"
            @select="handleSelectView"
          />
        </template>

        <div class="shell-main">
          <div v-if="rulesError" class="mini-warning">
            {{ t('app.rulesError', 'Note: Could not load rule configuration ({error}). Using defaults.').replace('{error}', rulesError) }}
          </div>

          <div v-if="error" class="error-msg">
            {{ t('app.error', 'Error: {error}').replace('{error}', error) }}
          </div>

          <section
            v-if="activeView === 'workspace'"
            class="view-panel"
            data-testid="workspace-view-workspace"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.workspace') }}</h2>
            </div>

            <FileUpload
              :loading="loading"
              @analyze="onAnalyze"
            />

            <div class="main-actions" v-if="result || error || selectedFile">
              <button @click="onClearCurrentResult" class="clear-current-btn">
                {{ t('app.clearCurrentResult') }}
              </button>
              <button v-if="result" @click="onSaveCase" class="save-case-btn">
                {{ t('workspace.saveCase') }}
              </button>
            </div>

            <RecentAnalyses
              :history="recentAnalyses"
              @select="onRestoreRecord"
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
          </section>

          <section
            v-else-if="activeView === 'overview'"
            class="view-panel"
            data-testid="workspace-view-overview"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.overview') }}</h2>
            </div>

            <template v-if="displayResult">
              <SummaryCards :summary="displayResult.summary" />

              <ExecutiveSummary :summary="displayResult.executive_summary" />

              <SeverityDistribution
                :findingSeverityCounts="displayResult.summary.finding_severity_counts"
                :incidentSeverityCounts="displayResult.summary.incident_severity_counts"
              />

              <ParseStatsCard :stats="displayResult.parse_stats" />

              <InvestigationEntities :analysisResult="result" />

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
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'investigation'"
            class="view-panel"
            data-testid="workspace-view-investigation"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.investigation') }}</h2>
            </div>

            <template v-if="displayResult">
              <TimelineView :timelineEvents="displayResult.timeline_events || []" />

              <IncidentsList
                :incidents="displayResult.incidents"
                :triageState="triageState"
              />

              <FindingsList
                :findings="displayResult.findings"
                :analysisResult="result"
                :triageState="triageState"
              />

              <div
                v-if="displayResult.rule_coverage"
                id="rule-coverage"
                class="coverage-section"
              >
                <RuleCoverage :ruleCoverage="displayResult.rule_coverage" />
              </div>
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'triageReview'"
            class="view-panel"
            data-testid="workspace-view-triageReview"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.triageReview') }}</h2>
            </div>

            <template v-if="displayResult">
              <TriagePanel
                :caseId="currentCaseId"
                :analysisResult="displayResult"
                @triage-state-change="handleTriageStateChange"
              />

              <CaseNotesPanel
                :caseId="currentCaseId === 'current-analysis' ? caseNotesContextId : currentCaseId"
                @notes-change="handleCaseNotesChange"
              />

              <ReviewReadinessPanel
                :key="reviewReadinessKey"
                :result="result"
                :triageState="triageState"
                :caseId="reviewReadinessCaseId"
              />

              <CaseClosureChecklist
                :result="result"
                :displayResult="displayResult"
                :caseNotes="caseNotesForQuality"
                :reviewReadiness="reviewReadinessForQuality"
                :evidencePackQuality="evidencePackQualityForGuardrails"
                :exportGuardrails="exportGuardrails"
                :shareSafety="evidencePackShareSafetySummary"
              />
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'evidencePack'"
            class="view-panel"
            data-testid="workspace-view-evidencePack"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.evidencePack') }}</h2>
            </div>

            <template v-if="displayResult">
              <EvidencePackQualityScore
                :result="result"
                :triageState="triageState"
                :caseNotes="caseNotesForQuality"
                :reviewReadiness="reviewReadinessForQuality"
              />

              <EvidencePackExportGuardrails
                :quality="evidencePackQualityForGuardrails"
                :reviewReadiness="reviewReadinessForQuality"
                :result="result"
                :triageState="triageState"
                :caseNotes="caseNotesForQuality"
              />

              <EvidencePackShareSafety
                id="evidence-pack-share-safety"
                :markdown="evidencePackShareSafetyMarkdown"
                :result="result"
              />

              <EvidencePackExportPreview
                :result="result"
                :triageState="triageState"
                :caseNotes="caseNotesForQuality"
                :reviewReadiness="reviewReadinessForQuality"
                :evidencePackQuality="evidencePackQualityForGuardrails"
                :exportGuardrails="exportGuardrails"
                :shareSafety="evidencePackShareSafetySummary"
                :caseId="currentCaseId"
                shareSafetyTargetId="evidence-pack-share-safety"
              />
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'markdownReport'"
            class="view-panel"
            data-testid="workspace-view-markdownReport"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.markdownReport') }}</h2>
            </div>

            <template v-if="displayResult">
              <MarkdownReport
                :result="result"
                :reportMarkdown="displayResult.report_markdown"
                :caseId="currentCaseId"
                :caseNotesCaseId="currentCaseId === 'current-analysis' ? caseNotesContextId : currentCaseId"
                :file="selectedFile"
                :sanitizing="sanitizingReport"
                :sanitizedAvailable="isSanitizedAvailable"
                @download-sanitized="handleDownloadSanitized"
              />
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'rules'"
            class="view-panel"
            data-testid="workspace-view-rules"
          >
            <div class="view-header">
              <h2>{{ t('workspaceNav.rules') }}</h2>
            </div>

            <div v-if="rules" class="config-section">
              <RuleConfigPanel :rules="rules" />
            </div>

            <RuleTuningPanel
              v-if="rules"
              :initialConfig="rules"
              :isAnalyzing="loading"
              :hasFile="!!selectedFile"
              :warnings="tuningWarnings"
              @apply="onApplyTuning"
              @reset="handleResetTuning"
            />
          </section>
        </div>
      </WorkspaceShell>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { t, currentLanguage } from './i18n'
import { localizeAnalysisForDisplay } from './utils/localizedAnalysis'
import LanguageToggle from './components/LanguageToggle.vue'
import { useAnalysisState } from './composables/useAnalysisState'
import WorkspaceShell from './components/WorkspaceShell.vue'
import WorkspaceNav from './components/WorkspaceNav.vue'
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
import CaseNotesPanel from './components/CaseNotesPanel.vue'
import EvidencePackQualityScore from './components/EvidencePackQualityScore.vue'
import EvidencePackExportGuardrails from './components/EvidencePackExportGuardrails.vue'
import EvidencePackShareSafety from './components/EvidencePackShareSafety.vue'
import EvidencePackExportPreview from './components/EvidencePackExportPreview.vue'
import CaseClosureChecklist from './components/CaseClosureChecklist.vue'
import ReviewReadinessPanel from './components/ReviewReadinessPanel.vue'
import TriagePanel from './components/TriagePanel.vue'
import InvestigationEntities from './components/InvestigationEntities.vue'
import { loadCaseNotes } from './utils/caseNotesStorage'
import { getTriageState } from './utils/triageStorage'
import { buildEvidencePackMarkdown } from './utils/evidencePackExport'
import { buildEvidencePackQuality } from './utils/evidencePackQuality'
import { buildEvidencePackExportGuardrails } from './utils/evidencePackExportGuardrails'
import { buildEvidencePackShareSafety } from './utils/evidencePackShareSafety'
import { buildReviewReadiness } from './utils/reviewReadiness'

const RESULT_REQUIRED_VIEWS = new Set([
  'overview',
  'investigation',
  'triageReview',
  'evidencePack',
  'markdownReport'
])

const {
  loading,
  result,
  currentCaseId,
  caseNotesContextId,
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

const activeView = ref('workspace')
const triageState = ref({})
const caseNotesRevision = ref(0)

const hasDisplayResult = computed(() => Boolean(displayResult.value))

const navigationItems = computed(() => {
  return [
    { key: 'workspace', labelKey: 'workspaceNav.workspace', disabled: false },
    { key: 'overview', labelKey: 'workspaceNav.overview', disabled: !hasDisplayResult.value },
    { key: 'investigation', labelKey: 'workspaceNav.investigation', disabled: !hasDisplayResult.value },
    { key: 'triageReview', labelKey: 'workspaceNav.triageReview', disabled: !hasDisplayResult.value },
    { key: 'evidencePack', labelKey: 'workspaceNav.evidencePack', disabled: !hasDisplayResult.value },
    { key: 'markdownReport', labelKey: 'workspaceNav.markdownReport', disabled: !hasDisplayResult.value },
    { key: 'rules', labelKey: 'workspaceNav.rules', disabled: false }
  ]
})

const reviewReadinessCaseId = computed(() => {
  return currentCaseId.value === 'current-analysis' ? caseNotesContextId.value : currentCaseId.value
})

const reviewReadinessKey = computed(() => {
  return `${reviewReadinessCaseId.value}:${caseNotesRevision.value}`
})

const caseNotesForQuality = computed(() => {
  if (!result.value) return []

  caseNotesRevision.value
  return loadCaseNotes(reviewReadinessCaseId.value)
})

const reviewReadinessForQuality = computed(() => {
  return buildReviewReadiness({
    result: result.value,
    triageState: triageState.value,
    caseNotes: caseNotesForQuality.value
  })
})

const evidencePackQualityForGuardrails = computed(() => {
  return buildEvidencePackQuality({
    result: result.value,
    triageState: triageState.value,
    caseNotes: caseNotesForQuality.value,
    reviewReadiness: reviewReadinessForQuality.value
  })
})

const exportGuardrails = computed(() => {
  return buildEvidencePackExportGuardrails({
    quality: evidencePackQualityForGuardrails.value,
    reviewReadiness: reviewReadinessForQuality.value,
    result: result.value,
    triageState: triageState.value,
    caseNotes: caseNotesForQuality.value
  })
})

const evidencePackShareSafetyMarkdown = computed(() => {
  if (!result.value) {
    return ''
  }

  return buildEvidencePackMarkdown(result.value, {
    caseId: currentCaseId.value,
    triageState: triageState.value,
    caseNotes: caseNotesForQuality.value,
    reviewReadiness: reviewReadinessForQuality.value,
    evidencePackQuality: evidencePackQualityForGuardrails.value,
    evidencePackExportGuardrails: exportGuardrails.value,
    language: currentLanguage.value
  })
})

const evidencePackShareSafetySummary = computed(() => {
  if (!result.value) {
    return null
  }

  return buildEvidencePackShareSafety({
    markdown: evidencePackShareSafetyMarkdown.value,
    result: result.value
  })
})

function hydrateTriageState() {
  if (!result.value) {
    triageState.value = {}
    return
  }

  triageState.value = getTriageState(currentCaseId.value)
}

watch([result, currentCaseId], () => {
  hydrateTriageState()
}, { immediate: true })

function isViewDisabled(viewKey) {
  return RESULT_REQUIRED_VIEWS.has(viewKey) && !hasDisplayResult.value
}

function handleSelectView(viewKey) {
  if (isViewDisabled(viewKey)) {
    return
  }

  activeView.value = viewKey
}

function scrollToAnchor(anchorId) {
  nextTick(() => {
    const el = document.getElementById(anchorId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const onAnalyze = async (fileOrFiles, logFormat) => {
  await handleAnalyze(fileOrFiles, logFormat)
  if (result.value) {
    activeView.value = 'overview'
    scrollToAnchor('analysis-results')
  }
}

const handleTriageStateChange = (state) => {
  triageState.value = state || {}
}

const handleCaseNotesChange = () => {
  caseNotesRevision.value += 1
}

const onClearCurrentResult = () => {
  clearCurrentResult()
  triageState.value = {}
  activeView.value = 'workspace'
}

const onRestoreRecord = (record) => {
  handleRestoreRecord(record)
  activeView.value = 'overview'
  scrollToAnchor('analysis-results')
}

const onApplyTuning = async (overrides) => {
  activeView.value = 'investigation'
  await handleApplyTuning(overrides)
}

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
   currentCaseId.value = caseItem.id
   caseNotesContextId.value = caseItem.id
   // Since it's a snapshot, we don't have the original file
  selectedFile.value = null
  error.value = null

  activeView.value = 'overview'
  scrollToAnchor('analysis-results')
}
</script>

<style scoped>
.container {
  max-width: 1280px;
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

.shell-main {
  min-width: 0;
}

.results-anchor {
  height: 0;
}

.view-panel {
  min-width: 0;
}

.view-header {
  margin-bottom: 1rem;
}

.view-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.empty-view-state {
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
}

.empty-view-state h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.empty-view-state p {
  margin: 0;
  color: #6c757d;
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

  .main-actions {
    flex-direction: column;
  }
}
</style>
