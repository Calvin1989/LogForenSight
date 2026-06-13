<template>
  <Card class="rule-card">
    <CardHeader>
      <div class="header">
        <CardTitle>{{ t('ruleConfig.title', 'Active Rule Configuration') }}</CardTitle>
        <span class="source-tag" :class="sourceClass">{{ rules.source }}</span>
      </div>
    </CardHeader>
    <CardContent>
      <div class="rules-grid">
        <div class="rule-item">
          <label>{{ t('ruleConfig.highFrequencyThreshold', 'High Frequency Threshold') }}</label>
          <div class="value">{{ rules.high_frequency_threshold }} {{ t('ruleConfig.requests', 'requests') }}</div>
        </div>
        <div class="rule-item">
          <label>{{ t('ruleConfig.pathScanningThreshold', 'Path Scanning Threshold') }}</label>
          <div class="value">{{ rules.path_scanning_404_threshold }} 404s</div>
        </div>
      </div>

      <div class="list-section">
        <label>{{ t('ruleConfig.sensitivePaths', 'Sensitive Paths') }}</label>
        <div class="tag-container">
          <span v-for="path in rules.sensitive_paths" :key="path" class="tag path-tag">
            {{ path }}
          </span>
        </div>
      </div>

      <div class="list-section">
        <label>{{ t('ruleConfig.suspiciousUserAgents', 'Suspicious User-Agents') }}</label>
        <div class="tag-container">
          <span v-for="ua in rules.suspicious_user_agents" :key="ua" class="tag ua-tag">
            {{ ua }}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { t } from '../i18n'

const props = defineProps({
  rules: {
    type: Object,
    required: true
  }
})

const sourceClass = computed(() => {
  return props.rules.source === 'default' ? 'source-default' : 'source-custom'
})
</script>

<style scoped>
.rule-card {
  margin-bottom: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #495057;
}

.source-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.source-default {
  background: #e9ecef;
  color: #6c757d;
}

.source-custom {
  background: #e7f5ff;
  color: #228be6;
}

.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.rule-item label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #868e96;
  margin-bottom: 0.25rem;
}

.rule-item .value {
  font-weight: 600;
  color: #212529;
}

.list-section {
  margin-bottom: 1rem;
}

.list-section:last-child {
  margin-bottom: 0;
}

.list-section label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #868e96;
  margin-bottom: 0.5rem;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-family: monospace;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.path-tag {
  background: #fff4e6;
  color: #d9480f;
}

.ua-tag {
  background: #f3f0ff;
  color: #5f3dc4;
}
</style>
