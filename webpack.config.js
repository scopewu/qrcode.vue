import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'

const dirname = new URL('.', import.meta.url).pathname

const config = (env, { mode = 'production' }) => {
  const isProd = mode === 'production'

  return {
    mode: mode,
    devtool: 'cheap-module-source-map',
    entry: {
      main: './example/webpack-entry.ts',
    },
    output: {
      path: path.resolve(dirname, './example/dist'),
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      mainFields: ['module', 'main'],
      alias: {
        vue$: isProd
          ? 'vue/dist/vue.esm-browser.prod.js'
          : 'vue/dist/vue.esm-browser.js'
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
        minify: {
          minifyCSS: true,
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
      }),
    ],
    devServer: {
      hot: true,
      client: {
        overlay: true,
        progress: true,
      },
      historyApiFallback: true,
    },
  }
}

export default config
