<template>
  <div class="feature-page">
    <div class="feature-hero">
      <div class="feature-hero-content">
        <div class="tags-row" v-if="tags.length">
          <Badge v-for="tag in tags" :key="tag.name" :text="tag.name" @filter="handleFilter" />
        </div>
        <div class="feature-title-wrapper">
          <span class="feature-keyword">{{ feature.keyword }}</span>
          <h1 class="feature-title">{{ feature.name }}</h1>
        </div>
        <p class="feature-desc" v-if="feature.description">{{ feature.description.trim() }}</p>
      </div>
      <div class="hero-glow"></div>
    </div>

    <div class="content-body">
      <!-- Render feature-level Background -->
      <div v-if="featureBackground" class="feature-background">
        <ScenarioCard :scenario="featureBackground" :featureId="featureId" @filter="handleFilter" />
      </div>

      <!-- Render Scenarios that don't belong to any Rule -->
      <div v-for="child in rootScenarios" :key="child.id">
        <ScenarioCard v-if="child.scenario" :scenario="child.scenario" :featureId="featureId" @filter="handleFilter" />
      </div>

      <!-- Render Rules -->
      <RuleSection v-for="child in rules" :key="child.id" :title="child.rule.name">
        <div v-if="child.rule.description" class="rule-desc">{{ child.rule.description.trim() }}</div>
        
        <!-- Render Scenarios/Backgrounds under the rule -->
        <div class="rule-children">
          <div v-for="ruleChild in child.rule.children" :key="ruleChild.id">
            <ScenarioCard 
              v-if="ruleChild.background" 
              :scenario="ruleChild.background" 
              :featureId="featureId"
              @filter="handleFilter" 
            />
            <ScenarioCard 
              v-if="ruleChild.scenario" 
              :scenario="ruleChild.scenario" 
              :featureId="featureId"
              @filter="handleFilter" 
            />
          </div>
        </div>
      </RuleSection>
    </div>

    <!-- Global Tag Filter Overlay (optional) -->
    <div v-if="activeFilter" class="filter-toast">
      Currently filtering by: <Badge :text="activeFilter" /> 
      <button @click="clearFilter" class="clear-btn">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  feature: any
  featureId?: string
}>()

const activeFilter = ref<string | null>(null)

const handleFilter = (tag: string) => {
  activeFilter.value = tag
}
const clearFilter = () => {
  activeFilter.value = null
}

const tags = computed(() => {
  return props.feature.tags || []
})

const children = computed(() => {
  return props.feature.children || []
})

const featureBackground = computed(() => {
  const child = children.value.find((c: any) => c.background)
  return child ? child.background : null
})

const rootScenarios = computed(() => {
  return children.value.filter((c: any) => c.scenario)
})

const rules = computed(() => {
  return children.value.filter((c: any) => c.rule)
})
</script>

<style scoped>
.feature-page {
  padding: 0 0 40px 0;
  max-width: 960px;
  margin: 0 auto;
}

.feature-hero {
  position: relative;
  padding: 20px 24px;
  margin-bottom: 32px;
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}
.dark .feature-hero {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.hero-glow {
  position: absolute;
  top: -20%;
  right: -5%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.feature-hero-content {
  position: relative;
  z-index: 1;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.feature-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.feature-keyword {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  background: var(--gherkin-given-bg);
  padding: 4px 10px;
  border-radius: 8px;
}

.feature-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.feature-desc {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  max-width: 800px;
  opacity: 0.85;
}

.content-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rule-desc {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
  font-size: 1.05rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.rule-children {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Toast */
.filter-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.clear-btn {
  background: var(--vp-c-default-soft);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover {
  background: var(--vp-c-brand-1);
  color: white;
}
</style>
