# Product Requirement Prompt (PRP): Code Quality and CI Setup

**Task ID**: P3.M1.T2
**Work Item**: Code Quality and CI Setup
**Status**: Ready for Implementation

---

## Goal

**Feature Goal**: Configure and enhance ESLint, Prettier, and npm scripts to ensure code quality standards and automate validation before package publishing.

**Deliverable**: Enhanced code quality tooling including:

- Improved `eslint.config.js` with TypeScript-specific rules and Prettier integration
- `.prettierignore` file to exclude build artifacts from formatting
- Enhanced `.prettierrc.json` with all recommended settings
- Updated `package.json` with `prepublishOnly` hook and quality scripts (format:check, validate, quality)

**Success Definition**:

- `npm run lint` executes with zero errors
- `npm run format:check` validates formatting without modifying files
- `npm run quality` runs all quality checks (lint, format:check, type-check)
- `npm run prepublishOnly` (triggered before npm publish) runs build, test, lint, and format checks

---

## Why

- **Publishing Quality Gates**: Prevents publishing broken or poorly formatted code to npm
- **Developer Experience**: Automated formatting and linting catches issues early
- **CI/CD Foundation**: Quality scripts enable automated checks in CI pipelines
- **Code Consistency**: Enforces consistent code style across the codebase
- **PRD Compliance**: Supports P3 (Polish & Validation) phase quality standards

---

## What

Enhance existing code quality tooling with:

1. **ESLint enhancements**: Add TypeScript-specific rules, Prettier integration, import ordering
2. **Prettier ignore file**: Exclude dist/, node_modules, and generated files
3. **npm quality scripts**: prepublishOnly, format:check, validate, quality
4. **Prettier configuration refinements**: Ensure all recommended settings are present

### Success Criteria

- [ ] **P3.M1.T2.S1**: ESLint and Prettier configured with TypeScript best practices
- [ ] **P3.M1.T2.S2**: prepublishOnly and quality scripts added to package.json
- [ ] All linting rules pass on existing codebase
- [ ] Format check validates current code (no changes needed)
- [ ] prepublishOnly script runs successfully

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: Yes - this PRP provides:

- Current file states to understand existing configuration
- Exact changes needed for each file
- Best practices from research with specific URLs
- npm script patterns with rationale
- Validation commands for each change

### Documentation & References

```yaml
# MUST READ - Core Research Documents
- docfile: plan/P3M1T2/research/eslint_prettier_research.md
  why: Complete ESLint and Prettier best practices for TypeScript in 2025
  section: ESLint Flat Config Format, Prettier Configuration, CI/CD Integration
  critical: Modern flat config format, Prettier integration to avoid conflicts

- docfile: plan/P3M1T2/research/npm_scripts_cicd_research.md
  why: npm scripts patterns and CI/CD workflows specifically for MCP servers
  section: Core Scripts Structure, prepublishOnly Hook Usage, Quality Scripts
  critical: prepublishOnly vs prepare vs prepack differences, format:check patterns

- docfile: plan/P3M1T2/research/mcp_server_publishing_research.md
  why: MCP server publishing best practices and quality gates
  section: Quality Gates for Publishing, prepublishOnly Scripts in Published MCP Servers
  critical: What should run before npm publish, testing requirements

# EXISTING CONFIGURATION FILES - Understand Current State
- file: /home/dustin/projects/mdsel-claude-glm/eslint.config.js
  why: Current ESLint configuration to enhance, not replace
  pattern: Flat config format with TypeScript ESLint, basic rules already configured
  gotcha: Project uses flat config (eslint.config.js), not legacy .eslintrc.json

- file: /home/dustin/projects/mdsel-claude-glm/.prettierrc.json
  why: Current Prettier configuration to enhance with missing settings
  pattern: JSON format with semi, singleQuote, tabWidth, trailingComma, printWidth
  gotcha: May be missing trailingComma: "all" vs "es5", bracketSameLine setting

- file: /home/dustin/projects/mdsel-claude-glm/package.json
  why: Current npm scripts to understand what exists and what to add
  pattern: Scripts for build, dev, test, lint, format, type-check already exist
  gotcha: Missing prepublishOnly, format:check, validate, quality scripts

# OFFICIAL DOCUMENTATION
- url: https://eslint.org/docs/latest/use/configure/configuration-files-new
  why: ESLint flat config format reference
  section: Configuration Objects, ignores array
  critical: Modern ESLint v9+ uses flat config, not legacy format

- url: https://typescript-eslint.io/getting-started
  why: TypeScript ESLint official documentation
  section: Configurations, Rules reference
  critical: typescript-eslint v8+ uses new package structure

- url: https://prettier.io/docs/en/configuration.html
  why: Prettier configuration options reference
  section: Options overview, Overrides
  critical: bracketSameLine, trailingComma settings affect ESM output

- url: https://docs.npmjs.com/cli/v9/using-npm/scripts
  why: npm scripts documentation including lifecycle hooks
  section: Life cycle scripts, prepublishOnly
  critical: prepublishOnly runs before npm publish, NOT before npm install

# PROJECT CONTEXT
- file: PRD.md
  why: Understand project requirements for quality standards
  section: Section 11 (Success Criteria)
  gotcha: Project is an MCP server adapter, requires ESM with .js extensions

- file: plan/docs/architecture/system_context.md
  why: System architecture affecting linting rules
  section: External Dependencies, Integration Points
  gotcha: Project delegates to mdsel CLI - no parsing/validation in our code

- file: plan/docs/P1M1T1/PRP.md
  why: Original project scaffolding PRP for context
  section: Implementation Patterns & Key Details
  pattern: ESM imports with .js extensions, NodeNext module resolution
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm
├── dist/                          # Build output (ESM compiled)
├── plan/
│   ├── docs/
│   │   └── architecture/          # Architecture documentation
│   └── P3M1T2/
│       └── PRP.md                 # This file
│       └── research/              # Research documents (already created)
├── src/
│   ├── hooks/
│   │   └── read-hook.ts           # PreToolUse hook (standalone script)
│   ├── index.ts                   # MCP server entry point
│   ├── lib/
│   │   ├── mdsel-cli.ts           # CLI wrapper for mdsel
│   │   └── word-count.ts          # Word counting utilities
│   ├── tools/
│   │   ├── mdsel-index.ts         # mdsel_index tool handler
│   │   └── mdsel-select.ts        # mdsel_select tool handler
│   └── types.ts                   # TypeScript type definitions
├── tests/
│   ├── e2e/                       # E2E tests (P3.M1.T1)
│   │   └── *.test.ts
│   ├── hooks/
│   │   └── read-hook.test.ts
│   ├── integration/
│   │   └── mcp-server.test.ts
│   ├── lib/
│   │   └── *.test.ts
│   └── tools/
│       └── *.test.ts
├── eslint.config.js               # EXISTING: Flat config ESLint (needs enhancement)
├── .prettierrc.json               # EXISTING: Prettier config (needs refinement)
├── package.json                   # EXISTING: Needs prepublishOnly and quality scripts
├── tsconfig.json                  # TypeScript configuration
├── tsup.config.ts                 # Bundler configuration
└── vitest.config.ts               # Test framework configuration
```

### Desired Codebase Tree with Modified Files

```bash
/home/dustin/projects/mdsel-claude-glm
├── [existing files unchanged...]
├── eslint.config.js               # ENHANCED: Add Prettier integration, import rules
├── .prettierignore                # NEW: Exclude dist/, node_modules, etc.
├── .prettierrc.json               # ENHANCED: Add bracketSameLine, verify all settings
└── package.json                   # ENHANCED: Add prepublishOnly, format:check, validate, quality
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESLint Flat Config (not legacy .eslintrc)
// Project uses eslint.config.js with flat config format
// Do NOT use .eslintrc.json or .eslintrc.js
// Must use: import js from '@eslint/js';
// Must use: export default [ ...config objects ];

// CRITICAL: ESM with .js extensions in imports
// TypeScript files are .ts but imports reference compiled .js
// Example: import { foo } from './utils.js' (not './utils')
// ESLint needs import/extensions rule configured correctly

// CRITICAL: typescript-eslint v8+ package structure
// New: import tseslint from 'typescript-eslint';
// Old: import * as tsParser from '@typescript-eslint/parser';
// Must use new package structure in flat config

// CRITICAL: Prettier vs ESLint conflicts
// Must use eslint-config-prettier to disable conflicting ESLint rules
// Rules to disable: comma-dangle, semi, quotes, max-len, space-before-function-paren

// CRITICAL: prepublishOnly vs prepare scripts
// prepublishOnly: Runs ONLY before npm publish (NOT on npm install)
// prepare: Runs after npm install AND before npm publish
// Use prepublishOnly for validation that shouldn't slow down development

// CRITICAL: MCP Server constraints
// This is a thin adapter - no parsing, no validation in our code
// Linting should not add validation logic that violates PRD Section 10 (Non-Goals)
// ESLint rules for async/promises are important (no-floating-promises)

// GOTCHA: dist/ directory should be ignored by Prettier
// dist/ contains compiled JavaScript, not source
// Add to .prettierignore along with node_modules/, coverage/

// GOTCHA: File extensions in ESLint flat config
// Use: files: ['**/*.{ts,tsx}'] for TypeScript files
// Use: files: ['**/*.{js,mjs,cjs}'] for config files
// Don't mix - keeps configuration clean

// GOTCHA: tsup generates bundled output
// tsup bundles to dist/ with .js, .d.ts, .js.map files
// These should be excluded from linting and formatting
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models for this task. We are enhancing configuration files only.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE .prettierignore file
  - IMPLEMENT: .prettierignore excluding dist/, node_modules, etc.
  - CONTENTS:
    * Dependencies: node_modules/
    * Build output: dist/, build/
    * Cache: .cache/, *.log, coverage/
    * Config files: *.config.js, *.config.ts
  - FOLLOW pattern: From eslint_prettier_research.md "Prettier Ignore File" section
  - PLACEMENT: /.prettierignore (project root)
  - VALIDATION: Run `npm run format` - should skip dist/ and node_modules/

Task 2: ENHANCE eslint.config.js
  - MODIFY existing eslint.config.js
  - ADD: Import eslint-config-prettier to disable conflicting rules
  - ADD: Import ordering rule (import/order with groups and alphabetize)
  - ADD: TypeScript-specific rules (no-floating-promises, consistent-type-imports)
  - ADD: Global types for process, Buffer (if not already present)
  - VERIFY: Existing rules preserved (@typescript-eslint/no-unused-vars, etc.)
  - FOLLOW pattern: eslint_prettier_research.md "ESLint Flat Config Format"
  - GOTCHA: Prettier config must be LAST in array to override previous configs
  - PLACEMENT: /eslint.config.js (modify existing)
  - VALIDATION: Run `npm run lint` - zero errors, no conflicts with Prettier

Task 3: ENHANCE .prettierrc.json
  - MODIFY existing .prettierrc.json
  - VERIFY: All recommended settings present
  - ADD: bracketSameLine: false (ESM friendly)
  - VERIFY: trailingComma is "es5" or "all" (not missing)
  - ADD: endOfLine: "lf" (consistent line endings)
  - FOLLOW pattern: mcp_server_publishing_research.md "Prettier Configuration"
  - GOTCHA: bracketSameLine affects ESM import formatting
  - PLACEMENT: /.prettierrc.json (modify existing)
  - VALIDATION: Run `npm run format:check` - should pass on existing code

Task 4: ENHANCE package.json scripts
  - MODIFY existing package.json scripts section
  - ADD: "format:check": "prettier --check ." (validates without modifying)
  - ADD: "validate": "npm run lint && npm run type-check" (combined validation)
  - ADD: "quality": "npm run lint && npm run format:check && npm run type-check" (all quality checks)
  - ADD: "prepublishOnly": "npm run build && npm run test:run && npm run lint && npm run format:check"
  - PRESERVE: All existing scripts (build, dev, test, lint, format, type-check)
  - FOLLOW pattern: npm_scripts_cicd_research.md "prepublishOnly Hook Usage"
  - GOTCHA: prepublishOnly runs before npm publish, NOT before npm install
  - GOTCHA: Order of operations in prepublishOnly: build -> test -> lint -> format:check
  - PLACEMENT: package.json scripts section (modify existing)
  - VALIDATION: Run `npm run quality` - all checks pass
  - VALIDATION: Run `npm run prepublishOnly` - all steps execute successfully
```

### Implementation Patterns & Key Details

```javascript
// ============================================================
// PATTERN 1: ESLint Flat Config with Prettier Integration
// ============================================================

// CRITICAL: Order matters - Prettier must be last
// eslint.config.js

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier'; // ← MUST ADD THIS

export default [
  // 1. Base JavaScript config
  js.configs.recommended,

  // 2. TypeScript ESLint config
  ...tseslint.configs.recommended,

  // 3. Prettier (disable conflicting ESLint rules) ← MUST BE LAST
  prettierConfig,

  // 4. Custom rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      // ADD: Import ordering (new rule)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // ADD: Async/promise handling (MCP servers use async heavily)
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // ADD: Type import consistency (ESM friendly)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: true },
      ],

      // PRESERVE: Existing rules from current config
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 5. Ignore patterns (already exists)
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
];

// ============================================================
// PATTERN 2: .prettierignore File
// ============================================================

# .prettierignore

# Dependencies
node_modules/

# Build output
dist/
build/
out/

# Cache and logs
.cache/
*.log
coverage/

# Configuration files (usually auto-formatted by tools)
*.config.js
*.config.ts

# Test artifacts
test-results/
playwright-report/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

// ============================================================
// PATTERN 3: Enhanced .prettierrc.json
// ============================================================

{
  "semi": true,              // ← Already present
  "singleQuote": true,       // ← Already present
  "tabWidth": 2,             // ← Already present
  "trailingComma": "es5",    // ← Verify present (change to "all" if needed)
  "printWidth": 100,         // ← Already present
  "bracketSameLine": false,  // ← ADD THIS (ESM friendly)
  "arrowParens": "always",   // ← ADD THIS (consistent)
  "endOfLine": "lf"          // ← ADD THIS (consistent line endings)
}

// ============================================================
// PATTERN 4: package.json Quality Scripts
// ============================================================

{
  "scripts": {
    // EXISTING SCRIPTS - PRESERVE ALL
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "vitest run tests/e2e/",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",

    // NEW SCRIPTS TO ADD
    "format:check": "prettier --check .",
    "validate": "npm run lint && npm run type-check",
    "quality": "npm run lint && npm run format:check && npm run type-check",
    "prepublishOnly": "npm run build && npm run test:run && npm run lint && npm run format:check"
  }
}

// ============================================================
// PATTERN 5: prepublishOnly Execution Order
// ============================================================

// prepublishOnly should execute in this order:
// 1. build      - Generate dist/ (required for publishing)
// 2. test:run   - Run all tests (validate functionality)
// 3. lint       - Check code quality (ESLint)
// 4. format:check - Validate formatting (Prettier)
//
// Why this order?
// - Build first: Tests may need compiled output
// - Tests before lint: Functional correctness > style
// - Lint before format: Code quality > formatting
// - Format check last: Fastest way to catch style issues
```

### Integration Points

```yaml
ESLINT_INTEGRATION:
  - file: eslint.config.js
  - modify: Add prettierConfig import, import ordering rules, async rules
  - preserve: All existing rules and configuration
  - integration: Must not conflict with Prettier (eslint-config-prettier)

PRETTIER_INTEGRATION:
  - file: .prettierignore
  - create: New file excluding dist/, node_modules/, etc.
  - integration: ESLint must defer to Prettier for style rules

PACKAGE_JSON:
  - file: package.json
  - modify: scripts section
  - add: format:check, validate, quality, prepublishOnly
  - preserve: All existing scripts (build, dev, test, lint, format, type-check)

NPM_PUBLISH:
  - hook: prepublishOnly
  - runs: Before `npm publish` only (NOT before `npm install`)
  - purpose: Validate package quality before publishing
  - commands: build && test:run && lint && format:check
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file modification - fix before proceeding

# After .prettierignore creation
cat .prettierignore
# Expected: Contains dist/, node_modules/, coverage/, *.config.js

# After eslint.config.js modification
npm run lint
# Expected: Zero errors, no new warnings introduced
# If errors: Check import statement for eslint-config-prettier

# After .prettierrc.json enhancement
npm run format:check
# Expected: Validation passes (no formatting changes needed)
# If fails: Current code doesn't match Prettier config - run `npm run format` first

# After package.json scripts addition
npm run quality
# Expected: All quality checks pass (lint, format:check, type-check)
# If fails: Debug which check is failing and fix

# FINAL: Project-wide validation
npm run quality && npm run build && npm run test:run
# Expected: All quality gates pass, build succeeds, tests pass
```

### Level 2: Script Validation (Component Testing)

```bash
# Test each new script individually

# Test format:check script
npm run format:check
# Expected: Exits with code 0 if formatted, code 1 if not
# Verify: Does NOT modify any files (use --check flag)

# Test validate script
npm run validate
# Expected: Runs lint and type-check sequentially
# Verify: Both checks pass

# Test quality script
npm run quality
# Expected: Runs lint, format:check, type-check
# Verify: All three checks pass

# Test prepublishOnly script
npm run prepublishOnly
# Expected: Runs build, test:run, lint, format:check
# Verify: All four steps complete successfully
# Verify: dist/ directory is created with compiled output
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify all scripts work together

# Test that existing scripts still work
npm run build
npm run test:run
npm run lint
npm run format
npm run type-check
# Expected: All existing scripts still function

# Test that prepublishOnly runs correctly
npm run prepublishOnly
# Expected output:
#   > mdsel-claude@1.0.0 prepublishOnly
#   > npm run build && npm run test:run && npm run lint && npm run format:check
#
#   > mdsel-claude@1.0.0 build
#   > tsup
#   [build output]
#   > mdsel-claude@1.0.0 test:run
#   > vitest run
#   [test output]
#   > mdsel-claude@1.0.0 lint
#   > eslint .
#   [lint output or "No problems"]
#   > mdsel-claude@1.0.0 format:check
#   > prettier --check .
#   [checking output or "No matching files"]

# Verify dist/ is created
ls -la dist/
# Expected: index.js, index.d.ts, hooks/, tools/ directories

# Verify all quality checks pass
npm run quality
# Expected: Exit code 0, all checks pass
```

### Level 4: Publishing Simulation (Domain-Specific Validation)

```bash
# Simulate npm publish (without actually publishing)

# Create a dry-run tarball to test prepublishOnly
npm pack --dry-run
# Expected:
#   - Runs prepublishOnly automatically
#   - All checks pass (build, test, lint, format:check)
#   - Creates .tgz file info without creating actual file
#   - Exit code 0

# If prepublishOnly fails, publish will fail
# This is the desired behavior - prevents broken publishes

# Test that prepublishOnly catches issues
# (Create intentional issue to verify validation works)
# 1. Create unformatted file
echo "const x=1" > src/test-bad-format.ts
# 2. Run prepublishOnly
npm run prepublishOnly
# Expected: Fails at format:check step
# 3. Clean up
rm src/test-bad-format.ts

# Verify the fix works
npm run format
npm run prepublishOnly
# Expected: Now passes (format fixed the issue)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] .prettierignore file created with correct exclusions
- [ ] eslint.config.js enhanced with Prettier integration
- [ ] .prettierrc.json has all recommended settings
- [ ] package.json has 4 new scripts (format:check, validate, quality, prepublishOnly)
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run format:check` validates current code
- [ ] `npm run quality` runs all quality checks successfully
- [ ] `npm run prepublishOnly` completes all 4 steps (build, test, lint, format:check)

### Feature Validation

- [ ] P3.M1.T2.S1: ESLint and Prettier configured
  - [ ] eslint.config.js includes eslint-config-prettier
  - [ ] Import ordering rule added
  - [ ] TypeScript async rules added
  - [ ] .prettierignore excludes dist/ and build artifacts
- [ ] P3.M1.T2.S2: prepublishOnly and quality scripts added
  - [ ] format:check script exists and works
  - [ ] validate script exists and works
  - [ ] quality script exists and works
  - [ ] prepublishOnly script runs all validation steps

### Code Quality Validation

- [ ] ESLint configuration follows flat config format
- [ ] Prettier configuration matches MCP server best practices
- [ ] No conflicts between ESLint and Prettier rules
- [ ] All existing npm scripts preserved
- [ ] New scripts follow existing naming conventions

### Documentation & Deployment

- [ ] Changes align with research documents
- [ ] Configuration follows TypeScript/MCP server best practices
- [ ] prepublishOnly prevents publishing broken code
- [ ] Quality scripts enable CI/CD automation

---

## Anti-Patterns to Avoid

- ❌ Don't modify existing ESLint rules - only add new ones
- ❌ Don't change Prettier settings that affect existing code formatting
- ❌ Don't remove or rename existing npm scripts
- ❌ Don't use `prepare` instead of `prepublishOnly` - different purposes
- ❌ Don't add `--fix` to prepublishOnly - validation should be read-only
- ❌ Don't skip `format:check` in prepublishOnly - formatting matters
- ❌ Don't make prepublishOnly run on every `npm install` - use `prepare` for that
- ❌ Don't forget to add `.prettierignore` - would format dist/ files unnecessarily
- ❌ Don't mix legacy and flat ESLint configs - stick to flat config
- ❌ Don't disable ESLint rules that conflict with Prettier manually - use eslint-config-prettier
- ❌ Don't add formatting to `prepublishOnly` (use format:check) - should validate, not modify
- ❌ Don't run tests before build in prepublishOnly - tests may need compiled output

---

## Confidence Score

**Rating: 10/10** for one-pass implementation success

**Rationale**:

1. **Complete Context**: All existing files read and understood
2. **Specific Changes**: Each task specifies exact modifications to make
3. **Research Backed**: All changes supported by research documents with URLs
4. **Validation Commands**: Every step has executable validation
5. **No Ambiguity**: Clear distinction between modify vs create, preserve vs add
6. **Dependency Ordered**: Tasks listed in correct sequence
7. **Gotcha Documentation**: ESM, flat config, prepublishOnly nuances documented
8. **Existing Patterns**: Follows patterns from successful PRPs (P1M1T1, P3M1T1)

**This PRP enables an AI agent unfamiliar with the codebase to successfully implement P3.M1.T2 using only the PRP content and codebase access.**
