<template>
  <Card class="summary-cards" data-testid="summary-cards">
    <CardHeader>
      <CardTitle>{{ t('summary.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ t('summary.totalRequests') }}</span>
          <span class="stat-value">{{ summary.total_requests }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('summary.uniqueIps') }}</span>
          <span class="stat-value">{{ summary.unique_ips }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('summary.total4xx') }}</span>
          <span class="stat-value">{{ summary.total_4xx }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('summary.total5xx') }}</span>
          <span class="stat-value">{{ summary.total_5xx }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'

defineProps({
  summary: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.summary-cards {
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  padding: 0.75rem 1rem;
  background: var(--surface-elevated);
}

.stat-label {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 390px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    padding: 0.5rem 0.625rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>
