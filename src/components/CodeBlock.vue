<template>
  <div class="gherkin-codeblock-wrapper">
    <div v-if="lang" class="lang-tag">{{ lang }}</div>
    <button class="copy-btn" @click="copyText">{{ copyLabel }}</button>
    <pre class="gherkin-codeblock"><code>{{ content }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
  lang?: string
}>()

const copyLabel = ref('📋 Copy')

const copyText = () => {
  navigator.clipboard.writeText(props.content).then(() => {
    copyLabel.value = '✅ Copied'
    setTimeout(() => {
      copyLabel.value = '📋 Copy'
    }, 2000)
  })
}
</script>

<style scoped>
.gherkin-codeblock-wrapper {
  position: relative;
  margin: 16px 0;
  border-radius: 8px;
  background-color: var(--vp-code-block-bg, #1e1e1e);
  overflow: hidden;
}

.lang-tag {
  position: absolute;
  top: 8px;
  right: 80px;
  font-size: 0.75rem;
  color: #888;
  font-family: 'JetBrains Mono', monospace;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #333;
  color: #fff;
}

.gherkin-codeblock {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  color: #d4d4d4;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
  line-height: 1.5;
}
</style>
