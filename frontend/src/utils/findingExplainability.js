// Local-first, deterministic explainability builder for individual findings.
//
// The goal is to help analysts understand *why* a finding was raised and what
// to do next, without requiring any external service, LLM, or threat
// intelligence feed. The function is pure: it takes a finding plus the
// surrounding analysis context and returns a stable, sorted explanation that
// can be rendered in the UI and embedded in the Analyst Evidence Pack.

const DEFAULT_EVIDENCE_LIMIT = 280
const EVIDENCE_MIN_LIMIT = 80
const EVIDENCE_MAX_LIMIT = 600
const ELLIPSIS = '…'
const SEVERITY_KEYS = ['critical', 'high', 'medium', 'low', 'info', 'informational']
const RATIONALE_FALLBACK_KEY = 'evidencePack.notAvailable'

const SEVERITY_RECOMMENDATIONS = {
  critical: 'review:critical',
  high: 'review:high',
  medium: 'review:medium',
  low: 'review:low',
  info: 'review:info'
}

const RECOMMENDATION_TRANSLATION_KEYS = {
  'review:critical': {
    key: 'explainability.recommendations.critical',
    fallback: 'Prioritize immediate review, validate the source, and isolate the affected asset if the activity is confirmed malicious.'
  },
  'review:high': {
    key: 'explainability.recommendations.high',
    fallback: 'Prioritize review, validate the source, and isolate the affected asset if the activity is confirmed malicious.'
  },
  'review:medium': {
    key: 'explainability.recommendations.medium',
    fallback: 'Correlate with related events and investigation entities to determine whether further action is required.'
  },
  'review:low': {
    key: 'explainability.recommendations.low',
    fallback: 'Document the observation and continue monitoring the source for additional suspicious activity.'
  },
  'review:info': {
    key: 'explainability.recommendations.info',
    fallback: 'Record the observation in the case notes for future reference; no immediate action is required.'
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeSeverity(severity) {
  if (typeof severity !== 'string') return ''
  return severity.toLowerCase().trim()
}

function isPresent(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function toStringSafe(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (err) {
      return ''
    }
  }
  return ''
}

function clampEvidenceLimit(limit) {
  if (typeof limit !== 'number' || Number.isNaN(limit)) return DEFAULT_EVIDENCE_LIMIT
  if (limit < EVIDENCE_MIN_LIMIT) return EVIDENCE_MIN_LIMIT
  if (limit > EVIDENCE_MAX_LIMIT) return EVIDENCE_MAX_LIMIT
  return Math.floor(limit)
}

function truncateSnippet(text, limit) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  const max = clampEvidenceLimit(limit)
  if (normalized.length <= max) return normalized
  const keep = Math.max(1, max - ELLIPSIS.length)
  return `${normalized.slice(0, keep).trimEnd()}${ELLIPSIS}`
}

function pickFirstString(...candidates) {
  for (const candidate of candidates) {
    const value = toStringSafe(candidate).trim()
    if (value) return value
  }
  return ''
}

function uniqueOrdered(values) {
  const seen = new Set()
  const result = []
  values.forEach((value) => {
    const key = typeof value === 'string' ? value : JSON.stringify(value)
    if (key === undefined || key === null || key === '') return
    if (seen.has(key)) return
    seen.add(key)
    result.push(value)
  })
  return result
}

function readMatchedValues(finding) {
  if (!isPlainObject(finding)) return []
  const values = []
  ;(Array.isArray(finding.matched_values) ? finding.matched_values : []).forEach((value) => {
    const text = toStringSafe(value).trim()
    if (text) values.push(text)
  })
  ;(Array.isArray(finding.matched_fields) ? finding.matched_fields : []).forEach((field) => {
    const text = toStringSafe(field).trim()
    if (text) values.push(text)
  })
  return uniqueOrdered(values)
}

function readEvidence(finding) {
  if (!isPlainObject(finding)) return []
  const list = Array.isArray(finding.evidence) ? finding.evidence : []
  return list
    .map((entry) => toStringSafe(entry).trim())
    .filter((entry) => entry.length > 0)
}

function readRuleCoverageContext(analysisResult, finding) {
  if (!isPlainObject(analysisResult) || !Array.isArray(analysisResult.rule_coverage)) return null
  const ruleId = toStringSafe(finding?.rule_id).trim()
  if (!ruleId) return null
  return analysisResult.rule_coverage.find((rule) => toStringSafe(rule?.rule_id).trim() === ruleId) || null
}

function readFindingMetadata(finding) {
  if (!isPlainObject(finding)) return {}
  if (isPlainObject(finding.metadata)) return finding.metadata
  return {}
}

function readContextFromFinding(finding) {
  const metadata = readFindingMetadata(finding)
  const context = {
    sourceIp: pickFirstString(metadata.ip, metadata.source_ip, metadata.sourceIp, finding.source_ip, finding.ip),
    path: pickFirstString(metadata.path, metadata.url_path, finding.path, finding.url),
    method: pickFirstString(metadata.method, finding.method),
    status: pickFirstString(metadata.status, metadata.status_code, finding.status),
    userAgent: pickFirstString(metadata.user_agent, metadata.userAgent, finding.user_agent),
    sourceFile: pickFirstString(metadata.source_file, metadata.sourceFile, finding.source_file, finding.sourceFile)
  }
  return context
}

function readContextFromEvidence(evidence) {
  if (!Array.isArray(evidence) || evidence.length === 0) return ''
  for (const entry of evidence) {
    const text = toStringSafe(entry).trim()
    if (text) return text
  }
  return ''
}

function deriveMatchedContext(finding, analysisResult) {
  const fromFinding = readContextFromFinding(finding)
  if (fromFinding.sourceIp || fromFinding.path || fromFinding.method || fromFinding.status) {
    return fromFinding
  }

  const evidenceText = readContextFromEvidence(finding?.evidence)
  if (evidenceText) {
    const ipMatch = evidenceText.match(/(?<![\d.])(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}(?![\d.])/)
    const methodMatch = evidenceText.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i)
    const statusMatch = evidenceText.match(/(?:"\s+|status[=:]\s*)([1-5]\d{2})/i)
    const pathMatch = evidenceText.match(/(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(\/[^\s"]*)/i)
    if (ipMatch || methodMatch || statusMatch || pathMatch) {
      return {
        sourceIp: ipMatch ? ipMatch[0] : '',
        method: methodMatch ? methodMatch[0].toUpperCase() : '',
        status: statusMatch ? statusMatch[1] : '',
        path: pathMatch ? pathMatch[1] : '',
        userAgent: '',
        sourceFile: pickFirstString(analysisResult?.source_files?.[0]?.filename)
      }
    }
  }
  return fromFinding
}

function deriveIndicatorHints(finding, matchedContext) {
  const hints = []
  const matchedValues = readMatchedValues(finding)
  matchedValues.forEach((value) => {
    const text = toStringSafe(value).trim()
    if (!text) return
    if (/^\d+$/.test(text)) {
      hints.push({ kind: 'count', value: text })
    } else if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(text)) {
      hints.push({ kind: 'ip', value: text })
    } else if (text.startsWith('/')) {
      hints.push({ kind: 'path', value: text })
    } else {
      hints.push({ kind: 'keyword', value: text })
    }
  })
  if (matchedContext.sourceIp) hints.push({ kind: 'ip', value: matchedContext.sourceIp })
  if (matchedContext.path) hints.push({ kind: 'path', value: matchedContext.path })
  if (matchedContext.method) hints.push({ kind: 'method', value: matchedContext.method })
  if (matchedContext.status) hints.push({ kind: 'status', value: matchedContext.status })
  if (matchedContext.userAgent) hints.push({ kind: 'user-agent', value: matchedContext.userAgent })

  const seen = new Set()
  return hints.filter((hint) => {
    const key = `${hint.kind}:${hint.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function deriveRelatedEntities(finding, analysisResult) {
  if (!isPlainObject(analysisResult)) return []
  const matchedContext = deriveMatchedContext(finding, analysisResult)
  const wantedValues = new Set()
  if (matchedContext.sourceIp) wantedValues.add(matchedContext.sourceIp)
  if (matchedContext.path) wantedValues.add(matchedContext.path)
  if (matchedContext.userAgent) wantedValues.add(matchedContext.userAgent)
  readMatchedValues(finding).forEach((value) => wantedValues.add(value))

  if (wantedValues.size === 0) return []

  const entities = []
  const seen = new Set()

  const visit = (entity) => {
    if (!isPlainObject(entity)) return
    const value = toStringSafe(entity.value).trim()
    if (!value) return
    if (!wantedValues.has(value)) return
    const key = `${entity.type}:${value}`
    if (seen.has(key)) return
    seen.add(key)
    entities.push({
      type: toStringSafe(entity.type).trim() || 'unknown',
      value,
      count: typeof entity.count === 'number' ? entity.count : 0,
      firstSeen: entity.firstSeen || null,
      lastSeen: entity.lastSeen || null
    })
  }

  const entityCollections = [
    analysisResult.entities,
    analysisResult.investigation_entities,
    analysisResult.ioc_entities,
    isPlainObject(analysisResult.entities_by_type) ? Object.values(analysisResult.entities_by_type).flat() : null
  ]

  entityCollections.forEach((collection) => {
    if (Array.isArray(collection)) collection.forEach(visit)
  })

  if (entities.length > 0) return entities

  // Fallback: derive a tiny summary from the analysis result context so the
  // analyst at least sees globally related entities count.
  const summary = isPlainObject(analysisResult.summary) ? analysisResult.summary : {}
  const topIps = Array.isArray(summary.top_ips) ? summary.top_ips : []
  const topPaths = Array.isArray(summary.top_paths) ? summary.top_paths : []

  topIps.forEach((entry) => {
    if (!isPlainObject(entry)) return
    const value = toStringSafe(entry.ip).trim()
    if (!wantedValues.has(value)) return
    entities.push({
      type: 'ip',
      value,
      count: typeof entry.count === 'number' ? entry.count : 0,
      firstSeen: null,
      lastSeen: null,
      global: true
    })
  })
  topPaths.forEach((entry) => {
    if (!isPlainObject(entry)) return
    const value = toStringSafe(entry.path).trim()
    if (!wantedValues.has(value)) return
    entities.push({
      type: 'path',
      value,
      count: typeof entry.count === 'number' ? entry.count : 0,
      firstSeen: null,
      lastSeen: null,
      global: true
    })
  })

  return entities
}

function summarizeRelatedEntities(entities, analysisResult) {
  if (!Array.isArray(entities) || entities.length === 0) return null
  const countsByType = entities.reduce((accumulator, entity) => {
    accumulator[entity.type] = (accumulator[entity.type] || 0) + 1
    return accumulator
  }, {})

  const globalSummary = (() => {
    if (!isPlainObject(analysisResult?.summary)) return null
    const summary = analysisResult.summary
    const totalEntities = Object.values(countsByType).reduce((sum, count) => sum + count, 0)
    return {
      total: totalEntities,
      topIps: Array.isArray(summary.top_ips) ? summary.top_ips.length : 0,
      topPaths: Array.isArray(summary.top_paths) ? summary.top_paths.length : 0,
      totalRequests: typeof summary.total_requests === 'number' ? summary.total_requests : null
    }
  })()

  return {
    countsByType,
    globalSummary
  }
}

function buildSeverityRationale(severity) {
  const normalized = normalizeSeverity(severity)
  if (!normalized) return { key: RATIONALE_FALLBACK_KEY, fallback: '' }
  return {
    key: `explainability.rationale.${normalized}`,
    fallback: `Severity classified as ${normalized.toUpperCase()} based on the matched rule.`
  }
}

function buildRecommendationForSeverity(severity) {
  const normalized = normalizeSeverity(severity)
  if (!normalized || !SEVERITY_RECOMMENDATIONS[normalized]) {
    return {
      key: RECOMMENDATION_TRANSLATION_KEYS['review:medium'].key,
      fallback: RECOMMENDATION_TRANSLATION_KEYS['review:medium'].fallback
    }
  }
  const id = SEVERITY_RECOMMENDATIONS[normalized]
  return {
    key: RECOMMENDATION_TRANSLATION_KEYS[id].key,
    fallback: RECOMMENDATION_TRANSLATION_KEYS[id].fallback
  }
}

function buildRuleSummary(finding, ruleCoverage) {
  const ruleId = pickFirstString(finding?.rule_id, ruleCoverage?.rule_id)
  const ruleName = pickFirstString(finding?.title, ruleCoverage?.title, ruleCoverage?.rule_name)
  const ruleDescription = pickFirstString(ruleCoverage?.explanation, ruleCoverage?.description, finding?.description)
  return {
    ruleId,
    ruleName,
    ruleDescription
  }
}

function buildEvidenceSnippet(finding, options = {}) {
  const evidence = readEvidence(finding)
  if (evidence.length === 0) return ''
  const limit = clampEvidenceLimit(options.limit)
  return truncateSnippet(evidence[0], limit)
}

function buildRationale(severity) {
  return buildSeverityRationale(severity)
}

function buildRecommendedAction(severity) {
  return buildRecommendationForSeverity(severity)
}

function sortIndicatorHints(hints) {
  const order = { ip: 0, path: 1, method: 2, status: 3, 'user-agent': 4, keyword: 5, count: 6 }
  return [...hints].sort((left, right) => {
    const leftRank = order[left.kind] ?? 99
    const rightRank = order[right.kind] ?? 99
    if (leftRank !== rightRank) return leftRank - rightRank
    return String(left.value).localeCompare(String(right.value))
  })
}

function sortRelatedEntities(entities) {
  return [...entities].sort((left, right) => {
    if (left.type !== right.type) return left.type.localeCompare(right.type)
    if (left.count !== right.count) return right.count - left.count
    return String(left.value).localeCompare(String(right.value))
  })
}

function translate(message, translator) {
  if (!message || typeof message !== 'object') return ''
  const value = typeof translator === 'function' ? translator(message.key, message.fallback) : message.fallback
  if (value === undefined || value === null || value === '') return message.fallback || message.key || ''
  return value
}

export function buildFindingExplanation(finding, analysisResult, options = {}) {
  if (!isPlainObject(finding)) {
    return {
      ruleId: '',
      ruleName: '',
      ruleDescription: '',
      severity: '',
      rationaleKey: RATIONALE_FALLBACK_KEY,
      rationaleFallback: '',
      evidenceSnippet: '',
      evidenceTruncated: false,
      matchedContext: {},
      matchedField: '',
      matchedValue: '',
      indicatorHints: [],
      recommendedActionKey: RECOMMENDATION_TRANSLATION_KEYS['review:medium'].key,
      recommendedActionFallback: RECOMMENDATION_TRANSLATION_KEYS['review:medium'].fallback,
      relatedEntities: [],
      relatedEntitySummary: null,
      available: false,
      hasRuleContext: false,
      hasEvidence: false,
      hasMatchedContext: false,
      hasIndicators: false,
      hasRelatedEntities: false
    }
  }

  const ruleCoverage = readRuleCoverageContext(analysisResult, finding)
  const ruleSummary = buildRuleSummary(finding, ruleCoverage)
  const matchedContext = deriveMatchedContext(finding, analysisResult)
  const matchedValues = readMatchedValues(finding)
  const indicatorHints = sortIndicatorHints(deriveIndicatorHints(finding, matchedContext))
  const relatedEntities = sortRelatedEntities(deriveRelatedEntities(finding, analysisResult))
  const relatedEntitySummary = summarizeRelatedEntities(relatedEntities, analysisResult)
  const evidenceSnippet = buildEvidenceSnippet(finding, options)
  const evidenceRaw = readEvidence(finding)
  const severity = normalizeSeverity(finding.severity)
  const rationale = buildRationale(severity)
  const recommendation = buildRecommendedAction(severity)

  const hasMatchedContext = Boolean(
    matchedContext.sourceIp
    || matchedContext.path
    || matchedContext.method
    || matchedContext.status
    || matchedContext.userAgent
    || matchedContext.sourceFile
  )
  const hasRuleContext = Boolean(ruleSummary.ruleId || ruleSummary.ruleName || ruleSummary.ruleDescription)
  const hasIndicators = indicatorHints.length > 0
  const hasRelatedEntities = relatedEntities.length > 0
  const hasEvidence = evidenceRaw.length > 0

  return {
    ruleId: ruleSummary.ruleId,
    ruleName: ruleSummary.ruleName,
    ruleDescription: ruleSummary.ruleDescription,
    severity: severity || '',
    rationaleKey: rationale.key,
    rationaleFallback: rationale.fallback,
    evidenceSnippet,
    evidenceTruncated: hasEvidence && evidenceSnippet.length > 0 && evidenceSnippet.endsWith(ELLIPSIS),
    matchedContext,
    matchedField: pickFirstString(
      (Array.isArray(finding.matched_fields) && finding.matched_fields[0]) || '',
      indicatorHints.find((hint) => hint.kind === 'path' || hint.kind === 'ip')?.value || ''
    ),
    matchedValue: pickFirstString(
      matchedValues[0] || '',
      indicatorHints.find((hint) => hint.kind === 'ip' || hint.kind === 'path')?.value || ''
    ),
    indicatorHints,
    recommendedActionKey: recommendation.key,
    recommendedActionFallback: recommendation.fallback,
    relatedEntities,
    relatedEntitySummary,
    available: true,
    hasRuleContext,
    hasEvidence,
    hasMatchedContext,
    hasIndicators,
    hasRelatedEntities
  }
}

export function renderFindingExplanation(explanation, translator) {
  if (!explanation || !explanation.available) {
    return {
      ruleId: '',
      ruleName: '',
      ruleDescription: '',
      severityLabel: '',
      rationale: '',
      evidenceSnippet: '',
      matchedContextLabel: '',
      matchedField: '',
      matchedValue: '',
      indicatorHints: [],
      recommendedAction: '',
      relatedEntities: []
    }
  }

  const contextParts = []
  if (explanation.matchedContext.method) contextParts.push(explanation.matchedContext.method)
  if (explanation.matchedContext.path) contextParts.push(explanation.matchedContext.path)
  if (explanation.matchedContext.status) contextParts.push(`HTTP ${explanation.matchedContext.status}`)
  if (explanation.matchedContext.sourceIp) contextParts.push(explanation.matchedContext.sourceIp)
  if (explanation.matchedContext.userAgent) contextParts.push(explanation.matchedContext.userAgent)
  if (explanation.matchedContext.sourceFile) contextParts.push(explanation.matchedContext.sourceFile)

  return {
    ruleId: explanation.ruleId,
    ruleName: explanation.ruleName,
    ruleDescription: explanation.ruleDescription,
    severityLabel: explanation.severity ? explanation.severity.toUpperCase() : '',
    rationale: translate(
      { key: explanation.rationaleKey, fallback: explanation.rationaleFallback },
      translator
    ),
    evidenceSnippet: explanation.evidenceSnippet,
    matchedContextLabel: contextParts.join(' · '),
    matchedField: explanation.matchedField,
    matchedValue: explanation.matchedValue,
    indicatorHints: explanation.indicatorHints,
    recommendedAction: translate(
      { key: explanation.recommendedActionKey, fallback: explanation.recommendedActionFallback },
      translator
    ),
    relatedEntities: explanation.relatedEntities
  }
}

export const __internals = {
  clampEvidenceLimit,
  truncateSnippet,
  deriveMatchedContext,
  deriveIndicatorHints,
  deriveRelatedEntities,
  buildEvidenceSnippet,
  buildRationale,
  buildRecommendedAction
}

export const __severityKeys = SEVERITY_KEYS
