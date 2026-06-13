<template>
  <Card class="guardrails-container">
    <CardHeader>
      <div class="guardrails-header">
        <div>
          <CardTitle>{{ t('evidencePackGuardrails.title') }}</CardTitle>
          <p v-if="result" class="summary-text">
            {{ t(guardrails.summaryKey) }}
          </p>
        </div>
        <span v-if="result" class="decision-badge" :class="guardrails.severity">
          {{ decisionLabel(guardrails.decision) }}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="!result" class="empty-state">
        {{ t('evidencePackGuardrails.empty') }}
      </div>

      <template v-else>
        <div class="decision-card" :class="guardrails.severity">
          <div class="decision-row">
            <span class="meta-label">{{ t('evidencePackGuardrails.decision') }}</span>
            <span class="decision-value">{{ decisionLabel(guardrails.decision) }}</span>
          </div>
          <div v-if="hasScore" class="decision-row">
            <span class="meta-label">{{ t('evidencePackGuardrails.score') }}</span>
            <span class="decision-value">{{ guardrails.score }}</span>
          </div>
        </div>

        <div class="list-grid">
          <article class="list-card">
            <h4>{{ t('evidencePackGuardrails.blockers') }}</h4>
            <ul v-if="guardrails.blockers.length > 0">
              <li v-for="blocker in guardrails.blockers" :key="blocker.id">
                {{ t(blocker.labelKey) }}
              </li>
            </ul>
            <p v-else class="empty-list">{{ t('evidencePackGuardrails.noBlockers') }}</p>
          </article>

          <article class="list-card">
            <h4>{{ t('evidencePackGuardrails.recommendations') }}</h4>
            <ul v-if="guardrails.recommendations.length > 0">
              <li v-for="recommendation in guardrails.recommendations" :key="recommendation.id">
                {{ t(recommendation.labelKey) }}
              </li>
            </ul>
            <p v-else class="empty-list">{{ t('evidencePackGuardrails.noRecommendations') }}</p>
          </article>
        </div>

        <p class="export-note">
          {{ t('evidencePackGuardrails.exportNotBlocked') }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildEvidencePackExportGuardrails } from '../utils/evidencePackExportGuardrails'

const props = defineProps({
  quality: {
    type: Object,
    default: null
  },
  reviewReadiness: {
    type: Object,
    default: null
  },
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
  }
})

const guardrails = computed(() => {
  return buildEvidencePackExportGuardrails({
    quality: props.quality,
    reviewReadiness: props.reviewReadiness,
    result: props.result,
    triageState: props.triageState,
    caseNotes: props.caseNotes
  })
})

const hasScore = computed(() => {
  return typeof guardrails.value.score === 'number'
})

function decisionLabel(decision) {
  if (decision === 'ready') {
    return t('evidencePackGuardrails.statusReady')
  }
  if (decision === 'review_recommended') {
    return t('evidencePackGuardrails.statusReviewRecommended')
  }
  return t('evidencePackGuardrails.statusNotReady')
}
</script>

<style scoped>
.guardrails-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.guardrails-header h3 {
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

.decision-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.0625rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.decision-badge.success {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.decision-badge.attention {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.decision-badge.warning {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.decision-card {
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.75rem;
  background: var(--surface-subtle);
}

.decision-card.success {
  border-left-color: oklch(0.55 0.14 145);
}

.decision-card.attention {
  border-left-color: oklch(0.65 0.15 55);
}

.decision-card.warning {
  border-left-color: oklch(0.5 0.18 25);
}

.decision-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.decision-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.decision-value {
  color: var(--foreground);
  font-weight: 700;
  font-size: 0.8125rem;
  text-align: right;
}

.list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.list-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.625rem;
  background: var(--surface-elevated);
}

.list-card h4 {
  margin: 0 0 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.list-card ul {
  margin: 0;
  padding-left: 1rem;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.45;
  max-height: 9rem;
  overflow-y: auto;
}

.list-card li + li {
  margin-top: 0.125rem;
}

.empty-list,
.export-note {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.export-note {
  margin-top: 0.75rem;
  font-size: 0.65625rem;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

@media (max-width: 768px) {
  .guardrails-header,
  .decision-row {
    flex-direction: column;
  }

  .list-grid {
    grid-template-columns: 1fr;
  }

  .decision-value {
    text-align: left;
  }
}

@media (max-width: 390px) {
  .decision-card {
    padding: 0.4375rem 0.5rem;
  }

  .decision-value {
    text-align: left;
  }
}
</style>
