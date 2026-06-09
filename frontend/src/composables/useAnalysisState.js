import { ref, onMounted, computed, nextTick } from 'vue'
import {
  analyzeBatchFiles,
  analyzeLogFile,
  analyzeLogFileSanitized,
  fetchRuleConfig,
  analyzeLogWithTuning
} from '../api'
import { getRecentAnalyses, saveAnalysisRecord, updateAnalysisRecord, clearRecentAnalyses } from '../utils/historyStorage'
import * as caseStorage from '../utils/caseWorkspaceStorage'

export const currentAnalysisResult = ref(null)

function normalizeSelectedFiles(fileOrFiles) {
  if (Array.isArray(fileOrFiles)) {
    return fileOrFiles.filter(Boolean)
  }
  return fileOrFiles ? [fileOrFiles] : []
}

function buildAnalysisDisplayName(files) {
  if (files.length <= 1) {
    return files[0]?.name || ''
  }
  return `Batch: ${files[0].name} + ${files.length - 1} more`
}

export function useAnalysisState() {
  const loading = ref(false)
  const result = currentAnalysisResult
  const error = ref(null)
  const selectedFile = ref(null)
  const selectedLogFormat = ref('auto')
  const selectedRecordId = ref(null)
  const sanitizingReport = ref(false)
  const rules = ref(null)
  const rulesError = ref(null)
  const recentAnalyses = ref([])
  const savedCases = ref([])
  const tuningWarnings = ref([])

  onMounted(async () => {
    // Load history
    recentAnalyses.value = getRecentAnalyses()
    // Load cases
    savedCases.value = caseStorage.listCases()
    
    try {
      rules.value = await fetchRuleConfig()
    } catch (err) {
      rulesError.value = err.message
    }
  })

  const handleAnalyze = async (fileOrFiles, logFormat) => {
    const files = normalizeSelectedFiles(fileOrFiles)
    if (files.length === 0) return

    selectedFile.value = files.length === 1 ? files[0] : files
    selectedLogFormat.value = logFormat

    loading.value = true
    error.value = null
    result.value = null

    try {
      let data
      if (files.length === 1) {
        data = await analyzeLogFile(files[0], logFormat)
      } else {
        data = await analyzeBatchFiles(files, { logFormat })
      }
      result.value = data

      // Save to history
      const recordId = Date.now().toString()
      selectedRecordId.value = recordId
      const displayName = buildAnalysisDisplayName(files)
      const analysisMode = data.analysis_mode || (files.length > 1 ? 'batch' : 'single')
      
      const record = {
        id: recordId,
        analyzed_at: new Date().toISOString(),
        file_name: displayName,
        display_name: displayName,
        log_format: logFormat === 'auto' ? data.parse_stats.detected_format : logFormat,
        total_requests: data.summary.total_requests,
        parse_rate: data.parse_stats.parse_rate,
        skipped_lines: data.parse_stats.skipped_lines,
        incidents_count: data.incidents.length,
        findings_count: data.findings.length,
        analysis_mode: analysisMode,
        isBatch: analysisMode === 'batch',
        result: data
      }
      recentAnalyses.value = saveAnalysisRecord(record)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const handleApplyTuning = async (overrides) => {
    if (!selectedFile.value) {
      error.value = "Please upload a log file before tuning rules"
      return
    }

    if (Array.isArray(selectedFile.value) && selectedFile.value.length > 1) {
      error.value = "Rule tuning for multi-file batch analysis is not supported by the current backend."
      return
    }

    loading.value = true
    error.value = null
    tuningWarnings.value = []

    try {
      const data = await analyzeLogWithTuning(selectedFile.value, selectedLogFormat.value, overrides)
      result.value = data.result
      tuningWarnings.value = data.warnings

      // Update history with tuned result (optional, but good for UX)
      if (selectedRecordId.value) {
        recentAnalyses.value = updateAnalysisRecord(selectedRecordId.value, {
          result: data.result,
          is_tuned: true,
          analysis_mode: data.result.analysis_mode || 'single',
          isBatch: (data.result.analysis_mode || 'single') === 'batch'
        })
      }

      // Auto scroll to results
      nextTick(() => {
        const el = document.getElementById('analysis-results') || document.getElementById('rule-coverage')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      })
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const handleResetTuning = () => {
    if (selectedFile.value) {
      handleAnalyze(selectedFile.value, selectedLogFormat.value)
    }
  }

  const handleRestoreRecord = (record) => {
    result.value = record.result
    selectedLogFormat.value = record.log_format
    selectedRecordId.value = record.id
    error.value = null
    loading.value = false
    // Note: record doesn't store the original File object, 
    // so downloading sanitized report might not work for historical records 
    // unless we allow it without the file object or store the log text.
    // For now, we set selectedFile to null to disable sanitized download for history.
    selectedFile.value = null 
  }

  const handleClearHistory = () => {
    clearRecentAnalyses()
    recentAnalyses.value = []
    selectedRecordId.value = null
  }

  const handleSaveCase = (title, notes = '', tags = []) => {
    if (!result.value) return

    const data = result.value
    const analysisMode = data.analysis_mode || (Array.isArray(selectedFile.value) ? 'batch' : 'single')

    const caseRecord = {
      id: Date.now().toString(),
      title: title || (analysisMode === 'batch' ? `Batch Case: ${buildAnalysisDisplayName(selectedFile.value)}` : `Analysis Case: ${selectedFile.value?.name || 'Unknown'}`),
      source_name: buildAnalysisDisplayName(Array.isArray(selectedFile.value) ? selectedFile.value : [selectedFile.value]),
      analysis_mode: analysisMode,
      is_batch: analysisMode === 'batch',
      risk_level: data.executive_summary?.overall_risk_level || 'UNKNOWN',
      risk_score: data.summary?.risk_score || 0,
      total_requests: data.summary?.total_requests || 0,
      unique_ips: data.summary?.unique_ips || 0,
      finding_count: data.findings?.length || 0,
      incident_count: data.incidents?.length || 0,
      high_count: data.summary?.finding_severity_counts?.HIGH || 0,
      medium_count: data.summary?.finding_severity_counts?.MEDIUM || 0,
      low_count: data.summary?.finding_severity_counts?.LOW || 0,
      tags: tags,
      notes: notes,
      result_snapshot: {
        summary: data.summary,
        executive_summary: data.executive_summary,
        parse_stats: data.parse_stats,
        findings: data.findings.slice(0, 50), // Snapshot limit
        incidents: data.incidents.slice(0, 20),
        timeline_events: data.timeline_events?.slice(0, 50),
        rule_coverage: data.rule_coverage
      }
    }

    caseStorage.saveCase(caseRecord)
    savedCases.value = caseStorage.listCases()
    return caseRecord
  }

  const handleRefreshCases = () => {
    savedCases.value = caseStorage.listCases()
  }

  const clearCurrentResult = () => {
    loading.value = false
    result.value = null
    error.value = null
    selectedFile.value = null
    selectedLogFormat.value = 'auto'
    selectedRecordId.value = null
    sanitizingReport.value = false
    tuningWarnings.value = []
  }

  const triggerDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadSanitized = async () => {
    // 1. Check if we already have a cached sanitized result in history
    const currentRecord = recentAnalyses.value.find(r => r.id === selectedRecordId.value)
    if (currentRecord && currentRecord.sanitized_result) {
      triggerDownload(currentRecord.sanitized_result.report_markdown, 'security_report_sanitized.md')
      return
    }

    // 2. If no cache, we need the original file to generate it
    if (!selectedFile.value) {
      error.value = "Sanitized download requires the original file. Please re-upload the log or use a history entry with cached sanitized result."
      return
    }

    if (Array.isArray(selectedFile.value)) {
      error.value = "Sanitized download is only available for single-file analysis."
      return
    }

    sanitizingReport.value = true
    try {
      const data = await analyzeLogFileSanitized(selectedFile.value, selectedLogFormat.value)
      
      // 3. Cache the result if we are in a session that has a record ID
      if (selectedRecordId.value) {
        recentAnalyses.value = updateAnalysisRecord(selectedRecordId.value, { sanitized_result: data })
      }

      // 4. Trigger download
      triggerDownload(data.report_markdown, 'security_report_sanitized.md')
    } catch (err) {
      error.value = "Sanitization failed: " + err.message
    } finally {
      sanitizingReport.value = false
    }
  }

  const isSanitizedAvailable = computed(() => {
    if (selectedFile.value) return !Array.isArray(selectedFile.value)
    const currentRecord = recentAnalyses.value.find(r => r.id === selectedRecordId.value)
    return !!(currentRecord && currentRecord.sanitized_result)
  })

  return {
    loading,
    result,
    error,
    selectedFile,
    selectedLogFormat,
    selectedRecordId,
    sanitizingReport,
    rules,
    rulesError,
    recentAnalyses,
    savedCases,
    tuningWarnings,
    handleAnalyze,
    handleApplyTuning,
    handleResetTuning,
    handleRestoreRecord,
    handleClearHistory,
    handleSaveCase,
    handleRefreshCases,
    clearCurrentResult,
    handleDownloadSanitized,
    isSanitizedAvailable
  }
}
