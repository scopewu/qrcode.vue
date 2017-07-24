const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')

const helpers = require('./helpers')
const config = require('./index')

export default {
  entry: helpers('src/index.js'),
  dest: helpers(config.dir_dist, 'qrcode.vue.js'),
  format: 'umd',
  moduleName: 'QrcodeVue',
  external: ['vue'],
  sourceMap: true,
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
