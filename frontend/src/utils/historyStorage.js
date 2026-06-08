const STORAGE_KEY = 'ai_log_security_analyzer_recent_analyses';
const MAX_RECORDS = 5;

/**
 * Retrieves the list of recent analyses from localStorage.
 * 
 * @returns {Array} - Array of analysis records.
 */
export function getRecentAnalyses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid history format');
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse history storage, clearing corrupted data.', err);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Saves a new analysis record to localStorage.
 * Keeps only the most recent 5 records.
 * 
 * @param {Object} record - The analysis record to save.
 * @returns {Array} - The updated list of records.
 */
export function saveAnalysisRecord(record) {
  const history = getRecentAnalyses();
  
  // Add new record to the beginning
  const updated = [record, ...history];
  
  // Limit to MAX_RECORDS
  const limited = updated.slice(0, MAX_RECORDS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  return limited;
}

/**
 * Updates an existing analysis record in localStorage.
 * 
 * @param {string} recordId - The ID of the record to update.
 * @param {Object} patch - The fields to update.
 * @returns {Array} - The updated list of records.
 */
export function updateAnalysisRecord(recordId, patch) {
  const history = getRecentAnalyses();
  const index = history.findIndex(r => r.id === recordId);
  
  if (index === -1) return history;
  
  const updatedRecord = { ...history[index], ...patch };
  history[index] = updatedRecord;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

/**
 * Clears all analysis history from localStorage.
 */
export function clearRecentAnalyses() {
  localStorage.removeItem(STORAGE_KEY);
}
