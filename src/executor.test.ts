import { describe, it, expect, vi, beforeEach } from 'vitest';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('node:child_process');

import { spawn } from 'node:child_process';
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
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('select', ['h2.0', 'README.md']);

    expect(spawn).toHaveBeenCalledWith('mdsel', ['select', 'h2.0', 'README.md'], {
      shell: true,
      env: process.env
    });
    expect(result.success).toBe(true);
  });

  it('should return success:true when exit code is 0', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);  // Exit code 0 = success
        return mockProcess;
      }),
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('h1.0 Test\n---\ncode:0 para:1\n');
        })
      },
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['README.md']);

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should return success:false when exit code is non-zero', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(1);  // Exit code 1 = error
        return mockProcess;
      }),
      stdout: {
        on: vi.fn()
      },
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

  it('should capture stdout correctly', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);
        return mockProcess;
      }),
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('h1.0 Test Heading\n---\ncode:0 para:1\n');
        })
      },
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['README.md']);

    expect(result.stdout).toBe('h1.0 Test Heading\n---\ncode:0 para:1\n');
  });

  it('should capture stderr correctly', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(1);
        return mockProcess;
      }),
      stdout: {
        on: vi.fn()
      },
      stderr: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('Error processing file\n');
        })
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['invalid.md']);

    expect(result.stderr).toBe('Error processing file\n');
  });

  it('should handle spawn errors', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'error') {
          callback(new Error('ENOENT: mdsel not found'));
        }
        return mockProcess;
      }),
      stdout: {
        on: vi.fn()
      },
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['README.md']);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(null);
    expect(result.stderr).toContain('ENOENT');
  });

  it('should not use --json flag (TEXT output mode)', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);
        return mockProcess;
      }),
      stdout: {
        on: vi.fn()
      },
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    await executeMdsel('index', ['README.md']);

    const spawnArgs = vi.mocked(spawn).mock.calls[0];
    const args = spawnArgs[1] as string[];

    // Verify --json flag is NOT present
    expect(args).not.toContain('--json');
    // Verify command and args are correct
    expect(args[0]).toBe('index');
    expect(args[1]).toBe('README.md');
  });
});
