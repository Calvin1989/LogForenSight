<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header-inner">
        <div class="app-header-copy">
          <h1 class="app-title">{{ t('app.title') }}</h1>
          <p class="app-subtitle">{{ t('app.subtitle') }}</p>
        </div>
        <LanguageToggle />
      </div>
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
            <Alert v-if="rulesError" variant="default" class="mb-4">
            <AlertDescription>
              {{ t('app.rulesError', 'Note: Could not load rule configuration ({error}). Using defaults.').replace('{error}', rulesError) }}
            </AlertDescription>
          </Alert>

          <Alert v-if="error" variant="destructive">
            <AlertDescription>
              {{ t('app.error', 'Error: {error}').replace('{error}', error) }}
            </AlertDescription>
          </Alert>

          <section
            v-if="activeView === 'workspace'"
            class="view-panel"
            data-testid="workspace-view-workspace"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.workspace') }}</h2>
              <p class="view-description">{{ t('workspaceShell.workspaceDescription') }}</p>
            </div>

            <FileUpload
              :loading="loading"
              @analyze="onAnalyze"
            />

            <div class="main-actions" v-if="result || error || selectedFile">
              <Button variant="outline" @click="onClearCurrentResult">
                {{ t('app.clearCurrentResult') }}
              </Button>
              <Button v-if="result" @click="onSaveCase">
                {{ t('workspace.saveCase') }}
              </Button>
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
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.overview') }}</h2>
              <p class="view-description">{{ t('workspaceShell.overviewDescription') }}</p>
            </div>

            <template v-if="displayResult">
              <AnalysisContextBar :analysisResult="displayResult" />

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
              <span class="empty-view-eyebrow">{{ t('workspaceShell.resultsRequired') }}</span>
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
              <p class="empty-view-hint">{{ t('workspaceShell.overviewEmptyHint') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'investigation'"
            class="view-panel"
            data-testid="workspace-view-investigation"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.investigation') }}</h2>
              <p class="view-description">{{ t('workspaceShell.investigationDescription') }}</p>
            </div>

            <template v-if="displayResult">
              <AnalysisContextBar :analysisResult="displayResult" />

              <div class="investigation-layout" data-testid="investigation-layout">
                <div class="investigation-intro" data-testid="investigation-intro">
                  <div class="investigation-intro-icon">🔍</div>
                  <p class="investigation-intro-text">{{ t('investigation.introBody') }}</p>
                </div>

                <div class="investigation-timeline-incidents-group" data-testid="investigation-timeline-incidents-group">
                  <div class="group-header">
                    <h3 class="group-title">{{ t('investigation.timelineIncidentsTitle') }}</h3>
                    <span class="group-description">{{ t('investigation.timelineIncidentsDescription') }}</span>
                  </div>
                  <div class="group-content">
                    <TimelineView :timelineEvents="displayResult.timeline_events || []" />

                    <IncidentsList
                      :incidents="displayResult.incidents"
                      :triageState="triageState"
                    />
                  </div>
                </div>

                <div class="investigation-findings-rules-group" data-testid="investigation-findings-rules-group">
                  <div class="group-header">
                    <h3 class="group-title">{{ t('investigation.findingsRulesTitle') }}</h3>
                    <span class="group-description">{{ t('investigation.findingsRulesDescription') }}</span>
                  </div>
                  <div class="group-content">
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
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <span class="empty-view-eyebrow">{{ t('workspaceShell.resultsRequired') }}</span>
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
              <p class="empty-view-hint">{{ t('workspaceShell.investigationEmptyHint') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'triageReview'"
            class="view-panel"
            data-testid="workspace-view-triageReview"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.triageReview') }}</h2>
              <p class="view-description">{{ t('workspaceShell.triageReviewDescription') }}</p>
            </div>

            <template v-if="displayResult">
              <div class="triage-review-layout" data-testid="triage-review-layout">
                <div class="triage-review-intro" data-testid="triage-review-intro">
                  <div class="triage-review-intro-icon">📋</div>
                  <p class="triage-review-intro-text">{{ t('triageReview.introDescription') }}</p>
                </div>

                <div class="triage-review-decisions-group" data-testid="triage-review-decisions-group">
                  <div class="group-header">
                    <h3 class="group-title">{{ t('triageReview.decisionsTitle') }}</h3>
                    <span class="group-description">{{ t('triageReview.decisionsDescription') }}</span>
                  </div>
                  <div class="group-content">
                    <TriagePanel
                      :caseId="currentCaseId"
                      :analysisResult="displayResult"
                      @triage-state-change="handleTriageStateChange"
                    />
                    <CaseNotesPanel
                      :caseId="currentCaseId === 'current-analysis' ? caseNotesContextId : currentCaseId"
                      @notes-change="handleCaseNotesChange"
                    />
                  </div>
                </div>

                <div class="triage-review-readiness-group" data-testid="triage-review-readiness-group">
                  <div class="group-header">
                    <h3 class="group-title">{{ t('triageReview.readinessTitle') }}</h3>
                    <span class="group-description">{{ t('triageReview.readinessDescription') }}</span>
                  </div>
                  <div class="group-content">
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
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="empty-view-state" data-testid="workspace-empty-state">
              <span class="empty-view-eyebrow">{{ t('workspaceShell.resultsRequired') }}</span>
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
              <p class="empty-view-hint">{{ t('workspaceShell.triageReviewEmptyHint') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'evidencePack'"
            class="view-panel"
            data-testid="workspace-view-evidencePack"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.evidencePack') }}</h2>
              <p class="view-description">{{ t('workspaceShell.evidencePackDescription') }}</p>
            </div>

            <template v-if="displayResult">
              <AnalysisContextBar :analysisResult="displayResult" />

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
              <span class="empty-view-eyebrow">{{ t('workspaceShell.resultsRequired') }}</span>
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
              <p class="empty-view-hint">{{ t('workspaceShell.evidencePackEmptyHint') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'markdownReport'"
            class="view-panel"
            data-testid="workspace-view-markdownReport"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.markdownReport') }}</h2>
              <p class="view-description">{{ t('workspaceShell.markdownReportDescription') }}</p>
            </div>

            <template v-if="displayResult">
              <AnalysisContextBar :analysisResult="displayResult" />

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
              <span class="empty-view-eyebrow">{{ t('workspaceShell.resultsRequired') }}</span>
              <h3>{{ t('workspaceShell.emptyTitle') }}</h3>
              <p>{{ t('workspaceShell.emptyDescription') }}</p>
              <p class="empty-view-hint">{{ t('workspaceShell.markdownReportEmptyHint') }}</p>
            </div>
          </section>

          <section
            v-else-if="activeView === 'rules'"
            class="view-panel"
            data-testid="workspace-view-rules"
          >
            <div class="view-header">
              <span class="view-eyebrow">{{ t('workspaceShell.sectionEyebrow') }}</span>
              <h2>{{ t('workspaceNav.rules') }}</h2>
              <p class="view-description">{{ t('workspaceShell.rulesDescription') }}</p>
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
import AnalysisContextBar from './components/AnalysisContextBar.vue'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    { key: 'workspace', labelKey: 'workspaceNav.workspace', descriptionKey: 'workspaceNav.workspaceDescription', disabled: false },
    { key: 'overview', labelKey: 'workspaceNav.overview', descriptionKey: 'workspaceNav.overviewDescription', disabled: !hasDisplayResult.value },
    { key: 'investigation', labelKey: 'workspaceNav.investigation', descriptionKey: 'workspaceNav.investigationDescription', disabled: !hasDisplayResult.value },
    { key: 'triageReview', labelKey: 'workspaceNav.triageReview', descriptionKey: 'workspaceNav.triageReviewDescription', disabled: !hasDisplayResult.value },
    { key: 'evidencePack', labelKey: 'workspaceNav.evidencePack', descriptionKey: 'workspaceNav.evidencePackDescription', disabled: !hasDisplayResult.value },
    { key: 'markdownReport', labelKey: 'workspaceNav.markdownReport', descriptionKey: 'workspaceNav.markdownReportDescription', disabled: !hasDisplayResult.value },
    { key: 'rules', labelKey: 'workspaceNav.rules', descriptionKey: 'workspaceNav.rulesDescription', disabled: false }
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
.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--card);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.app-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.app-header-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
}

.app-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted-foreground);
}

.main-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.shell-main {
  min-width: 0;
  display: grid;
  gap: 1.5rem;
}

.results-anchor {
  height: 0;
}

.view-panel {
  min-width: 0;
}

.view-header {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.view-header h2 {
  margin: 0.25rem 0 0.35rem;
  font-size: 1.35rem;
  color: var(--foreground);
}

.view-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.view-description {
  margin: 0;
  max-width: 46rem;
  color: var(--muted-foreground);
}

.empty-view-state {
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--secondary);
  padding: 2rem;
  text-align: center;
}

.empty-view-state h3 {
  margin: 0.35rem 0 0.5rem;
  color: var(--foreground);
}

.empty-view-state p {
  margin: 0;
  color: var(--muted-foreground);
}

.empty-view-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--secondary);
  color: var(--secondary-foreground);
  font-size: 0.74rem;
  font-weight: 700;
}

.empty-view-hint {
  margin-top: 0.75rem !important;
  color: var(--foreground) !important;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.triage-review-layout,
.investigation-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.triage-review-intro,
.investigation-intro {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.triage-review-intro-icon,
.investigation-intro-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.triage-review-intro-text,
.investigation-intro-text {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.9rem;
}

.triage-review-decisions-group,
.triage-review-readiness-group,
.investigation-timeline-incidents-group,
.investigation-findings-rules-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border);
}

.group-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--foreground);
}

.group-description {
  font-size: 0.85rem;
  color: var(--muted-foreground);
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-top: 0.25rem;
}

.group-content > * {
  margin-top: 0 !important;
}

@media (max-width: 768px) {
  .app-shell {
    padding: 1rem;
  }

  .app-header {
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
  }

  .app-header-inner {
    flex-direction: column;
    text-align: center;
  }

  .side-by-side {
    grid-template-columns: 1fr;
  }

  .main-actions {
    flex-direction: column;
  }

  .triage-review-intro,
  .investigation-intro {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 1rem;
  }

  .group-content {
    gap: 1rem;
  }
}
</style>
