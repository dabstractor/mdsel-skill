import { beforeEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { handleMdselIndex } from '../../src/tools/mdsel-index.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('handleMdselIndex', () => {
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
    it('should index a single file and return JSON', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          indexed: ['README.md'],
          selectors: {
            headings: [
              { selector: 'heading:h1[0]', text: 'Introduction', level: 1 },
            ],
            blocks: [
              { selector: 'block:paragraph[0]', wordCount: 42 },
            ],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('indexed');
      expect(result.content[0].text).toContain('selectors');
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', 'README.md'],
        expect.any(Object)
      );
    });

    it('should index multiple files and return JSON', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          indexed: ['README.md', 'CONTRIBUTING.md'],
          selectors: {
            headings: [],
            blocks: [],
          },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['README.md', 'CONTRIBUTING.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('README.md');
      expect(result.content[0].text).toContain('CONTRIBUTING.md');
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', 'README.md', 'CONTRIBUTING.md'],
        expect.any(Object)
      );
    });

    it('should handle absolute file paths correctly', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({ indexed: [], selectors: {} }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['/home/user/docs/file.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', '/home/user/docs/file.md'],
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should return isError: true on non-zero exit code', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error: File not found', 1);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['missing.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should return isError: true on exit code 2', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        '',
        'Error: Invalid selector syntax',
        2
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['invalid.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index', 'invalid.md'],
        expect.any(Object)
      );
    });

    it('should handle ENOENT error (mdsel not found)', async () => {
      // Arrange
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });

    it('should handle other process errors', async () => {
      // Arrange
      const error = new Error('EACCES') as NodeJS.ErrnoException;
      error.code = 'EACCES';

      mockSpawn.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
    });
  });

  describe('verbatim passthrough', () => {
    it('should not parse or transform output', async () => {
      // Arrange
      const malformedOutput = '{invalid json output}';
      const mockProcess = createMockProcess(malformedOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert: CRITICAL - Return malformed output verbatim
      expect(result.content[0].text).toBe(malformedOutput);
      expect(result.isError).toBe(false); // Success based on exit code, not JSON validity
    });

    it('should return stdout exactly as received from mdsel', async () => {
      // Arrange
      const exactOutput = '{"indexed":true,"nested":{"key":"value"}}';
      const mockProcess = createMockProcess(exactOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['file.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(exactOutput);
    });

    it('should preserve multi-line JSON output', async () => {
      // Arrange
      const multiLineOutput = `{
  "indexed": ["README.md"],
  "selectors": {
    "headings": [
      {"selector": "heading:h1[0]", "text": "Title"}
    ]
  }
}`;
      const mockProcess = createMockProcess(multiLineOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['README.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(multiLineOutput);
    });
  });

  describe('empty and edge cases', () => {
    it('should handle empty files array', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({ indexed: [], selectors: {} }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: [],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith(
        '/home/dustin/.local/bin/mdsel',
        ['index'],
        expect.any(Object)
      );
    });

    it('should handle file with no selectors', async () => {
      // Arrange
      const mockProcess = createMockProcess(
        JSON.stringify({
          indexed: ['empty.md'],
          selectors: { headings: [], blocks: [] },
        }),
        '',
        0
      );

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['empty.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('empty.md');
    });

    it('should handle large JSON output', async () => {
      // Arrange
      const largeOutput = JSON.stringify({
        indexed: ['large.md'],
        selectors: {
          headings: Array.from({ length: 100 }, (_, i) => ({
            selector: `heading:h2[${i}]`,
            text: `Section ${i}`,
          })),
          blocks: Array.from({ length: 500 }, (_, i) => ({
            selector: `block:paragraph[${i}]`,
            wordCount: Math.floor(Math.random() * 100),
          })),
        },
      });
      const mockProcess = createMockProcess(largeOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['large.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toBe(largeOutput);
    });
  });

  describe('MCP response format', () => {
    it('should return correct MCP tool response format', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"success":true}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
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

    it('should have isError: false on success', async () => {
      // Arrange
      const mockProcess = createMockProcess('{"indexed":true}', '', 0);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(false);
    });

    it('should have isError: true on failure', async () => {
      // Arrange
      const mockProcess = createMockProcess('', 'Error message', 1);
      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
    });
  });
});
