<template>
  <div class="workspace-shell">
    <aside class="shell-nav">
      <slot name="nav" />
    </aside>

    <section class="shell-content">
      <slot />
    </section>
  </div>
</template>

<style scoped>
.workspace-shell {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.shell-nav {
  min-width: 0;
}

.shell-content {
  min-width: 0;
}

@media (max-width: 960px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }
}
</style>
