import { defineConfig } from '@rstest/core';

export default defineConfig({
  // globals: true,
  tools: {
    swc: {},
  },
  testEnvironment: 'happy-dom',
  include: ['**/test/*.test.ts'],
  resolve: {
    alias: {
      '^@vue/test-utils': '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js'
    },
  },
})
