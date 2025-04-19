// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';

export default [
  {
    // Base ESLint configuration
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  },

  // TypeScript configuration
  {
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  // Test files configuration (Vitest)
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*', '**/*.test.js', '**/*.spec.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
