const helpers = require('./config/helpers')
const config = require('./config')

/*
 * webpack plugins
 * **/
const DefinePlugin = require('webpack/lib/DefinePlugin')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    main: helpers('docs/example/app.js'),
  },
  output: {
    path: helpers(config.dir_dist),
    publicPath: '',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [helpers('src'), helpers('node_modules')],
    mainFields: ['module', 'main'],
    alias: {
      vue: helpers('node_modules/vue/dist/vue.esm-bundler.js'),
    },
  },
  externals: {
    // vue: 'Vue'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [helpers('src'), helpers('docs')],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              //sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
        include: [helpers('src'), helpers('docs')],
      },
    ],
  },
  plugins: [
    new DefinePlugin(config.globals),
    new ProgressPlugin(),
    new HotModuleReplacementPlugin(),
    new NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: helpers('docs/example/index.html'),
      inject: 'body',
      minify: {
        collapseWhitespace: false,
      },
    }),
  ],
  devServer: {
    // port: '',
    // host: '',
    hot: true,
    inline: true,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
  },
}

module.exports = webpackConfig
