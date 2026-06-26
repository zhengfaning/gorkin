# gorkin 🚀

**专为 Go 语言打造的“零侵入式” BDD 活文档与在线测试引擎**

`gorkin` 旨在将无聊的 Gherkin (`.feature`) 测试剧本，瞬间转化为现代化、交互式的 VitePress 活文档网站。它不仅能让非技术人员（产品经理、策划）轻松阅读业务验收标准，还能让开发人员直接在网页上点击“运行”，实时触发底层的 Ginkgo 自动化测试并获取结果！

---

## ✨ 核心特性

- **📖 真正的活文档 (Living Documentation)**：自动解析 `.feature` 文件，生成带有嵌套侧边栏的多级静态文档站点。
- **🎮 网页端动态执行**：每个测试场景旁都有“运行”按钮。点一下，它就能自动跨 Go 模块找到对应的 Ginkgo 测试并执行。
- **🛡️ 物理零侵入**：配置驱动。工具运行产生的所有缓存和 JSON 报告，均隔离在工具自身目录内，**绝对不会**在您的 Go 代码库里拉屎（产生任何多余文件）。
- **🔗 协议松耦合**：支持自定义正则表达式关联标签（如 `@JIRA-123`），无需改动您原有的敏捷工作流。

---

## 📦 安装与初始化

我们推荐使用 npm 局部安装，将其作为开发依赖引入您的项目中。

在您的 Go 项目根目录下运行：

```bash
# 1. 安装依赖
npm install gorkin --save-dev

# 2. 一键初始化脚手架
npx gorkin init
```

执行 `init` 后，工具将在当前目录下安全地生成以下结构（不会覆盖已有文件）：
- `gorkin/gorkin.config.js` （核心配置文件）
- `features/hello.feature` （演示 Gherkin 剧本）
- `hello_test.go` （演示 Ginkgo 关联代码）

---

## ⚙️ 核心配置说明

初始化后，所有的秘密都在 `gorkin/gorkin.config.js` 中。您可以根据团队的实际目录结构进行调整：

```javascript
/** @type {import('gorkin/src/config/types').BddDocsConfig} */
const config = {
  // 您的 .feature 剧本存放目录 (相对于当前配置文件的路径)
  featuresDir: '../features',

  // 您的 Go 模块根目录 (工具将从此目录向下递归搜索所有的 go.mod 并执行测试)
  // 如果是微服务架构，也可以传入数组：['../api-server', '../engine']
  modulesDir: ['../'],

  // Ginkgo 测试 JSON 报告的隔离存放目录 (默认为工具内部隐藏目录，保障零侵入)
  reportsDir: './.reports',

  // 【关键】关联协议：用于匹配 Gherkin 和 Ginkgo 的标签正则
  // 默认支持形如 @HELLO_001, @ENGINE_999 的标签
  tagPattern: /^[A-Z0-9]+_\d{3}$/,

  // 站点元数据
  title: '我的 BDD 活文档',
  description: '由 gorkin 强力驱动',
}

module.exports = config;
```

---

## 🤝 关联协议：让文档与代码“连接”起来

要让网页上的“运行”按钮真正生效，您只需要遵守唯一的契约：**保持标签 (Tag) ID 的一致性**。

**第一步：在 Gherkin (`.feature`) 中贴上标签**
在场景上方，使用符合 `tagPattern` 正则的标签（带有 `@` 前缀）：
```gherkin
@HELLO_001
Scenario: 简单的数学计算
  Given 我有一个计算器
  When 我输入 2 加 2
  Then 结果必须是 4
```

**第二步：在 Ginkgo (`_test.go`) 中注册 Label**
在 Go 代码端，使用 Ginkgo 的 `Label` 装饰器挂载同样的 ID（不带 `@`）：
```go
var _ = Describe("数学计算", Label("HELLO_001"), func() {
    It("简单的数学计算", func() {
        Expect(2 + 2).To(Equal(4))
    })
})
```

就这么简单！工具会在启动时自动扫描并对齐这两端的数据。

---

## 🛠️ 命令行指令集

在您的项目中，您可以通过 `npx gorkin [command]` 操控工具的完整生命周期：

| 命令 | 描述 |
| :--- | :--- |
| `npx gorkin init` | 智能生成配置模板与演示代码（自带防覆盖安全锁） |
| `npx gorkin dev` | 启动本地开发服务器。支持 Markdown 热重载，写文档时实时预览 |
| `npx gorkin build`| 构建生产级静态站点（生成的文件位于 `.vitepress/dist`） |
| `npx gorkin serve`| 在本地预览构建好的生产环境静态站点 |
| `npx gorkin test` | 脱机测试指令。仅扫描 Go 模块并执行全量测试，生成关联报告 |

> **💡 进阶提示**：您也可以将这些指令添加到项目的 `package.json` 的 `scripts` 中，以便通过 `npm run docs:dev` 快速启动。

---

## 🏗️ 环境要求

- **Node.js**: v18+ (用于渲染 VitePress 和执行 JS 探针)
- **Go**: 1.20+ 且环境变量中包含 `go`
- **Ginkgo**: v2 (强依赖 Ginkgo v2 的 JSON 报告格式)
