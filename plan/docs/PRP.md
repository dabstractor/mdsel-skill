name: "PRP: P1.M3.T1 - Implement mdsel_index Tool"
description: |

---

## Goal

**Feature Goal**: Create the `mdsel_index` tool handler that calls `mdsel index` and returns JSON verbatim as an MCP tool.

**Deliverable**: Three new files in `src/tools/`:
1. `src/tools/mdsel-index.ts` - Tool handler implementation
2. `src/tools/types.ts` - Tool-specific type definitions (input schema)
3. `tests/tools/mdsel-index.test.ts` - Comprehensive unit tests

**Success Definition**:
- The `mdsel_index` tool accepts a `files: string[]` parameter
- Calls `execMdsel(['index', ...files, '--json'])` using the existing executor
- Returns the JSON output verbatim in MCP tool response format
- Handles errors by returning `isError: true` with stderr text
- All tests pass covering: happy path, error cases, and edge cases

## User Persona (if applicable)

**Target User**: Claude Code AI agent (automated consumer of MCP tools)

**Use Case**: Claude Code needs to index Markdown files to discover their structure before performing selective content retrieval.

**User Journey**:
1. Claude Code receives a request to analyze a large Markdown file (>200 words)
2. Instead of using the Read tool, it calls `mdsel_index` with the file path
3. The tool returns a structured JSON index of headings, blocks, and selectors
4. Claude Code uses this index to intelligently query specific sections via `mdsel_select`

**Pain Points Addressed**:
- Large Markdown files overwhelm context windows when read entirely
- Read tool loads entire file regardless of what's needed
- No way to discover document structure before loading content

## Why

- **Foundation for selective querying**: `mdsel_index` is the prerequisite for `mdsel_select` (P1.M3.T2), enabling the two-tool workflow for large Markdown files
- **Behavioral conditioning foundation**: Proper tool description encourages AI to prefer this tool over Read for large Markdown files (sets up P2 reminder hooks)
- **Thin adapter philosophy**: Maintains the project's "no processing, no caching, verbatim passthrough" design principle
- **Reuses existing infrastructure**: Leverages the `execMdsel` function from P1.M2

## What

Create an MCP tool handler for `mdsel_index` that:

1. **Accepts input**: `files: string[]` - array of absolute file paths to Markdown documents
2. **Calls mdsel CLI**: Executes `execMdsel(['index', ...files, '--json'])`
3. **Returns verbatim JSON**: The stdout from mdsel is returned as-is in the MCP response `content` field
4. **Handles errors**: Returns `isError: true` with stderr text on failure
5. **No post-processing**: Does NOT parse, validate, transform, or cache the output

### Success Criteria

- [ ] `src/tools/mdsel-index.ts` exports `handleMdselIndex` function
- [ ] Function uses Zod schema for input validation with `.describe()` for each parameter
- [ ] Function calls `execMdsel(['index', ...args.files])` (without `--json` flag - mdsel outputs JSON by default)
- [ ] Returns `{ content: [{ type: 'text', text: result.stdout }], isError: !result.success }`
- [ ] Test file covers: happy path, non-zero exit code, mdsel not found, empty files array
- [ ] `npm run build` produces no errors
- [ ] `npm test` passes all tests including new tests

## All Needed Context

### Context Completeness Check

**Validation**: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"

**Answer**: Yes - this PRP provides:
- Complete file structure with exact paths and naming conventions
- Specific code patterns from existing `mdsel-cli.ts` to follow
- Exact import syntax required for ESM (`.js` extensions, `node:` prefix)
- Mocking patterns from existing test file
- MCP SDK usage patterns with specific URLs

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP TypeScript SDK repository with examples
  critical: Use McpServer.registerTool() pattern with config object

- url: https://modelcontextprotocol.io/docs/tools
  why: MCP tools specification and best practices
  critical: Tool response format requires { content: [...], isError?: boolean }

- file: src/lib/mdsel-cli.ts
  why: Exact implementation pattern for subprocess execution to follow
  pattern: spawn() usage, stdout/stderr capture, Promise-based async, error handling
  gotcha: MUST use absolute path to mdsel CLI, MUST NOT use exec()

- file: tests/lib/mdsel-cli.test.ts
  why: Mocking pattern for child_process.spawn in tests
  pattern: vi.mock() at top level, mockProcess object with stdout/stderr/on handlers
  gotcha: Call mockClear() in beforeEach, use vi.mocked() for type safety

- file: plan/docs/architecture/tool_definitions.md
  why: Complete MCP tool definition including description, inputSchema, handler pattern
  pattern: Tool description with behavioral conditioning text, input schema structure
  section: Tool 1: mdsel_index

- file: src/types.ts
  why: Type definitions for MdselResult and MdselExecOptions
  pattern: Interface export pattern, custom error classes
  gotcha: Import with .js extension even for .ts files

- file: vitest.config.ts
  why: Test configuration - globals enabled, environment: 'node'
  pattern: Tests can use describe/it/expect without imports

- file: tsup.config.ts
  why: Build configuration - need to add new files to entry array
  pattern: Entry points array, clean: true, dts: true
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm/
├── dist/                          # Build output (generated by tsup)
├── src/
│   ├── hooks/                     # Empty (for P2.M2)
│   ├── index.ts                   # MCP server entry point (placeholder)
│   ├── lib/
│   │   └── mdsel-cli.ts           # mdsel CLI executor - USE THIS
│   ├── tools/                     # TARGET DIRECTORY - Currently empty
│   └── types.ts                   # Type definitions
├── tests/
│   ├── hooks/                     # Empty
│   ├── lib/
│   │   └── mdsel-cli.test.ts      # Test pattern to follow - USE THIS
│   └── tools/                     # TARGET DIRECTORY - Currently empty
├── plan/
│   └── docs/
│       └── architecture/
│           └── tool_definitions.md # Tool spec - USE THIS
├── package.json                   # ESM, Node.js 18+
├── tsconfig.json                  # ES2022, NodeNext module
├── tsup.config.ts                 # Bundler config
└── vitest.config.ts               # Test config (globals: true)
```

### Desired Codebase Tree with Files to be Added

```bash
/home/dustin/projects/mdsel-claude-glm/
├── src/
│   └── tools/
│       ├── mdsel-index.ts         # NEW - mdsel_index tool handler
│       └── types.ts               # NEW - Tool input schemas (if needed)
├── tests/
│   └── tools/
│       └── mdsel-index.test.ts    # NEW - Tests for mdsel_index handler
```

**Note**: `src/tools/types.ts` may not be needed if schemas are defined inline in `mdsel-index.ts`. Follow the pattern from `src/types.ts` - if only exporting a single schema, define inline. If multiple tools share schemas, create `types.ts`.

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM import syntax - MUST use .js extensions for local imports
// WRONG: import { execMdsel } from '../lib/mdsel-cli';
// RIGHT: import { execMdsel } from '../lib/mdsel-cli.js';

// CRITICAL: Built-in Node.js modules MUST use "node:" prefix
// WRONG: import { spawn } from 'child_process';
// RIGHT: import { spawn } from 'node:child_process';

// CRITICAL: Zod schemas in MCP SDK - use raw shape objects with .describe()
const schema = {
  files: z.array(z.string()).describe('Array of absolute file paths')
};

// CRITICAL: Mock placement - MUST be at top level, not inside tests
vi.mock('node:child_process', () => ({ spawn: vi.fn() }));

// CRITICAL: mdsel CLI path is hardcoded absolute path
const MDSEL_PATH = '/home/dustin/.local/bin/mdsel';

// CRITICAL: Return mdsel output VERBATIM - no parsing, no transformation
// Even if output is malformed JSON, return as-is

// CRITICAL: Tool response format for MCP
return {
  content: [{ type: 'text', text: result.stdout }],
  isError: !result.success
};

// CRITICAL: execMdsel already appends '--json' automatically per mdsel-cli.ts line 19
// But verify - if not, append '--json' to args: ['index', ...files, '--json']

// CRITICAL: TypeScript strict mode - all types must be explicit
// Use type annotations for function parameters and return types

// CRITICAL: vitest globals are enabled - no need to import describe/it/expect
```

## Implementation Blueprint

### Data models and structure

```typescript
// Input schema for mdsel_index tool
// Uses Zod for runtime validation and MCP documentation

import { z } from 'zod';

// Define schema as const object (MCP SDK pattern)
export const MDSEL_INDEX_INPUT_SCHEMA = {
  files: z.array(z.string()).describe(
    'Array of absolute file paths to Markdown documents to index'
  )
} as const;

// Type extracted from schema (for TypeScript typing)
export type MdselIndexInput = z.infer<typeof z.object(MDSEL_INDEX_INPUT_SCHEMA)>;

// MCP Tool Result type (from SDK)
interface CallToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE src/tools/mdsel-index.ts
  - IMPLEMENT: handleMdselIndex function with async handler signature
  - IMPORT: execMdsel from '../lib/mdsel-cli.js' (note .js extension)
  - IMPORT: z from 'zod'
  - DEFINE: MDSEL_INDEX_INPUT_SCHEMA using Zod with .describe()
  - IMPLEMENT: Call execMdsel(['index', ...args.files]) (check if --json needed)
  - IMPLEMENT: Return { content: [{ type: 'text', text: result.stdout }], isError: !result.success }
  - NAMING: kebab-case file name, camelCase function name
  - PLACEMENT: src/tools/ directory

Task 2: CREATE tests/tools/mdsel-index.test.ts
  - IMPLEMENT: describe() block for 'handleMdselIndex'
  - IMPORT: handleMdselIndex from '../../src/tools/mdsel-index.js'
  - MOCK: 'node:child_process' at TOP LEVEL (not inside tests)
  - IMPLEMENT: beforeEach to reset mocks
  - IMPLEMENT: test for successful indexing (exit code 0)
  - IMPLEMENT: test for non-zero exit code (isError: true)
  - IMPLEMENT: test for empty files array
  - IMPLEMENT: test for verbatim output passthrough
  - FOLLOW pattern: tests/lib/mdsel-cli.test.ts (mockProcess structure)
  - NAMING: mdsel-index.test.ts
  - PLACEMENT: tests/tools/ directory

Task 3: VERIFY build configuration
  - CHECK: tsup.config.ts entry array
  - ENSURE: src/tools/*.ts files are included in build
  - VERIFY: dts: true for type declarations
  - RUN: npm run build to verify no errors
```

### Implementation Patterns & Key Details

```typescript
// ============================================
// Pattern 1: Tool Handler Implementation
// ============================================
// File: src/tools/mdsel-index.ts

import { execMdsel } from '../lib/mdsel-cli.js';
import type { MdselResult } from '../types.js';
import { z } from 'zod';

// Input schema definition (Zod raw shape for MCP SDK)
export const MDSEL_INDEX_INPUT_SCHEMA = {
  files: z.array(z.string()).describe(
    'Array of absolute file paths to Markdown documents to index'
  )
} as const;

// Tool handler function
export async function handleMdselIndex(args: {
  files: string[];
}): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  // Call mdsel CLI with index command
  // GOTCHA: Check mdsel-cli.ts - does it auto-append '--json'?
  // If not: add '--json' to args: ['index', ...args.files, '--json']
  const result: MdselResult = await execMdsel(['index', ...args.files]);

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

// ============================================
// Pattern 2: Mock Object for child_process
// ============================================
// From tests/lib/mdsel-cli.test.ts lines 22-28

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
    handler(Buffer.from('{"indexed": true, "selectors": [...]}'));
  }
});

// Simulate stderr data event
mockProcess.stderr.on.mockImplementation((event, handler) => {
  if (event === 'data') {
    handler(Buffer.from(''));
  }
});

// Simulate close event with exit code
mockProcess.on.mockImplementation((event, handler) => {
  if (event === 'close') {
    (handler as (code: number) => void)(0); // 0 = success, 1 = failure
  }
});

// ============================================
// Pattern 3: Test Structure
// ============================================
// File: tests/tools/mdsel-index.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { handleMdselIndex } from '../../src/tools/mdsel-index.js';

// CRITICAL: Mock at TOP LEVEL, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('handleMdselIndex', () => {
  let mockSpawn: ReturnType<typeof vi.mocked<typeof spawn>>;

  beforeEach(() => {
    // CRITICAL: Reset mocks before each test
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockClear();
  });

  describe('successful execution', () => {
    it('should index files and return JSON', async () => {
      // Arrange: Set up mock process
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
        killed: false,
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Simulate mdsel JSON output
      mockProcess.stdout.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(
            Buffer.from(
              JSON.stringify({
                indexed: ['README.md'],
                selectors: { headings: [...], blocks: [...] }
              })
            )
          );
        }
      });

      mockProcess.stderr.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(''));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      // Act: Call the handler
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert: Verify response
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('indexed');
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', 'README.md'],
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should return isError: true on non-zero exit code', async () => {
      // Arrange
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
        killed: false,
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      mockProcess.stdout.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(''));
        }
      });

      mockProcess.stderr.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from('Error: File not found'));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(1);
        }
      });

      // Act
      const result = await handleMdselIndex({
        files: ['missing.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe(''); // Empty stdout on error
    });
  });
});
```

### Integration Points

```yaml
MCP_SERVER:
  - location: src/index.ts (placeholder - will be implemented in P1.M4.T1)
  - note: This task (P1.M3.T1) creates the handler ONLY
  - future: In P1.M4.T1, server.registerTool('mdsel_index', {...}, handleMdselIndex)

BUILD_SYSTEM:
  - file: tsup.config.ts
  - entry: ['src/index.ts'] - tools will be bundled via index.ts imports
  - note: No changes needed to tsup.config.ts for this task

TYPE_SYSTEM:
  - import: type { MdselResult } from '../types.js'
  - note: Use 'type' keyword for type-only imports in ESM

DEPENDENCIES:
  - zod: Already in package.json (dev dependency from MCP SDK)
  - @modelcontextprotocol/sdk: Already installed
  - No new dependencies needed
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npm run lint              # ESLint check
npm run format           # Prettier format
npm run type-check       # TypeScript tsc --noEmit

# Or use individual commands
npx eslint src/tools/mdsel-index.ts --fix
npx prettier --write src/tools/mdsel-index.ts
npx tsc --noEmit src/tools/mdsel-index.ts

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
# Common issues:
# - Missing .js extension in imports
# - Missing "node:" prefix for built-in modules
# - Implicit any types (add type annotations)
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the new tool handler specifically
npm test -- tests/tools/mdsel-index.test.ts

# Run with verbose output
npm test -- tests/tools/mdsel-index.test.ts --reporter=verbose

# Run in watch mode for development
npm test -- tests/tools/mdsel-index.test.ts --watch

# Full test suite
npm test

# Coverage report (if coverage is configured)
npm run test:coverage

# Expected: All tests pass. If failing, debug root cause:
# 1. Check mock setup - mockSpawn.mockReturnValue called?
# 2. Check event handlers - on() implementation triggers callbacks?
# 3. Check assertions - actual vs expected values match?
```

### Level 3: Integration Testing (System Validation)

```bash
# Build the project
npm run build

# Verify dist/ output contains tool code
ls -la dist/

# Check for type declarations
ls -la dist/*.d.ts

# Verify the handler function signature
# (Can't directly test without MCP server, but build should succeed)

# Quick syntax check of the built code
node -c dist/index.js

# Expected:
# - Build completes without errors
# - dist/index.js exists and is valid JavaScript
# - No TypeScript compilation errors
```

### Level 4: Manual Validation (Handler Behavior)

```bash
# Note: Full MCP testing requires server implementation (P1.M4.T1)
# For this task, we validate the handler function directly

# Create a simple test script (temporary)
cat > test-handler.mjs << 'EOF'
import { handleMdselIndex } from './dist/tools/mdsel-index.js';

// Test with real file (if mdsel is installed)
const result = await handleMdselIndex({
  files: ['README.md']
});

console.log('Result:', JSON.stringify(result, null, 2));
console.log('isError:', result.isError);
console.log('Content type:', result.content[0].type);
EOF

# Run the test script
node test-handler.mjs

# Clean up
rm test-handler.mjs

# Expected:
# - Result.content[0].type is 'text'
# - Result.content[0].text contains JSON from mdsel
# - isError is false for valid files, true for missing files
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`

### Feature Validation

- [ ] `handleMdselIndex` function accepts `{ files: string[] }` parameter
- [ ] Function calls `execMdsel(['index', ...args.files])`
- [ ] Returns `{ content: [{ type: 'text', text: result.stdout }], isError: !result.success }`
- [ ] Output is returned verbatim (no parsing or transformation)
- [ ] Error cases return `isError: true` with stderr text

### Code Quality Validation

- [ ] File name is `mdsel-index.ts` (kebab-case)
- [ ] Function name is `handleMdselIndex` (camelCase)
- [ ] Imports use `.js` extensions for local modules
- [ ] Built-in modules use `node:` prefix
- [ ] Mock is placed at top level in test file (not inside describe/it)
- [ ] `beforeEach` calls `mockClear()` to reset mocks
- [ ] Zod schema uses `.describe()` for parameter documentation

### Documentation & Deployment

- [ ] Code has JSDoc comments for the function
- [ ] Test cases cover: happy path, error path, empty array edge case
- [ ] No hardcoded values that should be configurable
- [ ] File placement matches desired tree structure

---

## Anti-Patterns to Avoid

- ❌ Don't parse the JSON output from mdsel - return it as a string verbatim
- ❌ Don't validate file paths - let mdsel handle validation
- ❌ Don't add `--json` flag if `execMdsel` already appends it (verify in mdsel-cli.ts)
- ❌ Don't use `exec()` or `execSync()` - must use `spawn()` pattern from mdsel-cli.ts
- ❌ Don't put `vi.mock()` inside test functions - must be at top level
- ❌ Don't forget `.js` extensions in import statements
- ❌ Don't use relative paths like `../mdsel` - must use absolute path
- ❌ Don't catch and rewrite errors - return mdsel errors verbatim
- ❌ Don't implement caching or state - handler must be stateless
- ❌ Don't add `@ts-ignore` or `@ts-expect-error` to fix type errors
- ❌ Don't use `any` type - use proper type annotations or `unknown`

---

## Success Metrics

**Confidence Score**: 9/10 for one-pass implementation success

**Reasoning**:
- Complete codebase patterns documented with specific line references
- MCP SDK usage patterns confirmed from SDK examples
- Test mocking pattern matches existing test file exactly
- All critical gotchas documented with examples
- Clear task ordering with dependencies

**Risk Factors**:
- mdsel CLI behavior (whether `--json` flag is auto-appended) - verify in implementation
- TypeScript strict mode may reveal type issues not caught in review

**Validation**: The completed PRP provides specific file paths, exact code patterns, import syntax with extensions, mock patterns with line references, and validation commands that should enable an AI agent unfamiliar with the codebase to implement this feature successfully using only the PRP content and codebase access.
