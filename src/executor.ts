import { spawn } from 'node:child_process';

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
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;  // Guard flag to prevent double resolve

    // CRITICAL: NO --json flag - TEXT output only per PRD specification
    // CRITICAL: shell: true for proper command resolution
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
