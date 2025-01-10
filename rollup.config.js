import ts from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' with { type: 'json' }

const banner =
  '/*!' +
  '\n * qrcode.vue v' +
  pkg.version +
  '\n * ' +
  pkg.description +
  '\n * © 2017-PRESENT' +
  ' @scopewu(https://github.com/scopewu)' +
  '\n * MIT License.' +
  '\n */'
const sourcemap = false

function createEntry(options) {
  /** @type import('rollup').RollupOptions */
  const config = {
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      name: 'QrcodeVue',
      file: options.file,
      format: options.format,
      exports: 'named',
      globals: {
        vue: 'Vue'
      },
      banner,
      indent: false,
      sourcemap,
    },
    plugins: [
      ts({
        check: options.format === 'es',
        tsconfigOverride: {
          compilerOptions: {
            declaration: options.format === 'es',
          },
          exclude: ['src', 'example', 'test'],
        }
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
