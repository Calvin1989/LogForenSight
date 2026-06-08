<template>
  <section class="result-card">
    <h2>Overview Statistics</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Total Requests</span>
        <span class="stat-value">{{ summary.total_requests }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Unique IPs</span>
        <span class="stat-value">{{ summary.unique_ips }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">4xx Errors</span>
        <span class="stat-value">{{ summary.total_4xx }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">5xx Errors</span>
        <span class="stat-value">{{ summary.total_5xx }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.result-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.result-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #495057;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}
</style>
