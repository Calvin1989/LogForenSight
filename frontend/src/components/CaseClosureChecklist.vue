<template>
  <Card class="case-closure-checklist" data-testid="case-closure-checklist">
    <CardHeader>
      <div class="checklist-header">
        <div>
          <CardTitle>{{ t('caseClosureChecklist.title') }}</CardTitle>
          <p class="subtitle">{{ t('caseClosureChecklist.subtitle') }}</p>
        </div>
        <span class="summary-badge" :class="handoffReadiness.tone">
          {{ handoffReadiness.value }}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div class="checklist-grid">
        <article
          v-for="item in checklistItems"
          :key="item.id"
          class="check-item"
          :class="`is-${item.tone}`"
          :data-testid="`case-closure-item-${item.id}`"
        >
          <div class="check-item-header">
            <h4>{{ item.label }}</h4>
            <span class="status-pill" :class="`is-${item.tone}`">
              {{ item.value }}
            </span>
          </div>
          <p class="check-item-description">{{ item.description }}</p>
        </article>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildCaseClosureGapItems } from '../utils/caseClosureGapItems'

const emit = defineEmits(['update:closureData'])

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  displayResult: {
    type: Object,
    default: null
  },
  caseNotes: {
    type: Array,
    default: null
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
  }
})

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeStatus(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function availabilityValue(status) {
  if (status === 'available') return t('caseClosureChecklist.statusAvailable')
  if (status === 'missing') return t('caseClosureChecklist.statusMissing')
  return t('caseClosureChecklist.statusUnavailable')
}

function qualityStatusValue(status) {
  if (status === 'ready') return t('evidencePackQuality.statusReady')
  if (status === 'good') return t('evidencePackQuality.statusGood')
  if (status === 'partial') return t('evidencePackQuality.statusPartial')
  if (status === 'missing') return t('evidencePackQuality.statusMissing')
  return t('caseClosureChecklist.statusUnavailable')
}

function guardrailDecisionValue(decision) {
  if (decision === 'ready') return t('evidencePackGuardrails.statusReady')
  if (decision === 'review_recommended') return t('evidencePackGuardrails.statusReviewRecommended')
  if (decision === 'not_ready') return t('evidencePackGuardrails.statusNotReady')
  return t('caseClosureChecklist.statusUnavailable')
}

function shareSafetyValue(status) {
  if (status === 'safe') return t('evidencePackShareSafety.statusSafe')
  if (status === 'review_recommended') return t('evidencePackShareSafety.statusReviewRecommended')
  if (status === 'attention') return t('evidencePackShareSafety.statusAttention')
  return t('caseClosureChecklist.statusUnavailable')
}

function toneForAvailability(status) {
  if (status === 'available') return 'positive'
  if (status === 'missing') return 'warning'
  return 'neutral'
}

function summarizeCollection({
  id,
  labelKey,
  rawValue,
  availableDetailKey,
  missingDetailKey,
  unavailableDetailKey
}) {
  if (rawValue === undefined || rawValue === null) {
    return {
      id,
      label: t(labelKey),
      value: availabilityValue('unavailable'),
      description: t(unavailableDetailKey),
      tone: toneForAvailability('unavailable')
    }
  }

  const items = normalizeArray(rawValue)
  const status = items.length > 0 ? 'available' : 'missing'

  return {
    id,
    label: t(labelKey),
    value: availabilityValue(status),
    description: status === 'available'
      ? t(availableDetailKey, { count: items.length })
      : t(missingDetailKey),
    tone: toneForAvailability(status)
  }
}

const analysisResult = computed(() => {
  return props.displayResult || props.result || null
})

const findingsItem = computed(() => {
  const rawFindings = analysisResult.value?.findings
  const reviewedHighRisk = props.reviewReadiness?.summary?.highRiskFindings?.reviewed
  const totalHighRisk = props.reviewReadiness?.summary?.highRiskFindings?.total

  if (rawFindings === undefined || rawFindings === null) {
    return {
      id: 'findings',
      label: t('caseClosureChecklist.findings'),
      value: availabilityValue('unavailable'),
      description: t('caseClosureChecklist.findingsUnavailableDetail'),
      tone: toneForAvailability('unavailable')
    }
  }

  const findings = normalizeArray(rawFindings)
  const status = findings.length > 0 ? 'available' : 'missing'

  return {
    id: 'findings',
    label: t('caseClosureChecklist.findings'),
    value: availabilityValue(status),
    description: status === 'available'
      ? (
          typeof reviewedHighRisk === 'number' && typeof totalHighRisk === 'number'
            ? t('caseClosureChecklist.findingsReviewedDetail', {
                count: findings.length,
                reviewed: reviewedHighRisk,
                total: totalHighRisk
              })
            : t('caseClosureChecklist.findingsAvailableDetail', { count: findings.length })
        )
      : t('caseClosureChecklist.findingsMissingDetail'),
    tone: toneForAvailability(status)
  }
})

const incidentsItem = computed(() => {
  const rawIncidents = analysisResult.value?.incidents
  const reviewedIncidents = props.reviewReadiness?.summary?.incidents?.reviewed
  const totalIncidents = props.reviewReadiness?.summary?.incidents?.total

  if (rawIncidents === undefined || rawIncidents === null) {
    return {
      id: 'incidents',
      label: t('caseClosureChecklist.incidents'),
      value: availabilityValue('unavailable'),
      description: t('caseClosureChecklist.incidentsUnavailableDetail'),
      tone: toneForAvailability('unavailable')
    }
  }

  const incidents = normalizeArray(rawIncidents)
  const status = incidents.length > 0 ? 'available' : 'missing'

  return {
    id: 'incidents',
    label: t('caseClosureChecklist.incidents'),
    value: availabilityValue(status),
    description: status === 'available'
      ? (
          typeof reviewedIncidents === 'number' && typeof totalIncidents === 'number'
            ? t('caseClosureChecklist.incidentsReviewedDetail', {
                count: incidents.length,
                reviewed: reviewedIncidents,
                total: totalIncidents
              })
            : t('caseClosureChecklist.incidentsAvailableDetail', { count: incidents.length })
        )
      : t('caseClosureChecklist.incidentsMissingDetail'),
    tone: toneForAvailability(status)
  }
})

const timelineItem = computed(() => {
  return summarizeCollection({
    id: 'timeline',
    labelKey: 'caseClosureChecklist.timeline',
    rawValue: analysisResult.value?.timeline_events,
    availableDetailKey: 'caseClosureChecklist.timelineAvailableDetail',
    missingDetailKey: 'caseClosureChecklist.timelineMissingDetail',
    unavailableDetailKey: 'caseClosureChecklist.timelineUnavailableDetail'
  })
})

const ruleCoverageItem = computed(() => {
  return summarizeCollection({
    id: 'rule-coverage',
    labelKey: 'caseClosureChecklist.ruleCoverage',
    rawValue: analysisResult.value?.rule_coverage,
    availableDetailKey: 'caseClosureChecklist.ruleCoverageAvailableDetail',
    missingDetailKey: 'caseClosureChecklist.ruleCoverageMissingDetail',
    unavailableDetailKey: 'caseClosureChecklist.ruleCoverageUnavailableDetail'
  })
})

const caseNotesItem = computed(() => {
  if (!Array.isArray(props.caseNotes)) {
    return {
      id: 'case-notes',
      label: t('caseClosureChecklist.caseNotes'),
      value: availabilityValue('unavailable'),
      description: t('caseClosureChecklist.caseNotesUnavailableDetail'),
      tone: toneForAvailability('unavailable')
    }
  }

  const status = props.caseNotes.length > 0 ? 'available' : 'missing'
  return {
    id: 'case-notes',
    label: t('caseClosureChecklist.caseNotes'),
    value: availabilityValue(status),
    description: status === 'available'
      ? t('caseClosureChecklist.caseNotesAvailableDetail', { count: props.caseNotes.length })
      : t('caseClosureChecklist.caseNotesMissingDetail'),
    tone: toneForAvailability(status)
  }
})

const reviewReadinessItem = computed(() => {
  const status = normalizeStatus(props.reviewReadiness?.status)
  const blockers = props.reviewReadiness?.summary?.requiredBlockers

  if (!status) {
    return {
      id: 'review-readiness',
      label: t('caseClosureChecklist.reviewReadiness'),
      value: t('caseClosureChecklist.statusUnavailable'),
      description: t('caseClosureChecklist.reviewReadinessUnavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    id: 'review-readiness',
    label: t('caseClosureChecklist.reviewReadiness'),
    value: status === 'ready' ? t('reviewReadiness.overallReady') : t('reviewReadiness.overallAttention'),
    description: status === 'ready'
      ? t('reviewReadiness.readyToExport')
      : t('reviewReadiness.blockersRemaining', { count: typeof blockers === 'number' ? blockers : 0 }),
    tone: status === 'ready' ? 'positive' : 'warning'
  }
})

const qualityItem = computed(() => {
  const hasScore = typeof props.evidencePackQuality?.score === 'number'
  const status = normalizeStatus(props.evidencePackQuality?.status)

  if (!hasScore && !status) {
    return {
      id: 'quality-score',
      label: t('caseClosureChecklist.qualityScore'),
      value: t('caseClosureChecklist.statusUnavailable'),
      description: t('caseClosureChecklist.qualityUnavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    id: 'quality-score',
    label: t('caseClosureChecklist.qualityScore'),
    value: hasScore
      ? `${props.evidencePackQuality.score} / ${props.evidencePackQuality?.summary?.maxScore ?? 100}`
      : qualityStatusValue(status),
    description: qualityStatusValue(status),
    tone: status === 'ready' || status === 'good'
      ? 'positive'
      : 'warning'
  }
})

const exportGuardrailsItem = computed(() => {
  const decision = normalizeStatus(props.exportGuardrails?.decision)

  if (!decision) {
    return {
      id: 'export-guardrails',
      label: t('caseClosureChecklist.exportGuardrails'),
      value: t('caseClosureChecklist.statusUnavailable'),
      description: t('caseClosureChecklist.exportGuardrailsUnavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    id: 'export-guardrails',
    label: t('caseClosureChecklist.exportGuardrails'),
    value: guardrailDecisionValue(decision),
    description: props.exportGuardrails?.summaryKey
      ? t(props.exportGuardrails.summaryKey)
      : t('caseClosureChecklist.exportGuardrailsUnavailableDetail'),
    tone: decision === 'ready' ? 'positive' : (decision === 'review_recommended' ? 'warning' : 'danger')
  }
})

const shareSafetyItem = computed(() => {
  const status = normalizeStatus(props.shareSafety?.status)
  const findingCount = normalizeArray(props.shareSafety?.findings).length
  const warningCount = normalizeArray(props.shareSafety?.warnings).length

  if (!status) {
    return {
      id: 'share-safety',
      label: t('caseClosureChecklist.shareSafetyReview'),
      value: t('caseClosureChecklist.statusUnavailable'),
      description: t('caseClosureChecklist.shareSafetyUnavailableDetail'),
      tone: 'neutral'
    }
  }

  return {
    id: 'share-safety',
    label: t('caseClosureChecklist.shareSafetyReview'),
    value: shareSafetyValue(status),
    description: status === 'safe'
      ? t('evidencePackPreview.shareSafetyClear')
      : t('evidencePackPreview.shareSafetyIssues', { count: findingCount + warningCount }),
    tone: status === 'safe' ? 'positive' : (status === 'review_recommended' ? 'warning' : 'danger')
  }
})

const handoffReadiness = computed(() => {
  const readinessStatus = normalizeStatus(props.reviewReadiness?.status)
  const qualityStatus = normalizeStatus(props.evidencePackQuality?.status)
  const guardrailDecision = normalizeStatus(props.exportGuardrails?.decision)
  const shareSafetyStatus = normalizeStatus(props.shareSafety?.status)

  const hasSignals = Boolean(readinessStatus || qualityStatus || guardrailDecision || shareSafetyStatus)

  if (!hasSignals) {
    return {
      id: 'handoff-readiness',
      label: t('caseClosureChecklist.handoffReadiness'),
      value: t('caseClosureChecklist.statusUnavailable'),
      description: t('caseClosureChecklist.handoffUnavailableDetail'),
      tone: 'neutral'
    }
  }

  const isReady = readinessStatus === 'ready'
    && guardrailDecision === 'ready'
    && (qualityStatus === 'ready' || qualityStatus === 'good')
    && shareSafetyStatus !== 'attention'

  if (isReady) {
    return {
      id: 'handoff-readiness',
      label: t('caseClosureChecklist.handoffReadiness'),
      value: t('caseClosureChecklist.statusReady'),
      description: t('caseClosureChecklist.handoffReadyDetail'),
      tone: 'positive'
    }
  }

  return {
    id: 'handoff-readiness',
    label: t('caseClosureChecklist.handoffReadiness'),
    value: t('caseClosureChecklist.statusNeedsReview'),
    description: t('caseClosureChecklist.handoffNeedsReviewDetail'),
    tone: 'warning'
  }
})

const checklistItems = computed(() => {
  return [
    findingsItem.value,
    incidentsItem.value,
    timelineItem.value,
    ruleCoverageItem.value,
    caseNotesItem.value,
    reviewReadinessItem.value,
    qualityItem.value,
    exportGuardrailsItem.value,
    shareSafetyItem.value,
    handoffReadiness.value
  ]
})

const gapItems = computed(() => {
  return buildCaseClosureGapItems({
    checklistItems: checklistItems.value,
    handoffReadiness: handoffReadiness.value
  })
})

watch([gapItems, handoffReadiness], ([gaps, readiness]) => {
  emit('update:closureData', { gapItems: gaps, handoffReadiness: readiness })
}, { immediate: true })
</script>

<style scoped>
.case-closure-checklist {
  margin-top: 0;
}

.checklist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.checklist-header h3 {
  margin: 0 0 0.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--foreground);
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.checklist-grid {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.check-item {
  border: none;
  border-left: 3px solid var(--border);
  border-radius: 0;
  padding: 0.5rem 0.625rem;
  background: var(--surface-elevated);
}

.check-item.is-positive {
  border-left-color: oklch(0.55 0.14 145);
  background: oklch(0.98 0.02 145);
}

.check-item.is-warning {
  border-left-color: oklch(0.65 0.15 55);
  background: oklch(0.98 0.02 60);
}

.check-item.is-danger {
  border-left-color: oklch(0.5 0.18 25);
  background: oklch(0.98 0.02 25);
}

.check-item.is-neutral {
  border-left-color: var(--border);
  background: var(--surface-elevated);
}

.check-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.625rem;
}

.check-item-header h4 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--foreground);
}

.status-pill,
.summary-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.0625rem 0.375rem;
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-pill.is-positive,
.summary-badge.positive {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.status-pill.is-warning,
.summary-badge.warning {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.status-pill.is-danger,
.summary-badge.danger {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.status-pill.is-neutral,
.summary-badge.neutral {
  background: var(--surface-subtle);
  color: var(--text-secondary);
}

.check-item-description {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.6875rem;
}

@media (max-width: 768px) {
  .checklist-header,
  .check-item-header {
    flex-direction: column;
  }
}

@media (max-width: 390px) {
  .checklist-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .check-item-header {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
