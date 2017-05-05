// http://eslint.org/docs/user-guide/configuring
// https://github.com/feross/standard

const isProd = process.env.NODE_ENV === 'production'

const ERROR = 2
const WARN = 1
const OFF = 0

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  globals: {
    __DEV__: false,
    __PROD__: false,
    __TEST__: false
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': OFF,
    // allow async-await
    'generator-star-spacing': OFF,
    // allow debugger during development
    'no-debugger': isProd ? ERROR : OFF,
    // see: http://eslint.org/docs/rules/space-before-function-paren
    'space-before-function-paren': [ERROR, {'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always'}],
    'consistent-return': [ERROR, {'treatUndefinedAsUnspecified': true}],
    // see: http://eslint.org/docs/rules/no-await-in-loop
    'no-await-in-loop': ERROR,
    // use let or const instead
    'no-var': ERROR,
    'no-prototype-builtins': WARN,
    'no-multiple-empty-lines': isProd ? WARN : OFF,
    'no-unused-vars': isProd ? ERROR : WARN,
    'one-var': OFF
  }
}
