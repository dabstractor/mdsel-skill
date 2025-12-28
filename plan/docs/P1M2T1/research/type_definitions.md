# TypeScript Type Definitions for mdsel CLI Executor

## Overview

This document defines the TypeScript interfaces needed for the mdsel CLI executor in P1.M2.T1.

## Core Type: MdselResult

The primary return type for the `execMdsel` function.

```typescript
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
  /** Process exit code (null if process was terminated by signal) */
  exitCode: number | null;
}
```

## mdsel Response Types (for documentation only)

**NOTE**: Per PRD Section 8, these types are for **documentation only**. The actual implementation does NOT parse or validate mdsel JSON output. All output is returned verbatim as strings.

### Generic Response Envelope

```typescript
/**
 * Generic mdsel CLI response envelope
 * DO NOT USE for parsing - for documentation reference only
 */
export interface MdselResponseEnvelope<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;
  data: T | null;
  errors?: MdselErrorEntry[];
}

/**
 * Error entry from mdsel
 */
export interface MdselErrorEntry {
  type: string;
  code?: string;
  message: string;
  selector?: string;
}
```

### Index Response Types

```typescript
/**
 * mdsel index response structure
 * DO NOT USE for parsing - for documentation reference only
 */
export interface MdselIndexResponse {
  success: boolean;
  command: 'index';
  timestamp: string;
  data: {
    documents: MdselDocumentInfo[];
    summary: MdselSummary;
  } | null;
}

export interface MdselDocumentInfo {
  namespace: string;
  file_path: string;
  headings: MdselHeadingInfo[];
  blocks: {
    paragraphs: number;
    code_blocks: number;
    lists: number;
    tables: number;
    blockquotes: number;
  };
}

export interface MdselHeadingInfo {
  selector: string;
  type: string;
  depth: number;
  text: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
  section_word_count: number;
  section_truncated: boolean;
}

export interface MdselSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}
```

### Select Response Types

```typescript
/**
 * mdsel select response structure
 * DO NOT USE for parsing - for documentation reference only
 */
export interface MdselSelectResponse {
  success: boolean;
  command: 'select';
  timestamp: string;
  data: {
    matches: MdselMatch[];
    unresolved: MdselUnresolved[];
  } | null;
}

export interface MdselMatch {
  selector: string;
  type: string;
  content: string;
  truncated: boolean;
  children_available?: MdselChildInfo[];
}

export interface MdselChildInfo {
  selector: string;
  type: string;
  preview: string;
}

export interface MdselUnresolved {
  selector: string;
  reason: string;
  suggestions?: string[];
}
```

## Command Options Type

```typescript
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
```

## Error Types

```typescript
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

## Function Signature

````typescript
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
export async function execMdsel(args: string[], options?: MdselExecOptions): Promise<MdselResult>;
````

## Complete src/types.ts for P1.M2.T1.S1

```typescript
// src/types.ts

/**
 * Type definitions for mdsel CLI executor
 */

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

## Type Exports for Tool Handlers

The types needed by tool handlers (P1.M3) are:

```typescript
// Exported from src/types.ts
export type { MdselResult, MdselExecOptions };
export { MdselExecutionError, MdselNotFoundError, MdselTimeoutError };
```

## Type Export Usage in Tool Handlers

```typescript
// src/tools/mdsel-index.ts (P1.M3.T1)
import type { MdselResult } from '../../types.js';
import { execMdsel } from '../../lib/mdsel-cli.js';

async function handleMdselIndex(args: { files: string[] }) {
  const result: MdselResult = await execMdsel(['index', ...args.files, '--json']);

  return {
    content: [{ type: 'text', text: result.stdout }],
    isError: !result.success,
  };
}
```

## References

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
- **TypeScript Utility Types**: https://www.typescriptlang.org/docs/handbook/utility-types.html
- **External Dependencies**: `/home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/external_deps.md`
- **Tool Definitions**: `/home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/tool_definitions.md`
