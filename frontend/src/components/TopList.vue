<template>
  <Card class="top-list" data-testid="top-list">
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <table>
        <thead>
          <tr>
            <th>{{ itemLabel }}</th>
            <th>{{ t('common.count') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td class="item-cell" :title="item[itemKey]">{{ item[itemKey] }}</td>
            <td>{{ item.count }}</td>
          </tr>
        </tbody>
      </table>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'

defineProps({
  title: String,
  items: {
    type: Array,
    required: true
  },
  itemKey: {
    type: String,
    required: true
  },
  itemLabel: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.top-list {
  margin-bottom: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 0.4375rem 0.625rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.8125rem;
}

th {
  color: var(--text-tertiary);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 390px) {
  .item-cell {
    max-width: 120px;
  }

  th, td {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }
}
</style>
