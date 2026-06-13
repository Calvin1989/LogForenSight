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
            <ul v-if="safety.findings.length > 0">
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
  margin-top: 2rem;
}

.share-safety-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.share-safety-header h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  color: #212529;
}

.summary-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.safe {
  background: #ebfbee;
  color: #2b8a3e;
}

.status-badge.review_recommended {
  background: #fff4e6;
  color: #d9480f;
}

.status-badge.attention {
  background: #fff5f5;
  color: #c92a2a;
}

.status-card {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.status-card.safe {
  border-left-color: #2b8a3e;
}

.status-card.review_recommended {
  border-left-color: #d9480f;
}

.status-card.attention {
  border-left-color: #c92a2a;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.status-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-value {
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
  border-radius: 8px;
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

.recommendations-card {
  margin-top: 1rem;
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
  border-radius: 8px;
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
