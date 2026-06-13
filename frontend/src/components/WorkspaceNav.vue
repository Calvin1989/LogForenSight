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
        <span class="nav-item-copy">
          <span class="nav-label-row">
            <span class="nav-label">{{ t(item.labelKey) }}</span>
            <span
              v-if="item.key === activeView"
              class="nav-indicator"
              aria-hidden="true"
            ></span>
          </span>
          <span v-if="item.descriptionKey" class="nav-description">
            {{ t(item.descriptionKey) }}
          </span>
        </span>
        <span class="nav-state" :class="{ locked: item.disabled, active: item.key === activeView }">
          {{ item.disabled ? t('workspaceNav.locked') : item.key === activeView ? t('workspaceNav.current') : t('workspaceNav.available') }}
        </span>
      </button>
    </div>

    <p class="nav-footer" data-testid="workspace-nav-helper">
      {{ t('workspaceNav.footerHint') }}
    </p>
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
  top: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, var(--surface-elevated) 0%, var(--shell-bg) 100%);
  padding: 1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.nav-header {
  margin-bottom: 1rem;
}

.nav-header h2 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: var(--foreground);
}

.nav-header p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--muted-foreground);
}

.nav-list {
  display: grid;
  gap: 0.6rem;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-elevated);
  color: var(--foreground);
  padding: 0.9rem 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.nav-item:hover:not(:disabled) {
  background: #f4f9ff;
  border-color: #b6d4fe;
  box-shadow: 0 10px 24px rgba(11, 94, 215, 0.08);
}

.nav-item:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.22);
  outline-offset: 2px;
}

.nav-item.active {
  background: linear-gradient(180deg, #edf7ff 0%, #e7f5ff 100%);
  border-color: #74c0fc;
  color: #0b5ed7;
  box-shadow: 0 12px 30px rgba(26, 127, 213, 0.12);
}

.nav-item:disabled {
  cursor: not-allowed;
  opacity: 0.78;
  background: var(--surface-subtle);
}

.nav-item-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  flex: 1;
}

.nav-label-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.nav-label {
  font-size: 0.95rem;
  font-weight: 700;
}

.nav-indicator {
  flex-shrink: 0;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #1c7ed6;
  box-shadow: 0 0 0 3px rgba(28, 126, 214, 0.16);
}

.nav-description {
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--muted-foreground);
}

.nav-state {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #1c7ed6;
  background: #e7f5ff;
  border: 1px solid #a5d8ff;
  border-radius: 999px;
  padding: 0.22rem 0.6rem;
}

.nav-state.locked {
  color: var(--text-tertiary);
  background: var(--surface-subtle);
  border-color: var(--border);
}

.nav-state.active {
  color: #1864ab;
  background: #d0ebff;
  border-color: #74c0fc;
}

.nav-footer {
  margin: 1rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--muted-foreground);
}

@media (max-width: 960px) {
  .workspace-nav {
    position: static;
  }
}

@media (max-width: 768px) {
  .workspace-nav {
    padding: 0.9rem;
  }

  .nav-item {
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.85rem;
  }
}

</style>
