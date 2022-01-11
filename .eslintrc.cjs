'use strict'

module.exports = {
  root: true,
  extends: [
    '@cto.af/eslint-config/modules',
    '@cto.af/eslint-config/jsdoc',
  ],
  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        ecmaVersion: 2022,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        'jsdoc/check-types': 'off',
        'jsdoc/valid-types': 'off',
      },
    },
  ],
}
