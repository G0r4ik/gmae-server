module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:vue/vue3-recommended',
    'plugin:promise/recommended',
    'plugin:n/recommended',
    'plugin:unicorn/all',
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['promise', 'unicorn', '@typescript-eslint'],
  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
    'unicorn/no-null': 'off',
    'no-return-assign': 'off',
    'import/extensions': 'off',
    'n/no-missing-import': 'off',
    'import/no-unresolved': 'off',
    'no-restricted-syntax': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-keyword-prefix': 'off',
    'import/prefer-default-export': 'off',

    'import/no-extraneous-dependencies': 'off', //!
    'import/no-dynamic-require': 'off', // !
    'class-methods-use-this': 'off', // !
    'unicorn/prefer-module': 'off', // !
    'global-require': 'off', // !
    'no-undef': 'off', // !

    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          getInitialProps: true,
          i: true,
          req: true,
          res: true,
        },
      },
    ],
  },
}
