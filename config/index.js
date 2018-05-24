const env = process.env.NODE_ENV || 'development'

const config = {
  dir_client: 'src',
  dir_dist: 'example/dist',
  dir_public: ''
}

config.globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(env)
  },
  'NODE_ENV': env,
  '__DEV__': env === 'development',
  '__PROD__': env === 'production',
}

module.exports = config
