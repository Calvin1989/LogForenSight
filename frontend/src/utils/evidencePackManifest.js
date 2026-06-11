import { extractInvestigationEntities } from './iocExtraction'
import { buildCaseClosureGapItems } from './caseClosureGapItems'
import { buildCaseClosureNextActions } from './caseClosureNextActions'

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeObject(value) {
  return value && typeof value === 'object' ? value : {}
}

function normalizeStatus(value) {
  return typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : 'unavailable'
}

function availabilityTone(value) {
  if (value === undefined || value === null) return 'neutral'
  return normalizeArray(value).length > 0 ? 'positive' : 'warning'
}

function guardrailTone(decision) {
  if (decision === 'ready') return 'positive'
  if (decision === 'review_recommended') return 'warning'
  if (decision === 'not_ready') return 'danger'
  return 'neutral'
}

function shareSafetyTone(status) {
  if (status === 'safe') return 'positive'
  if (status === 'review_recommended') return 'warning'
  if (status === 'attention') return 'danger'
  return 'neutral'
}

function qualityTone(status) {
  if (status === 'ready' || status === 'good') return 'positive'
  if (status === 'partial' || status === 'missing') return 'warning'
  return 'neutral'
}

function buildHandoffReadinessStatus({
  reviewReadinessStatus,
  qualityStatus,
  guardrailDecision,
  shareSafetyStatus
}) {
  const hasSignals = [
    reviewReadinessStatus,
    qualityStatus,
    guardrailDecision,
    shareSafetyStatus
  ].some((status) => status !== 'unavailable')

  if (!hasSignals) {
    return {
      id: 'handoff-readiness',
      tone: 'neutral',
      status: 'unavailable'
    }
  }

  const isReady = reviewReadinessStatus === 'ready'
    && guardrailDecision === 'ready'
    && (qualityStatus === 'ready' || qualityStatus === 'good')
    && shareSafetyStatus !== 'attention'

  return {
    id: 'handoff-readiness',
    tone: isReady ? 'positive' : 'warning',
    status: isReady ? 'ready' : 'needs_review'
  }
}

function buildChecklistItems({ result, caseNotes, reviewReadiness, evidencePackQuality, exportGuardrails, shareSafety, handoffReadiness }) {
  return [
    { id: 'findings', tone: availabilityTone(result?.findings) },
    { id: 'incidents', tone: availabilityTone(result?.incidents) },
    { id: 'timeline', tone: availabilityTone(result?.timeline_events) },
    { id: 'rule-coverage', tone: availabilityTone(result?.rule_coverage) },
    { id: 'case-notes', tone: Array.isArray(caseNotes) ? (caseNotes.length > 0 ? 'positive' : 'warning') : 'neutral' },
    { id: 'review-readiness', tone: reviewReadiness.status === 'ready' ? 'positive' : (reviewReadiness.status === 'unavailable' ? 'neutral' : 'warning') },
    { id: 'quality-score', tone: qualityTone(evidencePackQuality.status) },
    { id: 'export-guardrails', tone: guardrailTone(exportGuardrails.decision) },
    { id: 'share-safety', tone: shareSafetyTone(shareSafety.status) },
    { id: 'handoff-readiness', tone: handoffReadiness.tone }
  ]
}

export function buildEvidencePackManifest(input = {}, options = {}) {
  const safeInput = normalizeObject(input)
  const safeResult = safeInput.result && typeof safeInput.result === 'object' ? safeInput.result : {}
  const safeTriageState = normalizeObject(safeInput.triageState)
  const safeCaseNotes = normalizeArray(safeInput.caseNotes)
  const sourceFiles = normalizeArray(safeResult.parse_stats?.source_files)
  const reviewReadinessStatus = normalizeStatus(safeInput.reviewReadiness?.status)
  const qualityStatus = normalizeStatus(safeInput.evidencePackQuality?.status)
  const guardrailDecision = normalizeStatus(safeInput.exportGuardrails?.decision)
  const shareSafetyStatus = normalizeStatus(safeInput.shareSafety?.status)
  const handoffReadiness = buildHandoffReadinessStatus({
    reviewReadinessStatus,
    qualityStatus,
    guardrailDecision,
    shareSafetyStatus
  })

  const checklistItems = buildChecklistItems({
    result: safeResult,
    caseNotes: safeCaseNotes,
    reviewReadiness: { status: reviewReadinessStatus },
    evidencePackQuality: { status: qualityStatus },
    exportGuardrails: { decision: guardrailDecision },
    shareSafety: { status: shareSafetyStatus },
    handoffReadiness
  })

  const gapItems = buildCaseClosureGapItems({
    checklistItems,
    handoffReadiness
  })

  const nextActions = buildCaseClosureNextActions({
    gapItems,
    handoffReadiness,
    createAction: ({ id }) => ({ id })
  })

  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    sourceCounts: {
      findings: normalizeArray(safeResult.findings).length,
      incidents: normalizeArray(safeResult.incidents).length,
      timelineEvents: normalizeArray(safeResult.timeline_events).length,
      ruleCoverage: normalizeArray(safeResult.rule_coverage).length,
      sourceFiles: sourceFiles.length,
      triageRecords: Object.keys(safeTriageState).length,
      caseNotes: safeCaseNotes.length,
      entities: extractInvestigationEntities(safeResult).entities.length
    },
    statusSummary: {
      reviewReadinessStatus,
      qualityScore: typeof safeInput.evidencePackQuality?.score === 'number' ? safeInput.evidencePackQuality.score : null,
      qualityStatus,
      guardrailDecision,
      shareSafetyStatus,
      handoffReadinessStatus: handoffReadiness.status
    },
    closureSummary: {
      gapCount: gapItems.length,
      nextActionCount: nextActions.length
    }
  }
}
