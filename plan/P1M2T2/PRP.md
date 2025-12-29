# P1.M2.T2: Implement CLI Executor

---

## Goal

**Feature Goal**: Create a child process executor module that spawns `mdsel` CLI commands and captures their text output for consumption by MCP tool handlers.

**Deliverable**: A complete `src/executor.ts` file containing:
- `ExecutorResult` interface for typed execution results
- `executeMdsel()` function using `child_process.spawn()` with promise-based wrapper
- Proper stdout/stderr buffer collection and exit code handling
- TEXT mode output (NOT JSON mode) as per PRD specification
- Export of executor function for use by P1.M3 tool handlers

**Success Definition**:
- `executeMdsel()` function spawns `mdsel` commands with proper arguments
- Function returns `Promise<ExecutorResult>` with success status, stdout, stderr, and exit code
- TEXT output is captured correctly (not JSON - no `--json` flag)
- Non-zero exit codes return `success: false` with error details
- spawn errors are handled gracefully
- All tests pass with mocked `child_process.spawn()`

## User Persona

**Target User**: Claude Code agents and users who invoke mdsel_index and mdsel_select tools through the MCP server interface.

**Use Case**: When Claude Code invokes the mdsel_index or mdsel_select tool, the tool handler delegates to `executeMdsel()` which spawns the actual `mdsel` CLI command and returns its output.

**User Journey**:
1. User's Claude Code agent invokes `mdsel_index` or `mdsel_select` tool
2. Tool handler calls `executeMdsel('index', [...files])` or `executeMdsel('select', [selector, ...files])`
3. `executeMdsel()` spawns a child process running the `mdsel` CLI
4. Child process executes and outputs TEXT format results
5. `executeMdsel()` collects stdout/stderr and returns `ExecutorResult`
6. Tool handler formats result as MCP response and returns to Claude

**Pain Points Addressed**:
- Provides clean async/await interface for spawning mdsel commands
- Abstracts away child_process complexity from tool handlers
- Ensures consistent error handling across all mdsel invocations
- Enables proper testing with mocked spawn functionality

## Why

- **Foundation for P1.M3**: Tool handlers (P1.M3.T1.S2, P1.M3.T2.S2) require `executeMdsel()` to delegate CLI execution
- **Separation of Concerns**: Executor handles process spawning, tool handlers handle MCP protocol
- **Testability**: Mocking `child_process.spawn()` at module boundary enables isolated unit tests
- **Error Consistency**: Single executor ensures uniform error handling across both tools
- **TEXT Output Optimization**: PRD specifies text output mode for token efficiency (not JSON)

## What

Implement a child process executor module that wraps `mdsel` CLI commands.

### Core Implementation

1. **ExecutorResult Interface** (P1.M2.T2.S1):
   - Define interface with `success: boolean`, `stdout: string`, `stderr: string`, `exitCode: number`
   - Export interface for use by tool handlers and tests

2. **executeMdsel Function** (P1.M2.T2.S2):
   - Import `spawn` from `node:child_process` (use `node:` prefix for ESM)
   - Accept `command: 'index' | 'select'` and `args: string[]` parameters
   - Spawn `mdsel` with `[command, ...args]` (NO `--json` flag - TEXT output only)
   - Use `shell: true` option for proper command resolution
   - Collect stdout and stderr into string buffers
   - Return `Promise<ExecutorResult>` on process close
   - Handle spawn errors gracefully

3. **Unit Tests** (P1.M2.T2.S3):
   - Create `src/executor.test.ts` with mocked `child_process`
   - Test success path with exit code 0
   - Test failure path with non-zero exit code
   - Test spawn error handling
   - Verify correct command arguments passed to spawn

### Success Criteria

- [ ] `src/executor.ts` created with `ExecutorResult` interface
- [ ] `executeMdsel()` function exported as default or named export
- [ ] Function uses `spawn()` from `node:child_process` with `shell: true`
- [ ] Command is `mdsel`, args are `[command, ...args]` (no `--json` flag)
- [ ] stdout and stderr are collected into string variables
- [ ] Function returns `Promise<ExecutorResult>` with all fields populated
- [ ] Exit code 0 returns `success: true`
- [ ] Non-zero exit code returns `success: false`
- [ ] `src/executor.test.ts` created with all tests passing
- [ ] `vi.mock('child_process')` used for test isolation
- [ ] Tests verify correct spawn arguments and return values

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete interface specification for `ExecutorResult`
- Exact spawn implementation pattern with `shell: true`
- Clear instructions on TEXT output mode (no `--json` flag)
- Complete testing pattern with Vitest mocking
- Integration points with existing MCP server code
- Build and test commands for validation

### Documentation & References

```yaml
# MUST READ - child_process.spawn patterns

- url: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
  why: Official Node.js documentation for spawn() function and options
  critical: shell: true option required for command resolution, stdio: 'pipe' default for buffer collection

- url: https://nodejs.org/api/child_process.html#class-childprocess
  why: ChildProcess class documentation for close/error events and stdout/stderr streams
  critical: 'close' event provides exit code, stdout/stderr are ReadableStreams

- url: https://github.com/dabstractor/mdsel
  why: Official mdsel repository with CLI command documentation
  critical: TEXT output format (default) vs JSON output (--json flag), exit code meanings

- file: plan/architecture/implementation_patterns.md
  why: Contains the executor pattern from reference implementation
  section: Lines 28-67 show ExecutorResult interface and executeMdsel function
  gotcha: Reference shows JSON mode with --json flag - THIS PROJECT USES TEXT MODE ONLY

- file: plan/architecture/external_deps.md
  why: MCP SDK dependency specifications and mdsel CLI command documentation
  section: Lines 23-113 show mdsel CLI commands with TEXT output format

- file: plan/architecture/system_context.md
  why: System architecture and tool surface specification
  section: Lines 44-57 show exactly two tools with TEXT output requirement

- file: src/index.ts
  why: Existing MCP server initialization from P1.M2.T1
  pattern: Server export pattern for tool registration, ESM import structure
  gotcha: Uses .js extensions in imports - follow same pattern

- file: vitest.config.ts
  why: Test configuration for executor tests
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - tests must match this pattern

- file: tsconfig.json
  why: TypeScript configuration for executor module
  gotcha: strict mode enabled, test files excluded from compilation

- docfile: plan/P1M2T1/PRP.md
  why: Previous PRP showing MCP server initialization patterns
  section: Lines 191-232 show ESM import patterns and TypeScript configuration
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (generated by tsup)
│   ├── index.d.ts                 # TypeScript declarations
│   ├── index.js                   # Compiled JavaScript (with shebang)
│   └── index.js.map              # Source maps
├── src/
│   ├── index.ts                  # MCP server entry point (from P1.M2.T1)
│   ├── executor.ts               # TO BE CREATED: Child process executor
│   └── executor.test.ts          # TO BE CREATED: Executor tests
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md      # mdsel CLI documentation
│   │   ├── implementation_patterns.md  # Executor pattern reference
│   │   └── system_context.md     # System architecture
│   ├── P1M2T1/
│   │   └── PRP.md                # MCP server initialization PRP
│   └── P1M2T2/
│       └── PRP.md                # THIS DOCUMENT
├── package.json                  # Project configuration
├── tsconfig.json                # TypeScript configuration
├── tsup.config.ts               # Build configuration
├── vitest.config.ts             # Test configuration
└── tasks.json                   # Task breakdown with P1.M2.T2 subtasks
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.d.ts
│   ├── index.js
│   ├── index.js.map
│   ├── executor.d.ts            # NEW: Executor type declarations
│   ├── executor.js              # NEW: Compiled executor
│   └── executor.js.map          # NEW: Executor source maps
├── src/
│   ├── index.ts                 # Existing MCP server (unchanged)
│   ├── executor.ts              # NEW: Child process executor module
│   └── executor.test.ts         # NEW: Executor unit tests
├── plan/
│   └── P1M2T2/
│       └── PRP.md               # THIS DOCUMENT
└── ...
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// ALL imports MUST include .js file extensions (not .ts)
// The compiler transforms .js extensions to .ts at build time
// WRONG: import { spawn } from 'child_process';
// CORRECT: import { spawn } from 'node:child_process';

// CRITICAL: node: Prefix for Built-in Modules
// Use 'node:' prefix for clarity and to distinguish from external packages
// WRONG: import { spawn } from 'child_process';
// CORRECT: import { spawn } from 'node:child_process';

// CRITICAL: TEXT Output Mode (NOT JSON)
// PRD specifies TEXT output format, not JSON
// Reference implementation in implementation_patterns.md shows JSON mode
// THIS PROJECT MUST USE TEXT MODE - do NOT add --json flag
// WRONG: spawn('mdsel', [command, '--json', ...args], { shell: true });
// CORRECT: spawn('mdsel', [command, ...args], { shell: true });

// CRITICAL: shell: true Option
// Must use shell: true for proper command resolution on all platforms
// Without shell: true, mdsel must be in PATH with full path specified
// WRONG: spawn('mdsel', args, {});
// CORRECT: spawn('mdsel', args, { shell: true });

// CRITICAL: Stream Event Handling Order
// Must attach 'data' listeners BEFORE calling spawn returns
// Data events can fire before spawn returns if process is very fast
// WRONG: const child = spawn(...); child.stdout.on('data', ...);  // May miss early data
// CORRECT: const child = spawn(...); immediately attach listeners synchronously

// CRITICAL: Buffer Collection Pattern
// String concatenation is simpler and sufficient for mdsel output
// mdsel output is text-based and relatively small
// Use simple string concatenation, not Buffer array
// PATTERN: let stdout = ''; child.stdout.on('data', (d) => { stdout += d.toString(); });

// CRITICAL: Exit Code Handling
// 'close' event provides exit code as first parameter
// Exit code can be null if process was terminated by signal
// PATTERN: child.on('close', (code) => { /* code is number | null */ });

// CRITICAL: Promise Resolution
// Must resolve/reject promise exactly once
// Both 'close' and 'error' events could fire in edge cases
// Use guard flag to prevent double resolution
// PATTERN: let resolved = false; child.on('close', () => { if (!resolved) { resolved = true; resolve(...); }});

// CRITICAL: TypeScript Test File Exclusion
// Files matching *.test.ts are excluded from tsconfig.json
// They are handled by vitest, not the TypeScript compiler
// DO NOT add src/executor.test.ts to tsconfig include array

// CRITICAL: Vitest Mock Module Location
// vi.mock() must be called at top level, not inside describe blocks
// Mocked module must be imported after vi.mock() call
// PATTERN:
//   vi.mock('node:child_process');
//   import { spawn } from 'node:child_process';

// CRITICAL: ExecutorResult Interface Design
// success field is boolean derived from exit code
// exitCode field is number | null (can be null if signal killed)
// stdout and stderr are strings (empty string if no output)
// PATTERN:
//   interface ExecutorResult {
//     success: boolean;
//     stdout: string;
//     stderr: string;
//     exitCode: number | null;
//   }
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// ExecutorResult interface - typed execution result
// Defines the contract between executor and tool handlers
// All fields are populated by executeMdsel function

interface ExecutorResult {
  // success is derived from exit code: true if exitCode === 0, false otherwise
  success: boolean;

  // stdout contains all text output from mdsel CLI (TEXT format, not JSON)
  // Empty string if no stdout output
  stdout: string;

  // stderr contains error messages from mdsel CLI
  // Empty string if no stderr output
  stderr: string;

  // exitCode is the process exit code (0 = success, non-zero = error)
  // Can be null if process was terminated by signal
  exitCode: number | null;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/executor.ts - Import Dependencies and Define Interface
  - IMPORT: spawn from 'node:child_process' (use node: prefix for ESM)
  - DEFINE: ExecutorResult interface with success, stdout, stderr, exitCode fields
  - EXPORT: ExecutorResult interface for use by tool handlers and tests
  - NAMING: Use exact interface and field names as specified
  - PLACEMENT: Top of src/executor.ts
  - GOTCHA: Use .js extension in import path even though source is .ts

Task 2: IMPLEMENT executeMdsel Function - Core Promise Wrapper
  - CREATE: async function executeMdsel(command: 'index' | 'select', args: string[]): Promise<ExecutorResult>
  - IMPLEMENT: return new Promise<ExecutorResult>((resolve) => { ... });
  - DECLARE: let stdout = '', stderr = '', resolved = false; at Promise scope
  - SPAWN: const child = spawn('mdsel', [command, ...args], { shell: true, env: process.env });
  - GOTCHA: NO --json flag - TEXT output only per PRD specification
  - GOTCHA: Use guard flag 'resolved' to prevent double resolve

Task 3: ATTACH Stream Event Handlers
  - IMPLEMENT: child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
  - IMPLEMENT: child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });
  - GOTCHA: Use optional chaining (?.) because stdout/stderr can be null
  - GOTCHA: Call .toString() on Buffer to get string data

Task 4: ATTACH Process Event Handlers
  - IMPLEMENT: child.on('close', (code: number | null) => {
                if (!resolved) { resolved = true; resolve({ success: code === 0, stdout, stderr, exitCode: code }); }
              });
  - IMPLEMENT: child.on('error', (error: Error) => {
                if (!resolved) { resolved = true; resolve({ success: false, stdout: '', stderr: error.message, exitCode: null }); }
              });
  - GOTCHA: Both close and error can fire - use resolved guard flag
  - GOTCHA: exitCode is null on error event

Task 5: EXPORT executeMdsel Function
  - EXPORT: export { executeMdsel, ExecutorResult }; at end of file
  - ALTERNATIVE: export async function executeMdsel(...) { ... } directly
  - GOTCHA: Export both function and interface for tool handler imports

Task 6: CREATE src/executor.test.ts - Test File Setup
  - IMPORT: describe, it, expect, vi, beforeEach from 'vitest'
  - MOCK: vi.mock('node:child_process'); at top level before imports
  - IMPORT: spawn from 'node:child_process' (must be after vi.mock())
  - IMPORT: executeMdsel, ExecutorResult from './executor.js' (use .js extension)
  - GOTCHA: vi.mock() must come before import of mocked module
  - GOTCHA: Use .js extension in import path

Task 7: IMPLEMENT Unit Tests
  - CREATE: beforeEach(() => { vi.clearAllMocks(); });
  - TEST: should spawn mdsel with correct command and args (index command)
  - TEST: should spawn mdsel with correct command and args (select command)
  - TEST: should return success:true when exit code is 0
  - TEST: should return success:false when exit code is non-zero
  - TEST: should capture stdout correctly
  - TEST: should capture stderr correctly
  - TEST: should handle spawn errors
  - MOCK: Create mock ChildProcess with on, stdout, stderr properties
  - GOTCHA: Mock must be returned by vi.mocked(spawn)

Task 8: BUILD and Validate
  - RUN: npm run build to compile TypeScript
  - VERIFY: dist/executor.js and dist/executor.d.ts generated
  - RUN: npm test to execute all tests including new executor tests
  - VERIFY: All executor tests pass
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// EXECUTOR RESULT INTERFACE (Task 1)
// ============================================================

/**
 * Result of executing an mdsel CLI command.
 *
 * @example
 * const result = await executeMdsel('index', ['README.md']);
 * if (result.success) {
 *   console.log(result.stdout);
 * } else {
 *   console.error(result.stderr);
 * }
 */
export interface ExecutorResult {
  /** True if exit code was 0, false otherwise */
  success: boolean;

  /** Standard output from mdsel CLI (TEXT format, not JSON) */
  stdout: string;

  /** Standard error output from mdsel CLI */
  stderr: string;

  /** Process exit code (0 = success, non-zero = error, null = signal termination) */
  exitCode: number | null;
}

// ============================================================
// EXECUTE FUNCTION SIGNATURE (Task 2)
// ============================================================

/**
 * Execute an mdsel CLI command and capture output.
 *
 * Spawns the mdsel CLI as a child process and collects stdout/stderr.
 * Uses TEXT output mode (not JSON) for token efficiency.
 *
 * @param command - The mdsel subcommand to execute ('index' or 'select')
 * @param args - Additional arguments to pass to mdsel
 * @returns Promise resolving to ExecutorResult with captured output
 *
 * @example
 * // Index a markdown file
 * const result = await executeMdsel('index', ['README.md']);
 *
 * @example
 * // Select content using a selector
 * const result = await executeMdsel('select', ['h2.0', 'README.md']);
 */
export async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult>

// ============================================================
// SPAWN CALL PATTERN (Task 2)
// ============================================================

import { spawn } from 'node:child_process';

async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    // CRITICAL: NO --json flag - TEXT output only
    // CRITICAL: shell: true for command resolution
    const child = spawn('mdsel', [command, ...args], {
      shell: true,
      env: process.env
    });

    // Buffer collection and event handlers...
  });
}

// GOTCHA: Do NOT add --json flag
// WRONG: spawn('mdsel', [command, '--json', ...args], ...)
// CORRECT: spawn('mdsel', [command, ...args], ...)

// GOTCHA: shell: true is required for PATH resolution
// Without shell: true, must use full path to mdsel executable

// ============================================================
// BUFFER COLLECTION PATTERN (Task 3)
// ============================================================

async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;  // Guard flag

    const child = spawn('mdsel', [command, ...args], {
      shell: true,
      env: process.env
    });

    // Collect stdout data
    // CRITICAL: Use optional chaining (?.) - stdout can be null
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    // Collect stderr data
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Process event handlers...
  });
}

// GOTCHA: Use .toString() to convert Buffer to string
// GOTCHA: Use optional chaining ?.on() because streams might be null

// ============================================================
// PROCESS EVENT HANDLERS (Task 4)
// ============================================================

async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;

    const child = spawn('mdsel', [command, ...args], {
      shell: true,
      env: process.env
    });

    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    // Handle process close (normal exit)
    child.on('close', (code: number | null) => {
      if (!resolved) {
        resolved = true;
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code
        });
      }
    });

    // Handle spawn errors (command not found, permission denied, etc.)
    child.on('error', (error: Error) => {
      if (!resolved) {
        resolved = true;
        resolve({
          success: false,
          stdout: '',
          stderr: error.message,
          exitCode: null
        });
      }
    });
  });
}

// GOTCHA: Both 'close' and 'error' can fire - use resolved guard
// GOTCHA: exitCode is null on error event
// GOTCHA: success is boolean derived from exitCode === 0

// ============================================================
// COMPLETE IMPLEMENTATION (Tasks 1-5 combined)
// ============================================================

import { spawn } from 'node:child_process';

export interface ExecutorResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;

    const child = spawn('mdsel', [command, ...args], {
      shell: true,
      env: process.env
    });

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code: number | null) => {
      if (!resolved) {
        resolved = true;
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code
        });
      }
    });

    child.on('error', (error: Error) => {
      if (!resolved) {
        resolved = true;
        resolve({
          success: false,
          stdout: '',
          stderr: error.message,
          exitCode: null
        });
      }
    });
  });
}

// ============================================================
// TEST MOCK PATTERN (Tasks 6-7)
// ============================================================

// src/executor.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawn } from 'node:child_process';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('node:child_process');

import { executeMdsel, ExecutorResult } from './executor.js';

describe('executeMdsel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should spawn mdsel with index command and files', async () => {
    // Create mock ChildProcess
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);  // Exit code 0 = success
        return mockProcess;
      }),
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('h1.0 Test\n h2.0 Section\n---\ncode:0 para:1\n');
        })
      },
      stderr: {
        on: vi.fn()
      }
    };

    // Mock spawn to return our mock process
    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    // Execute and verify
    const result = await executeMdsel('index', ['README.md']);

    // Verify spawn was called correctly
    expect(spawn).toHaveBeenCalledWith('mdsel', ['index', 'README.md'], {
      shell: true,
      env: process.env
    });

    // Verify result
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('h1.0 Test');
  });

  it('should return success:false when exit code is non-zero', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(1);  // Exit code 1 = error
        return mockProcess;
      }),
      stdout: { on: vi.fn() },
      stderr: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('Error: File not found\n');
        })
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['nonexistent.md']);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error: File not found');
  });

  it('should spawn mdsel with select command and selector', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);
        return mockProcess;
      }),
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('## Test Section\n\nContent here\n');
        })
      },
      stderr: { on: vi.fn() }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('select', ['h2.0', 'README.md']);

    expect(spawn).toHaveBeenCalledWith('mdsel', ['select', 'h2.0', 'README.md'], {
      shell: true,
      env: process.env
    });
    expect(result.success).toBe(true);
  });

  it('should handle spawn errors', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'error') {
          callback(new Error('ENOENT: mdsel not found'));
        }
        return mockProcess;
      }),
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['README.md']);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(null);
    expect(result.stderr).toContain('ENOENT');
  });
});

// GOTCHA: vi.mock() must be at top level, not inside describe
// GOTCHA: Import mocked module after vi.mock() call
// GOTCHA: Use vi.mocked(spawn) for type-safe mock access
// GOTCHA: Mock process must have on(), stdout, stderr properties
```

### Integration Points

```yaml
PACKAGE.JSON:
  - verified: "type": "module" enables ESM
  - verified: "engines": {"node": ">=18.0.0"} for mdsel compatibility
  - verified: "peerDependencies": {"mdsel": "^1.0.0"}
  - no changes needed for this task

TSCONFIG.JSON:
  - verified: "strict": true for type safety
  - verified: "exclude": ["**/*.test.ts"] prevents test compilation by tsc
  - no changes needed for this task

VITEST.CONFIG.TS:
  - verified: test.include: ['src/**/*.{test,spec}.{js,ts}']
  - note: src/executor.test.ts will be picked up by vitest automatically
  - no changes needed for this task

P1.M2.T1 (PREVIOUS TASK):
  - src/index.ts exports server instance
  - integration: executor will be imported by tool handlers in P1.M3

P1.M3 (FUTURE MILESTONE):
  - P1.M3.T1.S2 (mdsel_index) will import executeMdsel from 'node:child_process'
  - P1.M3.T2.S2 (mdsel_select) will import executeMdsel from 'node:child_process'
  - integration: executor enables thin tool handler pattern

BUILD OUTPUT:
  - npm run build will compile src/executor.ts to dist/executor.js
  - dist/executor.d.ts will contain ExecutorResult type declarations
  - dist/executor.js will be ESM module with executeMdsel export
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing src/executor.ts implementation - fix before proceeding
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
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/executor.js generated successfully
# - dist/executor.d.ts generated successfully
# - ExecutorResult interface is in .d.ts file
# - executeMdsel function is exported

# Verify generated type definitions:
cat dist/executor.d.ts

# Expected: Should contain ExecutorResult interface and executeMdsel export
# export interface ExecutorResult { ... }
# export declare function executeMdsel(...)

# Verify ESM format in built output:
head -n 10 dist/executor.js

# Expected: Should not have shebang (only index.js has shebang)
# Should be ESM format with imports/exports

# If errors occur:
# - Check import uses 'node:child_process' with node: prefix
# - Check no type errors in ExecutorResult interface
# - Read TypeScript error messages carefully
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test executor implementation
npm test executor

# Expected Output:
# > mdsel-claude@1.0.0 test
# > vitest run
#
# ✓ src/executor.test.ts (7)
#   ✓ executeMdsel
#     ✓ should spawn mdsel with index command and files
#     ✓ should spawn mdsel with select command and files
#     ✓ should return success:true when exit code is 0
#     ✓ should return success:false when exit code is non-zero
#     ✓ should capture stdout correctly
#     ✓ should capture stderr correctly
#     ✓ should handle spawn errors
#
# Test Files  1 passed (1)
# Tests  7 passed (7)

# Full test suite:
npm test

# Expected: All tests pass, including executor tests

# If tests fail:
# - Check vi.mock() is at top level before imports
# - Check mock process has all required properties (on, stdout, stderr)
# - Check spawn is called with correct arguments
# - Verify mock callbacks are triggered (close, error, data events)

# Debug failing tests:
npm test executor --reporter=verbose

# Watch mode for iterative development:
npm test -- --watch executor
```

### Level 3: Integration Testing (System Validation)

```bash
# Test executor with real mdsel CLI (if mdsel is installed)
node -e "
import { executeMdsel } from './dist/executor.js';
const result = await executeMdsel('index', ['./package.json']);
console.log('success:', result.success);
console.log('stdout:', result.stdout);
console.log('exitCode:', result.exitCode);
"

# Expected: Should execute mdsel index command and return output
# Note: This test requires mdsel CLI to be installed (npm install -g mdsel)

# Test with invalid file (error handling):
node -e "
import { executeMdsel } from './dist/executor.js';
const result = await executeMdsel('index', ['./nonexistent.md']);
console.log('success:', result.success);
console.log('stderr:', result.stderr);
"

# Expected: success should be false, stderr should contain error from mdsel

# If integration tests fail:
# - Verify mdsel is installed: which mdsel
# - Check spawn is using shell: true option
# - Verify command arguments are passed correctly

# Verify executor exports:
node -e "
import { executeMdsel, ExecutorResult } from './dist/executor.js';
console.log('executeMdsel:', typeof executeMdsel);
console.log('ExecutorResult exists:', typeof ExecutorResult !== 'undefined');
"

# Expected:
# executeMdsel: function
# ExecutorResult exists: true
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check ESM imports use node: prefix:
grep -n "import.*child_process" src/executor.ts

# Expected: import { spawn } from 'node:child_process';

# 2. Check ExecutorResult interface is exported:
grep -n "export interface ExecutorResult" src/executor.ts

# Expected: export interface ExecutorResult {

# 3. Check executeMdsel function is exported:
grep -n "export.*function executeMdsel" src/executor.ts

# Expected: export async function executeMdsel(

# 4. Check spawn is called with shell: true:
grep -n "spawn.*shell.*true" src/executor.ts

# Expected: spawn('mdsel', [command, ...args], { shell: true,

# 5. Verify NO --json flag is present:
grep -n "\\-\\-json" src/executor.ts

# Expected: No results (should NOT use --json flag)

# 6. Check guard flag for double-resolve prevention:
grep -n "resolved" src/executor.ts

# Expected: let resolved = false; and if (!resolved) checks

# 7. Check test file has vi.mock at top level:
head -n 10 src/executor.test.ts | grep vi.mock

# Expected: vi.mock('node:child_process');

# 8. Verify all event handlers are attached:
grep -n "\.on('data'" src/executor.ts

# Expected: child.stdout?.on('data', ...) and child.stderr?.on('data', ...)
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/executor.js and dist/executor.d.ts generated successfully
- [ ] ExecutorResult interface exported in dist/executor.d.ts
- [ ] executeMdsel function exported in dist/executor.d.ts
- [ ] All imports use `node:` prefix with `.js` extensions
- [ ] Level 2 validation passed: `npm test executor` shows all tests passing
- [ ] Mock setup uses vi.mock() correctly at top level
- [ ] Tests verify spawn arguments, success/failure paths, error handling
- [ ] Level 3 validation passed: Real mdsel commands can be executed
- [ ] TEXT output (not JSON) is captured correctly
- [ ] Exit codes are properly converted to success boolean

### Feature Validation

- [ ] ExecutorResult interface has exactly 4 fields: success, stdout, stderr, exitCode
- [ ] executeMdsel accepts `command: 'index' | 'select'` parameter
- [ ] executeMdsel accepts `args: string[]` parameter
- [ ] Function returns `Promise<ExecutorResult>`
- [ ] spawn uses `shell: true` option
- [ ] spawn command is `mdsel` with arguments `[command, ...args]`
- [ ] NO `--json` flag is added (TEXT output mode)
- [ ] stdout buffer collects data with `data.toString()`
- [ ] stderr buffer collects data with `data.toString()`
- [ ] close event handler resolves promise with result
- [ ] error event handler resolves promise with error result
- [ ] Guard flag prevents double promise resolution
- [ ] Exit code 0 returns `success: true`
- [ ] Non-zero exit code returns `success: false`
- [ ] Exit code is `null` on spawn error

### Code Quality Validation

- [ ] Follows ESM import pattern with `node:` prefix
- [ ] Uses optional chaining `?.` for stdout/stderr access
- [ ] Properly types Buffer parameter in data event handlers
- [ ] Properly types Error parameter in error event handler
- [ ] Properly types exit code as `number | null`
- [ ] Guard flag pattern prevents race conditions
- [ ] Function has JSDoc comments for documentation
- [ ] Interface has JSDoc comments for documentation
- [ ] Test file uses vi.mock() correctly before imports
- [ ] Tests cover success, failure, and error paths
- [ ] Mock ChildProcess objects have all required properties

### Integration Readiness

- [ ] executeMdsel can be imported by tool handlers in P1.M3
- [ ] ExecutorResult type can be imported by tool handlers in P1.M3
- [ ] Function signature matches P1.M3.T1.S2 and P1.M3.T2.S2 requirements
- [ ] No dependencies on P1.M3 components (pure executor module)
- [ ] Ready for P1.M3.T1.S2 (mdsel_index tool handler)
- [ ] Ready for P1.M3.T2.S2 (mdsel_select tool handler)
- [ ] Test coverage sufficient for regression prevention

---

## Anti-Patterns to Avoid

- [ ] Don't import `child_process` without `node:` prefix - use `import { spawn } from 'node:child_process'`
- [ ] Don't add `--json` flag to spawn arguments - TEXT output only per PRD
- [ ] Don't forget `shell: true` option - required for PATH resolution
- [ ] Don't use synchronous spawn - always use async/await with Promise wrapper
- [ ] Don't skip guard flag - may cause double promise resolution
- [ ] Don't forget optional chaining `?.` for stdout/stderr - can be null
- [ ] Don't forget to call `.toString()` on Buffer data - returns Buffer otherwise
- [ ] Don't put `vi.mock()` inside `describe` block - must be at top level
- [ ] Don't import mocked module before `vi.mock()` call - causes reference to real module
- [ ] Don't forget to export both interface and function - tool handlers need both
- [ ] Don't use `exec()` instead of `spawn()` - spawn is more secure and efficient
- [ ] Don't hardcode environment variables - pass `process.env` to spawn
- [ ] Don't assume exit code is always number - can be `null` on signal termination

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete implementation pattern with exact code structure
- Research-backed best practices for child_process.spawn()
- Comprehensive testing pattern with Vitest mocking
- All gotchas documented with correct/incorrect examples
- TEXT output mode clearly specified (no confusion with JSON mode)
- Integration points clearly defined with downstream task dependencies
- Validation gates are deterministic and checkable

**Expected Implementation Time**: ~30-45 minutes for a developer familiar with TypeScript and child processes

**Risk Factors**:
- ESM `node:` prefix requirement (mitigated: explicit examples provided)
- TEXT vs JSON output confusion (mitigated: multiple warnings about --json flag)
- Vitest mock setup complexity (mitigated: complete mock pattern provided)
- Double promise resolution race condition (mitigated: guard flag pattern documented)

**Post-Implementation**:
- Executor will be ready for P1.M3.T1.S2 (mdsel_index tool handler)
- Executor will be ready for P1.M3.T2.S2 (mdsel_select tool handler)
- P1.M3.T3.S2 will add integration tests for complete server with tools
- Tool handlers will delegate all CLI execution to executeMdsel()
