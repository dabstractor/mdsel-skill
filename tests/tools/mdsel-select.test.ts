import { beforeEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { handleMdselSelect } from '../../src/tools/mdsel-select.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('handleMdselSelect', () => {
  let mockSpawn: ReturnType<typeof vi.mocked<typeof spawn>>;

  beforeEach(() => {
    // CRITICAL: Reset mocks before each test
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockClear();
  });

  // Helper function to create a mock process
  function createMockProcess(stdoutData = '', stderrData = '', exitCode = 0) {
    const mockProcess = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn(),
      killed: false,
    };

    // Simulate stdout data event
    mockProcess.stdout.on.mockImplementation((event, handler) => {
      if (event === 'data') {
        handler(Buffer.from(stdoutData));
      }
    });

    // Simulate stderr data event
    mockProcess.stderr.on.mockImplementation((event, handler) => {
      if (event === 'data') {
        handler(Buffer.from(stderrData));
      }
    });

    // Simulate close event with exit code
    mockProcess.on.mockImplementation((event, handler) => {
      if (event === 'close') {
        (handler as (code: number) => void)(exitCode);
      }
    });

    return mockProcess;
  }

  describe('successful execution', () => {
    it('should select content with simple heading selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          command: 'select',
          timestamp: '2025-12-28T00:10:30.065Z',
          data: {
            matches: [
              {
                selector: 'heading:h1[0]',
                type: 'heading',
                content: '# Introduction',
                truncated: false,
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('matches');
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'heading:h1[0]', 'README.md'],
        expect.any(Object)
      );
    });

    it('should select content with namespace-qualified selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          command: 'select',
          data: {
            matches: [{ selector: 'readme::heading:h2[0]', content: '## Features' }],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'readme::heading:h2[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'readme::heading:h2[0]', 'README.md'],
        expect.any(Object)
      );
    });

    it('should select content from multiple files', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: { matches: [], unresolved: [] },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[0]',
        files: ['README.md', 'CONTRIBUTING.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'section[0]', 'README.md', 'CONTRIBUTING.md'],
        expect.any(Object)
      );
    });

    it('should handle selector with full=true query parameter', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: {
            matches: [
              {
                selector: 'section[1]?full=true',
                content: 'Full section content...',
                truncated: false,
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[1]?full=true',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'section[1]?full=true', 'README.md'],
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should return isError: true on invalid selector', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error: Invalid selector syntax', 1);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid:::syntax',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should return isError: true when file not found', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error: Cannot read file: /path/to/missing.md', 2);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['/path/to/missing.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should handle ENOENT error (mdsel not found)', async () => {
      // Arrange
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });
  });

  describe('verbatim passthrough', () => {
    it('should not parse or transform output', async () => {
      // Arrange
      const malformedOutput = '{invalid json output}';
      const mockProcess = createMockProcess(malformedOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert: CRITICAL - Return malformed output verbatim
      expect(result.content[0].text).toBe(malformedOutput);
      expect(result.isError).toBe(false); // Success based on exit code
    });

    it('should preserve multi-line JSON output', async () => {
      // Arrange
      const multiLineOutput = `{
  "success": true,
  "command": "select",
  "data": {
    "matches": [
      {
        "selector": "heading:h1[0]",
        "content": "# Title\\n\\nContent here"
      }
    ]
  }
}`;
      const mockProcess = createMockProcess(multiLineOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(multiLineOutput);
    });
  });

  describe('MCP response format', () => {
    it('should return correct MCP tool response format', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"success":true}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('isError');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.isError).toBe('boolean');
    });

    it('should have isError: false on successful select', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"matches":[]}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'section[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
    });

    it('should have isError: true on failed select', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error message', 1);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid[999]',
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty matches array', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: { matches: [], unresolved: ['heading:h99[0]'] },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h99[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('matches');
    });

    it('should handle complex nested selector', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          success: true,
          data: {
            matches: [
              {
                selector: 'readme::heading:h1[0]/block:code[0]',
                content: '```typescript\\ncode here\\n```',
              },
            ],
            unresolved: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'readme::heading:h1[0]/block:code[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['select', 'readme::heading:h1[0]/block:code[0]', 'README.md'],
        expect.any(Object)
      );
    });
  });
});
