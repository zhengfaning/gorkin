export interface BddDocsConfig {
  /**
   * The directory containing your .feature files.
   * Can be an absolute path or relative to the config file.
   */
  featuresDir: string

  /**
   * The directory (or directories) containing your Go modules.
   * The tool will recursively find go.mod files under these directories to run Ginkgo tests.
   */
  modulesDir: string | string[]

  /**
   * The directory where Ginkgo JSON reports will be saved and read from.
   * Defaults to './.reports' relative to the config file.
   */
  reportsDir?: string

  /**
   * A Regular Expression to match your BDD Label tags (e.g., /^[A-Z0-9]+_\d{3}$/).
   * This is used to link a Gherkin Scenario with a Ginkgo Test.
   * Defaults to: /^[A-Z0-9]+_\d{3}$/
   */
  tagPattern?: RegExp

  /**
   * Title for the documentation site
   */
  title?: string

  /**
   * Description for the documentation site
   */
  description?: string
}

/**
 * Helper function to provide TypeScript autocompletion for the configuration.
 */
export function defineConfig(config: BddDocsConfig): BddDocsConfig {
  return config
}
