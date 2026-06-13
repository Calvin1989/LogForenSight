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
.quality-score-container {
  margin-top: 2rem;
}

.quality-score-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.quality-score-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.score-card {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.score-card.ready {
  border-left-color: #2b8a3e;
}

.score-card.good {
  border-left-color: #1971c2;
}

.score-card.partial {
  border-left-color: #d9480f;
}

.score-card.missing {
  border-left-color: #c92a2a;
}

.score-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 700;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin: 0.25rem 0;
}

.score-status {
  font-size: 0.95rem;
  color: #495057;
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

.overall-badge.ready {
  background: #ebfbee;
  color: #2b8a3e;
}

.overall-badge.good {
  background: #e7f5ff;
  color: #1971c2;
}

.overall-badge.partial {
  background: #fff4e6;
  color: #d9480f;
}

.overall-badge.missing {
  background: #fff5f5;
  color: #c92a2a;
}

.status-pill.pass {
  background: #ebfbee;
  color: #2b8a3e;
}

.status-pill.attention {
  background: #fff4e6;
  color: #d9480f;
}

.status-pill.missing {
  background: #fff5f5;
  color: #c92a2a;
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

.check-card.pass {
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.check-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.check-points,
.check-recommendation {
  margin: 0;
  color: #495057;
}

.check-points {
  font-weight: 600;
}

.check-recommendation {
  margin-top: 0.5rem;
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
  .quality-score-header,
  .check-header {
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
