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
.guardrails-container {
  margin-top: 2rem;
}

.guardrails-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.guardrails-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.decision-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.decision-badge.success {
  background: #ebfbee;
  color: #2b8a3e;
}

.decision-badge.attention {
  background: #fff4e6;
  color: #d9480f;
}

.decision-badge.warning {
  background: #fff5f5;
  color: #c92a2a;
}

.decision-card {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.decision-card.success {
  border-left-color: #2b8a3e;
}

.decision-card.attention {
  border-left-color: #d9480f;
}

.decision-card.warning {
  border-left-color: #c92a2a;
}

.decision-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.decision-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.decision-value {
  color: #212529;
  font-weight: 700;
  text-align: right;
}

.list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.list-card {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #fff;
}

.list-card h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #212529;
}

.list-card ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #495057;
}

.list-card li + li {
  margin-top: 0.5rem;
}

.empty-list,
.export-note {
  margin: 0;
  color: #495057;
}

.export-note {
  margin-top: 1rem;
  font-size: 0.92rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
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
</style>
