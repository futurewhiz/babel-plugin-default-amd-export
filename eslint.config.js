const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    ignores: ['tests/lib/__fixtures__/**/output.js'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        es6: true,
        node: true
      },
    },
  }
];
