<template>
  <div class="severity-distribution" data-testid="severity-distribution">
    <h2 class="section-title">{{ t('distribution.title') }}</h2>
    <div class="severity-matrix">
      <Card class="distribution-card" data-testid="finding-distribution">
        <CardHeader>
          <CardTitle>{{ t('distribution.findingSeverity') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="severity-bars">
            <div v-for="(count, severity) in findingCounts" :key="severity" class="severity-row">
              <span class="dot" :class="severity"></span>
              <span class="severity-label">{{ translateSeverity(severity) }}</span>
              <div class="bar-container">
                <div
                  class="bar"
                  :class="severity"
                  :style="{ width: getPercentage(count, totalFindings) + '%' }"
                ></div>
              </div>
              <span class="count">{{ count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="distribution-card" data-testid="incident-distribution">
        <CardHeader>
          <CardTitle>{{ t('distribution.incidentSeverity') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="severity-bars">
            <div v-for="(count, severity) in incidentCounts" :key="severity" class="severity-row">
              <span class="dot" :class="severity"></span>
              <span class="severity-label">{{ translateSeverity(severity) }}</span>
              <div class="bar-container">
                <div
                  class="bar"
                  :class="severity"
                  :style="{ width: getPercentage(count, totalIncidents) + '%' }"
                ></div>
              </div>
              <span class="count">{{ count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t, translateSeverity } from '../i18n'

const props = defineProps({
  findingSeverityCounts: {
    type: Object,
    default: () => ({ high: 0, medium: 0, low: 0 })
  },
  incidentSeverityCounts: {
    type: Object,
    default: () => ({ high: 0, medium: 0, low: 0 })
  }
})

const order = ['high', 'medium', 'low']

const findingCounts = computed(() => {
  const counts = { high: 0, medium: 0, low: 0, ...props.findingSeverityCounts }
  return Object.fromEntries(order.map(key => [key, counts[key] || 0]))
})

const incidentCounts = computed(() => {
  const counts = { high: 0, medium: 0, low: 0, ...props.incidentSeverityCounts }
  return Object.fromEntries(order.map(key => [key, counts[key] || 0]))
})

const totalFindings = computed(() => Object.values(findingCounts.value).reduce((a, b) => a + b, 0))
const totalIncidents = computed(() => Object.values(incidentCounts.value).reduce((a, b) => a + b, 0))

const getPercentage = (count, total) => {
  if (total === 0) return 0
  return (count / total) * 100
}
</script>

<style scoped>
.severity-distribution {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--foreground);
  margin: 0 0 0.625rem;
}

.distribution-card {
  margin-bottom: 0;
}

.severity-bars {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.severity-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.1875rem 0;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.high { background-color: oklch(0.55 0.2 25); }
.dot.medium { background-color: oklch(0.7 0.15 85); }
.dot.low { background-color: oklch(0.55 0.15 250); }

.severity-label {
  width: 56px;
  font-size: 0.6875rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.bar-container {
  flex-grow: 1;
  height: 5px;
  background-color: var(--muted);
  border-radius: 999px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition: width 0.2s ease;
}

.bar.high { background-color: oklch(0.55 0.2 25); }
.bar.medium { background-color: oklch(0.7 0.15 85); }
.bar.low { background-color: oklch(0.55 0.15 250); }

.count {
  width: 2.25rem;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

@media (max-width: 390px) {
  .severity-label {
    width: 44px;
    font-size: 0.625rem;
  }

  .count {
    font-size: 0.6875rem;
  }
}
</style>
