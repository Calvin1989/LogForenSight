import { extractInvestigationEntities } from './iocExtraction'
import { buildCaseClosureGapItems } from './caseClosureGapItems'
import { buildCaseClosureNextActions } from './caseClosureNextActions'

export const MANIFEST_EXPORT_FIELD_ALLOWLIST = Object.freeze({
  generatedAt: true,
  sourceCounts: Object.freeze([
    'findings',
    'incidents',
    'timelineEvents',
    'ruleCoverage',
    'sourceFiles',
    'triageRecords',
    'caseNotes',
    'entities'
  ]),
  statusSummary: Object.freeze([
    'reviewReadinessStatus',
    'qualityScore',
    'qualityStatus',
    'guardrailDecision',
    'shareSafetyStatus',
    'handoffReadinessStatus'
  ]),
  closureSummary: Object.freeze([
    'gapCount',
    'nextActionCount'
  ])
})

export const MANIFEST_FIELD_RISK_LEVELS = Object.freeze({
  generatedAt: 'low',
  'sourceCounts.findings': 'low',
  'sourceCounts.incidents': 'low',
  'sourceCounts.timelineEvents': 'low',
  'sourceCounts.ruleCoverage': 'low',
  'sourceCounts.sourceFiles': 'low',
  'sourceCounts.triageRecords': 'low',
  'sourceCounts.caseNotes': 'low',
  'sourceCounts.entities': 'low',
  'statusSummary.reviewReadinessStatus': 'low',
  'statusSummary.qualityScore': 'low',
  'statusSummary.qualityStatus': 'low',
  'statusSummary.guardrailDecision': 'low',
  'statusSummary.shareSafetyStatus': 'low',
  'statusSummary.handoffReadinessStatus': 'low',
  'closureSummary.gapCount': 'low',
  'closureSummary.nextActionCount': 'low',
  sourceFileNames: 'high',
  rawPaths: 'high',
  urls: 'high',
  accountLikeValues: 'high',
  rawEvidenceSnippets: 'high',
  freeFormCaseNoteContent: 'high',
  rawFindingDescriptions: 'high',
  rawIncidentText: 'high'
})

const BLOCKED_MANIFEST_FIELD_TYPES = Object.freeze([
  {
    key: 'sourceFileNames',
    aliases: Object.freeze(['sourcefilenames', 'sourcefilename', 'sourcefileslist'])
  },
  {
    key: 'rawPaths',
    aliases: Object.freeze(['rawpaths', 'sourcepaths', 'filepaths', 'filepaths', 'pathsamples'])
  },
  {
    key: 'urls',
    aliases: Object.freeze(['urls', 'urlsamples', 'sourceurls'])
  },
  {
    key: 'accountLikeValues',
    aliases: Object.freeze(['accountlikevalues', 'accountvalues', 'usernames', 'logins', 'emails', 'uids'])
  },
  {
    key: 'rawEvidenceSnippets',
    aliases: Object.freeze(['rawevidencesnippets', 'evidencesnippets', 'rawevidence'])
  },
  {
    key: 'freeFormCaseNoteContent',
    aliases: Object.freeze(['freeformcasenotecontent', 'casenotescontent', 'casenotecontent', 'notebodies', 'notebody'])
  },
  {
    key: 'rawFindingDescriptions',
    aliases: Object.freeze(['rawfindingdescriptions', 'findingdescriptions', 'findingdescription'])
  },
  {
    key: 'rawIncidentText',
    aliases: Object.freeze(['rawincidenttext', 'incidenttext', 'incidenttexts', 'incidentsummaries'])
  }
])

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

function normalizeCount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
}

function normalizeScore(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeFieldSegment(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function matchBlockedFieldType(pathSegments) {
  const normalizedSegments = pathSegments.map(normalizeFieldSegment)
  const joinedPath = normalizedSegments.join('.')

  return BLOCKED_MANIFEST_FIELD_TYPES.find((fieldType) => {
    return fieldType.aliases.some((alias) => {
      return joinedPath.includes(alias) || normalizedSegments.includes(alias)
    })
  }) || null
}

function collectBlockedManifestFields(value, pathSegments = [], blockedFields = []) {
  if (pathSegments.length > 0) {
    const matchedType = matchBlockedFieldType(pathSegments)
    if (matchedType) {
      blockedFields.push({
        fieldPath: pathSegments.join('.'),
        fieldType: matchedType.key,
        riskLevel: MANIFEST_FIELD_RISK_LEVELS[matchedType.key] || 'high'
      })
      return blockedFields
    }
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      collectBlockedManifestFields(item, pathSegments, blockedFields)
    })
    return blockedFields
  }

  if (!value || typeof value !== 'object') {
    return blockedFields
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    collectBlockedManifestFields(nestedValue, [...pathSegments, key], blockedFields)
  })

  return blockedFields
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

export function getEvidencePackManifestExportFields(manifest = {}) {
  const safeManifest = normalizeObject(manifest)
  const sourceCounts = normalizeObject(safeManifest.sourceCounts)
  const statusSummary = normalizeObject(safeManifest.statusSummary)
  const closureSummary = normalizeObject(safeManifest.closureSummary)

  return {
    generatedAt: typeof safeManifest.generatedAt === 'string' ? safeManifest.generatedAt : '',
    sourceCounts: MANIFEST_EXPORT_FIELD_ALLOWLIST.sourceCounts.reduce((accumulator, key) => {
      accumulator[key] = normalizeCount(sourceCounts[key])
      return accumulator
    }, {}),
    statusSummary: {
      reviewReadinessStatus: normalizeStatus(statusSummary.reviewReadinessStatus),
      qualityScore: normalizeScore(statusSummary.qualityScore),
      qualityStatus: normalizeStatus(statusSummary.qualityStatus),
      guardrailDecision: normalizeStatus(statusSummary.guardrailDecision),
      shareSafetyStatus: normalizeStatus(statusSummary.shareSafetyStatus),
      handoffReadinessStatus: normalizeStatus(statusSummary.handoffReadinessStatus)
    },
    closureSummary: {
      gapCount: normalizeCount(closureSummary.gapCount),
      nextActionCount: normalizeCount(closureSummary.nextActionCount)
    }
  }
}

export function validateEvidencePackManifestForExport(manifest = {}) {
  const exportFields = getEvidencePackManifestExportFields(manifest)
  const blockedFields = collectBlockedManifestFields(manifest)
  const warnings = blockedFields.map((field) => ({
    code: 'blocked-manifest-field',
    fieldPath: field.fieldPath,
    fieldType: field.fieldType,
    riskLevel: field.riskLevel
  }))

  return {
    status: blockedFields.length > 0 ? 'blocked' : 'compatible',
    compatibility: blockedFields.length > 0 ? 'unsafe' : 'safe',
    compatible: blockedFields.length === 0,
    exportFieldCount: 17,
    exportFields,
    blockedFields,
    warnings
  }
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
