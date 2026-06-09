const STORAGE_KEY = 'ai-log-security-analyzer:case-workspace:v1';

/**
 * Validates that a case record does not contain any File objects or raw log content.
 * @param {Object} caseRecord
 */
function validateCaseRecord(caseRecord) {
  const check = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (obj[key] instanceof File || obj[key] instanceof Blob) {
        throw new Error(`Case record contains non-serializable object at key: ${key}`);
      }
      if (typeof obj[key] === 'object') {
        check(obj[key]);
      }
    }
  };
  check(caseRecord);
}

/**
 * Retrieves all cases from localStorage.
 * @returns {Array}
 */
export function listCases() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse case workspace storage:', err);
    return [];
  }
}

/**
 * Gets a single case by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getCase(id) {
  const cases = listCases();
  return cases.find(c => c.id === id) || null;
}

/**
 * Saves a case record to localStorage.
 * @param {Object} caseRecord
 */
export function saveCase(caseRecord) {
  validateCaseRecord(caseRecord);
  const cases = listCases();
  const index = cases.findIndex(c => c.id === caseRecord.id);

  const now = new Date().toISOString();
  const recordToSave = {
    ...caseRecord,
    updated_at: now,
    created_at: caseRecord.created_at || now,
  };

  if (index !== -1) {
    cases[index] = recordToSave;
  } else {
    cases.unshift(recordToSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  return recordToSave;
}

/**
 * Deletes a case by ID.
 * @param {string} id
 */
export function deleteCase(id) {
  const cases = listCases();
  const filtered = cases.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clears all cases.
 */
export function clearCases() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exports all cases as a JSON string.
 * @returns {string}
 */
export function exportCases() {
  const cases = listCases();
  return JSON.stringify(cases, null, 2);
}

/**
 * Imports cases from an array.
 * @param {Array} casesToImport
 */
export function importCases(casesToImport) {
  if (!Array.isArray(casesToImport)) {
    throw new Error('Import data must be an array');
  }
  
  const existingCases = listCases();
  const existingIds = new Set(existingCases.map(c => c.id));
  
  const newCases = casesToImport.filter(c => c && c.id && !existingIds.has(c.id));
  const updatedCases = [...newCases, ...existingCases];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases));
  return updatedCases;
}
