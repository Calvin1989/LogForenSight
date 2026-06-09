const STORAGE_KEY_PREFIX = 'ai-log-security-analyzer:triage:v1:';

/**
 * Retrieves the triage state for a specific case.
 * @param {string} caseId 
 * @returns {Object} - Map of itemKey -> triageData
 */
export function getTriageState(caseId) {
  const key = STORAGE_KEY_PREFIX + caseId;
  const stored = localStorage.getItem(key);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error(`Failed to parse triage storage for case ${caseId}:`, err);
    return {};
  }
}

/**
 * Saves a triage item for a specific case.
 * @param {string} caseId 
 * @param {string} itemKey - e.g. "finding:rule_id" or "incident:id"
 * @param {Object} triageData - { status, priority, notes, updated_at }
 */
export function saveTriageItem(caseId, itemKey, triageData) {
  const state = getTriageState(caseId);
  state[itemKey] = {
    ...triageData,
    updated_at: new Date().toISOString()
  };
  const key = STORAGE_KEY_PREFIX + caseId;
  localStorage.setItem(key, JSON.stringify(state));
  return state;
}

/**
 * Lists all triage items for a specific case.
 * @param {string} caseId 
 * @returns {Array} - Array of { key, ...triageData }
 */
export function listTriageItems(caseId) {
  const state = getTriageState(caseId);
  return Object.entries(state).map(([key, data]) => ({
    key,
    ...data
  }));
}

/**
 * Deletes a triage item for a specific case.
 * @param {string} caseId 
 * @param {string} itemKey 
 */
export function deleteTriageItem(caseId, itemKey) {
  const state = getTriageState(caseId);
  if (state[itemKey]) {
    delete state[itemKey];
    const key = STORAGE_KEY_PREFIX + caseId;
    localStorage.setItem(key, JSON.stringify(state));
  }
  return state;
}

/**
 * Clears the triage state for a specific case.
 * @param {string} caseId 
 */
export function clearTriageState(caseId) {
  const key = STORAGE_KEY_PREFIX + caseId;
  localStorage.removeItem(key);
}

/**
 * Exports the triage summary as Markdown.
 * @param {string} caseId 
 * @param {Object} analysisResult 
 * @param {Object} triageState 
 * @returns {string} - Markdown string
 */
export function exportTriageSummary(caseId, analysisResult, triageState) {
  const now = new Date().toLocaleString();
  const caseTitle = analysisResult?.title || caseId;
  
  let md = `# Analyst Triage Summary\n\n`;
  md += `- **Case ID**: ${caseId}\n`;
  md += `- **Generated At**: ${now}\n\n`;
  
  const items = Object.entries(triageState);
  if (items.length === 0) {
    md += `*No triage items recorded.*\n`;
    return md;
  }
  
  // Stats
  const statusCounts = {};
  const priorityCounts = {};
  items.forEach(([_, data]) => {
    statusCounts[data.status] = (statusCounts[data.status] || 0) + 1;
    priorityCounts[data.priority] = (priorityCounts[data.priority] || 0) + 1;
  });
  
  md += `## Metrics\n\n`;
  md += `### Status Distribution\n`;
  Object.entries(statusCounts).forEach(([s, c]) => md += `- **${s}**: ${c}\n`);
  md += `\n### Priority Distribution\n`;
  Object.entries(priorityCounts).forEach(([p, c]) => md += `- **${p}**: ${c}\n`);
  md += `\n`;
  
  md += `## Triage Details\n\n`;
  md += `| Type | ID/Rule | Status | Priority | Notes | Updated |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  items.forEach(([key, data]) => {
    const [type, id] = key.split(':');
    const notes = data.notes ? data.notes.replace(/\n/g, ' ') : '-';
    md += `| ${type} | ${id} | ${data.status} | ${data.priority} | ${notes} | ${data.updated_at.slice(0, 16)} |\n`;
  });
  
  return md;
}
