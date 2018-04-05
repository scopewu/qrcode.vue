const helpers = require('./config/helpers')
const config = require('./config')
const debug = require('debug')('app:webpack')

const {__DEV__, __PROD__} = config.globals

/*
 * webpack plugins
 * **/
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin')
const DefinePlugin = require('webpack/lib/DefinePlugin')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin')
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackConfig = {
  devtool: __DEV__ ? 'cheap-module-source-map' : false,
  entry: {
    'main': helpers('example/app.js')
  },
  output: {
    path: helpers(config.dir_dist),
    publicPath: '',
    filename: __PROD__ ? '[name].[hash:8].js' : '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [helpers('src'), helpers('node_modules')],
    mainFields: ['module', 'main'],
    alias: {
      'vue': helpers(`node_modules/vue/dist/vue.esm.js`)
    }
  },
  externals: {
    // vue: 'Vue'
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
        test: /\.js$/,
        use: 'babel-loader',
        include: [helpers('src'), helpers('example')]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: __DEV__
            }
          },
          {
            loader: 'css-loader',
            options: {
              minimize: __PROD__,
              sourceMap: __DEV__
            }
          }
        ],
        include: [helpers('src'), helpers('example')]
      }
    ]
  },
  plugins: [
    new DefinePlugin(config.globals),
    new ProgressPlugin(),
    new ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: helpers('example/index.html'),
      inject: 'body',
      minify: {
        collapseWhitespace: __PROD__
      }
    })
  ]
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

if (__PROD__) {
  debug('code minimize')
  webpackConfig.externals.vue = 'Vue'
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

module.exports = webpackConfig
