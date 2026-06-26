<template>
  <div class="gherkin-table-wrapper">
    <table class="gherkin-table">
      <thead v-if="hasHeader">
        <tr>
          <th v-for="(cell, idx) in dataTable.rows[0].cells" :key="idx" class="gherkin-mono">
            {{ cell.value }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in bodyRows" :key="rIdx">
          <td v-for="(cell, cIdx) in row.cells" :key="cIdx" class="gherkin-mono">
            {{ cell.value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  dataTable: any
}>()

// Assume first row is header
const hasHeader = computed(() => {
  return props.dataTable?.rows?.length > 1
})

const bodyRows = computed(() => {
  if (!props.dataTable?.rows) return []
  return hasHeader.value ? props.dataTable.rows.slice(1) : props.dataTable.rows
})
</script>

<style scoped>
.gherkin-table-wrapper {
  overflow-x: auto;
  margin: 8px 0;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.gherkin-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  background-color: var(--vp-c-bg);
}

.gherkin-table th,
.gherkin-table td {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  text-align: left;
  font-size: 0.9em;
}

.gherkin-table th {
  background-color: var(--vp-c-bg-mute);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.gherkin-table tbody tr:nth-child(even) {
  background-color: var(--vp-c-bg-soft);
}

.gherkin-table tbody tr:hover {
  background-color: var(--vp-c-default-soft);
}
</style>
