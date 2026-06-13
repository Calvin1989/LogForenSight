<template>
  <Card class="result-card">
    <CardHeader>
      <div class="timeline-intro">
        <CardTitle>{{ t('timeline.title') }} ({{ (timelineEvents || []).length }})</CardTitle>
        <p class="intro-text">
          {{ t('timeline.intro') }}
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <!-- Filter Controls -->
      <div class="filter-controls">
        <div class="filter-group">
          <label>{{ t('common.severity') }}:</label>
          <select v-model="severityFilter" class="filter-select">
            <option value="all">{{ t('common.all') }}</option>
            <option value="high">{{ translateSeverity('high') }}</option>
            <option value="medium">{{ translateSeverity('medium') }}</option>
            <option value="low">{{ translateSeverity('low') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>{{ t('common.sourceIp') }}:</label>
          <input
            v-model="ipSearch"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            class="filter-input"
          />
        </div>

        <Button
          v-if="isFiltered"
          @click="clearFilters"
          variant="ghost" size="sm" class="clear-btn"
        >
          {{ t('actions.clear') }}
        </Button>

        <div v-if="isFiltered" class="filter-stats">
          {{ t('timeline.showingEvents', 'Showing {filtered} of {total} events').replace('{filtered}', filteredEvents.length).replace('{total}', (timelineEvents || []).length) }}
        </div>
      </div>

      <div v-if="filteredEvents.length === 0" class="empty-state">
        {{ (timelineEvents || []).length === 0 ? t('timeline.emptyState') : t('timeline.noMatch') }}
      </div>

      <div v-else class="timeline-container">
        <div v-for="event in filteredEvents" :key="event.event_id" class="timeline-item">
          <div class="timeline-marker">
            <div class="marker-dot" :class="event.severity.toLowerCase()"></div>
            <div class="marker-line"></div>
          </div>

          <div class="timeline-content">
            <div class="event-header">
              <span class="event-time">{{ event.timestamp }}</span>
              <span class="severity-badge" :data-severity="event.severity.toLowerCase()">
                {{ translateSeverity(event.severity).toUpperCase() }}
              </span>
              <span class="event-type-badge">{{ formatEventType(event.event_type) }}</span>
              <span class="ip-badge">{{ event.source_ip }}</span>
            </div>

            <div class="event-body">
              <h4 class="event-title">{{ event.title }}</h4>
              <p class="event-desc">{{ event.description }}</p>

              <div v-if="event.evidence" class="event-evidence">
                <strong>{{ t('common.evidence') }}:</strong>
                <pre><code>{{ event.evidence }}</code></pre>
              </div>

              <div class="event-meta" v-if="event.related_rule_id">
                <span class="meta-tag">{{ t('common.rule') }}: {{ event.related_rule_id }}</span>
                <span class="meta-tag" v-if="event.related_incident_id">ID: {{ event.related_incident_id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t, translateSeverity } from '../i18n'

const props = defineProps({
  timelineEvents: {
    type: Array,
    default: () => []
  }
})

const severityFilter = ref('all')
const ipSearch = ref('')

const isFiltered = computed(() => {
  return severityFilter.value !== 'all' || ipSearch.value !== ''
})

const filteredEvents = computed(() => {
  return (props.timelineEvents || []).filter(event => {
    const matchesSeverity = severityFilter.value === 'all' || event.severity.toLowerCase() === severityFilter.value
    const matchesIp = event.source_ip.toLowerCase().includes(ipSearch.value.toLowerCase())
    return matchesSeverity && matchesIp
  })
})

const clearFilters = () => {
  severityFilter.value = 'all'
  ipSearch.value = ''
}

const formatEventType = (type) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
</script>

<style scoped>
.result-card {
  margin-bottom: 0;
}

.timeline-intro {
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
}

.timeline-intro h3 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  color: var(--foreground);
}

.intro-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.625rem;
  background: var(--surface-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.filter-select, .filter-input {
  padding: 0.3125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  outline: none;
}

.filter-select:focus, .filter-input:focus {
  border-color: var(--ring);
}

.filter-stats {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-left: auto;
  font-weight: 500;
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.marker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
  margin-top: 0.5rem;
  z-index: 1;
}

.marker-dot.high { background-color: oklch(0.55 0.2 25); }
.marker-dot.medium { background-color: oklch(0.7 0.15 85); }
.marker-dot.low { background-color: oklch(0.55 0.15 250); }

.marker-line {
  flex-grow: 1;
  width: 2px;
  background: var(--border);
}

.timeline-item:last-child .marker-line {
  display: none;
}

.timeline-content {
  flex-grow: 1;
  padding-bottom: 2.25rem;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.event-time {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.severity-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  color: white;
}

.severity-badge[data-severity="high"] { background-color: oklch(0.55 0.2 25); }
.severity-badge[data-severity="medium"] { background-color: oklch(0.7 0.15 85); }
.severity-badge[data-severity="low"] { background-color: oklch(0.55 0.15 250); }

.event-type-badge {
  font-size: 0.625rem;
  padding: 0.0625rem 0.375rem;
  background-color: var(--surface-subtle);
  color: var(--text-secondary);
  border-radius: 999px;
  font-weight: 600;
}

.ip-badge {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: var(--surface-subtle);
  padding: 0.1875rem 0.5rem;
  border-radius: 8px;
}

.event-title {
  margin: 0 0 0.625rem 0;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--foreground);
}

.event-desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0 0 0.875rem 0;
  line-height: 1.6;
}

.event-evidence {
  background: var(--surface-subtle);
  padding: 0.875rem;
  border-radius: 8px;
  margin-bottom: 0.875rem;
  border: 1px solid var(--border);
}

.event-evidence strong {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--muted-foreground);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-evidence pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.8125rem;
  color: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  gap: 1.25rem;
}

.meta-tag {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted-foreground);
  background: var(--surface-subtle);
  border-radius: 8px;
}


</style>
