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
  margin-top: 1rem;
}

.next-actions-header h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #212529;
}

.next-actions-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.no-actions {
  margin: 0.9rem 0 0;
  color: #495057;
}

.action-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.action-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.85rem;
  background: #fff;
}

.action-item h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #212529;
}

.action-item p {
  margin: 0.45rem 0 0;
  color: #495057;
}
</style>
