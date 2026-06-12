<template>
  <nav
    class="workspace-nav"
    :aria-label="t('workspaceNav.ariaLabel')"
    data-testid="workspace-nav"
  >
    <div class="nav-header">
      <h2>{{ t('workspaceNav.title') }}</h2>
      <p>{{ t('workspaceNav.subtitle') }}</p>
    </div>

    <div class="nav-list">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: item.key === activeView }"
        :aria-current="item.key === activeView ? 'page' : undefined"
        :disabled="item.disabled"
        :title="item.disabled ? t(item.disabledReasonKey || 'workspaceNav.requiresAnalysis') : ''"
        :data-testid="`workspace-nav-${item.key}`"
        @click="$emit('select', item.key)"
      >
        <span class="nav-label">{{ t(item.labelKey) }}</span>
        <span v-if="item.disabled" class="nav-state">{{ t('workspaceNav.locked') }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { t } from '../i18n'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  activeView: {
    type: String,
    required: true
  }
})

defineEmits(['select'])
</script>

<style scoped>
.workspace-nav {
  position: sticky;
  top: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  background: #f8f9fa;
  padding: 1rem;
}

.nav-header {
  margin-bottom: 0.9rem;
}

.nav-header h2 {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  color: #212529;
}

.nav-header p {
  margin: 0;
  font-size: 0.88rem;
  color: #6c757d;
}

.nav-list {
  display: grid;
  gap: 0.55rem;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  color: #212529;
  padding: 0.75rem 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.nav-item:hover:not(:disabled) {
  background: #eef7ff;
  border-color: #b6d4fe;
  transform: translateY(-1px);
}

.nav-item.active {
  background: #e7f5ff;
  border-color: #74c0fc;
  color: #0b5ed7;
}

.nav-item:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  background: #f1f3f5;
}

.nav-label {
  font-size: 0.94rem;
  font-weight: 600;
}

.nav-state {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #868e96;
}

@media (max-width: 960px) {
  .workspace-nav {
    position: static;
  }
}
</style>
