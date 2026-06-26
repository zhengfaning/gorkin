<template>
  <span class="gherkin-badge" @click="$emit('filter', text)">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
defineEmits(['filter'])
</script>

<style scoped>
.gherkin-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  background-color: var(--gherkin-tag-bg);
  color: var(--gherkin-tag-text);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}
.gherkin-badge:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}
</style>
