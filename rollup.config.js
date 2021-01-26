import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const banner =
  '/*!' +
  '\n * qrcode.vue v' +
  pkg.version +
  '\n * ' +
  pkg.description +
  '\n * © 2017-' +
  new Date().getFullYear() +
  ' @scopewu(https://github.com/scopewu)' +
  '\n * MIT License.' +
  '\n */'
const sourcemap = false

function createEntry(options) {
  const config = {
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      name: 'QrcodeVue',
      file: options.file,
      format: options.format,
      exports: 'default',
      globals: {
        vue: 'Vue'
      },
      banner,
    },
    plugins: [
      ts({
        check: options.format === 'es',
        tsconfigOverride: {
          compilerOptions: {
            declaration: options.format === 'es',
          },
          exclude: ['src', 'example'],
        }
      }),
      commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: 'node_modules/**', // Default: undefined
        extensions: ['.js'], // Default: [ '.js' ]
        ignoreGlobal: false, // Default: false
        sourceMap: sourcemap, // Default: true
      }),
    ],
  }

  if (Array.isArray(options.plugins)) {
    config.plugins.push(...options.plugins)
  }

  return config
}

const browserPlugins = [
  terser({
    format: {
      comments: function (node, comment) {
        const { value, type } = comment
        return type === 'comment2' && /^!/.test(value)
      },
    },
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      drop_console: true,
    },
  }),
]

export default [
  createEntry({ format: 'cjs', file: pkg.main }),
  createEntry({ format: 'es', file: pkg.module }),
  createEntry({ format: 'umd', file: pkg.browser, }),
  createEntry({ format: 'umd', file: pkg.unpkg, plugins: browserPlugins }),
]
