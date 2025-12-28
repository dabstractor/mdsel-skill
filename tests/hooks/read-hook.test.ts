/**
 * Tests for read-hook.ts
 *
 * Tests the PreToolUse hook that intercepts Read tool invocations
 * and injects behavioral reminders for large Markdown files.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { countWords, getWordThreshold } from '../../src/lib/word-count.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('../../src/lib/word-count.js', () => ({
  countWords: vi.fn(),
  getWordThreshold: vi.fn(),
}));

// Mock process.exit and console.log
const mockExit = vi.fn();
const mockConsoleLog = vi.fn();

describe('read-hook', () => {
  let mockReadFileSync: ReturnType<typeof vi.mocked<typeof readFileSync>>;
  let mockCountWords: ReturnType<typeof vi.mocked<typeof countWords>>;
  let mockGetWordThreshold: ReturnType<typeof vi.mocked<typeof getWordThreshold>>;

  beforeEach(() => {
    // CRITICAL: Reset mocks before each test
    mockReadFileSync = vi.mocked(readFileSync);
    mockCountWords = vi.mocked(countWords);
    mockGetWordThreshold = vi.mocked(getWordThreshold);

    mockReadFileSync.mockClear();
    mockCountWords.mockClear();
    mockGetWordThreshold.mockClear();
    mockExit.mockClear();
    mockConsoleLog.mockClear();

    // Default mocks
    mockGetWordThreshold.mockReturnValue(200);
    mockCountWords.mockReturnValue(150);
  });

  // Helper to simulate hook execution
  async function executeHook(inputJson: string): Promise<{ output: string; exitCode: number }> {
    let output = '';
    let exitCode = 0;

    // Mock console.log to capture output
    mockConsoleLog.mockImplementation((data: string) => {
      output = data;
    });

    // Mock process.exit
    mockExit.mockImplementation((code: number) => {
      exitCode = code;
      throw new Error(`process.exit(${code})`);
    });

    // Mock stdin
    const mockStdinChunks = [inputJson];
    vi.spyOn(process.stdin, ' Symbol.asyncIterator').mockReturnValue(
      (async function* () {
        for (const chunk of mockStdinChunks) {
          yield chunk;
        }
      })()
    );

    try {
      // Import and execute the hook
      await import('../../src/hooks/read-hook.js');
    } catch {
      // Expected - process.exit throws
    }

    return { output, exitCode };
  }

  describe('input parsing', () => {
    it('should parse valid HookInput JSON from stdin', async () => {
      const input = {
        session_id: 'test-session-123',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/test.md',
        },
      };

      const { output, exitCode } = await executeHook(JSON.stringify(input));

      expect(exitCode).toBe(0);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should handle HookInput with all required fields', async () => {
      const input = {
        session_id: 'abc-123',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/path/to/file.md',
        },
      };

      const result = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(result.output);

      expect(parsedOutput).toHaveProperty('continue', true);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('file type filtering', () => {
    it('should pass through non-.md files without reminder', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.txt',
        },
      };

      const { output, exitCode } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(parsedOutput.systemMessage).toBeUndefined();
      expect(exitCode).toBe(0);
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('should pass through .MD files (case insensitive)', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.MD',
        },
      };

      const result = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(result.output);

      expect(parsedOutput.continue).toBe(true);
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    it('should pass through .Md files (mixed case)', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.Md',
        },
      };

      await executeHook(JSON.stringify(input));
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    it('should process .md files', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('some content');
      mockCountWords.mockReturnValue(100);

      await executeHook(JSON.stringify(input));
      expect(mockReadFileSync).toHaveBeenCalledWith('/tmp/file.md', 'utf-8');
      expect(mockCountWords).toHaveBeenCalledWith('some content');
    });

    it('should pass through .json files without processing', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.json',
        },
      };

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('should pass through .ts files without processing', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.ts',
        },
      };

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });
  });

  describe('word count gating', () => {
    it('should not inject reminder when word count <= threshold', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/small.md',
        },
      };

      mockReadFileSync.mockReturnValue('# Small file\n\nContent here');
      mockCountWords.mockReturnValue(150); // Below default threshold of 200
      mockGetWordThreshold.mockReturnValue(200);

      const { output, exitCode } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(parsedOutput.systemMessage).toBeUndefined();
      expect(exitCode).toBe(0);
    });

    it('should inject reminder when word count > threshold', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/large.md',
        },
      };

      mockReadFileSync.mockReturnValue('# Large file\n\n' + 'word '.repeat(250));
      mockCountWords.mockReturnValue(250); // Above default threshold of 200
      mockGetWordThreshold.mockReturnValue(200);

      const { output, exitCode } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput.continue).toBe(true);
      expect(parsedOutput.systemMessage).toBe(
        `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`
      );
      expect(exitCode).toBe(0);
    });

    it('should use exact threshold from getWordThreshold()', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockGetWordThreshold.mockReturnValue(500);

      await executeHook(JSON.stringify(input));

      expect(mockGetWordThreshold).toHaveBeenCalled();
    });

    it('should trigger reminder at exact threshold + 1', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(201);
      mockGetWordThreshold.mockReturnValue(200);

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput.systemMessage).toBeDefined();
    });

    it('should not trigger reminder at exact threshold', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(200);
      mockGetWordThreshold.mockReturnValue(200);

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput.systemMessage).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should gracefully handle missing files', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/nonexistent.md',
        },
      };

      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const { output, exitCode } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(parsedOutput.systemMessage).toBeUndefined();
      expect(exitCode).toBe(0);
    });

    it('should gracefully handle permission errors', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/protected.md',
        },
      };

      mockReadFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const { output, exitCode } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toEqual({ continue: true });
      expect(exitCode).toBe(0);
    });

    it('should always exit with code 0 on file read errors', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/error.md',
        },
      };

      mockReadFileSync.mockImplementation(() => {
        throw new Error('Any error');
      });

      const { exitCode } = await executeHook(JSON.stringify(input));

      expect(exitCode).toBe(0);
    });
  });

  describe('reminder message', () => {
    it('should contain exact reminder message as specified in PRD', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/large.md',
        },
      };

      mockReadFileSync.mockReturnValue('large content');
      mockCountWords.mockReturnValue(300);
      mockGetWordThreshold.mockReturnValue(200);

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      const expectedMessage = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

      expect(parsedOutput.systemMessage).toBe(expectedMessage);
    });

    it('should include newline between sentences in reminder', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/large.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(250);
      mockGetWordThreshold.mockReturnValue(200);

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput.systemMessage).toContain('\n');
    });

    it('should be identical every time (no variation)', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(300);
      mockGetWordThreshold.mockReturnValue(200);

      // Execute hook twice
      const result1 = await executeHook(JSON.stringify(input));
      const result2 = await executeHook(JSON.stringify(input));

      const message1 = JSON.parse(result1.output).systemMessage;
      const message2 = JSON.parse(result2.output).systemMessage;

      expect(message1).toBe(message2);
    });
  });

  describe('exit codes', () => {
    it('should always exit with code 0 (continue)', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(100);

      const { exitCode } = await executeHook(JSON.stringify(input));

      expect(exitCode).toBe(0);
    });

    it('should exit with code 0 even with large file', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/large.md',
        },
      };

      mockReadFileSync.mockReturnValue('large content');
      mockCountWords.mockReturnValue(500);

      const { exitCode } = await executeHook(JSON.stringify(input));

      expect(exitCode).toBe(0);
    });

    it('should exit with code 0 even on errors', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/error.md',
        },
      };

      mockReadFileSync.mockImplementation(() => {
        throw new Error('Any error');
      });

      const { exitCode } = await executeHook(JSON.stringify(input));

      expect(exitCode).toBe(0);
    });
  });

  describe('continue flag', () => {
    it('should always set continue to true', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');

      const result = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(result.output);

      expect(parsedOutput.continue).toBe(true);
    });

    it('should set continue true even when reminder is injected', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/large.md',
        },
      };

      mockReadFileSync.mockReturnValue('large content');
      mockCountWords.mockReturnValue(500);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(result.output);

      expect(parsedOutput.continue).toBe(true);
      expect(parsedOutput.systemMessage).toBeDefined();
    });
  });

  describe('output format', () => {
    it('should output valid JSON', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');

      const { output } = await executeHook(JSON.stringify(input));

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should output HookOutput with correct structure', async () => {
      const input = {
        session_id: 'test',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/tmp/file.md',
        },
      };

      mockReadFileSync.mockReturnValue('content');

      const { output } = await executeHook(JSON.stringify(input));
      const parsedOutput = JSON.parse(output);

      expect(parsedOutput).toHaveProperty('continue');
      expect(typeof parsedOutput.continue).toBe('boolean');

      if (parsedOutput.systemMessage !== undefined) {
        expect(typeof parsedOutput.systemMessage).toBe('string');
      }
    });
  });
});
