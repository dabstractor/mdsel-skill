# PRP: P2.M1.T1 - Implement Word Count Utility

---

## Goal

**Feature Goal**: Create a mechanical word counting utility module that provides `countWords()` and `getWordThreshold()` functions for use in the PreToolUse hook system.

**Deliverable**: A new utility module `src/lib/word-count.ts` with two exported functions and comprehensive test coverage.

**Success Definition**:

- `countWords()` correctly counts words using whitespace-delimited tokenization
- `getWordThreshold()` reads `MDSEL_MIN_WORDS` environment variable with fallback to 200
- All tests pass including edge cases (empty strings, whitespace-only, multiple spaces)
- No external dependencies beyond Node.js built-ins

## User Persona (if applicable)

**Target User**: Internal - PreToolUse hook implementation (P2.M2.T1)

**Use Case**: The read hook script needs to:

1. Count words in Markdown file content
2. Compare against configured threshold
3. Inject reminder message if threshold exceeded

**User Journey**:

```
1. User triggers Read tool on .md file
2. Hook receives file path from stdin JSON
3. Hook reads file content
4. Hook calls countWords(content) -- THIS TASK
5. Hook calls getWordThreshold() -- THIS TASK
6. If count > threshold, inject reminder
7. Hook continues with exit code 0
```

**Pain Points Addressed**: Without this utility, the hook would need inline word counting logic that is harder to test and reuse.

## Why

- **Integration with existing features**: Foundation for P2.M2.T1 (Read Hook Implementation)
- **Problems this solves**: Provides reusable, testable word counting logic; centralizes threshold configuration
- **Architectural role**: Part of behavioral enforcement system that encourages mdsel tool usage over Read tool for large files

## What

**User-visible behavior**: None (internal utility). The functions are:

1. `countWords(content: string): number` - Returns word count using whitespace splitting
2. `getWordThreshold(): number` - Returns threshold from env var or default 200

**Technical requirements**:

- Mechanical counting (no semantic analysis)
- Whitespace-delimited tokens (spaces, tabs, newlines)
- Environment variable `MDSEL_MIN_WORDS` with integer parsing
- TypeScript with JSDoc documentation

### Success Criteria

- [ ] `countWords("")` returns `0`
- [ ] `countWords("hello")` returns `1`
- [ ] `countWords("hello world")` returns `2`
- [ ] `countWords("hello\nworld\tfoo")` returns `3` (tabs/newlines handled)
- [ ] `countWords("  multiple   spaces  ")` returns `2` (multiple spaces handled)
- [ ] `getWordThreshold()` with no env var returns `200`
- [ ] `getWordThreshold()` with `MDSEL_MIN_WORDS=500` returns `500`
- [ ] `getWordThreshold()` with `MDSEL_MIN_WORDS=invalid` returns `200` (fallback)
- [ ] All tests in `tests/lib/word-count.test.ts` pass
- [ ] No new dependencies added

## All Needed Context

### Context Completeness Check

_If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

**Yes** - This PRP provides:

- Exact file locations and naming conventions
- Complete code patterns to follow from existing utilities
- Test framework setup and patterns
- All edge cases and validation requirements

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: src/lib/mdsel-cli.ts
  why: Pattern for utility function structure, JSDoc comments, constant definitions
  pattern: Follow the documentation style (JSDoc with @param, @returns, @example)
  gotcha: Uses 'CRITICAL:' comments for important implementation details

- file: src/types.ts
  why: Pattern for TypeScript type definitions and custom error classes
  pattern: Export interfaces separately, use JSDoc for documentation
  gotcha: No types need to be added here for this task (keep types local to word-count.ts)

- file: tests/lib/mdsel-cli.test.ts
  why: Complete reference for test structure and patterns
  pattern: describe('functionName', () => { beforeEach, nested describe blocks, specific assertions })
  gotcha: Mock at top level with vi.mock(), reset in beforeEach()

- file: vitest.config.ts
  why: Test framework configuration
  pattern: Tests go in tests/**/*.test.ts matching src/**/*.ts structure
  gotcha: Use .js extension in imports (ESM build output)

- docfile: PRD.md
  why: Overall project context and requirements for behavioral conditioning
  section: Section 5.2 - "Mechanical word counting, not semantic"
  gotcha: Word count is intentionally simple - do not add NLP or smart tokenization

- docfile: tasks.json
  why: Exact contract definition for subtasks P2.M1.T1.S1, P2.M1.T1.S2, P2.M1.T1.S3
  section: P2.M1.T1 subtasks
  gotcha: Contract specifies exact function signatures and behavior
```

### Current Codebase Tree

```bash
mdsel-claude-glm/
├── dist/                    # Compiled output (generated)
├── src/
│   ├── hooks/              # Hook scripts (empty - planned for P2.M2)
│   ├── lib/
│   │   └── mdsel-cli.ts    # CLI executor utility (PATTERN TO FOLLOW)
│   ├── tools/              # MCP tool handlers
│   │   ├── mdsel-index.ts
│   │   └── mdsel-select.ts
│   ├── index.ts            # MCP server entry point
│   └── types.ts            # Shared type definitions
├── tests/
│   ├── hooks/              # Hook tests (empty - planned)
│   ├── integration/
│   │   └── mcp-server.test.ts
│   ├── lib/
│   │   └── mdsel-cli.test.ts  # PATTERN TO FOLLOW
│   └── tools/
│       ├── mdsel-index.test.ts
│       └── mdsel-select.test.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

### Desired Codebase Tree After Implementation

```bash
src/lib/
├── mdsel-cli.ts             # Existing
└── word-count.ts            # NEW - word counting utilities

tests/lib/
├── mdsel-cli.test.ts        # Existing
└── word-count.test.ts       # NEW - tests for word count
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: TypeScript module imports require .js extension (ESM)
// import { countWords } from './word-count.js';  // Correct
// import { countWords } from './word-count';     // WRONG - will fail

// CRITICAL: Test imports use relative path with .js extension
// import { countWords } from '../../src/lib/word-count.js';

// CRITICAL: process.env is already typed as Record<string, string | undefined>
// No need to extend ProcessEnv interface

// CRITICAL: Vitest runs with 'globals: true' - no need to import describe/it/expect
// But project explicitly imports them - follow existing pattern

// GOTCHA: parseInt('invalid') returns NaN, not a number
// Must use Number() or isNaN() check for proper validation

// GOTCHA: Whitespace regex /\s+/ matches spaces, tabs, newlines, but NOT zero-width spaces
// This is intentional - mechanical counting only

// PATTERN: Project uses 'CRITICAL:' comments for important implementation notes
// Follow this pattern in the implementation
```

## Implementation Blueprint

### Data Models and Structure

```typescript
/**
 * Word count utility functions for behavioral gating
 * Used by PreToolUse hook to determine when to inject reminders
 *
 * Word counting is mechanical - whitespace-delimited tokens only.
 * No semantic analysis, no language-specific handling.
 */

// No complex models needed - pure functions with simple types
// countWords(content: string): number
// getWordThreshold(): number
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE src/lib/word-count.ts
  - IMPLEMENT: countWords function with JSDoc documentation
  - IMPLEMENT: getWordThreshold function with JSDoc documentation
  - FOLLOW pattern: src/lib/mdsel-cli.ts (JSDoc style, CRITICAL comments)
  - ALGORITHM: content.trim().split(/\s+/).filter(Boolean).length
  - NAMING: camelCase functions, kebab-case filename
  - PLACEMENT: src/lib/word-count.ts
  - EXPORT: Named exports for both functions

Task 2: CREATE tests/lib/word-count.test.ts
  - IMPLEMENT: describe('countWords', ...) with nested test blocks
  - IMPLEMENT: describe('getWordThreshold', ...) with nested test blocks
  - FOLLOW pattern: tests/lib/mdsel-cli.test.ts (structure, beforeEach, assertions)
  - NAMING: test files use .test.ts suffix, kebab-case
  - COVERAGE: Empty string, single word, multiple whitespace types, multiple spaces
  - COVERAGE: Default threshold, env var override, invalid env var fallback
  - PLACEMENT: tests/lib/word-count.test.ts
  - IMPORT: import { countWords, getWordThreshold } from '../../src/lib/word-count.js';

Task 3: VALIDATE implementation
  - RUN: npm test -- tests/lib/word-count.test.ts
  - RUN: npm run lint
  - RUN: npm run build
  - VERIFY: All tests pass, no linting errors, successful build
```

### Implementation Patterns & Key Details

````typescript
/**
 * Count words in text using whitespace-delimited tokenization
 *
 * Word counting is mechanical - splits by whitespace and counts non-empty tokens.
 * No semantic analysis, language-specific handling, or special cases.
 *
 * @param content - The text content to count words in
 * @returns The number of words found (0 for empty/whitespace-only content)
 *
 * @example
 * ```ts
 * countWords("hello world");  // Returns 2
 * countWords("  multiple   spaces  ");  // Returns 2
 * countWords("");  // Returns 0
 * ```
 */
export function countWords(content: string): number {
  // CRITICAL: Handle empty/undefined input
  if (!content || content.length === 0) {
    return 0;
  }

  // PATTERN: Trim leading/trailing, split by whitespace, filter empty strings
  const tokens = content.trim().split(/\s+/).filter(Boolean);

  return tokens.length;
}

/**
 * Get the word count threshold from environment variable
 *
 * Reads MDSEL_MIN_WORDS environment variable. If not set or invalid,
 * returns default threshold of 200 words.
 *
 * @returns The word count threshold (default 200)
 *
 * @example
 * ```ts
 * getWordThreshold();  // Returns 200 (default)
 * process.env.MDSEL_MIN_WORDS = '500';
 * getWordThreshold();  // Returns 500
 * process.env.MDSEL_MIN_WORDS = 'invalid';
 * getWordThreshold();  // Returns 200 (fallback)
 * ```
 */
export function getWordThreshold(): number {
  // CRITICAL: Read from process.env, fallback to default '200'
  const envValue = process.env.MDSEL_MIN_WORDS;

  if (!envValue) {
    return 200; // Default threshold
  }

  // GOTCHA: parseInt returns NaN for invalid input - use Number() with isNaN check
  const threshold = Number.parseInt(envValue, 10);

  // CRITICAL: Return default if NaN or less than 1
  if (Number.isNaN(threshold) || threshold < 1) {
    return 200;
  }

  return threshold;
}
````

### Integration Points

```yaml
CODE:
  - create: src/lib/word-count.ts
  - pattern: 'Named exports for countWords, getWordThreshold'
  - imports: 'No imports needed - uses only built-ins (process.env)'

TESTS:
  - create: tests/lib/word-count.test.ts
  - pattern: 'Vitest with describe/it/expect, beforeEach for env var cleanup'
  - coverage: 'All public functions with edge cases'

BUILD:
  - verify: 'npm run build succeeds'
  - output: 'dist/lib/word-count.js, dist/lib/word-count.d.ts'

NO CHANGES NEEDED TO:
  - tsup.config.ts (utility picked up automatically by glob pattern)
  - package.json (no new scripts needed)
  - src/types.ts (keep types local to utility file)
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npm run lint                       # ESLint check with auto-fix
npm run format                     # Prettier formatting

# Project-specific validation
npm run build                      # Verify TypeScript compilation

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the new word-count module specifically
npm test -- tests/lib/word-count.test.ts

# Run all lib tests to ensure no regressions
npm test -- tests/lib/

# Full test suite
npm test

# Coverage validation (if configured)
npm run test:coverage

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# Build validation
npm run build
# Check that dist/lib/word-count.js exists and is valid

# Import validation in Node REPL
node
> import('./dist/lib/word-count.js').then(m => console.log(typeof m.countWords))
# Should output: 'function'

# Functionality validation
node -e "import('./dist/lib/word-count.js').then(m => console.log(m.countWords('hello world')))"
# Should output: 2

# Expected: All integrations working, proper module exports, correct outputs.
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Word Count Edge Case Testing
# Test various whitespace combinations
node -e "import('./dist/lib/word-count.js').then(m => {
  console.log('Empty:', m.countWords(''));
  console.log('Spaces:', m.countWords('   '));
  console.log('Tabs:', m.countWords('\t\t'));
  console.log('Newlines:', m.countWords('\n\n'));
  console.log('Mixed:', m.countWords('  \t\n  \n\t  '));
  console.log('Words:', m.countWords('hello\tworld\nfoo bar'));
})"

# Threshold Environment Variable Testing
MDSEL_MIN_WORDS=500 node -e "import('./dist/lib/word-count.js').then(m => console.log('Threshold:', m.getWordThreshold()))"
# Should output: 500

MDSEL_MIN_WORDS=invalid node -e "import('./dist/lib/word-count.js').then(m => console.log('Threshold:', m.getWordThreshold()))"
# Should output: 200 (fallback)

node -e "import('./dist/lib/word-count.js').then(m => console.log('Threshold:', m.getWordThreshold()))"
# Should output: 200 (default)

# Performance Testing (large document)
node -e "import('./dist/lib/word-count.js').then(m => {
  const large = 'word '.repeat(10000);
  console.time('countWords');
  const count = m.countWords(large);
  console.timeEnd('countWords');
  console.log('Count:', count);
})"

# Expected: All creative validations pass, edge cases handled correctly.
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test -- tests/lib/word-count.test.ts`
- [ ] No linting errors: `npm run lint`
- [ ] No formatting issues: `npm run format -- --check`
- [ ] Build succeeds: `npm run build`

### Feature Validation

- [ ] `countWords("")` returns `0`
- [ ] `countWords("hello")` returns `1`
- [ ] `countWords("hello world")` returns `2`
- [ ] `countWords("hello\nworld\tfoo")` returns `3`
- [ ] `countWords("  multiple   spaces  ")` returns `2`
- [ ] `getWordThreshold()` with no env var returns `200`
- [ ] `getWordThreshold()` with `MDSEL_MIN_WORDS=500` returns `500`
- [ ] `getWordThreshold()` with `MDSEL_MIN_WORDS=invalid` returns `200`

### Code Quality Validation

- [ ] Follows existing codebase patterns (JSDoc, CRITICAL comments)
- [ ] File placement matches desired structure (src/lib/word-count.ts)
- [ ] Test placement matches desired structure (tests/lib/word-count.test.ts)
- [ ] No new dependencies added
- [ ] Functions exported with named exports

### Documentation & Deployment

- [ ] JSDoc comments complete with @param, @returns, @example
- [ ] CRITICAL comments for important implementation details
- [ ] No environment variable documentation needed (documented in P2.M3)

---

## Anti-Patterns to Avoid

- **Don't** add semantic analysis or NLP - this is mechanical counting only
- **Don't** import external libraries for word counting - use built-in string methods
- **Don't** add complex configuration - just the two simple functions
- **Don't** create classes - use pure functions
- **Don't** add types to src/types.ts - keep types local to the utility
- **Don't** use dynamic imports - this is a simple utility module
- **Don't** handle non-string input - let TypeScript handle type checking
- **Don't** count words by language-specific rules - whitespace only
- **Don't** forget to use .js extension in imports (ESM requirement)
- **Don't** skip edge case testing - whitespace variations matter

---

## Confidence Score

**9/10** - One-pass implementation success likelihood

**Validation**:

- Complete context provided with exact file patterns
- Test framework and patterns well-established in codebase
- Simple, well-defined scope with clear edge cases
- Direct dependency on existing patterns reduces ambiguity
- Missing: Only risk is if environment variable handling has edge cases not covered

**Notes for Implementation Agent**:

1. Follow the JSDoc pattern from `mdsel-cli.ts` exactly
2. Use the test structure from `mdsel-cli.test.ts` as template
3. Remember ESM imports require `.js` extension
4. Keep it simple - this is intentionally mechanical counting
5. Run tests after each function is implemented
