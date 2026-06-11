<template>
  <section class="preview-container">
    <div class="preview-header">
      <div>
        <h3>{{ t('evidencePackPreview.title') }}</h3>
        <p v-if="result" class="summary-text">
          {{ t('evidencePackPreview.previewLabel') }}
        </p>
      </div>

      <div v-if="result" class="preview-actions">
        <button type="button" class="preview-btn" @click="togglePreview">
          {{ isOpen ? t('evidencePackPreview.hidePreview') : t('evidencePackPreview.showPreview') }}
        </button>
        <button type="button" class="preview-btn copy-btn" @click="copyMarkdown">
          {{ t('evidencePackPreview.copyMarkdown') }}
        </button>
      </div>
    </div>

    <div v-if="!result" class="empty-state">
      {{ t('evidencePackPreview.empty') }}
    </div>

    <template v-else>
      <p
        v-if="copyFeedbackKey"
        class="copy-feedback"
        :class="{ error: copyFeedbackKey === 'evidencePackPreview.copyFailed' }"
      >
        {{ t(copyFeedbackKey) }}
      </p>

      <div
        class="handoff-summary-bar"
        data-testid="evidence-pack-handoff-summary-bar"
        :aria-label="t('evidencePackPreview.handoffSummaryTitle')"
      >
        <div class="handoff-summary-header">
          <span class="handoff-summary-title">{{ t('evidencePackPreview.handoffSummaryTitle') }}</span>
          <span class="handoff-summary-note">{{ t('evidencePackPreview.handoffSummaryNote') }}</span>
        </div>
        <div class="handoff-summary-items">
          <article
            v-for="item in handoffSummaryItems"
            :key="item.key"
            class="handoff-summary-item"
            :class="`is-${item.tone}`"
          >
            <div class="handoff-summary-label">{{ item.label }}</div>
            <div class="handoff-summary-value">{{ item.value }}</div>
            <div v-if="item.detail" class="handoff-summary-detail">{{ item.detail }}</div>
          </article>
        </div>
      </div>

      <div
        class="export-manifest-card"
        data-testid="evidence-pack-export-manifest"
      >
        <div class="export-manifest-header">
          <div>
            <h4>{{ t('evidencePackPreview.manifestTitle') }}</h4>
            <p>{{ t('evidencePackPreview.manifestSubtitle') }}</p>
          </div>
          <div class="export-manifest-generated">
            <span class="export-manifest-meta-label">{{ t('evidencePackPreview.manifestGeneratedAt') }}</span>
            <span class="export-manifest-meta-value">{{ manifest.generatedAt }}</span>
          </div>
        </div>

        <div class="export-manifest-grid">
          <section class="export-manifest-section">
            <h5>{{ t('evidencePackPreview.manifestSourceCounts') }}</h5>
            <dl class="export-manifest-list">
              <div
                v-for="item in manifestSourceCountItems"
                :key="item.key"
                class="export-manifest-row"
              >
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="export-manifest-section">
            <h5>{{ t('evidencePackPreview.manifestStatusSummary') }}</h5>
            <dl class="export-manifest-list">
              <div
                v-for="item in manifestStatusItems"
                :key="item.key"
                class="export-manifest-row"
              >
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="export-manifest-section">
            <h5>{{ t('evidencePackPreview.manifestClosureSummary') }}</h5>
            <dl class="export-manifest-list">
              <div
                v-for="item in manifestClosureItems"
                :key="item.key"
                class="export-manifest-row"
              >
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          class="export-manifest-compatibility"
          data-testid="evidence-pack-manifest-compatibility"
          :class="`is-${manifestExportValidation.compatibility}`"
        >
          <span class="export-manifest-compatibility-label">
            {{ t('evidencePackPreview.manifestCompatibilityTitle') }}
          </span>
          <strong class="export-manifest-compatibility-value">
            {{ formatManifestCompatibilityStatus(manifestExportValidation.status) }}
          </strong>
          <p class="export-manifest-compatibility-note">
            {{
              manifestExportValidation.status === 'blocked'
                ? t('evidencePackPreview.manifestCompatibilityBlockedNote')
                : t('evidencePackPreview.manifestCompatibilitySafeNote')
            }}
          </p>
        </div>
      </div>

      <div v-if="isOpen" class="preview-body">
        <div class="preview-layout">
          <nav
            v-if="navigatorSections.length > 0"
            class="section-navigator"
            data-testid="evidence-pack-section-navigator"
            :aria-label="t('evidencePackPreview.sectionNavigator')"
          >
            <div class="navigator-title">{{ t('evidencePackPreview.sectionNavigator') }}</div>
            <button
              v-for="section in navigatorSections"
              :key="section.key"
              type="button"
              class="navigator-link"
              @click="scrollToSection(section.targetId)"
            >
              {{ section.label }}
            </button>
          </nav>

          <div class="preview-content">
            <div class="preview-label">{{ t('evidencePackPreview.previewLabel') }}</div>
            <div data-testid="evidence-pack-preview" class="preview-markdown">
              <pre v-if="previewIntro" class="preview-block">{{ previewIntro }}</pre>
              <section
                v-for="section in previewContentSections"
                :id="section.targetId"
                :key="section.targetId"
                class="preview-section"
                :data-section-key="section.navigationKey || 'other'"
              >
                <div v-if="section.title" class="preview-section-actions">
                  <button
                    type="button"
                    class="preview-section-copy-btn"
                    data-testid="copy-section-button"
                    :aria-label="t('evidencePackPreview.copySectionWithTitle', { title: section.title })"
                    @click="copySection(section)"
                  >
                    {{ t('evidencePackPreview.copySection') }}
                  </button>
                  <span
                    v-if="sectionCopyFeedback.targetId === section.targetId && sectionCopyFeedback.key"
                    class="section-copy-feedback"
                    :class="{ error: sectionCopyFeedback.key === 'evidencePackPreview.copySectionFailed' }"
                  >
                    {{ t(sectionCopyFeedback.key) }}
                  </span>
                </div>
                <pre class="preview-block">{{ section.content }}</pre>
              </section>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { currentLanguage, t } from '../i18n'
import { buildEvidencePackMarkdown } from '../utils/evidencePackExport'
import {
  buildEvidencePackManifest,
  validateEvidencePackManifestForExport
} from '../utils/evidencePackManifest'

const SUPPORTED_NAVIGATOR_SECTIONS = [
  { key: 'review-readiness', labelKey: 'reviewReadiness.title' },
  { key: 'quality-score', labelKey: 'evidencePackQuality.title' },
  { key: 'export-guardrails', labelKey: 'evidencePackGuardrails.title' },
  { key: 'share-safety-review', labelKey: 'evidencePackShareSafety.title', external: true },
  { key: 'parse-stats', labelKey: 'evidencePack.parseStats' },
  { key: 'findings', labelKey: 'evidencePack.findingsList' },
  { key: 'incidents', labelKey: 'evidencePack.incidentsList' },
  { key: 'timeline', labelKey: 'evidencePack.timelineHighlights' },
  { key: 'rule-coverage', labelKey: 'evidencePack.ruleCoverage' },
  { key: 'case-notes', labelKey: 'caseNotes.evidencePackTitle' }
]

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  triageState: {
    type: Object,
    default: () => ({})
  },
  caseNotes: {
    type: Array,
    default: () => []
  },
  reviewReadiness: {
    type: Object,
    default: null
  },
  evidencePackQuality: {
    type: Object,
    default: null
  },
  exportGuardrails: {
    type: Object,
    default: null
  },
  shareSafety: {
    type: Object,
    default: null
  },
  caseId: {
    type: String,
    default: 'current-analysis'
  },
  shareSafetyTargetId: {
    type: String,
    default: ''
  }
})

const isOpen = ref(false)
const copyFeedbackKey = ref('')
const sectionCopyFeedback = ref({
  key: '',
  targetId: ''
})
let copyFeedbackTimer = null
let sectionCopyFeedbackTimer = null

const previewMarkdown = computed(() => {
  currentLanguage.value

  if (!props.result) {
    return ''
  }

  const options = {
    caseId: props.caseId,
    triageState: props.triageState,
    caseNotes: props.caseNotes,
    language: currentLanguage.value
  }

  if (props.reviewReadiness) {
    options.reviewReadiness = props.reviewReadiness
  }

  if (props.evidencePackQuality) {
    options.evidencePackQuality = props.evidencePackQuality
  }

  if (props.exportGuardrails) {
    options.evidencePackExportGuardrails = props.exportGuardrails
  }

  return buildEvidencePackMarkdown(props.result, options)
})

const manifest = computed(() => {
  if (!props.result) {
    return null
  }

  return buildEvidencePackManifest({
    result: props.result,
    triageState: props.triageState,
    caseNotes: props.caseNotes,
    reviewReadiness: props.reviewReadiness,
    evidencePackQuality: props.evidencePackQuality,
    exportGuardrails: props.exportGuardrails,
    shareSafety: props.shareSafety
  })
})

const manifestExportValidation = computed(() => {
  return validateEvidencePackManifestForExport(manifest.value)
})

function buildPreviewSectionId(index, navigationKey) {
  if (navigationKey) {
    return `evidence-pack-preview-${navigationKey}`
  }

  return `evidence-pack-preview-section-${index + 1}`
}

const previewSections = computed(() => {
  if (!previewMarkdown.value) {
    return []
  }

  const titleToNavigationKey = new Map(
    SUPPORTED_NAVIGATOR_SECTIONS
      .filter((section) => !section.external)
      .map((section) => [t(section.labelKey), section.key])
  )

  const sections = []
  const lines = previewMarkdown.value.split('\n')
  let currentSection = null

  lines.forEach((line) => {
    const headingMatch = line.match(/^##\s+(.+)$/)
    if (headingMatch) {
      if (currentSection) {
        sections.push(currentSection)
      }

      const title = headingMatch[1].trim()
      currentSection = {
        title,
        navigationKey: titleToNavigationKey.get(title) || null,
        lines: [line]
      }
      return
    }

    if (!currentSection) {
      currentSection = {
        title: '',
        navigationKey: null,
        lines: [line]
      }
      return
    }

    currentSection.lines.push(line)
  })

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections.map((section, index) => ({
    ...section,
    targetId: buildPreviewSectionId(index, section.navigationKey),
    content: section.lines.join('\n')
  }))
})

const previewIntro = computed(() => {
  return previewSections.value[0]?.title ? '' : (previewSections.value[0]?.content || '')
})

const previewContentSections = computed(() => {
  return previewSections.value[0]?.title ? previewSections.value : previewSections.value.slice(1)
})

const navigatorSections = computed(() => {
  return SUPPORTED_NAVIGATOR_SECTIONS.reduce((sections, section) => {
    const label = t(section.labelKey)

    if (section.external) {
      if (
        props.shareSafetyTargetId &&
        typeof document !== 'undefined' &&
        document.getElementById(props.shareSafetyTargetId)
      ) {
        sections.push({
          key: section.key,
          label,
          targetId: props.shareSafetyTargetId
        })
      }
      return sections
    }

    const matchingSection = previewSections.value.find(
      (previewSection) => previewSection.navigationKey === section.key
    )

    if (matchingSection) {
      sections.push({
        key: section.key,
        label,
        targetId: matchingSection.targetId
      })
    }

    return sections
  }, [])
})

function formatQualityStatus(status) {
  const normalized = typeof status === 'string' ? status.trim().toLowerCase() : ''

  if (normalized === 'ready') return t('evidencePackQuality.statusReady')
  if (normalized === 'good') return t('evidencePackQuality.statusGood')
  if (normalized === 'partial') return t('evidencePackQuality.statusPartial')
  if (normalized === 'missing') return t('evidencePackQuality.statusMissing')

  return t('evidencePackPreview.notAvailable')
}

function formatGuardrailDecision(decision) {
  if (decision === 'ready') return t('evidencePackGuardrails.statusReady')
  if (decision === 'review_recommended') return t('evidencePackGuardrails.statusReviewRecommended')
  if (decision === 'not_ready') return t('evidencePackGuardrails.statusNotReady')

  return t('evidencePackPreview.notAvailable')
}

function formatShareSafetyStatus(status) {
  if (status === 'safe') return t('evidencePackShareSafety.statusSafe')
  if (status === 'review_recommended') return t('evidencePackShareSafety.statusReviewRecommended')
  if (status === 'attention') return t('evidencePackShareSafety.statusAttention')

  return t('evidencePackPreview.notAvailable')
}

function formatManifestReadinessStatus(status) {
  if (status === 'ready') return t('reviewReadiness.overallReady')
  if (status === 'attention') return t('reviewReadiness.overallAttention')
  if (status === 'needs_review') return t('caseClosureChecklist.statusNeedsReview')
  return t('evidencePackPreview.notAvailable')
}

function formatManifestCompatibilityStatus(status) {
  if (status === 'blocked') return t('evidencePackPreview.manifestCompatibilityBlocked')
  return t('evidencePackPreview.manifestCompatibilityCompatible')
}

function summarizeReviewReadiness(readiness) {
  const status = typeof readiness?.status === 'string' ? readiness.status.trim().toLowerCase() : ''
  const requiredBlockers = readiness?.summary?.requiredBlockers

  if (!status) {
    return {
      value: t('evidencePackPreview.notAvailable'),
      detail: t('evidencePackPreview.unavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    value: status === 'ready' ? t('reviewReadiness.overallReady') : t('reviewReadiness.overallAttention'),
    detail: typeof requiredBlockers === 'number'
      ? t('evidencePackPreview.reviewReadinessDetail', { count: requiredBlockers })
      : '',
    tone: status === 'ready' ? 'positive' : 'warning'
  }
}

function summarizeQuality(quality) {
  const hasScore = typeof quality?.score === 'number'
  const status = typeof quality?.status === 'string' ? quality.status.trim().toLowerCase() : ''

  if (!hasScore && !status) {
    return {
      value: t('evidencePackPreview.notAvailable'),
      detail: t('evidencePackPreview.unavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    value: hasScore
      ? t('evidencePackPreview.qualityScoreValue', {
          score: quality.score,
          max: quality?.summary?.maxScore ?? 100
        })
      : formatQualityStatus(status),
    detail: formatQualityStatus(status),
    tone: status === 'ready' || status === 'good'
      ? 'positive'
      : (status === 'partial' || status === 'missing' ? 'warning' : 'neutral')
  }
}

function summarizeGuardrails(guardrails) {
  const decision = typeof guardrails?.decision === 'string' ? guardrails.decision : ''

  if (!decision) {
    return {
      value: t('evidencePackPreview.notAvailable'),
      detail: t('evidencePackPreview.unavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    value: formatGuardrailDecision(decision),
    detail: guardrails?.summaryKey ? t(guardrails.summaryKey) : '',
    tone: decision === 'ready' ? 'positive' : (decision === 'review_recommended' ? 'warning' : 'danger')
  }
}

function summarizeShareSafety(shareSafety) {
  const status = typeof shareSafety?.status === 'string' ? shareSafety.status : ''

  if (!status) {
    return {
      value: t('evidencePackPreview.notAvailable'),
      detail: t('evidencePackPreview.unavailableDetail'),
      tone: 'neutral'
    }
  }

  const issueCount = (Array.isArray(shareSafety?.findings) ? shareSafety.findings.length : 0)
    + (Array.isArray(shareSafety?.warnings) ? shareSafety.warnings.length : 0)

  return {
    value: formatShareSafetyStatus(status),
    detail: status === 'safe'
      ? t('evidencePackPreview.shareSafetyClear')
      : t('evidencePackPreview.shareSafetyIssues', { count: issueCount }),
    tone: status === 'safe' ? 'positive' : (status === 'review_recommended' ? 'warning' : 'danger')
  }
}

const handoffSummaryItems = computed(() => {
  return [
    {
      key: 'review-readiness',
      label: t('reviewReadiness.title'),
      ...summarizeReviewReadiness(props.reviewReadiness)
    },
    {
      key: 'quality-score',
      label: t('evidencePackQuality.title'),
      ...summarizeQuality(props.evidencePackQuality)
    },
    {
      key: 'export-guardrails',
      label: t('evidencePackGuardrails.title'),
      ...summarizeGuardrails(props.exportGuardrails)
    },
    {
      key: 'share-safety-review',
      label: t('evidencePackShareSafety.title'),
      ...summarizeShareSafety(props.shareSafety)
    }
  ]
})

const manifestSourceCountItems = computed(() => {
  const sourceCounts = manifest.value?.sourceCounts || {}

  return [
    { key: 'findings', label: t('evidencePackPreview.manifestFindings'), value: sourceCounts.findings ?? 0 },
    { key: 'incidents', label: t('evidencePackPreview.manifestIncidents'), value: sourceCounts.incidents ?? 0 },
    { key: 'timelineEvents', label: t('evidencePackPreview.manifestTimelineEvents'), value: sourceCounts.timelineEvents ?? 0 },
    { key: 'ruleCoverage', label: t('evidencePackPreview.manifestRuleCoverage'), value: sourceCounts.ruleCoverage ?? 0 },
    { key: 'sourceFiles', label: t('evidencePackPreview.manifestSourceFiles'), value: sourceCounts.sourceFiles ?? 0 },
    { key: 'triageRecords', label: t('evidencePackPreview.manifestTriageRecords'), value: sourceCounts.triageRecords ?? 0 },
    { key: 'caseNotes', label: t('evidencePackPreview.manifestCaseNotes'), value: sourceCounts.caseNotes ?? 0 },
    { key: 'entities', label: t('evidencePackPreview.manifestEntities'), value: sourceCounts.entities ?? 0 }
  ]
})

const manifestStatusItems = computed(() => {
  const statusSummary = manifest.value?.statusSummary || {}

  return [
    {
      key: 'reviewReadinessStatus',
      label: t('evidencePackPreview.manifestReviewReadinessStatus'),
      value: formatManifestReadinessStatus(statusSummary.reviewReadinessStatus)
    },
    {
      key: 'qualityScore',
      label: t('evidencePackPreview.manifestQualityScore'),
      value: statusSummary.qualityScore ?? t('evidencePackPreview.notAvailable')
    },
    {
      key: 'qualityStatus',
      label: t('evidencePackPreview.manifestQualityStatus'),
      value: formatQualityStatus(statusSummary.qualityStatus)
    },
    {
      key: 'guardrailDecision',
      label: t('evidencePackPreview.manifestGuardrailDecision'),
      value: formatGuardrailDecision(statusSummary.guardrailDecision)
    },
    {
      key: 'shareSafetyStatus',
      label: t('evidencePackPreview.manifestShareSafetyStatus'),
      value: formatShareSafetyStatus(statusSummary.shareSafetyStatus)
    },
    {
      key: 'handoffReadinessStatus',
      label: t('evidencePackPreview.manifestHandoffReadinessStatus'),
      value: formatManifestReadinessStatus(statusSummary.handoffReadinessStatus)
    }
  ]
})

const manifestClosureItems = computed(() => {
  const closureSummary = manifest.value?.closureSummary || {}

  return [
    { key: 'gapCount', label: t('evidencePackPreview.manifestGapCount'), value: closureSummary.gapCount ?? 0 },
    { key: 'nextActionCount', label: t('evidencePackPreview.manifestNextActionCount'), value: closureSummary.nextActionCount ?? 0 }
  ]
})

function togglePreview() {
  isOpen.value = !isOpen.value
}

function scrollToSection(targetId) {
  if (!targetId || typeof document === 'undefined') {
    return
  }

  const element = document.getElementById(targetId)
  if (!element || typeof element.scrollIntoView !== 'function') {
    return
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function fallbackCopy(text) {
  if (typeof document === 'undefined' || !document.body) {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    return typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    if (fallbackCopy(text)) {
      return true
    }
  }

  return fallbackCopy(text)
}

function showCopyFeedback(key) {
  copyFeedbackKey.value = key

  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer)
  }

  copyFeedbackTimer = window.setTimeout(() => {
    copyFeedbackKey.value = ''
    copyFeedbackTimer = null
  }, 1800)
}

function showSectionCopyFeedback(targetId, key) {
  sectionCopyFeedback.value = {
    targetId,
    key
  }

  if (sectionCopyFeedbackTimer) {
    clearTimeout(sectionCopyFeedbackTimer)
  }

  sectionCopyFeedbackTimer = window.setTimeout(() => {
    sectionCopyFeedback.value = {
      key: '',
      targetId: ''
    }
    sectionCopyFeedbackTimer = null
  }, 1800)
}

async function copyMarkdown() {
  if (!previewMarkdown.value) {
    return
  }

  if (await copyText(previewMarkdown.value)) {
    showCopyFeedback('evidencePackPreview.copySuccess')
    return
  }

  showCopyFeedback('evidencePackPreview.copyFailed')
}

async function copySection(section) {
  if (!section?.title || !section.content) {
    return
  }

  if (await copyText(section.content)) {
    showSectionCopyFeedback(section.targetId, 'evidencePackPreview.copySectionSuccess')
    return
  }

  showSectionCopyFeedback(section.targetId, 'evidencePackPreview.copySectionFailed')
}

onBeforeUnmount(() => {
  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer)
  }

  if (sectionCopyFeedbackTimer) {
    clearTimeout(sectionCopyFeedbackTimer)
  }
})
</script>

<style scoped>
.preview-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.preview-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preview-btn {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 0.5rem 0.85rem;
  background: #f8f9fa;
  color: #212529;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.preview-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.copy-btn {
  background: #eef7ff;
  border-color: #b6d4fe;
  color: #0b5ed7;
}

.copy-feedback {
  margin: 1rem 0 0;
  color: #2b8a3e;
  font-size: 0.92rem;
  font-weight: 600;
}

.copy-feedback.error {
  color: #c92a2a;
}

.preview-body {
  margin-top: 1rem;
}

.handoff-summary-bar {
  margin-top: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
  padding: 0.9rem 1rem 1rem;
}

.handoff-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.handoff-summary-title {
  color: #212529;
  font-size: 0.92rem;
  font-weight: 700;
}

.handoff-summary-note {
  color: #6c757d;
  font-size: 0.82rem;
}

.handoff-summary-items {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.handoff-summary-item {
  border-radius: 8px;
  padding: 0.8rem;
  border: 1px solid #dee2e6;
  background: white;
  min-width: 0;
}

.handoff-summary-item.is-positive {
  border-color: #c3e6cb;
  background: #f4fbf5;
}

.handoff-summary-item.is-warning {
  border-color: #ffd8a8;
  background: #fff9f1;
}

.handoff-summary-item.is-danger {
  border-color: #ffc9c9;
  background: #fff5f5;
}

.handoff-summary-item.is-neutral {
  border-color: #dee2e6;
  background: #ffffff;
}

.handoff-summary-label {
  color: #495057;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.handoff-summary-value {
  color: #212529;
  font-size: 0.95rem;
  font-weight: 700;
}

.handoff-summary-detail {
  color: #6c757d;
  font-size: 0.82rem;
  margin-top: 0.25rem;
  line-height: 1.45;
}

.export-manifest-card {
  margin-top: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fcfcfd;
  padding: 1rem;
}

.export-manifest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.export-manifest-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.export-manifest-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.export-manifest-generated {
  min-width: 0;
  text-align: right;
}

.export-manifest-meta-label {
  display: block;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 700;
}

.export-manifest-meta-value {
  display: block;
  color: #212529;
  font-size: 0.88rem;
  word-break: break-word;
}

.export-manifest-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.export-manifest-compatibility {
  margin-top: 0.9rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid #dbe7f3;
  background: #f8fbff;
}

.export-manifest-compatibility.is-safe {
  border-color: #d7f0df;
  background: #f6fcf8;
}

.export-manifest-compatibility.is-unsafe {
  border-color: #f3d7d7;
  background: #fff7f7;
}

.export-manifest-compatibility-label {
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
}

.export-manifest-compatibility-value {
  display: block;
  margin-top: 0.2rem;
  color: #212529;
}

.export-manifest-compatibility-note {
  margin: 0.35rem 0 0;
  color: #495057;
  font-size: 0.92rem;
}

.export-manifest-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  padding: 0.85rem;
}

.export-manifest-section h5 {
  margin: 0 0 0.7rem;
  color: #212529;
  font-size: 0.9rem;
}

.export-manifest-list {
  margin: 0;
}

.export-manifest-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.export-manifest-row dt {
  color: #495057;
}

.export-manifest-row dd {
  margin: 0;
  color: #212529;
  font-weight: 700;
  text-align: right;
}

.preview-layout {
  display: grid;
  grid-template-columns: minmax(11rem, 14rem) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.section-navigator {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
  padding: 0.85rem;
  position: sticky;
  top: 0;
}

.navigator-title {
  margin-bottom: 0.65rem;
  color: #212529;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.navigator-link {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0.35rem 0;
  color: #0b5ed7;
  font-size: 0.92rem;
  text-align: left;
  cursor: pointer;
}

.navigator-link:hover {
  color: #084298;
  text-decoration: underline;
}

.preview-content {
  min-width: 0;
}

.preview-label {
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 700;
}

.preview-markdown {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
  color: #212529;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 26rem;
  overflow: auto;
}

.preview-section + .preview-section {
  margin-top: 1rem;
}

.preview-section-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.preview-section-copy-btn {
  border: 0;
  background: transparent;
  color: #0b5ed7;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.preview-section-copy-btn:hover {
  color: #084298;
  text-decoration: underline;
}

.section-copy-feedback {
  color: #2b8a3e;
  font-size: 0.8rem;
  font-weight: 600;
}

.section-copy-feedback.error {
  color: #c92a2a;
}

.preview-block {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
  }

  .handoff-summary-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .handoff-summary-items {
    grid-template-columns: 1fr;
  }

  .export-manifest-header {
    flex-direction: column;
  }

  .export-manifest-generated {
    text-align: left;
  }

  .export-manifest-grid {
    grid-template-columns: 1fr;
  }

  .preview-layout {
    grid-template-columns: 1fr;
  }

  .preview-actions {
    width: 100%;
  }
}
</style>
