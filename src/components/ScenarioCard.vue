<template>
  <div class="scenario-card" :id="scenarioId" :class="{ 'is-background': isBackground }">
    <div class="scenario-header">
      <div class="tags-row" v-if="tags.length">
        <Badge v-for="tag in tags" :key="tag.name" :text="tag.name" @filter="$emit('filter', $event)" />
        
        <div v-if="testData" class="test-status-badge" :class="testData.state">
          <CheckCircle2 v-if="testData.state === 'passed'" :size="14" class="status-icon" title="Test Passed" />
          <XCircle v-else-if="testData.state === 'failed'" :size="14" class="status-icon" title="Test Failed" />
          <CircleMinus v-else :size="14" class="status-icon" title="Unknown / Unexecuted" />
          
          <span class="test-runtime" v-if="testData.runtime">{{ formatRuntime(testData.runtime) }}</span>
          
          <div class="action-buttons">
            <button v-if="testData.label" @click.stop="triggerRun(testData.label)" class="test-source-btn" :title="isThisRunning ? 'Running this scenario...' : 'Run this scenario only'" :disabled="testStore.isRunningTests.value">
              <Loader2 v-if="isThisRunning" class="spinner-small" :size="14" />
              <Play v-else :size="14" />
            </button>
            <button v-if="testData.location" @click.stop="copySourcePath(testData.location)" class="test-source-btn" :title="copied ? 'Copied!' : 'Copy absolute source path'">
              <Check v-if="copied" :size="14" class="text-green-500" />
              <Clipboard v-else :size="14" />
            </button>
          </div>
        </div>
      </div>
      <h3 class="scenario-title">
        <span class="scenario-keyword" :class="{ 'bg-keyword': isBackground }">
          {{ scenario.keyword }}
        </span> 
        <span class="scenario-name">{{ scenario.name }}</span>
      </h3>
    </div>
    
    <div v-if="testData && testData.state === 'failed' && testData.failure" class="test-failure-box">
      <div class="failure-header">⚠️ Test Failure Details</div>
      <pre class="failure-msg">{{ testData.failure.message }}</pre>
      <div class="failure-loc" v-if="testData.failure.location">📍 Location: {{ testData.failure.location }}</div>
    </div>
    
    <div class="step-list-timeline">
      <StepRow v-for="(step, index) in scenario.steps" :key="step.id" :step="step" :isLast="index === scenario.steps.length - 1" />
    </div>

    <!-- For Scenario Outlines: Examples section -->
    <div v-if="scenario.examples && scenario.examples.length > 0" class="examples-section">
      <div v-for="example in scenario.examples" :key="example.id" class="example-block">
        <div class="example-header">
          <span class="example-keyword">{{ example.keyword }}</span> 
          <span class="example-name">{{ example.name }}</span>
        </div>
        <GherkinTable v-if="example.tableBody" :dataTable="{ rows: [example.tableHeader, ...example.tableBody] }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, XCircle, CircleMinus, Play, Loader2, Clipboard, Check } from 'lucide-vue-next'
import { testStore } from '../store/testStore'
import { slugify } from '../utils/slugify'

// @ts-ignore
const tagPatternSource = typeof __BDD_TAG_PATTERN__ !== 'undefined' ? __BDD_TAG_PATTERN__ : '^[A-Z0-9]+_\\d{3}$'
const TAG_PATTERN = new RegExp(tagPatternSource)

const props = defineProps<{
  scenario: any
  featureId?: string
}>()

const scenarioId = computed(() => {
  if (!props.featureId || !props.scenario.name) return undefined
  const safeName = slugify(props.scenario.name)
  return `${props.featureId}-${safeName}`
})

const isThisRunning = ref(false)

const triggerRun = async (tag: string) => {
  if (testStore.isRunningTests.value) return
  isThisRunning.value = true
  try {
    await testStore.runSingleTest(tag)
  } finally {
    isThisRunning.value = false
  }
}

defineEmits(['filter'])

const isBackground = computed(() => {
  return props.scenario.keyword?.trim() === 'Background'
})

const tags = computed(() => {
  return props.scenario.tags || []
})

// Extract the primary BDD label from tags and get test data
const testData = computed(() => {
  for (const tag of tags.value) {
    const tagName = tag.name.replace(/^@/, '')
    if (TAG_PATTERN.test(tagName) && testStore.testResults[tagName]) {
      return { ...testStore.testResults[tagName], label: tagName }
    }
  }
  return null
})

const formatRuntime = (ns: number) => {
  if (ns < 1000) return `${ns}ns`
  if (ns < 1000000) return `${(ns / 1000).toFixed(1)}μs`
  if (ns < 1000000000) return `${(ns / 1000000).toFixed(1)}ms`
  return `${(ns / 1000000000).toFixed(2)}s`
}

const resolveWorkspace = (relPath: string) => {
  return `/home/zfn/distrobox/debian13/workspace/slot_game/${relPath}`
}

const copied = ref(false)
const copySourcePath = async (location: any) => {
  const fullPath = resolveWorkspace(location.FileName) + ':' + location.LineNumber
  try {
    await navigator.clipboard.writeText(fullPath)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
</script>

<style scoped>
.scenario-card {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  background-color: var(--vp-c-bg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.scenario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  border-color: var(--vp-c-brand-1);
}

.scenario-card.is-background {
  background-color: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand-2);
}

.scenario-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.tags-row {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.scenario-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.25rem;
  margin: 0;
  color: var(--vp-c-text-1);
}

.scenario-keyword {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  padding: 4px 10px;
  border-radius: 6px;
}
.bg-keyword {
  color: var(--vp-c-brand-2);
  background: var(--gherkin-given-bg);
}

.step-list-timeline {
  display: flex;
  flex-direction: column;
  padding-left: 8px; /* For the timeline */
}

.examples-section {
  margin-top: 24px;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 20px;
}

.example-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--vp-c-text-1);
}

.example-keyword {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  padding: 2px 8px;
  border-radius: 6px;
}

/* Test Status Badge */
.test-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.status-icon {
  flex-shrink: 0;
}

.test-status-badge.passed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.test-status-badge.failed {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.test-runtime {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.test-source-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.test-source-btn:hover:not(:disabled) {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
}
.test-source-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.text-green-500 {
  color: #10b981;
}

.spinner-small {
  display: inline-block;
  animation: spin 2s linear infinite;
  font-size: 0.9em;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Test Failure Box */
.test-failure-box {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.05);
  border-left: 4px solid #ef4444;
  border-radius: 0 8px 8px 0;
}

.failure-header {
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.failure-msg {
  margin: 0 0 12px 0;
  padding: 12px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border-radius: 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.failure-loc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}
</style>
