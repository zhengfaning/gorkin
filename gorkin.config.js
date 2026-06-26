/** @type {import('./src/config/types').BddDocsConfig} */
const config = {
  // Go 项目中 .feature 文件的根目录 (相对于本文件所在目录)
  featuresDir: '../../features',

  // Go 模块的根目录 (工具将从此目录向下递归发现 go.mod 并执行测试)
  modulesDir: '../../',

  // Ginkgo JSON 报告的存放目录 (零侵入隔离存放)
  reportsDir: './.reports',

  // BDD Label 的匹配正则 (关联 Gherkin 剧本与 Ginkgo 测试用例)
  tagPattern: /^[A-Z0-9]+_\d{3}$/,

  title: 'SlotGame BDD Docs',
  description: 'Living Documentation for Slot Game Engine'
}

module.exports = config
