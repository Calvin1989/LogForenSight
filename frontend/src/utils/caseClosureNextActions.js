function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

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

export function buildCaseClosureNextActions({
  gapItems = [],
  handoffReadiness = null,
  createAction = (config) => config,
  maxActions = 5
} = {}) {
  const gapIds = new Set(normalizeArray(gapItems).map((item) => item?.id).filter(Boolean))

  if (gapIds.size === 0 && handoffReadiness?.tone === 'positive') {
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
    .slice(0, maxActions)
}
