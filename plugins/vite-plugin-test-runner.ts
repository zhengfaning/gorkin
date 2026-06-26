import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function testRunnerPlugin() {
  return {
    name: 'vite-plugin-test-runner',
    configureServer(server: any) {
      server.middlewares.use('/api/run-tests', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        // Parse query params (e.g., ?tag=ENGINE_001)
        const url = new URL(req.url, `http://${req.headers.host}`)
        const tag = url.searchParams.get('tag')
        
        console.log(`[BDD Docs] Triggering run_dynamic_tests.js${tag ? ` with tag ${tag}` : ''}...`)
        const scriptPath = path.resolve(__dirname, '../scripts/run_dynamic_tests.js')
        
        const cmd = tag ? `node ${scriptPath} --tag ${tag}` : `node ${scriptPath}`
        
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error(`[BDD Docs] Test run error: ${error.message}`)
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ 
            success: !error, 
            stdout: stdout, 
            stderr: stderr 
          }))
        })
      })
    }
  }
}
