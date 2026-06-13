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
        <div class="overall-strip" :class="readiness.status">
          <span class="overall-label">{{ t('reviewReadiness.evidencePack') }}</span>
          <span class="overall-value">{{ overallStatusLabel }}</span>
          <span class="overall-desc">{{ overallDescription }}</span>
        </div>

        <div class="review-cockpit-grid">
          <article
            v-for="check in readiness.checks"
            :key="check.id"
            class="review-status-row"
            :class="check.status"
          >
            <div class="status-badge-col">
              <span class="status-pill" :class="check.status">
                {{ statusLabel(check.status) }}
              </span>
            </div>
            <div class="content-col">
              <h4>{{ t(check.labelKey) }}</h4>
              <p class="check-summary">{{ checkSummary(check) }}</p>
            </div>
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
  margin-top: 0;
}

.review-readiness-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}


.review-readiness-header h3 {
  margin: 0 0 0.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--foreground);
}

.summary-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.overall-badge,
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.0625rem 0.375rem;
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.overall-badge.ready,
.status-pill.ready {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.overall-badge.attention,
.status-pill.attention {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.overall-badge.missing,
.status-pill.missing {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.overall-strip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: var(--surface-subtle);
}

.overall-strip.ready {
  border-left-color: oklch(0.55 0.14 145);
}

.overall-strip.attention {
  border-left-color: oklch(0.65 0.15 55);
}

.overall-label {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.overall-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--foreground);
  flex-shrink: 0;
}

.overall-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: auto;
}

.review-cockpit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.review-status-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: var(--surface-elevated);
  border: none;
  border-radius: 0;
}

.review-status-row.ready {
  background: oklch(0.99 0.01 145);
}

.review-status-row.attention {
  background: oklch(0.99 0.01 60);
}

.review-status-row.missing {
  background: oklch(0.99 0.01 25);
}

.status-badge-col {
  flex-shrink: 0;
  padding-top: 0.125rem;
}

.content-col {
  min-width: 0;
  flex: 1;
}

.content-col h4 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--foreground);
}

.check-summary {
  margin: 0.125rem 0 0;
  font-size: 0.65625rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

@media (max-width: 768px) {
  .review-readiness-header {
    flex-direction: column;
  }

  .overall-strip {
    flex-wrap: wrap;
  }

  .overall-desc {
    width: 100%;
    margin-left: 0;
  }

  .review-cockpit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 390px) {
  .overall-strip {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
  }

  .overall-desc {
    margin-left: 0;
  }
}
</style>
