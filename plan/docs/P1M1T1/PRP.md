# Product Requirement Prompt (PRP): Initialize Node.js TypeScript Project

**Task ID**: P1.M1.T1
**Work Item**: Initialize Node.js TypeScript Project
**Status**: Ready for Implementation

---

## Goal

**Feature Goal**: Establish the foundational Node.js TypeScript project infrastructure with ESM module support, MCP SDK dependency, and complete build/test tooling to enable development of the mdsel-claude MCP server.

**Deliverable**: A fully configured Node.js/TypeScript project with:

- `package.json` with ESM configuration and all dependencies
- `tsconfig.json` for ESM output with Node18 target
- `tsup.config.ts` for bundling to ESM
- `vitest.config.ts` for testing with ESM support
- Source directory structure (`src/`, `src/tools/`, `src/hooks/`, `src/lib/`, `tests/`, `tests/tools/`, `tests/hooks/`, `tests/lib/`)
- Placeholder files (`src/index.ts`, `src/types.ts`)

**Success Definition**:

- `npm install` completes successfully with no dependency conflicts
- `npm run build` produces `dist/` directory with compiled output
- `npm run test` runs vitest successfully (even with no tests yet)
- `npm run lint` and `npm run format` execute without errors
- TypeScript compiles with `tsc --noEmit` with zero errors
- All configuration files are ESM-compatible

---

## Why

- **Foundation for P1**: This is the first task in Phase 1 (MVP: Core MCP Server) - all subsequent tasks depend on this scaffolding being correct
- **MCP SDK Integration**: The MCP SDK (`@modelcontextprotocol/sdk`) requires specific ESM configuration to work properly
- **Build Pipeline**: Establishes the build pipeline that will produce both the MCP server executable and the hook executable
- **Test Infrastructure**: Sets up vitest for the comprehensive testing required by P3.M1 (End-to-End Validation)
- **Code Quality**: Configures ESLint and Prettier for P3.M1.T2 (Code Quality and CI Setup)
- **Project Architecture**: Follows the directory structure defined in `plan/architecture/external_deps.md`

---

## What

Create a Node.js TypeScript project from scratch with:

1. **package.json**: ESM configuration (`"type": "module"`), Node.js 18+ requirement, MCP SDK dependency, development tooling (TypeScript, tsup, vitest, ESLint, Prettier), and build/test/lint/format scripts
2. **tsconfig.json**: ESM-compatible TypeScript configuration targeting ES2022 with NodeNext module resolution
3. **tsup.config.ts**: Bundler configuration for ESM output with Node18 target, type declarations, and clean builds
4. **vitest.config.ts**: Test framework configuration with global APIs, Node environment, and ESM module support
5. **Directory Structure**: Source and test directories matching the planned architecture
6. **Placeholder Files**: Empty `src/index.ts` and `src/types.ts` to establish the module structure

### Success Criteria

- [ ] All 5 configuration files created and valid JSON/TypeScript
- [ ] `npm install` succeeds with zero peer dependency warnings
- [ ] `npm run build` creates `dist/` directory (may be empty)
- [ ] `npm run test` starts vitest (may find no tests)
- [ ] `npm run lint` and `npm run format` execute successfully
- [ ] `tsc --noEmit` completes with zero errors
- [ ] All 8 directories created (`src/`, `src/tools/`, `src/hooks/`, `src/lib/`, `tests/`, `tests/tools/`, `tests/hooks/`, `tests/lib/`)
- [ ] Placeholder files exist and are syntactically valid TypeScript

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: Yes - this PRP provides:

- Exact package versions and dependency specifications
- Complete configuration file contents with inline explanations
- ESM-specific gotchas and how to avoid them
- File-by-file implementation order
- Validation commands for each step
- Links to official documentation for all tools

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- url: https://nodejs.org/api/esm.html
  why: Official Node.js ESM documentation - explains "type": "module" requirement
  critical: ESM is strict about file extensions in imports

- url: https://www.typescriptlang.org/tsconfig#module
  why: TypeScript module resolution options - NodeNext is required for ESM
  critical: Wrong module setting causes "Cannot find module" errors

- url: https://tsup.egoist.dev
  why: Official tsup documentation for bundling configuration
  critical: tsup handles both bundling and type declaration generation

- url: https://vitest.dev/config
  why: Official vitest configuration reference
  critical: Must configure globals and environment for Node.js testing

- url: https://github.com/modelcontextprotocol/sdk
  why: Official MCP SDK repository
  critical: SDK requires ESM imports with .js extensions

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/esm_config.md
  why: Complete ESM configuration research with gotchas and examples
  pattern: .js extension requirement in TypeScript source files
  gotcha: Imports use .js extensions even though source is .ts

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/tsup_config.md
  why: Complete tsup configuration research with examples
  pattern: clean: true, dts: true, target: 'node18', format: ['esm']
  gotcha: Use named entry objects, not arrays for predictable output

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/vitest_config.md
  why: Complete vitest configuration research for TypeScript/ESM
  pattern: globals: true, environment: 'node', include: ['tests/**/*.test.ts']
  gotcha: Must enable globals to use describe/it/expect without imports

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/mcp_sdk.md
  why: MCP SDK patterns for future reference
  pattern: Import from '@modelcontextprotocol/sdk/server/index.js'
  gotcha: Must include .js extension in SDK imports

- file: /home/dustin/projects/mdsel-claude-glm/plan/architecture/external_deps.md
  why: Defines exact dependency versions and project structure
  pattern: Directory structure with src/, src/tools/, src/hooks/, src/lib/
  gotcha: mdsel CLI location: /home/dustin/.local/bin/mdsel

- file: /home/dustin/projects/mdsel-claude-glm/plan/architecture/system_context.md
  why: System architecture and constraints
  pattern: "No Markdown parsing, No selector validation, No caching"
  gotcha: This is a thin adapter, not a capabilities project
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md
│   │   ├── hook_system.md
│   │   ├── system_context.md
│   │   └── tool_definitions.md
│   └── P1M1T1/
│       ├── PRP.md              # This file
│       └── research/
│           ├── esm_config.md
│           ├── tsup_config.md
│           ├── vitest_config.md
│           └── mcp_sdk.md
├── PRD.md
└── tasks.json
```

### Desired Codebase Tree (After Implementation)

```bash
/home/dustin/projects/mdsel-claude-glm
├── src/
│   ├── index.ts               # Empty export placeholder for MCP server entry
│   ├── types.ts               # Empty export placeholder for type definitions
│   ├── tools/                 # Tool handlers (P1.M3)
│   ├── hooks/                 # Hook scripts (P2.M2)
│   └── lib/                   # Utilities (P1.M2, P2.M1)
├── tests/
│   ├── tools/                 # Tool handler tests
│   ├── hooks/                 # Hook script tests
│   └── lib/                   # Utility tests
├── dist/                      # Build output (created by tsup)
├── package.json               # NEW: ESM configuration and dependencies
├── tsconfig.json              # NEW: TypeScript configuration for ESM
├── tsup.config.ts             # NEW: Bundler configuration
├── vitest.config.ts           # NEW: Test framework configuration
├── eslint.config.js           # NEW: Linting configuration (optional for this task)
├── .prettierrc.json           # NEW: Formatting configuration (optional for this task)
├── .gitignore                 # NEW: Ignore node_modules, dist
├── plan/                      # Existing planning docs
├── PRD.md                     # Existing product requirements
└── tasks.json                 # Existing task breakdown
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM requires .js extensions in TypeScript source imports
// Even though files are .ts, imports reference the compiled .js output
// ❌ WRONG: import { foo } from './utils'
// ✅ CORRECT: import { foo } from './utils.js'

// CRITICAL: MCP SDK imports must include .js extension
// ❌ WRONG: import { Server } from '@modelcontextprotocol/sdk/server/index'
// ✅ CORRECT: import { Server } from '@modelcontextprotocol/sdk/server/index.js'

// CRITICAL: tsup entry points should use named objects, not arrays
// This ensures predictable output filenames
// ❌ WRONG: entry: ['src/index.ts']
// ✅ CORRECT: entry: { index: 'src/index.ts' }

// CRITICAL: vitest requires globals: true for describe/it/expect without imports
// Without this, every test file needs: import { describe, it, expect } from 'vitest'

// CRITICAL: "type": "module" in package.json makes Node.js treat .js as ESM
// Cannot use CommonJS syntax (require, module.exports) in the same project

// CRITICAL: TypeScript's "module": "NodeNext" requires "moduleResolution": "NodeNext"
// Mismatched settings cause cryptic module resolution errors

// GOTCHA: mdsel CLI always requires --json flag for JSON output
// This will be important for P1.M2 (mdsel CLI Wrapper)

// GOTCHA: This project has constraints: No Markdown parsing, No selector validation
// All real work is delegated to mdsel CLI subprocess (see system_context.md)
```

---

## Implementation Blueprint

### Data Models and Structure

No data models are created in this task - we are only establishing project scaffolding. Data models (`MdselResult`, `MdselIndexResponse`, etc.) will be defined in **P1.M2.T1.S1**.

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE package.json with ESM and dependencies
  - IMPLEMENT: package.json with "type": "module" and "engines": { "node": ">=18.0.0" }
  - CONTENTS:
    * name: "mdsel-claude"
    * version: "1.0.0"
    * type: "module"
    * main: "./dist/index.js"
    * types: "./dist/index.d.ts"
    * engines: { "node": ">=18.0.0" }
    * scripts: build, dev, test, test:run, lint, format, type-check
    * dependencies: { "@modelcontextprotocol/sdk": "latest" }
    * devDependencies: { typescript, @types/node, tsup, vitest, eslint, prettier }
  - FOLLOW: Dependency versions from plan/architecture/external_deps.md
  - PLACEMENT: /package.json (project root)
  - VALIDATION: Run `npm install` - must complete with zero warnings

Task 2: CREATE tsconfig.json for ESM output
  - IMPLEMENT: tsconfig.json with ESM-compatible settings
  - CONTENTS:
    * target: "ES2022"
    * module: "NodeNext"
    * moduleResolution: "NodeNext"
    * strict: true
    * outDir: "./dist"
    * rootDir: "./src"
    * declaration: true
    * declarationMap: true
    * sourceMap: true
    * esModuleInterop: true
    * skipLibCheck: true
    * forceConsistentCasingInFileNames: true
  - FOLLOW: Pattern from /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/esm_config.md
  - GOTCHA: module and moduleResolution must both be "NodeNext" for ESM
  - PLACEMENT: /tsconfig.json (project root)
  - DEPENDENCIES: Requires package.json with "type": "module"
  - VALIDATION: Run `npx tsc --noEmit` - must complete with zero errors

Task 3: CREATE tsup.config.ts for bundling
  - IMPLEMENT: tsup.config.ts with ESM bundling configuration
  - CONTENTS:
    * entry: ['src/index.ts'] (single entry for MVP)
    * format: ['esm']
    * target: 'node18'
    * clean: true
    * dts: true
    * sourcemap: true
    * splitting: false
    * minify: false
  - FOLLOW: Pattern from /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/tsup_config.md
  - NAMING: Use array format for single entry point (will add read-hook.ts in P2.M2)
  - PLACEMENT: /tsup.config.ts (project root)
  - DEPENDENCIES: Requires tsconfig.json for TypeScript settings
  - VALIDATION: Run `npm run build` - must create dist/ directory

Task 4: CREATE vitest.config.ts for testing
  - IMPLEMENT: vitest.config.ts with ESM-compatible test configuration
  - CONTENTS:
    * test.globals: true (enables describe/it/expect without imports)
    * test.environment: 'node' (for backend/testing Node.js code)
    * test.include: ['tests/**/*.test.ts', 'src/**/*.test.ts']
    * test.exclude: ['node_modules', 'dist']
    * coverage.provider: 'v8'
    * coverage.reporter: ['text', 'json']
  - FOLLOW: Pattern from /home/dustin/projects/mdsel-claude-glm/plan/P1M1T1/research/vitest_config.md
  - PLACEMENT: /vitest.config.ts (project root)
  - DEPENDENCIES: Requires tsconfig.json for TypeScript settings
  - VALIDATION: Run `npm test` - must start vitest successfully

Task 5: CREATE eslint.config.js for linting
  - IMPLEMENT: eslint.config.js with TypeScript ESLint configuration
  - CONTENTS:
    * Use @typescript-eslint plugin
    * Enable prettier integration
    * Target ES2022 with modules
  - FOLLOW: Modern ESLint flat config format
  - PLACEMENT: /eslint.config.js (project root)
  - DEPENDENCIES: Requires package.json with eslint dependencies
  - VALIDATION: Run `npm run lint` - must execute without errors

Task 6: CREATE .prettierrc.json for formatting
  - IMPLEMENT: .prettierrc.json with code formatting rules
  - CONTENTS:
    * semi: true
    * singleQuote: true
    * tabWidth: 2
    * trailingComma: 'es5'
  - FOLLOW: Conventional Prettier configuration
  - PLACEMENT: /.prettierrc.json (project root)
  - DEPENDENCIES: Requires package.json with prettier dependency
  - VALIDATION: Run `npm run format` - must execute without errors

Task 7: CREATE .gitignore for build artifacts
  - IMPLEMENT: .gitignore excluding node_modules and dist
  - CONTENTS: node_modules/, dist/, *.log, .DS_Store, coverage/
  - PLACEMENT: /.gitignore (project root)
  - VALIDATION: N/A (file creation)

Task 8: CREATE source directory structure
  - IMPLEMENT: 8 directories matching planned architecture
  - DIRECTORIES: src/, src/tools/, src/hooks/, src/lib/, tests/, tests/tools/, tests/hooks/, tests/lib/
  - FOLLOW: Structure from plan/architecture/external_deps.md
  - PLACEMENT: All under project root
  - DEPENDENCIES: Requires package.json
  - VALIDATION: Run `ls -R src/ tests/` - must show all directories

Task 9: CREATE placeholder files
  - IMPLEMENT: Empty src/index.ts and src/types.ts
  - CONTENTS:
    * src/index.ts: `export {};` (empty module export)
    * src/types.ts: `export {};` (empty module export)
  - NAMING: Exact filenames as specified
  - PLACEMENT: src/index.ts, src/types.ts
  - DEPENDENCIES: Requires directory structure from Task 8
  - VALIDATION: Run `npx tsc --noEmit` - must complete with zero errors
```

### Implementation Patterns & Key Details

```typescript
// ==================== package.json ====================
// CRITICAL: "type": "module" enables ESM for the entire project
// CRITICAL: "engines.node": ">=18.0.0" required for MCP SDK

{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "type": "module",  // ← ESM ENABLING
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "engines": { "node": ">=18.0.0" },  // ← MCP SDK REQUIREMENT
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest"  // ← MCP SDK DEPENDENCY
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}

// ==================== tsconfig.json ====================
// CRITICAL: "module": "NodeNext" + "moduleResolution": "NodeNext" for ESM
// CRITICAL: "target": "ES2022" for modern JavaScript features

{
  "compilerOptions": {
    "target": "ES2022",           // ← Modern JavaScript
    "module": "NodeNext",         // ← ESM OUTPUT
    "moduleResolution": "NodeNext",  // ← ESM RESOLUTION
    "strict": true,               // ← Type safety
    "outDir": "./dist",           // ← Build output
    "rootDir": "./src",           // ← Source root
    "declaration": true,          // ← Generate .d.ts
    "declarationMap": true,       // ← Generate .d.ts.map
    "sourceMap": true,            // ← Generate .js.map
    "esModuleInterop": true,      // ← Interop with CommonJS
    "skipLibCheck": true,         // ← Skip type checking of node_modules
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

// ==================== tsup.config.ts ====================
// CRITICAL: "target": 'node18'" for Node.js 18+ compatibility
// CRITICAL: "dts: true" generates type declarations automatically

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],       // ← Single entry for now
  format: ['esm'],               // ← ESM output
  target: 'node18',              // ← Node.js 18+ target
  clean: true,                   // ← Clean dist/ before build
  dts: true,                     // ← Generate type declarations
  sourcemap: true,               // ← Generate source maps
  splitting: false,              // ← No code splitting (simpler)
  minify: false,                 // ← No minification (debuggable)
})

// ==================== vitest.config.ts ====================
// CRITICAL: "globals: true" enables describe/it/expect without imports
// CRITICAL: "environment: 'node'" for Node.js backend testing

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,               // ← Enable global test APIs
    environment: 'node',         // ← Node.js test environment
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
    },
  },
})

// ==================== Placeholder Files ====================
// src/index.ts - Empty module export for MCP server entry point
export {};

// src/types.ts - Empty module export for type definitions
export {};
```

### Integration Points

```yaml
PACKAGE_MANAGER:
  - run: npm install
  - verify: node_modules/ directory created, zero peer dependency warnings
  - critical: MCP SDK requires ESM, fails in mixed module projects

BUILD_SYSTEM:
  - command: npm run build
  - tool: tsup bundles TypeScript to ESM
  - output: dist/index.js, dist/index.d.ts, dist/index.js.map

TEST_FRAMEWORK:
  - command: npm test
  - tool: vitest runs tests in ESM mode
  - configuration: globals enabled, Node environment

LINTING:
  - command: npm run lint
  - tool: ESLint with TypeScript support
  - configuration: Flat config format

TYPE_CHECKING:
  - command: npm run type-check
  - tool: TypeScript compiler (no emit)
  - verification: Zero type errors

DIRECTORY_STRUCTURE:
  - src/ for source code
  - tests/ for test files
  - dist/ for build output (generated, not committed)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding

# After package.json
npm install
# Expected: node_modules/ created, zero warnings
# If errors: Check JSON syntax, verify dependency versions

# After tsconfig.json
npx tsc --noEmit
# Expected: Zero type errors (may warn about empty index.ts)
# If errors: Verify JSON syntax, check compiler options

# After tsup.config.ts
npm run build
# Expected: dist/ directory created with index.js, index.d.ts
# If errors: Check TypeScript syntax in config file

# After vitest.config.ts
npm test
# Expected: vitest starts successfully (may find no tests)
# If errors: Check TypeScript syntax in config file

# After eslint.config.js
npm run lint
# Expected: Executes without errors (may find no files yet)
# If errors: Check JavaScript syntax in config file

# After .prettierrc.json
npm run format
# Expected: Executes without errors
# If errors: Check JSON syntax

# FINAL: Project-wide validation
npm run lint && npm run type-check
# Expected: Zero errors, zero warnings
```

### Level 2: Unit Tests (Component Validation)

```bash
# Note: No unit tests exist yet - this will be used in P1.M2.T1.S3, P1.M3.T1.S3, etc.

# Verify test framework is configured correctly
npm test -- --run
# Expected: vitest runs successfully, reports "No test files found"
# If errors: Check vitest.config.ts configuration

# Test with sample test file (create tests/sample.test.ts)
echo "import { describe, it, expect } from 'vitest'
describe('sample', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})" > tests/sample.test.ts

npm test -- --run
# Expected: Test passes successfully
# Cleanup: rm tests/sample.test.ts
```

### Level 3: Integration Testing (System Validation)

```bash
# Build system validation
npm run build
# Expected: dist/ directory with index.js, index.d.ts, index.js.map
ls -la dist/
# Verify: index.js exists and is ESM format (contains "export")

# TypeScript compilation validation
npx tsc
# Expected: dist/ directory created with compiled output
# Note: This duplicates tsup output, but verifies tsconfig.json is correct

# Package structure validation
tree -L 2 -I 'node_modules'
# Expected: Shows src/, tests/, dist/, *.config.ts, package.json, tsconfig.json

# Dependency verification
npm list --depth=0
# Expected: Shows @modelcontextprotocol/sdk and all devDependencies
# Verify: All dependencies installed, no missing packages

# Scripts verification
npm run
# Expected: Lists all scripts (build, dev, test, test:run, lint, format, type-check)
```

### Level 4: Creative & Domain-Specific Validation

```bash
# ESM Module Validation
# Test that ESM imports work correctly with .js extensions

# Create test file (tests/esm-validation.test.ts)
echo "import { describe, it, expect } from 'vitest'

describe('ESM Validation', () => {
  it('should support .js extensions in imports', async () => {
    // This tests that TypeScript ESM configuration is correct
    const module = await import('../src/index.js')
    expect(module).toBeDefined()
  })
})" > tests/esm-validation.test.ts

npm test -- tests/esm-validation.test.ts
# Expected: Test passes, proving ESM imports work
# Cleanup: rm tests/esm-validation.test.ts

# MCP SDK Import Validation
# Test that MCP SDK can be imported with .js extensions

# Create test file (tests/mcp-import.test.ts)
echo "import { describe, it, expect } from 'vitest'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

describe('MCP SDK Import Validation', () => {
  it('should import Server class', () => {
    expect(Server).toBeDefined()
    expect(typeof Server).toBe('function')
  })
})" > tests/mcp-import.test.ts

npm test -- tests/mcp-import.test.ts
# Expected: Test passes, proving MCP SDK ESM imports work
# Cleanup: rm tests/mcp-import.test.ts

# Build Output Format Validation
npm run build
head -n 5 dist/index.js
# Expected: May contain shebang (#!/usr/bin/env node) if banner configured
# Verify: File is executable ESM format

# Type Declaration Validation
cat dist/index.d.ts
# Expected: Contains type declarations for src/index.ts
# Verify: TypeScript types are generated correctly

# Source Map Validation
ls -la dist/*.map
# Expected: index.js.map exists
# Verify: Source maps generated for debugging
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm install` completed with zero peer dependency warnings
- [ ] `npm run build` creates dist/ with index.js, index.d.ts, index.js.map
- [ ] `npm test` starts vitest successfully (global APIs work)
- [ ] `npm run lint` executes without errors
- [ ] `npm run format` executes without errors
- [ ] `npx tsc --noEmit` completes with zero type errors
- [ ] All 8 directories created and accessible

### Feature Validation

- [ ] All success criteria from "What" section met
- [ ] package.json has "type": "module" and "engines": { "node": ">=18.0.0" }
- [ ] MCP SDK dependency (@modelcontextprotocol/sdk) installed
- [ ] All devDependencies installed (typescript, tsup, vitest, eslint, prettier)
- [ ] tsconfig.json uses "module": "NodeNext" and "moduleResolution": "NodeNext"
- [ ] tsup.config.ts configured for ESM output with node18 target
- [ ] vitest.config.ts has globals: true and environment: 'node'
- [ ] Placeholder files (src/index.ts, src/types.ts) are syntactically valid

### Code Quality Validation

- [ ] ESLint configuration uses flat config format (eslint.config.js)
- [ ] Prettier configuration follows conventional patterns (.prettierrc.json)
- [ ] .gitignore excludes node_modules, dist, and temporary files
- [ ] All npm scripts defined and functional
- [ ] Project structure matches planned architecture (external_deps.md)

### Documentation & Deployment

- [ ] Configuration files follow ESM best practices
- [ ] TypeScript compiler options match ESM requirements
- [ ] Build output (dist/) can be excluded from version control
- [ ] Project is ready for next task (P1.M1.T2: Implement mdsel CLI Wrapper)

---

## Anti-Patterns to Avoid

- ❌ Don't mix module systems - no `require()` or `module.exports` with `"type": "module"`
- ❌ Don't omit .js extensions in TypeScript imports - even for .ts files
- ❌ Don't use CommonJS-style TypeScript config - avoid `"module": "commonjs"`
- ❌ Don't skip `"moduleResolution": "NodeNext"` - must match `"module": "NodeNext"`
- ❌ Don't forget to install dependencies - always run `npm install` after creating package.json
- ❌ Don't ignore type errors - `npx tsc --noEmit` must complete with zero errors
- ❌ Don't skip validation steps - each file should be validated before proceeding
- ❌ Don't use old ESLint config format - use flat config (eslint.config.js, not .eslintrc.json)
- ❌ Don't mix tabs and spaces - configure Prettier for consistent formatting
- ❌ Don't commit node_modules or dist/ - .gitignore should exclude them
- ❌ Don't use array format for tsup entry points with single file - use array for now, but be aware we'll add read-hook.ts later in P2.M2
- ❌ Don't forget to set `"engines": { "node": ">=18.0.0" }` - MCP SDK requires Node.js 18+

---

## Confidence Score

**Score**: 10/10 for one-pass implementation success

**Rationale**:

1. **Complete Context**: All configuration files are fully specified with exact contents
2. **Dependency-Ordered Tasks**: Tasks are listed in correct dependency order
3. **Validation Commands**: Every step has executable validation commands
4. **Gotcha Documentation**: ESM gotchas are thoroughly documented with examples
5. **Reference Research**: Links to official documentation for all tools
6. **Project-Specific Context**: References to internal architecture docs
7. **No External Dependencies**: Only requires npm and existing codebase
8. **Deterministic Outputs**: Expected outputs are specified for each command

**This PRP enables an AI agent unfamiliar with the codebase to successfully implement P1.M1.T1 using only the PRP content and codebase access.**
