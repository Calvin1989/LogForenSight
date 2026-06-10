import { extractInvestigationEntities } from './iocExtraction'

const MAX_SCORE = 100
const CHECK_DEFINITIONS = [
  {
    id: 'highRiskReviewed',
    points: 25,
    labelKey: 'evidencePackQuality.highRiskReviewed',
    recommendationKey: 'evidencePackQuality.reviewHighRiskFindings'
  },
  {
    id: 'incidentsTriaged',
    points: 20,
    labelKey: 'evidencePackQuality.incidentsTriaged',
    recommendationKey: 'evidencePackQuality.triageIncidents'
  },
  {
    id: 'caseNotesPresent',
    points: 20,
    labelKey: 'evidencePackQuality.caseNotesPresent',
    recommendationKey: 'evidencePackQuality.addCaseNotes'
  },
  {
    id: 'entitiesPresent',
    points: 15,
    labelKey: 'evidencePackQuality.entitiesPresent',
    recommendationKey: 'evidencePackQuality.checkEntities'
  },
  {
    id: 'reviewReadinessReady',
    points: 20,
    labelKey: 'evidencePackQuality.reviewReadinessReady',
    recommendationKey: 'evidencePackQuality.resolveReadiness'
  }
]

const HIGH_RISK_REVIEWED_STATUSES = new Set([
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

function isHighRiskFinding(finding) {
  const severity = normalizeSeverity(finding?.severity)
  return severity === 'high' || severity === 'critical'
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

function isReviewedHighRiskFinding(finding, triageState) {
  const triageEntry = resolveTriageEntry('finding', finding, triageState)
  const status = normalizeStatus(triageEntry?.status)
  return HIGH_RISK_REVIEWED_STATUSES.has(status)
}

function isTriagedIncident(incident, triageState) {
  const triageEntry = resolveTriageEntry('incident', incident, triageState)
  return normalizeStatus(triageEntry?.status) !== ''
}

function toScoreStatus(score) {
  if (score >= 90) return 'ready'
  if (score >= 70) return 'good'
  if (score >= 40) return 'partial'
  return 'missing'
}

function createCheck(definition, status, earned) {
  return {
    id: definition.id,
    labelKey: definition.labelKey,
    status,
    points: definition.points,
    earned,
    recommendationKey: definition.recommendationKey
  }
}

function buildEmptyQuality() {
  const checks = [
    createCheck(CHECK_DEFINITIONS[0], 'missing', 0),
    createCheck(CHECK_DEFINITIONS[1], 'missing', 0),
    createCheck(CHECK_DEFINITIONS[2], 'missing', 0),
    createCheck(CHECK_DEFINITIONS[3], 'attention', 0),
    createCheck(CHECK_DEFINITIONS[4], 'missing', 0)
  ]

  return {
    score: 0,
    status: 'missing',
    summary: {
      maxScore: MAX_SCORE,
      earnedScore: 0,
      totalChecks: checks.length,
      passedChecks: 0
    },
    checks
  }
}

export function buildEvidencePackQuality({
  result,
  triageState,
  caseNotes = [],
  reviewReadiness = null
} = {}) {
  const safeResult = result && typeof result === 'object' ? result : null
  if (!safeResult) {
    return buildEmptyQuality()
  }

  const safeTriageState = triageState && typeof triageState === 'object' ? triageState : {}
  const safeCaseNotes = normalizeArray(caseNotes)
  const findings = normalizeArray(safeResult.findings)
  const incidents = normalizeArray(safeResult.incidents)
  const highRiskFindings = findings.filter(isHighRiskFinding)
  const entities = extractInvestigationEntities(safeResult).entities

  const checks = []

  const highRiskPassed = highRiskFindings.length === 0 || highRiskFindings.every((finding) => {
    return isReviewedHighRiskFinding(finding, safeTriageState)
  })
  checks.push(createCheck(
    CHECK_DEFINITIONS[0],
    highRiskPassed ? 'pass' : 'missing',
    highRiskPassed ? CHECK_DEFINITIONS[0].points : 0
  ))

  const incidentsPassed = incidents.length === 0 || incidents.every((incident) => {
    return isTriagedIncident(incident, safeTriageState)
  })
  checks.push(createCheck(
    CHECK_DEFINITIONS[1],
    incidentsPassed ? 'pass' : 'missing',
    incidentsPassed ? CHECK_DEFINITIONS[1].points : 0
  ))

  const hasCaseNotes = safeCaseNotes.length > 0
  checks.push(createCheck(
    CHECK_DEFINITIONS[2],
    hasCaseNotes ? 'pass' : 'missing',
    hasCaseNotes ? CHECK_DEFINITIONS[2].points : 0
  ))

  const hasEntities = entities.length > 0
  checks.push(createCheck(
    CHECK_DEFINITIONS[3],
    hasEntities ? 'pass' : 'attention',
    hasEntities ? CHECK_DEFINITIONS[3].points : 0
  ))

  const readinessReady = normalizeStatus(reviewReadiness?.status) === 'ready'
  checks.push(createCheck(
    CHECK_DEFINITIONS[4],
    readinessReady ? 'pass' : 'missing',
    readinessReady ? CHECK_DEFINITIONS[4].points : 0
  ))

  const earnedScore = checks.reduce((total, check) => total + check.earned, 0)
  const passedChecks = checks.filter((check) => check.status === 'pass').length

  return {
    score: earnedScore,
    status: toScoreStatus(earnedScore),
    summary: {
      maxScore: MAX_SCORE,
      earnedScore,
      totalChecks: checks.length,
      passedChecks
    },
    checks
  }
}
