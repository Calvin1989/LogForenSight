const REVIEWED_FINDING_STATUSES = new Set([
  'reviewed',
  'resolved',
  'accepted',
  'false_positive',
  'false positive',
  'false-positive',
  'falsepositive',
  'investigating'
])

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeSeverity(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeStatus(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function resolveTriageEntry(prefix, item, triageState) {
  const candidateKeys = [
    item?.rule_id && `${prefix}:${item.rule_id}`,
    item?.incident_id && `${prefix}:${item.incident_id}`,
    item?.id && `${prefix}:${item.id}`
  ].filter(Boolean)

  for (const key of candidateKeys) {
    if (triageState?.[key]) {
      return triageState[key]
    }
  }

  return null
}

function isHighRiskFinding(finding) {
  const severity = normalizeSeverity(finding?.severity)
  return severity === 'high' || severity === 'critical'
}

function isReviewedHighRiskFinding(finding, triageState) {
  const triageEntry = resolveTriageEntry('finding', finding, triageState)
  return REVIEWED_FINDING_STATUSES.has(normalizeStatus(triageEntry?.status))
}

function incidentNeedsTriage(incident, triageState) {
  const triageEntry = resolveTriageEntry('incident', incident, triageState)
  const status = normalizeStatus(triageEntry?.status)
  return status === '' || status === 'open' || status === 'needs_review' || status === 'needs review'
}

function getQualityScore(quality) {
  return typeof quality?.score === 'number' ? quality.score : null
}

function getReviewReadinessStatus(reviewReadiness) {
  const status = normalizeStatus(reviewReadiness?.status || reviewReadiness?.overall)
  if (status === 'ready') return 'ready'
  if (status === 'attention') return 'attention'
  if (status === 'missing') return 'missing'
  return reviewReadiness ? 'attention' : 'missing'
}

function hasReviewReadinessBlockers(reviewReadiness) {
  if (!reviewReadiness || typeof reviewReadiness !== 'object') {
    return false
  }

  if ((reviewReadiness.summary?.requiredBlockers ?? 0) > 0) {
    return true
  }

  const checks = normalizeArray(reviewReadiness.checks)
  return checks.some((check) => {
    const id = check?.id
    const status = normalizeStatus(check?.status)
    return (
      id === 'highRiskFindings' ||
      id === 'incidents' ||
      id === 'caseNotes' ||
      id === 'evidencePack'
    ) && (status === 'attention' || status === 'missing')
  })
}

function createBlocker(id, labelKey) {
  return {
    id,
    labelKey,
    detailKey: null
  }
}

function createRecommendation(id, labelKey) {
  return {
    id,
    labelKey
  }
}

function uniqueById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}

export function buildEvidencePackExportGuardrails({
  quality = null,
  reviewReadiness = null,
  result = null,
  triageState = {},
  caseNotes = []
} = {}) {
  const safeResult = result && typeof result === 'object' ? result : null
  const safeTriageState = triageState && typeof triageState === 'object' ? triageState : {}
  const safeCaseNotes = normalizeArray(caseNotes)
  const findings = normalizeArray(safeResult?.findings)
  const incidents = normalizeArray(safeResult?.incidents)
  const score = getQualityScore(quality)
  const reviewStatus = getReviewReadinessStatus(reviewReadiness)
  const reviewHasBlockers = hasReviewReadinessBlockers(reviewReadiness)
  const highRiskFindings = findings.filter(isHighRiskFinding)
  const pendingHighRiskFindings = highRiskFindings.filter((finding) => {
    return !isReviewedHighRiskFinding(finding, safeTriageState)
  })
  const incidentsNeedingTriage = incidents.filter((incident) => {
    return incidentNeedsTriage(incident, safeTriageState)
  })
  const hasCaseNotes = safeCaseNotes.length > 0

  const blockers = []
  const recommendations = []

  if (score === null) {
    blockers.push(createBlocker('qualityMissing', 'evidencePackGuardrails.qualityMissing'))
    recommendations.push(createRecommendation('improveQualityScore', 'evidencePackGuardrails.improveQualityScore'))
  } else if (score < 70) {
    blockers.push(createBlocker('qualityBelowMinimum', 'evidencePackGuardrails.qualityBelowMinimum'))
    recommendations.push(createRecommendation('improveQualityScore', 'evidencePackGuardrails.improveQualityScore'))
  } else if (score < 90) {
    blockers.push(createBlocker('qualityBelowReady', 'evidencePackGuardrails.qualityBelowReady'))
    recommendations.push(createRecommendation('improveQualityScore', 'evidencePackGuardrails.improveQualityScore'))
  }

  if (!reviewReadiness) {
    blockers.push(createBlocker('reviewReadinessMissing', 'evidencePackGuardrails.reviewReadinessMissing'))
  } else if (reviewHasBlockers || reviewStatus === 'missing') {
    blockers.push(createBlocker('reviewReadinessAttention', 'evidencePackGuardrails.reviewReadinessAttention'))
  }

  if (pendingHighRiskFindings.length > 0) {
    blockers.push(createBlocker('highRiskNeedsReview', 'evidencePackGuardrails.highRiskNeedsReview'))
    recommendations.push(createRecommendation('reviewHighRisk', 'evidencePackGuardrails.reviewHighRisk'))
  }

  if (incidentsNeedingTriage.length > 0) {
    blockers.push(createBlocker('incidentsNeedTriage', 'evidencePackGuardrails.incidentsNeedTriage'))
    recommendations.push(createRecommendation('triageIncidents', 'evidencePackGuardrails.triageIncidents'))
  }

  if (!hasCaseNotes) {
    blockers.push(createBlocker('caseNotesMissing', 'evidencePackGuardrails.caseNotesMissing'))
    recommendations.push(createRecommendation('addCaseNotes', 'evidencePackGuardrails.addCaseNotes'))
  }

  const uniqueBlockers = uniqueById(blockers)
  const uniqueRecommendations = uniqueById(recommendations)

  let decision = 'review_recommended'
  if (
    score !== null &&
    score >= 90 &&
    reviewStatus === 'ready' &&
    uniqueBlockers.length === 0
  ) {
    decision = 'ready'
  } else if (
    !safeResult ||
    score === null ||
    (score !== null && score < 70) ||
    pendingHighRiskFindings.length > 0 ||
    incidentsNeedingTriage.length > 0 ||
    !hasCaseNotes ||
    reviewStatus === 'missing' ||
    reviewHasBlockers
  ) {
    decision = 'not_ready'
  }

  return {
    decision,
    severity: decision === 'ready' ? 'success' : (decision === 'review_recommended' ? 'attention' : 'warning'),
    summaryKey: decision === 'ready'
      ? 'evidencePackGuardrails.readySummary'
      : (decision === 'review_recommended'
        ? 'evidencePackGuardrails.reviewRecommendedSummary'
        : 'evidencePackGuardrails.notReadySummary'),
    score,
    blockers: uniqueBlockers,
    recommendations: uniqueRecommendations
  }
}
