<template>
  <div class="language-toggle">
    <Button
      variant="ghost"
      size="sm"
      :class="{ active: currentLanguage === 'zh' }"
      @click="setLanguage('zh')"
    >
      中文
    </Button>
    <span class="divider">|</span>
    <Button
      variant="ghost"
      size="sm"
      :class="{ active: currentLanguage === 'en' }"
      @click="setLanguage('en')"
    >
      English
    </Button>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
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
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-subtle);
  font-size: 0.9rem;
}

.language-toggle :deep(button) {
  border-radius: 999px;
  font-weight: 600;
}

.language-toggle :deep(button).active {
  color: #0b5ed7;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.divider {
  color: var(--border);
  user-select: none;
}

</style>
