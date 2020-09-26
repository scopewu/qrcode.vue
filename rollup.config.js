import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

import { version, description } from './package.json'

const env = process.env.NODE_ENV || 'development'

const banner =
  '/*!' +
  '\n * qrcode.vue v' +
  version +
  '\n * ' +
  description +
  '\n * © 2017-' +
  new Date().getFullYear() +
  ' @scopewu(https://github.com/scopewu)' +
  '\n * MIT License.' +
  '\n */'
const sourcemap = false
const indent = false

const config = {
  input: 'src/index.js',
  external: ['vue'],
  plugins: [
    resolve({
      mainFields: ['module', 'main'],
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**', // Default: undefined
      // exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
      // these values can also be regular expressions
      // include: /node_modules/

      // search for files other than .js files (must already
      // be transpiled by a previous plugin!)
      extensions: ['.js'], // Default: [ '.js' ]

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false, // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: sourcemap, // Default: true

      // explicitly specify unresolvable named exports
      // (see below for more details)
      // namedExports: {'./module.js': ['foo', 'bar']}, // Default: undefined

      // sometimes you have to leave require statements
      // unconverted. Pass an array containing the IDs
      // or a `id => boolean` function. Only use this
      // option if you know what you're doing!
      // ignore: ['conditional-runtime-dependency']
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_module/**',
    }),
  ],
}

if (env === 'es') {
  config.output = {
    file: 'dist/qrcode.vue.esm.js',
    format: 'es',
    name: 'QrcodeVue',
    sourcemap,
    indent,
    banner,
  }
}

if (env === 'development') {
  config.output = {
    file: 'dist/qrcode.vue.js',
    format: 'umd',
    name: 'QrcodeVue',
    sourcemap,
    indent,
    banner,
  }
}

if (env === 'production') {
  config.output = {
    file: 'dist/qrcode.vue.min.js',
    format: 'umd',
    name: 'QrcodeVue',
    sourcemap: false,
    banner,
  }
  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    uglify({
      output: {
        comments(node, comment) {
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
    })
  )
}

export default config
