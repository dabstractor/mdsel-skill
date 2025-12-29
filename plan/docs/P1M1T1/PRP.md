# Product Requirement Prompt: P1.M1.T1 - Initialize TypeScript Project

---

## Goal

**Feature Goal**: Create the foundational TypeScript project infrastructure with package.json, tsconfig.json, tsup.config.ts, vitest.config.ts, and directory structure for the mdsel-claude MCP server.

**Deliverable**: A complete, buildable TypeScript project foundation with ES modules configuration, build toolchain (tsup), test framework (vitest), and proper directory structure as specified in the architecture documentation.

**Success Definition**:
- All configuration files are created and valid
- Running `npm install` succeeds without errors
- Running `npm run build` with a minimal src/server.ts compiles successfully to dist/
- Running `npm run test` executes vitest without configuration errors
- The project follows the exact directory structure from implementation_notes.md section 6
- All imports use `.js` extensions for ES module compatibility

---

## Why

### Business Value and User Impact

This task establishes the build infrastructure foundation for the entire mdsel-claude project. Without proper project initialization, subsequent tasks (MCP server implementation, tool handlers, mdsel integration) cannot proceed. A correctly configured TypeScript project ensures:

1. **Type Safety**: Strict TypeScript configuration catches errors at compile time
2. **Build Reliability**: tsup produces clean ESM output for Node.js 18+ compatibility
3. **Test Coverage**: vitest enables TDD for all subsequent development
4. **Developer Experience**: Proper tooling setup enables rapid iteration

### Integration with Existing Features

This is the first task in the project (P1.M1.T1). It has no dependencies on existing code but establishes the foundation for:
- P1.M1.T2: Install Dependencies and Verify Build
- P1.M2: mdsel CLI Invocation Layer
- P1.M3: MCP Tool Implementation

### Problems This Solves

1. **ES Module Complexity**: Node.js 18+ ES modules require specific tsconfig settings (module: "NodeNext", moduleResolution: "NodeNext") that are non-obvious
2. **Build Configuration**: tsup must be configured correctly to externalize @modelcontextprotocol/sdk and Node.js built-ins
3. **Import Path Issues**: TypeScript ES modules require `.js` extensions in import statements—a common source of errors
4. **Test Framework Setup**: vitest requires proper TypeScript integration and test file patterns

---

## What

Create a complete TypeScript project foundation with ES modules support for Node.js 18+.

### Success Criteria

- [ ] `package.json` created with all required dependencies and scripts
- [ ] `tsconfig.json` created with NodeNext module resolution for ES modules
- [ ] `tsup.config.ts` created with proper entry points and external dependencies
- [ ] `vitest.config.ts` created with test patterns and Node environment
- [ ] Directory structure created matching implementation_notes.md section 6 exactly
- [ ] Minimal `src/server.ts` placeholder created to verify build
- [ ] All configurations use consistent file paths and naming

### Out of Scope (Explicit Non-Goals)

- Actual MCP server implementation (P1.M3)
- mdsel CLI integration (P1.M2)
- Test implementation (P1.M5)
- Documentation beyond code comments

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete configuration file contents
- Exact directory structure to create
- All dependency specifications
- Validation commands to verify success
- Common gotchas and how to avoid them

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: plan/architecture/implementation_notes.md
  why: Sections 6 (Project Structure), 8 (Build Configuration), and 9 (Scope Boundaries) define exact requirements
  critical: The directory structure in section 6 MUST be followed exactly. The tsup and package.json patterns in section 8 are canonical.

- file: plan/architecture/external_deps.md
  why: MCP SDK dependency versions and import patterns, build tooling requirements
  critical: @modelcontextprotocol/sdk imports must use .js extensions. Build dependencies (typescript, tsup, vitest) are specified here.

- file: plan/architecture/system_context.md
  why: Technology stack decisions (Node.js 18+, TypeScript, MCP SDK) drive configuration choices
  critical: ES modules requirement is non-negotiable. Stdio transport requirement affects build output format.

- file: plan/P1M1T1/research/typescript-esm.md
  why: Complete TypeScript ES modules configuration reference for Node.js 18+
  critical: module: "NodeNext", moduleResolution: "NodeNext", and .js extension patterns are essential

- file: plan/P1M1T1/research/tsup-config.md
  why: Complete tsup configuration reference with MCP server examples
  critical: Must externalize @modelcontextprotocol/sdk and node:* to avoid bundling errors

- file: plan/P1M1T1/research/vitest-config.md
  why: Complete vitest configuration reference for TypeScript Node.js projects
  critical: environment: 'node' and proper include patterns for test discovery

- file: PRD.md
  why: Overall project context, design philosophy, and scope boundaries
  section: Sections 2 (Design Philosophy), 3 (Dependency Model), 9 (Statelessness)
```

### Current Codebase Tree

```bash
# This is a greenfield project - no existing source code
mdsel-claude-attempt-3/
├── .git/                    # Git repository
├── plan/                    # Architecture and planning documents
│   ├── architecture/        # System context, external deps, implementation notes, tool descriptions
│   └── P1M1T1/              # This PRP and research
│       ├── PRP.md           # This document
│       └── research/        # External research documents
├── PRD.md                   # Product Requirements Document
└── tasks.json               # Task breakdown
```

### Desired Codebase Tree (After Task Completion)

```bash
mdsel-claude-attempt-3/
├── src/                     # Source code directory
│   ├── server.ts            # MCP server entry point (minimal placeholder)
│   ├── tools/               # Tool definitions and handlers
│   ├── mdsel/               # mdsel CLI integration layer
│   └── types.ts             # Shared TypeScript types
├── tests/                   # Test files
│   ├── tools/               # Tool tests
│   ├── integration/         # Integration tests
│   └── mocks/               # Test mocks
├── dist/                    # Compiled output (created by build)
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript compiler configuration
├── tsup.config.ts           # tsup build configuration
├── vitest.config.ts         # Vitest test configuration
├── .gitignore               # Git ignore patterns
├── .npmignore               # NPM publish ignore patterns
└── README.md                # Project documentation (placeholder)
```

### Known Gotchas of TypeScript ES Modules & Node.js MCP Servers

```typescript
// CRITICAL GOTCHA 1: ES Module imports MUST use .js extensions
// Even though source files are .ts, imports reference .js (the compiled output)
// ❌ WRONG: import { Server } from '@modelcontextprotocol/sdk/server/index';
// ✅ CORRECT: import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// CRITICAL GOTCHA 2: tsconfig must use NodeNext for ES modules in Node.js 18+
// "module": "NodeNext" and "moduleResolution": "NodeNext" are REQUIRED
// Using "ESNext" or "node" will cause runtime import errors

// CRITICAL GOTCHA 3: tsup must externalize MCP SDK and Node.js built-ins
// If bundled, will get "Cannot bundle Node.js built-in module" errors
// external: ['@modelcontextprotocol/sdk', 'node:*']

// CRITICAL GOTCHA 4: __dirname and __filename don't exist in ES modules
// Use import.meta.url with fileURLToPath and dirname instead
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// CRITICAL GOTCHA 5: package.json "type": "module" is required for ES modules
// Without this, Node.js treats .js files as CommonJS

// CRITICAL GOTCHA 6: vitest needs proper TypeScript configuration
// Must include "vitest/globals" in tsconfig types for global test API

// CRITICAL GOTCHA 7: Build output uses .mjs extension for ES modules
// tsup with format: 'esm' produces .mjs files, not .js

// CRITICAL GOTCHA 8: Test file patterns must match actual file locations
// vitest include patterns should use **/*.test.ts for src/ and tests/ directories
```

---

## Implementation Blueprint

### Data Models and Structure

This task creates configuration files only. No data models are defined at this stage (those come in P1.M2.T1).

**Configuration File Structure**:

```json
// package.json structure
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "type": "module",           // CRITICAL: Enables ES modules
  "main": "./dist/server.mjs",
  "bin": {
    "mdsel-claude": "./dist/server.mjs"
  },
  "scripts": { ... },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

```json
// tsconfig.json structure
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",      // CRITICAL: For ES modules
    "moduleResolution": "NodeNext",  // CRITICAL: For ES modules
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE package.json
  - IMPLEMENT: NPM package configuration with name "mdsel-claude", version "1.0.0", type "module"
  - FOLLOW pattern: plan/architecture/implementation_notes.md section 8 (Build Configuration)
  - NAMING: Standard package.json field names
  - PLACEMENT: Project root (/package.json)
  - CONTENT:
    * dependencies: @modelcontextprotocol/sdk (use latest version)
    * devDependencies: typescript (^5.0.0), tsup (^8.0.0), vitest (^2.0.0), @types/node (^20.0.0)
    * scripts: build="tsup", test="vitest run", start="node dist/server.mjs"
    * main: "./dist/server.mjs"
    * bin: { "mdsel-claude": "./dist/server.mjs" }
    * engines: { "node": ">=18.0.0" }

Task 2: CREATE tsconfig.json
  - IMPLEMENT: TypeScript compiler configuration for ES modules with Node.js 18+ target
  - FOLLOW pattern: plan/P1M1T1/research/typescript-esm.md section 2 (tsconfig Compiler Options)
  - NAMING: Standard tsconfig.json structure
  - PLACEMENT: Project root (/tsconfig.json)
  - CONTENT:
    * compilerOptions.target: "ES2022"
    * compilerOptions.module: "NodeNext"  # CRITICAL for ES modules
    * compilerOptions.moduleResolution: "NodeNext"  # CRITICAL for ES modules
    * compilerOptions.outDir: "./dist"
    * compilerOptions.rootDir: "./src"
    * compilerOptions.strict: true
    * compilerOptions.esModuleInterop: true
    * compilerOptions.skipLibCheck: true
    * compilerOptions.declaration: true
    * compilerOptions.sourceMap: true
    * compilerOptions.moduleDetection: "force"
    * include: ["src/**/*"]
    * exclude: ["node_modules", "dist"]
  - GOTCHA: Must use NodeNext, not ESNext or node, for proper ES module resolution

Task 3: CREATE tsup.config.ts
  - IMPLEMENT: tsup build configuration for ESM output with external dependencies
  - FOLLOW pattern: plan/architecture/implementation_notes.md section 8 AND plan/P1M1T1/research/tsup-config.md section 3 (MCP Server Specific Configuration)
  - NAMING: Use defineConfig from tsup
  - PLACEMENT: Project root (/tsup.config.ts)
  - DEPENDENCIES: Requires Task 1 (package.json) for dependency names
  - CONTENT:
    * entry: ['src/server.ts']
    * format: ['esm']
    * platform: 'node'
    * target: 'node18'
    * outDir: 'dist'
    * clean: true
    * dts: true
    * external: ['@modelcontextprotocol/sdk', 'node:*']  # CRITICAL - prevents bundling errors
    * banner: { js: '#!/usr/bin/env node' }  # For executable bin
  - GOTCHA: Must externalize @modelcontextprotocol/sdk or build will fail

Task 4: CREATE vitest.config.ts
  - IMPLEMENT: Vitest configuration for TypeScript Node.js testing
  - FOLLOW pattern: plan/P1M1T1/research/vitest-config.md section 1 (Basic Configuration)
  - NAMING: Use defineConfig from vitest/config
  - PLACEMENT: Project root (/vitest.config.ts)
  - CONTENT:
    * test.environment: 'node'
    * test.globals: true
    * test.include: ['**/*.test.ts']
    * test.exclude: ['node_modules', 'dist']
    * coverage.provider: 'v8'
    * coverage.include: ['src/**/*']
    * coverage.exclude: ['**/*.test.ts', '**/*.d.ts']
  - GOTCHA: Must include "vitest/globals" in tsconfig types for globals: true

Task 5: CREATE .gitignore
  - IMPLEMENT: Standard Node.js TypeScript ignore patterns
  - PLACEMENT: Project root (/.gitignore)
  - CONTENT: node_modules/, dist/, *.log, .DS_Store, coverage/, .env

Task 6: CREATE .npmignore
  - IMPLEMENT: NPM publish ignore patterns
  - PLACEMENT: Project root (/.npmignore)
  - CONTENT: src/, tests/, *.ts, !*.d.ts, tsconfig.json, vitest.config.ts

Task 7: CREATE directory structure
  - IMPLEMENT: Exact directory structure from implementation_notes.md section 6
  - FOLLOW pattern: plan/architecture/implementation_notes.md section 6 (Project Structure)
  - PLACEMENT: Create all directories under project root
  - DIRECTORIES:
    * src/
    * src/tools/
    * src/mdsel/
    * tests/
    * tests/tools/
    * tests/integration/
    * tests/mocks/
  - GOTCHA: Create placeholder .gitkeep files in empty directories if needed

Task 8: CREATE minimal src/server.ts placeholder
  - IMPLEMENT: Minimal TypeScript file to verify build configuration works
  - PLACEMENT: /src/server.ts
  - CONTENT:
    * ES module import of MCP SDK Server with .js extension
    * Empty server initialization
    * Export for module
  - GOTCHA: Import MUST use .js extension: import { Server } from '@modelcontextprotocol/sdk/server/index.js';

Task 9: CREATE placeholder README.md
  - IMPLEMENT: Minimal README with project description
  - PLACEMENT: /README.md
  - CONTENT: Project name, one-line description, placeholder for installation docs

Task 10: VERIFY TypeScript configuration
  - RUN: npx tsc --noEmit (after dependencies installed in P1.M1.T2)
  - EXPECTED: No type errors
  - GOTCHA: May show errors about missing dependencies before npm install
```

### Implementation Patterns & Key Details

```typescript
// package.json - Complete Example
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "description": "MCP server exposing mdsel CLI as Claude Code tools",
  "type": "module",
  "main": "./dist/server.mjs",
  "bin": {
    "mdsel-claude": "./dist/server.mjs"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "start": "node dist/server.mjs",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}

// CRITICAL: Note the .js extension in this import
// Source file is .ts, but import references compiled .js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// tsup.config.ts - Complete Example
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  // CRITICAL: Externalize MCP SDK to avoid bundling errors
  external: ['@modelcontextprotocol/sdk', 'node:*'],
  // Add shebang for executable
  banner: {
    js: '#!/usr/bin/env node',
  },
});

// vitest.config.ts - Complete Example
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
    },
  },
});

// tsconfig.json - Complete Example
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleDetection": "force",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

// src/server.ts - Minimal Placeholder
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server(
  {
    name: 'mdsel-claude',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

export { server };
```

### Integration Points

```yaml
NO EXTERNAL INTEGRATIONS:
  - This task creates project foundation only
  - No external APIs or services
  - No database connections

FUTURE INTEGRATIONS (not part of this task):
  MCP_SDK:
    - Next task (P1.M1.T2) will install @modelcontextprotocol/sdk
    - This task only declares dependency in package.json

  BUILD_PIPELINE:
    - P1.M1.T2 will run `npm install` and verify build works
    - This task creates configurations only
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Validate JSON files
cat package.json | jq . > /dev/null && echo "package.json: Valid JSON" || echo "package.json: Invalid JSON"

# Validate TypeScript configuration
npx tsc --showConfig > /dev/null 2>&1 && echo "tsconfig.json: Valid" || echo "tsconfig.json: Invalid"

# Check for required files
test -f package.json && echo "package.json exists" || echo "ERROR: package.json missing"
test -f tsconfig.json && echo "tsconfig.json exists" || echo "ERROR: tsconfig.json missing"
test -f tsup.config.ts && echo "tsup.config.ts exists" || echo "ERROR: tsup.config.ts missing"
test -f vitest.config.ts && echo "vitest.config.ts exists" || echo "ERROR: vitest.config.ts missing"

# Check directory structure
test -d src && echo "src/ exists" || echo "ERROR: src/ missing"
test -d src/tools && echo "src/tools/ exists" || echo "ERROR: src/tools/ missing"
test -d src/mdsel && echo "src/mdsel/ exists" || echo "ERROR: src/mdsel/ missing"
test -d tests && echo "tests/ exists" || echo "ERROR: tests/ missing"
test -d tests/tools && echo "tests/tools/ exists" || echo "ERROR: tests/tools/ missing"
test -d tests/integration && echo "tests/integration/ exists" || echo "ERROR: tests/integration/ missing"
test -d tests/mocks && echo "tests/mocks/ exists" || echo "ERROR: tests/mocks/ missing"

# Check for ES module configuration
grep -q '"type": "module"' package.json && echo "ES modules enabled" || echo "ERROR: ES modules not enabled"

# Check for NodeNext module resolution
grep -q '"module": "NodeNext"' tsconfig.json && echo "NodeNext module configured" || echo "ERROR: NodeNext not configured"

# Expected: All checks pass. If any fail, read error message and fix configuration.
```

### Level 2: Configuration Validation (After npm install)

```bash
# Install dependencies (happens in P1.M1.T2, but can test now)
npm install

# Verify TypeScript compiles configuration
npx tsc --noEmit

# Expected: No type errors. If errors exist:
# - Check that @modelcontextprotocol/sdk is installed
# - Verify .js extensions in imports
# - Ensure tsconfig has correct module settings

# Verify tsup configuration
npx tsup --help

# Expected: tsup runs without errors

# Verify vitest configuration
npx vitest run

# Expected: vitest runs (finds no tests, but no config errors)
```

### Level 3: Build Verification (With Minimal server.ts)

```bash
# Run build
npm run build

# Expected output:
# CLI Building entry: src/server.ts
# CLI tsup v8.x.x
# CLI Build success in XXXms
# CLI dist/server.mjs    XXX B
# CLI dist/server.d.ts   XXX B

# Verify build outputs
test -f dist/server.mjs && echo "ESM build output exists" || echo "ERROR: No ESM output"
test -f dist/server.d.ts && echo "Type declarations exist" || echo "ERROR: No declarations"

# Check output is executable (has shebang)
head -n 1 dist/server.mjs | grep -q '#!/usr/bin/env node' && echo "Shebang present" || echo "WARNING: No shebang"

# Verify build can be executed
node --eval "import('./dist/server.mjs').then(m => console.log('Module loaded successfully'))"

# Expected: "Module loaded successfully" message
```

### Level 4: Test Framework Validation

```bash
# Run vitest (should find no tests but run successfully)
npm run test

# Expected output:
# CLI vitest v2.x.x
# CLI No test files found
# CLI PASS  No tests

# Run with coverage (should show 0% but no errors)
npm run test -- --coverage

# Expected output shows coverage report (all zeros since no tests yet)

# Create a simple test file to verify framework works
cat > tests/example.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';

describe('Test Framework', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF

# Run tests again
npm run test

# Expected: Test passes, output shows "PASS  Test Framework"
# Clean up test file
rm tests/example.test.ts
```

### Level 5: Integration Smoke Test

```bash
# Verify the complete project structure
tree -L 2 -I 'node_modules'

# Expected output shows:
# .
# ├── package.json
# ├── tsconfig.json
# ├── tsup.config.ts
# ├── vitest.config.ts
# ├── src/
# │   ├── server.ts
# │   ├── tools/
# │   └── mdsel/
# ├── tests/
# │   ├── tools/
# │   ├── integration/
# │   └── mocks/
# └── dist/
#     ├── server.mjs
#     └── server.d.ts

# Verify npm scripts work
npm run build && echo "Build script works" || echo "Build script failed"
npm run test && echo "Test script works" || echo "Test script failed"
npm run typecheck && echo "Typecheck script works" || echo "Typecheck script failed"

# All scripts should execute without errors
```

---

## Final Validation Checklist

### Technical Validation

- [ ] package.json created with "type": "module"
- [ ] tsconfig.json created with module: "NodeNext" and moduleResolution: "NodeNext"
- [ ] tsup.config.ts created with entry: ['src/server.ts'] and external: ['@modelcontextprotocol/sdk', 'node:*']
- [ ] vitest.config.ts created with environment: 'node' and test patterns
- [ ] All directories created: src/, src/tools/, src/mdsel/, tests/, tests/tools/, tests/integration/, tests/mocks/
- [ ] Minimal src/server.ts placeholder created with .js extension imports
- [ ] .gitignore created excluding node_modules/, dist/, coverage/
- [ ] npm run build produces dist/server.mjs without errors
- [ ] npm run test executes vitest without configuration errors
- [ ] npm run typecheck passes with no TypeScript errors

### Feature Validation

- [ ] package.json includes all required dependencies (@modelcontextprotocol/sdk, typescript, tsup, vitest, @types/node)
- [ ] package.json includes scripts: build, test, start, typecheck
- [ ] package.json includes correct main: "./dist/server.mjs" and bin entries
- [ ] package.json specifies engines.node: ">=18.0.0"
- [ ] tsconfig.json targets ES2022 for Node.js 18+ compatibility
- [ ] tsup output uses .mjs extension for ES modules
- [ ] Build output includes shebang (#!/usr/bin/env node) for executable

### Code Quality Validation

- [ ] All imports use .js extensions (even though source is .ts)
- [ ] No require() statements (all ES module imports)
- [ ] tsconfig strict mode enabled
- [ ] Directory structure matches implementation_notes.md section 6 exactly
- [ ] Configuration files follow the patterns specified in architecture docs

### Documentation & Deployment

- [ ] README.md placeholder exists
- [ ] .npmignore exists to exclude source files from publish
- [ ] All configuration files are self-documenting with clear field names

---

## Anti-Patterns to Avoid

- Don't use `"module": "ESNext"` or `"moduleResolution": "node"` - these cause runtime errors with ES modules
- Don't omit `.js` extensions from imports in TypeScript source files
- Don't forget to externalize `@modelcontextprotocol/sdk` in tsup.config.ts - build will fail
- Don't use `__dirname` or `__filename` directly - they don't exist in ES modules
- Don't forget `"type": "module"` in package.json - Node.js will treat .js as CommonJS
- Don't skip creating the directory structure - subsequent tasks depend on it
- Don't use `"target": "ES5"` or older - must target ES2022 for Node.js 18+
- Don't create test files in this task - that's P1.M5.T1
- Don't implement actual MCP server logic in this task - that's P1.M3
- Don't add extra dependencies beyond what's specified in external_deps.md
- Don't change the directory structure from what's specified in implementation_notes.md
- Don't use TypeScript path aliases (baseUrl/paths) in this initial setup
- Don't forget the shebang banner in tsup.config.ts for the executable bin
