<template>
  <div class="step-row-timeline gherkin-font">
    <!-- Timeline node and line -->
    <div class="timeline-visual">
      <div class="timeline-node" :class="keywordTheme"></div>
      <div v-if="!isLast" class="timeline-line"></div>
    </div>

    <!-- Step Content -->
    <div class="step-content-wrapper">
      <div class="step-text-line">
        <span :class="['keyword-pill', keywordTheme]">{{ step.keyword.trim() }}</span>
        <span class="text" v-html="formattedText"></span>
      </div>
      
      <!-- Render nested DataTable or DocString if present -->
      <div v-if="step.dataTable" class="step-addon">
        <GherkinTable :dataTable="step.dataTable" />
      </div>
      <div v-if="step.docString" class="step-addon">
        <CodeBlock :content="step.docString.content" :lang="step.docString.mediaType" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  step: any
  isLast?: boolean
}>()

const keywordTheme = computed(() => {
  const kw = props.step.keyword.trim().toLowerCase()
  if (kw === 'given') return 'theme-given'
  if (kw === 'when') return 'theme-when'
  if (kw === 'then') return 'theme-then'
  if (kw === 'and' || kw === 'but' || kw === '*') return 'theme-and'
  return ''
})

const formattedText = computed(() => {
  let text = props.step.text || ''
  
  // 1. Basic HTML escaping first
  text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  
  // 2. Highlight <param> placeholders (Pill style)
  text = text.replace(/&lt;([^&]+)&gt;/g, '<span class="param-pill gherkin-mono">&lt;$1&gt;</span>')

  // 3. Highlight "string" literals (Pill style)
  text = text.replace(/"([^"]*)"/g, '<span class="str-pill gherkin-mono">"$1"</span>')
  
  return text
})
</script>

<style scoped>
.step-row-timeline {
  display: flex;
  position: relative;
  margin-bottom: 0;
}

/* --- Timeline Visuals --- */
.timeline-visual {
  position: relative;
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px; /* Align with first line of text */
  background: var(--vp-c-text-3);
  box-shadow: 0 0 0 4px var(--vp-c-bg);
  z-index: 2;
}

.timeline-line {
  position: absolute;
  top: 18px;
  bottom: -6px; /* Connect to next node */
  width: 2px;
  background: var(--gherkin-timeline-line);
  z-index: 1;
}

/* --- Content Layout --- */
.step-content-wrapper {
  flex: 1;
  padding-bottom: 24px; /* Space between steps */
  min-width: 0; /* Prevent flex overflow */
}

.step-text-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  line-height: 1.6;
}

/* --- Keyword Pills --- */
.keyword-pill {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 12px;
  user-select: none;
}

.theme-given { background: var(--gherkin-given-bg); color: var(--gherkin-given-text); }
.theme-when { background: var(--gherkin-when-bg); color: var(--gherkin-when-text); }
.theme-then { background: var(--gherkin-then-bg); color: var(--gherkin-then-text); }
.theme-and { background: var(--gherkin-and-bg); color: var(--gherkin-and-text); }

/* --- Text Styles --- */
.text {
  font-size: 1.05rem;
  color: var(--vp-c-text-1);
}

.text :deep(.str-pill) {
  display: inline-block;
  color: var(--gherkin-string-text);
  background: var(--gherkin-string-bg);
  border: 1px solid var(--gherkin-string-border);
  padding: 0 6px;
  border-radius: 6px;
  font-size: 0.9em;
  margin: 0 4px;
}

.text :deep(.param-pill) {
  display: inline-block;
  color: var(--gherkin-param-text);
  background: var(--gherkin-param-bg);
  border: 1px solid var(--gherkin-param-border);
  padding: 0 6px;
  border-radius: 6px;
  font-size: 0.9em;
  margin: 0 4px;
}

/* --- Addons (Tables/Code) --- */
.step-addon {
  margin-top: 12px;
}
</style>
