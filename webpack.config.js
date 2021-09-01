const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = (env, { mode = 'production' }) => {
  return {
    mode: mode,
    devtool: 'cheap-module-source-map',
    entry: {
      main: './example/webpack-entry.ts',
    },
    output: {
      path: path.resolve(__dirname, './example/dist'),
      filename: mode === 'production' ? '[name].[contenthash].js' : '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        vue$: 'vue/dist/vue.esm-browser.js'
      },
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
          }
        },
        {
          test: /\.svg$/,
          loader: 'file-loader',
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: 'example/webpack.html',
      }),
    ],
    devServer: {
      hot: 'only',
      client: {
        overlay: true,
        progress: true,
      },
      historyApiFallback: true,
    },
  }
}
