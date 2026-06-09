<script setup>
import { ref, watch, computed } from 'vue';
import { currentAnalysisResult } from '../composables/useAnalysisState';
import { t } from '../i18n';

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({
      high_frequency_threshold: 10,
      path_scanning_404_threshold: 5,
      sensitive_paths: [],
      suspicious_user_agents: []
    })
  },
  isAnalyzing: {
    type: Boolean,
    default: false
  },
  hasFile: {
    type: Boolean,
    default: false
  },
  warnings: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['apply', 'reset']);

const highFrequencyThreshold = ref(props.initialConfig.high_frequency_threshold);
const pathScanningThreshold = ref(props.initialConfig.path_scanning_404_threshold);
const sensitivePathsText = ref(props.initialConfig.sensitive_paths.join('\n'));
const suspiciousUserAgentsText = ref(props.initialConfig.suspicious_user_agents.join('\n'));
const disabledRules = ref([]);

const availableRules = computed(() => [
  { id: 'high_frequency_ip', label: t('ruleTuning.rules.high_frequency_ip') },
  { id: 'path_scanning', label: t('ruleTuning.rules.path_scanning') },
  { id: 'sensitive_path_probe', label: t('ruleTuning.rules.sensitive_path_probe') },
  { id: 'suspicious_user_agent', label: t('ruleTuning.rules.suspicious_user_agent') }
]);

const tuningSummary = computed(() => {
  const disabledCount = disabledRules.value.length;
  const activeCount = availableRules.value.length - disabledCount;
  return {
    highFreq: highFrequencyThreshold.value,
    pathScan: pathScanningThreshold.value,
    activeCount,
    disabledCount
  };
});

watch(() => props.initialConfig, (newConfig) => {
  highFrequencyThreshold.value = newConfig.high_frequency_threshold;
  pathScanningThreshold.value = newConfig.path_scanning_404_threshold;
  sensitivePathsText.value = newConfig.sensitive_paths.join('\n');
  suspiciousUserAgentsText.value = newConfig.suspicious_user_agents.join('\n');
}, { deep: true });

const handleApply = () => {
  const overrides = {
    high_frequency_threshold: parseInt(highFrequencyThreshold.value),
    path_scanning_404_threshold: parseInt(pathScanningThreshold.value),
    sensitive_paths: sensitivePathsText.value.split('\n').map(p => p.trim()).filter(p => p),
    suspicious_user_agents: suspiciousUserAgentsText.value.split('\n').map(ua => ua.trim()).filter(ua => ua),
    disabled_rules: disabledRules.value
  };
  emit('apply', overrides);
};

const handleReset = () => {
  highFrequencyThreshold.value = props.initialConfig.high_frequency_threshold;
  pathScanningThreshold.value = props.initialConfig.path_scanning_404_threshold;
  sensitivePathsText.value = props.initialConfig.sensitive_paths.join('\n');
  suspiciousUserAgentsText.value = props.initialConfig.suspicious_user_agents.join('\n');
  disabledRules.value = [];
  emit('reset');
};

const isValid = computed(() => {
  return highFrequencyThreshold.value >= 1 && pathScanningThreshold.value >= 1;
});

const isBatchAnalysis = computed(() => currentAnalysisResult.value?.analysis_mode === 'batch');
</script>

<template>
  <div class="rule-tuning-panel card">
    <div class="card-header">
      <div class="header-content">
        <h3>{{ t('ruleTuning.title') }}</h3>
        <p class="subtitle">{{ t('ruleTuning.subtitle') }}</p>
      </div>
    </div>

    <div class="card-body">
      <div v-if="!hasFile" class="empty-state">
        <p>{{ t('ruleTuning.noFile') }}</p>
      </div>

      <div v-else class="tuning-form">
        <div class="notice">
          <span class="icon">ℹ️</span>
          {{ t('ruleTuning.temporaryNotice') }}
          <br />
          <small>{{ t('ruleTuning.memoryOnly') }}</small>
          <small v-if="isBatchAnalysis" class="batch-hint">{{ t('ruleTuning.batchHint') }}</small>
        </div>

        <div class="tuning-summary-box">
          <strong>{{ t('ruleTuning.currentSummary') }}:</strong>
          <div class="summary-items">
            <span>{{ t('ruleTuning.highFrequencyThreshold') }}: {{ tuningSummary.highFreq }}</span>
            <span>{{ t('ruleTuning.pathScanningThreshold') }}: {{ tuningSummary.pathScan }}</span>
            <span>{{ tuningSummary.activeCount }} {{ t('ruleTuning.activeRules') }}</span>
            <span v-if="tuningSummary.disabledCount > 0" class="disabled-count">
              {{ tuningSummary.disabledCount }} {{ t('ruleTuning.disabledRulesCount') }}
            </span>
          </div>
        </div>

        <div v-if="warnings.length > 0" class="warnings-box">
          <strong>{{ t('ruleTuning.warnings') }}:</strong>
          <ul>
            <li v-for="(warning, index) in warnings" :key="index">{{ warning }}</li>
          </ul>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>{{ t('ruleTuning.highFrequencyThreshold') }}</label>
            <input
              type="number"
              v-model="highFrequencyThreshold"
              min="1"
              class="form-control"
              :disabled="isAnalyzing"
            />
            <p v-if="highFrequencyThreshold < 1" class="error-text">{{ t('ruleTuning.invalidThreshold') }}</p>
          </div>

          <div class="form-group">
            <label>{{ t('ruleTuning.pathScanningThreshold') }}</label>
            <input
              type="number"
              v-model="pathScanningThreshold"
              min="1"
              class="form-control"
              :disabled="isAnalyzing"
            />
            <p v-if="pathScanningThreshold < 1" class="error-text">{{ t('ruleTuning.invalidThreshold') }}</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>{{ t('ruleTuning.sensitivePaths') }}</label>
            <textarea
              v-model="sensitivePathsText"
              class="form-control"
              rows="4"
              :placeholder="t('ruleTuning.placeholderPaths')"
              :disabled="isAnalyzing"
            ></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('ruleTuning.suspiciousUserAgents') }}</label>
            <textarea
              v-model="suspiciousUserAgentsText"
              class="form-control"
              rows="4"
              :placeholder="t('ruleTuning.placeholderUserAgents')"
              :disabled="isAnalyzing"
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('ruleTuning.disabledRules') }}</label>
          <div class="checkbox-grid">
            <label v-for="rule in availableRules" :key="rule.id" class="checkbox-label">
              <input
                type="checkbox"
                :value="rule.id"
                v-model="disabledRules"
                :disabled="isAnalyzing"
              />
              {{ rule.label }}
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="handleApply"
            class="btn btn-primary"
            :disabled="isAnalyzing || !isValid"
          >
            {{ isAnalyzing ? t('ruleTuning.loading') : t('ruleTuning.apply') }}
          </button>
          <button
            @click="handleReset"
            class="btn btn-secondary"
            :disabled="isAnalyzing"
          >
            {{ t('ruleTuning.reset') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rule-tuning-panel {
  margin-top: 2rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.notice {
  background-color: var(--bg-info-light);
  border-left: 4px solid var(--info-color);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border-radius: 4px;
}

.notice small {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.8;
}

.batch-hint {
  font-weight: 600;
}

.tuning-summary-box {
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.summary-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  color: var(--text-light);
}

.disabled-count {
  color: var(--danger-color);
  font-weight: 600;
}

.warnings-box {
  background-color: var(--bg-warning-light);
  border: 1px solid var(--warning-color);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.warnings-box ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
}

.form-control {
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  background-color: var(--bg-input);
  color: var(--text-main);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.error-text {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin: 0;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  background-color: var(--bg-input);
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-style: italic;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:not(:disabled):hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:not(:disabled):hover {
  background-color: var(--bg-secondary-hover);
}
</style>
