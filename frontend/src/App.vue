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

            <div class="workspace-primary">
              <FileUpload
                :loading="loading"
                @analyze="onAnalyze"
              />
              <div class="main-actions" v-if="result || error || selectedFile">
                <Button variant="outline" size="sm" @click="onClearCurrentResult">
                  {{ t('app.clearCurrentResult') }}
                </Button>
                <Button v-if="result" size="sm" @click="onSaveCase">
                  {{ t('workspace.saveCase') }}
                </Button>
              </div>
            </div>

            <div class="workspace-secondary">
              <RecentAnalyses
                :history="recentAnalyses"
                @select="onRestoreRecord"
                @clear="handleClearHistory"
              />
            </div>

            <div class="workspace-tertiary">
              <CaseWorkspace
                :cases="savedCases"
                @select="onSelectCase"
                @refresh="handleRefreshCases"
              />
            </div>

            <div class="workspace-tertiary">
              <ReportComparison
                :history="recentAnalyses"
              />
            </div>
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

              <div class="overview-dashboard">
                <div class="overview-primary">
                  <ExecutiveSummary :summary="displayResult.executive_summary" />
                </div>

                <div class="overview-stats-row">
                  <SummaryCards :summary="displayResult.summary" />
                  <SeverityDistribution
                    :findingSeverityCounts="displayResult.summary.finding_severity_counts"
                    :incidentSeverityCounts="displayResult.summary.incident_severity_counts"
                  />
                </div>

                <div class="overview-secondary">
                  <ParseStatsCard :stats="displayResult.parse_stats" />
                  <InvestigationEntities :analysisResult="result" />
                </div>

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
                  <div class="readiness-grid">
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
                      @update:closureData="handleClosureData"
                    />
                    <CaseClosureEvidenceGaps :gap-items="closureData.gapItems" />
                    <CaseClosureNextActions
                      :gap-items="closureData.gapItems"
                      :handoff-readiness="closureData.handoffReadiness"
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
import CaseClosureEvidenceGaps from './components/CaseClosureEvidenceGaps.vue'
import CaseClosureNextActions from './components/CaseClosureNextActions.vue'
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
const closureData = ref({ gapItems: [], handoffReadiness: null })

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

const handleClosureData = (data) => {
  closureData.value = data
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
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--layout-gutter);
  padding-top: 1rem;
}

.app-header {
  margin-bottom: var(--layout-section-gap);
  padding: 0 0 0.625rem;
  border-bottom: 1px solid var(--border);
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
  gap: 0.0625rem;
}

.app-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.01em;
}

.app-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.main-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.shell-main {
  min-width: 0;
  display: grid;
  gap: 0;
}

.results-anchor {
  height: 0;
}

.view-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border);
}

.view-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.01em;
}

.view-eyebrow {
  display: block;
  margin-bottom: 0.125rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.view-description {
  margin: 0.25rem 0 0;
  max-width: 42rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.empty-view-state {
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-subtle);
  padding: 2rem 1.25rem;
  text-align: center;
}

.empty-view-state h3 {
  margin: 0.125rem 0 0.25rem;
  font-size: 0.875rem;
  color: var(--foreground);
}

.empty-view-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.empty-view-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--muted);
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
}

.empty-view-hint {
  margin-top: 0.375rem !important;
  color: var(--foreground) !important;
  font-size: 0.75rem !important;
}

.workspace-primary {
  padding: 1rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.workspace-secondary {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.workspace-tertiary {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--layout-section-gap);
}

.overview-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.overview-primary {
  min-width: 0;
}

.overview-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--layout-section-gap);
}

.overview-stats-row > * {
  min-width: 0;
}

.overview-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--layout-section-gap);
}

.overview-secondary > * {
  min-width: 0;
}

.triage-review-layout,
.investigation-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.triage-review-intro,
.investigation-intro {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.triage-review-intro-icon,
.investigation-intro-icon {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

.triage-review-intro-text,
.investigation-intro-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.triage-review-decisions-group,
.triage-review-readiness-group,
.investigation-timeline-incidents-group,
.investigation-findings-rules-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-header {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--border);
}

.group-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--foreground);
}

.group-description {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0;
}

.group-content > * {
  margin-top: 0 !important;
}

.readiness-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 0;
}

.readiness-grid > * {
  min-width: 0;
  margin-top: 0 !important;
}

@media (max-width: 768px) {
  .app-shell {
    padding: 0.75rem;
  }

  .app-header-inner {
    flex-direction: column;
    text-align: center;
  }

  .side-by-side {
    grid-template-columns: 1fr;
  }

  .overview-stats-row,
  .overview-secondary,
  .readiness-grid {
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
  }
}
</style>
