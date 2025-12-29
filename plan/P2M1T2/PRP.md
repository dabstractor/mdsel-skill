# P2.M1.T2: Implement Word Count Utility

---

## Goal

**Feature Goal**: Create a pure utility function that counts words in Markdown file content using mechanical whitespace-delimited tokenization for the word count gating system.

**Deliverable**: A complete `src/utils/word-count.ts` file containing:
- `countWords()` function that accepts a string and returns a number
- Whitespace-delimited tokenization using `/\s+/` regex pattern
- Proper handling of empty strings, leading/trailing whitespace, and multiple consecutive whitespace characters
- JSDoc documentation for the function
- Export of the function for use by the PreToolUse hook script (P2.M2.T1)

**Success Definition**:
- `countWords()` function accepts `content: string` parameter
- Returns `number` representing the word count
- Empty string returns 0
- Whitespace-only strings return 0
- Handles leading/trailing whitespace correctly
- Handles multiple consecutive spaces, tabs, and newlines
- Function is pure and synchronous (no side effects, no async)
- All tests pass with various edge cases

## User Persona

**Target User**: Internal system components (PreToolUse hook script) that need to determine whether a Markdown file exceeds the configured word count threshold.

**Use Case**: When the PreToolUse hook intercepts a Read tool call on a Markdown file, it needs to count the words in the file content and compare against the threshold to determine whether to show a reminder message.

**User Journey**:
1. PreToolUse hook script (P2.M2.T1) reads Markdown file content
2. Hook script calls `countWords()` with the file content
3. Function returns word count as a number
4. Hook compares against `config.minWords` threshold (from P2.M1.T1)
5. If word count > threshold, hook injects reminder message

**Pain Points Addressed**:
- Provides deterministic word count (mechanical, not semantic)
- Consistent with `wc -w` Unix command behavior
- Pure function enables easy testing and mocking
- No external dependencies (uses built-in string methods)

## Why

- **Foundation for P2.M2.T1**: PreToolUse hook script requires word counting to trigger reminders
- **Behavioral Conditioning**: Enables token-efficient access patterns for large Markdown files
- **Mechanical Approach**: Whitespace-delimited counting is simple, fast, and deterministic
- **No NLP Required**: System doesn't need semantic understanding, just token approximation
- **Performance**: O(n) time complexity with minimal memory overhead
- **Testability**: Pure function with no side effects enables comprehensive unit testing

## What

Implement a mechanical word counting utility function using whitespace-delimited tokenization.

### Core Implementation

1. **countWords Function** (P2.M1.T2.S1):
   - Accept `content: string` parameter
   - Trim leading/trailing whitespace
   - Split on `/\s+/` regex (one or more whitespace characters)
   - Filter out empty strings from the result array
   - Return the length of the filtered array
   - Handle empty string case (return 0)

2. **Unit Tests** (P2.M1.T2.S2):
   - Test basic word counting with spaces
   - Test empty string returns 0
   - Test whitespace-only string returns 0
   - Test leading/trailing whitespace handling
   - Test multiple consecutive whitespace characters
   - Test tabs and newlines as delimiters
   - Test mixed whitespace types
   - Test large content (performance validation)

### Success Criteria

- [ ] `src/utils/word-count.ts` created with `countWords()` function
- [ ] Function uses `/\s+/` regex pattern for splitting
- [ ] Function handles empty string (returns 0)
- [ ] Function handles whitespace-only strings (returns 0)
- [ ] Function handles leading/trailing whitespace
- [ ] Function handles multiple consecutive whitespace characters
- [ ] `src/utils/word-count.test.ts` created with all tests passing
- [ ] Tests follow Vitest patterns from `src/utils/config.test.ts`

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete function signature and implementation pattern
- Exact regex pattern to use (`/\s+/`)
- Complete testing pattern with all edge cases
- Integration points with config utility (P2.M1.T1)
- Build and test commands for validation
- All gotchas documented with examples

### Documentation & References

```yaml
# MUST READ - JavaScript/TypeScript string manipulation

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
  why: MDN documentation for String.prototype.split() with regex parameter
  critical: split() with /\s+/ splits on any whitespace (spaces, tabs, newlines)
  section: "Parameters" section shows separator can be a regex

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
  why: MDN documentation for String.prototype.trim()
  critical: trim() removes leading and trailing whitespace
  section: Shows trim() handles spaces, tabs, newlines, and other Unicode whitespace

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  why: MDN documentation for Array.prototype.filter()
  critical: Use filter() to remove empty strings from split result
  section: "Examples" shows filtering falsy values

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  why: MDN documentation for RegExp patterns
  critical: /\s+/ matches one or more whitespace characters
  section: "Character classes" shows \s matches any whitespace character

- file: plan/docs/architecture/implementation_patterns.md
  why: Contains the word count utility pattern from reference implementation
  section: Lines 132-145 show the exact countWords implementation pattern
  pattern: trim().split(/\s+/).filter(token => token.length > 0).length

- file: src/utils/config.ts
  why: Shows existing utility module structure in this codebase
  pattern: Pure function with JSDoc comments, export pattern
  gotcha: Utilities in src/utils/ use same naming and structure conventions

- file: src/utils/config.test.ts
  why: Shows Vitest testing patterns used in this codebase for utilities
  pattern: describe/it structure, expect() assertions, afterEach cleanup
  note: No environment mocking needed for countWords (pure function)

- file: src/executor.ts
  why: Shows TypeScript interface and JSDoc patterns in this codebase
  pattern: Interface definitions, export patterns, comment style
  note: Follow similar JSDoc formatting for consistency

- file: src/executor.test.ts
  why: Shows Vitest testing patterns with beforeEach cleanup
  pattern: vi.clearAllMocks(), describe/it structure, async test patterns
  note: countWords tests don't need mocking (synchronous pure function)

- file: vitest.config.ts
  why: Test configuration for word count utility tests
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - tests must match this pattern

- docfile: plan/P2M1T1/PRP.md
  why: Previous PRP showing utility module creation patterns
  section: Implementation Tasks show how to add to src/utils/ directory
  note: countWords will be in same directory as config utility
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.d.ts
│   ├── index.js
│   ├── executor.d.ts
│   ├── executor.js
│   └── utils/
│       ├── config.d.ts            # Config type declarations (from P2.M1.T1)
│       └── config.js              # Compiled config module (from P2.M1.T1)
├── src/
│   ├── index.ts                   # MCP server entry point
│   ├── executor.ts                # Child process executor
│   ├── executor.test.ts           # Executor tests
│   ├── tools/
│   │   ├── index.ts               # mdsel_index tool
│   │   ├── index.test.ts          # mdsel_index tests
│   │   ├── select.ts              # mdsel_select tool
│   │   └── select.test.ts         # mdsel_select tests
│   └── utils/
│       ├── config.ts              # Configuration management (from P2.M1.T1)
│       └── config.test.ts         # Config tests (from P2.M1.T1)
├── plan/
│   ├── P2M1T2/
│   │   ├── PRP.md                 # THIS DOCUMENT
│   │   └── research/              # Research files directory
│   └── docs/
│       └── architecture/
│           └── implementation_patterns.md  # Word count pattern reference
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
│   └── utils/
│       ├── config.d.ts            # Config type declarations
│       ├── config.js              # Compiled config module
│       ├── word-count.d.ts        # NEW: Word count type declarations
│       └── word-count.js          # NEW: Compiled word count module
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
│       ├── config.ts              # Configuration management
│       ├── config.test.ts         # Config tests
│       ├── word-count.ts          # NEW: Word count utility
│       └── word-count.test.ts     # NEW: Word count unit tests
├── plan/
│   └── P2M1T2/
│       ├── PRP.md                 # THIS DOCUMENT
│       └── research/
│           ├── word-counting-research-summary.md
│           └── javascript_split_regex_research.md
└── ...
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: Use /\s+/ Not /\s/ for Word Splitting
// /\s/ splits on SINGLE whitespace characters
// 'hello  world'.split(/\s/) returns ['hello', '', 'world']
// /\s+/ splits on ONE OR MORE whitespace characters
// 'hello  world'.split(/\s+/) returns ['hello', 'world']
// PATTERN: text.trim().split(/\s+/)

// CRITICAL: trim() Before split() to Handle Leading/Trailing Whitespace
// '  hello world  '.split(/\s+/) returns ['', 'hello', 'world', '']
// '  hello world  '.trim().split(/\s+/) returns ['hello', 'world']
// PATTERN: Always trim() first to avoid empty strings at boundaries

// CRITICAL: Empty String Case Returns Different Results
// ''.split(/\s+/) returns [''] (array with one empty string)
// ''.trim().split(/\s+/) returns [''] (still one empty string)
// Need explicit check for empty/whitespace-only strings
// PATTERN: if (trimmed === '') return 0;

// CRITICAL: filter() to Remove Empty Strings
// 'hello  world'.split(/\s+/) returns ['hello', 'world']
// But '  hello  '.split(/\s+/) returns ['', 'hello', '']
// Use filter(token => token.length > 0) to remove empty strings
// PATTERN: .filter(token => token.length > 0)

// CRITICAL: /\s/ Matches All Whitespace Types
// Matches: space, tab (\t), newline (\n), carriage return (\r), form feed (\f), vertical tab (\v)
// This is correct behavior - tabs and newlines should count as word separators
// PATTERN: /\s+/ handles all whitespace types correctly

// CRITICAL: No Async Operations
// countWords() must be synchronous (pure function)
// DO NOT use async/await
// DO NOT use Promises
// PATTERN: export function countWords(content: string): number { ... }

// CRITICAL: Pure Function Design
// No side effects (no modifying input, no I/O, no global state)
// Same input always produces same output
// Should not read from process.env or file system
// PATTERN: export function countWords(content: string): number { ... }

// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// Imports from word-count must use .js extensions (not .ts)
// WRONG: import { countWords } from './utils/word-count';
// CORRECT: import { countWords } from './utils/word-count.js';

// CRITICAL: Vitest Test Patterns
// Tests use describe/it structure from Vitest
// No mocking needed for pure functions
// Use expect() for assertions
// PATTERN: expect(countWords('hello world')).toBe(2);

// CRITICAL: File Naming Convention
// Use kebab-case for file names: word-count.ts
// NOT snake_case: word_count.ts
// NOT camelCase: wordCount.ts
// PATTERN: word-count.ts matches config.ts pattern

// CRITICAL: JSDoc Comment Format
// Follow existing JSDoc style from src/executor.ts
// Include @example tags showing usage
// PATTERN: Multi-line comment with description and examples

// CRITICAL: TypeScript Return Type Annotation
// Always specify return type explicitly
// PATTERN: export function countWords(content: string): number

// CRITICAL: No External Dependencies
// countWords() should only use built-in String methods
// DO NOT import any libraries for this function
// trim(), split(), filter() are all built-in
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// No data models needed for this task
// countWords is a pure function: string -> number
// Input: content (string) - Markdown file content
// Output: number - Word count
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/utils/word-count.ts - Function Signature and Documentation
  - CREATE: src/utils/word-count.ts file
  - ADD: JSDoc comment explaining the function
  - DEFINE: export function countWords(content: string): number
  - DOCUMENT: Add @example tags showing usage
  - PATTERN: Follow JSDoc style from src/executor.ts
  - NAMING: Use exact function name as specified (countWords)

Task 2: IMPLEMENT countWords Function - Core Logic
  - DECLARE: const trimmed = content.trim();
  - CHECK: if (trimmed === '') return 0;
  - DECLARE: const tokens = trimmed.split(/\s+/);
  - DECLARE: const words = tokens.filter(token => token.length > 0);
  - RETURN: words.length;
  - GOTCHA: Use /\s+/ regex (one or more whitespace)
  - GOTCHA: Check for empty string before split to handle edge case

Task 3: EXPORT countWords Function
  - EXPORT: export function countWords(content: string): number
  - VERIFY: Function is exported for use by PreToolUse hook
  - PATTERN: Follow export pattern from src/utils/config.ts

Task 4: CREATE src/utils/word-count.test.ts - Test File Setup
  - CREATE: src/utils/word-count.test.ts file
  - IMPORT: describe, it, expect from 'vitest'
  - IMPORT: { countWords } from './word-count.js' (use .js extension)
  - SETUP: No beforeEach/afterEach needed (pure function, no mocking)
  - GOTCHA: Use .js extension in import path

Task 5: IMPLEMENT Unit Tests - Basic Functionality
  - TEST: should count words separated by spaces
  - TEST: should return 0 for empty string
  - TEST: should return 0 for whitespace-only string
  - ASSERT: expect(countWords('hello world')).toBe(2)
  - ASSERT: expect(countWords('')).toBe(0)
  - ASSERT: expect(countWords('   ')).toBe(0)

Task 6: IMPLEMENT Unit Tests - Edge Cases
  - TEST: should handle leading/trailing whitespace
  - TEST: should handle multiple consecutive spaces
  - TEST: should handle tabs as delimiters
  - TEST: should handle newlines as delimiters
  - TEST: should handle mixed whitespace types
  - ASSERT: expect(countWords('  hello world  ')).toBe(2)
  - ASSERT: expect(countWords('hello    world')).toBe(2)
  - ASSERT: expect(countWords('hello\tworld')).toBe(2)
  - ASSERT: expect(countWords('hello\nworld')).toBe(2)

Task 7: BUILD and Validate
  - RUN: npm run build to compile TypeScript
  - VERIFY: dist/utils/word-count.js and dist/utils/word-count.d.ts generated
  - RUN: npm test word-count to execute word count tests
  - VERIFY: All word count tests pass
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// COMPLETE IMPLEMENTATION (Tasks 1-3)
// ============================================================

/**
 * Count words in a string using whitespace-delimited tokenization.
 *
 * This is a mechanical word count that splits on any whitespace
 * (spaces, tabs, newlines). It does not perform semantic analysis
 * or NLP. This matches the behavior of `wc -w` Unix command.
 *
 * @param content - The text content to count words in
 * @returns The number of whitespace-delimited tokens
 *
 * @example
 * // Basic usage
 * countWords('hello world') // Returns: 2
 *
 * @example
 * // Empty string
 * countWords('') // Returns: 0
 *
 * @example
 * // Leading/trailing whitespace
 * countWords('  hello world  ') // Returns: 2
 *
 * @example
 * // Multiple consecutive whitespace
 * countWords('hello    world\t\nthis') // Returns: 3
 */
export function countWords(content: string): number {
  // Remove leading/trailing whitespace
  const trimmed = content.trim();

  // Handle empty string case
  if (trimmed === '') {
    return 0;
  }

  // Split on any whitespace (spaces, tabs, newlines, etc.)
  // /\s+/ matches one or more consecutive whitespace characters
  const tokens = trimmed.split(/\s+/);

  // Filter out any remaining empty strings and return count
  return tokens.filter(token => token.length > 0).length;
}

// ============================================================
// KEY IMPLEMENTATION DETAILS
// ============================================================

// PATTERN: trim() before split()
// Removes leading/trailing whitespace to avoid empty strings at boundaries
// '  hello world  '.trim() returns 'hello world'

// PATTERN: Check for empty string after trim()
// Handle the edge case where input is empty or whitespace-only
// if (trimmed === '') return 0;

// PATTERN: Use /\s+/ regex for splitting
// Matches one or more consecutive whitespace characters
// Handles spaces, tabs (\t), newlines (\n), carriage returns (\r)
// 'hello    world'.split(/\s+/) returns ['hello', 'world']

// PATTERN: Filter empty strings from result
// Although /\s+/ and trim() handle most cases, filter() ensures correctness
// .filter(token => token.length > 0) removes any remaining empty strings

// GOTCHA: split(/\s/) vs split(/\s+/)
// /\s/ splits on single whitespace: 'a  b'.split(/\s/) -> ['a', '', 'b']
// /\s+/ splits on consecutive whitespace: 'a  b'.split(/\s+/) -> ['a', 'b']
// WE USE /\s+/ for correct word counting

// GOTCHA: Empty string edge case
// ''.split(/\s+/) returns [''] (array with one empty string)
// Need explicit check: if (trimmed === '') return 0;

// GOTCHA: Whitespace-only string
// '   '.trim() returns ''
// '   '.split(/\s+/) returns ['', '']
// Our pattern handles this: trim first, then check for empty

// ============================================================
// COMPLETE TEST IMPLEMENTATION (Tasks 4-6)
// ============================================================

// src/utils/word-count.test.ts

import { describe, it, expect } from 'vitest';
import { countWords } from './word-count.js';

describe('countWords', () => {
  // Basic functionality tests
  describe('basic functionality', () => {
    it('should count words separated by single spaces', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('one two three four')).toBe(4);
    });

    it('should count a single word', () => {
      expect(countWords('hello')).toBe(1);
    });

    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(countWords('   ')).toBe(0);
      expect(countWords('\t\t\n')).toBe(0);
    });
  });

  // Edge case tests
  describe('edge cases', () => {
    it('should handle leading/trailing whitespace', () => {
      expect(countWords('  hello world  ')).toBe(2);
      expect(countWords('\thello world\n')).toBe(2);
      expect(countWords('   hello   ')).toBe(1);
    });

    it('should handle multiple consecutive spaces', () => {
      expect(countWords('hello    world')).toBe(2);
      expect(countWords('one  two   three    four')).toBe(4);
    });

    it('should handle tabs as delimiters', () => {
      expect(countWords('hello\tworld')).toBe(2);
      expect(countWords('one\t\ttwo')).toBe(2);
    });

    it('should handle newlines as delimiters', () => {
      expect(countWords('hello\nworld')).toBe(2);
      expect(countWords('one\n\ntwo')).toBe(2);
    });

    it('should handle mixed whitespace types', () => {
      expect(countWords('hello \t\nworld')).toBe(2);
      expect(countWords('one  \t\t two\n\n   three')).toBe(3);
    });

    it('should handle carriage returns', () => {
      expect(countWords('hello\r\nworld')).toBe(2);
      expect(countWords('one\r\rtwo')).toBe(2);
    });
  });

  // Real-world Markdown content tests
  describe('markdown content', () => {
    it('should count words in simple Markdown', () => {
      const content = '# Heading\n\nThis is a paragraph with words.';
      expect(countWords(content)).toBe(8);
    });

    it('should count words in code blocks (mechanical, not semantic)', () => {
      const content = '```javascript\nconst x = 1;\n```';
      // Mechanical count: const, x, =, 1
      expect(countWords(content)).toBe(4);
    });

    it('should handle large markdown content', () => {
      const content = '# Large Document\n\n' +
        'This is a large document with many words. '.repeat(50);
      // Each repetition has 8 words, plus heading (2 words) = 402 words
      expect(countWords(content)).toBe(402);
    });
  });

  // Performance tests
  describe('performance', () => {
    it('should handle very large strings efficiently', () => {
      const content = 'word '.repeat(10000); // 10000 words
      expect(countWords(content)).toBe(10000);
    });

    it('should handle string with many newlines', () => {
      const content = 'word\n'.repeat(1000); // 1000 words
      expect(countWords(content)).toBe(1000);
    });
  });
});

// ============================================================
// TEST PATTERN NOTES
// ============================================================

// PATTERN: Group related tests with nested describe()
// Helps organize tests by category (basic, edge cases, etc.)

// PATTERN: Use descriptive test names
// 'should count words separated by single spaces' clearly describes the test

// PATTERN: Test both positive and negative cases
// Test what should work AND what should fail

// PATTERN: Include real-world scenarios
// Test with actual Markdown content, not just synthetic cases

// PATTERN: Performance tests ensure efficiency
// Test with large strings to verify O(n) complexity

// GOTCHA: No mocking needed for pure functions
// countWords() has no dependencies, no I/O, no side effects
// Tests can call the function directly without vi.mock()
```

### Integration Points

```yaml
PACKAGE.JSON:
  - verified: "type": "module" enables ESM
  - verified: No new dependencies needed (uses built-in String methods)
  - verified: "scripts": { "test": "vitest run", "build": "tsup" }
  - no changes needed for this task

TSCONFIG.JSON:
  - verified: "strict": true for type safety
  - verified: "exclude": ["**/*.test.ts"] prevents test compilation
  - note: src/utils/word-count.test.ts will be handled by vitest
  - no changes needed for this task

TSUP.CONFIG.TS:
  - verified: entry: ['src/index.ts', 'src/executor.ts']
  - note: Word count utility will be imported by other modules
  - note: Will be included in build if bundled with consumer
  - no changes needed for this task

VITEST.CONFIG.TS:
  - verified: test.include: ['src/**/*.{test,spec}.{js,ts}']
  - note: src/utils/word-count.test.ts will be picked up automatically
  - no changes needed for this task

P2.M1.T1 (COMPLETED):
  - Config utility provides MDSEL_MIN_WORDS threshold
  - integration: countWords() result compared against config.minWords

P2.M2.T1 (FUTURE TASK):
  - PreToolUse hook script will use countWords() function
  - integration: Hook reads file content, calls countWords(), compares to threshold
  - Hook will be a bash script that may call the compiled Node.js module

BUILD OUTPUT:
  - npm run build will compile src/utils/word-count.ts to dist/utils/word-count.js
  - dist/utils/word-count.d.ts will contain type declarations
  - dist/utils/word-count.js will be ESM module with export
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing src/utils/word-count.ts implementation - fix before proceeding
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
# CLI dist/utils/word-count.js   0.60 KB
# CLI dist/utils/word-count.d.ts 0.30 KB
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/utils/word-count.js generated successfully
# - dist/utils/word-count.d.ts generated successfully
# - countWords function is exported in .d.ts file
# - Function signature is: countWords(content: string): number

# Verify generated type definitions:
cat dist/utils/word-count.d.ts

# Expected: Should contain countWords export
# export declare function countWords(content: string): number

# Verify ESM format in built output:
head -n 10 dist/utils/word-count.js

# Expected: Should be ESM format with export
# Should NOT have shebang (only index.js has shebang)

# If errors occur:
# - Check import paths (none needed for this pure utility)
# - Check function signature matches: countWords(content: string): number
# - Read TypeScript error messages carefully
# - Verify /\s+/ regex is correctly escaped

# Verify no linting errors (if linter is configured):
# (No linter configured in this project per package.json)
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test word count implementation
npm test word-count

# Expected Output:
# > mdsel-claude@1.0.0 test
# > vitest run
#
# ✓ src/utils/word-count.test.ts (15)
#   ✓ countWords
#     ✓ basic functionality
#       ✓ should count words separated by single spaces
#       ✓ should count a single word
#       ✓ should return 0 for empty string
#       ✓ should return 0 for whitespace-only string
#     ✓ edge cases
#       ✓ should handle leading/trailing whitespace
#       ✓ should handle multiple consecutive spaces
#       ✓ should handle tabs as delimiters
#       ✓ should handle newlines as delimiters
#       ✓ should handle mixed whitespace types
#       ✓ should handle carriage returns
#     ✓ markdown content
#       ✓ should count words in simple Markdown
#       ✓ should count words in code blocks
#       ✓ should handle large markdown content
#     ✓ performance
#       ✓ should handle very large strings efficiently
#       ✓ should handle string with many newlines
#
# Test Files  1 passed (1)
# Tests  15 passed (15)

# Full test suite:
npm test

# Expected: All tests pass, including word count tests

# If tests fail:
# - Check split() uses /\s+/ regex
# - Check trim() is called before split()
# - Check empty string case is handled
# - Check filter() removes empty strings
# - Verify return type is number

# Debug failing tests:
npm test word-count -- --reporter=verbose

# Watch mode for iterative development:
npm test -- --watch word-count
```

### Level 3: Integration Testing (System Validation)

```bash
# Test countWords function directly in Node.js
node -e "
import { countWords } from './dist/utils/word-count.js';

// Basic test
console.log('Basic test:', countWords('hello world')); // Expected: 2

// Empty string test
console.log('Empty string:', countWords('')); // Expected: 0

// Whitespace test
console.log('Whitespace only:', countWords('   ')); // Expected: 0

// Leading/trailing whitespace
console.log('Trim test:', countWords('  hello world  ')); // Expected: 2

// Multiple spaces
console.log('Multiple spaces:', countWords('hello    world')); // Expected: 2

// Tabs and newlines
console.log('Mixed whitespace:', countWords('hello \t\nworld')); // Expected: 2

// Markdown content
const markdown = '# Heading\n\nThis is a paragraph.';
console.log('Markdown:', countWords(markdown)); // Expected: 6
"

# Expected output:
# Basic test: 2
# Empty string: 0
# Whitespace only: 0
# Trim test: 2
# Multiple spaces: 2
# Mixed whitespace: 2
# Markdown: 6

# Test with large content (performance validation):
node -e "
import { countWords } from './dist/utils/word-count.js';
const large = 'word '.repeat(10000);
console.log('Large content:', countWords(large)); // Expected: 10000
console.log('Time: large content handled');
"

# Expected output:
# Large content: 10000
# Time: large content handled

# Test integration with config utility:
node -e "
import { countWords } from './dist/utils/word-count.js';
import { loadConfig } from './dist/utils/config.js';

const content = 'This is a test document with some words in it.';
const wordCount = countWords(content);
const threshold = loadConfig().minWords;

console.log('Word count:', wordCount);
console.log('Threshold:', threshold);
console.log('Should show reminder:', wordCount > threshold);
"

# Expected output (with default threshold of 200):
# Word count: 10
# Threshold: 200
# Should show reminder: false

# If integration tests fail:
# - Verify build completed successfully
# - Check dist/utils/word-count.js exists
# - Verify ESM format is correct
# - Check function is exported correctly

# Verify word count matches wc -w behavior for comparison:
echo "hello world this is a test" > /tmp/test.txt
wc -w /tmp/test.txt
node -e "import { countWords } from './dist/utils/word-count.js'; console.log(countWords('hello world this is a test'));"

# Both should show 6 (or close - wc may have slight differences)
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check countWords function is exported:
grep -n "export function countWords" src/utils/word-count.ts

# Expected: export function countWords(content: string): number {

# 2. Check /\s+/ regex is used:
grep -n "\\\\s+" src/utils/word-count.ts

# Expected: .split(/\s+/)

# 3. Check trim() is called:
grep -n "\.trim()" src/utils/word-count.ts

# Expected: const trimmed = content.trim();

# 4. Check empty string handling:
grep -n "=== ''" src/utils/word-count.ts

# Expected: if (trimmed === '') return 0;

# 5. Check filter() is used:
grep -n "\.filter" src/utils/word-count.ts

# Expected: .filter(token => token.length > 0)

# 6. Check JSDoc comments present:
grep -n "/\*\*" src/utils/word-count.ts | head -1

# Expected: JSDoc comment block at top of file

# 7. Check return type annotation:
grep -n ": number" src/utils/word-count.ts

# Expected: export function countWords(content: string): number

# 8. Check test file uses .js extension in import:
grep -n "from.*word-count.js" src/utils/word-count.test.ts

# Expected: import { countWords } from './word-count.js';

# 9. Check tests cover edge cases:
grep -c "it(" src/utils/word-count.test.ts

# Expected: At least 10 test cases

# 10. Verify no external dependencies:
grep -n "^import" src/utils/word-count.ts

# Expected: No imports (or only for JSDoc types if needed)

# 11. Check function is pure (no side effects):
# Verify no process.env access:
grep -n "process\.env" src/utils/word-count.ts

# Expected: No results (function should not use process.env)

# Verify no file I/O:
grep -n "readFile\|writeFile\|fs\." src/utils/word-count.ts

# Expected: No results (function should not do file I/O)

# 12. Performance validation (optional):
# Test with very large string to ensure O(n) performance
npm test -- --grep "performance"
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/utils/word-count.js and dist/utils/word-count.d.ts generated successfully
- [ ] countWords function exported with correct signature: `(content: string): number`
- [ ] Level 2 validation passed: `npm test word-count` shows all tests passing
- [ ] Tests cover basic functionality and edge cases
- [ ] Level 3 validation passed: Real Node.js can import and use function
- [ ] Empty string returns 0
- [ ] Whitespace-only strings return 0
- [ ] Leading/trailing whitespace handled correctly
- [ ] Multiple consecutive whitespace handled correctly
- [ ] Tabs and newlines handled as delimiters
- [ ] Large content processed efficiently

### Feature Validation

- [ ] Function signature matches specification: `countWords(content: string): number`
- [ ] Uses `/\s+/` regex pattern for splitting
- [ ] Calls `trim()` before split
- [ ] Handles empty string case (returns 0)
- [ ] Filters empty strings from result
- [ ] Pure function (no side effects, no I/O, no global state)
- [ ] Synchronous (no async/await, no Promises)
- [ ] JSDoc comments present with examples
- [ ] Returns number type (not string, not object)
- [ ] No external dependencies used

### Code Quality Validation

- [ ] JSDoc comments present on function
- [ ] Function is pure (no side effects, no async)
- [ ] No external dependencies (only built-in String methods)
- [ ] Follows TypeScript strict mode requirements
- [ ] Test file uses Vitest patterns matching other tests
- [ ] Test cases cover happy path and edge cases
- [ ] Code follows existing codebase style (matches config.ts pattern)
- [ ] File naming uses kebab-case: word-count.ts
- [ ] Export pattern matches existing utilities
- [ ] No mocking required in tests (pure function)

### Integration Readiness

- [ ] countWords can be imported by PreToolUse hook in P2.M2.T1
- [ ] Function signature meets P2.M2.T1 requirements
- [ ] No dependencies on P2.M2 components (foundational module)
- [ ] Compatible with config utility from P2.M1.T1
- [ ] Test coverage sufficient for regression prevention
- [ ] Performance acceptable for large files (O(n) complexity)
- [ ] Returns numeric value comparable with config.minWords threshold

---

## Anti-Patterns to Avoid

- [ ] Don't use `/\s/` instead of `/\s+/` - the single `+` is critical for handling multiple consecutive whitespace
- [ ] Don't forget to `trim()` before split - otherwise you get empty strings at boundaries
- [ ] Don't skip the empty string check - `''.split(/\s+/)` returns `['']`, not `[]`
- [ ] Don't make it async - this is a simple synchronous utility
- [ ] Don't add external dependencies - built-in String methods are sufficient
- [ ] Don't read from process.env - threshold is handled by config utility (P2.M1.T1)
- [ ] Don't do file I/O - content is passed as parameter, not read by this function
- [ ] Don't use camelCase for file name - use `word-count.ts` not `wordCount.ts`
- [ ] Don't forget `.filter()` - ensures no empty strings in final count
- [ ] Don't over-engineer - this is mechanical counting, not NLP or semantic analysis
- [ ] Don't cache results - function should be pure and recompute each time
- [ ] Don't add options/config parameters - keep it simple: string in, number out
- [ ] Don't use global `isNaN()` - not needed for this implementation (no parseInt)
- [ ] Don't throw exceptions - handle all inputs gracefully (empty strings, etc.)

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete implementation pattern with exact code structure
- Research-backed best practices for word counting
- Comprehensive testing pattern with all edge cases covered
- All gotchas documented with correct/incorrect examples
- Integration points clearly defined with config utility (P2.M1.T1) and hook script (P2.M2.T1)
- Validation gates are deterministic and checkable
- Pure function design with no external dependencies
- No complex state management or async operations

**Expected Implementation Time**: ~15-20 minutes for a developer familiar with TypeScript

**Risk Factors**:
- Regex escaping (mitigated: exact pattern provided)
- Empty string edge case (mitigated: explicit check documented)
- ESM .js extension requirement (mitigated: examples use correct pattern)

**Post-Implementation**:
- Word count utility will be ready for P2.M2.T1 (PreToolUse hook script)
- Enables behavioral conditioning system for Markdown file access
- Provides deterministic word counts matching `wc -w` behavior
- Test coverage ensures regression prevention
- Performance validated for large files (O(n) complexity)
