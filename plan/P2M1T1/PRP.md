# P2.M1.T1: Implement Configuration Management

---

## Goal

**Feature Goal**: Create a type-safe configuration utility that loads and validates the `MDSEL_MIN_WORDS` environment variable for use by the word count gating system and PreToolUse hook.

**Deliverable**: A complete `src/utils/config.ts` file containing:
- `Config` interface for typed configuration
- `loadConfig()` function that reads `MDSEL_MIN_WORDS` from environment
- Proper default value handling (default: 200)
- NaN validation with graceful fallback
- Export of config types and function for use by word count utility and hook script

**Success Definition**:
- `loadConfig()` function reads `MDSEL_MIN_WORDS` from `process.env`
- Returns `Config` object with `minWords: number` field
- Default value of 200 is used when environment variable is unset
- Invalid values (NaN) fall back to 200 gracefully
- Function is pure and synchronous (no async operations)
- All tests pass with mocked environment variables

## User Persona

**Target User**: System administrators and developers configuring the behavioral conditioning system for Markdown file access.

**Use Case**: When setting up the mdsel-claude MCP server, administrators need to configure the word count threshold that triggers reminder messages for using selector-based access instead of direct file reading.

**User Journey**:
1. Administrator sets `MDSEL_MIN_WORDS` environment variable (optional)
2. Word count utility (P2.M1.T2) calls `loadConfig()` to get threshold
3. PreToolUse hook script (P2.M2.T1) reads threshold to determine when to show reminders
4. Users receive contextual reminders when reading large Markdown files

**Pain Points Addressed**:
- Provides single source of truth for configuration (no magic numbers)
- Enables customization without code changes
- Validates configuration at load time (fail fast on invalid input)
- Type-safe configuration prevents runtime errors

## Why

- **Foundation for P2.M1.T2**: Word count utility requires threshold value from configuration
- **Foundation for P2.M2.T1**: PreToolUse hook script uses threshold for reminder logic
- **Configuration Best Practice**: Environment variables are standard for deployment configuration (12-factor app)
- **Type Safety**: TypeScript interface prevents configuration errors at compile time
- **Testability**: Pure function enables easy unit testing with mocked environment

## What

Implement a configuration utility module that loads the `MDSEL_MIN_WORDS` environment variable.

### Core Implementation

1. **Config Interface** (P2.M1.T1.S1):
   - Define `Config` interface with `minWords: number` field
   - Export interface for use by word count utility and tests

2. **loadConfig Function** (P2.M1.T1.S1):
   - Read `MDSEL_MIN_WORDS` from `process.env`
   - Parse string value to integer with radix 10
   - Handle undefined/null with default value of 200
   - Handle NaN values with fallback to 200
   - Return `Config` object

3. **Unit Tests** (P2.M1.T1.S2):
   - Test default value when environment variable is unset
   - Test valid integer values
   - Test invalid/non-numeric values (NaN handling)
   - Test edge cases (zero, negative numbers, very large numbers)

### Success Criteria

- [ ] `src/utils/config.ts` created with `Config` interface
- [ ] `loadConfig()` function exported
- [ ] Default value of 200 used when `MDSEL_MIN_WORDS` unset
- [ ] NaN values fall back to 200
- [ ] Valid integers are parsed correctly
- [ ] `src/utils/config.test.ts` created with all tests passing
- [ ] Tests use Vitest environment mocking (`vi.stubEnv()`)

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete interface specification for `Config`
- Exact implementation pattern with NaN handling
- Clear default value specification (200)
- Complete testing pattern with Vitest environment mocking
- Integration points with word count utility and hook script
- Build and test commands for validation

### Documentation & References

```yaml
# MUST READ - TypeScript/Node.js patterns

- url: https://nodejs.org/api/process.html#processenv
  why: Official Node.js documentation for process.env object
  critical: Environment variables are always strings, require parsing/parseInt

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
  why: MDN documentation for parseInt function with radix parameter
  critical: Always pass radix 10 for decimal numbers to avoid octal parsing

- url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
  why: TypeScript documentation for type narrowing with isNaN
  critical: Use Number.isNaN() not global isNaN() for type-safe checking

- url: https://12factor.net/config
  why: 12-factor app configuration best practices
  critical: Environment variables are the standard for deployment configuration

- file: plan/docs/architecture/implementation_patterns.md
  why: Contains the configuration pattern from reference implementation
  section: Lines 224-239 show Config interface and loadConfig function pattern
  pattern: Parse with parseInt, handle NaN with default fallback

- file: src/executor.ts
  why: Shows existing pattern for accessing process.env in codebase
  pattern: Line 59 shows `env: process.env` passed to spawn
  gotcha: process.env values are strings, require parsing for numbers

- file: src/executor.test.ts
  why: Shows Vitest testing patterns used in this codebase
  pattern: vi.mock(), vi.clearAllMocks(), describe/it structure
  gotcha: Tests use Vitest, not Jest or other frameworks

- file: src/tools/index.ts
  why: Shows Zod validation patterns used in this codebase
  pattern: Schema-first validation with type inference
  note: Config utility doesn't need Zod (simple enough for manual validation)

- file: package.json
  why: Project dependencies and scripts
  section: Zod is already installed (can be used if more complex validation needed)
  scripts: "test": "vitest run", "build": "tsup"

- file: vitest.config.ts
  why: Test configuration for config utility tests
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - tests must match this pattern

- file: tsconfig.json
  why: TypeScript configuration for config module
  gotcha: strict mode enabled, test files excluded from compilation

- docfile: plan/P1M2T2/PRP.md
  why: Previous PRP showing file creation and testing patterns
  section: Lines 306-371 show implementation task breakdown pattern
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (generated by tsup)
│   ├── index.d.ts
│   ├── index.js
│   ├── executor.d.ts
│   └── executor.js
├── src/
│   ├── index.ts                   # MCP server entry point
│   ├── executor.ts                # Child process executor
│   ├── executor.test.ts           # Executor tests
│   ├── tools/                     # MCP tool implementations
│   │   ├── index.ts               # mdsel_index tool
│   │   ├── index.test.ts          # mdsel_index tests
│   │   ├── select.ts              # mdsel_select tool
│   │   └── select.test.ts         # mdsel_select tests
│   └── utils/                     # TO BE CREATED: Utility modules
│       ├── config.ts              # TO BE CREATED: Configuration management
│       └── config.test.ts         # TO BE CREATED: Config tests
├── plan/
│   ├── P2M1T1/
│   │   └── PRP.md                 # THIS DOCUMENT
│   └── docs/
│       └── architecture/
│           └── implementation_patterns.md  # Config pattern reference
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── tasks.json
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.d.ts
│   ├── index.js
│   ├── executor.d.ts
│   ├── executor.js
│   ├── utils/
│   │   ├── config.d.ts            # NEW: Config type declarations
│   │   └── config.js              # NEW: Compiled config module
├── src/
│   ├── index.ts
│   ├── executor.ts
│   ├── executor.test.ts
│   ├── tools/
│   │   ├── index.ts
│   │   ├── index.test.ts
│   │   ├── select.ts
│   │   └── select.test.ts
│   └── utils/
│       ├── config.ts              # NEW: Configuration management
│       └── config.test.ts         # NEW: Config unit tests
├── plan/
│   └── P2M1T1/
│       └── PRP.md                 # THIS DOCUMENT
└── ...
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: process.env Values Are Always Strings
// Even if you set MDSEL_MIN_WORDS=200, process.env.MDSEL_MIN_WORDS is "200"
// Must parse with parseInt() to get numeric value
// PATTERN: parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

// CRITICAL: parseInt() Requires Radix Parameter
// Always pass 10 as second parameter to avoid octal parsing
// WRONG: parseInt(value)
// CORRECT: parseInt(value, 10)

// CRITICAL: parseInt() Returns NaN for Invalid Input
// parseInt("abc") returns NaN, parseInt("200abc") returns 200
// Always validate with Number.isNaN() after parsing
// WRONG: if (parsedValue === NaN) { ... }  // NaN !== NaN
// CORRECT: if (Number.isNaN(parsedValue)) { ... }

// CRITICAL: Use Number.isNaN() Not Global isNaN()
// Global isNaN() coerces types (isNaN("foo") === true)
// Number.isNaN() only returns true for actual NaN values
// WRONG: isNaN(value)
// CORRECT: Number.isNaN(value)

// CRITICAL: Environment Variables Can Be undefined
// process.env.MDSEL_MIN_WORDS is undefined if not set
// Use nullish coalescing (??) or logical OR (||) for default
// PATTERN: process.env.MDSEL_MIN_WORDS ?? '200'

// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// Imports from utils must use .js extensions (not .ts)
// WRONG: import { loadConfig } from './utils/config';
// CORRECT: import { loadConfig } from './utils/config.js';

// CRITICAL: Vitest Environment Mocking
// Use vi.stubEnv() to mock process.env in tests
// Must call vi.unstubAllEnv() in afterEach to clean up
// PATTERN:
//   vi.stubEnv('MDSEL_MIN_WORDS', '300');
//   // test code...
//   vi.unstubAllEnv();

// CRITICAL: Pure Function Design
// loadConfig() must be pure (no side effects, no async)
// Should not cache results (callers can cache if needed)
// Should not throw exceptions (handle errors gracefully)
// PATTERN: export function loadConfig(): Config { ... }

// CRITICAL: TypeScript Test File Exclusion
// Files matching *.test.ts are excluded from tsconfig.json
// They are handled by vitest, not the TypeScript compiler
// DO NOT add src/utils/config.test.ts to tsconfig include array

// CRITICAL: No Zod Validation Required
// This utility is simple enough for manual validation
// Zod is available in dependencies but overkill here
// Future work: Use Zod if config becomes more complex
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Config interface - typed configuration object
// Defines the contract for configuration throughout the system
// Used by word count utility and potentially by hook scripts

interface Config {
  // minWords is the word count threshold for behavioral reminders
  // When a Markdown file exceeds this count, users are reminded
  // to use mdsel_index and mdsel_select instead of Read
  minWords: number;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/utils/ Directory
  - CREATE: src/utils/ directory for utility modules
  - VERIFY: Directory is in src/ root, not nested elsewhere
  - PLACEMENT: Same level as src/tools/ directory
  - GOTCHA: Don't create in dist/ (that's generated)

Task 2: CREATE src/utils/config.ts - Define Interface and Import
  - DEFINE: export interface Config { minWords: number; }
  - ADD: JSDoc comments for interface documentation
  - NAMING: Use exact interface and field names as specified
  - PLACEMENT: Top of src/utils/config.ts
  - PATTERN: Follow naming convention from ExecutorResult in src/executor.ts

Task 3: IMPLEMENT loadConfig Function - Core Logic
  - CREATE: export function loadConfig(): Config { ... }
  - DECLARE: const envValue = process.env.MDSEL_MIN_WORDS;
  - DECLARE: const parsedValue = parseInt(envValue || '200', 10);
  - VALIDATE: const minWords = Number.isNaN(parsedValue) ? 200 : parsedValue;
  - RETURN: { minWords };
  - GOTCHA: Pass radix 10 to parseInt() for decimal parsing
  - GOTCHA: Use Number.isNaN() not global isNaN()

Task 4: EXPORT Config Interface and Function
  - EXPORT: export interface Config and export function loadConfig
  - VERIFY: Both are exported for use by word count utility
  - PATTERN: Follow export pattern from src/executor.ts

Task 5: CREATE src/utils/config.test.ts - Test File Setup
  - IMPORT: describe, it, expect, vi, afterEach from 'vitest'
  - IMPORT: { loadConfig, Config } from './config.js' (use .js extension)
  - SETUP: afterEach(() => { vi.unstubAllEnv(); });
  - GOTCHA: Use .js extension in import path
  - GOTCHA: Clean up env mocks in afterEach

Task 6: IMPLEMENT Unit Tests
  - TEST: should return default value of 200 when MDSEL_MIN_WORDS is not set
  - TEST: should parse valid integer value from environment
  - TEST: should return 200 for NaN values (invalid input)
  - TEST: should handle zero value
  - TEST: should handle negative numbers
  - MOCK: Use vi.stubEnv('MDSEL_MIN_WORDS', value) for each test case
  - GOTCHA: Clean up env mocks with vi.unstubAllEnv()

Task 7: BUILD and Validate
  - RUN: npm run build to compile TypeScript
  - VERIFY: dist/utils/config.js and dist/utils/config.d.ts generated
  - RUN: npm test config to execute config tests
  - VERIFY: All config tests pass
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// CONFIG INTERFACE (Task 2)
// ============================================================

/**
 * Application configuration for behavioral conditioning system.
 *
 * @example
 * const config = loadConfig();
 * if (wordCount > config.minWords) {
 *   // Show reminder to use mdsel tools
 * }
 */
export interface Config {
  /**
   * Word count threshold for showing reminders.
   * Markdown files exceeding this count should be accessed
   * via mdsel_index and mdsel_select instead of direct Read.
   */
  minWords: number;
}

// ============================================================
// LOADCONFIG FUNCTION PATTERN (Task 3)
// ============================================================

/**
 * Load application configuration from environment variables.
 *
 * Reads the MDSEL_MIN_WORDS environment variable and returns
 * a typed configuration object. Uses default value of 200 if
 * the variable is unset or contains invalid input.
 *
 * @returns Config object with minWords threshold
 *
 * @example
 * // With MDSEL_MIN_WORDS=300
 * const config = loadConfig();
 * console.log(config.minWords); // 300
 *
 * @example
 * // With MDSEL_MIN_WORDS unset
 * const config = loadConfig();
 * console.log(config.minWords); // 200 (default)
 *
 * @example
 * // With MDSEL_MIN_WORDS=invalid
 * const config = loadConfig();
 * console.log(config.minWords); // 200 (fallback)
 */
export function loadConfig(): Config {
  // Read environment variable (string | undefined)
  const envValue = process.env.MDSEL_MIN_WORDS;

  // Parse to integer with radix 10 (decimal)
  // Use '200' as default if envValue is undefined/null
  const parsedValue = parseInt(envValue || '200', 10);

  // Handle NaN - parseInt returns NaN for invalid input
  // Use Number.isNaN() for type-safe checking
  const minWords = Number.isNaN(parsedValue) ? 200 : parsedValue;

  return { minWords };
}

// GOTCHA: parseInt() with radix 10 prevents octal parsing
// WRONG: parseInt(envValue || '200')
// CORRECT: parseInt(envValue || '200', 10)

// GOTCHA: Use Number.isNaN() not global isNaN()
// Global isNaN("abc") === true (coercion)
// Number.isNaN("abc") === false (no coercion)
// Number.isNaN(NaN) === true (only true for actual NaN)

// GOTCHA: Default value logic uses || for fallback
// Handles both undefined and empty string cases
// process.env.MDSEL_MIN_WORDS || '200' works for:
//   - undefined (not set) -> '200'
//   - '' (empty string) -> '200'
//   - '300' -> '300'

// ============================================================
// COMPLETE IMPLEMENTATION (Tasks 2-4 combined)
// ============================================================

/**
 * Application configuration for behavioral conditioning system.
 */
export interface Config {
  /** Word count threshold for showing reminders */
  minWords: number;
}

/**
 * Load application configuration from environment variables.
 */
export function loadConfig(): Config {
  const envValue = process.env.MDSEL_MIN_WORDS;
  const parsedValue = parseInt(envValue || '200', 10);
  const minWords = Number.isNaN(parsedValue) ? 200 : parsedValue;

  return { minWords };
}

// ============================================================
// TEST PATTERN (Tasks 5-6)
// ============================================================

// src/utils/config.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadConfig, Config } from './config.js';

describe('loadConfig', () => {
  // Clean up environment mocks after each test
  afterEach(() => {
    vi.unstubAllEnv();
  });

  it('should return default value of 200 when MDSEL_MIN_WORDS is not set', () => {
    // Ensure environment variable is unset
    delete process.env.MDSEL_MIN_WORDS;

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should parse valid integer value from environment', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '300');

    const config = loadConfig();

    expect(config.minWords).toBe(300);
  });

  it('should return 200 for NaN values (invalid input)', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', 'invalid');

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should return 200 for partially invalid input (parseInt behavior)', () => {
    // parseInt("200abc") returns 200, not NaN
    vi.stubEnv('MDSEL_MIN_WORDS', '200abc');

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should handle zero value', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '0');

    const config = loadConfig();

    expect(config.minWords).toBe(0);
  });

  it('should handle negative numbers', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '-100');

    const config = loadConfig();

    expect(config.minWords).toBe(-100);
  });

  it('should handle very large numbers', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '999999');

    const config = loadConfig();

    expect(config.minWords).toBe(999999);
  });
});

// GOTCHA: Use vi.stubEnv() for environment mocking
// This is the Vitest-recommended way to mock process.env
// Alternative: process.env.MDSEL_MIN_WORDS = 'value' (less clean)

// GOTCHA: Clean up with vi.unstubAllEnv()
// Prevents test pollution and interference between tests

// GOTCHA: Test covers parseInt edge cases
// parseInt("200abc") === 200 (stops at first non-numeric)
// This is documented behavior, not a bug
```

### Integration Points

```yaml
PACKAGE.JSON:
  - verified: "type": "module" enables ESM
  - verified: Zod dependency available (not needed for this task)
  - verified: "scripts": { "test": "vitest run", "build": "tsup" }
  - no changes needed for this task

TSCONFIG.JSON:
  - verified: "strict": true for type safety
  - verified: "exclude": ["**/*.test.ts"] prevents test compilation
  - note: src/utils/*.test.ts will be handled by vitest
  - no changes needed for this task

TSUP.CONFIG.TS:
  - verified: entry: ['src/index.ts', 'src/executor.ts']
  - note: Config utility will be imported by word count utility
  - note: Will be included in build if added to entry or bundled with consumer
  - no changes needed for this task

VITEST.CONFIG.TS:
  - verified: test.include: ['src/**/*.{test,spec}.{js,ts}']
  - note: src/utils/config.test.ts will be picked up automatically
  - no changes needed for this task

P2.M1.T2 (FUTURE TASK):
  - Word count utility will import loadConfig from '../utils/config.js'
  - integration: countWords() uses config.minWords threshold

P2.M2.T1 (FUTURE TASK):
  - PreToolUse hook script will use threshold value
  - integration: Hook reads config to determine when to show reminders

BUILD OUTPUT:
  - npm run build will compile src/utils/config.ts to dist/utils/config.js
  - dist/utils/config.d.ts will contain Config type declarations
  - dist/utils/config.js will be ESM module with exports
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing src/utils/config.ts implementation - fix before proceeding
npm run build

# Expected Output:
# > mdsel-claude@1.0.0 build
# > tsup
# CLI Building entry: src/index.ts
# CLI Building entry: src/executor.ts
# CLI dist/index.js   2.50 KB
# CLI dist/index.d.ts 1.23 KB
# CLI dist/executor.js   1.80 KB
# CLI dist/executor.d.ts 0.95 KB
# CLI dist/utils/config.js   0.80 KB
# CLI dist/utils/config.d.ts 0.45 KB
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/utils/config.js generated successfully
# - dist/utils/config.d.ts generated successfully
# - Config interface is in .d.ts file
# - loadConfig function is exported

# Verify generated type definitions:
cat dist/utils/config.d.ts

# Expected: Should contain Config interface and loadConfig export
# export interface Config {
#   minWords: number;
# }
# export declare function loadConfig(): Config

# Verify ESM format in built output:
head -n 10 dist/utils/config.js

# Expected: Should be ESM format with imports/exports
# Should NOT have shebang (only index.js has shebang)

# If errors occur:
# - Check import paths use .js extensions (if importing from this module)
# - Check Config interface has correct field name (minWords)
# - Read TypeScript error messages carefully

# Verify no linting errors (if linter is configured):
# (No linter configured in this project per package.json)
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test config implementation
npm test config

# Expected Output:
# > mdsel-claude@1.0.0 test
# > vitest run
#
# ✓ src/utils/config.test.ts (7)
#   ✓ loadConfig
#     ✓ should return default value of 200 when MDSEL_MIN_WORDS is not set
#     ✓ should parse valid integer value from environment
#     ✓ should return 200 for NaN values (invalid input)
#     ✓ should return 200 for partially invalid input (parseInt behavior)
#     ✓ should handle zero value
#     ✓ should handle negative numbers
#     ✓ should handle very large numbers
#
# Test Files  1 passed (1)
# Tests  7 passed (7)

# Full test suite:
npm test

# Expected: All tests pass, including config tests

# If tests fail:
# - Check vi.stubEnv() is called before loadConfig()
# - Check vi.unstubAllEnv() is in afterEach()
# - Verify Number.isNaN() is used (not global isNaN())
# - Check parseInt() has radix 10 parameter

# Debug failing tests:
npm test config -- --reporter=verbose

# Watch mode for iterative development:
npm test -- --watch config
```

### Level 3: Integration Testing (System Validation)

```bash
# Test config utility directly in Node.js
node -e "
import { loadConfig } from './dist/utils/config.js';
const config = loadConfig();
console.log('minWords:', config.minWords);
console.log('Type:', typeof config.minWords);
"

# Expected (with MDSEL_MIN_WORDS unset):
# minWords: 200
# Type: number

# Expected (with MDSEL_MIN_WORDS=300):
# minWords: 300
# Type: number

# Test with invalid input:
MDSEL_MIN_WORDS=invalid node -e "
import { loadConfig } from './dist/utils/config.js';
const config = loadConfig();
console.log('minWords (should be 200):', config.minWords);
"

# Expected:
# minWords (should be 200): 200

# Test with valid custom value:
MDSEL_MIN_WORDS=500 node -e "
import { loadConfig } from './dist/utils/config.js';
const config = loadConfig();
console.log('minWords (should be 500):', config.minWords);
"

# Expected:
# minWords (should be 500): 500

# Verify Config type is exported:
node -e "
import { Config } from './dist/utils/config.js';
console.log('Config exists:', typeof Config !== 'undefined');
console.log('Config type:', typeof Config);
"

# Expected:
# Config exists: true
# Config type: function (interfaces are erased at runtime, but type is available)

# If integration tests fail:
# - Verify build completed successfully
# - Check dist/utils/config.js exists
# - Verify ESM format is correct
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check Config interface is exported:
grep -n "export interface Config" src/utils/config.ts

# Expected: export interface Config {

# 2. Check loadConfig function is exported:
grep -n "export function loadConfig" src/utils/config.ts

# Expected: export function loadConfig(): Config {

# 3. Check parseInt has radix 10:
grep -n "parseInt.*10" src/utils/config.ts

# Expected: parseInt(envValue || '200', 10)

# 4. Check Number.isNaN() is used (not global isNaN):
grep -n "Number.isNaN" src/utils/config.ts

# Expected: Number.isNaN(parsedValue)

# 5. Verify default value of 200:
grep -n "200" src/utils/config.ts

# Expected: Should appear in default value fallback

# 6. Check test file has environment cleanup:
grep -n "unstubAllEnv" src/utils/config.test.ts

# Expected: vi.unstubAllEnv() in afterEach

# 7. Check tests use vi.stubEnv():
grep -n "stubEnv" src/utils/config.test.ts

# Expected: Multiple vi.stubEnv() calls for different test cases

# 8. Verify .js extension in test imports:
grep -n "from.*config.js" src/utils/config.test.ts

# Expected: import { loadConfig, Config } from './config.js';
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/utils/config.js and dist/utils/config.d.ts generated successfully
- [ ] Config interface exported in dist/utils/config.d.ts
- [ ] loadConfig function exported in dist/utils/config.d.ts
- [ ] Level 2 validation passed: `npm test config` shows all tests passing
- [ ] Environment variable mocking uses vi.stubEnv() correctly
- [ ] Environment cleanup uses vi.unstubAllEnv() in afterEach
- [ ] Tests verify default value, valid input, and invalid input cases
- [ ] Level 3 validation passed: Real Node.js can import and use config
- [ ] Default value of 200 is used when env var is unset
- [ ] Invalid values fall back to 200 correctly

### Feature Validation

- [ ] Config interface has exactly 1 field: minWords: number
- [ ] loadConfig accepts no parameters (pure function)
- [ ] loadConfig returns Config object
- [ ] Default value of 200 used when MDSEL_MIN_WORDS unset
- [ ] parseInt() uses radix 10 parameter
- [ ] Number.isNaN() used for NaN detection
- [ ] NaN values fall back to 200
- [ ] Valid integers are parsed correctly
- [ ] Zero value is allowed (no special case)
- [ ] Negative numbers are allowed (no validation)
- [ ] Very large numbers are handled (no upper limit)

### Code Quality Validation

- [ ] JSDoc comments present on interface and function
- [ ] Function is pure (no side effects, no async)
- [ ] No external dependencies (only uses process.env)
- [ ] Follows TypeScript strict mode requirements
- [ ] Test file uses Vitest patterns matching other tests
- [ ] Environment cleanup prevents test pollution
- [ ] Test cases cover happy path and edge cases
- [ ] Code follows existing codebase style (matches executor.ts pattern)

### Integration Readiness

- [ ] loadConfig can be imported by word count utility in P2.M1.T2
- [ ] Config type can be imported by word count utility in P2.M1.T2
- [ ] Function signature matches P2.M1.T2 requirements
- [ ] No dependencies on P2.M1.T2 components (foundational module)
- [ ] No dependencies on P2.M2 components (foundation for hooks)
- [ ] Test coverage sufficient for regression prevention

---

## Anti-Patterns to Avoid

- [ ] Don't forget radix parameter - use `parseInt(value, 10)` not `parseInt(value)`
- [ ] Don't use global isNaN() - use `Number.isNaN(value)` not `isNaN(value)`
- [ ] Don't skip NaN handling - `parseInt('invalid')` returns NaN
- [ ] Don't throw exceptions - handle invalid input with default fallback
- [ ] Don't make it async - this is a simple synchronous utility
- [ ] Don't cache results - pure function should return fresh values
- [ ] Don't use Zod for this simple case - manual validation is sufficient
- [ ] Don't forget afterEach cleanup - `vi.unstubAllEnv()` prevents test pollution
- [ ] Don't use .ts extension in imports - use `.js` extension for ESM
- [ ] Don't add upper/lower bounds - allow any integer value (caller's responsibility)
- [ ] Don't validate negative/zero - those are valid use cases for testing
- [ ] Don't create config singleton - function should return new object each call

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete implementation pattern with exact code structure
- Research-backed best practices for environment variable handling
- Comprehensive testing pattern with Vitest environment mocking
- All gotchas documented with correct/incorrect examples
- Default value clearly specified (200)
- NaN handling pattern clearly documented
- Integration points clearly defined with downstream tasks
- Validation gates are deterministic and checkable

**Expected Implementation Time**: ~15-20 minutes for a developer familiar with TypeScript

**Risk Factors**:
- parseInt() radix requirement (mitigated: explicit examples provided)
- Number.isNaN() vs global isNaN() confusion (mitigated: clear documentation)
- Vitest environment mocking (mitigated: complete pattern provided)
- ESM .js extension requirement (mitigated: examples use correct pattern)

**Post-Implementation**:
- Config utility will be ready for P2.M1.T2 (word count utility)
- Config utility will enable P2.M2.T1 (PreToolUse hook script)
- Single source of truth for threshold value established
- Type-safe configuration prevents runtime errors
