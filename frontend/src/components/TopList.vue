<template>
  <section class="result-card">
    <h2>{{ title }}</h2>
    <table>
      <thead>
        <tr>
          <th>{{ itemLabel }}</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td class="item-cell" :title="item[itemKey]">{{ item[itemKey] }}</td>
          <td>{{ item.count }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  items: {
    type: Array,
    required: true
  },
  itemKey: {
    type: String,
    required: true
  },
  itemLabel: {
    type: String,
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

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
}

th {
  color: #6c757d;
  font-weight: 600;
  font-size: 0.875rem;
}

.item-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
