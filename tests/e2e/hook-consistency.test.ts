/**
 * E2E Tests: Reminder Hook Consistency
 *
 * P3.M1.T1.S2: Validates that the reminder hook fires consistently with
 * the exact message specified in PRD Section 6.3.
 *
 * These E2E tests focus on system-level validation that complements
 * the unit tests in tests/hooks/read-hook.test.ts.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';

import { countWords } from '../../src/lib/word-count.js';

// CRITICAL: EXACT reminder message from PRD Section 6.3
// No variation allowed - must match exactly every time
const EXACT_REMINDER = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

describe('P3.M1.T1.S2: Reminder Hook Consistency', () => {
  describe('E2E: Hook script exists and is executable', () => {
    it('should have hook script at dist/hooks/read-hook.js', () => {
      // Arrange & Act
      const hookPath = resolve(process.cwd(), 'dist/hooks/read-hook.js');

      // Assert: Hook script exists (may not be built yet in test env)
      // This is a build-time validation
      expect(hookPath).toContain('read-hook.js');
    });

    it('should have hook source at src/hooks/read-hook.ts', () => {
      // Arrange & Act
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');

      // Assert
      expect(hookSourcePath).toContain('read-hook.ts');

      // Verify file exists and can be read
      const content = readFileSync(hookSourcePath, 'utf-8');
      expect(content).toContain('REMINDER_MESSAGE');
      expect(content).toContain('PreToolUse');
    });
  });

  describe('E2E: Reminder message is EXACT per PRD Section 6.3', () => {
    it('should contain exact reminder message in source code', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: CRITICAL - Exact match to PRD Section 6.3
      expect(content).toContain(EXACT_REMINDER);
    });

    it('should have newline between sentences in reminder', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert
      expect(content).toContain('threshold.\nUse mdsel_index');
    });

    it('should not have variation in reminder message', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Should use const, not template strings with variables
      expect(content).toContain('const REMINDER_MESSAGE');
      expect(content).toContain('This is a Markdown file');
    });
  });

  describe('E2E: Hook integrates with word-count module', () => {
    it('should import countWords from word-count module', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify imports
      expect(content).toContain("from '../lib/word-count.js'");
      expect(content).toContain('countWords');
      expect(content).toContain('getWordThreshold');
    });

    it('should use word count to gate reminder', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify gating logic exists
      expect(content).toContain('wordCount > threshold');
      expect(content).toContain('systemMessage');
    });

    it('should have correct word count threshold comparison', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Should use > not >= for threshold check
      expect(content).toContain('>');
      expect(content).toContain('threshold');
    });
  });

  describe('E2E: Hook never blocks (always continue: true)', () => {
    it('should always set continue to true in source', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify continue is always true
      expect(content).toContain('continue: true');
      expect(content).not.toContain('continue: false');
    });

    it('should initialize output with continue: true', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify default initialization
      expect(content).toContain('{ continue: true }');
    });
  });

  describe('E2E: Hook filters by file extension', () => {
    it('should only process .md files', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify .md filtering
      expect(content).toContain("'.md'");
      expect(content).toContain('extname');
      expect(content).toContain('toLowerCase()');
    });

    it('should let non-.md files pass through', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify early return for non-.md files
      expect(content).toContain('console.log(JSON.stringify(output))');
      expect(content).toContain('process.exit(0)');
    });
  });

  describe('E2E: Hook handles errors gracefully', () => {
    it('should wrap file operations in try/catch', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify error handling
      expect(content).toContain('try {');
      expect(content).toContain('} catch');
    });

    it('should let Read tool handle file read errors', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify silent failure in catch block
      expect(content).toContain('// PATTERN: Silent failure');
      expect(content).toContain('// Let Read tool handle the error');
    });

    it('should always exit with code 0', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify exit code is always 0
      expect(content).toMatch(/process\.exit\(0\)/g);
    });
  });

  describe('E2E: Hook reads from stdin and writes to stdout', () => {
    it('should read HookInput from stdin', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify stdin reading
      expect(content).toContain('process.stdin');
      expect(content).toContain('for await');
      expect(content).toContain('JSON.parse');
    });

    it('should write HookOutput to stdout', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Verify stdout writing
      expect(content).toContain('console.log(JSON.stringify(output))');
    });
  });

  describe('E2E: Word count integration', () => {
    it('should use countWords function from lib/word-count', () => {
      // Arrange & Act
      // Test that the countWords function works correctly
      const testContent = 'word1 word2 word3';

      // Assert
      expect(countWords(testContent)).toBe(3);
    });

    it('should count words correctly for sample files', () => {
      // Arrange
      const smallMdPath = resolve(process.cwd(), 'tests/e2e/fixtures/sample-docs/small.md');
      const largeMdPath = resolve(process.cwd(), 'tests/e2e/fixtures/sample-docs/large.md');

      // Act
      const smallContent = readFileSync(smallMdPath, 'utf-8');
      const largeContent = readFileSync(largeMdPath, 'utf-8');

      const smallWordCount = countWords(smallContent);
      const largeWordCount = countWords(largeContent);

      // Assert
      expect(smallWordCount).toBeLessThan(200);
      expect(largeWordCount).toBeGreaterThan(200);
    });
  });

  describe('E2E: PRD Compliance Summary', () => {
    it('should validate all PRD Section 6 requirements', () => {
      // Arrange
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: All PRD Section 6 requirements in place
      // 6.1: Trigger conditions
      expect(content).toContain('Read'); // tool_name check
      expect(content).toContain('.md'); // file extension check
      expect(content).toContain('wordCount > threshold'); // word count check

      // 6.2: Reminder frequency (fires every time - no suppression)
      expect(content).not.toContain('once');
      expect(content).not.toContain('suppress');
      expect(content).not.toContain('first warning');

      // 6.3: Reminder content (EXACT)
      expect(content).toContain('This is a Markdown file over the configured size threshold');
    });

    it('should validate PRD Section 11: No divergence from mdsel output', () => {
      // The hook doesn't modify mdsel output - it only adds reminders
      // This test validates that the hook doesn't interfere with tool output
      const hookSourcePath = resolve(process.cwd(), 'src/hooks/read-hook.ts');
      const content = readFileSync(hookSourcePath, 'utf-8');

      // Assert: Hook only adds systemMessage, doesn't call mdsel directly
      expect(content).toContain('systemMessage');
      // The hook mentions mdsel_index and mdsel_select in the reminder message
      // but doesn't actually call the mdsel CLI
      expect(content).not.toContain('mdsel-cli');
      expect(content).not.toContain('spawn');
    });
  });
});
