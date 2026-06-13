<template>
  <Card class="next-actions" data-testid="case-closure-next-actions">
    <CardContent>
      <div class="next-actions-header">
        <h4>{{ t('caseClosureChecklist.nextActionsTitle') }}</h4>
        <p>{{ t('caseClosureChecklist.nextActionsSubtitle') }}</p>
      </div>

      <p
        v-if="nextActions.length === 0"
        class="no-actions"
        data-testid="case-closure-no-next-actions"
      >
        {{ t('caseClosureChecklist.nextActionsEmpty') }}
      </p>

      <div v-else class="action-list">
        <article
          v-for="action in nextActions"
          :key="action.id"
          class="action-item"
          :data-testid="`case-closure-next-action-${action.id}`"
        >
          <h5>{{ action.label }}</h5>
          <p>{{ action.description }}</p>
        </article>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { t } from '../i18n'
import { buildCaseClosureNextActions } from '../utils/caseClosureNextActions'

const props = defineProps({
  gapItems: {
    type: Array,
    default: () => []
  },
  handoffReadiness: {
    type: Object,
    default: null
  }
})

function createAction({ id, priority, labelKey, descriptionKey }) {
  return {
    id,
    priority,
    label: t(labelKey),
    description: t(descriptionKey)
  }
}

const nextActions = computed(() => {
  return buildCaseClosureNextActions({
    gapItems: props.gapItems,
    handoffReadiness: props.handoffReadiness,
    createAction
  })
})
</script>

<style scoped>
.next-actions {
  margin-top: 0;
  border-top: 2px solid var(--border);
  padding-top: 0.75rem;
}

.next-actions-header h4 {
  margin: 0 0 0.125rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--foreground);
}

.next-actions-header p {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.6875rem;
}

.no-actions {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.action-list {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: 0.5rem;
}

.action-item {
  border: none;
  border-radius: 0;
  padding: 0.5rem 0.625rem;
  background: var(--surface-elevated);
}

.action-item h5 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--foreground);
}

.action-item p {
  margin: 0.125rem 0 0;
  color: var(--text-secondary);
  font-size: 0.6875rem;
  line-height: 1.4;
}
</style>
