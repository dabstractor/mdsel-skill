import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript ESLint configuration
  ...tseslint.configs.recommended,

  // Prettier (disable conflicting ESLint rules) - MUST BE LAST
  prettierConfig,

  // Custom rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            '*.config.ts',
            '*.config.js',
            'vitest.config.ts',
            'tsup.config.ts',
            'tests/e2e/*.test.ts',
            'tests/hooks/*.test.ts',
            'tests/integration/*.test.ts',
            'tests/lib/*.test.ts',
            'tests/tools/*.test.ts',
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      // Import ordering (new rule)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // Async/promise handling (MCP servers use async heavily)
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Type import consistency (ESM friendly)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: true },
      ],

      // Preserve existing rules from current config
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
];
