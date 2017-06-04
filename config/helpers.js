const path = require('path')

const base = path.resolve(__dirname, '..')

const root = path.resolve.bind(path, base)

module.exports = root
