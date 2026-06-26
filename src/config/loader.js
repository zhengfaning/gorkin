const fs = require('fs')
const path = require('path')

function loadConfig() {
  // If GORKIN_USER_DIR is set, the CLI is running. We should look for the config there.
  // Otherwise fallback to the tool's root directory (for legacy scripts / direct dev).
  const userDir = process.env.GORKIN_USER_DIR || path.resolve(__dirname, '../../')
  
  // The config is expected to be inside the gorkin folder in the user's project, 
  // or right at the root if userDir is the gorkin folder itself.
  let configPath = path.join(userDir, 'gorkin.config.js')
  if (!fs.existsSync(configPath) && fs.existsSync(path.join(userDir, 'gorkin', 'gorkin.config.js'))) {
    configPath = path.join(userDir, 'gorkin', 'gorkin.config.js')
  }
  
  // Base dir to resolve paths against
  const configBaseDir = path.dirname(configPath)
  
  const defaultConfig = {
    featuresDir: path.join(configBaseDir, '../features'),
    modulesDir: [path.join(configBaseDir, '../')],
    reportsDir: path.join(configBaseDir, '.reports'),
    tagPattern: /^[A-Z0-9]+_\d{3}$/
  }

  if (!fs.existsSync(configPath)) {
    console.warn(`[Gorkin] Config file not found at ${configPath}. Using defaults.`)
    return defaultConfig
  }

  try {
    const userConfig = require(configPath)
    
    // Resolve absolute paths based on config file location
    const resolvePath = (p) => path.isAbsolute(p) ? p : path.resolve(configBaseDir, p)
    
    let modulesDir = userConfig.modulesDir || defaultConfig.modulesDir
    if (!Array.isArray(modulesDir)) {
      modulesDir = [modulesDir]
    }
    modulesDir = modulesDir.map(resolvePath)

    return {
      featuresDir: resolvePath(userConfig.featuresDir || defaultConfig.featuresDir),
      modulesDir: modulesDir,
      reportsDir: resolvePath(userConfig.reportsDir || defaultConfig.reportsDir),
      tagPattern: userConfig.tagPattern || defaultConfig.tagPattern,
      title: userConfig.title || 'Gorkin Docs',
      description: userConfig.description || ''
    }
  } catch (error) {
    console.error(`[Gorkin] Failed to load config from ${configPath}:`, error)
    return defaultConfig
  }
}

module.exports = {
  loadConfig
}
