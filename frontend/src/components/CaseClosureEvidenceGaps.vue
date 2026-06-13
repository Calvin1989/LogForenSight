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
  margin-top: 1rem;
}

.evidence-gaps-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.evidence-gaps-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.no-gaps {
  margin: 0.9rem 0 0;
  color: #2b8a3e;
  font-weight: 600;
}

.gap-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.gap-item {
  border: 1px solid #e9ecef;
  border-left-width: 4px;
  border-radius: 6px;
  padding: 0.85rem;
  background: #fff;
}

.gap-item.is-warning {
  border-left-color: #d9480f;
  background: #fffaf4;
}

.gap-item.is-danger {
  border-left-color: #c92a2a;
  background: #fff7f7;
}

.gap-item.is-neutral {
  border-left-color: #868e96;
  background: #f8f9fa;
}

.gap-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.gap-item-header h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #212529;
}

.gap-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.gap-status.is-warning {
  background: #fff4e6;
  color: #d9480f;
}

.gap-status.is-danger {
  background: #fff5f5;
  color: #c92a2a;
}

.gap-status.is-neutral {
  background: #f1f3f5;
  color: #495057;
}

.gap-description {
  margin: 0.45rem 0 0;
  color: #495057;
}

@media (max-width: 768px) {
  .gap-item-header {
    flex-direction: column;
  }
}
</style>
