<template>
  <div class="all-features-layout">
    <div class="all-features-container">
      <div 
        v-for="item in loadedFeatures" 
        :key="item.id" 
        :id="item.id" 
        class="feature-section"
      >
        <FeaturePage :feature="item.data" :featureId="item.id" />
      </div>
      
      <!-- The trigger element for infinite scroll -->
      <div ref="loadTrigger" class="load-trigger">
        <span v-if="loading">Loading more Features...</span>
        <span v-else-if="allLoaded">All Features loaded</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount, nextTick, watch, provide } from 'vue'
import { useRoute } from 'vitepress'
import FeaturePage from './FeaturePage.vue'
import { testStore } from '../store/testStore'

// Initial load
onMounted(() => {
  testStore.loadTestResults()
})

// Extract all features during Vite build to generate lazy-load chunks
// Use @features alias, dynamically resolved by Vite config to actual featuresDir
const featureModules = import.meta.glob('@features/**/*.feature')

// Sort alphabetically or use as-is to extract unique ids
// @ts-ignore
const globPrefix = __FEATURES_GLOB_PREFIX__ || ''

const featureList = Object.entries(featureModules).map(([path, loader]) => {
  // Remove dynamic prefix added at build time
  let relativePath = path
  if (globPrefix && path.startsWith(globPrefix)) {
    relativePath = path.slice(globPrefix.length)
  }
  
  const id = 'feature-' + relativePath.replace(/\\/g, '/').replace(/\//g, '-').replace('.feature', '').toLowerCase()
  return { path, loader, id }
})

const loadedFeatures = shallowRef<any[]>([])
const currentIndex = ref(0)
const loading = ref(false)
const allLoaded = ref(false)
const loadTrigger = ref<HTMLElement | null>(null)

const route = useRoute()

// Progressively load next Feature
const loadNext = async () => {
  if (currentIndex.value >= featureList.length) {
    allLoaded.value = true
    return
  }
  loading.value = true
  const item = featureList[currentIndex.value]
  try {
    const mod: any = await item.loader()
    loadedFeatures.value = [...loadedFeatures.value, { id: item.id, data: mod.default || mod }]
    currentIndex.value++
  } catch (e) {
    console.error('Failed to load feature', e)
  }
  loading.value = false
}

// Rapid load on sidebar click (Jump to hash)
const loadUntilId = async (targetFeatureId: string, scrollTargetId?: string) => {
  const targetIndex = featureList.findIndex(f => f.id === targetFeatureId)
  if (targetIndex !== -1 && targetIndex >= currentIndex.value) {
    loading.value = true
    // To ensure smooth waterfall loading, keep loading until target element
    while (currentIndex.value <= targetIndex) {
      const item = featureList[currentIndex.value]
      const mod: any = await item.loader()
      loadedFeatures.value = [...loadedFeatures.value, { id: item.id, data: mod.default || mod }]
      currentIndex.value++
    }
    loading.value = false
    
    // Wait for DOM render before smooth scrolling (add slight delay to prevent Vue lag on large lists)
    setTimeout(() => {
      const finalId = scrollTargetId || targetFeatureId
      const el = document.getElementById(finalId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }
}

let observer: IntersectionObserver
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    // When trigger enters viewport (or 400px before), and not currently loading, load next
    if (entries[0].isIntersecting && !loading.value && !allLoaded.value) {
      loadNext()
    }
  }, { rootMargin: '400px' })
  
  if (loadTrigger.value) {
    observer.observe(loadTrigger.value)
  }

  const handleHash = () => {
    // Use window.location.hash for most real-time hash, bypassing vitepress route reactivity delay
    const newHash = window.location.hash
    if (newHash) {
      const id = decodeURIComponent(newHash.slice(1)) // e.g. feature-engine-001 or feature-engine-001-scenario-name
      
      // Prefix match: id must be a loadedFeature's id or its prefix (+ '-')
      const exists = loadedFeatures.value.find(f => id === f.id || id.startsWith(f.id + '-'))
      if (!exists) {
        // Find in full list if not loaded
        const targetIndex = featureList.findIndex(f => id === f.id || id.startsWith(f.id + '-'))
        if (targetIndex !== -1) {
          loadUntilId(featureList[targetIndex].id, id)
        }
      } else {
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 50)
      }
    }
  }

  // Watch for VitePress route changes
  watch(() => route.path, () => {
    handleHash()
  })
  
  // Native Hash change listener (to prevent VitePress from swallowing Hash events on same page)
  window.addEventListener('hashchange', handleHash)
  
  // Initial run
  handleHash()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('hashchange', handleHash)
})
</script>

<style scoped>
.all-features-layout {
  display: flex;
  justify-content: space-between;
  gap: 32px;
}

.all-features-container {
  flex: 1;
  max-width: 860px;
  margin: 0 auto;
}

.feature-section {
  /* Separate each Feature using strong margin and dividers */
  margin-bottom: 80px;
  padding-bottom: 40px;
  border-bottom: 2px dashed var(--vp-c-divider);
}

.feature-section:last-of-type {
  border-bottom: none;
}

.load-trigger {
  padding: 60px 20px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
