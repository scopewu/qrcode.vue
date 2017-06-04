const helpers = require('../config/helpers')
// const config = require('../config')
// const Rimraf = require('rimraf')
const debug = require('debug')('app:build:compile')
const Webpack = require('webpack')
const webpackConfig = require(helpers('./webpack.config.js'))

debug('Starting webpack compile.')
const webpackCompiler = webpackConfig => (
  new Promise((resolve, reject) => {
    const compiler = Webpack(webpackConfig)

    debug('Compiler ------>>>>>>')
    compiler.run((error, stats) => {
      if (error) {
        debug('Webpack compiler encountered a fatal error.', error)
        return reject(error)
      }

      const jsonStats = stats.toJson()

      debug(stats.toString({
        chunks: false,
        chunkModules: false,
        colors: true
      }))

      if (jsonStats.errors.length > 0) {
        debug('Webpack compiler encountered errors.')
        debug(jsonStats.errors.join('\n'))
        return reject(new Error('Webpack compiler encountered errors'))
      } else if (jsonStats.warnings.length > 0) {
        debug('Webpack compiler encountered warnings.')
        debug(jsonStats.warnings.join('\n'))
      } else {
        debug('No errors or warnings encountered.')
      }

      resolve(jsonStats)
    })
  })
)

const compile = () => {
  Promise.resolve().then(() => {
    // debug('Rm build dir.');
    // Rimraf(helpers(config.dir_dist), error => {
    //  if (error) {
    //    throw new error
    //  }

    return webpackCompiler(webpackConfig)
    // })
  })
    .then(stats => {
      // success
      debug('Webpack: Compiled successfully.')
    })
    .catch(error => {
      debug('Compile error.', error)
      process.exit(1)
    })
}

compile()
