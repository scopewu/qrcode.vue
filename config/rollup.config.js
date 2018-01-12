const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')

const helpers = require('./helpers')
const config = require('./index')
const {version, description} = require('../package.json')

const banner =
  '/*!' +
  '\n * qrcode.vue v' + version +
  '\n * ' + description +
  '\n * © 2017-' + new Date().getFullYear() + ' @scopewu' +
  '\n * MIT License.' +
  '\n */'

export default {
  input: helpers('src/index.js'),
  output: [
    {
      file: helpers(config.dir_dist, 'qrcode.vue.js'),
      format: 'umd',
      name: 'QrcodeVue',
      sourcemap: false,
      banner
    },
    {
      file: helpers(config.dir_dist, 'qrcode.vue.esm.js'),
      format: 'es',
      name: 'QrcodeVue',
      sourcemap: false,
      banner
    }
  ],
  external: ['vue'],
  plugins: [
    resolve({
      jsnext: true,
      module: true,
      main: true
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
      sourceMap: true, // Default: true

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
      exclude: 'node_module/**'
    })
  ]
}
