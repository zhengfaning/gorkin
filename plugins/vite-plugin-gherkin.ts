import type { Plugin } from 'vite'
import fs from 'node:fs'
import { generateMessages } from '@cucumber/gherkin'
import { IdGenerator, SourceMediaType } from '@cucumber/messages'

export function gherkinPlugin(): Plugin {
  return {
    name: 'vite-plugin-gherkin',

    // Core: Intercept .feature file loading and return AST data as JSON
    transform(src, id) {
      const cleanId = id.split('?')[0]
      if (!cleanId.endsWith('.feature')) return

      try {
        const fileContent = fs.readFileSync(cleanId, 'utf-8')
        const envelopes = generateMessages(fileContent, cleanId, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
          includeGherkinDocument: true,
          includePickles: false,
          includeSource: false,
          newId: IdGenerator.incrementing()
        })
        const gherkinDoc = envelopes.find((e: any) => e.gherkinDocument)?.gherkinDocument || {}
        // Export AST as default
        const vueCode = `export default ${JSON.stringify(gherkinDoc.feature || {})}`
        return { code: vueCode, map: null }
      } catch (err: any) {
        // If parsing fails, return the error message for display without breaking HMR
        console.error(`Gherkin Parse Error in ${id}:`, err)
        return { code: `export default { name: "Parse Error", description: ${JSON.stringify(err.message)} }`, map: null }
      }
    },

    // Watch for .feature file changes and trigger Vite HMR accurately
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.feature')) {
        const mod = server.moduleGraph.getModuleById(file)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
    },
  }
}
