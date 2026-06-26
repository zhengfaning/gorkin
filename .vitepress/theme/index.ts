import DefaultTheme from 'vitepress/theme'
import './custom.css'

import FeaturePage from '../../src/components/FeaturePage.vue'
import RuleSection from '../../src/components/RuleSection.vue'
import ScenarioCard from '../../src/components/ScenarioCard.vue'
import StepRow from '../../src/components/StepRow.vue'
import GherkinTable from '../../src/components/GherkinTable.vue'
import Badge from '../../src/components/Badge.vue'
import CodeBlock from '../../src/components/CodeBlock.vue'

import Layout from './Layout.vue'

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('FeaturePage', FeaturePage)
    app.component('RuleSection', RuleSection)
    app.component('ScenarioCard', ScenarioCard)
    app.component('StepRow', StepRow)
    app.component('GherkinTable', GherkinTable)
    app.component('Badge', Badge)
    app.component('CodeBlock', CodeBlock)
  }
}
