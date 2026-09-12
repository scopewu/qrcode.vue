import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      'dist/',
      'example/dist/',
      'example/.generated/',
      'src/qrcodegen.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'example/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['*.{js,ts}', 'example/server.js', 'example/scripts/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
