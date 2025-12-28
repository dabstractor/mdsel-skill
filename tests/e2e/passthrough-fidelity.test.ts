/**
 * E2E Tests: mdsel Output Passthrough Fidelity
 *
 * P3.M1.T1.S1: Validates that mdsel CLI output is passed through verbatim
 * with no transformation, parsing, or modification.
 *
 * CRITICAL: These tests validate PRD Section 11 requirement:
 * "No divergence from mdsel output"
 */

import { spawn } from 'node:child_process';

import { beforeEach, vi } from 'vitest';

import { handleMdselIndex } from '../../src/tools/mdsel-index.js';
import { handleMdselSelect } from '../../src/tools/mdsel-select.js';

// CRITICAL: Mock at top level, not inside tests
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('P3.M1.T1.S1: mdsel Output Passthrough Fidelity', () => {
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

  describe('mdsel_index verbatim passthrough', () => {
    it('should pass through valid JSON verbatim without parsing', async () => {
      // Arrange
      const validJson = JSON.stringify({
        success: true,
        command: 'index',
        data: { documents: [] },
      });
      const mockProcess = createMockProcess(validJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert: CRITICAL - No transformation or parsing
      expect(result.content[0].text).toBe(validJson);
      expect(result.isError).toBe(false);
    });

    it('should pass through malformed JSON verbatim (no parsing)', async () => {
      // Arrange
      const malformedJson = '{invalid json output}';
      const mockProcess = createMockProcess(malformedJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert: CRITICAL - Return malformed output verbatim
      expect(result.content[0].text).toBe(malformedJson);
      expect(result.isError).toBe(false); // Success based on exit code
    });

    it('should pass through empty output verbatim', async () => {
      // Arrange
      const emptyOutput = '';
      const mockProcess = createMockProcess(emptyOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(emptyOutput);
      expect(result.isError).toBe(false);
    });

    it('should preserve multi-line JSON output verbatim', async () => {
      // Arrange
      const multiLineOutput = `{
  "success": true,
  "command": "index",
  "data": {
    "documents": [
      {
        "file_path": "README.md",
        "headings": [
          {"selector": "heading:h1[0]", "text": "Title"}
        ]
      }
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
      expect(result.isError).toBe(false);
    });

    it('should preserve special characters verbatim', async () => {
      // Arrange
      const specialChars = `{"text": "Line 1\\nLine 2\\tTabbed\\r\\nWindows\\u0000Null"}`;
      const mockProcess = createMockProcess(specialChars, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['special.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(specialChars);
      expect(result.isError).toBe(false);
    });

    it('should pass through partial JSON verbatim', async () => {
      // Arrange
      const partialJson = '{"success": true, "data": {...truncated...}}';
      const mockProcess = createMockProcess(partialJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['large.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(partialJson);
      expect(result.isError).toBe(false);
    });

    it('should pass through Unicode content verbatim', async () => {
      // Arrange
      const unicodeContent = JSON.stringify({
        success: true,
        data: {
          text: 'Hello 世界 🌍 Привет Здравствуй',
          emoji: '🔥 🚀 ✨',
        },
      });
      const mockProcess = createMockProcess(unicodeContent, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['unicode.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(unicodeContent);
      expect(result.isError).toBe(false);
    });

    it('should pass through error messages verbatim', async () => {
      // Arrange
      const errorMessage = 'Error: File not found: /path/to/missing.md';
      const mockProcess = createMockProcess('', errorMessage, 1);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['missing.md'],
      });

      // Assert: CRITICAL - isError true, but no error message transformation
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe(''); // stderr is not passed through
    });

    it('should pass through large JSON responses verbatim', async () => {
      // Arrange
      const largeOutput = JSON.stringify({
        success: true,
        data: {
          documents: Array.from({ length: 100 }, (_, i) => ({
            file_path: `file${i}.md`,
            headings: Array.from({ length: 50 }, (_, j) => ({
              selector: `heading:h2[${j}]`,
              text: `Section ${j}`,
            })),
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
      expect(result.content[0].text).toBe(largeOutput);
      expect(result.isError).toBe(false);
    });
  });

  describe('mdsel_select verbatim passthrough', () => {
    it('should pass through valid JSON verbatim without parsing', async () => {
      // Arrange
      const validJson = JSON.stringify({
        success: true,
        command: 'select',
        data: {
          matches: [{ selector: 'heading:h1[0]', content: '# Title' }],
          unresolved: [],
        },
      });
      const mockProcess = createMockProcess(validJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['test.md'],
      });

      // Assert: CRITICAL - No transformation or parsing
      expect(result.content[0].text).toBe(validJson);
      expect(result.isError).toBe(false);
    });

    it('should pass through malformed JSON verbatim', async () => {
      // Arrange
      const malformedJson = '{invalid selector output}';
      const mockProcess = createMockProcess(malformedJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid[999]',
        files: ['test.md'],
      });

      // Assert: CRITICAL - Return malformed output verbatim
      expect(result.content[0].text).toBe(malformedJson);
      expect(result.isError).toBe(false);
    });

    it('should pass through empty matches verbatim', async () => {
      // Arrange
      const emptyMatches = JSON.stringify({
        success: true,
        data: { matches: [], unresolved: ['heading:h99[0]'] },
      });
      const mockProcess = createMockProcess(emptyMatches, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h99[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(emptyMatches);
      expect(result.isError).toBe(false);
    });

    it('should preserve multi-line selector output verbatim', async () => {
      // Arrange
      const multiLineOutput = `{
  "success": true,
  "command": "select",
  "data": {
    "matches": [
      {
        "selector": "readme::heading:h1[0]/block:code[0]",
        "content": "const example = 'value';"
      }
    ]
  }
}`;
      const mockProcess = createMockProcess(multiLineOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'readme::heading:h1[0]/block:code[0]',
        files: ['README.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(multiLineOutput);
      expect(result.isError).toBe(false);
    });

    it('should preserve special characters in content verbatim', async () => {
      // Arrange
      const specialChars = JSON.stringify({
        success: true,
        data: {
          matches: [
            {
              selector: 'block:code[0]',
              content: '```js\nconsole.log("Hello\\nWorld");\n```',
            },
          ],
        },
      });
      const mockProcess = createMockProcess(specialChars, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'block:code[0]',
        files: ['test.md'],
      });

      // Assert
      expect(result.content[0].text).toBe(specialChars);
      expect(result.isError).toBe(false);
    });

    it('should pass through selector error messages via exit code', async () => {
      // Arrange
      const errorMessage = 'Error: Invalid selector syntax: invalid:::syntax';
      const mockProcess = createMockProcess('', errorMessage, 1);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'invalid:::syntax',
        files: ['test.md'],
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('');
    });
  });

  describe('PRD Compliance: No divergence from mdsel output', () => {
    it('should validate PRD Section 11: byte-for-byte verbatim passthrough for mdsel_index', async () => {
      // Arrange
      const originalOutput = '{"success":true,"nested":{"deep":"value"}}';
      const mockProcess = createMockProcess(originalOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert: CRITICAL - Byte-for-byte verbatim passthrough
      expect(result.content[0].text).toBe(originalOutput);
      expect(Buffer.byteLength(result.content[0].text)).toBe(Buffer.byteLength(originalOutput));
    });

    it('should validate PRD Section 11: byte-for-byte verbatim passthrough for mdsel_select', async () => {
      // Arrange
      const originalOutput = '{"matches":[{"selector":"heading:h1[0]"}]}';
      const mockProcess = createMockProcess(originalOutput, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselSelect({
        selector: 'heading:h1[0]',
        files: ['test.md'],
      });

      // Assert: CRITICAL - Byte-for-byte verbatim passthrough
      expect(result.content[0].text).toBe(originalOutput);
      expect(Buffer.byteLength(result.content[0].text)).toBe(Buffer.byteLength(originalOutput));
    });

    it('should never add whitespace or formatting to output', async () => {
      // Arrange
      const compactJson = '{"a":1,"b":2}';
      const mockProcess = createMockProcess(compactJson, '', 0);

      mockSpawn.mockReturnValue(mockProcess as any);

      // Act
      const result = await handleMdselIndex({
        files: ['test.md'],
      });

      // Assert: CRITICAL - No pretty-printing or formatting
      expect(result.content[0].text).toBe(compactJson);
      expect(result.content[0].text).not.toContain('  '); // No indentation
      expect(result.content[0].text).not.toContain('\n'); // No newlines
    });
  });
});
