/**
 * Tests for read-hook.ts
 *
 * Tests the PreToolUse hook that intercepts Read tool invocations
 * and injects behavioral reminders for large Markdown files.
 */

import { readFileSync } from 'fs';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { processHook, type HookInput } from '../../src/hooks/read-hook.js';
import { countWords, getWordThreshold } from '../../src/lib/word-count.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('../../src/lib/word-count.js', () => ({
  countWords: vi.fn(),
  getWordThreshold: vi.fn(),
}));

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

    // Default mocks
    mockGetWordThreshold.mockReturnValue(200);
    mockCountWords.mockReturnValue(150);
  });

  // Helper to create HookInput
  function createHookInput(filePath: string): HookInput {
    return {
      session_id: 'test-session-123',
      hook_event_name: 'PreToolUse',
      tool_name: 'Read',
      tool_input: {
        file_path: filePath,
      },
    };
  }

  describe('input parsing', () => {
    it('should process valid HookInput', async () => {
      const input = createHookInput('/tmp/test.md');

      const result = await processHook(input);

      expect(result).toHaveProperty('continue', true);
    });

    it('should handle HookInput with all required fields', async () => {
      const input: HookInput = {
        session_id: 'abc-123',
        hook_event_name: 'PreToolUse',
        tool_name: 'Read',
        tool_input: {
          file_path: '/path/to/file.md',
        },
      };

      const result = await processHook(input);

      expect(result.continue).toBe(true);
    });
  });

  describe('file type filtering', () => {
    it('should pass through non-.md files without reminder', async () => {
      const input = createHookInput('/tmp/file.txt');

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
      expect(result.systemMessage).toBeUndefined();
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('should pass through .MD files (case insensitive)', async () => {
      const input = createHookInput('/tmp/file.MD');

      const result = await processHook(input);

      expect(result.continue).toBe(true);
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    it('should pass through .Md files (mixed case)', async () => {
      const input = createHookInput('/tmp/file.Md');

      await processHook(input);
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    it('should process .md files', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('some content');
      mockCountWords.mockReturnValue(100);

      await processHook(input);
      expect(mockReadFileSync).toHaveBeenCalledWith('/tmp/file.md', 'utf-8');
      expect(mockCountWords).toHaveBeenCalledWith('some content');
    });

    it('should pass through .json files without processing', async () => {
      const input = createHookInput('/tmp/file.json');

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('should pass through .ts files without processing', async () => {
      const input = createHookInput('/tmp/file.ts');

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });
  });

  describe('word count gating', () => {
    it('should not inject reminder when word count <= threshold', async () => {
      const input = createHookInput('/tmp/small.md');

      mockReadFileSync.mockReturnValue('# Small file\n\nContent here');
      mockCountWords.mockReturnValue(150); // Below default threshold of 200
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
      expect(result.systemMessage).toBeUndefined();
    });

    it('should inject reminder when word count > threshold', async () => {
      const input = createHookInput('/tmp/large.md');

      mockReadFileSync.mockReturnValue('# Large file\n\n' + 'word '.repeat(250));
      mockCountWords.mockReturnValue(250); // Above default threshold of 200
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result.continue).toBe(true);
      expect(result.systemMessage).toBe(
        `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`
      );
    });

    it('should use exact threshold from getWordThreshold()', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');
      mockGetWordThreshold.mockReturnValue(500);

      await processHook(input);

      expect(mockGetWordThreshold).toHaveBeenCalled();
    });

    it('should trigger reminder at exact threshold + 1', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(201);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result.systemMessage).toBeDefined();
    });

    it('should not trigger reminder at exact threshold', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(200);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result.systemMessage).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should gracefully handle missing files', async () => {
      const input = createHookInput('/tmp/nonexistent.md');

      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
      expect(result.systemMessage).toBeUndefined();
    });

    it('should gracefully handle permission errors', async () => {
      const input = createHookInput('/tmp/protected.md');

      mockReadFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const result = await processHook(input);

      expect(result).toEqual({ continue: true });
    });

    it('should always continue on file read errors', async () => {
      const input = createHookInput('/tmp/error.md');

      mockReadFileSync.mockImplementation(() => {
        throw new Error('Any error');
      });

      const result = await processHook(input);

      expect(result.continue).toBe(true);
    });
  });

  describe('reminder message', () => {
    it('should contain exact reminder message as specified in PRD', async () => {
      const input = createHookInput('/tmp/large.md');

      mockReadFileSync.mockReturnValue('large content');
      mockCountWords.mockReturnValue(300);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      const expectedMessage = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

      expect(result.systemMessage).toBe(expectedMessage);
    });

    it('should include newline between sentences in reminder', async () => {
      const input = createHookInput('/tmp/large.md');

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(250);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result.systemMessage).toContain('\n');
    });

    it('should be identical every time (no variation)', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');
      mockCountWords.mockReturnValue(300);
      mockGetWordThreshold.mockReturnValue(200);

      // Execute hook twice
      const result1 = await processHook(input);
      const result2 = await processHook(input);

      expect(result1.systemMessage).toBe(result2.systemMessage);
    });
  });

  describe('continue flag', () => {
    it('should always set continue to true', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');

      const result = await processHook(input);

      expect(result.continue).toBe(true);
    });

    it('should set continue true even when reminder is injected', async () => {
      const input = createHookInput('/tmp/large.md');

      mockReadFileSync.mockReturnValue('large content');
      mockCountWords.mockReturnValue(500);
      mockGetWordThreshold.mockReturnValue(200);

      const result = await processHook(input);

      expect(result.continue).toBe(true);
      expect(result.systemMessage).toBeDefined();
    });
  });

  describe('output format', () => {
    it('should return valid HookOutput structure', async () => {
      const input = createHookInput('/tmp/file.md');

      mockReadFileSync.mockReturnValue('content');

      const result = await processHook(input);

      expect(result).toHaveProperty('continue');
      expect(typeof result.continue).toBe('boolean');

      if (result.systemMessage !== undefined) {
        expect(typeof result.systemMessage).toBe('string');
      }
    });
  });
});
