<template>
  <Card v-if="summary" class="executive-summary" data-testid="executive-summary">
    <CardContent>
      <div class="summary-header">
        <div class="risk-badge" :class="summary.overall_risk_level.toLowerCase()">
          <span class="risk-level">{{ translateRiskLevel(summary.overall_risk_level).toUpperCase() }}</span>
          <span class="risk-score">{{ summary.risk_score }}/100</span>
        </div>
        <div class="headline-container">
          <h2 class="headline">{{ summary.headline }}</h2>
          <Button variant="outline" size="sm" @click="downloadMarkdown" data-testid="download-btn" :title="t('executive.downloadMdTitle', 'Download Executive Summary as Markdown')">
            {{ t('actions.downloadMd') }}
          </Button>
        </div>
      </div>

      <p class="overview">{{ summary.overview }}</p>

      <div class="summary-details">
        <div class="detail-section">
          <h3>{{ t('executive.keyMetrics') }}</h3>
          <ul>
            <li v-for="metric in summary.key_metrics" :key="metric">{{ metric }}</li>
          </ul>
        </div>

        <div class="detail-section">
          <h3>{{ t('executive.topRisks') }}</h3>
          <ul>
            <li v-for="risk in summary.top_risks" :key="risk">{{ risk }}</li>
          </ul>
        </div>

        <div class="detail-section">
          <h3>{{ t('executive.keyAffectedIps') }}</h3>
          <div class="ip-tags">
            <span v-for="ip in summary.key_affected_ips" :key="ip" class="ip-tag">{{ ip }}</span>
            <span v-if="summary.key_affected_ips.length === 0" class="no-data">{{ t('executive.noneDetected') }}</span>
          </div>
        </div>

        <div class="detail-section full-width">
          <h3>{{ t('executive.recommendedNextSteps') }}</h3>
          <ul>
            <li v-for="step in summary.recommended_next_steps" :key="step">{{ step }}</li>
          </ul>
        </div>
      </div>

      <div class="methodology-note">
        <strong>{{ t('executive.methodology') }}:</strong> {{ summary.methodology }}
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { t, translateRiskLevel } from '../i18n'

const props = defineProps({
  summary: {
    type: Object,
    required: false,
    default: null
  }
})

const downloadMarkdown = () => {
  if (!props.summary) return

  const date = new Date().toISOString().split('T')[0]
  const filename = `executive_summary_${date}.md`

  let md = `# ${t('executive.title')}\n\n`
  md += `## ${props.summary.headline}\n\n`
  md += `**${t('executive.overallRiskLevel')}:** ${translateRiskLevel(props.summary.overall_risk_level).toUpperCase()} (${props.summary.risk_score}/100)\n\n`
  md += `${props.summary.overview}\n\n`

  md += `### ${t('executive.keyMetrics')}\n`
  props.summary.key_metrics.forEach(m => md += `- ${m}\n`)

  md += `\n### ${t('executive.topRisks')}\n`
  props.summary.top_risks.forEach(r => md += `- ${r}\n`)

  md += `\n### ${t('executive.keyAffectedIps')}\n`
  props.summary.key_affected_ips.forEach(ip => md += `- ${ip}\n`)
  if (props.summary.key_affected_ips.length === 0) md += `- ${t('executive.noneDetected')}\n`

  md += `\n### ${t('executive.recommendedNextSteps')}\n`
  props.summary.recommended_next_steps.forEach(s => md += `- ${s}\n`)

  md += `\n---\n**${t('executive.methodology')}:** ${props.summary.methodology}\n`

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.executive-summary {
  margin-bottom: 2rem;
  border-left: 5px solid #6c757d;
}

.summary-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.risk-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 8px;
  min-width: 100px;
  color: white;
  background: #6c757d;
}

.risk-badge.critical { background: #dc3545; }
.risk-badge.high { background: #fd7e14; }
.risk-badge.medium { background: #ffc107; color: #212529; }
.risk-badge.low { background: #0dcaf0; color: #212529; }
.risk-badge.informational { background: #198754; }

.risk-level {
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.risk-score {
  font-size: 1.5rem;
  font-weight: 900;
}

.headline-container {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.headline {
  margin: 0;
  font-size: 1.5rem;
  color: #212529;
}

.overview {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.summary-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #6c757d;
  margin-top: 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
  padding-bottom: 0.25rem;
}

.detail-section ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.95rem;
}

.detail-section li {
  margin-bottom: 0.4rem;
}

.full-width {
  grid-column: 1 / -1;
}

.ip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ip-tag {
  background: #f1f3f5;
  color: #495057;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
}

.no-data {
  color: #adb5bd;
  font-style: italic;
  font-size: 0.9rem;
}

.methodology-note {
  font-size: 0.8rem;
  color: #6c757d;
  border-top: 1px solid #f1f3f5;
  padding-top: 1rem;
  font-style: italic;
}

@media (max-width: 600px) {
  .summary-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .headline-container {
    flex-direction: column;
    gap: 1rem;
  }
}


</style>
