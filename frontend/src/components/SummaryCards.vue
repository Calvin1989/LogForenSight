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
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
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
