# Product Requirement Prompt: P1.M1.T2 - Install Dependencies and Verify Build

---

## Goal

**Feature Goal**: Install all npm dependencies and verify the build pipeline works correctly by running a successful build of the minimal server.ts created in P1.M1.T1.

**Deliverable**: A verified build pipeline with all dependencies installed, and a successfully compiled dist/server.js output from the minimal server.ts.

**Success Definition**:
- `npm install` completes successfully without errors
- `npm run build` compiles src/server.ts to dist/ without errors
- The compiled output includes: server.js, server.js.map, and server.d.ts
- The built file has the correct shebang (#!/usr/bin/env node)
- `npm run typecheck` passes with no TypeScript errors
- `npm run test` executes vitest without configuration errors
- The build output is executable (can be run with `node dist/server.js`)

---

## Why

### Business Value and User Impact

This task validates the entire build infrastructure created in P1.M1.T1. Without successful dependency installation and build verification:
- No subsequent development work can proceed
- TypeScript compilation issues would block all future tasks
- The MCP server cannot be developed or tested
- Integration with Claude Code would be impossible

### Integration with Existing Features

This task follows P1.M1.T1 (project initialization) and is a prerequisite for:
- P1.M2: mdsel CLI Invocation Layer - requires working TypeScript compilation
- P1.M3: MCP Tool Implementation - requires build pipeline for iterative development
- P1.M4: Server Finalization - requires verified build output
- P1.M5: Integration Testing - requires build artifacts for testing

### Problems This Solves

1. **Dependency Resolution**: Ensures all required packages (@modelcontextprotocol/sdk, typescript, tsup, vitest) are correctly installed
2. **Build Validation**: Confirms tsup configuration works and produces correct ESM output
3. **Type Safety Verification**: Validates TypeScript compiler configuration with the actual codebase
4. **Test Framework Setup**: Confirms vitest can run with the project configuration
5. **Executable Output**: Verifies the shebang and executable permissions work correctly

---

## What

Install npm dependencies and verify the build pipeline by building the minimal server.ts from P1.M1.T1.

### Success Criteria

- [ ] All npm dependencies installed successfully (no ERESOLVE errors, no peer dependency conflicts)
- [ ] `npm run build` produces dist/server.js, dist/server.js.map, and dist/server.d.ts
- [ ] The build output uses .js extension (not .mjs) since package.json has "type": "module"
- [ ] The built file has executable shebang on first line
- [ ] `npm run typecheck` passes without TypeScript errors
- [ ] `npm run test` runs vitest without configuration errors
- [ ] The built module can be loaded with Node.js ESM import
- [ ] No "Cannot bundle Node.js built-in module" errors during build

### Out of Scope (Explicit Non-Goals)

- Modifying the build configuration from P1.M1.T1 (unless critical bugs found)
- Implementing actual MCP server logic (that's P1.M3)
- Writing tests (that's P1.M5)
- Modifying the minimal server.ts beyond fixing compilation errors

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete dependency list with specific versions
- Step-by-step installation process
- Common npm issues and solutions
- Build verification commands
- Troubleshooting guide for each error type

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: plan/docs/architecture/external_deps.md
  why: MCP SDK dependency versions, build tooling requirements
  critical: @modelcontextprotocol/sdk version, TypeScript version requirements

- file: plan/docs/architecture/implementation_notes.md
  why: Section 8 (Build Configuration) shows expected build patterns
  critical: tsup configuration, package.json scripts, output format expectations

- file: plan/P1M1T1/research/typescript-esm.md
  why: TypeScript ES module configuration for Node.js 18+
  critical: NodeNext module settings, .js extension requirements

- file: plan/P1M1T1/research/tsup-config.md
  why: Complete tsup configuration reference
  critical: external dependency handling, shebang banner configuration

- file: plan/P1M1T2/research/npm-dependencies.md
  why: npm dependency management best practices
  critical: package-lock.json handling, npm ci vs npm install

- file: plan/P1M1T2/research/typescript-build-patterns.md
  why: Common TypeScript ESM build issues and solutions
  critical: NodeNext configuration, import resolution, .mjs vs .js

- file: plan/P1M1T2/research/mcp-sdk-patterns.md
  why: MCP SDK build considerations and import patterns
  critical: Why SDK must be externalized, correct import paths

- file: plan/P1M1T2/research/vitest-patterns.md
  why: Vitest configuration verification for TypeScript projects
  critical: globals setting, environment configuration, test file patterns

- file: plan/P1M1T2/research/build-error-debugging.md
  why: Comprehensive error debugging for all build failure modes
  critical: "Cannot bundle Node.js built-in module" solutions, shebang issues

- file: package.json
  why: Current dependency declarations and npm scripts
  critical: All dependencies are listed with correct versions

- file: tsconfig.json
  why: TypeScript compiler configuration
  critical: module: "NodeNext", moduleResolution: "NodeNext" settings

- file: tsup.config.ts
  why: Build configuration
  critical: external: ['@modelcontextprotocol/sdk', 'node:*'] setting

- file: src/server.ts
  why: Minimal server file to verify build works
  critical: Must use .js extension in imports

- url: https://docs.npmjs.com/cli/v8/commands/npm-install
  why: Official npm install documentation
  critical: Understanding npm install flags and behaviors

- url: https://tsup.egoist.dev/
  why: Official tsup documentation
  critical: Build configuration options and troubleshooting

- url: https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution
  why: TypeScript module resolution theory
  critical: Understanding why .js extensions are needed
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-3/
├── dist/                    # Build output (already exists from previous build)
│   ├── server.d.ts          # TypeScript declarations
│   ├── server.js            # ESM output
│   └── server.js.map        # Source map
├── node_modules/            # Already installed dependencies
│   ├── @modelcontextprotocol/
│   ├── @types/
│   ├── tsup/
│   ├── typescript/
│   ├── vitest/
│   └── [other dependencies]
├── plan/
│   ├── P1M1T1/
│   │   ├── PRP.md
│   │   └── research/
│   ├── P1M1T2/              # This PRP
│   │   ├── PRP.md           # This document
│   │   └── research/        # Research documents from subagents
│   └── docs/
│       └── architecture/
├── src/
│   └── server.ts            # Minimal MCP server (from P1.M1.T1)
├── package.json             # NPM configuration (from P1.M1.T1)
├── package-lock.json        # Lockfile (may or may not exist)
├── tsconfig.json            # TypeScript config (from P1.M1.T1)
├── tsup.config.ts           # Build config (from P1.M1.T1)
├── vitest.config.ts         # Test config (from P1.M1.T1)
├── PRD.md                   # Product requirements
└── tasks.json               # Task breakdown
```

### Desired Codebase Tree (After Task Completion)

```bash
# Same structure - this task validates existing infrastructure
# Key outputs to verify:
├── dist/
│   ├── server.d.ts          # Must exist with valid TypeScript declarations
│   ├── server.js            # Must exist with ESM code and shebang
│   └── server.js.map        # Must exist for debugging
├── node_modules/            # Must have all dependencies installed
└── package-lock.json        # Should exist and be committed
```

### Known Gotchas of npm/TypeScript/tsup Build Pipelines

```bash
# CRITICAL GOTCHA 1: package-lock.json should be committed
# This ensures reproducible builds across environments
# Check: git status should show package-lock.json as tracked

# CRITICAL GOTCHA 2: npm install may need --legacy-peer-deps flag
# Some dependencies may have peer dependency conflicts
# Symptom: ERESOLVE errors during npm install
# Fix: npm install --legacy-peer-deps

# CRITICAL GOTCHA 3: Build uses .js extension, not .mjs
# Even though tsup produces ESM, the file extension should be .js
# Reason: package.json has "type": "module", so .js is treated as ESM
# Current state: package.json has "main": "./dist/server.mjs" - may need update

# CRITICAL GOTCHA 4: Import paths MUST use .js extensions
# Even though source is .ts, imports reference compiled .js
# src/server.ts already does this correctly

# CRITICAL GOTCHA 5: Shebang requires correct permissions
# tsup banner adds shebang, but chmod may be needed for execution
# Verify with: ls -la dist/server.js should show -rwxr-xr-x

# CRITICAL GOTCHA 6: vitest needs "vitest/globals" in tsconfig types
# Otherwise globals: true causes TypeScript errors
# Current tsconfig.json has this: "types": ["vitest/globals", "node"]

# CRITICAL GOTCHA 7: Build fails if dependencies not installed
# Always run npm install before npm run build
# Check with: npm ls @modelcontextprotocol/sdk

# CRITICAL GOTCHA 8: Node.js version matters
# Project specifies "node": ">=18.0.0" in engines
# Current Node version must be 18+ or build may fail
# Check with: node --version

# CRITICAL GOTCHA 9: Clean build is recommended
# Old dist/ files can cause issues
# Use: rm -rf dist before rebuilding, or rely on tsup's clean: true

# CRITICAL GOTCHA 10: TypeScript errors must be fixed
# tsup will fail if TypeScript has compilation errors
# Use: npm run typecheck to check before build
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models - this task validates existing configuration files.

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: VERIFY package.json configuration
  - CHECK: All required dependencies are listed
  - VERIFY: "@modelcontextprotocol/sdk" in dependencies
  - VERIFY: "typescript", "tsup", "vitest", "@types/node" in devDependencies
  - VERIFY: "type": "module" is set
  - VERIFY: "engines.node" specifies ">=18.0.0"
  - VERIFY: npm scripts include "build", "test", "typecheck"
  - GOTCHA: Main field currently uses .mjs - may need to be .js for consistency
  - COMMAND: cat package.json | jq '.dependencies, .devDependencies'

Task 2: VERIFY Node.js version compatibility
  - RUN: node --version
  - CHECK: Version is >= 18.0.0
  - FAIL: If version < 18, upgrade Node.js before proceeding
  - CONTEXT: Project uses ES2022 features and ESM modules

Task 3: CLEAN existing node_modules and lockfile (optional but recommended)
  - RUN: rm -rf node_modules package-lock.json
  - WHY: Ensures clean dependency installation
  - GOTCHA: Only do this if experiencing dependency issues
  - ALTERNATIVE: Run npm ci instead of npm install

Task 4: INSTALL npm dependencies
  - RUN: npm install
  - FALLBACK: If ERESOLVE errors, run npm install --legacy-peer-deps
  - VERIFY: No error messages in output
  - CHECK: node_modules/@modelcontextprotocol/sdk exists
  - CHECK: node_modules/tsup exists
  - CHECK: node_modules/typescript exists
  - OUTPUT: package-lock.json should be created/updated
  - GOTCHA: npm install should not modify package.json
  - TIMEOUT: Up to 5 minutes depending on network

Task 5: VERIFY TypeScript configuration
  - RUN: npm run typecheck OR npx tsc --noEmit
  - EXPECTED: No TypeScript errors
  - ACCEPTABLE: "Cannot find module" errors if dependencies not yet resolved
  - FAIL: Type errors in src/server.ts - fix before proceeding
  - CHECK: Output shows "0 errors" or similar success message
  - DEBUG: If errors, check .js extensions in imports

Task 6: RUN build with tsup
  - RUN: npm run build OR npx tsup
  - EXPECTED OUTPUT:
    CLI Building entry: src/server.ts
    CLI tsup v8.x.x
    CLI [success] dist/server.js    XXX B
    CLI [success] dist/server.d.ts  XXX B
    CLI Build success in XXXms
  - VERIFY: dist/server.js exists
  - VERIFY: dist/server.d.ts exists
  - VERIFY: dist/server.js.map exists
  - CHECK: First line of dist/server.js is "#!/usr/bin/env node"
  - FAIL: If build fails, check error message against build-error-debugging.md

Task 7: VERIFY build output properties
  - RUN: head -1 dist/server.js | grep '#!/usr/bin/env node'
  - RUN: ls -la dist/server.js (should show executable permissions -rwxr-xr-x)
  - RUN: file dist/server.js (should show "ASCII text" or "UTF-8 Unicode text")
  - RUN: node --check dist/server.js (syntax check - should pass)
  - GOTCHA: If shebang not present, tsup banner configuration may be wrong

Task 8: VERIFY ESM module loading
  - RUN: node -e "import('./dist/server.js').then(m => console.log('Module loaded:', Object.keys(m)))"
  - EXPECTED: "Module loaded: [ 'server' ]" or similar
  - FAIL: If "Cannot find module" or syntax errors, check output format
  - GOTCHA: Error may indicate .mjs vs .js extension issue

Task 9: VERIFY vitest configuration
  - RUN: npm run test OR npx vitest run
  - EXPECTED: No test files found, but no configuration errors
  - ACCEPTABLE OUTPUT: "No test files found" or similar
  - FAIL: Configuration errors indicate vitest.config.ts issues
  - CHECK: globals: true setting works with tsconfig types

Task 10: VERIFY package-lock.json
  - RUN: git status package-lock.json
  - EXPECTED: File exists and is tracked by git
  - RECOMMEND: Commit package-lock.json for reproducible builds
  - CHECK: File size is reasonable (typically 100KB-1MB)
```

### Implementation Patterns & Key Details

```bash
# Pattern 1: Clean dependency installation sequence
# ALWAYS follow this order for reliable builds:
rm -rf node_modules package-lock.json  # Only if needed
npm install                             # Install all dependencies
npm run typecheck                       # Verify TypeScript config
npm run build                           # Build the project
npm run test                            # Verify test framework

# Pattern 2: Build output verification
# After build, always verify these files exist:
test -f dist/server.js && echo "✓ ESM output exists"
test -f dist/server.d.ts && echo "✓ TypeScript declarations exist"
test -f dist/server.js.map && echo "✓ Source maps exist"
head -1 dist/server.js | grep -q '#!/usr/bin/env node' && echo "✓ Shebang present"

# Pattern 3: Module loading verification
# Test that the built module can be imported as ESM:
node -e "import('./dist/server.js').then(() => console.log('✓ Module loads successfully'))"

# Pattern 4: Executable verification
# Ensure the built file can be executed directly:
node dist/server.js --help 2>&1 | head -5  # Should not error immediately

# Pattern 5: Dependency verification
# Confirm critical dependencies are installed:
npm ls @modelcontextprotocol/sdk   # Should show version
npm ls typescript                   # Should show version
npm ls tsup                         # Should show version
npm ls vitest                       # Should show version
```

### Integration Points

```yaml
PACKAGE_INSTALLATION:
  - command: npm install
  - verify: node_modules/@modelcontextprotocol/sdk exists
  - verify: node_modules/tsup exists
  - verify: node_modules/vitest exists
  - verify: package-lock.json created

BUILD_PROCESS:
  - command: npm run build
  - input: src/server.ts (minimal server from P1.M1.T1)
  - output: dist/server.js (ESM module with shebang)
  - output: dist/server.d.ts (TypeScript declarations)
  - output: dist/server.js.map (source maps)

TYPE_VERIFICATION:
  - command: npm run typecheck
  - verifies: No TypeScript compilation errors
  - uses: tsconfig.json configuration

TEST_VERIFICATION:
  - command: npm run test
  - verifies: vitest can run with project config
  - expects: No test files (no errors in config)

NEXT_TASK_INTEGRATION:
  - P1.M2: mdsel CLI Invocation Layer
    - requires: Working build pipeline for iterative development
    - requires: TypeScript compilation for new source files
  - P1.M3: MCP Tool Implementation
    - requires: Successful build for testing MCP server
    - requires: Type checking for tool definitions
```

---

## Validation Loop

### Level 1: Dependency Installation Validation

```bash
# Verify npm install completed successfully
npm install

# Expected output:
# added XXX packages in Xs
# No ERESOLVE errors or peer dependency warnings

# Verify critical dependencies
echo "Checking critical dependencies..."
npm ls @modelcontextprotocol/sdk 2>&1 | grep -q "@modelcontextprotocol/sdk" && echo "✓ MCP SDK installed" || echo "✗ MCP SDK missing"
npm ls typescript 2>&1 | grep -q "typescript" && echo "✓ TypeScript installed" || echo "✗ TypeScript missing"
npm ls tsup 2>&1 | grep -q "tsup" && echo "✓ tsup installed" || echo "✗ tsup missing"
npm ls vitest 2>&1 | grep -q "vitest" && echo "✓ vitest installed" || echo "✗ vitest missing"

# Verify package-lock.json
test -f package-lock.json && echo "✓ package-lock.json exists" || echo "✗ package-lock.json missing"
ls -lh package-lock.json  # Should be > 100KB

# Expected: All checks pass. If any fail:
# - For missing dependencies: Check npm install output for errors
# - For peer dependency conflicts: Try npm install --legacy-peer-deps
# - For missing lockfile: Git may have ignored it - check .gitignore
```

### Level 2: TypeScript Configuration Validation

```bash
# Run TypeScript compiler in check mode
npm run typecheck
# OR: npx tsc --noEmit

# Expected output:
# (no output if successful)
# OR: "0 errors" message

# If errors occur, common issues:
# - "Cannot find module": Missing .js extension in imports
# - "Cannot find type": Missing @types package
# - Module resolution errors: Check tsconfig.json module settings

# Verify TypeScript can resolve imports
npx tsc --noEmit --traceResolution 2>&1 | grep "=========" | head -5

# Verify .js extension imports work
grep -q "from '@modelcontextprotocol/sdk/server/index.js'" src/server.ts && echo "✓ Imports use .js extension" || echo "✗ Imports missing .js extension"

# Expected: No TypeScript errors. If errors exist:
# - Check src/server.ts has correct .js extensions in imports
# - Verify tsconfig.json has module: "NodeNext"
# - Ensure dependencies are installed (npm ls)
```

### Level 3: Build Output Validation

```bash
# Clean build (ensure dist/ is fresh)
rm -rf dist
npm run build

# Expected output:
# CLI Building entry: src/server.ts
# CLI tsup v8.x.x
# CLI [success] dist/server.js    XXX B
# CLI [success] dist/server.d.ts  XXX B
# CLI Build success in XXXms

# Verify all output files exist
echo "Checking build output files..."
test -f dist/server.js && echo "✓ dist/server.js exists" || echo "✗ dist/server.js missing"
test -f dist/server.d.ts && echo "✓ dist/server.d.ts exists" || echo "✗ dist/server.d.ts missing"
test -f dist/server.js.map && echo "✓ dist/server.js.map exists" || echo "✗ dist/server.js.map missing"

# Verify file sizes
ls -lh dist/
# Expected: server.js should be > 0 bytes (typically a few KB)
# Expected: server.d.ts should be > 0 bytes

# Verify shebang is present
echo "Checking shebang..."
head -1 dist/server.js
head -1 dist/server.js | grep -q '#!/usr/bin/env node' && echo "✓ Shebang present" || echo "✗ Shebang missing"

# Verify executable permissions
ls -la dist/server.js
# Expected: -rwxr-xr-x (executable)
# On some systems may show -rw-r--r-- (not executable) - this is OK for Node.js

# Verify syntax
node --check dist/server.js && echo "✓ Syntax check passed" || echo "✗ Syntax check failed"

# Expected: All checks pass. If build fails:
# - "Cannot bundle Node.js built-in module": Check tsup.config.ts external setting
# - "Cannot find module": Check npm install completed successfully
# - Type errors: Run npm run typecheck to see TypeScript errors
```

### Level 4: Module Loading and Execution Validation

```bash
# Verify ESM module can be loaded
echo "Testing module loading..."
node -e "import('./dist/server.js').then(m => console.log('✓ Module loaded successfully:', Object.keys(m)))"

# Expected: "Module loaded successfully: [ 'server' ]" or similar
# If error: "Cannot find module" - check file extension (.js vs .mjs)

# Verify module can be executed (will not do anything useful but should not error)
timeout 2 node dist/server.js 2>&1 | head -5 || true

# Expected: May hang waiting for stdio (normal for MCP server)
# Press Ctrl+C to exit
# No immediate errors indicates successful initialization

# Verify declarations file is valid TypeScript
cat dist/server.d.ts | head -10
# Expected: TypeScript export declarations

# Expected: Module loads without errors. If ESM loading fails:
# - Check package.json has "type": "module"
# - Verify dist/server.js uses correct export syntax
# - Ensure file extension matches package.json main field
```

### Level 5: Test Framework Validation

```bash
# Run vitest to verify configuration
npm run test
# OR: npx vitest run

# Expected output:
# CLI vitest v2.x.x
# CLI No test files found
# CLI PASS  No tests

# Verify vitest config is valid
npx vitest --help 2>&1 | head -5

# Test with a simple test file (optional, for verification)
cat > tests/smoke.test.ts << 'EOF'
import { describe, test, expect } from 'vitest';

describe('Build smoke test', () => {
  test('vitest is configured', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF

# Run the test
npm run test

# Expected: Test passes
# Clean up
rm tests/smoke.test.ts

# Expected: Vitest runs without configuration errors
# If errors: Check vitest.config.ts has correct settings
```

---

## Final Validation Checklist

### Technical Validation

- [ ] `npm install` completed without ERESOLVE or peer dependency errors
- [ ] All dependencies verified: @modelcontextprotocol/sdk, typescript, tsup, vitest, @types/node
- [ ] package-lock.json exists and is tracked by git (check with `git status`)
- [ ] `npm run typecheck` passes with zero TypeScript errors
- [ ] `npm run build` produces dist/server.js, dist/server.d.ts, dist/server.js.map
- [ ] Build output has shebang on first line: `#!/usr/bin/env node`
- [ ] `npm run test` runs vitest without configuration errors
- [ ] Built module can be loaded with Node.js ESM: `node -e "import('./dist/server.js')"`
- [ ] No "Cannot bundle Node.js built-in module" errors during build
- [ ] Node.js version is >= 18.0.0 (verified with `node --version`)

### Feature Validation

- [ ] dist/server.js contains valid ESM module syntax
- [ ] dist/server.d.ts contains TypeScript export declarations
- [ ] File permissions allow execution (check with `ls -la dist/server.js`)
- [ ] Module exports include `server` object
- [ ] No runtime errors when loading the module
- [ ] Build time is reasonable (< 5 seconds for minimal server)

### Code Quality Validation

- [ ] No warnings from TypeScript compiler
- [ ] No warnings from tsup during build
- [ ] No errors from npm install
- [ ] package.json scripts work correctly: build, test, typecheck
- [ ] All configuration files are valid JSON/TypeScript

### Documentation & Deployment

- [ ] package-lock.json is committed to git (reproducible builds)
- [ ] Build process is documented in PRP
- [ ] No additional dependencies were added beyond what's specified
- [ ] All research documents are stored in plan/P1M1T2/research/

---

## Anti-Patterns to Avoid

- Don't skip `npm install` if node_modules already exists - stale dependencies can cause issues
- Don't use `npm install` without checking for peer dependency conflicts
- Don't ignore TypeScript errors - they indicate real issues that will cause runtime problems
- Don't modify package.json versions unless dependencies are actually broken
- Don't skip typecheck before build - it's faster to fix TypeScript issues first
- Don't use `npm ci` in development (it's for CI/CD) - use `npm install` instead
- Don't commit node_modules/ to git - that's what package-lock.json is for
- Don't use .mjs extension when package.json has "type": "module" - .js is correct
- Don't skip verifying the shebang - it's needed for executable CLI tools
- Don't ignore build warnings - they often indicate future problems
- Don't run tests before verifying the build works - tests need build artifacts
- Don't forget to check file permissions on the build output
- Don't use `sudo npm install` - it can cause permission issues
- Don't modify src/server.ts beyond fixing compilation errors - this is a verification task only

---

## Troubleshooting Guide

### If npm install fails with ERESOLVE errors:

```bash
# Try legacy peer deps
npm install --legacy-peer-deps

# Or force resolution
npm install --force

# Or check what's conflicting
npm explain <package-name>
```

### If build fails with "Cannot bundle Node.js built-in module":

```bash
# Check tsup.config.ts has external setting
grep -A5 "external:" tsup.config.ts

# Should include:
# external: ['@modelcontextprotocol/sdk', 'node:*']

# If missing, add to tsup.config.ts
```

### If TypeScript fails with "Cannot find module":

```bash
# Check imports use .js extensions
cat src/server.ts | grep "import.*from"

# Should show: from '@modelcontextprotocol/sdk/server/index.js'
# NOT: from '@modelcontextprotocol/sdk/server/index'

# Check dependencies are installed
npm ls @modelcontextprotocol/sdk
```

### If shebang is missing from build output:

```bash
# Check tsup.config.ts has banner setting
grep -A3 "banner:" tsup.config.ts

# Should include:
# banner: {
#   js: '#!/usr/bin/env node',
# }
```

### If vitest fails with configuration errors:

```bash
# Check tsconfig.json has vitest/globals in types
grep "vitest/globals" tsconfig.json

# Should be in types array
# If missing, add: "types": ["vitest/globals", "node"]
```

### If module loading fails:

```bash
# Check package.json has type: module
grep '"type":' package.json

# Check main field points to correct file
grep '"main":' package.json

# Should be: "main": "./dist/server.js" (or .mjs)
# Ensure the file extension matches what tsup produces
```

---

## Confidence Score

**Confidence Score**: 10/10 for one-pass implementation success

**Rationale**:
- All configuration files were created in P1.M1.T1 and follow proven patterns
- Research documents provide comprehensive troubleshooting for every error type
- Dependencies are standard, well-documented packages
- Build process is straightforward: install -> typecheck -> build -> test
- Task is verification-focused, not implementation-heavy
- Existing src/server.ts already compiles successfully (dist/ exists)
- Common gotchas are well-documented in research materials

**Risk Factors** (all mitigated):
- Peer dependency conflicts → use --legacy-peer-deps flag
- Node.js version incompatibility → verified >= 18.0.0 in engines field
- Build configuration errors → tsup.config.ts already validated in P1.M1.T1
- ESM import issues → src/server.ts already uses .js extensions correctly

---

## Sources

- [npm install documentation](https://docs.npmjs.com/cli/v8/commands/npm-install)
- [tsup documentation](https://tsup.egoist.dev/)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution)
- [Vitest Documentation](https://vitest.dev/)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/sdk)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- plan/P1M1T2/research/npm-dependencies.md
- plan/P1M1T2/research/typescript-build-patterns.md
- plan/P1M1T2/research/mcp-sdk-patterns.md
- plan/P1M1T2/research/vitest-patterns.md
- plan/P1M1T2/research/build-error-debugging.md
