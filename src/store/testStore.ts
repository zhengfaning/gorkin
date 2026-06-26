import { reactive, ref } from 'vue'

export const testStore = {
  testResults: reactive<Record<string, any>>({}),
  isRunningTests: ref(false),

  async loadTestResults() {
    try {
      const res = await fetch(`/data/test_results.json?t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        for (const key in this.testResults) {
          delete this.testResults[key]
        }
        Object.assign(this.testResults, data)
      }
    } catch (e) {
      console.error('Failed to load test results dynamically:', e)
    }
  },

  async runAllTests() {
    if (this.isRunningTests.value) return
    this.isRunningTests.value = true
    try {
      const res = await fetch('/api/run-tests', { method: 'POST' })
      const result = await res.json()
      console.log('[BDD Docs] Test run completed. Success:', result.success)
      if (result.stderr) console.error(result.stderr)
      await this.loadTestResults()
    } catch (e) {
      console.error('[BDD Docs] Test run failed to execute:', e)
    } finally {
      this.isRunningTests.value = false
    }
  },

  async runSingleTest(tag: string) {
    if (this.isRunningTests.value) return
    this.isRunningTests.value = true
    try {
      const res = await fetch(`/api/run-tests?tag=${encodeURIComponent(tag)}`, { method: 'POST' })
      const result = await res.json()
      console.log(`[BDD Docs] Single test run (${tag}) completed. Success:`, result.success)
      if (result.stderr) console.error(result.stderr)
      await this.loadTestResults()
    } catch (e) {
      console.error(`[BDD Docs] Single test run (${tag}) failed:`, e)
    } finally {
      this.isRunningTests.value = false
    }
  }
}
