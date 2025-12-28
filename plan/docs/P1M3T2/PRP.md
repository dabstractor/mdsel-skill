# Product Requirement Prompt (PRP): Implement mdsel_select Tool

**Task ID**: P1.M3.T2
**Work Item**: Implement mdsel_select Tool
**Status**: Ready for Implementation
**Confidence Score**: 10/10 for one-pass implementation success

---

## Goal

**Feature Goal**: Create the `mdsel_select` MCP tool handler that retrieves specific content from Markdown documents using declarative selectors by calling the mdsel CLI's `select` command and returning JSON output verbatim.

**Deliverable**: A fully tested `mdsel-select.ts` tool handler with:

- Zod input schema defining `selector` (string) and `files` (string[]) parameters
- `handleMdselSelect()` function that calls `execMdsel(['select', selector, ...files])`
- Verbatim output passthrough (no JSON parsing, no error transformation)
- Comprehensive test suite in `tests/tools/mdsel-select.test.ts`

**Success Definition**:

- All TypeScript types compile with zero errors (`npm run type-check`)
- All tests pass with comprehensive coverage (`npm test -- tests/tools/mdsel-select.test.ts`)
- Handler correctly calls mdsel CLI with `select` command
- Returns MCP tool response format with `content: [{type: 'text', text: string}]`
- Exit code 0 -> `isError: false`, non-zero -> `isError: true`
- stdout returned verbatim (no transformation, no parsing)

---

## Why

- **Completes P1.M3**: Together with `mdsel_index`, forms the complete MCP tool surface (exactly 2 tools per PRD)
- **Core Functionality**: Enables Claude to retrieve specific Markdown sections using semantic selectors
- **Follows Established Pattern**: Leverages existing `mdsel_index` implementation (P1.M3.T1) as exact reference
- **Depends on P1.M2**: Uses `execMdsel` function from `src/lib/mdsel-cli.ts` for CLI execution
- **Behavioral Enforcement**: Tool description conditions Claude to use selector-based access instead of Read tool for large Markdown files

---

## What

Create the mdsel_select MCP tool handler across three subtasks:

### P1.M3.T2.S1: Define mdsel_select Input Schema (0.5 points)

Create `src/tools/mdsel-select.ts` with:

- Zod schema defining `selector` (string) - required parameter
- Zod schema defining `files` (array of strings) - required parameter
- Export `MDSEL_SELECT_INPUT_SCHEMA` (raw shape for MCP SDK)
- Export `MdselSelectInput` type (inferred from schema)
- Include descriptive `.describe()` text for MCP documentation

### P1.M3.T2.S2: Implement handleMdselSelect Function (1 point)

In `src/tools/mdsel-select.ts`:

- Import `execMdsel` from `../lib/mdsel-cli.js`
- Import `CallToolResult` type (or define inline interface)
- Implement `handleMdselSelect(args: MdselSelectInput): Promise<CallToolResult>`
- Call `execMdsel(['select', args.selector, ...args.files])`
- Return MCP response: `{ content: [{ type: 'text', text: result.stdout }], isError: !result.success }`
- Does NOT parse or transform output (verbatim passthrough per PRD Section 8)

### P1.M3.T2.S3: Write Tests for mdsel_select Handler (1 point)

Create `tests/tools/mdsel-select.test.ts` with:

- Mock `node:child_process` module with `vi.mock()` at top level
- Test successful select with valid selector
- Test select with multiple files
- Test failed select (non-zero exit code, invalid selector)
- Test ENOENT error (mdsel not found)
- Test verbatim passthrough (malformed output returned as-is)
- Test MCP response format compliance
- Test various selector patterns (heading:h1[0], section[1]?full=true, etc.)
- Reset mocks in beforeEach
- Use vitest with globals enabled

### Success Criteria

- [ ] `src/tools/mdsel-select.ts` created with schema and handler
- [ ] `mdselSelectInputSchema` defines `selector` (string) and `files` (string[])
- [ ] `MDSEL_SELECT_INPUT_SCHEMA` exported for MCP SDK
- [ ] `MdselSelectInput` type exported
- [ ] `handleMdselSelect` function implemented
- [ ] `tests/tools/mdsel-select.test.ts` has comprehensive test coverage
- [ ] `npm run type-check` completes with zero errors
- [ ] `npm test -- tests/tools/mdsel-select.test.ts` passes all tests
- [ ] Handler uses `execMdsel(['select', selector, ...files])`
- [ ] Output returned verbatim (no JSON parsing)
- [ ] MCP response format correct: `{ content: [{ type: 'text', text }], isError }`

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: Yes - this PRP provides:

- Exact mdsel CLI `select` command interface and JSON output format
- Complete reference implementation from `mdsel_index` (P1.M3.T1)
- Complete Zod schema patterns with ready-to-use code
- Complete handler implementation pattern with full working example
- Vitest mocking patterns with complete test examples
- Project-specific validation commands
- All critical gotchas with specific anti-patterns to avoid

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: /home/dustin/projects/mdsel-claude-glm/src/tools/mdsel-index.ts
  why: Exact reference implementation for mdsel_index - follow this pattern identically
  pattern: Zod schema definition, handler function, MCP response format
  gotcha: The only difference is the input schema (selector+files vs files) and command (select vs index)

- file: /home/dustin/projects/mdsel-claude-glm/tests/tools/mdsel-index.test.ts
  why: Exact reference implementation for tool handler tests
  pattern: vi.mock() setup, beforeEach reset, mock process creation, test categories
  gotcha: Follow the same test structure but with select-specific test cases

- file: /home/dustin/projects/mdsel-claude-glm/src/lib/mdsel-cli.ts
  why: The execMdsel function that handleMdselSelect calls
  pattern: const result = await execMdsel(['select', selector, ...files])
  gotcha: No --json flag needed for select command (mdsel outputs JSON by default)

- file: /home/dustin/projects/mdsel-claude-glm/src/types.ts
  why: Type definitions for MdselResult returned by execMdsel
  pattern: MdselResult interface (success, stdout, stderr, exitCode)
  gotcha: Use for typing only - do NOT parse stdout based on these types (verbatim passthrough)

- file: /home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/tool_definitions.md
  why: Official MCP tool definition for mdsel_select
  pattern: Input schema, tool description format, handler signature
  section: "Tool 2: mdsel_select" (lines 58-101)

- file: /home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/external_deps.md
  why: Complete mdsel CLI reference for select command
  pattern: Command syntax: mdsel select [options] <selector> [files...]
  gotcha: Selector grammar: [namespace::]type[index][/path]?query

- file: /home/dustin/projects/mdsel-claude-glm/vitest.config.ts
  why: Project's vitest configuration
  pattern: globals: true, environment: 'node'
  gotcha: Tests use describe/it/expect without imports (globals enabled)

- file: /home/dustin/projects/mdsel-claude-glm/package.json
  why: Project dependencies
  pattern: zod is already available as dependency
  gotcha: No new dependencies needed for this task

- file: /home/dustin/projects/mdsel-claude-glm/plan/docs/P1M2T1/PRP.md
  why: PRP for mdsel CLI executor - explains execMdsel function behavior
  pattern: execMdsel signature, return type, error handling
  section: Implementation Blueprint

- url: https://zod.dev/
  why: Zod documentation for schema validation
  critical: .describe() method adds documentation for MCP tool schemas
  section: "Object schemas" - z.object(), .array(), .string(), .describe()
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm
├── src/
│   ├── index.ts               # Placeholder (MCP server entry - P1.M4)
│   ├── types.ts               # Type definitions (MdselResult, etc.)
│   ├── tools/
│   │   ├── mdsel-index.ts     # REFERENCE: Existing mdsel_index handler
│   │   └── mdsel-select.ts    # CREATE IN THIS TASK
│   └── lib/
│       └── mdsel-cli.ts       # execMdsel function (dependency)
├── tests/
│   ├── tools/
│   │   ├── mdsel-index.test.ts    # REFERENCE: Existing tests
│   │   └── mdsel-select.test.ts   # CREATE IN THIS TASK
│   └── lib/
│       └── mdsel-cli.test.ts      # CLI executor tests
├── dist/                      # Build output (generated by tsup)
├── plan/
│   ├── docs/                  # Architecture docs
│   └── P1M3T2/                # THIS TASK WORKSPACE
│       └── PRP.md             # THIS FILE
├── package.json               # zod already in dependencies
├── vitest.config.ts           # Test configuration
├── tsup.config.ts             # Build configuration
└── tasks.json                 # Task tracking
```

### Desired Codebase Tree (After Implementation)

```bash
/home/dustin/projects/mdsel-claude-glm
├── src/
│   ├── index.ts               # (unchanged)
│   ├── types.ts               # (unchanged)
│   ├── tools/
│   │   ├── mdsel-index.ts     # (unchanged)
│   │   └── mdsel-select.ts    # NEW: Schema + handler
│   └── lib/
│       └── mdsel-cli.ts       # (unchanged)
├── tests/
│   ├── tools/
│   │   ├── mdsel-index.test.ts    # (unchanged)
│   │   └── mdsel-select.test.ts   # NEW: Comprehensive tests
│   └── lib/
│       └── mdsel-cli.test.ts      # (unchanged)
├── dist/                      # Generated: tools/mdsel-select.js, tools/mdsel-select.d.ts
└── ... (other files unchanged)
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Follow mdsel_index.ts pattern EXACTLY
// The only differences are:
// 1. Schema has 'selector' parameter (string)
// 2. Command is 'select' not 'index'
// Everything else is identical

// CRITICAL: No --json flag needed for select command
// ❌ WRONG: execMdsel(['select', selector, ...files, '--json'])
// ✅ CORRECT: execMdsel(['select', selector, ...files])
// Note: mdsel select outputs JSON by default (unlike index which may vary)

// CRITICAL: Selector is the FIRST argument after 'select'
// Command: mdsel select <selector> [files...]
// ❌ WRONG: execMdsel(['select', ...files, selector])
// ✅ CORRECT: execMdsel(['select', selector, ...files])

// CRITICAL: Output must be returned VERBATIM per PRD Section 8
// ❌ WRONG: return { content: [{ type: 'text', text: JSON.parse(result.stdout) }] }
// ✅ CORRECT: return { content: [{ type: 'text', text: result.stdout }], isError: !result.success }

// CRITICAL: Success is based on exit code, not JSON parsing
// isError: !result.success (where result.success = exitCode === 0)

// CRITICAL: ESM imports require .js extensions
// ❌ WRONG: import { execMdsel } from '../lib/mdsel-cli'
// ✅ CORRECT: import { execMdsel } from '../lib/mdsel-cli.js'

// CRITICAL: Type imports separate from value imports
// ✅ CORRECT: import type { MdselResult } from '../types.js'

// CRITICAL: Use Zod for schema validation and documentation
// .describe() text becomes MCP tool parameter documentation

// CRITICAL: MCP response format is exact
// { content: Array<{type: 'text', text: string}>, isError?: boolean }

// CRITICAL: Vitest requires vi.mock() at top level, not in test functions

// CRITICAL: Always reset mocks in beforeEach

// CRITICAL: mdsel select selector grammar
// [namespace::]type[index][/path]?query
// Examples: heading:h1[0], readme::section[1]?full=true, block:code[0]

// CRITICAL: This is a THIN ADAPTER - no selector validation logic
// Pass selector directly to mdsel, let mdsel handle validation
```

---

## Implementation Blueprint

### Data Models and Structure

**Zod Schema for mdsel_select:**

```typescript
// src/tools/mdsel-select.ts

import { execMdsel } from '../lib/mdsel-cli.js';
import type { MdselResult } from '../types.js';
import { z } from 'zod';

/**
 * Input schema for mdsel_select tool
 * Uses Zod for runtime validation and MCP documentation
 */
export const mdselSelectInputSchema = z.object({
  selector: z
    .string()
    .describe("Selector string (e.g., 'heading:h2[0]', 'readme::section[1]?full=true')"),
  files: z
    .array(z.string())
    .describe('Array of absolute file paths to Markdown documents to search'),
});

/**
 * Raw schema shape for MCP SDK (without .parse() method)
 */
export const MDSEL_SELECT_INPUT_SCHEMA = mdselSelectInputSchema.shape;

/**
 * Type extracted from schema (for TypeScript typing)
 */
export type MdselSelectInput = z.infer<typeof mdselSelectInputSchema>;

/**
 * MCP Tool Result type (from SDK)
 */
interface CallToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/tools/mdsel-select.ts
  - IMPLEMENT: mdselSelectInputSchema with Zod
  - IMPLEMENT: MDSEL_SELECT_INPUT_SCHEMA (raw shape export)
  - IMPLEMENT: MdselSelectInput type (inferred from schema)
  - IMPLEMENT: handleMdselSelect function
  - FUNCTION SIGNATURE: export async function handleMdselSelect(args: MdselSelectInput): Promise<CallToolResult>
  - IMPORT: import { execMdsel } from '../lib/mdsel-cli.js'
  - IMPORT: import type { MdselResult } from '../types.js'
  - IMPORT: import { z } from 'zod'
  - CLI CALL: execMdsel(['select', args.selector, ...args.files])
  - RETURN: { content: [{ type: 'text', text: result.stdout }], isError: !result.success }
  - PATTERN: Follow /home/dustin/projects/mdsel-claude-glm/src/tools/mdsel-index.ts EXACTLY
  - DIFFERENCES:
    * Schema has 'selector' field (string) in addition to 'files'
    * Command is 'select' not 'index'
    * No --json flag (select outputs JSON by default)
  - NAMING: kebab-case file name, camelCase for function/variables, PascalCase for types
  - PLACEMENT: src/tools/mdsel-select.ts (new file)
  - VALIDATION: npm run type-check - must complete with zero errors

Task 2: CREATE tests/tools/mdsel-select.test.ts
  - IMPLEMENT: Comprehensive test suite with vi.mock()
  - MOCK: vi.mock('node:child_process', () => ({ spawn: vi.fn() }))
  - BEFORE_EACH: vi.clearAllMocks() or mockSpawn.mockClear()
  - TEST CASES:
    * Successful select with single selector (exit code 0)
    * Successful select with multiple files
    * Select with complex selector (namespace::type[index]/path?query)
    * Failed select - invalid selector (non-zero exit code)
    * Failed select - file not found
    * ENOENT error (mdsel not found)
    * Verbatim passthrough (malformed JSON returned as-is)
    * MCP response format compliance
    * Select with full=true query parameter
    * Empty result (no matches found)
  - PATTERN: Follow /home/dustin/projects/mdsel-claude-glm/tests/tools/mdsel-index.test.ts EXACTLY
  - ASSERTIONS: expect().toBe(), expect().toHaveProperty(), expect().toHaveLength()
  - MOCK SPAWN: Verify spawn called with '/home/dustin/.local/bin/mdsel', ['select', selector, ...files]
  - PLACEMENT: tests/tools/mdsel-select.test.ts (new file)
  - DEPENDENCIES: Requires mdsel-select.ts from Task 1
  - VALIDATION: npm test -- tests/tools/mdsel-select.test.ts - all tests must pass
```

### Implementation Patterns & Key Details

````typescript
// ==================== src/tools/mdsel-select.ts ====================
// Complete implementation following mdsel-index.ts pattern

import { execMdsel } from '../lib/mdsel-cli.js';
import type { MdselResult } from '../types.js';
import { z } from 'zod';

/**
 * Input schema for mdsel_select tool
 * Uses Zod for runtime validation and MCP documentation
 */
export const mdselSelectInputSchema = z.object({
  selector: z
    .string()
    .describe("Selector string (e.g., 'heading:h2[0]', 'readme::section[1]?full=true')"),
  files: z
    .array(z.string())
    .describe('Array of absolute file paths to Markdown documents to search'),
});

/**
 * Raw schema shape for MCP SDK (without .parse() method)
 */
export const MDSEL_SELECT_INPUT_SCHEMA = mdselSelectInputSchema.shape;

/**
 * Type extracted from schema (for TypeScript typing)
 */
export type MdselSelectInput = z.infer<typeof mdselSelectInputSchema>;

/**
 * MCP Tool Result type (from SDK)
 */
interface CallToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Handle mdsel_select tool call
 *
 * Retrieves specific content from Markdown documents using declarative selectors.
 * Returns JSON from mdsel verbatim - no parsing or transformation.
 *
 * @param args - Tool arguments containing selector and files array
 * @returns MCP tool response with verbatim mdsel output
 *
 * @example
 * ```ts
 * const result = await handleMdselSelect({
 *   selector: 'heading:h1[0]',
 *   files: ['/path/to/README.md']
 * });
 * // result.content[0].text contains JSON from mdsel
 * ```
 */
export async function handleMdselSelect(args: {
  selector: string;
  files: string[];
}): Promise<CallToolResult> {
  // Call mdsel CLI with select command
  // Note: selector comes first, then files
  // No --json flag needed (select outputs JSON by default)
  const result: MdselResult = await execMdsel(['select', args.selector, ...args.files]);

  // Return verbatim output in MCP format
  // CRITICAL: No parsing, no transformation, just passthrough
  return {
    content: [
      {
        type: 'text',
        text: result.stdout, // Raw mdsel output
      },
    ],
    isError: !result.success,
  };
}
````

### Test Implementation Pattern

````typescript
// ==================== tests/tools/mdsel-select.test.ts ====================

import { beforeEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { handleMdselSelect } from '../../src/tools/mdsel-select.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('handleMdselSelect', () => {
  let mockSpawn: ReturnType<typeof vi.mocked<typeof spawn>>;

  beforeEach(() => {
    // CRITICAL: Reset mocks before each test
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockClear();
  });

  // Helper function to create a mock process
  function createMockProcess(stdoutData = '', stderrData = '', exitCode = 0) {
    const mockProcess = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn(),
      killed: false,
    };

    // Simulate stdout data event
    mockProcess.stdout.on.mockImplementation((event, handler) => {
      if (event === 'data') {
        handler(Buffer.from(stdoutData));
      }
    });

    // Simulate stderr data event
    mockProcess.stderr.on.mockImplementation((event, handler) => {
      if (event === 'data') {
        handler(Buffer.from(stderrData));
      }
    });

    // Simulate close event with exit code
    mockProcess.on.mockImplementation((event, handler) => {
      if (event === 'close') {
        (handler as (code: number) => void)(exitCode);
      }
    });

    return mockProcess;
  }

  describe('successful execution', () => {
    it('should select content with simple heading selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          command: 'select',
          timestamp: '2025-12-28T00:10:30.065Z',
          data: {
            matches: [
              {
                selector: 'heading:h1[0]',
                type: 'heading',
                content: '# Introduction',
                truncated: false,
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('matches');
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'heading:h1[0]', 'README.md'],
        expect.any(Object)
      );
    });

    it('should select content with namespace-qualified selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          command: 'select',
          data: {
            matches: [{ selector: 'readme::heading:h2[0]', content: '## Features' }],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'readme::heading:h2[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'readme::heading:h2[0]', 'README.md'],
        expect.any(Object)
      );
    });

    it('should select content from multiple files', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: { matches: [], unresolved: [] },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[0]',
        files: ['README.md', 'CONTRIBUTING.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'section[0]', 'README.md', 'CONTRIBUTING.md'],
        expect.any(Object)
      );
    });

    it('should handle selector with full=true query parameter', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: {
            matches: [
              {
                selector: 'section[1]?full=true',
                content: 'Full section content...',
                truncated: false,
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[1]?full=true',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'section[1]?full=true', 'README.md'],
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should return isError: true on invalid selector', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error: Invalid selector syntax', 1);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid:::syntax',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should return isError: true when file not found', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error: Cannot read file: /path/to/missing.md', 2);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['/path/to/missing.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should handle ENOENT error (mdsel not found)', async () => {
      // Arrange
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });
  });

  describe('verbatim passthrough', () => {
    it('should not parse or transform output', async () => {
      // Arrange
      const malformedOutput = '{invalid json output}';
      const mockProcess = createMockProcess(malformedOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert: CRITICAL - Return malformed output verbatim
      expect(result.content[0].text).toBe(malformedOutput);
      expect(result.isError).toBe(false); // Success based on exit code
    });

    it('should preserve multi-line JSON output', async () => {
      // Arrange
      const multiLineOutput = `{
  "success": true,
  "command": "select",
  "data": {
    "matches": [
      {
        "selector": "heading:h1[0]",
        "content": "# Title\\n\\nContent here"
      }
    ]
  }
}`;
      const mockProcess = createMockProcess(multiLineOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(multiLineOutput);
    });
  });

  describe('MCP response format', () => {
    it('should return correct MCP tool response format', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"success":true}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('isError');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.isError).toBe('boolean');
    });

    it('should have isError: false on successful select', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"matches":[]}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
    });

    it('should have isError: true on failed select', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error message', 1);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid[999]',
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty matches array', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: { matches: [], unresolved: ['heading:h99[0]'] },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h99[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('matches');
    });

    it('should handle complex nested selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: {
            matches: [
              {
                selector: 'readme::heading:h1[0]/block:code[0]',
                content: '```typescript\\ncode here\\n```',
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'readme::heading:h1[0]/block:code[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'readme::heading:h1[0]/block:code[0]', 'README.md'],
        expect.any(Object)
      );
    });
  });
});
````

### Integration Points

```yaml
MDSEL_CLI_EXECUTOR:
  - file: src/lib/mdsel-cli.ts
  - imports: import { execMdsel } from '../lib/mdsel-cli.js'
  - usage: const result = await execMdsel(['select', args.selector, ...args.files])
  - returns: MdselResult { success, stdout, stderr, exitCode }

TYPE_DEFINITIONS:
  - file: src/types.ts
  - imports: import type { MdselResult } from '../types.js'
  - usage: Type annotation for execMdsel return value

MCP_SERVER (Future - P1.M4):
  - will_import: { handleMdselSelect, mdselSelectInputSchema } from './tools/mdsel-select.js'
  - will_register: Tool with MCP SDK using schema and handler

BUILD_SYSTEM:
  - command: npm run build
  - tool: tsup bundles TypeScript to ESM
  - output: dist/tools/mdsel-select.js, dist/tools/mdsel-select.d.ts

TEST_FRAMEWORK:
  - command: npm test -- tests/tools/mdsel-select.test.ts
  - tool: vitest with mocked child_process
  - coverage: All success, error, and edge cases

RELATED_TOOL:
  - file: src/tools/mdsel-index.ts
  - pattern: Follow this implementation EXACTLY
  - differences: Schema has 'selector' field, command is 'select'
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding

# After src/tools/mdsel-select.ts creation
npm run type-check
# Expected: Zero type errors
# If errors: Check TypeScript syntax, verify imports use .js extensions, verify zod usage

# After tests/tools/mdsel-select.test.ts creation
npm run type-check
# Expected: Zero type errors
# If errors: Check test imports, verify mock setup

# FINAL: Project-wide validation
npm run type-check
# Expected: Zero errors across entire project
# If errors: Read output and fix before proceeding to Level 2
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the mdsel_select handler specifically
npm test -- tests/tools/mdsel-select.test.ts --run
# Expected: All tests pass with comprehensive coverage
# If failing: Debug mock setup, check handler implementation, verify spawn call arguments

# Run with coverage reporting
npm test -- tests/tools/mdsel-select.test.ts --coverage
# Expected: High coverage percentage for mdsel-select.ts
# Verify: All success paths, error paths, and edge cases covered

# Full test suite (both tool tests should pass)
npm test -- tests/tools/ --run
# Expected: mdsel-index.test.ts AND mdsel-select.test.ts both pass
# Verify: No regressions in existing mdsel_index tests

# Full project test suite
npm test -- --run
# Expected: All tests pass (mdsel-cli, mdsel-index, mdsel-select)
```

### Level 3: Integration Testing (System Validation)

```bash
# Build validation
npm run build
# Expected: dist/tools/mdsel-select.js and dist/tools/mdsel-select.d.ts created
# Verify: Output files exist and contain handleMdselSelect function

# Check both tool handlers are built
ls -la dist/tools/
# Expected: mdsel-index.js, mdsel-index.d.ts, mdsel-select.js, mdsel-select.d.ts
# Verify: Both tool handlers present in build output

# Type declaration validation
cat dist/tools/mdsel-select.d.ts
# Expected: Contains exported types (MdselSelectInput, handleMdselSelect, MDSEL_SELECT_INPUT_SCHEMA)
# Verify: Type declarations are generated correctly

# Compare with reference implementation
diff -u <(grep 'export' dist/tools/mdsel-index.d.ts) <(grep 'export' dist/tools/mdsel-select.d.ts) || true
# Expected: Similar exports (schema shape, input type, handler function)
# Verify: Exports follow same pattern as mdsel_index

# Build output format validation
head -n 20 dist/tools/mdsel-select.js
# Expected: ESM format with proper imports
# Verify: File is valid JavaScript (ESM)
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Verbatim Passthrough Validation
# Verify output is NOT modified
grep -n "JSON.parse" dist/tools/mdsel-select.js
# Expected: NO occurrences of JSON.parse
# Verify: No JSON parsing in implementation

# Command Construction Validation
# Verify select command is built correctly
grep -n "'select'" dist/tools/mdsel-select.js
# Expected: Command array starts with 'select'
# Verify: Correct command name used

# Selector Position Validation
# Verify selector comes before files in command array
grep -A 5 "execMdsel" dist/tools/mdsel-select.js | grep "select"
# Expected: Pattern shows ['select', selector, ...files]
# Verify: Selector is second argument (first after 'select')

# No JSON Flag Validation
# Verify no --json flag is added to select command
grep -n "'--json'" dist/tools/mdsel-select.js
# Expected: NO occurrences of '--json' flag
# Verify: Select command uses default JSON output

# Schema Export Validation
# Verify all required exports are present
grep -E "^export" dist/tools/mdsel-select.d.ts
# Expected: mdselSelectInputSchema, MDSEL_SELECT_INPUT_SCHEMA, MdselSelectInput, handleMdselSelect
# Verify: All exports present for MCP SDK integration

# Import Path Validation (in test file)
# Verify test imports use correct paths
grep "import from" tests/tools/mdsel-select.test.ts
# Expected: import from '../../src/tools/mdsel-select.js'
# Verify: Relative imports use .js extension

# Pattern Consistency Validation
# Compare structure with mdsel_index
echo "=== mdsel-index exports ===" && grep "^export" src/tools/mdsel-index.ts
echo "=== mdsel-select exports ===" && grep "^export" src/tools/mdsel-select.ts
# Expected: Similar export patterns (schema, shape, type, handler)
# Verify: Consistent structure across both tool handlers
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run type-check` completes with zero type errors
- [ ] `npm test -- tests/tools/mdsel-select.test.ts` passes all tests
- [ ] `npm test -- tests/tools/` passes (both mdsel-index and mdsel-select tests)
- [ ] `npm run build` creates dist/tools/mdsel-select.js and dist/tools/mdsel-select.d.ts

### Feature Validation

- [ ] All success criteria from "What" section met
- [ ] `src/tools/mdsel-select.ts` exists with all required exports
- [ ] `mdselSelectInputSchema` defines `selector` (string) and `files` (string[])
- [ ] `MDSEL_SELECT_INPUT_SCHEMA` exported (raw shape for MCP SDK)
- [ ] `MdselSelectInput` type exported (inferred from schema)
- [ ] `handleMdselSelect` function implemented
- [ ] `tests/tools/mdsel-select.test.ts` has comprehensive test coverage
- [ ] Handler calls `execMdsel(['select', selector, ...files])`
- [ ] Selector is first argument after 'select' command
- [ ] No --json flag added to select command
- [ ] Output returned verbatim (no JSON parsing)
- [ ] MCP response format correct: `{ content: [{ type: 'text', text }], isError }`

### Code Quality Validation

- [ ] Follows mdsel_index.ts pattern identically
- [ ] File placement matches desired codebase tree structure
- [ ] Imports use `.js` extensions (even for `.ts` files)
- [ ] Type imports separate from value imports
- [ ] Zod schema includes `.describe()` for MCP documentation
- [ ] Mocks are reset in beforeEach in tests
- [ ] `vi.mock()` is at top level, not inside test functions
- [ ] Code is self-documenting with clear variable/function names

### Documentation & Deployment

- [ ] Handler has JSDoc comment describing usage
- [ ] Schema `.describe()` text is clear and actionable
- [ ] Test cases cover realistic selector patterns
- [ ] Edge cases are tested (empty results, complex selectors, errors)

---

## Anti-Patterns to Avoid

- ❌ Don't deviate from mdsel_index.ts pattern - follow it exactly
- ❌ Don't parse JSON output - return verbatim per PRD Section 8
- ❌ Don't validate selector syntax - pass to mdsel as-is
- ❌ Don't add --json flag - select outputs JSON by default
- ❌ Don't change argument order - selector comes before files
- ❌ Don't forget `.js` extensions in TypeScript imports
- ❌ Don't put `vi.mock()` inside test functions - mock at top level
- ❌ Don't forget to reset mocks in `beforeEach`
- ❌ Don't determine success by parsing JSON - use exit code only
- ❌ Don't add business logic - this is a thin adapter only
- ❌ Don't transform error messages - return mdsel errors unchanged
- ❌ Don't use different naming conventions than mdsel_index
- ❌ Don't skip test categories - cover success, error, and edge cases
