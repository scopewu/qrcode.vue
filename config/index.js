// const helpers = require('./index')

const config = {
  env: process.env.NODE_ENV || 'development',
  dir_client: 'src',
  dir_dist: 'example/dist',
  dir_public: ''
}

config.globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.env)
  },
  'NODE_ENV': config.env,
  '__DEV__': config.env === 'development',
  '__PROD__': config.env === 'production',
}

module.exports = config
