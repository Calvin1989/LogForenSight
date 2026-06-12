<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow', $attrs.class)">
    <slot />
  </div>
</template>
