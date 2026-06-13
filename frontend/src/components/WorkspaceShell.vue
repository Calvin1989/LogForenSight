<template>
  <div class="workspace-shell" data-testid="workspace-shell">
    <aside class="shell-nav">
      <div class="shell-nav-inner">
        <slot name="nav" />
      </div>
    </aside>

    <section class="shell-content">
      <div class="shell-content-inner">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.workspace-shell {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.shell-nav {
  min-width: 0;
}

.shell-nav-inner {
  position: sticky;
  top: 1rem;
}

.shell-content {
  min-width: 0;
}

.shell-content-inner {
  min-width: 0;
}

@media (max-width: 1024px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .shell-nav-inner {
    position: static;
  }
}

@media (max-width: 390px) {
  .workspace-shell {
    gap: 0.75rem;
  }
}
</style>
