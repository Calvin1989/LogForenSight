<template>
  <Card class="review-readiness-container">
    <CardHeader>
      <div class="review-readiness-header">
        <div>
          <CardTitle>{{ t('reviewReadiness.title') }}</CardTitle>
          <p class="summary-text">{{ summaryText }}</p>
        </div>
        <span class="overall-badge" :class="readiness.status">
          {{ overallStatusLabel }}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="!result" class="empty-state">
        {{ t('reviewReadiness.empty') }}
      </div>

      <template v-else>
        <div class="overall-card" :class="readiness.status">
          <div class="overall-label">{{ t('reviewReadiness.evidencePack') }}</div>
          <div class="overall-value">{{ overallStatusLabel }}</div>
          <div class="overall-description">{{ overallDescription }}</div>
        </div>

        <div class="checklist">
          <article
            v-for="check in readiness.checks"
            :key="check.id"
            class="check-card"
            :class="check.status"
          >
            <div class="check-header">
              <span class="status-pill" :class="check.status">
                {{ statusLabel(check.status) }}
              </span>
              <h4>{{ t(check.labelKey) }}</h4>
            </div>

            <p class="check-summary">{{ checkSummary(check) }}</p>
            <p class="check-recommendation">{{ t(check.recommendationKey) }}</p>
          </article>
        </div>
      </template>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { getCaseNotesSummary } from '../utils/caseNotesStorage'
import { buildReviewReadiness } from '../utils/reviewReadiness'

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  triageState: {
    type: Object,
    default: () => ({})
  },
  caseId: {
    type: String,
    default: 'current-analysis'
  }
})

const caseNotesSummary = ref(getCaseNotesSummary(props.caseId))

watch(() => props.caseId, (nextCaseId) => {
  caseNotesSummary.value = getCaseNotesSummary(nextCaseId)
}, { immediate: true })

const readiness = computed(() => {
  return buildReviewReadiness({
    result: props.result,
    triageState: props.triageState,
    caseNotes: caseNotesSummary.value.notes
  })
})

const overallStatusLabel = computed(() => {
  return readiness.value.status === 'ready'
    ? t('reviewReadiness.overallReady')
    : t('reviewReadiness.overallAttention')
})

const overallDescription = computed(() => {
  if (readiness.value.status === 'ready') {
    return t('reviewReadiness.readyToExport')
  }

  return t('reviewReadiness.blockersRemaining', {
    count: readiness.value.summary.requiredBlockers
  })
})

const summaryText = computed(() => {
  return t('reviewReadiness.summaryCounts', {
    ready: readiness.value.summary.readyChecks,
    attention: readiness.value.summary.attentionChecks + readiness.value.summary.missingChecks,
    total: readiness.value.summary.totalChecks
  })
})

function statusLabel(status) {
  return t(`reviewReadiness.${status}`)
}

function checkSummary(check) {
  if (check.id === 'highRiskFindings') {
    if (check.total === 0) {
      return t('reviewReadiness.noHighRiskFindings')
    }

    if (check.count === 0) {
      return t('reviewReadiness.reviewedOfTotal', {
        reviewed: check.readyCount,
        total: check.total
      })
    }

    return t('reviewReadiness.pendingOfTotal', {
      pending: check.count,
      total: check.total
    })
  }

  if (check.id === 'incidents') {
    if (check.total === 0) {
      return t('reviewReadiness.noIncidents')
    }

    if (check.count === 0) {
      return t('reviewReadiness.reviewedOfTotal', {
        reviewed: check.readyCount,
        total: check.total
      })
    }

    return t('reviewReadiness.pendingOfTotal', {
      pending: check.count,
      total: check.total
    })
  }

  if (check.id === 'entities') {
    if (check.count === 0) {
      return t('reviewReadiness.noEntitiesObserved')
    }

    return t('reviewReadiness.entitiesObserved', { count: check.count })
  }

  if (check.id === 'caseNotes') {
    if (check.count === 0) {
      return t('reviewReadiness.noCaseNotes')
    }

    return t('reviewReadiness.caseNotesRecordedCount', { count: check.count })
  }

  if (check.count === 0) {
    return t('reviewReadiness.readyToExport')
  }

  return t('reviewReadiness.blockersRemaining', { count: check.count })
}
</script>

<style scoped>
.review-readiness-container {
  margin-top: 2rem;
}

.review-readiness-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-readiness-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.overall-badge,
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.overall-badge.ready,
.status-pill.ready {
  background: #ebfbee;
  color: #2b8a3e;
}

.overall-badge.attention,
.status-pill.attention {
  background: #fff4e6;
  color: #d9480f;
}

.overall-badge.missing,
.status-pill.missing {
  background: #fff5f5;
  color: #c92a2a;
}

.overall-card {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.overall-card.ready {
  border-left-color: #2b8a3e;
}

.overall-card.attention {
  border-left-color: #d9480f;
}

.overall-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 700;
}

.overall-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #212529;
  margin: 0.25rem 0;
}

.overall-description {
  font-size: 0.9rem;
  color: #495057;
}

.checklist {
  display: grid;
  gap: 1rem;
}

.check-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.check-card.ready {
  background: #f8fff9;
}

.check-card.attention {
  background: #fffaf4;
}

.check-card.missing {
  background: #fff7f7;
}

.check-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.check-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #212529;
}

.check-summary,
.check-recommendation {
  margin: 0;
  color: #495057;
}

.check-summary {
  font-weight: 600;
}

.check-recommendation {
  margin-top: 0.35rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .review-readiness-header {
    flex-direction: column;
  }
}


/* Frontend-wide interaction polish */
:where(button, [role="button"], input, select, textarea, a):focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.22);
  outline-offset: 2px;
}

:where(button, [role="button"]) {
  -webkit-tap-highlight-color: transparent;
}

:where(input, select, textarea) {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  :where(*) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

</style>
