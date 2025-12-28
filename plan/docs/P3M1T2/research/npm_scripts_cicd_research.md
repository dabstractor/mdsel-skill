# npm Scripts and CI/CD Patterns for Node.js/TypeScript MCP Servers in 2025

This document researches and documents best practices for npm scripts and CI/CD workflows specifically designed for Node.js/TypeScript MCP (Model Context Protocol) servers.

---

## 1. npm Scripts Best Practices

### Core Scripts Structure for TypeScript MCP Servers

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "dev": "npm run build:watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.{ts,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,json,md}\"",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test && npm run lint:fix && npm run format:check",
    "prepack": "npm run build",
    "prepare": "husky install",
    "clean": "rimraf dist"
  }
}
```

### prepublishOnly Hook Usage and Patterns

**When to use prepublishOnly:**

- Runs only before `npm publish` (not on `npm install`)
- Ideal for validation steps that shouldn't block development
- Should be fast but thorough

**Common patterns:**

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm run test && npm run lint"
  }
}
```

**Advanced pattern with conditional checks:**

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm run test && npm run type-check && npm run lint"
  }
}
```

### Quality Scripts (lint-staged, format-check)

**package.json scripts:**

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,json,md}\"",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "prepare": "husky install"
  }
}
```

**.lintstagedrc.json configuration:**

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

**Pre-commit hooks (.husky/pre-commit):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Test Scripts with Coverage

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --coverage-reporters=text-lcov",
    "test:ci": "npm run test:coverage"
  }
}
```

**jest.config.js:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
```

### Pre-commit Validation Scripts

```json
{
  "scripts": {
    "precommit": "lint-staged",
    "prepush": "npm run type-check",
    "commitmsg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

---

## 2. CI/CD for MCP Servers

### GitHub Actions Workflow Template

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

jobs:
  test:
    name: Test Node.js ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Build
        run: npm run build

      - name: Test
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

  publish:
    name: Publish to npm
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ env.NPM_TOKEN }}
```

### Testing Across Node.js Versions

**Strategy for MCP servers:**

- Test on LTS versions (18, 20, 22)
- Include current and previous LTS
- Consider ESM/CJS compatibility
- Test with different TypeScript configurations

**Example matrix strategy:**

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]
    exclude:
      - os: windows-latest
        node-version: 18
```

### Automated Publishing to npm

**With semantic-release:**

```yaml
publish:
  name: Publish
  needs: test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'

  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
        token: ${{ secrets.GITHUB_TOKEN }}

    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        registry-url: 'https://registry.npmjs.org'

    - run: npm ci

    - run: npx semantic-release
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Semantic Release Patterns

**package.json with semantic-release:**

```json
{
  "name": "mcp-server-example",
  "version": "0.0.0-development",
  "release": {
    "branches": [
      "main",
      {
        "name": "beta",
        "prerelease": true
      }
    ]
  },
  "scripts": {
    "release": "semantic-release"
  }
}
```

**semantic-release configuration:**

```json
{
  "branches": ["main", "beta"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/changelog"
  ]
}
```

---

## 3. Package.json Scripts

### Common Script Patterns for TypeScript Projects

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "build:prod": "tsc --sourceMap false",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky install"
  }
}
```

### prepublishOnly vs prepare vs prepack

| Script           | When it Runs                                                 | Best For                                                             | Example Use                      |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------- |
| `prepare`        | Before `npm pack` and `npm publish`, and after `npm install` | Build steps that should run for both publishing and development      | `npm run build`                  |
| `prepublishOnly` | Only before `npm publish`                                    | Validation, testing, or steps that should only run before publishing | `npm test && npm run lint`       |
| `prepack`        | Before `npm pack` and `npm publish`                          | Preparing the package for distribution                               | `npm run clean && npm run build` |

**Recommended pattern for TypeScript MCP servers:**

```json
{
  "scripts": {
    "prepare": "npm run build",
    "prepublishOnly": "npm run test && npm run lint:fix && npm run format:check",
    "prepack": "npm run clean && npm run build",
    "postpack": "npm run clean"
  }
}
```

### Scripts that Validate Before Publishing

```json
{
  "scripts": {
    "prepublishOnly": "npm run validate && npm run build",
    "validate": "npm run type-check && npm run lint && npm run test",
    "validate:strict": "npm run validate && npm run format:check"
  }
}
```

### Format Checking vs Format Writing

**Format writing (modifies files):**

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:all": "prettier --write .",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

**Format checking (reports only):**

```json
{
  "scripts": {
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "format:all:check": "prettier --check .",
    "lint": "eslint src/**/*.ts"
  }
}
```

---

## 4. Integration with ESLint/Prettier

### Combined Quality Check Scripts

```json
{
  "scripts": {
    "quality": "npm run lint && npm run format:check && npm run type-check",
    "quality:fix": "npm run lint:fix && npm run format"
  }
}
```

### Fix-all Scripts for Development

```json
{
  "scripts": {
    "fix": "npm run lint:fix && npm run format",
    "fix:all": "npm run lint:fix && npm run format:all",
    "prettier:fix": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "eslint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### CI-specific Scripts vs Development Scripts

**CI scripts (strict validation):**

```json
{
  "scripts": {
    "ci:check": "npm run lint && npm run format:check && npm run type-check && npm run test:ci",
    "ci:build": "npm run build"
  }
}
```

**Development scripts (more flexible):**

```json
{
  "scripts": {
    "dev": "npm run build:watch",
    "dev:lint": "npm run lint:fix",
    "dev:format": "npm run format"
  }
}
```

### ESLint Configuration for TypeScript

**.eslintrc.js:**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
  },
};
```

---

## 5. MCP Server Specific Patterns

### Model Context Protocol Specific Scripts

```json
{
  "scripts": {
    "mcp:validate": "npx @modelcontextprotocol/server validate",
    "mcp:types": "tsc --noEmit",
    "mcp:test": "npm test",
    "mcp:lint": "npm run lint",
    "mcp:format": "npm run format",
    "prepublishOnly": "npm run mcp:validate && npm run mcp:test && npm run mcp:lint && npm run mcp:format"
  }
}
```

### MCP Server CI Workflow

```yaml
name: MCP Server CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-mcp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate MCP server
        run: npm run mcp:validate

      - name: Type check
        run: npm run mcp:types

      - name: Build
        run: npm run build

      - name: Test
        run: npm run mcp:test

      - name: Lint and format
        run: npm run mcp:lint && npm run mcp:format
```

---

## 6. Best Practices with Rationale

### 1. Use prepublishOnly for Publishing Validation

**Rationale:** Ensures your package is in a good state before publishing without slowing down development installs.

### 2. Separate Type Checking from Compilation

**Rationale:** Allows faster type-only checks during development without generating files.

### 3. Use lint-staged for Efficient CI

**Rationale:** Only runs quality checks on changed files, making local development faster.

### 4. Test Across Multiple Node.js Versions

**Rationale:** Ensures compatibility with different environments where your MCP server might run.

### 5. Use semantic-release for Automated Versioning

**Rationale:** Reduces manual work and ensures consistent versioning based on commit messages.

### 6. Separate CI and Development Scripts

**Rationale:** CI should be strict and comprehensive, while development scripts should be fast and iterative.

### 7. Include MCP-specific Validation

**Rationale:** Ensures your server conforms to the Model Context Protocol specification.

### 8. Use Cache for Dependencies

**Rationale:** Speeds up CI runs and reduces npm registry load.

### 9. Include Coverage Reports

**Rationale:** Provides visibility into test coverage and helps maintain code quality.

### 10. Use Husky for Git Hooks

**Rationale:** Enforces code quality standards before commits and pushes.

---

## Resources

### Official Documentation

- [npm scripts documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/intro-to-typescript.html)
- [Jest testing framework](https://jestjs.io/docs/getting-started)
- [ESLint](https://eslint.org/docs/latest/use/configure/)
- [Prettier](https://prettier.io/docs/en/cli.html)
- [semantic-release](https://semantic-release.gitbook.io/semantic-release/)

### GitHub Actions

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Setup Node.js Action](https://github.com/actions/setup-node)
- [Cache dependencies](https://github.com/actions/cache)

### MCP Specific

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Server TypeScript examples](https://github.com/modelcontextprotocol/servers)

---

_This research document provides comprehensive patterns and best practices for npm scripts and CI/CD workflows specifically tailored for Node.js/TypeScript MCP servers in 2025._
