module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'quotes': ['error', 'single'],
    'import/no-unresolved': 'error',
    'import/named': 2,
    'import/namespace': 2,
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'groups': [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index']
        ]
      }
    ],
    "@typescript-eslint/no-unused-vars": ["error", { "ignoreRestSiblings": true }],
    '@typescript-eslint/explicit-function-return-type': 'error'
  },
};
