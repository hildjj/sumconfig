'use strict'

module.exports = {
  root: true,
  extends: ['@cto.af'],
  ignorePatterns: [
    'coverage/',
    'node_modules/',
    'example/',
    'docs/scripts/',
  ],
  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          {
            version: '>=12.19',
            ignores: ['modules'],
          },
        ],
        'jsdoc/check-types': 'off',
      },
    },
  ],
}
