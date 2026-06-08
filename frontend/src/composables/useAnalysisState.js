import { ref, onMounted, computed } from 'vue'
import {
  analyzeLogFile,
  analyzeLogFileSanitized,
  fetchRuleConfig,
  analyzeLogWithTuning
} from '../api'
import { getRecentAnalyses, saveAnalysisRecord, updateAnalysisRecord, clearRecentAnalyses } from '../utils/historyStorage'

export function useAnalysisState() {
  const loading = ref(false)
  const result = ref(null)
  const error = ref(null)
  const selectedFile = ref(null)
  const selectedLogFormat = ref('auto')
  const selectedRecordId = ref(null)
  const sanitizingReport = ref(false)
  const rules = ref(null)
  const rulesError = ref(null)
  const recentAnalyses = ref([])
  const tuningWarnings = ref([])

  onMounted(async () => {
    // Load history
    recentAnalyses.value = getRecentAnalyses()
    
    try {
      rules.value = await fetchRuleConfig()
    } catch (err) {
      rulesError.value = err.message
    }
  })

  const handleAnalyze = async (file, logFormat) => {
    if (!file) return
    selectedFile.value = file
    selectedLogFormat.value = logFormat

    loading.value = true
    error.value = null
    result.value = null

    try {
      const data = await analyzeLogFile(file, logFormat)
      result.value = data

      // Save to history
      const recordId = Date.now().toString()
      selectedRecordId.value = recordId
      
      const record = {
        id: recordId,
        analyzed_at: new Date().toISOString(),
        file_name: file.name,
        log_format: logFormat === 'auto' ? data.parse_stats.detected_format : logFormat,
        total_requests: data.summary.total_requests,
        parse_rate: data.parse_stats.parse_rate,
        skipped_lines: data.parse_stats.skipped_lines,
        incidents_count: data.incidents.length,
        findings_count: data.findings.length,
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
          is_tuned: true
        })
      }
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

  const clearCurrentResult = () => {
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
    if (selectedFile.value) return true
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
    tuningWarnings,
    handleAnalyze,
    handleApplyTuning,
    handleResetTuning,
    handleRestoreRecord,
    handleClearHistory,
    clearCurrentResult,
    handleDownloadSanitized,
    isSanitizedAvailable
  }
}
