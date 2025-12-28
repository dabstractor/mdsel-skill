# ESLint & Prettier Best Practices for TypeScript Projects (2025)

## Table of Contents

1. [ESLint Flat Config Format](#eslint-flat-config-format)
2. [Prettier Configuration](#prettier-configuration)
3. [CI/CD Integration](#cicd-integration)
4. [Common Issues and Solutions](#common-issues-and-solutions)

---

## 1. ESLint Flat Config Format

### Overview

The ESLint flat config system (`eslint.config.js`) replaces the legacy `.eslintrc.js` format starting with ESLint v8. This modern approach offers better performance, TypeScript support, and configuration flexibility.

### Basic Structure

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript ESLint configuration
  ...tseslint.configs.recommended,
  tseslint.configs['stylistic'],

  // Prettier (disables conflicting ESLint rules)
  prettierConfig,

  // Custom configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Enables TypeScript project service
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.mjs', '.cjs'],
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: 'eslint-plugin-import',
      prettier: 'eslint-plugin-prettier',
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'off',

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // Node.js specific
      'node/no-unpublished-import': 'off',
      'node/no-unpublished-require': 'off',
      'node/no-missing-import': 'warn',
      'node/no-missing-require': 'warn',

      // MCP Server specific
      '@typescript-eslint/no-floating-promises': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      'coverage/',
      '.next/',
      'out/',
      'build/',
    ],
  },
];
```

### Recommended TypeScript ESLint Rules for 2025

#### Core Rules

```javascript
rules: {
  // Code Quality
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-empty-interface': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/ban-types': [
    'error',
    {
      extendDefaults: true,
      types: {
        object: false,
        Function: false
      }
    }
  ],

  // Best Practices
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: true
    }
  ],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'allow'
    },
    {
      selector: 'function',
      format: ['camelCase'],
      leadingUnderscore: 'allow'
    },
    {
      selector: 'class',
      format: ['PascalCase']
    },
    {
      selector: 'interface',
      format: ['PascalCase'],
      prefix: ['I']
    },
    {
      selector: 'typeAlias',
      format: ['PascalCase']
    }
  ]
}
```

### Prettier Integration

```javascript
// Install required packages
npm install -D eslint-config-prettier eslint-plugin-prettier

// In eslint.config.js:
import prettierConfig from 'eslint-config-prettier';

export default [
  // ... other configs
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Disable ESLint rules that conflict with Prettier
      'comma-dangle': 'off',
      'no-trailing-spaces': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/semi': 'off'
    }
  }
];
```

---

## 2. Prettier Configuration

### Basic .prettierrc Configuration

```json
// .prettierrc.json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto"
}
```

### Advanced Prettier Configuration with TypeScript Support

```json
// .prettierrc.json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",

  // TypeScript-specific settings
  "parser": "typescript",
  "overrides": [
    {
      "files": "*.ts",
      "options": {
        "parser": "typescript"
      }
    },
    {
      "files": "*.tsx",
      "options": {
        "parser": "typescript"
      }
    },
    {
      "files": "*.json",
      "options": {
        "parser": "json"
      }
    },
    {
      "files": "*.md",
      "options": {
        "parser": "markdown"
      }
    }
  ]
}
```

### Prettier Ignore File

```gitignore
# .prettierignore
# Dependencies
node_modules/
dist/
build/
out/
.next/
.nuxt/


# Configuration files
*.config.js
*.config.ts
*.config.mjs
*.config.cjs

# Cache and logs
.cache/
*.log
coverage/

# Testing
test-results/
playwright-report/

# IDE-specific
.vscode/
.idea/

# OS-generated files
.DS_Store
Thumbs.db
```

### Integration with ESLint

To avoid conflicts between ESLint and Prettier:

1. **Install both configs**:

```bash
npm install -D eslint-config-prettier eslint-plugin-prettier
```

2. **Use in ESLint flat config**:

```javascript
// eslint.config.js
import prettierConfig from 'eslint-config-prettier';

export default [
  // ... other configs
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // These rules conflict with Prettier
      'comma-dangle': 'off',
      'no-trailing-spaces': 'off',
      'max-len': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/space-before-function-paren': 'off',
      '@typescript-eslint/quotes': 'off',
    },
  },
];
```

---

## 3. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/lint.yml
name: Lint & Format

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          # Full git history for better diffs
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type checking
        run: npx tsc --noEmit

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm test
```

### Pre-commit Hooks with Husky and lint-staged

#### 1. Install dependencies

```bash
npm install -D husky lint-staged
```

#### 2. Initialize Husky

```bash
npx husky init
```

#### 3. Configure lint-staged in package.json

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"],
    "*.yml": ["prettier --write"]
  }
}
```

#### 4. Create pre-commit hook

```bash
# Create the hook file
npx husky add .husky/pre-commit "
  #!/usr/bin/env sh
  . \"$(dirname -- \"$0\")/_/husky.sh\"

  # Run linter and formatter only on staged files
  npx lint-staged
"
```

#### 5. Make hook executable

```bash
chmod +x .husky/pre-commit
```

### Automated Formatting in CI Pipeline

```yaml
# .github/workflows/format.yml
name: Auto-format on PR

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  format:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check if files need formatting
        id: format-check
        run: |
          if npm run format:check; then
            echo "::set-output name=format_needed::false"
          else
            echo "::set-output name=format_needed::true"
            echo "Files need formatting. Running formatter..."
            npm run format
            echo "Format complete. Please commit the changes."
          fi

      - name: Create commit with formatting changes
        if: steps.format-check.outputs.format_needed == 'true'
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add .
          git commit -m "style: Format code with Prettier and ESLint"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 4. Common Issues and Solutions

### ESM-specific Linting Challenges

#### Problem: ESLint doesn't recognize ES modules

```javascript
// Solution: Use the latest ESLint configuration with proper parser options
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          modules: true,
        },
      },
    },
  },
];
```

#### Problem: Dynamic imports with require in ESM

```javascript
// Problem
const fs = require('fs/promises');

// Solution 1: Use dynamic import
const fs = await import('fs/promises');

// Solution 2: Use Node.js ESM imports
import * as fs from 'fs/promises';
```

#### Problem: No such file or directory for .mjs files

```javascript
// In eslint.config.js
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.mjs', '.cjs'],
      },
    },
  },
];
```

### TypeScript Module Resolution Issues

#### Problem: Module not found errors

```javascript
// Solution 1: Use path mapping in tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}

// Solution 2: Configure ESLint to recognize paths
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    }
  }
];
```

#### Problem: @types/node conflicts

```bash
# Solution: Use the latest @types/node
npm install -D @types/node@^20.0.0
```

### .js Extension Requirements in Imports

#### Problem: ESLint requires extensions for .js files when using TypeScript

```javascript
// Solution 1: Configure import/no-unresolved rule
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
];
```

#### Solution 2: Use import aliases

```javascript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/utils/*": ["./src/utils/*"]
    }
  }
}

// eslint.config.js
export default [
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      'import/namespace': ['error', { allowComputed: true }],
      'import/no-absolute-path': 'off',
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error'
    }
  }
];
```

### TypeScript and ESLint Configuration Issues

#### Problem: Parser mismatch

```javascript
// Ensure consistency between ESLint and TypeScript parsers
export default [
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

#### Problem: Project reference resolution

```json
// tsconfig.json
{
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}

// eslint.config.js
export default [
  {
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './tsconfig.node.json',
          './tsconfig.app.json'
        ]
      }
    }
  }
];
```

### Performance Optimization

#### Problem: Slow ESLint startup

```javascript
// eslint.config.js
export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    processor: '@typescript-eslint/parser',
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['./*.config.js'],
        },
      },
    },
  },
];
```

#### Problem: Memory usage

```bash
# Increase memory limit for ESLint
ESLINT_USE_FLAT_CONFIG=true npx eslint --max-warnings=0
```

---

## Best Practices Summary

### ESLint Configuration

1. **Use flat config** (`eslint.config.js`) for better TypeScript support
2. **Enable project service** for accurate type checking
3. **Combine recommended configs** from `typescript-eslint`
4. **Use `eslint-config-prettier`** to avoid conflicts
5. **Set appropriate rules** for your project's needs

### Prettier Configuration

1. **Keep it simple** - most settings have sensible defaults
2. **Consistent with team** - share configuration across projects
3. **Use `.prettierignore`** to exclude files that shouldn't be formatted
4. **Integrate with lint-staged** for pre-commit formatting

### CI/CD Integration

1. **Run linting on all PRs** to catch issues early
2. **Use `lint-staged`** for efficient partial formatting
3. **Automate formatting** in CI to maintain code quality
4. **Cache dependencies** to speed up CI builds

### Common Pitfalls to Avoid

1. Don't disable all ESLint rules - maintain code quality
2. Don't mix legacy and flat configs - stick to one format
3. Don't ignore TypeScript errors - they often indicate real issues
4. Don't skip type checking - it catches many bugs before runtime

---

## Resources

### Official Documentation

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Recommended Packages

- `eslint@^9.0.0`
- `@typescript-eslint/parser@^7.0.0`
- `@typescript-eslint/eslint-plugin@^7.0.0`
- `prettier@^3.0.0`
- `eslint-config-prettier@^9.0.0`
- `eslint-plugin-import@^2.29.0`
- `husky@^9.0.0`
- `lint-staged@^15.0.0`

### Configuration Examples

- [ESLint Config Examples](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/src/configs)
- [Prettier Shareable Configs](https://prettier.io/docs/en/ignore.html)
- [TypeScript Project Setup](https://www.typescriptlang.org/docs/handbook/project-setup.html)

---

_This research document covers the best practices for ESLint and Prettier configuration in TypeScript projects as of 2025. Always refer to the official documentation for the most up-to-date information._
