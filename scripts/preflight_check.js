const { execSync } = require('child_process')
const { loadConfig } = require('../src/config/loader')

const config = loadConfig()

function checkEnvironment() {
  console.log('[Gorkin] Checking environment prerequisites...')
  
  try {
    execSync('go version', { stdio: 'ignore' })
  } catch (e) {
    console.error('\n❌ [Gorkin Error] Go is not installed or not in PATH.')
    console.error('Please install Go from https://go.dev/doc/install before running Gorkin.\n')
    process.exit(1)
  }

  console.log('[Gorkin] Environment checks passed! ✓')
}

checkEnvironment()
