<template>
  <section
    class="next-actions"
    data-testid="case-closure-next-actions"
  >
    <div class="next-actions-header">
      <h4>{{ t('caseClosureChecklist.nextActionsTitle') }}</h4>
      <p>{{ t('caseClosureChecklist.nextActionsSubtitle') }}</p>
    </div>

    <p
      v-if="nextActions.length === 0"
      class="no-actions"
      data-testid="case-closure-no-next-actions"
    >
      {{ t('caseClosureChecklist.nextActionsEmpty') }}
    </p>

    <div v-else class="action-list">
      <article
        v-for="action in nextActions"
        :key="action.id"
        class="action-item"
        :data-testid="`case-closure-next-action-${action.id}`"
      >
        <h5>{{ action.label }}</h5>
        <p>{{ action.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  gapItems: {
    type: Array,
    default: () => []
  },
  handoffReadiness: {
    type: Object,
    default: null
  }
})

const ACTION_CONFIG = [
  {
    id: 'add-case-notes',
    priority: 10,
    gapIds: ['missing-notes'],
    labelKey: 'caseClosureChecklist.nextActionAddCaseNotes',
    descriptionKey: 'caseClosureChecklist.nextActionAddCaseNotesDescription'
  },
  {
    id: 'review-incidents-findings',
    priority: 20,
    gapIds: ['missing-incidents', 'missing-findings'],
    labelKey: 'caseClosureChecklist.nextActionReviewIncidentsFindings',
    descriptionKey: 'caseClosureChecklist.nextActionReviewIncidentsFindingsDescription'
  },
  {
    id: 'review-timeline',
    priority: 30,
    gapIds: ['empty-timeline'],
    labelKey: 'caseClosureChecklist.nextActionReviewTimeline',
    descriptionKey: 'caseClosureChecklist.nextActionReviewTimelineDescription'
  },
  {
    id: 'address-review-readiness-warnings',
    priority: 40,
    gapIds: ['review-readiness-attention'],
    labelKey: 'caseClosureChecklist.nextActionAddressReviewReadinessWarnings',
    descriptionKey: 'caseClosureChecklist.nextActionAddressReviewReadinessWarningsDescription'
  },
  {
    id: 'resolve-export-guardrails',
    priority: 50,
    gapIds: ['guardrails-attention'],
    labelKey: 'caseClosureChecklist.nextActionResolveExportGuardrails',
    descriptionKey: 'caseClosureChecklist.nextActionResolveExportGuardrailsDescription'
  },
  {
    id: 'review-share-safety-items',
    priority: 60,
    gapIds: ['share-safety-attention'],
    labelKey: 'caseClosureChecklist.nextActionReviewShareSafetyItems',
    descriptionKey: 'caseClosureChecklist.nextActionReviewShareSafetyItemsDescription'
  },
  {
    id: 'improve-quality-score-inputs',
    priority: 70,
    gapIds: ['quality-needs-improvement'],
    labelKey: 'caseClosureChecklist.nextActionImproveQualityScoreInputs',
    descriptionKey: 'caseClosureChecklist.nextActionImproveQualityScoreInputsDescription'
  },
  {
    id: 'review-rule-coverage',
    priority: 80,
    gapIds: ['rule-coverage-unavailable'],
    labelKey: 'caseClosureChecklist.nextActionReviewRuleCoverage',
    descriptionKey: 'caseClosureChecklist.nextActionReviewRuleCoverageDescription'
  }
]

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function createAction({ id, priority, labelKey, descriptionKey }) {
  return {
    id,
    priority,
    label: t(labelKey),
    description: t(descriptionKey)
  }
}

const nextActions = computed(() => {
  const gapIds = new Set(normalizeArray(props.gapItems).map((item) => item?.id).filter(Boolean))

  if (gapIds.size === 0 && props.handoffReadiness?.tone === 'positive') {
    return [
      createAction({
        id: 'prepare-final-handoff',
        priority: 10,
        labelKey: 'caseClosureChecklist.nextActionPrepareFinalHandoff',
        descriptionKey: 'caseClosureChecklist.nextActionPrepareFinalHandoffDescription'
      })
    ]
  }

  return ACTION_CONFIG
    .filter((config) => config.gapIds.some((id) => gapIds.has(id)))
    .map((config) => createAction(config))
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 5)
})
</script>

<style scoped>
.next-actions {
  margin-top: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #fcfcfd;
}

.next-actions-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.next-actions-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.no-actions {
  margin: 0.9rem 0 0;
  color: #495057;
}

.action-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.action-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.85rem;
  background: #fff;
}

.action-item h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #212529;
}

.action-item p {
  margin: 0.45rem 0 0;
  color: #495057;
}
</style>
