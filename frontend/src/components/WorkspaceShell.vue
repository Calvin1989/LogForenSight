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
  grid-template-columns: minmax(16rem, 19rem) minmax(0, 1fr);
  gap: 1.75rem;
  align-items: start;
}

.shell-nav {
  min-width: 0;
}

.shell-nav-inner {
  position: sticky;
  top: 1.5rem;
}

.shell-content {
  min-width: 0;
}

.shell-content-inner {
  border: 1px solid #e9ecef;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  padding: 1.5rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

@media (max-width: 960px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .shell-nav-inner {
    position: static;
  }
}

@media (max-width: 768px) {
  .shell-content-inner {
    padding: 1rem;
    border-radius: 14px;
  }
}
</style>
