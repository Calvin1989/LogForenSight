<template>
  <section class="result-card">
    <div class="header-with-action">
      <h2>{{ t('report.title') }}</h2>
      <div class="markdown-report-actions" data-testid="markdown-report-actions">
        <div class="action-group preview-actions" data-testid="markdown-preview-actions">
          <Button @click="showPreview = !showPreview" variant="outline" size="sm" class="toggle-btn">
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
            variant="default" size="sm" class="sanitized"
          >
            {{ sanitizing ? t('actions.processing') : t('report.downloadSanitized') }}
          </Button>
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

    <div v-if="showPreview" class="report-preview-container">
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
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-with-action h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.markdown-report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.download-btn {
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background-color: var(--surface-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.toggle-btn:hover {
  background-color: #e9ecef;
}

.download-btn.raw {
  background-color: #28a745;
}
.download-btn.raw:hover {
  background-color: #218838;
}

.download-btn.sanitized {
  background-color: #17a2b8;
}
.download-btn.sanitized:hover:not(:disabled) {
  background-color: #138496;
}
.download-btn.sanitized:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.download-btn.summary {
  background-color: #6f42c1;
}
.download-btn.summary:hover {
  background-color: #5a32a3;
}

.download-btn.evidence-pack {
  background-color: #e67700;
}
.download-btn.evidence-pack:hover {
  background-color: #d46b08;
}

.mini-error {
  font-size: 0.85rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.info-banner {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background-color: var(--surface-subtle);
  padding: 0.75rem 1rem;
  border-left: 4px solid #17a2b8;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
}

.warning-banner {
  font-size: 0.85rem;
  color: #856404;
  background-color: #fff3cd;
  padding: 0.75rem 1rem;
  border-left: 4px solid #ffc107;
  margin-bottom: 1rem;
  border-radius: 0 4px 4px 0;
}

.report-preview-container {
  background: var(--surface-elevated);
  color: var(--foreground);
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
  font-size: 1rem;
  line-height: 1.6;
}

.report-preview-container h2 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--border);
  font-size: 1.5rem;
  color: var(--foreground);
}

.report-preview-container h3 {
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  color: var(--foreground);
}

.report-preview-container h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.report-preview-container p {
  margin-bottom: 1rem;
}

.md-li {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
  padding-left: 0.5rem;
}

.bullet {
  color: #339af0;
  font-weight: bold;
}

blockquote {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  border-left: 0.25rem solid var(--border);
  background: var(--surface-subtle);
}

.md-code {
  background: var(--surface-subtle);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85rem;
  margin: 1rem 0;
  border: 1px solid var(--border);
}

.md-tr {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.md-tr:first-child {
  font-weight: bold;
  background: var(--surface-subtle);
  border-top: 1px solid var(--border);
}

.md-td {
  flex: 1;
  padding: 0.5rem;
  border-right: 1px solid var(--border);
}

.md-td:first-child {
  border-left: 1px solid var(--border);
}

.empty-preview {
  text-align: center;
  color: var(--text-tertiary);
  padding: 2rem;
  font-style: italic;
}


</style>
