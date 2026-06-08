# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser extension (Manifest V3) — a Figma-style element inspector. Hover to highlight, click to select (Ctrl+Click for multi-select), view computed CSS properties in a sidepanel, and export selected elements as PNG. Built with Vue 3 + TypeScript + Vite, based on the vitesse-webext template. Supports Chrome and Firefox.

## Commands

Package manager: **pnpm** (v9.7.1, enforced via packageManager field).

```bash
pnpm dev                # Full dev mode (all contexts, with HMR)
pnpm dev-firefox        # Dev mode targeting Firefox
pnpm build              # Production build to extension/dist/
pnpm lint               # ESLint (cached)
pnpm typecheck          # tsc --noEmit
pnpm test               # Unit tests (vitest)
pnpm test:e2e           # E2E tests (playwright, launches Chromium with extension)
pnpm start:chromium     # Run built extension in Chromium via web-ext
pnpm start:firefox      # Run built extension in Firefox via web-ext
pnpm pack               # Package as .zip, .crx, .xpi
```

Run a single unit test: `pnpm vitest run src/tests/demo.spec.ts`

Build runs sequentially: `build:web` → `build:prepare` (generates manifest.json) → `build:background` → `build:js`.

## Architecture

The extension has five isolated contexts, each with its own Vite build config:

| Context | Entry point | Vite config | Build format |
|---------|-------------|-------------|--------------|
| Popup / Options / Sidepanel | `src/{popup,options,sidepanel}/main.ts` | `vite.config.mts` | ES modules (multi-page) |
| Background (service worker) | `src/background/main.ts` | `vite.config.background.mts` | ES module |
| Content script | `src/contentScripts/index.ts` | `vite.config.content.mts` | IIFE (global) |

All three Vite configs share a `sharedConfig` exported from `vite.config.mts` (plugins, aliases, defines).

### Inspector system (core feature)

The element inspector lives entirely in `src/contentScripts/inspector/`:

| Module | Role |
|--------|------|
| `InspectorManager` (`index.ts`) | Orchestrator — manages active state, multi-selection, messaging |
| `ElementPicker` | Mouse/keyboard events — hover, click (with Ctrl multi-select), ESC to exit |
| `OverlayRenderer` | Fixed-position overlay with dynamic z-index — hover highlight, selection boxes (pooled), box model visualization |
| `StyleExtractor` | Extracts `ElementInfo` via `getComputedStyle()` / `getBoundingClientRect()` |
| `ExportCapture` | Captures selected elements via `@zumer/snapdom`, composites them onto a single canvas preserving relative positions, downloads via background `browser.downloads.download()` |

The content script entry (`src/contentScripts/index.ts`) does two things: mounts a Vue app inside a Shadow DOM (for the extension's own UI) and instantiates `InspectorManager`.

### Sidepanel

`src/sidepanel/composables/useElementData.ts` syncs inspector state via `browser.runtime.onMessage`. It tracks `selectedElements[]` and an `activeIndex` for which element's properties to display. Listens for `browser.tabs.onActivated` to reset state on tab switch.

Property display components are in `src/sidepanel/components/` (HeaderSection, LayoutSection, BoxModelDiagram, TypographySection, FillSection, BorderSection, EffectsSection, DomPath, CopyableValue, ExportButton, SectionCollapse).

### Cross-context communication

The inspector uses **native `browser.runtime.sendMessage` / `browser.tabs.sendMessage`** (not webext-bridge). Key message types:

| Message | Direction | Purpose |
|---------|-----------|---------|
| `toggle-inspector` | sidepanel/background → content | Activate/deactivate inspector |
| `element-selected` | content → sidepanel | Send selected `ElementInfo[]` |
| `inspector-state` | content → sidepanel | Active state + selection count |
| `export-element` | sidepanel → content | Trigger PNG export |
| `capture-visible-tab` | content → background | Screenshot via `captureVisibleTab` |
| `download-image` | content → background | Download via `browser.downloads.download()` |

### Manifest generation

`src/manifest.ts` generates `manifest.json` dynamically at build time. Firefox vs Chromium differences (background scripts vs service_worker, sidebar_action vs side_panel) are handled via `isFirefox` flag from `scripts/utils.ts`.

Permissions: `tabs`, `storage`, `activeTab`, `sidePanel`, `downloads`. Host permissions: `<all_urls>`.

### Content script build note

`vite.config.content.mts` includes an `escapeNonCharacters` plugin that replaces U+FFFE/U+FFFF with `￾`/`￿` escapes. Chrome rejects content scripts containing these Unicode noncharacters. This is needed because `@zumer/snapdom` includes them in a regex.

### Auto-imports

- Vue APIs and `browser` (from `webextension-polyfill`) are auto-imported via `unplugin-auto-import`
- Components in `src/components/` are auto-registered via `unplugin-vue-components`
- Any Iconify icon is usable as a component with no prefix (e.g., `<pixelarticons-power />`) via `unplugin-icons`

Generated type files (`auto-imports.d.ts`, `components.d.ts`) are gitignored.

### Path alias

`~/` resolves to `src/` in both TypeScript and Vite.

### Styling

UnoCSS with `presetUno`, `presetAttributify`, `presetIcons`, and `transformerDirectives`. Shared utility classes in `src/styles/main.css`.

### Build output

All built files go to `extension/dist/`. The `extension/` directory is the loadable extension root (contains `manifest.json` and `assets/`).

## Key Globals

- `__DEV__` — boolean, true in development
- `__NAME__` — string, package name from package.json
- `browser` — auto-imported from `webextension-polyfill`
