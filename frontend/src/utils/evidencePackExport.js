import { currentLanguage, t, translateRiskLevel, translateSeverity } from '../i18n'
import { getCase } from './caseWorkspaceStorage'
import { downloadTextFile } from './exportUtils'
import { extractInvestigationEntities } from './iocExtraction'
import { buildFindingExplanation, renderFindingExplanation } from './findingExplainability'
import { localizeAnalysisForDisplay } from './localizedAnalysis'
import { getTriageState } from './triageStorage'

function valueOrFallback(value) {
  if (value === null || value === undefined || value === '') {
    return t('evidencePack.notAvailable')
  }
  return value
}

function listOrFallback(values, separator = ', ') {
  if (!Array.isArray(values) || values.length === 0) {
    return t('evidencePack.notAvailable')
  }
  return values.join(separator)
}

function formatTimestamp(value, language) {
  if (!value) return t('evidencePack.notAvailable')

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')
}

function formatPercent(value) {
  if (typeof value !== 'number') {
    return t('evidencePack.notAvailable')
  }
  return `${(value * 100).toFixed(1)}%`
}

function escapeMarkdownCell(value) {
  return String(valueOrFallback(value))
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')
}

function appendTable(lines, headers, rows) {
  lines.push(`| ${headers.join(' | ')} |`)
  lines.push(`| ${headers.map(() => ':---').join(' | ')} |`)
  rows.forEach((row) => {
    lines.push(`| ${row.map(escapeMarkdownCell).join(' | ')} |`)
  })
  lines.push('')
}

function appendFallback(lines) {
  lines.push(`- ${t('evidencePack.notAvailable')}`, '')
}

function appendInvestigationEntities(lines, analysisResult, language) {
  lines.push(`## ${t('evidencePack.investigationEntities')}`, '')

  const { entities } = extractInvestigationEntities(analysisResult)
  if (entities.length === 0) {
    appendFallback(lines)
    return
  }

  appendTable(lines, [
    t('entities.type'),
    t('entities.value'),
    t('common.count'),
    t('entities.firstSeen'),
    t('entities.lastSeen'),
    t('entities.relatedSourceFiles')
  ], entities.map((entity) => [
    t(`entities.types.${entity.type}`, entity.type),
    entity.value,
    entity.count,
    formatTimestamp(entity.firstSeen, language),
    formatTimestamp(entity.lastSeen, language),
    listOrFallback(entity.relatedSourceFiles)
  ]))
}

function appendSeverityCounts(lines, title, counts = {}) {
  lines.push(`### ${title}`, '')

  const normalized = ['critical', 'high', 'medium', 'low', 'info', 'informational']
    .map((severityKey) => [severityKey, counts[severityKey] ?? counts[severityKey.toUpperCase()]])
    .filter(([, count]) => count !== undefined)

  if (normalized.length === 0) {
    appendFallback(lines)
    return
  }

  appendTable(
    lines,
    [t('common.severity'), t('common.count')],
    normalized.map(([severityKey, count]) => [translateSeverity(severityKey).toUpperCase(), count])
  )
}

function resolveIncidentTriage(incident, triageState) {
  const candidateKeys = [
    incident?.incident_id && `incident:${incident.incident_id}`,
    incident?.id && `incident:${incident.id}`
  ].filter(Boolean)

  for (const key of candidateKeys) {
    if (triageState[key]) {
      return triageState[key]
    }
  }

  return null
}

function resolveFindingTriage(finding, triageState) {
  const candidateKeys = [
    finding?.rule_id && `finding:${finding.rule_id}`,
    finding?.id && `finding:${finding.id}`
  ].filter(Boolean)

  for (const key of candidateKeys) {
    if (triageState[key]) {
      return triageState[key]
    }
  }

  return null
}

function appendTriageDetails(lines, triageEntry, language) {
  lines.push(`#### ${t('evidencePack.triageDetails')}`, '')

  if (!triageEntry) {
    appendFallback(lines)
    return
  }

  lines.push(`- **${t('triage.status')}**: ${triageEntry.status ? t(`triage.${triageEntry.status}`, triageEntry.status) : t('evidencePack.notAvailable')}`)
  lines.push(`- **${t('triage.priority')}**: ${triageEntry.priority ? t(`triage.${triageEntry.priority}`, triageEntry.priority) : t('evidencePack.notAvailable')}`)
  lines.push(`- **${t('triage.notes')}**: ${valueOrFallback(triageEntry.notes)}`)
  lines.push(`- **${t('triage.updated')}**: ${formatTimestamp(triageEntry.updated_at, language)}`, '')
}

function appendEvidenceList(lines, evidence) {
  lines.push(`- **${t('common.evidence')}**:`)

  if (!Array.isArray(evidence) || evidence.length === 0) {
    lines.push(`  - ${t('evidencePack.notAvailable')}`, '')
    return
  }

  evidence.forEach((item) => {
    lines.push(`  - ${item}`)
  })
  lines.push('')
}

function appendIndicatorHints(lines, hints) {
  if (!Array.isArray(hints) || hints.length === 0) return

  const rows = hints.map((hint) => {
    const kind = t(`explainability.indicatorKind.${hint.kind}`, hint.kind)
    return [kind, hint.value]
  })
  appendTable(lines, [t('common.description'), t('findings.values')], rows)
}

function appendRelatedEntities(lines, entities) {
  if (!Array.isArray(entities) || entities.length === 0) {
    lines.push(`- ${t('explainability.noRelatedEntities')}`)
    lines.push('')
    return
  }

  appendTable(lines, [
    t('entities.type'),
    t('entities.value'),
    t('common.count')
  ], entities.map((entity) => [entity.type, entity.value, entity.count]))
}

function appendFindingExplanation(lines, finding, analysisResult) {
  const explanation = buildFindingExplanation(finding, analysisResult)
  const rendered = renderFindingExplanation(explanation, (key, fallback) => t(key, fallback || ''))

  lines.push(`- **${t('explainability.ruleId')}**: ${valueOrFallback(explanation.ruleId)}`)
  lines.push(`- **${t('explainability.ruleName')}**: ${valueOrFallback(explanation.ruleName)}`)
  lines.push(`- **${t('explainability.ruleDescription')}**: ${valueOrFallback(explanation.ruleDescription)}`)
  lines.push(`- **${t('explainability.severityRationale')}**: ${valueOrFallback(rendered.rationale)}`)

  if (explanation.hasMatchedContext) {
    lines.push(`- **${t('explainability.matchedContext')}**: ${valueOrFallback(rendered.matchedContextLabel)}`)
    lines.push(`  - **${t('explainability.matchedField')}**: ${valueOrFallback(explanation.matchedField)}`)
    lines.push(`  - **${t('explainability.matchedValue')}**: ${valueOrFallback(explanation.matchedValue)}`)
  } else {
    lines.push(`- **${t('explainability.matchedContext')}**: ${t('evidencePack.notAvailable')}`)
  }

  if (explanation.hasIndicators) {
    lines.push(`- **${t('explainability.indicators')}**:`)
    appendIndicatorHints(lines, explanation.indicatorHints)
  } else {
    lines.push(`- **${t('explainability.indicators')}**: ${t('evidencePack.notAvailable')}`)
  }

  if (explanation.hasEvidence) {
    lines.push(`- **${t('explainability.evidenceSnippet')}**: \`${explanation.evidenceSnippet}\``)
    if (explanation.evidenceTruncated) {
      lines.push(`  - _${t('explainability.evidenceTruncated')}_`)
    }
  } else {
    lines.push(`- **${t('explainability.evidenceSnippet')}**: ${t('evidencePack.notAvailable')}`)
  }

  lines.push(`- **${t('explainability.recommendedAction')}**: ${valueOrFallback(rendered.recommendedAction)}`)

  lines.push(`- **${t('explainability.relatedEntities')}**:`)
  appendRelatedEntities(lines, explanation.relatedEntities)
}

export function buildEvidencePackMarkdown(analysisResult, options = {}) {
  if (!analysisResult) return ''

  const language = options.language || currentLanguage.value || 'zh'
  const caseId = options.caseId || 'current-analysis'
  const caseRecord = options.caseRecord ?? getCase(caseId)
  const triageState = options.triageState ?? getTriageState(caseId)
  const analysis = language === 'zh'
    ? localizeAnalysisForDisplay(analysisResult, language)
    : analysisResult

  const summary = analysis.summary || {}
  const executiveSummary = analysis.executive_summary || null
  const findings = Array.isArray(analysis.findings) ? analysis.findings : []
  const incidents = Array.isArray(analysis.incidents) ? analysis.incidents : []
  const timelineEvents = Array.isArray(analysis.timeline_events) ? analysis.timeline_events : []
  const ruleCoverage = Array.isArray(analysis.rule_coverage) ? analysis.rule_coverage : []
  const parseStats = analysis.parse_stats || {}
  const sourceFiles = Array.isArray(parseStats.source_files)
    ? parseStats.source_files
    : (Array.isArray(analysis.source_files) ? analysis.source_files : [])
  const triageEntries = Object.values(triageState || {})
  const generatedAt = formatTimestamp(new Date().toISOString(), language)

  const statusCounts = {}
  const priorityCounts = {}
  triageEntries.forEach((entry) => {
    if (entry?.status) {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1
    }
    if (entry?.priority) {
      priorityCounts[entry.priority] = (priorityCounts[entry.priority] || 0) + 1
    }
  })

  const matchedRules = ruleCoverage.filter((item) => item.triggered)
  const unmatchedRules = ruleCoverage.filter((item) => !item.triggered)

  const lines = []

  lines.push(`# ${t('evidencePack.title')}`, '')
  lines.push(`- **${t('evidencePack.generatedAt')}**: ${generatedAt}`)
  lines.push(`- **${t('evidencePack.caseId')}**: ${caseId}`)
  lines.push(`- **${t('evidencePack.analysisMode')}**: ${valueOrFallback(analysis.analysis_mode || caseRecord?.analysis_mode)}`, '')

  lines.push(`## ${t('evidencePack.severitySummary')}`, '')
  appendTable(lines, [t('evidencePack.metric'), t('evidencePack.value')], [
    [t('executive.overallRiskLevel'), executiveSummary ? translateRiskLevel(executiveSummary.overall_risk_level).toUpperCase() : t('evidencePack.notAvailable')],
    [t('evidencePack.riskScore'), executiveSummary?.risk_score ?? summary.risk_score ?? t('evidencePack.notAvailable')],
    [t('findings.title'), findings.length],
    [t('incidents.title'), incidents.length],
    [t('summary.totalRequests'), summary.total_requests ?? t('evidencePack.notAvailable')],
    [t('summary.uniqueIps'), summary.unique_ips ?? t('evidencePack.notAvailable')],
    [t('summary.total4xx'), summary.total_4xx ?? t('evidencePack.notAvailable')],
    [t('summary.total5xx'), summary.total_5xx ?? t('evidencePack.notAvailable')]
  ])
  appendSeverityCounts(lines, t('distribution.findingSeverity'), summary.finding_severity_counts || {})
  appendSeverityCounts(lines, t('distribution.incidentSeverity'), summary.incident_severity_counts || {})

  lines.push(`## ${t('evidencePack.executiveSummary')}`, '')
  if (executiveSummary) {
    lines.push(`### ${valueOrFallback(executiveSummary.headline)}`, '')
    lines.push(`- **${t('executive.overallRiskLevel')}**: ${translateRiskLevel(executiveSummary.overall_risk_level).toUpperCase()}`)
    lines.push(`- **${t('evidencePack.riskScore')}**: ${valueOrFallback(executiveSummary.risk_score)}`)
    lines.push(`- **${t('common.description')}**: ${valueOrFallback(executiveSummary.overview)}`, '')

    lines.push(`#### ${t('executive.keyMetrics')}`, '')
    if (Array.isArray(executiveSummary.key_metrics) && executiveSummary.key_metrics.length > 0) {
      executiveSummary.key_metrics.forEach((metric) => lines.push(`- ${metric}`))
      lines.push('')
    } else {
      appendFallback(lines)
    }
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.caseMetadata')}`, '')
  if (caseRecord) {
    lines.push(`- **${t('workspace.caseTitle')}**: ${valueOrFallback(caseRecord.title)}`)
    lines.push(`- **${t('evidencePack.sourceName')}**: ${valueOrFallback(caseRecord.source_name)}`)
    lines.push(`- **${t('workspace.tags')}**: ${Array.isArray(caseRecord.tags) && caseRecord.tags.length > 0 ? caseRecord.tags.join(', ') : t('evidencePack.notAvailable')}`)
    lines.push(`- **${t('workspace.notes')}**: ${valueOrFallback(caseRecord.notes)}`)
    lines.push(`- **${t('evidencePack.createdAt')}**: ${formatTimestamp(caseRecord.created_at, language)}`)
    lines.push(`- **${t('evidencePack.updatedAt')}**: ${formatTimestamp(caseRecord.updated_at, language)}`, '')
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.parseStats')}`, '')
  appendTable(lines, [t('evidencePack.metric'), t('evidencePack.value')], [
    [t('parse.totalLines'), parseStats.total_lines ?? t('evidencePack.notAvailable')],
    [t('parse.parsed'), parseStats.parsed_lines ?? t('evidencePack.notAvailable')],
    [t('parse.skipped'), parseStats.skipped_lines ?? t('evidencePack.notAvailable')],
    [t('parse.parseRate'), formatPercent(parseStats.parse_rate)],
    [t('parse.detectedFormat'), parseStats.detected_format ?? t('evidencePack.notAvailable')],
    [t('parse.requested'), parseStats.requested_format ?? t('evidencePack.notAvailable')]
  ])

  lines.push(`### ${t('evidencePack.sourceFiles')}`, '')
  if (sourceFiles.length > 0) {
    appendTable(lines, [
      t('parse.filename'),
      t('parse.totalLines'),
      t('parse.parsedLines'),
      t('parse.skippedLines'),
      t('parse.parseRate'),
      t('parse.detectedFormat')
    ], sourceFiles.map((file) => [
      file.filename,
      file.total_lines,
      file.parsed_lines,
      file.skipped_lines,
      formatPercent(file.parse_rate),
      file.detected_format
    ]))
  } else {
    appendFallback(lines)
  }

  appendInvestigationEntities(lines, analysisResult, language)

  lines.push(`## ${t('evidencePack.detectionExplainability')}`, '')
  lines.push(`> ${t('evidencePack.detectionExplainabilityIntro')}`, '')
  if (findings.length === 0) {
    appendFallback(lines)
  } else {
    findings.forEach((finding, index) => {
      lines.push(`### ${valueOrFallback(finding.title)} (${valueOrFallback(finding.rule_id)})`, '')
      appendFindingExplanation(lines, finding, analysisResult)
      if (index < findings.length - 1) {
        lines.push('')
      }
    })
    lines.push('')
  }

  lines.push(`## ${t('evidencePack.timelineHighlights')}`, '')
  if (timelineEvents.length > 0) {
    timelineEvents.slice(0, 10).forEach((event) => {
      lines.push(`### [${valueOrFallback(event.timestamp)}] ${valueOrFallback(event.title)}`, '')
      lines.push(`- **${t('common.severity')}**: ${event.severity ? translateSeverity(event.severity).toUpperCase() : t('evidencePack.notAvailable')}`)
      lines.push(`- **${t('common.sourceIp')}**: ${valueOrFallback(event.source_ip)}`)
      lines.push(`- **${t('common.description')}**: ${valueOrFallback(event.description)}`)
      lines.push(`- **${t('common.evidence')}**: ${valueOrFallback(event.evidence)}`, '')
    })
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.findingsList')}`, '')
  if (findings.length > 0) {
    findings.forEach((finding) => {
      lines.push(`### ${valueOrFallback(finding.title)} (${valueOrFallback(finding.rule_id)})`, '')
      lines.push(`- **${t('common.severity')}**: ${finding.severity ? translateSeverity(finding.severity).toUpperCase() : t('evidencePack.notAvailable')}`)
      lines.push(`- **${t('common.description')}**: ${valueOrFallback(finding.description)}`)
      lines.push(`- **${t('common.recommendation')}**: ${valueOrFallback(finding.recommendation)}`)
      lines.push(`- **${t('common.count')}**: ${valueOrFallback(finding.matched_count)}`)
      lines.push(`- **${t('findings.fields')}**: ${listOrFallback(finding.matched_fields)}`)
      lines.push(`- **${t('findings.values')}**: ${listOrFallback(finding.matched_values)}`)
      appendEvidenceList(lines, finding.evidence)
      appendTriageDetails(lines, resolveFindingTriage(finding, triageState), language)
    })
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.incidentsList')}`, '')
  if (incidents.length > 0) {
    incidents.forEach((incident) => {
      lines.push(`### ${valueOrFallback(incident.title)} (${valueOrFallback(incident.incident_id || incident.id)})`, '')
      lines.push(`- **${t('common.severity')}**: ${incident.severity ? translateSeverity(incident.severity).toUpperCase() : t('evidencePack.notAvailable')}`)
      lines.push(`- **${t('common.sourceIp')}**: ${valueOrFallback(incident.source_ip)}`)
      lines.push(`- **${t('common.confidence')}**: ${incident.confidence ? translateRiskLevel(incident.confidence).toUpperCase() : t('evidencePack.notAvailable')}`)
      lines.push(`- **${t('common.description')}**: ${valueOrFallback(incident.summary)}`)
      lines.push(`- **${t('incidents.rulesInvolved')}**: ${listOrFallback(incident.related_rule_ids)}`)
      lines.push(`- **${t('incidents.recommendedActions')}**: ${listOrFallback(incident.recommendations, '; ')}`)
      appendEvidenceList(lines, incident.evidence)
      appendTriageDetails(lines, resolveIncidentTriage(incident, triageState), language)
    })
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.ruleCoverage')}`, '')
  lines.push(`### ${t('evidencePack.matchedRules')}`, '')
  if (matchedRules.length > 0) {
    appendTable(lines, [
      t('common.rule'),
      t('common.severity'),
      t('evidencePack.enabled'),
      t('ruleCoverage.findings'),
      t('ruleCoverage.incidents'),
      t('ruleCoverage.explanation')
    ], matchedRules.map((rule) => [
      rule.title || rule.rule_id,
      rule.severity ? translateSeverity(rule.severity).toUpperCase() : t('evidencePack.notAvailable'),
      rule.enabled ? t('evidencePack.yes') : t('evidencePack.no'),
      rule.finding_count ?? 0,
      rule.incident_count ?? 0,
      rule.explanation || rule.description
    ]))
  } else {
    appendFallback(lines)
  }

  lines.push(`### ${t('evidencePack.unmatchedRules')}`, '')
  if (unmatchedRules.length > 0) {
    unmatchedRules.forEach((rule) => {
      lines.push(`- ${valueOrFallback(rule.title || rule.rule_id)} (${valueOrFallback(rule.rule_id)})`)
    })
    lines.push('')
  } else {
    appendFallback(lines)
  }

  lines.push(`## ${t('evidencePack.triageSummary')}`, '')
  if (triageEntries.length > 0) {
    lines.push(`- **${t('evidencePack.totalTriagedItems')}**: ${triageEntries.length}`, '')

    lines.push(`### ${t('evidencePack.statusDistribution')}`, '')
    if (Object.keys(statusCounts).length > 0) {
      Object.entries(statusCounts).forEach(([status, count]) => {
        lines.push(`- ${t(`triage.${status}`, status)}: ${count}`)
      })
      lines.push('')
    } else {
      appendFallback(lines)
    }

    lines.push(`### ${t('evidencePack.priorityDistribution')}`, '')
    if (Object.keys(priorityCounts).length > 0) {
      Object.entries(priorityCounts).forEach(([priority, count]) => {
        lines.push(`- ${t(`triage.${priority}`, priority)}: ${count}`)
      })
      lines.push('')
    } else {
      appendFallback(lines)
    }
  } else {
    appendFallback(lines)
  }

  return lines.join('\n')
}

export function downloadEvidencePack(analysisResult, options = {}) {
  if (!analysisResult) return

  const content = buildEvidencePackMarkdown(analysisResult, options)
  const dateStr = new Date().toISOString().split('T')[0]
  downloadTextFile(`analyst_evidence_pack_${dateStr}.md`, content, 'text/markdown')
}
