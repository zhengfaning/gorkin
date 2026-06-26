<template>
  <details class="rule-section" open>
    <summary class="rule-summary">
      <div class="rule-title-wrapper">
        <span class="rule-keyword">Rule</span>
        <h2 class="rule-title">{{ title }}</h2>
      </div>
      <div class="rule-toggle-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </summary>
    <div class="rule-content">
      <slot></slot>
    </div>
  </details>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.rule-section {
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  transition: box-shadow 0.3s ease;
}
.rule-section:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.rule-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: transparent;
  cursor: pointer;
  user-select: none;
  list-style: none; /* Hide default arrow */
}
.rule-summary::-webkit-details-marker {
  display: none;
}

.rule-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-bottom: none;
  padding: 0;
}

.rule-keyword {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
  background: var(--gherkin-given-bg);
  padding: 4px 10px;
  border-radius: 8px;
}

.rule-toggle-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--vp-c-default-soft);
}

details[open] .rule-toggle-icon {
  transform: rotate(180deg);
}
details[open] .rule-summary {
  border-bottom: 1px solid var(--vp-c-divider);
}

.rule-content {
  padding: 24px;
  background: var(--vp-c-bg);
}
</style>
