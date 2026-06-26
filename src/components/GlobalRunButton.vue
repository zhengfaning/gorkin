<template>
  <div class="global-run-container">
    <button class="global-run-btn" :disabled="testStore.isRunningTests.value" @click="testStore.runAllTests()" :title="testStore.isRunningTests.value ? 'Tests are running...' : 'Run all tests'">
      <Loader2 v-if="testStore.isRunningTests.value" class="spinner" :size="16" />
      <div v-else class="btn-content"><Play :size="16" /> Run All Tests</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Play, Loader2 } from 'lucide-vue-next'
import { testStore } from '../store/testStore'
</script>

<style scoped>
.global-run-container {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.global-run-btn {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 32px;
}

.global-run-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  transform: scale(1.02);
}

.global-run-btn:disabled {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  display: inline-block;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
