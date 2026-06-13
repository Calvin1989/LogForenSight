<template>
  <Card class="evidence-gaps" data-testid="case-closure-evidence-gaps">
    <CardContent>
      <div class="evidence-gaps-header">
        <h4>{{ t('caseClosureChecklist.evidenceGapsTitle') }}</h4>
        <p>{{ t('caseClosureChecklist.evidenceGapsSubtitle') }}</p>
      </div>

      <p
        v-if="gapItems.length === 0"
        class="no-gaps"
        data-testid="case-closure-no-gaps"
      >
        {{ t('caseClosureChecklist.noGaps') }}
      </p>

      <div v-else class="gap-list">
        <article
          v-for="gap in gapItems"
          :key="gap.id"
          class="gap-item"
          :class="`is-${gap.tone}`"
          :data-testid="`case-closure-gap-${gap.id}`"
        >
          <div class="gap-item-header">
            <h5>{{ gap.label }}</h5>
            <span class="gap-status" :class="`is-${gap.tone}`">
              {{ gap.value }}
            </span>
          </div>
          <p class="gap-description">{{ gap.description }}</p>
        </article>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { t } from '../i18n'

defineProps({
  gapItems: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.evidence-gaps {
  margin-top: 0;
  border-top: 2px solid var(--border);
  padding-top: 0.75rem;
}

.evidence-gaps-header h4 {
  margin: 0 0 0.125rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--foreground);
}

.evidence-gaps-header p {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.6875rem;
}

.no-gaps {
  margin: 0.5rem 0 0;
  color: var(--foreground);
  font-weight: 600;
  font-size: 0.75rem;
}

.gap-list {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: 0.5rem;
}

.gap-item {
  border: none;
  border-left: 3px solid var(--border);
  border-radius: 0;
  padding: 0.4375rem 0.5rem;
  background: var(--surface-elevated);
}

.gap-item.is-warning {
  border-left-color: oklch(0.65 0.15 55);
  background: oklch(0.98 0.02 60);
}

.gap-item.is-danger {
  border-left-color: oklch(0.5 0.18 25);
  background: oklch(0.98 0.02 25);
}

.gap-item.is-neutral {
  border-left-color: var(--border);
  background: var(--surface-elevated);
}

.gap-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.gap-item-header h5 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--foreground);
}

.gap-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.0625rem 0.375rem;
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.gap-status.is-warning {
  background: oklch(0.95 0.06 60);
  color: oklch(0.5 0.12 60);
}

.gap-status.is-danger {
  background: oklch(0.95 0.04 25);
  color: oklch(0.45 0.15 25);
}

.gap-status.is-neutral {
  background: var(--surface-subtle);
  color: var(--text-secondary);
}

.gap-description {
  margin: 0.125rem 0 0;
  color: var(--text-secondary);
  font-size: 0.65625rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .gap-item-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 390px) {
  .gap-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
