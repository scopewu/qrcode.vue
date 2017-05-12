const helpers = require('./config/helpers')
const config = require('./config')
const debug = require('debug')('app:webpack')

const {__DEV__, __PROD__, __EXAMPLE__, __MINIMIZE__} = config.globals
const {version} = require('./package.json')

/*
 * webpack plugins
 * **/
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin')
const DefinePlugin = require('webpack/lib/DefinePlugin')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin')
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')
const BannerPlugin = require('webpack/lib/BannerPlugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackConfig = {
  devtool: __DEV__ ? 'cheap-module-source-map' : '',
  entry: {
    'qrcode.vue': helpers('./src/index.js')
  },
  output: {
    path: helpers(config.dir_dist),
    publicPath: '',
    filename: __PROD__ && __MINIMIZE__ ? '[name].min.js' : '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [helpers('src'), helpers('node_modules')],
    alias: {
      'vue': helpers(`node_modules/vue/dist/vue.esm.js`)
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [helpers('src'), helpers('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [helpers('src'), helpers('example')],
        exclude: [/node_modules/]
      }
    ]
  },
  plugins: [
    new DefinePlugin(config.globals),
    new ProgressPlugin()
  ]
}

if (__EXAMPLE__) {
  webpackConfig.entry = {
    app: helpers('example/app.js')
  }

  webpackConfig.output.path = helpers('github-page')

  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: helpers('example/index.html'),
      inject: 'body',
      minify: {
        collapseWhitespace: __PROD__
      }
    })
  )
}

if (__DEV__) {
  webpackConfig.plugins.push(
    new HotModuleReplacementPlugin(),
    new NamedModulesPlugin(),
    new NoEmitOnErrorsPlugin()
  )

  webpackConfig.devServer = {
    // port: '',
    // host: '',
    hot: true,
    inline: true,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
}

if (__PROD__ && !__MINIMIZE__) {
  //
}

if (__PROD__ && __MINIMIZE__) {
  debug('code minimize')
  webpackConfig.plugins.push(
    new UglifyJsPlugin({
      sourceMap: true,
      minimize: true,
      beautify: false,
      output: {
        comments: false
      },
      mangle: {
        screw_ie8: true
      },
      compress: {
        screw_ie8: true,
        warnings: false,
        conditionals: true,
        unused: true,
        drop_debugger: true,
        drop_console: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: false // we need this for lazy v8
      }
    })
  )
}

if (__PROD__) {
  webpackConfig.plugins.push(new BannerPlugin(`qrcode.vue v${version}, Author: scopewu, MIT License: https://github.com/scopewu/qrcode.vue/blob/master/LICENSE`))
}

module.exports = webpackConfig
