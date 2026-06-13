<template>
  <div class="language-toggle">
    <button
      :class="{ active: currentLanguage === 'zh' }"
      @click="setLanguage('zh')"
      class="toggle-btn"
    >
      中文
    </button>
    <span class="divider">|</span>
    <button
      :class="{ active: currentLanguage === 'en' }"
      @click="setLanguage('en')"
      class="toggle-btn"
    >
      English
    </button>
  </div>
</template>

<script setup>
import { currentLanguage, setLanguage } from '../i18n'
</script>

<style scoped>
.language-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8f9fa;
  font-size: 0.9rem;
}

.toggle-btn {
  background: transparent;
  border: none;
  border-radius: 999px;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem 0.65rem;
  font-weight: 600;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.toggle-btn:hover {
  color: #2c3e50;
  background: #ffffff;
}

.toggle-btn:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.22);
  outline-offset: 2px;
}

.toggle-btn.active {
  color: #0b5ed7;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.divider {
  color: #dee2e6;
  user-select: none;
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
