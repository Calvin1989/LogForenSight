<template>
  <Card v-if="summary" class="executive-summary" data-testid="executive-summary">
    <CardContent>
      <div class="dashboard-hero">
        <div class="dashboard-hero-score risk-badge" :class="summary.overall_risk_level.toLowerCase()">
          <span class="risk-level">{{ translateRiskLevel(summary.overall_risk_level).toUpperCase() }}</span>
          <span class="risk-score">{{ summary.risk_score }}<span class="risk-denom">/100</span></span>
        </div>

        <div class="dashboard-hero-main">
          <h2 class="headline">{{ summary.headline }}</h2>
          <p class="overview">{{ summary.overview }}</p>
          <div class="mini-metrics">
            <div v-for="(metric, idx) in parsedMetrics" :key="idx" class="mini-metric-item">
              <span class="mini-metric-label">{{ metric.label }}</span>
              <span class="mini-metric-value">{{ metric.value }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-hero-actions">
          <Button variant="outline" size="sm" class="compact-download-btn" @click="downloadMarkdown" data-testid="download-btn" :title="t('executive.downloadMdTitle', 'Download Executive Summary as Markdown')">
            {{ t('actions.downloadMd') }}
          </Button>
        </div>
      </div>

      <div class="summary-details">
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
import { computed } from 'vue'
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

const parsedMetrics = computed(() => {
  if (!props.summary?.key_metrics) return []
  return props.summary.key_metrics.slice(0, 3).map(m => {
    const sep = m.includes(':') ? ':' : m.includes('：') ? '：' : null
    if (sep) {
      const parts = m.split(sep)
      return { label: parts[0].trim(), value: parts.slice(1).join(sep).trim() }
    }
    return { label: '', value: m }
  })
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
  margin-bottom: 0;
  border-left: 3px solid var(--border);
}

.executive-summary :deep(.chard-content) {
  padding: 1.25rem;
}

.risk-badge {
  color: white;
  background: var(--muted-foreground);
  width: 88px;
  padding: 0.75rem 0.5rem;
  align-self: start;
  margin-top: 0.25rem;
}

.risk-badge.critical { background: oklch(0.55 0.22 25); }
.risk-badge.high { background: oklch(0.65 0.18 55); }
.risk-badge.medium { background: oklch(0.75 0.15 85); color: oklch(0.2 0 0); }
.risk-badge.low { background: oklch(0.6 0.12 200); color: oklch(0.2 0 0); }
.risk-badge.informational { background: oklch(0.55 0.12 145); }

.risk-level {
  font-weight: 700;
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  line-height: 1;
}

.risk-score {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.1;
}

.risk-denom {
  font-size: 0.625rem;
  font-weight: 600;
  opacity: 0.75;
}

.headline {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
  line-height: 1.25;
}

.overview {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.55;
  max-width: 72ch;
}

.mini-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.375rem;
}

.mini-metric-item {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mini-metric-label {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--text-tertiary);
}

.mini-metric-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--foreground);
}

.summary-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.detail-section h3 {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin-top: 0;
  margin-bottom: 0.375rem;
  font-weight: 600;
}

.detail-section ul {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
}

.detail-section li {
  margin-bottom: 0.125rem;
  color: var(--text-secondary);
}

.full-width {
  grid-column: 1 / -1;
}

.ip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.ip-tag {
  background: var(--surface-subtle);
  color: var(--text-secondary);
  padding: 0.0625rem 0.3125rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  border: 1px solid var(--border);
}

.no-data {
  color: var(--text-tertiary);
  font-style: italic;
  font-size: 0.75rem;
}

.methodology-note {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
  margin-top: 0.75rem;
}

@media (max-width: 600px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .dashboard-hero-score {
    width: 100%;
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    margin-top: 0;
  }

  .dashboard-hero-actions {
    align-self: stretch;
  }

  .summary-details {
    grid-template-columns: 1fr;
  }
}
</style>
