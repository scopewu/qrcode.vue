// http://eslint.org/docs/user-guide/configuring
// https://github.com/feross/standard

const isProd = process.env.NODE_ENV === 'production'

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
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': isProd ? 2 : 0,
    // see: http://eslint.org/docs/rules/space-before-function-paren
    'space-before-function-paren': ['error', {'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always'}],
    'consistent-return': ['error', {'treatUndefinedAsUnspecified': true}],
    // see: http://eslint.org/docs/rules/no-await-in-loop
    'no-await-in-loop': 2,
    // use let or const instead
    'no-var': 2,
    'no-prototype-builtins': 1,
    'no-multiple-empty-lines': isProd ? 1 : 0,
    'no-unused-vars': isProd ? 2 : 1,
    'one-var': 0
  }
}
