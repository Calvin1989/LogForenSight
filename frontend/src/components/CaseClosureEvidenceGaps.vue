<template>
  <section
    class="evidence-gaps"
    data-testid="case-closure-evidence-gaps"
  >
    <div class="evidence-gaps-header">
      <h4>{{ t('caseClosureChecklist.evidenceGapsTitle') }}</h4>
      <p>{{ t('caseClosureChecklist.evidenceGapsSubtitle') }}</p>
    </div>

    <p
      v-if="gapItems.length === 0"
      class="no-gaps"
      data-testid="case-closure-no-gaps"
    >
      {{ t('caseClosureChecklist.noGaps') }}
    </p>

    <div v-else class="gap-list">
      <article
        v-for="gap in gapItems"
        :key="gap.id"
        class="gap-item"
        :class="`is-${gap.tone}`"
        :data-testid="`case-closure-gap-${gap.id}`"
      >
        <div class="gap-item-header">
          <h5>{{ gap.label }}</h5>
          <span class="gap-status" :class="`is-${gap.tone}`">
            {{ gap.value }}
          </span>
        </div>
        <p class="gap-description">{{ gap.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  checklistItems: {
    type: Array,
    default: () => []
  },
  handoffReadiness: {
    type: Object,
    default: null
  }
})

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function findItem(id) {
  return normalizeArray(props.checklistItems).find((item) => item?.id === id) || null
}

function createGap(id, labelKey, source) {
  return {
    id,
    label: t(labelKey),
    value: source?.value || t('caseClosureChecklist.statusUnavailable'),
    description: source?.description || t('caseClosureChecklist.handoffUnavailableDetail'),
    tone: source?.tone || 'neutral'
  }
}

function hasAttentionTone(item) {
  return item?.tone === 'warning' || item?.tone === 'danger'
}

function shouldIncludeTimeline(item) {
  return item?.id === 'timeline' && item?.tone !== 'positive'
}

function shouldIncludeRuleCoverage(item) {
  return item?.id === 'rule-coverage' && item?.tone !== 'positive'
}

function shouldIncludeHandoff(item) {
  return Boolean(item) && item.tone !== 'positive'
}

const gapItems = computed(() => {
  const gaps = []
  const findings = findItem('findings')
  const incidents = findItem('incidents')
  const timeline = findItem('timeline')
  const ruleCoverage = findItem('rule-coverage')
  const caseNotes = findItem('case-notes')
  const reviewReadiness = findItem('review-readiness')
  const qualityScore = findItem('quality-score')
  const exportGuardrails = findItem('export-guardrails')
  const shareSafety = findItem('share-safety')
  const handoff = props.handoffReadiness && typeof props.handoffReadiness === 'object'
    ? props.handoffReadiness
    : findItem('handoff-readiness')

  if (hasAttentionTone(caseNotes)) {
    gaps.push(createGap('missing-notes', 'caseClosureChecklist.gapMissingNotes', caseNotes))
  }

  if (shouldIncludeTimeline(timeline)) {
    gaps.push(createGap('empty-timeline', 'caseClosureChecklist.gapEmptyTimeline', timeline))
  }

  if (hasAttentionTone(incidents)) {
    gaps.push(createGap('missing-incidents', 'caseClosureChecklist.gapMissingIncidents', incidents))
  }

  if (hasAttentionTone(findings)) {
    gaps.push(createGap('missing-findings', 'caseClosureChecklist.gapMissingFindings', findings))
  }

  if (shouldIncludeRuleCoverage(ruleCoverage)) {
    gaps.push(createGap('rule-coverage-unavailable', 'caseClosureChecklist.gapRuleCoverageUnavailable', ruleCoverage))
  }

  if (hasAttentionTone(reviewReadiness)) {
    gaps.push(createGap('review-readiness-attention', 'caseClosureChecklist.gapReviewReadinessAttention', reviewReadiness))
  }

  if (hasAttentionTone(qualityScore)) {
    gaps.push(createGap('quality-needs-improvement', 'caseClosureChecklist.gapQualityNeedsImprovement', qualityScore))
  }

  if (hasAttentionTone(exportGuardrails)) {
    gaps.push(createGap('guardrails-attention', 'caseClosureChecklist.gapGuardrailsAttention', exportGuardrails))
  }

  if (hasAttentionTone(shareSafety)) {
    gaps.push(createGap('share-safety-attention', 'caseClosureChecklist.gapShareSafetyAttention', shareSafety))
  }

  if (shouldIncludeHandoff(handoff)) {
    gaps.push(createGap('handoff-needs-review', 'caseClosureChecklist.gapHandoffNeedsReview', handoff))
  }

  return gaps
})
</script>

<style scoped>
.evidence-gaps {
  margin-top: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #fcfcfd;
}

.evidence-gaps-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.evidence-gaps-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.no-gaps {
  margin: 0.9rem 0 0;
  color: #2b8a3e;
  font-weight: 600;
}

.gap-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.gap-item {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 6px;
  padding: 0.85rem;
  background: #fff;
}

.gap-item.is-warning {
  border-left-color: #d9480f;
  background: #fffaf4;
}

.gap-item.is-danger {
  border-left-color: #c92a2a;
  background: #fff7f7;
}

.gap-item.is-neutral {
  border-left-color: #868e96;
  background: #f8f9fa;
}

.gap-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.gap-item-header h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #212529;
}

.gap-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.gap-status.is-warning {
  background: #fff4e6;
  color: #d9480f;
}

.gap-status.is-danger {
  background: #fff5f5;
  color: #c92a2a;
}

.gap-status.is-neutral {
  background: #f1f3f5;
  color: #495057;
}

.gap-description {
  margin: 0.45rem 0 0;
  color: #495057;
}

@media (max-width: 768px) {
  .gap-item-header {
    flex-direction: column;
  }
}
</style>
