// Use relative paths to support both Vite proxy and Nginx proxy
const API_ENDPOINTS = {
  ANALYZE: '/api/analyze',
  ANALYZE_TUNED: '/api/analyze/tuned',
  ANALYZE_SANITIZED: '/api/analyze/sanitized',
  RULES: '/api/rules'
};

/**
 * Sends a log file to the backend for security analysis.
 * 
 * @param {File} file - The .log or .txt file to analyze.
 * @param {string} logFormat - The format of the log ("auto", "nginx", "apache").
 * @returns {Promise<Object>} - The AnalysisResult from the backend.
 * @throws {Error} - If the analysis fails or the file is invalid.
 */
export async function analyzeLogFile(file, logFormat = 'auto') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('log_format', logFormat);

  const response = await fetch(API_ENDPOINTS.ANALYZE, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    // Return the detail error message from FastAPI
    throw new Error(data.detail || 'Analysis failed');
  }

  return data;
}

/**
 * Sends a log file to the backend for security analysis with rule overrides.
 *
 * @param {File} file - The .log or .txt file to analyze.
 * @param {string} logFormat - The format of the log ("auto", "nginx", "apache").
 * @param {Object} overrides - Rule tuning overrides.
 * @returns {Promise<Object>} - The RuleTuningPreviewResponse from the backend.
 */
export async function analyzeLogWithTuning(file, logFormat = 'auto', overrides = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('log_format', logFormat);
  formData.append('overrides_json', JSON.stringify(overrides));

  const response = await fetch(API_ENDPOINTS.ANALYZE_TUNED, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Tuned analysis failed');
  }

  return data;
}

/**
 * Fetches the current active security detection rules from the backend.
 * 
 * @returns {Promise<Object>} - The RuleConfigResponse from the backend.
 */
export async function fetchRuleConfig() {
  const response = await fetch(API_ENDPOINTS.RULES);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch rules');
  }

  return data;
}

/**
 * Sends a log file to the backend for sanitized security analysis.
 * 
 * @param {File} file - The .log or .txt file to analyze.
 * @param {string} logFormat - The format of the log ("auto", "nginx", "apache").
 * @returns {Promise<Object>} - The Sanitized AnalysisResult from the backend.
 */
export async function analyzeLogFileSanitized(file, logFormat = 'auto') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('log_format', logFormat);

  const response = await fetch(API_ENDPOINTS.ANALYZE_SANITIZED, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Sanitized analysis failed');
  }

  return data;
}
