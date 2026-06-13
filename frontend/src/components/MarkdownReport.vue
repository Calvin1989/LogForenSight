<template>
  <section class="result-card">
    <div class="header-with-action">
      <h2>{{ t('report.title') }}</h2>
      <div class="markdown-report-actions" data-testid="markdown-report-actions">
        <div class="action-group preview-actions" data-testid="markdown-preview-actions">
          <Button @click="showPreview = !showPreview" variant="outline" size="sm" class="toggle-btn" :aria-label="showPreview ? t('actions.hidePreview') : t('actions.showPreview')" data-testid="toggle-preview-btn">
            {{ showPreview ? t('actions.hidePreview') : t('actions.showPreview') }}
          </Button>
        </div>
        <div class="action-group report-downloads" data-testid="markdown-report-downloads">
          <Button
            v-if="localizedReport"
            @click="downloadLocalizedReport"
            variant="default" size="sm" class="raw download-btn"
          >
            {{ t('report.downloadReport') }}
          </Button>
          <Button
            v-if="reportMarkdown"
            @click="$emit('download-sanitized')"
            :disabled="sanitizing || !sanitizedAvailable"
            :aria-disabled="sanitizing || !sanitizedAvailable"
            variant="default" size="sm" class="sanitized"
            data-testid="download-sanitized-btn"
          >
            {{ sanitizing ? t('actions.processing') : t('report.downloadSanitized') }}
          </Button>
          <span v-if="!sanitizedAvailable && !sanitizing" class="disabled-hint">{{ t('report.sanitizedUnavailable') }}</span>
        </div>
        <div class="action-group export-downloads" data-testid="markdown-export-downloads">
          <Button
            v-if="result"
            @click="downloadSummaryJson"
            variant="default" size="sm" class="summary"
            :title="t('report.downloadSummary')"
          >
            {{ t('report.downloadSummary') }}
          </Button>
          <Button
            v-if="result"
            @click="downloadEvidencePackMarkdown"
            variant="default" size="sm" class="evidence-pack download-btn"
            :title="t('report.downloadEvidencePack')"
          >
            {{ t('report.downloadEvidencePack') }}
          </Button>
        </div>
      </div>
    </div>
    
    <div v-if="!sanitizedAvailable" class="warning-banner">
      {{ t('report.warningBanner') }}
    </div>

    <div class="info-banner">
      {{ t('report.infoBanner') }}
    </div>

    <div v-if="showPreview" class="report-preview-container" data-testid="report-preview-container">
      <template v-for="(block, idx) in parsedBlocks" :key="idx">
        <h2 v-if="block.type === 'h1' || block.type === 'h2'">{{ block.content }}</h2>
        <h3 v-else-if="block.type === 'h3'">{{ block.content }}</h3>
        <h4 v-else-if="block.type === 'h4'">{{ block.content }}</h4>
        <p v-else-if="block.type === 'p'">{{ block.content }}</p>
        <div v-else-if="block.type === 'li'" class="md-li">
          <span class="bullet">•</span> {{ block.content }}
        </div>
        <blockquote v-else-if="block.type === 'quote'">{{ block.content }}</blockquote>
        <pre v-else-if="block.type === 'code'" class="md-code"><code>{{ block.content.join('\n') }}</code></pre>
        <div v-else-if="block.type === 'tr'" class="md-tr">
          <div v-for="(cell, cIdx) in block.content" :key="cIdx" class="md-td">{{ cell }}</div>
        </div>
      </template>
      <div v-if="parsedBlocks.length === 0" class="empty-preview">
        {{ t('common.noData') }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { downloadJson, buildAnalysisSummaryExport } from '../utils/exportUtils'
import { t, currentLanguage } from '../i18n'
import { loadCaseNotes } from '../utils/caseNotesStorage'
import { downloadEvidencePack } from '../utils/evidencePackExport'
import { buildLocalizedMarkdownReport } from '../utils/localizedReport'

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  caseId: {
    type: String,
    default: 'current-analysis'
  },
  caseNotesCaseId: {
    type: String,
    default: 'current-analysis'
  },
  reportMarkdown: {
    type: String,
    required: true
  },
  sanitizing: {
    type: Boolean,
    default: false
  },
  sanitizedAvailable: {
    type: Boolean,
    default: true
  }
})

const showPreview = ref(true)

const localizedReport = computed(() => {
  if (currentLanguage.value === 'en') return props.reportMarkdown;
  return buildLocalizedMarkdownReport(props.result, currentLanguage.value);
})

const cleanInline = (text) => {
  if (!text) return '';
  // Remove bold symbols **text** -> text
  return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

const parsedBlocks = computed(() => {
  if (!localizedReport.value) return [];

  const lines = localizedReport.value.split('\n');
  const blocks = [];
  let currentCodeBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code blocks
    if (line.trim().startsWith('```')) {
      if (currentCodeBlock === null) {
        currentCodeBlock = { type: 'code', content: [] };
      } else {
        blocks.push(currentCodeBlock);
        currentCodeBlock = null;
      }
      continue;
    }

    if (currentCodeBlock !== null) {
      currentCodeBlock.content.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', content: cleanInline(trimmed.slice(2)) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', content: cleanInline(trimmed.slice(3)) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', content: cleanInline(trimmed.slice(4)) });
    } else if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', content: cleanInline(trimmed.slice(5)) });
    }
    // Lists
    else if (trimmed.startsWith('- ')) {
      blocks.push({ type: 'li', content: cleanInline(trimmed.slice(2)) });
    }
    // Quotes
    else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', content: cleanInline(trimmed.slice(2)) });
    }
    // Tables
    else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes(':---') || (trimmed.includes('---') && trimmed.includes('|'))) {
        // Skip delimiter lines like | :--- | or | --- |
        if (trimmed.replace(/[:\s\-\|]/g, '') === '') continue;
      }
      const cells = trimmed.split('|')
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map(c => cleanInline(c.trim()));
      blocks.push({ type: 'tr', content: cells });
    }
    // Paragraph
    else {
      blocks.push({ type: 'p', content: cleanInline(trimmed) });
    }
  }

  // If a code block was never closed, push it anyway
  if (currentCodeBlock) blocks.push(currentCodeBlock);

  return blocks;
})

defineEmits(['download-sanitized'])

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

const downloadLocalizedReport = () => {
  if (!localizedReport.value) return
  triggerDownload(localizedReport.value, 'security_report.md')
}

const downloadSummaryJson = () => {
  if (!props.result) return
  const summaryData = buildAnalysisSummaryExport(props.result)
  const dateStr = new Date().toISOString().split('T')[0]
  downloadJson(`analysis_summary_${dateStr}.json`, summaryData)
}

const downloadEvidencePackMarkdown = () => {
  if (!props.result) return
  downloadEvidencePack(props.result, {
    caseId: props.caseId,
    caseNotes: loadCaseNotes(props.caseNotesCaseId),
    language: currentLanguage.value
  })
}
</script>

<style scoped>
.result-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  margin-bottom: 0;
}

.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.header-with-action h2 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--foreground);
}

.markdown-report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  align-items: center;
}

.disabled-hint {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.download-btn {
  padding: 0.3125rem 0.625rem;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.toggle-btn {
  padding: 0.3125rem 0.625rem;
  background-color: var(--surface-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.toggle-btn:hover {
  background-color: var(--accent);
}

.download-btn.raw {
  background-color: oklch(0.55 0.16 145);
}
.download-btn.raw:hover {
  background-color: oklch(0.5 0.16 145);
}

.download-btn.sanitized {
  background-color: oklch(0.55 0.12 200);
}
.download-btn.sanitized:hover:not(:disabled) {
  background-color: oklch(0.5 0.12 200);
}
.download-btn.sanitized:disabled {
  background-color: var(--muted-foreground);
  cursor: not-allowed;
}

.download-btn.summary {
  background-color: oklch(0.45 0.16 300);
}
.download-btn.summary:hover {
  background-color: oklch(0.4 0.16 300);
}

.download-btn.evidence-pack {
  background-color: oklch(0.6 0.16 55);
}
.download-btn.evidence-pack:hover {
  background-color: oklch(0.55 0.16 55);
}

.mini-error {
  font-size: 0.85rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.info-banner {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--surface-subtle);
  padding: 0.5rem 0.75rem;
  border-left: 3px solid oklch(0.55 0.12 200);
  margin-bottom: 1rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.warning-banner {
  font-size: 0.75rem;
  color: oklch(0.55 0.12 85);
  background-color: oklch(0.97 0.04 85);
  padding: 0.5rem 0.75rem;
  border-left: 3px solid oklch(0.7 0.15 85);
  margin-bottom: 0.75rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.report-preview-container {
  background: var(--surface-elevated);
  color: var(--foreground);
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.65;
  max-height: 28rem;
  overflow-y: auto;
}

.report-preview-container h2 {
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border);
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
}

.report-preview-container h2:first-child {
  margin-top: 0;
}

.report-preview-container h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--foreground);
}

.report-preview-container h4 {
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.report-preview-container p {
  margin-bottom: 0.625rem;
  max-width: 48rem;
}

.md-li {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
  padding-left: 0.375rem;
  font-size: 0.8125rem;
}

.bullet {
  color: var(--foreground);
  font-weight: bold;
}

blockquote {
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  border-left: 3px solid var(--border);
  background: var(--surface-subtle);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.8125rem;
}

.md-code {
  background: var(--surface-subtle);
  padding: 0.625rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  margin: 0.625rem 0;
  border: 1px solid var(--border);
  max-height: 10rem;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.md-tr {
  display: flex;
  border-bottom: 1px solid var(--border);
  font-size: 0.8125rem;
}

.md-tr:first-child {
  font-weight: 600;
  background: var(--surface-subtle);
  border-top: 1px solid var(--border);
}

.md-td {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border-right: 1px solid var(--border);
}

.md-td:first-child {
  border-left: 1px solid var(--border);
}

.empty-preview {
  text-align: center;
  color: var(--text-tertiary);
  padding: 1.25rem;
  font-style: italic;
  font-size: 0.75rem;
}

@media (max-width: 390px) {
  .header-with-action {
    flex-direction: column;
    align-items: flex-start;
  }

  .markdown-report-actions {
    width: 100%;
  }

  .action-group {
    width: 100%;
  }

  .action-group button {
    width: 100%;
  }

  .report-preview-container {
    padding: 0.75rem;
    max-height: 20rem;
  }
}

@media (max-width: 768px) {
  .header-with-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .markdown-report-actions {
    width: 100%;
  }

  .action-group {
    width: 100%;
  }

  .action-group button {
    width: 100%;
  }
}
</style>
