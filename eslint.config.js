import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
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
  // Only the theme's tokens make colour classes: an unknown class is a typo or a colour outside them.
  {
    files: ['app/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: { 'better-tailwindcss': { entryPoint: 'app/app.css' } },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern:
                '^(?:[\\w-]+:)*(?:bg|fill|stroke|from|via|to|decoration|caret|accent|placeholder|divide)-[\\[(]',
              message: 'Use a colour token from app/app.css.',
            },
            {
              pattern:
                '^(?:[\\w-]+:)*(?:text|border(?:-[trblxyse])?|ring|outline|shadow)-[\\[(](?![\\d.]|calc|length:)',
              message: 'Use a colour token from app/app.css.',
            },
          ],
        },
      ],
    },
  },
  // Only the build's own configuration and scripts run in Node; the app runs in the browser.
  {
    files: ['*.config.{js,ts}', 'vitest.setup.ts', 'scripts/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
]);
