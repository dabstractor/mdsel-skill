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

    let child: ReturnType<typeof spawn>;

    // CRITICAL: Handle synchronous spawn errors (e.g., ENOENT)
    try {
      // CRITICAL: Use spawn() with array of arguments (avoids shell injection)
      child = spawn(MDSEL_PATH, args, {
        cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        stderr = `mdsel CLI not found at ${MDSEL_PATH}. Install with: npm install -g mdsel`;
      } else {
        stderr = err.message;
      }
      resolve({
        success: false,
        stdout: '',
        stderr,
        exitCode: 1,
      });
      return;
    }

    // Set up timeout mechanism
    const timeoutId = setTimeout(() => {
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
    child.on('close', (code, _signal) => {
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
