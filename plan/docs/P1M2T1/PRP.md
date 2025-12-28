# Product Requirement Prompt (PRP): Implement mdsel CLI Executor

**Task ID**: P1.M2.T1
**Work Item**: Implement mdsel CLI Executor
**Status**: Ready for Implementation
**Confidence Score**: 9/10 for one-pass implementation success

---

## Goal

**Feature Goal**: Create a robust TypeScript utility to spawn mdsel subprocesses and capture their JSON output verbatim, enabling both MCP tool handlers (mdsel_index and mdsel_select) to execute mdsel commands.

**Deliverable**: A fully tested `execMdsel` function in `src/lib/mdsel-cli.ts` with:

- Type definitions in `src/types.ts` (MdselResult, MdselExecOptions, error classes)
- Core `execMdsel()` function that spawns mdsel subprocess using `spawn()`
- Comprehensive test suite in `tests/lib/mdsel-cli.test.ts` with mocked child_process calls
- Verbatim output passthrough (no JSON parsing, no error transformation)

**Success Definition**:

- All TypeScript types compile with zero errors (`npm run type-check`)
- All tests pass with comprehensive coverage (`npm test -- tests/lib/mdsel-cli.test.ts`)
- Function correctly spawns mdsel subprocess and captures stdout/stderr/exit code
- Exit code 0 → `success: true`, non-zero → `success: false`
- stdout and stderr captured verbatim (no transformation, no parsing)
- Tests cover success cases, error cases, ENOENT, timeout scenarios

---

## Why

- **Foundation for P1.M3**: Both tool handlers (mdsel_index and mdsel_select) depend on `execMdsel` - this is a blocking dependency
- **Single Source of Truth**: Centralizes all mdsel CLI interaction logic in one reusable function
- **Verbatim Passthrough**: Enforces PRD Section 8 requirement that mdsel output is never modified
- **Error Handling**: Provides consistent error handling for subprocess failures (ENOENT, timeout, non-zero exit)
- **Testability**: Mockable design enables comprehensive testing of tool handlers without real subprocess calls

---

## What

Create the mdsel CLI executor utility across three subtasks:

### P1.M2.T1.S1: Define MdselResult Type Interface (0.5 points)

Modify `src/types.ts` to define:

- `MdselResult` - Result interface with success, stdout, stderr, exitCode
- `MdselExecOptions` - Optional execution settings (cwd, env, timeout, maxBuffer, killSignal)
- `MdselExecutionError` - Error class for failed commands (with exitCode, stderr, stdout)
- `MdselNotFoundError` - Error class when mdsel CLI not found
- `MdselTimeoutError` - Error class for command timeout

### P1.M2.T1.S2: Implement execMdsel Function (1 point)

Create `src/lib/mdsel-cli.ts` with:

- Uses Node.js `spawn()` from `node:child_process` (NOT exec/execSync)
- Spawns mdsel CLI from absolute path `/home/dustin/.local/bin/mdsel`
- Captures stdout and stderr as strings
- Returns `MdselResult` with success = (exitCode === 0)
- Does NOT parse JSON output (returns verbatim per PRD Section 8)
- Handles ENOENT error (mdsel not installed) with helpful message
- Supports timeout with configurable default (30000ms)
- Optional: cwd, env, maxBuffer, killSignal options

### P1.M2.T1.S3: Write Tests for execMdsel (1 point)

Create `tests/lib/mdsel-cli.test.ts` with:

- Mock `node:child_process` module with `vi.mock()` at top level
- Test successful index command (exit code 0)
- Test successful select command (exit code 0)
- Test failed command (non-zero exit code)
- Test ENOENT error (mdsel not found)
- Test stdout and stderr capture
- Test timeout behavior
- Test verbatim passthrough (no JSON parsing/transformation)
- Reset mocks in beforeEach
- Use vitest with globals enabled

### Success Criteria

- [ ] `src/types.ts` defines all 5 types (MdselResult, MdselExecOptions, 3 error classes)
- [ ] `src/lib/mdsel-cli.ts` exports `execMdsel` function
- [ ] `tests/lib/mdsel-cli.test.ts` has comprehensive test coverage
- [ ] `npm run type-check` completes with zero errors
- [ ] `npm test -- tests/lib/mdsel-cli.test.ts` passes all tests
- [ ] Function uses `spawn()` from `node:child_process` (not exec/execSync)
- [ ] mdsel path is `/home/dustin/.local/bin/mdsel` (absolute path)
- [ ] Output is returned verbatim (no JSON parsing)
- [ ] Success = (exitCode === 0), failure otherwise
- [ ] Timeout implemented with default 30 seconds

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: Yes - this PRP provides:

- Exact mdsel CLI interface, commands, and JSON output format
- Complete TypeScript type definitions with ready-to-use code
- Complete `spawn()` implementation pattern with full working example
- Vitest mocking patterns with complete test examples
- Project-specific validation commands that work on this codebase
- File structure and naming conventions
- All critical gotchas with specific anti-patterns to avoid

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- url: https://nodejs.org/api/child_process.html
  why: Official Node.js child_process API documentation
  critical: spawn() is the correct method for CLI execution (not exec/execSync)
  section: Class: ChildProcess, Event: 'close', Event: 'error'

- url: https://nodejs.org/api/esm.html
  why: Node.js ESM documentation - explains "type": "module" requirement
  critical: Use "node:" prefix for built-in imports (node:child_process)

- url: https://vitest.dev/guide/mocking.html
  why: Official Vitest mocking documentation
  critical: vi.mock() pattern for mocking child_process, vi.clearAllMocks() for cleanup
  section: Mocking Modules, vi API

- url: https://www.typescriptlang.org/docs/handhandbook/2/classes.html
  why: TypeScript class documentation for error class definitions
  critical: Custom error classes with readonly properties

- file: /home/dustin/projects/mdsel-claude-glm/plan/docs/P1M2T1/research/mdsel_cli.md
  why: Complete mdsel CLI research with command syntax and JSON output format
  pattern: Commands always use --json flag for structured output
  gotcha: mdsel location is /home/dustin/.local/bin/mdsel (absolute path)

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M2T1/research/child_process_research.md
  why: Complete Node.js subprocess patterns research with code examples
  pattern: Use spawn() with Promise wrapper for async subprocess execution
  gotcha: Always use arrays for arguments to avoid shell injection

- file: /home/dustin/projects/mdsel-claude-glm/plan/P1M2T1/research/testing_research.md
  why: Complete Vitest mocking patterns for subprocess testing
  pattern: vi.mock('node:child_process') with mockImplementation()
  gotcha: Always reset mocks in beforeEach, mock at top level not inside tests

- file: /home/dustin/projects/mdsel-claude-glm/plan/docs/P1M2T1/research/type_definitions.md
  why: Complete TypeScript type definitions for this task
  pattern: MdselResult interface, MdselExecOptions, error classes
  gotcha: Types are for documentation - do NOT use for parsing JSON (verbatim passthrough)

- file: /home/dustin/projects/mdsel-claude-glm/PRD.md
  why: Product Requirements Document with behavioral requirements
  pattern: Section 8 - Error Handling (verbatim passthrough)
  gotcha: "No JSON parsing, No selector validation, No caching"

- file: /home/dustin/projects/mdsel-claude-glm/vitest.config.ts
  why: Project's vitest configuration
  pattern: globals: true, environment: 'node'
  gotcha: Tests use describe/it/expect without imports (globals enabled)

- file: /home/dustin/projects/mdsel-claude-glm/tsconfig.json
  why: Project's TypeScript configuration
  pattern: module: "NodeNext", moduleResolution: "NodeNext"
  gotcha: Imports must use .js extensions (even for .ts files) due to ESM

- file: /home/dustin/projects/mdsel-claude-glm/package.json
  why: Project dependencies and scripts
  pattern: "type": "module" enables ESM
  gotcha: No additional dependencies needed for child_process (built-in)
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm
├── src/
│   ├── index.ts               # Placeholder (MCP server entry - P1.M4)
│   ├── types.ts               # Placeholder with export {} - MODIFY IN S1
│   ├── tools/                 # Tool handlers (P1.M3 - not yet implemented)
│   ├── hooks/                 # Hook scripts (P2.M2 - not yet implemented)
│   └── lib/                   # Utilities - CREATE mdsel-cli.ts IN S2
├── tests/
│   ├── tools/                 # Tool tests (P1.M3 - not yet implemented)
│   ├── hooks/                 # Hook tests (P2.M2 - not yet implemented)
│   └── lib/                   # Utility tests - CREATE mdsel-cli.test.ts IN S3
├── dist/                      # Build output (generated by tsup)
├── plan/
│   └── docs/
│       ├── architecture/      # Architecture documentation
│       └── P1M2T1/            # Research files for this task
│           ├── PRP.md         # Existing PRP (reference)
│           └── research/
│               ├── mdsel_cli.md
│               ├── node_subprocess.md
│               ├── vitest_mocking.md
│               └── type_definitions.md
├── plan/
│   └── P1M2T1/                # THIS TASK WORKSPACE
│       └── PRP.md             # THIS FILE
├── package.json               # ESM enabled, TypeScript 5.0, vitest 2.0
├── tsconfig.json              # NodeNext module, strict mode
├── tsup.config.ts             # ESM bundling with dts
├── vitest.config.ts           # Node environment, globals enabled
├── eslint.config.js           # TypeScript ESLint
├── .prettierrc.json           # 2-space indent, single quotes
├── PRD.md                     # Product Requirements Document
└── tasks.json                 # Task tracking
```

### Desired Codebase Tree (After Implementation)

```bash
/home/dustin/projects/mdsel-claude-glm
├── src/
│   ├── index.ts               # Placeholder (unchanged)
│   ├── types.ts               # UPDATED: MdselResult, MdselExecOptions, error classes
│   ├── tools/                 # (empty - P1.M3)
│   ├── hooks/                 # (empty - P2.M2)
│   └── lib/
│       └── mdsel-cli.ts       # NEW: execMdsel function implementation
├── tests/
│   ├── tools/                 # (empty - P1.M3)
│   ├── hooks/                 # (empty - P2.M2)
│   └── lib/
│       └── mdsel-cli.test.ts  # NEW: Comprehensive test suite
├── dist/                      # Generated: lib/mdsel-cli.js, lib/mdsel-cli.d.ts
└── ... (other files unchanged)
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Use spawn() not exec() for subprocess execution
// spawn() provides streaming output, better error handling, no shell overhead
// exec() buffers output (memory issues with large files), spawns shell

// CRITICAL: Use arrays for arguments to avoid shell injection
// ❌ WRONG: spawn('sh', ['-c', `mdsel ${userInput}`])
// ✅ CORRECT: spawn('/home/dustin/.local/bin/mdsel', ['index', 'README.md', '--json'])

// CRITICAL: ESM imports require "node:" prefix for built-in modules
// ❌ WRONG: import { spawn } from 'child_process'
// ✅ CORRECT: import { spawn } from 'node:child_process'

// CRITICAL: TypeScript imports use .js extensions (even for .ts files)
// This is due to ESM module resolution in Node.js
// ❌ WRONG: import { foo } from './types'
// ✅ CORRECT: import { foo } from './types.js'

// CRITICAL: mdsel location is /home/dustin/.local/bin/mdsel
// Use absolute path - do not use PATH resolution or relative paths
const MDSEL_PATH = '/home/dustin/.local/bin/mdsel';

// CRITICAL: mdsel always requires --json flag for structured output
// ❌ WRONG: execMdsel(['index', 'README.md'])
// ✅ CORRECT: execMdsel(['index', 'README.md', '--json'])

// CRITICAL: Output must be returned VERBATIM per PRD Section 8
// ❌ WRONG: return JSON.parse(result.stdout)
// ✅ CORRECT: return { success, stdout, stderr, exitCode }

// CRITICAL: Success is based on exit code, not JSON parsing
// success = (exitCode === 0), even if stdout is malformed JSON

// CRITICAL: Vitest requires vi.mock() at top level, not in test functions
// Place vi.mock() calls before describe() blocks

// CRITICAL: Always reset mocks in beforeEach
// vi.clearAllMocks() or mockFn.mockClear()

// CRITICAL: This is a THIN ADAPTER - no capabilities logic
// All real work delegated to mdsel CLI subprocess

// CRITICAL: Custom error classes need 'name' property set
// Error.name should match class name for proper error identification
```

---

## Implementation Blueprint

### Data Models and Structure

Complete type definitions for `src/types.ts`:

```typescript
// src/types.ts

/**
 * Result from executing mdsel CLI command
 */
export interface MdselResult {
  /** Whether the command succeeded (exit code === 0) */
  success: boolean;
  /** Standard output from the command (verbatim, may be JSON) */
  stdout: string;
  /** Standard error from the command */
  stderr: string;
  /** Process exit code (null if terminated by signal) */
  exitCode: number | null;
}

/**
 * Options for executing mdsel commands
 */
export interface MdselExecOptions {
  /** Working directory for the command */
  cwd?: string;
  /** Environment variables (defaults to process.env) */
  env?: Record<string, string>;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum buffer size for stdout/stderr */
  maxBuffer?: number;
  /** Signal to use for killing on timeout */
  killSignal?: NodeJS.Signals;
}

/**
 * Custom error for mdsel execution failures
 */
export class MdselExecutionError extends Error {
  constructor(
    public readonly exitCode: number,
    public readonly stderr: string,
    public readonly stdout: string,
    message: string
  ) {
    super(message);
    this.name = 'MdselExecutionError';
  }
}

/**
 * Error when mdsel CLI is not found
 */
export class MdselNotFoundError extends Error {
  constructor() {
    super('mdsel CLI not found. Install with: npm install -g mdsel');
    this.name = 'MdselNotFoundError';
  }
}

/**
 * Error when mdsel times out
 */
export class MdselTimeoutError extends Error {
  constructor(public readonly timeout: number) {
    super(`mdsel command timed out after ${timeout}ms`);
    this.name = 'MdselTimeoutError';
  }
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: MODIFY src/types.ts
  - IMPLEMENT: MdselResult, MdselExecOptions, MdselExecutionError, MdselNotFoundError, MdselTimeoutError
  - REPLACE: Placeholder export {} with actual type definitions from above
  - FOLLOW: Pattern from /home/dustin/projects/mdsel-claude-glm/plan/docs/P1M2T1/research/type_definitions.md
  - PLACEMENT: src/types.ts (project root)
  - NAMING: PascalCase for interfaces and classes, camelCase for properties
  - VALIDATION: npm run type-check - must complete with zero errors

Task 2: CREATE src/lib/mdsel-cli.ts
  - IMPLEMENT: execMdsel function with spawn() from node:child_process
  - FUNCTION SIGNATURE: export async function execMdsel(args: string[], options?: MdselExecOptions): Promise<MdselResult>
  - PATTERN: Use spawn() with Promise wrapper (see Implementation Patterns below)
  - IMPORT: import { spawn } from 'node:child_process'
  - IMPORT: import type { MdselResult, MdselExecOptions } from '../types.js'
  - CONSTANTS:
    * MDSEL_PATH = '/home/dustin/.local/bin/mdsel'
    * DEFAULT_TIMEOUT = 30000
  - ERROR HANDLING:
    * ENOENT → resolve with success: false, helpful error in stderr
    * Non-zero exit → resolve with success: false
    * Timeout → kill process (SIGTERM then SIGKILL), resolve with success: false
  - OUTPUT: Return MdselResult with verbatim stdout/stderr (no parsing)
  - GOTCHA: Use arrays for arguments to avoid shell injection
  - PLACEMENT: src/lib/mdsel-cli.ts (new file)
  - DEPENDENCIES: Requires types from Task 1
  - VALIDATION: npm run type-check - must complete with zero errors

Task 3: CREATE tests/lib/mdsel-cli.test.ts
  - IMPLEMENT: Comprehensive test suite with vi.mock()
  - MOCK: vi.mock('node:child_process', () => ({ spawn: vi.fn() }))
  - BEFORE_EACH: vi.clearAllMocks() to reset mock state between tests
  - TEST CASES:
    * Successful index command (exit code 0)
    * Successful select command (exit code 0)
    * Failed command (non-zero exit code)
    * ENOENT error (mdsel not found)
    * Stdout capture verification
    * Stderr capture verification
    * Exit code mapping to success boolean
    * Verbatim output (no transformation/parsing)
  - PATTERN: Use mockImplementation() for spawn behavior
  - FOLLOW: Pattern from /home/dustin/projects/mdsel-claude-glm/plan/P1M2T1/research/testing_research.md
  - ASSERTIONS: Use expect() for result validation, toBe() for equality, toContain() for substrings
  - PLACEMENT: tests/lib/mdsel-cli.test.ts (new file)
  - DEPENDENCIES: Requires mdsel-cli.ts from Task 2
  - VALIDATION: npm test -- tests/lib/mdsel-cli.test.ts - all tests must pass
```

### Implementation Patterns & Key Details

````typescript
// ==================== src/lib/mdsel-cli.ts ====================
// Complete implementation following these patterns

import { spawn } from 'node:child_process';
import type { MdselResult, MdselExecOptions } from '../types.js';

// CRITICAL: Use absolute path to mdsel CLI
const MDSEL_PATH = '/home/dustin/.local/bin/mdsel';

// CRITICAL: Default timeout to prevent hanging processes
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Execute mdsel CLI command and capture output
 *
 * @param args - Command arguments (e.g., ['index', 'file.md', '--json'])
 * @param options - Optional execution settings
 * @returns Promise resolving to MdselResult
 *
 * @example
 * ```ts
 * const result = await execMdsel(['index', 'README.md', '--json']);
 * if (result.success) {
 *   console.log(result.stdout); // JSON output from mdsel
 * } else {
 *   console.error(result.stderr);
 * }
 * ```
 */
export async function execMdsel(
  args: string[],
  options: MdselExecOptions = {}
): Promise<MdselResult> {
  const {
    cwd,
    env = process.env,
    timeout = DEFAULT_TIMEOUT,
    // Note: maxBuffer not used with spawn() (streaming, not buffered)
    killSignal = 'SIGTERM',
  } = options;

  return new Promise<MdselResult>((resolve) => {
    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;
    let timedOut = false;

    // CRITICAL: Use spawn() with array of arguments (avoids shell injection)
    const child = spawn(MDSEL_PATH, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Set up timeout mechanism
    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill(killSignal);

      // Force kill if graceful shutdown fails
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 5000);
    }, timeout);

    // Capture stdout
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    // Capture stderr
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code, signal) => {
      clearTimeout(timeoutId);

      exitCode = code;

      // CRITICAL: Return result verbatim (no parsing, no transformation)
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode,
      });
    });

    // Handle process errors (e.g., ENOENT)
    child.on('error', (error: NodeJS.ErrnoException) => {
      clearTimeout(timeoutId);

      if (error.code === 'ENOENT') {
        stderr = `mdsel CLI not found at ${MDSEL_PATH}. Install with: npm install -g mdsel`;
      } else {
        stderr += error.message;
      }

      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: 1,
      });
    });
  });
}
````

### Test Implementation Pattern

```typescript
// ==================== tests/lib/mdsel-cli.test.ts ====================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { execMdsel } from '../../src/lib/mdsel-cli.js';
import type { MdselResult } from '../../src/types.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('execMdsel', () => {
  let mockSpawn: ReturnType<typeof vi.mocked<typeof spawn>>;

  beforeEach(() => {
    // CRITICAL: Reset mocks before each test
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockClear();
  });

  describe('successful execution', () => {
    it('should execute index command successfully', async () => {
      // Create mock process object
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
        killed: false,
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Simulate stdout data event
      mockProcess.stdout.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from('{"success":true,"command":"index"}'));
        }
      });

      // Simulate stderr data event (empty)
      mockProcess.stderr.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(''));
        }
      });

      // Simulate close event with exit code 0
      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      const result = await execMdsel(['index', 'README.md', '--json']);

      expect(result.success).toBe(true);
      expect(result.stdout).toBe('{"success":true,"command":"index"}');
      expect(result.stderr).toBe('');
      expect(result.exitCode).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', 'README.md', '--json'],
        expect.objectContaining({ stdio: expect.arrayContaining(['pipe', 'pipe', 'pipe']) })
      );
    });

    it('should execute select command successfully', async () => {
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
          handler(Buffer.from('{"success":true,"command":"select"}'));
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

      const result = await execMdsel(['select', 'heading:h1[0]', 'README.md', '--json']);

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'heading:h1[0]', 'README.md', '--json'],
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should handle non-zero exit code', async () => {
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

      const result = await execMdsel(['index', 'missing.md', '--json']);

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('Error: File not found');
    });

    it('should handle ENOENT error (mdsel not found)', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      const result = await execMdsel(['index', 'README.md', '--json']);

      expect(result.success).toBe(false);
      expect(result.stderr).toContain('mdsel CLI not found');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('verbatim passthrough', () => {
    it('should not parse or transform output', async () => {
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
        killed: false,
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Return malformed JSON
      const malformedOutput = '{invalid json}';
      mockProcess.stdout.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(malformedOutput));
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

      const result = await execMdsel(['index', 'README.md', '--json']);

      // CRITICAL: Return malformed output verbatim
      expect(result.stdout).toBe(malformedOutput);
      expect(result.success).toBe(true); // Success based on exit code, not JSON validity
    });
  });
});
```

### Integration Points

```yaml
TYPE_SYSTEM:
  - file: src/types.ts
  - exports: MdselResult, MdselExecOptions, MdselExecutionError, MdselNotFoundError, MdselTimeoutError
  - used_by: src/lib/mdsel-cli.ts, src/tools/* (P1.M3 future task)

MCP_TOOL_HANDLERS (Future - P1.M3):
  - will_import: { execMdsel } from '../lib/mdsel-cli.js'
  - will_import: type { MdselResult } from '../types.js'
  - usage_pattern: const result = await execMdsel(['index', ...args.files, '--json'])
  - return_pattern: { content: [{ type: 'text', text: result.stdout }], isError: !result.success }

BUILD_SYSTEM:
  - command: npm run build
  - tool: tsup bundles TypeScript to ESM
  - output: dist/lib/mdsel-cli.js, dist/lib/mdsel-cli.d.ts

TEST_FRAMEWORK:
  - command: npm test -- tests/lib/mdsel-cli.test.ts
  - tool: vitest with mocked child_process
  - coverage: All success and error cases

EXTERNAL_DEPENDENCY:
  - executable: /home/dustin/.local/bin/mdsel
  - required: mdsel CLI must be installed
  - install_command: npm install -g mdsel
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding

# After src/types.ts modification
npm run type-check
# Expected: Zero type errors
# If errors: Check TypeScript syntax, verify imports use .js extensions

# After src/lib/mdsel-cli.ts creation
npm run type-check
# Expected: Zero type errors
# If errors: Check import paths with .js extensions, verify type usage

# After tests/lib/mdsel-cli.test.ts creation
npm run type-check
# Expected: Zero type errors
# If errors: Check test imports, verify mock setup

# FINAL: Project-wide validation
npm run lint && npm run type-check
# Expected: Zero errors, zero warnings
# If errors: Read output and fix before proceeding to Level 2
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the execMdsel function specifically
npm test -- tests/lib/mdsel-cli.test.ts --run
# Expected: All tests pass with comprehensive coverage
# If failing: Debug mock setup, check spawn implementation

# Run with coverage reporting
npm test -- tests/lib/mdsel-cli.test.ts --coverage
# Expected: High coverage percentage for mdsel-cli.ts
# Verify: All success paths, error paths, and edge cases covered

# Full test suite (should still pass)
npm test -- --run
# Expected: All existing tests still pass (if any)
# Verify: No regressions in other parts of codebase
```

### Level 3: Integration Testing (System Validation)

```bash
# Build validation
npm run build
# Expected: dist/lib/mdsel-cli.js created
# Verify: Output file exists and contains execMdsel function

# Type declaration validation
cat dist/lib/mdsel-cli.d.ts
# Expected: Contains exported types (MdselResult, execMdsel)
# Verify: Type declarations are generated correctly

# Real mdsel CLI smoke test (requires mdsel to be installed)
node -e "
  import { execMdsel } from './dist/lib/mdsel-cli.js';
  execMdsel(['--version']).then(r => console.log('success:', r.success));
"
# Expected: Executes without errors (if mdsel installed)
# Verify: Real subprocess execution works

# Build output format validation
head -n 20 dist/lib/mdsel-cli.js
# Expected: ESM format with proper imports
# Verify: File is valid JavaScript (ESM)
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Verbatim Passthrough Validation
# Verify output is NOT modified
grep -n "JSON.parse" dist/lib/mdsel-cli.js
# Expected: NO occurrences of JSON.parse
# Verify: No JSON parsing in implementation

# Spawn Usage Validation
# Verify spawn() is used instead of exec()
grep -n "exec\|execSync\|execFile" dist/lib/mdsel-cli.js
# Expected: NO occurrences of exec/execSync/execFile
# Verify: Only spawn() is used for subprocess execution

# Security Validation
# Verify arguments are passed as arrays (no shell injection risk)
grep -A 3 "spawn(" dist/lib/mdsel-cli.js
# Expected: spawn(MDSEL_PATH, [ARRAY_OF_ARGS], OPTIONS)
# Verify: Arguments passed as array, not concatenated string

# Timeout Validation
# Verify timeout mechanism is in place
grep -n "timeout\|setTimeout" dist/lib/mdsel-cli.js
# Expected: Timeout logic present with default 30000
# Verify: Processes are killed on timeout

# Error Handling Validation
# Verify all error types are handled (ENOENT, non-zero exit, timeout)
grep -n "ENOENT\|error\|kill" dist/lib/mdsel-cli.js
# Expected: All error scenarios handled
# Verify: ENOENT produces helpful error message
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run type-check` completes with zero type errors
- [ ] `npm test -- tests/lib/mdsel-cli.test.ts` passes all tests
- [ ] `npm run build` creates dist/lib/mdsel-cli.js
- [ ] `npm run lint` executes without errors

### Feature Validation

- [ ] All success criteria from "What" section met
- [ ] `src/types.ts` exports MdselResult, MdselExecOptions, 3 error classes
- [ ] `src/lib/mdsel-cli.ts` exports `execMdsel` function
- [ ] `tests/lib/mdsel-cli.test.ts` has comprehensive test coverage
- [ ] Function uses `spawn()` from `node:child_process` (not exec/execSync)
- [ ] mdsel path is `/home/dustin/.local/bin/mdsel`
- [ ] Output is returned verbatim (no JSON parsing)
- [ ] Success = (exitCode === 0), failure otherwise
- [ ] ENOENT error is handled with helpful message
- [ ] Timeout mechanism is implemented with default 30s

### Code Quality Validation

- [ ] Follows existing codebase patterns and naming conventions
- [ ] File placement matches desired codebase tree structure
- [ ] Imports use `node:` prefix for built-in modules
- [ ] Imports use `.js` extensions (even for `.ts` files)
- [ ] Mocks are reset in beforeEach in tests
- [ ] vi.mock() is at top level, not inside test functions

### Documentation & Deployment

- [ ] Code is self-documenting with clear variable/function names
- [ ] Function has JSDoc comment describing usage
- [ ] Error messages are informative (especially ENOENT)
- [ ] Types are exported for use by tool handlers (P1.M3)

---

## Anti-Patterns to Avoid

- ❌ Don't use `exec()` or `execSync()` - use `spawn()` for subprocess execution
- ❌ Don't pass arguments as concatenated strings - use arrays to avoid shell injection
- ❌ Don't parse JSON output - return verbatim per PRD Section 8 requirement
- ❌ Don't transform error messages - return mdsel errors unchanged
- ❌ Don't forget to use `.js` extensions in TypeScript imports (ESM requirement)
- ❌ Don't forget the `node:` prefix for built-in module imports
- ❌ Don't put `vi.mock()` inside test functions - mock at top level
- ❌ Don't forget to reset mocks in `beforeEach`
- ❌ Don't determine success by parsing JSON - use exit code only
- ❌ Don't hardcode mdsel path differently than `/home/dustin/.local/bin/mdsel`
- ❌ Don't skip timeout handling - subprocesses can hang indefinitely
- ❌ Don't use relative paths for mdsel - use absolute path
- ❌ Don't add any business logic - this is a thin adapter only
