import { t, translateSeverity, translateRiskLevel } from '../i18n'
import { localizeFinding, localizeIncident } from './localizedAnalysis'

/**
 * Utility functions for comparing two analysis results.
 */

/**
 * Compares two analysis results and generates a structured comparison report.
 *
 * @param {Object} base - The baseline analysis result.
 * @param {Object} target - The target analysis result to compare against the baseline.
 * @param {Object} options - Options including language.
 * @returns {Object} - The comparison report.
 */
export function compareAnalyses(base, target, options = { language: 'zh' }) {
  // Graceful handling of missing data
  const baseResult = base?.result || base || {};
  const targetResult = target?.result || target || {};

  const baseSummary = baseResult.summary || {};
  const targetSummary = targetResult.summary || {};
  const baseExec = baseResult.executive_summary || {};
  const targetExec = targetResult.executive_summary || {};
  const baseParse = baseResult.parse_stats || {};
  const targetParse = targetResult.parse_stats || {};

  const baseFindings = baseResult.findings || [];
  const targetFindings = targetResult.findings || [];
  const baseIncidents = baseResult.incidents || [];
  const targetIncidents = targetResult.incidents || [];
  const baseTimeline = baseResult.timeline_events || [];
  const targetTimeline = targetResult.timeline_events || [];

  // 1. Summary deltas
  const riskScoreDelta = (targetExec.risk_score || 0) - (baseExec.risk_score || 0);
  const totalFindingsDelta = targetFindings.length - baseFindings.length;
  const totalIncidentsDelta = targetIncidents.length - baseIncidents.length;
  const timelineEventsDelta = targetTimeline.length - baseTimeline.length;
  const parseRateDelta = (targetParse.parse_rate || 0) - (baseParse.parse_rate || 0);

  // 2. Severity changes (Findings + Incidents)
  const severities = ['critical', 'high', 'medium', 'low', 'info', 'informational'];
  const severityChanges = severities.map(sev => {
    const baseCount = (baseSummary.finding_severity_counts?.[sev] || 0) + (baseSummary.incident_severity_counts?.[sev] || 0);
    const targetCount = (targetSummary.finding_severity_counts?.[sev] || 0) + (targetSummary.incident_severity_counts?.[sev] || 0);
    return {
      severity: sev,
      baseCount,
      targetCount,
      delta: targetCount - baseCount
    };
  }).filter(s => s.baseCount > 0 || s.targetCount > 0);

  // 3. Finding Identity & Changes
  const getFindingId = (f) => {
    const primaryEvidence = f.evidence?.[0] || f.matched_values?.[0] || '';
    return `${f.rule_id}|${f.severity}|${f.title}|${primaryEvidence}`.toLowerCase();
  };

  const baseFindingIds = new Set(baseFindings.map(getFindingId));
  const targetFindingIds = new Set(targetFindings.map(getFindingId));

  const findingChanges = {
    added: targetFindings.filter(f => !baseFindingIds.has(getFindingId(f))),
    removed: baseFindings.filter(f => !targetFindingIds.has(getFindingId(f))),
    unchanged: targetFindings.filter(f => baseFindingIds.has(getFindingId(f)))
  };

  // 4. Incident Identity & Changes
  const getIncidentId = (inc) => {
    if (inc.incident_id && !inc.incident_id.startsWith('temp_')) {
      return inc.incident_id;
    }
    return `${inc.title}|${inc.severity}|${inc.source_ip}`.toLowerCase();
  };

  const baseIncidentIds = new Set(baseIncidents.map(getIncidentId));
  const targetIncidentIds = new Set(targetIncidents.map(getIncidentId));

  const incidentChanges = {
    added: targetIncidents.filter(inc => !baseIncidentIds.has(getIncidentId(inc))),
    removed: baseIncidents.filter(inc => !targetIncidentIds.has(getIncidentId(inc))),
    unchanged: targetIncidents.filter(inc => baseIncidentIds.has(getIncidentId(inc)))
  };

  // 5. Top IP / Path changes
  const baseTopIps = baseSummary.top_ips || [];
  const targetTopIps = targetSummary.top_ips || [];
  const ipMap = new Map();
  baseTopIps.forEach(item => ipMap.set(item.ip, { baseCount: item.count, targetCount: 0 }));
  targetTopIps.forEach(item => {
    if (ipMap.has(item.ip)) {
      ipMap.get(item.ip).targetCount = item.count;
    } else {
      ipMap.set(item.ip, { baseCount: 0, targetCount: item.count });
    }
  });
  const topIpChanges = Array.from(ipMap.entries()).map(([ip, counts]) => ({
    ip,
    ...counts,
    delta: counts.targetCount - counts.baseCount
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10);

  const baseTopPaths = baseSummary.top_paths || [];
  const targetTopPaths = targetSummary.top_paths || [];
  const pathMap = new Map();
  baseTopPaths.forEach(item => pathMap.set(item.path, { baseCount: item.count, targetCount: 0 }));
  targetTopPaths.forEach(item => {
    if (pathMap.has(item.path)) {
      pathMap.get(item.path).targetCount = item.count;
    } else {
      pathMap.set(item.path, { baseCount: 0, targetCount: item.count });
    }
  });
  const topPathChanges = Array.from(pathMap.entries()).map(([path, counts]) => ({
    path,
    ...counts,
    delta: counts.targetCount - counts.baseCount
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10);

  // 6. Narrative summary
  const headline = riskScoreDelta > 0
    ? t('comparison.riskUp')
    : (riskScoreDelta < 0 ? t('comparison.riskDown') : t('comparison.riskStable'));

  let riskLevelChange = t('comparison.noChanges');
  if (baseExec.overall_risk_level !== targetExec.overall_risk_level) {
    const from = translateRiskLevel(baseExec.overall_risk_level) || 'Unknown';
    const to = translateRiskLevel(targetExec.overall_risk_level) || 'Unknown';
    riskLevelChange = options.language === 'zh' ? `从 ${from} 变为 ${to}` : `Changed from ${from} to ${to}`;
  }

  const keyChanges = [];
  if (riskScoreDelta !== 0) {
    keyChanges.push(t('comparison.scoreChange').replace('{delta}', riskScoreDelta));
  }
  if (findingChanges.added.length > 0) {
    keyChanges.push(t('comparison.findingsAdded').replace('{count}', findingChanges.added.length));
  }
  if (incidentChanges.added.length > 0) {
    keyChanges.push(t('comparison.incidentsAdded').replace('{count}', incidentChanges.added.length));
  }
  if (findingChanges.removed.length > 0) {
    keyChanges.push(t('comparison.findingsRemoved').replace('{count}', findingChanges.removed.length));
  }

  const recommendedActions = targetExec.recommended_next_steps || (
    options.language === 'zh'
      ? ['继续监控日志内容', '复核新增的风险点', '检查高频访问的 IP']
      : ['Continue monitoring log content', 'Review new findings', 'Check high frequency IPs']
  );

  return {
    summary: {
      baseLabel: base.label || base.filename || (options.language === 'zh' ? '基准报告' : 'Baseline'),
      targetLabel: target.label || target.filename || (options.language === 'zh' ? '目标报告' : 'Target'),
      riskScoreDelta,
      riskLevelChange,
      totalFindingsDelta,
      totalIncidentsDelta,
      timelineEventsDelta,
      parseRateDelta
    },
    severityChanges,
    findingChanges: {
      added: findingChanges.added.map(f => ({ rule_id: f.rule_id, title: localizeFinding(f, options.language).title, severity: f.severity })),
      removed: findingChanges.removed.map(f => ({ rule_id: f.rule_id, title: localizeFinding(f, options.language).title, severity: f.severity })),
      unchanged: findingChanges.unchanged.map(f => ({ rule_id: f.rule_id, title: localizeFinding(f, options.language).title, severity: f.severity }))
    },
    incidentChanges: {
      added: incidentChanges.added.map(inc => ({ title: localizeIncident(inc, options.language).title, severity: inc.severity, source_ip: inc.source_ip })),
      removed: incidentChanges.removed.map(inc => ({ title: localizeIncident(inc, options.language).title, severity: inc.severity, source_ip: inc.source_ip })),
      unchanged: incidentChanges.unchanged.map(inc => ({ title: localizeIncident(inc, options.language).title, severity: inc.severity, source_ip: inc.source_ip }))
    },
    topIpChanges,
    topPathChanges,
    narrative: {
      headline,
      overview: t('comparison.overview')
        .replace('{action}', riskScoreDelta >= 0 ? t('comparison.increased') : t('comparison.decreased'))
        .replace('{delta}', Math.abs(riskScoreDelta)),
      keyChanges: keyChanges.join(' '),
      recommendedActions
    }
  };
}

/**
 * Generates a Markdown report for the comparison.
 *
 * @param {Object} comparison - The comparison result from compareAnalyses.
 * @param {Object} options - Options including language.
 * @returns {string} - The Markdown content.
 */
export function generateComparisonMarkdown(comparison, options = { language: 'zh' }) {
  const { summary, severityChanges, findingChanges, incidentChanges, narrative } = comparison;

  let md = `# ${t('comparison.mdTitle')}\n\n`;
  md += `## ${t('comparison.mdOverview')}\n\n`;
  md += `- **${t('comparison.baseline')}**: ${summary.baseLabel}\n`;
  md += `- **${t('comparison.target')}**: ${summary.targetLabel}\n`;
  md += `- **${t('comparison.riskScoreDelta')}**: ${narrative.headline}\n`;
  md += `- **${t('executive.overallRiskLevel')}**: ${summary.riskLevelChange}\n`;
  md += `- **${t('comparison.riskScoreDelta')}**: ${summary.riskScoreDelta > 0 ? '+' : ''}${summary.riskScoreDelta}\n\n`;

  md += `## ${t('comparison.mdMetrics')}\n\n`;
  md += `| ${t('common.fields')} | ${t('comparison.baseline')} | ${t('comparison.target')} | ${t('comparison.riskScoreDelta')} |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| ${t('comparison.riskScoreDelta')} | - | - | ${summary.riskScoreDelta} |\n`;
  md += `| ${t('comparison.findingsDelta')} | - | - | ${summary.totalFindingsDelta} |\n`;
  md += `| ${t('comparison.incidentsDelta')} | - | - | ${summary.totalIncidentsDelta} |\n`;
  md += `| ${t('timeline.title')} | - | - | ${summary.timelineEventsDelta} |\n`;
  md += `| ${t('parse.title')} | - | - | ${summary.parseRateDelta.toFixed(2)}% |\n\n`;

  md += `## ${t('comparison.mdSeverity')}\n\n`;
  md += `| ${t('common.severity')} | ${t('comparison.baseline')} | ${t('comparison.target')} | ${t('comparison.riskScoreDelta')} |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  severityChanges.forEach(s => {
    md += `| ${translateSeverity(s.severity).toUpperCase()} | ${s.baseCount} | ${s.targetCount} | ${s.delta > 0 ? '+' : ''}${s.delta} |\n`;
  });
  md += `\n`;

  md += `## ${t('comparison.mdFindings')}\n\n`;
  if (findingChanges.added.length > 0) {
    md += `### ${t('comparison.added')}\n`;
    findingChanges.added.forEach(f => md += `- [${translateSeverity(f.severity).toUpperCase()}] ${f.title} (${f.rule_id})\n`);
    md += `\n`;
  }
  if (findingChanges.removed.length > 0) {
    md += `### ${t('comparison.removed')}\n`;
    findingChanges.removed.forEach(f => md += `- [${translateSeverity(f.severity).toUpperCase()}] ${f.title} (${f.rule_id})\n`);
    md += `\n`;
  }

  md += `## ${t('comparison.mdIncidents')}\n\n`;
  if (incidentChanges.added.length > 0) {
    md += `### ${t('comparison.added')}\n`;
    incidentChanges.added.forEach(inc => md += `- [${translateSeverity(inc.severity).toUpperCase()}] ${inc.title} (IP: ${inc.source_ip})\n`);
    md += `\n`;
  }
  if (incidentChanges.removed.length > 0) {
    md += `### ${t('comparison.removed')}\n`;
    incidentChanges.removed.forEach(inc => md += `- [${translateSeverity(inc.severity).toUpperCase()}] ${inc.title} (IP: ${inc.source_ip})\n`);
    md += `\n`;
  }

  md += `## ${t('comparison.mdConclusion')}\n\n`;
  md += `### ${t('comparison.mdConclusionSummary')}\n${narrative.keyChanges}\n\n`;
  md += `### ${t('comparison.mdActions')}\n`;
  narrative.recommendedActions.forEach(action => md += `- ${action}\n`);

  md += `\n\n---\n*${t('comparison.mdGeneratedAt')}: ${new Date().toLocaleString()} (Local-first Analysis Comparison)*\n`;

  return md;
}
