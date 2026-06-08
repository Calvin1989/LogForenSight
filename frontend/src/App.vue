<template>
  <div class="container">
    <header>
      <h1>AI Log Security Analyzer</h1>
      <p>Upload your Nginx access logs for security analysis</p>
    </header>

    <main>
      <FileUpload 
        :loading="loading" 
        @analyze="handleAnalyze" 
      />

      <div class="main-actions" v-if="result || error || selectedFile">
        <button @click="clearCurrentResult" class="clear-current-btn">
          Clear Current Result
        </button>
      </div>

      <RecentAnalyses 
        :history="recentAnalyses" 
        @select="handleRestoreRecord"
        @clear="handleClearHistory"
      />

      <div v-if="rules" class="config-section">
        <RuleConfigPanel :rules="rules" />
      </div>

      <div v-if="rulesError" class="mini-warning">
        Note: Could not load rule configuration ({{ rulesError }}). Using defaults.
      </div>

      <div v-if="error" class="error-msg">
        Error: {{ error }}
      </div>

      <div v-if="result" class="results-container">
        <SummaryCards :summary="result.summary" />

        <SeverityDistribution 
          :findingSeverityCounts="result.summary.finding_severity_counts"
          :incidentSeverityCounts="result.summary.incident_severity_counts"
        />

        <ParseStatsCard :stats="result.parse_stats" />

        <IncidentsList :incidents="result.incidents" />

        <div class="side-by-side">
          <TopList 
            title="Top 5 IPs" 
            :items="result.summary.top_ips" 
            itemKey="ip" 
            itemLabel="IP Address" 
          />
          <TopList 
            title="Top 5 Paths" 
            :items="result.summary.top_paths" 
            itemKey="path" 
            itemLabel="Path" 
          />
        </div>

        <FindingsList :findings="result.findings" />

        <MarkdownReport 
          :result="result"
          :reportMarkdown="result.report_markdown" 
          :file="selectedFile"
          :sanitizing="sanitizingReport"
          :sanitizedAvailable="isSanitizedAvailable"
          @download-sanitized="handleDownloadSanitized"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAnalysisState } from './composables/useAnalysisState'
import FileUpload from './components/FileUpload.vue'
import SummaryCards from './components/SummaryCards.vue'
import TopList from './components/TopList.vue'
import FindingsList from './components/FindingsList.vue'
import MarkdownReport from './components/MarkdownReport.vue'
import IncidentsList from './components/IncidentsList.vue'
import RuleConfigPanel from './components/RuleConfigPanel.vue'
import ParseStatsCard from './components/ParseStatsCard.vue'
import SeverityDistribution from './components/SeverityDistribution.vue'
import RecentAnalyses from './components/RecentAnalyses.vue'

const {
  loading,
  result,
  error,
  selectedFile,
  sanitizingReport,
  rules,
  rulesError,
  recentAnalyses,
  handleAnalyze,
  handleRestoreRecord,
  handleClearHistory,
  clearCurrentResult,
  handleDownloadSanitized,
  isSanitizedAvailable
} = useAnalysisState()
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.main-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.clear-current-btn {
  padding: 0.6rem 1.2rem;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-current-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

.error-msg {
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.mini-warning {
  font-size: 0.85rem;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .side-by-side {
    grid-template-columns: 1fr;
  }
}
</style>
