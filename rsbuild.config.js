import { defineConfig } from '@rsbuild/core'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  source: {
    entry: {
      index: './example/webpack-entry.ts',
    },
    alias: {
      vue$: isProd
        ? 'vue/dist/vue.esm-browser.prod.js'
        : 'vue/dist/vue.esm-browser.js'
    },
  },
  output: {
    assetPrefix: 'https://cdn.jsdelivr.net/gh/scopewu/qrcode.vue@gh-pages/',
    distPath: {
      root: './example/dist',
    },
  },
  html: {
    template: './example/webpack.html',
    scriptLoading: 'module',
  },
  server: {
    htmlFallback: 'index',
  },
})
