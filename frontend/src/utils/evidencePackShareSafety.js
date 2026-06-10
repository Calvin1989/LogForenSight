const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
const URL_WITH_QUERY_PATTERN = /\bhttps?:\/\/[^\s<>"')]+?\?[^\s<>"')]+/gi
const SENSITIVE_PATH_PATTERN = /(?:^|[\s"'`:(])((?:\/[^/\s"'`?)]*)*\/(?:\.env|admin|backup)(?:[/?#][^\s"'`)]*)?)/gi
const ACCOUNT_ASSIGNMENT_PATTERN = /\b(?:user(?:name)?|account|login|email|uid|user_id|src_user)\s*[:=]\s*([A-Za-z0-9._@-]{3,})/gi
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const LOG_LINE_PATTERN = /"(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\/\d(?:\.\d)?"/
const APACHE_STYLE_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\s+-\s+-\s+\[[^\]]+\]/
const FILENAME_PATTERN = /\b[^\\/\s]+?\.(?:log|txt|csv|json|ndjson|gz|zip)\b/gi

const FINDING_DEFINITIONS = {
  ipAddresses: {
    labelKey: 'evidencePackShareSafety.findingIpAddresses',
    weight: 1
  },
  urlsWithQueryStrings: {
    labelKey: 'evidencePackShareSafety.findingUrlsWithQueryStrings',
    weight: 2
  },
  sensitivePaths: {
    labelKey: 'evidencePackShareSafety.findingSensitivePaths',
    weight: 2
  },
  accountLikeValues: {
    labelKey: 'evidencePackShareSafety.findingAccountLikeValues',
    weight: 3
  },
  rawEvidenceSnippets: {
    labelKey: 'evidencePackShareSafety.findingRawEvidenceSnippets',
    weight: 3
  },
  sourceFilenames: {
    labelKey: 'evidencePackShareSafety.findingSourceFilenames',
    weight: 1
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value : ''
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)))
}

function takeSamples(values, limit = 3) {
  return uniqueValues(values).slice(0, limit)
}

function isValidIpv4(value) {
  const parts = String(value).split('.')
  return parts.length === 4 && parts.every((part) => {
    const number = Number(part)
    return Number.isInteger(number) && number >= 0 && number <= 255
  })
}

function collectAllText(result, markdown) {
  const parts = []
  const safeResult = result && typeof result === 'object' ? result : null

  if (markdown) {
    parts.push(markdown)
  }

  if (safeResult) {
    parts.push(JSON.stringify(safeResult))
  }

  return parts.join('\n')
}

function matchValues(text, pattern, mapper = (value) => value) {
  const matches = Array.from(text.matchAll(pattern), (match) => mapper(match))
  return uniqueValues(matches)
}

function collectFinding(id, values) {
  const definition = FINDING_DEFINITIONS[id]
  const unique = uniqueValues(values)

  if (!definition || unique.length === 0) {
    return null
  }

  return {
    id,
    labelKey: definition.labelKey,
    count: unique.length,
    samples: takeSamples(unique)
  }
}

function collectIpAddresses(text) {
  return matchValues(text, IPV4_PATTERN, (match) => match[0]).filter(isValidIpv4)
}

function collectUrlsWithQueryStrings(text) {
  return matchValues(text, URL_WITH_QUERY_PATTERN, (match) => match[0])
}

function collectSensitivePaths(text) {
  return matchValues(text, SENSITIVE_PATH_PATTERN, (match) => match[1]?.trim())
}

function collectAccountLikeValues(text) {
  const assignedValues = matchValues(text, ACCOUNT_ASSIGNMENT_PATTERN, (match) => match[1])
  const emails = matchValues(text, EMAIL_PATTERN, (match) => match[0])
  return uniqueValues([...assignedValues, ...emails])
}

function collectEvidenceSnippets(markdown, result) {
  const snippets = []
  const safeResult = result && typeof result === 'object' ? result : null

  normalizeText(markdown)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) return
      if (LOG_LINE_PATTERN.test(line) || APACHE_STYLE_PATTERN.test(line)) {
        snippets.push(line)
      }
    })

  if (safeResult) {
    const findings = normalizeArray(safeResult.findings)
    const incidents = normalizeArray(safeResult.incidents)
    const timelineEvents = normalizeArray(safeResult.timeline_events)

    findings.forEach((finding) => {
      normalizeArray(finding?.evidence).forEach((value) => snippets.push(normalizeText(value)))
    })
    incidents.forEach((incident) => {
      normalizeArray(incident?.evidence).forEach((value) => snippets.push(normalizeText(value)))
    })
    timelineEvents.forEach((event) => {
      snippets.push(normalizeText(event?.evidence))
    })
  }

  return uniqueValues(snippets.filter((value) => {
    return value && (LOG_LINE_PATTERN.test(value) || APACHE_STYLE_PATTERN.test(value))
  }))
}

function collectSourceFilenames(text, result) {
  const names = matchValues(text, FILENAME_PATTERN, (match) => match[0])
  const safeResult = result && typeof result === 'object' ? result : null

  if (!safeResult) {
    return names
  }

  const sourceFiles = normalizeArray(safeResult.parse_stats?.source_files)
  const findings = normalizeArray(safeResult.findings)
  const timelineEvents = normalizeArray(safeResult.timeline_events)

  sourceFiles.forEach((file) => {
    names.push(normalizeText(file?.filename || file?.name))
  })
  findings.forEach((finding) => {
    names.push(normalizeText(finding?.metadata?.source_file))
  })
  timelineEvents.forEach((event) => {
    names.push(normalizeText(event?.source_file))
  })

  return uniqueValues(names.filter(Boolean))
}

function buildWarnings(status, findings) {
  if (status === 'safe') {
    return []
  }

  const warnings = [
    {
      id: 'manualReviewRecommended',
      labelKey: 'evidencePackShareSafety.warningManualReviewRecommended'
    }
  ]

  if (findings.some((finding) => finding.id === 'rawEvidenceSnippets')) {
    warnings.push({
      id: 'rawEvidencePresent',
      labelKey: 'evidencePackShareSafety.warningRawEvidencePresent'
    })
  }

  if (findings.some((finding) => finding.id === 'accountLikeValues')) {
    warnings.push({
      id: 'accountContextPresent',
      labelKey: 'evidencePackShareSafety.warningAccountContextPresent'
    })
  }

  if (status === 'attention') {
    warnings.push({
      id: 'highExposureIndicators',
      labelKey: 'evidencePackShareSafety.warningHighExposureIndicators'
    })
  }

  return warnings
}

function buildRecommendations(findings) {
  if (findings.length === 0) {
    return [
      {
        id: 'shareNormally',
        labelKey: 'evidencePackShareSafety.recommendationShareNormally'
      }
    ]
  }

  const recommendations = [
    {
      id: 'reviewBeforeShare',
      labelKey: 'evidencePackShareSafety.recommendationReviewBeforeShare'
    }
  ]

  if (findings.some((finding) => finding.id === 'urlsWithQueryStrings')) {
    recommendations.push({
      id: 'checkQueryStrings',
      labelKey: 'evidencePackShareSafety.recommendationCheckQueryStrings'
    })
  }

  if (findings.some((finding) => finding.id === 'sensitivePaths')) {
    recommendations.push({
      id: 'confirmSensitivePaths',
      labelKey: 'evidencePackShareSafety.recommendationConfirmSensitivePaths'
    })
  }

  if (findings.some((finding) => finding.id === 'accountLikeValues')) {
    recommendations.push({
      id: 'confirmAccountValues',
      labelKey: 'evidencePackShareSafety.recommendationConfirmAccountValues'
    })
  }

  if (findings.some((finding) => finding.id === 'rawEvidenceSnippets')) {
    recommendations.push({
      id: 'trimRawEvidence',
      labelKey: 'evidencePackShareSafety.recommendationTrimRawEvidence'
    })
  }

  return recommendations
}

function resolveStatus(findings) {
  const exposureScore = findings.reduce((total, finding) => {
    return total + (FINDING_DEFINITIONS[finding.id]?.weight || 0)
  }, 0)
  const hasRawEvidence = findings.some((finding) => finding.id === 'rawEvidenceSnippets')

  if (findings.length === 0) {
    return 'safe'
  }

  if (hasRawEvidence || exposureScore >= 5) {
    return 'attention'
  }

  return 'review_recommended'
}

export function buildEvidencePackShareSafety({ markdown = '', result = null } = {}) {
  const safeMarkdown = normalizeText(markdown)
  const safeResult = result && typeof result === 'object' ? result : null
  const combinedText = collectAllText(safeResult, safeMarkdown)

  const findings = [
    collectFinding('ipAddresses', collectIpAddresses(combinedText)),
    collectFinding('urlsWithQueryStrings', collectUrlsWithQueryStrings(combinedText)),
    collectFinding('sensitivePaths', collectSensitivePaths(combinedText)),
    collectFinding('accountLikeValues', collectAccountLikeValues(combinedText)),
    collectFinding('rawEvidenceSnippets', collectEvidenceSnippets(safeMarkdown, safeResult)),
    collectFinding('sourceFilenames', collectSourceFilenames(combinedText, safeResult))
  ].filter(Boolean)

  const status = resolveStatus(findings)

  return {
    status,
    summaryKey: `evidencePackShareSafety.summary${status.charAt(0).toUpperCase()}${status.slice(1).replace(/_([a-z])/g, (_, char) => char.toUpperCase())}`,
    findings,
    warnings: buildWarnings(status, findings),
    recommendations: buildRecommendations(findings)
  }
}
