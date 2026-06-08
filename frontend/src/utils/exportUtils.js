/**
 * Utility functions for exporting data to JSON and CSV formats.
 */

/**
 * Downloads data as a JSON file.
 * @param {string} filename - The name of the file.
 * @param {object} data - The data to download.
 */
export function downloadJson(filename, data) {
  const content = JSON.stringify(data, null, 2);
  downloadTextFile(filename, content, 'application/json');
}

/**
 * Downloads content as a text file.
 * @param {string} filename - The name of the file.
 * @param {string} content - The content of the file.
 * @param {string} mimeType - The MIME type of the file.
 */
export function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a value for CSV formatting.
 * @param {any} val - The value to escape.
 * @returns {string} - The escaped string.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  
  let str = String(val);
  
  // If value contains comma, double quotes, or newline, wrap in double quotes
  if (/[",\n\r]/.test(str)) {
    // Replace " with ""
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  
  return str;
}

/**
 * Converts an array of incident objects to a CSV string.
 * @param {Array} incidents - The incidents to convert.
 * @returns {string} - The CSV content.
 */
export function convertIncidentsToCsv(incidents) {
  if (!incidents || incidents.length === 0) return '';

  const headers = [
    'incident_id', 'title', 'severity', 'source_ip', 
    'confidence', 'summary', 'related_rule_ids', 'recommendations'
  ];

  const rows = incidents.map(inc => [
    inc.incident_id,
    inc.title,
    inc.severity,
    inc.source_ip,
    inc.confidence,
    inc.summary,
    (inc.related_rule_ids || []).join('; '),
    (inc.recommendations || []).join('; ')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Converts an array of finding objects to a CSV string.
 * @param {Array} findings - The findings to convert.
 * @returns {string} - The CSV content.
 */
export function convertFindingsToCsv(findings) {
  if (!findings || findings.length === 0) return '';

  const headers = [
    'rule_id', 'title', 'severity', 'description', 
    'matched_count', 'matched_fields', 'matched_values', 'recommendation'
  ];

  const rows = findings.map(f => [
    f.rule_id,
    f.title,
    f.severity,
    f.description,
    f.matched_count,
    (f.matched_fields || []).join('; '),
    (f.matched_values || []).join('; '),
    f.recommendation
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Builds a summary object for export, excluding full evidence lists from findings.
 * @param {object} result - The full analysis result.
 * @returns {object} - The summary object for export.
 */
export function buildAnalysisSummaryExport(result) {
  if (!result) return null;

  return {
    summary: result.summary,
    parse_stats: result.parse_stats,
    finding_severity_counts: result.summary.finding_severity_counts || {},
    incident_severity_counts: result.summary.incident_severity_counts || {},
    executive_summary: result.executive_summary || null,
    incident_count: (result.incidents || []).length,
    finding_count: (result.findings || []).length,
    exported_at: new Date().toISOString()
  };
}
