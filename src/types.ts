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
