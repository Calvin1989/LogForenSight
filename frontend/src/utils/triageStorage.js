const STORAGE_KEY_PREFIX = 'LogForenSight:triage:v1:';
const TRIAGE_STATUS_COUNTS_TEMPLATE = {
  open: 0,
  investigating: 0,
  mitigated: 0,
  false_positive: 0
};

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
 * Returns a stable triage status summary object.
 * @param {Object} triageState
 * @returns {{open:number, investigating:number, mitigated:number, false_positive:number}}
 */
export function getTriageStatusCounts(triageState) {
  const counts = { ...TRIAGE_STATUS_COUNTS_TEMPLATE };
  Object.values(triageState || {}).forEach((data) => {
    if (data && counts[data.status] !== undefined) {
      counts[data.status] += 1;
    }
  });
  return counts;
}

/**
 * Returns the canonical update timestamp field without changing stored data.
 * @param {Object} triageItem
 * @returns {string}
 */
export function getTriageItemUpdatedAt(triageItem) {
  return triageItem?.updated_at || triageItem?.updatedAt || '';
}

/**
 * Determines whether an item still needs analyst review.
 * @param {Object} triageItem
 * @returns {boolean}
 */
export function needsTriageReview(triageItem) {
  return !triageItem?.status || triageItem.status === 'open';
}

/**
 * Replaces the entire triage state for a specific case.
 * @param {string} caseId
 * @param {Object} triageState
 * @returns {Object}
 */
export function setTriageState(caseId, triageState) {
  const key = STORAGE_KEY_PREFIX + caseId;
  const safeState = triageState && typeof triageState === 'object' ? triageState : {};
  localStorage.setItem(key, JSON.stringify(safeState));
  return safeState;
}

/**
 * Copies triage state from one case id to another.
 * @param {string} fromCaseId
 * @param {string} toCaseId
 * @returns {Object}
 */
export function copyTriageState(fromCaseId, toCaseId) {
  const sourceState = getTriageState(fromCaseId);
  return setTriageState(toCaseId, sourceState);
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
