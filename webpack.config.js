const helpers = require('./config/helpers');
const config = require('./config');
const debug = require('debug')('app:webpack');

const {__DEV__, __PROD__, __EXAMPLE__, __MINIMIZE__} = config.globals;

/*
 * webpack plugins
 * **/
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
  devtool: __DEV__ ? 'cheap-module-source-map' : '',
  entry: {
    'qrcode.vue': helpers('./src/index.js')
  },
  output: {
    path: helpers(config.dir_dist),
    publicPath: '',
    filename: __DEV__ ? '[name].js' : '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [helpers('src'), helpers('node_modules')],
    alias: {
      'vue': helpers('node_modules/vue/dist/vue.js')
    }
  },
  module: {
    rules: [
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
  ],
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
        collapseWhitespace: false
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
    //port: '',
    //host: '',
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
      },
    })
  )
}

module.exports = webpackConfig
