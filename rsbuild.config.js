import { defineConfig } from '@rsbuild/core'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  source: {
    entry: {
      index: './example/webpack-entry.ts',
      'zh/index': './example/webpack-entry.ts',
      'zh-hk/index': './example/webpack-entry.ts',
    },
  },
  resolve: {
    alias: {
      vue$: isProd
        ? 'vue/dist/vue.esm-browser.prod.js'
        : 'vue/dist/vue.esm-browser.js'
    },
  },
  output: {
    // assetPrefix: 'https://cdn.jsdelivr.net/gh/scopewu/qrcode.vue@gh-pages/',
    distPath: {
      root: './example/dist',
    },
    inlineStyles: true,
  },
  html: {
    template({ entryName }) {
      const langMap = { index: 'en', 'zh/index': 'zh', 'zh-hk/index': 'zh-hk' }
      const lang = langMap[entryName] || 'en'
      return `./example/.generated/webpack.${lang}.html`
    },
    scriptLoading: 'module',
  },
  server: {
    htmlFallback: 'index',
  },
  plugins: [],
})
