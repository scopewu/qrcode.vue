/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  globals: {},
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  testMatch: ['**/test/*.test.ts'],
  moduleNameMapper: {
    "^@vue/test-utils": "<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js"
  },
  setupFiles: ['jest-canvas-mock'],
}
