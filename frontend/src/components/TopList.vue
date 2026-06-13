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
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
}

th {
  color: #6c757d;
  font-weight: 600;
  font-size: 0.875rem;
}

.item-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
