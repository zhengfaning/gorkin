import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { gherkinPlugin } from '../plugins/vite-plugin-gherkin'
import { testRunnerPlugin } from '../plugins/vite-plugin-test-runner'
import { slugify } from '../src/utils/slugify'

const require = createRequire(import.meta.url)
const { loadConfig } = require('../src/config/loader')

const gorkinConfig = loadConfig()
const rootFeaturesDir = gorkinConfig.featuresDir
const shadowMdDir = path.resolve(__dirname, '../src/features')

// Calculate the relative path from srcDir to rootFeaturesDir.
// Vite's import.meta.glob resolves aliases to absolute paths, and then serializes them 
// as relative paths from the Vite root (which is 'src').
const srcDir = path.resolve(__dirname, '../src')
let globPrefix = path.relative(srcDir, rootFeaturesDir).replace(/\\/g, '/')
if (!globPrefix.endsWith('/')) {
  globPrefix += '/'
}
if (!globPrefix.startsWith('.')) {
  globPrefix = './' + globPrefix
}

function generateSidebar(dir: string): any[] {
  const items: any[] = []
  if (!fs.existsSync(dir)) return items;

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      items.push({
        text: file.charAt(0).toUpperCase() + file.slice(1),
        collapsed: false,
        items: generateSidebar(fullPath)
      })
    } else if (file.endsWith('.feature')) {
      const relativeToRoot = path.relative(rootFeaturesDir, fullPath)
      
      // Read file content to extract the actual business title
      const content = fs.readFileSync(fullPath, 'utf-8')
      // Match "Feature: xxx" or "特性: xxx"
      const featureMatch = content.match(/^(?:Feature|特性):\s*(.+)$/m)
      let featureName = file.replace('.feature', '')
      if (featureMatch && featureMatch[1]) {
        featureName = featureMatch[1].trim()
      }
      
      // Generate HTML ID compliant anchor: convert relative path separators to dashes
      const anchorId = 'feature-' + relativeToRoot.replace(/\\/g, '/').replace(/\//g, '-').replace('.feature', '').toLowerCase()
      
      // Extract all Scenario / Scenario Outline
      const subItems: any[] = []
      const scenarioRegex = /^\s*(?:Scenario|Scenario Outline|场景|场景大纲):\s*(.+)$/gm
      let match
      while ((match = scenarioRegex.exec(content)) !== null) {
        const scenarioName = match[1].trim()
        const safeName = slugify(scenarioName)
        subItems.push({
          text: scenarioName,
          link: '/#' + anchorId + '-' + safeName
        })
      }

      items.push({
        text: featureName,
        link: '/#' + anchorId,
        collapsed: true,
        items: subItems.length > 0 ? subItems : undefined
      })
    }
  }
  return items
}

const sidebarFeatures = generateSidebar(rootFeaturesDir)

export default defineConfig({
  title: gorkinConfig.title,
  description: gorkinConfig.description,
  srcDir: 'src',
  outDir: '.vitepress/dist',
  
  themeConfig: {
    sidebar: {
      '/': sidebarFeatures
    },
    search: {
      provider: 'local'
    }
  },

  vite: {
    plugins: [
      gherkinPlugin(),
      testRunnerPlugin()
    ],
    resolve: {
      alias: {
        '@features': gorkinConfig.featuresDir
      }
    },
    server: {
      fs: {
        // Allow Vite to access features files in upper directories (dynamically allowed based on config)
        allow: [gorkinConfig.featuresDir, ...gorkinConfig.modulesDir, __dirname]
      }
    },
    define: {
      __BDD_TAG_PATTERN__: JSON.stringify(gorkinConfig.tagPattern.source),
      __FEATURES_GLOB_PREFIX__: JSON.stringify(globPrefix)
    }
  }
})
