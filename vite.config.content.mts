import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { sharedConfig } from './vite.config.mjs'
import { isDev, r } from './scripts/utils'
import packageJson from './package.json'

function escapeNonCharacters(): Plugin {
  return {
    name: 'escape-non-characters',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const key of Object.keys(bundle)) {
        const chunk = bundle[key]
        if (chunk.type === 'chunk') {
          chunk.code = chunk.code
            .replace(/￾/g, '\\uFFFE')
            .replace(/￿/g, '\\uFFFF')
        }
      }
    },
  }
}

// bundling the content script using Vite
export default defineConfig({
  ...sharedConfig,
  plugins: [
    ...(sharedConfig.plugins || []) as Plugin[],
    escapeNonCharacters(),
  ],
  define: {
    '__DEV__': isDev,
    '__NAME__': JSON.stringify(packageJson.name),
    // https://github.com/vitejs/vite/issues/9320
    // https://github.com/vitejs/vite/issues/9186
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist/contentScripts'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/contentScripts/index.ts'),
      name: packageJson.name,
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
      plugins: [],
    },
  },
})
