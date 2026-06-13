<template>
  <Card class="share-safety-container">
    <CardHeader>
      <div class="share-safety-header">
        <div>
          <CardTitle>{{ t('evidencePackShareSafety.title') }}</CardTitle>
          <p v-if="hasInput" class="summary-text">
            {{ t(safety.summaryKey) }}
          </p>
        </div>
        <span v-if="hasInput" class="status-badge" :class="safety.status">
          {{ statusLabel(safety.status) }}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="!hasInput" class="empty-state">
        {{ t('evidencePackShareSafety.empty') }}
      </div>

      <template v-else>
        <div class="status-card" :class="safety.status">
          <div class="status-row">
            <span class="meta-label">{{ t('evidencePackShareSafety.statusLabel') }}</span>
            <span class="status-value">{{ statusLabel(safety.status) }}</span>
          </div>
          <div class="status-row">
            <span class="meta-label">{{ t('evidencePackShareSafety.findingsCount') }}</span>
            <span class="status-value">{{ safety.findings.length }}</span>
          </div>
        </div>

        <div class="list-grid">
          <article class="list-card">
            <h4>{{ t('evidencePackShareSafety.findingsTitle') }}</h4>
            <ul v-if="safety.findings.length > 0" class="findings-scroll">
              <li v-for="finding in safety.findings" :key="finding.id">
                {{ t(finding.labelKey, { count: finding.count, samples: formatSamples(finding.samples) }) }}
              </li>
            </ul>
            <p v-else class="empty-list">{{ t('evidencePackShareSafety.noFindings') }}</p>
          </article>

          <article class="list-card">
            <h4>{{ t('evidencePackShareSafety.warningsTitle') }}</h4>
            <ul v-if="safety.warnings.length > 0">
              <li v-for="warning in safety.warnings" :key="warning.id">
                {{ t(warning.labelKey) }}
              </li>
            </ul>
            <p v-else class="empty-list">{{ t('evidencePackShareSafety.noWarnings') }}</p>
          </article>
        </div>

        <article class="list-card recommendations-card">
          <h4>{{ t('evidencePackShareSafety.recommendationsTitle') }}</h4>
          <ul v-if="safety.recommendations.length > 0">
            <li v-for="recommendation in safety.recommendations" :key="recommendation.id">
              {{ t(recommendation.labelKey) }}
            </li>
          </ul>
          <p v-else class="empty-list">{{ t('evidencePackShareSafety.noRecommendations') }}</p>
        </article>

        <p class="export-note">
          {{ t('evidencePackShareSafety.exportNotBlocked') }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildEvidencePackShareSafety } from '../utils/evidencePackShareSafety'

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  },
  result: {
    type: Object,
    default: null
  }
})

const hasInput = computed(() => {
  return Boolean(props.result) || props.markdown.trim().length > 0
})

const safety = computed(() => {
  return buildEvidencePackShareSafety({
    markdown: props.markdown,
    result: props.result
  })
})

function statusLabel(status) {
  if (status === 'safe') {
    return t('evidencePackShareSafety.statusSafe')
  }
  if (status === 'review_recommended') {
    return t('evidencePackShareSafety.statusReviewRecommended')
  }
  return t('evidencePackShareSafety.statusAttention')
}

function formatSamples(samples) {
  return Array.isArray(samples) && samples.length > 0 ? samples.join(', ') : '-'
}
</script>

<style scoped>
.share-safety-container {
  margin-top: 0;
}

.share-safety-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.share-safety-header h3 {
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

.status-badge {
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

.status-badge.safe {
  background: oklch(0.95 0.05 145);
  color: oklch(0.4 0.12 145);
}

.status-badge.review_recommended {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.status-badge.attention {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.status-card {
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.75rem;
  background: var(--surface-subtle);
}

.status-card.safe {
  border-left-color: oklch(0.55 0.14 145);
}

.status-card.review_recommended {
  border-left-color: oklch(0.65 0.15 55);
}

.status-card.attention {
  border-left-color: oklch(0.5 0.18 25);
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.status-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-value {
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
  overflow-wrap: anywhere;
}

.findings-scroll {
  max-height: 9rem;
  overflow-y: auto;
}

.list-card li + li {
  margin-top: 0.125rem;
}

.recommendations-card {
  grid-column: 1 / -1;
}

.empty-list,
.export-note {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.export-note {
  margin-top: 0.75rem;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .share-safety-header,
  .status-row {
    flex-direction: column;
  }

  .list-grid {
    grid-template-columns: 1fr;
  }

  .status-value {
    text-align: left;
  }
}
</style>
