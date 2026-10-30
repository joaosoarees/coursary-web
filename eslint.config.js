import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['node_modules/', 'build/', '.react-router/'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^node:'], ['^@?\\w'], ['^~/'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
    },
  },
  // Only the build's own configuration runs in Node; the app runs in the browser.
  {
    files: ['*.config.{js,ts}', 'vitest.setup.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
]);
