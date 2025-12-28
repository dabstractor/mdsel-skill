import { spawn } from 'node:child_process';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { execMdsel } from '../../src/lib/mdsel-cli.js';

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
        'mdsel',
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
        'mdsel',
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

    it('should handle other process errors', async () => {
      const error = new Error('EACCES') as NodeJS.ErrnoException;
      error.code = 'EACCES';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      const result = await execMdsel(['index', 'README.md', '--json']);

      expect(result.success).toBe(false);
      expect(result.stderr).toContain('EACCES');
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

  describe('stdout and stderr capture', () => {
    it('should capture stdout completely', async () => {
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
        killed: false,
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      const testOutput = 'Line 1\nLine 2\nLine 3';
      mockProcess.stdout.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(testOutput));
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

      expect(result.stdout).toBe(testOutput);
      expect(result.success).toBe(true);
    });

    it('should capture stderr completely', async () => {
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

      const testError = 'Warning: Something went wrong\nError: Details here';
      mockProcess.stderr.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(testError));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(1);
        }
      });

      const result = await execMdsel(['index', 'README.md', '--json']);

      expect(result.stderr).toBe(testError);
      expect(result.success).toBe(false);
    });
  });

  describe('exit code mapping', () => {
    it('should map exit code 0 to success: true', async () => {
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
          handler(Buffer.from('{"success":true}'));
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

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it('should map non-zero exit code to success: false', async () => {
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
          handler(Buffer.from('Error occurred'));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(2);
        }
      });

      const result = await execMdsel(['index', 'README.md', '--json']);

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(2);
    });
  });

  describe('timeout behavior', () => {
    it('should set timeout with default value', async () => {
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
          handler(Buffer.from(''));
        }
      });

      // Resolve immediately when close is emitted
      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      // Execute with short timeout
      const result = await execMdsel(['index', 'README.md', '--json'], { timeout: 100 });

      expect(result.success).toBe(true);
    });

    it('should handle timeout option correctly', async () => {
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
          handler(Buffer.from(''));
        }
      });

      // Immediately emit close to simulate successful completion before timeout
      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      // Execute with custom timeout - should complete before timeout
      const result = await execMdsel(['index', 'README.md', '--json'], { timeout: 5000 });

      expect(result.success).toBe(true);
      expect(mockProcess.kill).not.toHaveBeenCalled();
    });
  });

  describe('options handling', () => {
    it('should pass cwd option to spawn', async () => {
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
          handler(Buffer.from(''));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      await execMdsel(['index', 'README.md', '--json'], { cwd: '/custom/path' });

      expect(mockSpawn).toHaveBeenCalledWith(
        'mdsel',
        ['index', 'README.md', '--json'],
        expect.objectContaining({ cwd: '/custom/path' })
      );
    });

    it('should pass env option to spawn', async () => {
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
          handler(Buffer.from(''));
        }
      });

      mockProcess.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          (handler as (code: number) => void)(0);
        }
      });

      const customEnv = { CUSTOM_VAR: 'value' };
      await execMdsel(['index', 'README.md', '--json'], { env: customEnv });

      expect(mockSpawn).toHaveBeenCalledWith(
        'mdsel',
        ['index', 'README.md', '--json'],
        expect.objectContaining({ env: customEnv })
      );
    });
  });
});
