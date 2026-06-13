<template>
  <Card class="quality-score-container">
    <CardHeader>
      <div class="quality-score-header">
        <div>
          <CardTitle>{{ t('evidencePackQuality.title') }}</CardTitle>
          <p v-if="result" class="summary-text">
            {{ quality.summary.passedChecks }} / {{ quality.summary.totalChecks }}
          </p>
        </div>
        <span v-if="result" class="overall-badge" :class="quality.status">
          {{ statusLabel(quality.status) }}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="!result" class="empty-state">
        {{ t('evidencePackQuality.empty') }}
      </div>

      <template v-else>
        <div class="score-card" :class="quality.status">
          <div class="score-label">{{ t('evidencePackQuality.score') }}</div>
          <div class="score-value">{{ quality.score }} / {{ quality.summary.maxScore }}</div>
          <div class="score-status">{{ statusLabel(quality.status) }}</div>
        </div>

        <div class="checklist">
          <article
            v-for="check in quality.checks"
            :key="check.id"
            class="check-card"
            :class="check.status"
          >
            <div class="check-header">
              <div>
                <h4>{{ t(check.labelKey) }}</h4>
                <p class="check-points">{{ check.earned }} / {{ check.points }}</p>
              </div>
              <span class="status-pill" :class="check.status">
                {{ checkStatusLabel(check.status) }}
              </span>
            </div>
            <p class="check-recommendation">{{ t(check.recommendationKey) }}</p>
          </article>
        </div>
      </template>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildEvidencePackQuality } from '../utils/evidencePackQuality'

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
  }
})

const quality = computed(() => {
  return buildEvidencePackQuality({
    result: props.result,
    triageState: props.triageState,
    caseNotes: props.caseNotes,
    reviewReadiness: props.reviewReadiness
  })
})

function statusLabel(status) {
  return t(`evidencePackQuality.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)
}

function checkStatusLabel(status) {
  if (status === 'pass') {
    return t('evidencePackQuality.checkPass')
  }
  if (status === 'attention') {
    return t('evidencePackQuality.checkAttention')
  }
  return t('evidencePackQuality.checkMissing')
}
</script>

<style scoped>
.quality-score-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.quality-score-header h3 {
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

.score-card {
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.625rem;
  background: var(--surface-subtle);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.score-card.ready {
  border-left-color: oklch(0.55 0.14 145);
}

.score-card.good {
  border-left-color: oklch(0.55 0.15 250);
}

.score-card.partial {
  border-left-color: oklch(0.65 0.15 55);
}

.score-card.missing {
  border-left-color: oklch(0.5 0.18 25);
}

.score-label {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.score-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.score-status {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: auto;
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

.overall-badge.ready {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.overall-badge.good {
  background: oklch(0.95 0.05 250);
  color: oklch(0.4 0.12 250);
}

.overall-badge.partial {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.overall-badge.missing {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.status-pill.pass {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.status-pill.attention {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.status-pill.missing {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.checklist {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.check-card {
  border: none;
  border-radius: 0;
  padding: 0.5rem 0.625rem;
  background: var(--surface-elevated);
}

.check-card.pass {
  background: oklch(0.99 0.01 145);
}

.check-card.attention {
  background: oklch(0.99 0.01 60);
}

.check-card.missing {
  background: oklch(0.99 0.01 25);
}

.check-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.check-header h4 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--foreground);
}

.check-points,
.check-recommendation {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.65625rem;
}

.check-points {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.check-recommendation {
  margin-top: 0.125rem;
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
  .quality-score-header,
  .check-header {
    flex-direction: column;
  }
}

@media (max-width: 390px) {
  .score-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
  }

  .score-status {
    margin-left: 0;
  }
}
</style>
