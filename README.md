# Fig Inspect

> 一款 Figma 风格的网页元素检查器浏览器扩展 —— 悬停高亮、点击选取、查看计算后的 CSS 属性，并将选中元素导出为 PNG。

![Manifest](https://img.shields.io/badge/Manifest-V3-4f46e5)
![Vue](https://img.shields.io/badge/Vue-3-42b883)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![Browsers](https://img.shields.io/badge/Chrome%20%7C%20Firefox-supported-success)

Fig Inspect 把设计工具里「检查元素」的体验带到任意网页上：像在 Figma 里一样把鼠标移到元素上即可看到尺寸高亮，点击选中后在侧边栏查看布局、盒模型、排版、填充、边框、效果等计算样式，还能将一个或多个元素直接导出为图片。

基于 [vitesse-webext](https://github.com/antfu/vitesse-webext) 模板构建（Vue 3 + TypeScript + Vite），同时支持 **Chrome** 与 **Firefox**。

## ✨ 功能特性

- **悬停高亮** —— 鼠标移动时实时高亮元素，并显示其边界尺寸。
- **点击选取 / 多选** —— 单击选中元素；`Ctrl/Cmd + 单击` 可同时选中多个元素，侧边栏以标签页形式切换查看。
- **计算样式面板** —— 在侧边栏分区展示 Layout、Box Model、Typography、Fill、Border、Effects 等属性，所有数值可一键复制。
- **盒模型可视化** —— Figma 风格的 margin / border / padding / content 图示。
- **DOM 树导航** —— 侧边栏内置选中元素的 DOM 树，支持悬停联动高亮、点击选中、展开子节点。
- **DOM 路径** —— 展示从根到当前元素的选择器路径。
- **PNG 导出** —— 基于 [@zumer/snapdom](https://github.com/zumerlab/snapdom) 截取选中元素；多选时会合成到同一张画布并保留元素间的相对位置。
- **子 frame 支持** —— content script 注入所有 frame，可检查 `iframe` 内的元素（多 frame 同时导出暂不支持）。
- **每个标签页独立状态** —— 侧边栏按标签页隔离检查状态，切换标签页互不干扰。
- **多种启动方式** —— 点击工具栏图标即可打开侧边栏并启动检查器，或使用快捷键 `Alt+Shift+I`。

## 📸 截图

> _待补充：可在此处放置悬停高亮、属性面板与导出效果的截图。_

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/)（建议 LTS 版本）
- [pnpm](https://pnpm.io/) `9.7.1`（仓库通过 `packageManager` 字段约束；若未安装可执行 `npm i -g pnpm`）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev          # 完整开发模式（所有上下文，支持 HMR）
pnpm dev-firefox  # 面向 Firefox 的开发模式
```

随后在浏览器中**以 `extension/` 目录作为扩展根目录加载**：

- **Chrome** —— 打开 `chrome://extensions`，开启「开发者模式」，点击「加载已解压的扩展程序」，选择项目下的 `extension/` 目录。
- **Firefox** —— 打开 `about:debugging#/runtime/this-firefox`，点击「临时加载附加组件」，选择 `extension/manifest.json`。

> Vite 在大多数情况下会自动处理 HMR；如需更干净的强制重载，推荐配合 [Extensions Reloader](https://chromewebstore.google.com/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)。

## 📦 构建与打包

```bash
pnpm build   # 生产构建，输出到 extension/dist/
pnpm pack    # 打包为 .zip / .crx / .xpi
```

构建按顺序执行：`build:web` → `build:prepare`（生成 `manifest.json`）→ `build:background` → `build:js`。
打包产物可上传至对应的扩展商店。也可以直接运行已构建的扩展：

```bash
pnpm start:chromium   # 在 Chromium 中运行
pnpm start:firefox    # 在 Firefox 中运行
```

## 🧪 质量保障

```bash
pnpm lint        # ESLint（带缓存）
pnpm typecheck   # tsc --noEmit
pnpm test        # 单元测试（Vitest）
pnpm test:e2e    # 端到端测试（Playwright，启动带扩展的 Chromium）
```

运行单个单元测试：

```bash
pnpm vitest run src/tests/demo.spec.ts
```

## ⌨️ 使用方法

1. 点击工具栏中的 Fig Inspect 图标（或按 `Alt+Shift+I`），侧边栏打开并启动检查器。
2. 将鼠标移到页面元素上查看高亮与尺寸。
3. 单击选中元素，在侧边栏查看其计算样式。
4. `Ctrl/Cmd + 单击` 可多选；侧边栏顶部出现标签页用于切换查看不同元素。
5. 点击侧边栏中的导出按钮，将选中元素保存为 PNG。
6. 按 `Esc` 退出检查器。

| 操作 | 说明 |
|------|------|
| `Alt+Shift+I` | 开关检查器 |
| 单击 | 选中元素 |
| `Ctrl/Cmd + 单击` | 多选 / 取消选中 |
| 悬停 | 高亮元素并显示尺寸 |
| `Esc` | 退出检查器 |

## 🏗️ 架构

扩展由五个相互隔离的上下文组成，各自拥有独立的 Vite 构建配置：

| 上下文 | 入口 | Vite 配置 | 构建格式 |
|--------|------|-----------|----------|
| Popup / Options / Sidepanel | `src/{popup,options,sidepanel}/main.ts` | `vite.config.mts` | ES modules（多页） |
| Background（service worker） | `src/background/main.ts` | `vite.config.background.mts` | ES module |
| Content script | `src/contentScripts/index.ts` | `vite.config.content.mts` | IIFE（全局） |

### 检查器系统（核心）

检查器逻辑全部位于 `src/contentScripts/inspector/`：

| 模块 | 职责 |
|------|------|
| `InspectorManager`（`index.ts`） | 总控 —— 管理激活状态、多选、跨上下文消息 |
| `ElementPicker` | 鼠标 / 键盘事件 —— 悬停、点击（含 Ctrl 多选）、Esc 退出 |
| `OverlayRenderer` | 固定定位、动态 z-index 的覆盖层 —— 悬停高亮、选中框（对象池复用）、盒模型可视化 |
| `StyleExtractor` | 通过 `getComputedStyle()` / `getBoundingClientRect()` 提取 `ElementInfo` |
| `ElementRegistry` | 为元素分配稳定 ID，供 DOM 树与跨上下文引用 |
| `TreeBuilder` | 构建 DOM 树（脊柱树 / 子节点），供侧边栏导航 |
| `ExportCapture` | 通过 `@zumer/snapdom` 截取选中元素，合成到单张画布并保留相对位置，经 background 的 `browser.downloads.download()` 下载 |

content script 入口（`src/contentScripts/index.ts`）做两件事：在 Shadow DOM 中挂载扩展自身 UI 的 Vue 应用，并实例化 `InspectorManager`。

### 侧边栏（Sidepanel）

`src/sidepanel/composables/useElementData.ts` 通过 `browser.runtime.onMessage` 同步检查器状态，维护 `selectedElements[]` 与表示当前展示元素的 `activeIndex`，并监听 `browser.tabs.onActivated` 在切换标签页时重置状态。frame 相关状态由 `useActiveFrame` 跟踪，DOM 树数据由 `useDomTree` 管理。

属性展示组件位于 `src/sidepanel/components/`：`HeaderSection`、`LayoutSection`、`BoxModelDiagram`、`TypographySection`、`FillSection`、`BorderSection`、`EffectsSection`、`DomPath`、`DomTreeView`、`CopyableValue`、`ExportButton`、`SectionCollapse` 等。

### 跨上下文通信

检查器使用原生 `browser.runtime.sendMessage` / `browser.tabs.sendMessage`。主要消息类型：

| 消息 | 方向 | 用途 |
|------|------|------|
| `toggle-inspector` | sidepanel / background → content | 激活 / 关闭检查器 |
| `element-selected` | content → sidepanel | 发送选中的 `ElementInfo[]` |
| `inspector-state` | content → sidepanel | 激活状态与选中数量 |
| `clear-selection` | sidepanel → content | 清除当前 frame 的选择 |
| `export-element` | sidepanel → content | 触发 PNG 导出 |
| `dom-tree-data` | content → sidepanel | 推送选中元素的 DOM 树 |
| `dom-tree-hover-node` / `dom-tree-select-node` / `dom-tree-expand-node` | sidepanel → content | DOM 树的悬停、选中、展开 |
| `capture-visible-tab` | content → background | 通过 `captureVisibleTab` 截图 |
| `download-image` | content → background | 通过 `browser.downloads.download()` 下载 |

### Manifest 生成

`src/manifest.ts` 在构建时动态生成 `manifest.json`。Chromium 与 Firefox 的差异（service worker vs background scripts、`side_panel` vs `sidebar_action`）通过 `scripts/utils.ts` 中的 `isFirefox` 标志处理。

权限：`tabs`、`storage`、`activeTab`、`sidePanel`、`downloads`；host 权限：`<all_urls>`。

## 🛠️ 技术栈

- **[Vue 3](https://vuejs.org/)** —— Composition API + `<script setup>`
- **[TypeScript](https://www.typescriptlang.org/)** —— 类型安全
- **[Vite](https://vitejs.dev/)** —— 构建与开发态 HMR
- **[UnoCSS](https://github.com/unocss/unocss)** —— 即时按需原子化 CSS（`presetUno` / `presetAttributify` / `presetIcons` / `transformerDirectives`）
- **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)** —— 跨浏览器扩展 API
- **[@zumer/snapdom](https://github.com/zumerlab/snapdom)** —— DOM 转图片
- **自动导入** —— `unplugin-auto-import`（Vue API 与 `browser`）、`unplugin-vue-components`（组件）、`unplugin-icons`（任意 Iconify 图标作为组件使用）
- **代码风格** —— ESLint + [@antfu/eslint-config](https://github.com/antfu/eslint-config)（单引号、无分号）

> 路径别名 `~/` 指向 `src/`。全局常量：`__DEV__`、`__NAME__`。

## 📁 目录结构

```
src/
├── background/        # service worker（图标点击、命令、截图与下载）
├── contentScripts/
│   ├── index.ts       # content script 入口（挂载 UI + 实例化检查器）
│   └── inspector/     # 检查器核心（见上方架构表）
├── sidepanel/         # 侧边栏 UI（属性面板、DOM 树、composables）
├── popup/             # 工具栏弹窗
├── options/           # 选项页
├── components/        # 跨页面共享组件（自动注册）
├── types/             # 类型定义（inspector.ts）
├── styles/            # 共享样式
└── manifest.ts        # 动态生成 manifest.json

extension/             # 可加载的扩展根目录
├── assets/            # 静态资源（图标等）
└── dist/              # 构建产物

scripts/               # 构建 / 开发辅助脚本
```

## 🙏 致谢

本项目基于 [vitesse-webext](https://github.com/antfu/vitesse-webext)（by [Anthony Fu](https://github.com/antfu)）构建，元素截图能力由 [@zumer/snapdom](https://github.com/zumerlab/snapdom) 提供。
