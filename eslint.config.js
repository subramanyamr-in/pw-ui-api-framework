import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Global directory and output ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'allure-results/**',
      'allure-report/**',
      'reports/**',
      'output/**',
      'temp/**',
      '.auth/**',
    ],
  },

  // Base JS & TS configuration
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Enforce zero `any` policy per AGENTS.md
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // Playwright-specific rules for test specs, fixtures, and page models
  {
    files: ['tests/**/*.{spec,test}.ts', 'tests/**/*.ts', 'src/fixtures/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Anti-flakiness and strict CI gates per AGENTS.md
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/valid-expect': 'error',
      // Allow POM action methods without requiring inline expect assertions
      'playwright/expect-expect': 'off',
      'playwright/valid-test-tags': ['error', { allowedTags: ['@smoke', '@regression'] }],
    },
    settings: {
      playwright: {
        messages: {
          noFocusedTest:
            '⚠️ Do not commit "test.only". Remove it before pushing to prevent CI pipeline blockage.',
          noSkippedTest:
            '⚠️ Do not commit "test.skip". Remove it before pushing to prevent CI pipeline blockage.',
          unknownTag: 'Tags must be one of: @smoke, @regression',
        },
      },
    },
  },

  // Disable any stylistic rules that conflict with Prettier
  eslintConfigPrettier,
];
