<template>
  <Card class="finding-explainability" data-testid="finding-explainability">
    <CardContent>
      <div v-if="explanation" class="explainability-grid">
        <div v-if="explanation.hasRuleContext" class="explainability-block">
          <h4>{{ t('explainability.ruleContext') }}</h4>
          <dl class="explainability-list">
            <div v-if="explanation.ruleId" class="explainability-row">
              <dt>{{ t('explainability.ruleId') }}</dt>
              <dd><code>{{ explanation.ruleId }}</code></dd>
            </div>
            <div v-if="explanation.ruleName" class="explainability-row">
              <dt>{{ t('explainability.ruleName') }}</dt>
              <dd>{{ explanation.ruleName }}</dd>
            </div>
            <div v-if="explanation.ruleDescription" class="explainability-row">
              <dt>{{ t('explainability.ruleDescription') }}</dt>
              <dd>{{ explanation.ruleDescription }}</dd>
            </div>
          </dl>
        </div>

        <div class="explainability-block">
          <h4>{{ t('explainability.severityRationale') }}</h4>
          <p class="rationale-text">{{ rendered.rationale }}</p>
        </div>

        <div v-if="explanation.hasMatchedContext" class="explainability-block">
          <h4>{{ t('explainability.matchedContext') }}</h4>
          <p v-if="rendered.matchedContextLabel" class="context-summary">
            <code>{{ rendered.matchedContextLabel }}</code>
          </p>
          <dl class="explainability-list">
            <div v-if="explanation.matchedField" class="explainability-row">
              <dt>{{ t('explainability.matchedField') }}</dt>
              <dd><code>{{ explanation.matchedField }}</code></dd>
            </div>
            <div v-if="explanation.matchedValue" class="explainability-row">
              <dt>{{ t('explainability.matchedValue') }}</dt>
              <dd><code>{{ explanation.matchedValue }}</code></dd>
            </div>
            <div v-if="explanation.matchedContext.sourceIp" class="explainability-row">
              <dt>{{ t('common.sourceIp') }}</dt>
              <dd><code>{{ explanation.matchedContext.sourceIp }}</code></dd>
            </div>
            <div v-if="explanation.matchedContext.path" class="explainability-row">
              <dt>{{ t('common.path') }}</dt>
              <dd><code>{{ explanation.matchedContext.path }}</code></dd>
            </div>
            <div v-if="explanation.matchedContext.method" class="explainability-row">
              <dt>{{ t('common.description') }}</dt>
              <dd><code>{{ explanation.matchedContext.method }} {{ explanation.matchedContext.status ? `HTTP ${explanation.matchedContext.status}` : '' }}</code></dd>
            </div>
          </dl>
        </div>

        <div v-if="explanation.hasIndicators" class="explainability-block">
          <h4>{{ t('explainability.indicators') }}</h4>
          <ul class="indicator-list">
            <li v-for="hint in explanation.indicatorHints" :key="`${hint.kind}:${hint.value}`" class="indicator-item">
              <span class="indicator-kind">{{ indicatorKindLabel(hint.kind) }}</span>
              <code class="indicator-value">{{ hint.value }}</code>
            </li>
          </ul>
        </div>

        <div v-if="explanation.hasEvidence" class="explainability-block">
          <h4>{{ t('explainability.evidenceSnippet') }}</h4>
          <pre class="evidence-snippet"><code>{{ explanation.evidenceSnippet }}</code></pre>
          <p v-if="explanation.evidenceTruncated" class="evidence-truncated">
            {{ t('explainability.evidenceTruncated') }}
          </p>
        </div>

        <div class="explainability-block">
          <h4>{{ t('explainability.recommendedAction') }}</h4>
          <p class="recommendation-text">{{ rendered.recommendedAction }}</p>
        </div>

        <div class="explainability-block">
          <h4>{{ t('explainability.relatedEntities') }}</h4>
          <p v-if="!explanation.hasRelatedEntities" class="no-entities">
            {{ t('explainability.noRelatedEntities') }}
          </p>
          <ul v-else class="related-entity-list">
            <li v-for="entity in explanation.relatedEntities" :key="`${entity.type}:${entity.value}`" class="related-entity-item">
              <span class="entity-type">{{ entity.type }}</span>
              <code class="entity-value">{{ entity.value }}</code>
              <span class="entity-count">{{ entity.count }}</span>
            </li>
          </ul>
          <p v-if="explanation.relatedEntitySummary && explanation.relatedEntitySummary.globalSummary" class="global-summary">
            <em>{{ t('explainability.relatedEntitiesGlobal') }}: {{ globalSummaryText(explanation.relatedEntitySummary) }}</em>
          </p>
        </div>
      </div>
      <p v-else class="explainability-empty">
        {{ t('evidencePack.notAvailable') }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildFindingExplanation, renderFindingExplanation } from '../utils/findingExplainability'

const props = defineProps({
  finding: {
    type: Object,
    required: true
  },
  analysisResult: {
    type: Object,
    default: null
  },
  evidenceLimit: {
    type: Number,
    default: 280
  }
})

const explanation = computed(() => buildFindingExplanation(props.finding, props.analysisResult, {
  limit: props.evidenceLimit
}))

const rendered = computed(() => renderFindingExplanation(explanation.value, (key, fallback) => t(key, fallback || '')))

function indicatorKindLabel(kind) {
  if (!kind) return ''
  return t(`explainability.indicatorKind.${kind}`, kind)
}

function globalSummaryText(summary) {
  if (!summary || !summary.globalSummary) return ''
  const parts = []
  const counts = summary.countsByType || {}
  Object.keys(counts).sort().forEach((type) => {
    parts.push(`${type}=${counts[type]}`)
  })
  const total = summary.globalSummary.total
  if (parts.length === 0 && typeof total === 'number') {
    return String(total)
  }
  return parts.join(', ')
}
</script>

<style scoped>
.finding-explainability {
  margin-top: 1rem;
}

.explainability-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.explainability-block h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.explainability-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.explainability-row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) 1fr;
  gap: 0.5rem;
  font-size: 0.85rem;
  align-items: start;
}

.explainability-row dt {
  font-weight: 600;
  color: #6c757d;
}

.explainability-row dd {
  margin: 0;
  color: #212529;
  word-break: break-word;
}

.explainability-row code {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  color: #495057;
}

.rationale-text,
.recommendation-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #212529;
}

.context-summary {
  margin: 0 0 0.4rem 0;
  font-size: 0.9rem;
}

.context-summary code {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #495057;
}

.indicator-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.indicator-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 1px solid #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.indicator-kind {
  font-weight: 600;
  color: #1971c2;
}

.indicator-value {
  font-family: monospace;
  color: #495057;
}

.evidence-snippet {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin: 0;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-all;
  color: #e83e8c;
  font-family: 'Courier New', Courier, monospace;
}

.evidence-truncated {
  margin: 0.4rem 0 0 0;
  font-size: 0.75rem;
  color: #856404;
}

.no-entities,
.global-summary {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.related-entity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.related-entity-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.3rem 0.5rem;
}

.entity-type {
  font-weight: 600;
  color: #1971c2;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.entity-value {
  font-family: monospace;
  color: #495057;
  word-break: break-all;
}

.entity-count {
  text-align: right;
  color: #6c757d;
}

.explainability-empty {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
}


/* Frontend-wide interaction polish */
:where(button, [role="button"], input, select, textarea, a):focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.22);
  outline-offset: 2px;
}

:where(button, [role="button"]) {
  -webkit-tap-highlight-color: transparent;
}

:where(input, select, textarea) {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  :where(*) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

</style>
