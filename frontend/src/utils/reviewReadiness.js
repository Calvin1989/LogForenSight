import { extractInvestigationEntities } from './iocExtraction'

const READY_STATUS = 'ready'
const ATTENTION_STATUS = 'attention'
const MISSING_STATUS = 'missing'
const REQUIRED_CHECK_IDS = ['highRiskFindings', 'incidents', 'caseNotes']

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeSeverity(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isHighRiskFinding(finding) {
  const severity = normalizeSeverity(finding?.severity)
  return severity === 'high' || severity === 'critical'
}

function resolveFindingTriage(finding, triageState) {
  const candidateKeys = [
    finding?.rule_id && `finding:${finding.rule_id}`,
    finding?.id && `finding:${finding.id}`
  ].filter(Boolean)

  for (const key of candidateKeys) {
    if (triageState?.[key]) {
      return triageState[key]
    }
  }

  return null
}

function resolveIncidentTriage(incident, triageState) {
  const candidateKeys = [
    incident?.incident_id && `incident:${incident.incident_id}`,
    incident?.id && `incident:${incident.id}`
  ].filter(Boolean)

  for (const key of candidateKeys) {
    if (triageState?.[key]) {
      return triageState[key]
    }
  }

  return null
}

function needsReview(triageEntry) {
  const status = typeof triageEntry?.status === 'string'
    ? triageEntry.status.trim().toLowerCase()
    : ''

  return !status || status === 'open' || status === 'needs_review' || status === 'needs review'
}

function createCheck({
  id,
  status,
  count,
  total,
  readyCount,
  labelKey,
  recommendationKey
}) {
  return {
    id,
    status,
    count,
    total,
    readyCount,
    labelKey,
    recommendationKey
  }
}

export function buildReviewReadiness({ result, triageState, caseNotes = [] } = {}) {
  const safeResult = result && typeof result === 'object' ? result : null
  const findings = normalizeArray(safeResult?.findings)
  const incidents = normalizeArray(safeResult?.incidents)
  const safeTriageState = triageState && typeof triageState === 'object' ? triageState : {}
  const safeCaseNotes = normalizeArray(caseNotes)
  const entities = extractInvestigationEntities(safeResult).entities

  const highRiskFindings = findings.filter(isHighRiskFinding)
  const pendingHighRiskFindings = highRiskFindings.filter((finding) => {
    return needsReview(resolveFindingTriage(finding, safeTriageState))
  })

  const pendingIncidents = incidents.filter((incident) => {
    return needsReview(resolveIncidentTriage(incident, safeTriageState))
  })

  const caseNotesCount = safeCaseNotes.length
  const requiredBlockers = [
    pendingHighRiskFindings.length > 0,
    pendingIncidents.length > 0,
    caseNotesCount === 0
  ].filter(Boolean).length

  const checks = [
    createCheck({
      id: 'highRiskFindings',
      status: pendingHighRiskFindings.length === 0 ? READY_STATUS : ATTENTION_STATUS,
      count: pendingHighRiskFindings.length,
      total: highRiskFindings.length,
      readyCount: Math.max(highRiskFindings.length - pendingHighRiskFindings.length, 0),
      labelKey: 'reviewReadiness.highRiskFindings',
      recommendationKey: pendingHighRiskFindings.length === 0
        ? 'reviewReadiness.readyToExport'
        : 'reviewReadiness.reviewHighRiskFindings'
    }),
    createCheck({
      id: 'incidents',
      status: pendingIncidents.length === 0 ? READY_STATUS : ATTENTION_STATUS,
      count: pendingIncidents.length,
      total: incidents.length,
      readyCount: Math.max(incidents.length - pendingIncidents.length, 0),
      labelKey: 'reviewReadiness.incidents',
      recommendationKey: pendingIncidents.length === 0
        ? 'reviewReadiness.readyToExport'
        : 'reviewReadiness.reviewIncidents'
    }),
    createCheck({
      id: 'entities',
      status: READY_STATUS,
      count: entities.length,
      total: entities.length,
      readyCount: entities.length > 0 ? entities.length : 0,
      labelKey: 'reviewReadiness.entities',
      recommendationKey: entities.length > 0
        ? 'reviewReadiness.readyToExport'
        : 'reviewReadiness.entitiesOptional'
    }),
    createCheck({
      id: 'caseNotes',
      status: caseNotesCount > 0 ? READY_STATUS : MISSING_STATUS,
      count: caseNotesCount,
      total: caseNotesCount,
      readyCount: caseNotesCount > 0 ? 1 : 0,
      labelKey: 'reviewReadiness.caseNotes',
      recommendationKey: caseNotesCount > 0
        ? 'reviewReadiness.readyToExport'
        : 'reviewReadiness.addCaseNotes'
    }),
    createCheck({
      id: 'evidencePack',
      status: requiredBlockers === 0 ? READY_STATUS : ATTENTION_STATUS,
      count: requiredBlockers,
      total: REQUIRED_CHECK_IDS.length,
      readyCount: REQUIRED_CHECK_IDS.length - requiredBlockers,
      labelKey: 'reviewReadiness.evidencePack',
      recommendationKey: requiredBlockers === 0
        ? 'reviewReadiness.readyToExport'
        : 'reviewReadiness.completeRequiredChecks'
    })
  ]

  const readyChecks = checks.filter((check) => check.status === READY_STATUS).length
  const attentionChecks = checks.filter((check) => check.status === ATTENTION_STATUS).length
  const missingChecks = checks.filter((check) => check.status === MISSING_STATUS).length

  return {
    status: requiredBlockers === 0 ? READY_STATUS : ATTENTION_STATUS,
    summary: {
      totalChecks: checks.length,
      readyChecks,
      attentionChecks,
      missingChecks,
      requiredBlockers,
      entitiesCount: entities.length,
      caseNotesCount,
      highRiskFindings: {
        total: highRiskFindings.length,
        pending: pendingHighRiskFindings.length,
        reviewed: Math.max(highRiskFindings.length - pendingHighRiskFindings.length, 0)
      },
      incidents: {
        total: incidents.length,
        pending: pendingIncidents.length,
        reviewed: Math.max(incidents.length - pendingIncidents.length, 0)
      }
    },
    checks
  }
}
