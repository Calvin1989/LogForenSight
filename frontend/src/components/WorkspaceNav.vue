<template>
  <nav
    class="workspace-nav"
    :aria-label="t('workspaceNav.ariaLabel')"
    data-testid="workspace-nav"
  >
    <div class="nav-header">
      <h2>{{ t('workspaceNav.title') }}</h2>
    </div>

    <div class="nav-list">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: item.key === activeView, disabled: item.disabled }"
        :aria-current="item.key === activeView ? 'page' : undefined"
        :disabled="item.disabled"
        :title="item.disabled ? t(item.disabledReasonKey || 'workspaceNav.requiresAnalysis') : t(item.descriptionKey || '')"
        :data-testid="`workspace-nav-${item.key}`"
        @click="$emit('select', item.key)"
      >
        <span class="nav-label">{{ t(item.labelKey) }}</span>
        <span
          class="nav-dot"
          :class="{ active: item.key === activeView, locked: item.disabled }"
          aria-hidden="true"
        ></span>
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
  top: 1rem;
}

.nav-header {
  margin-bottom: 0.5rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--border);
}

.nav-header h2 {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: none;
  border-radius: 0;
  background: var(--surface-elevated);
  color: var(--foreground);
  padding: 0.5rem 0.625rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.nav-item:hover:not(:disabled) {
  background: var(--surface-subtle);
}

.nav-item:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
  z-index: 1;
}

.nav-item.active {
  background: var(--accent);
  font-weight: 600;
  border-left: 2px solid var(--primary);
  padding-left: calc(0.625rem - 2px);
}

.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.4;
  color: var(--text-tertiary);
}

.nav-label {
  font-size: 0.8125rem;
  font-weight: inherit;
  color: inherit;
}

.nav-dot {
  flex-shrink: 0;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 999px;
  background: transparent;
  border: 1.5px solid var(--border);
}

.nav-dot.active {
  background: var(--primary);
  border-color: var(--primary);
}

.nav-dot.locked {
  background: transparent;
  border-color: var(--border);
}

.nav-item.active .nav-dot {
  transform: scale(1.2);
}

@media (max-width: 960px) {
  .workspace-nav {
    position: static;
  }
}

@media (max-width: 390px) {
  .nav-item {
    padding: 0.4375rem 0.5rem;
  }

  .nav-label {
    font-size: 0.75rem;
  }
}
</style>
