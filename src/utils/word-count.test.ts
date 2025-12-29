import { describe, it, expect } from 'vitest';
import { countWords } from './word-count.js';

describe('countWords', () => {
  // Basic functionality tests
  describe('basic functionality', () => {
    it('should count words separated by single spaces', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('one two three four')).toBe(4);
    });

    it('should count a single word', () => {
      expect(countWords('hello')).toBe(1);
    });

    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(countWords('   ')).toBe(0);
      expect(countWords('\t\t\n')).toBe(0);
    });
  });

  // Edge case tests
  describe('edge cases', () => {
    it('should handle leading/trailing whitespace', () => {
      expect(countWords('  hello world  ')).toBe(2);
      expect(countWords('\thello world\n')).toBe(2);
      expect(countWords('   hello   ')).toBe(1);
    });

    it('should handle multiple consecutive spaces', () => {
      expect(countWords('hello    world')).toBe(2);
      expect(countWords('one  two   three    four')).toBe(4);
    });

    it('should handle tabs as delimiters', () => {
      expect(countWords('hello\tworld')).toBe(2);
      expect(countWords('one\t\ttwo')).toBe(2);
    });

    it('should handle newlines as delimiters', () => {
      expect(countWords('hello\nworld')).toBe(2);
      expect(countWords('one\n\ntwo')).toBe(2);
    });

    it('should handle mixed whitespace types', () => {
      expect(countWords('hello \t\nworld')).toBe(2);
      expect(countWords('one  \t\t two\n\n   three')).toBe(3);
    });

    it('should handle carriage returns', () => {
      expect(countWords('hello\r\nworld')).toBe(2);
      expect(countWords('one\r\rtwo')).toBe(2);
    });
  });

  // Real-world Markdown content tests
  describe('markdown content', () => {
    it('should count words in simple Markdown', () => {
      const content = '# Heading\n\nThis is a paragraph with words.';
      expect(countWords(content)).toBe(8);
    });

    it('should count words in code blocks (mechanical, not semantic)', () => {
      const content = '```javascript\nconst x = 1;\n```';
      // Mechanical count: ```, javascript, const, x, =, 1;, ```
      expect(countWords(content)).toBe(6);
    });

    it('should handle large markdown content', () => {
      const content = '# Large Document\n\n' +
        'This is a large document with many words. '.repeat(50);
      // '# Large Document' = 3 words (#, Large, Document)
      // Each repetition has 8 words * 50 = 400 words
      expect(countWords(content)).toBe(403);
    });
  });

  // Performance tests
  describe('performance', () => {
    it('should handle very large strings efficiently', () => {
      const content = 'word '.repeat(10000); // 10000 words
      expect(countWords(content)).toBe(10000);
    });

    it('should handle string with many newlines', () => {
      const content = 'word\n'.repeat(1000); // 1000 words
      expect(countWords(content)).toBe(1000);
    });
  });
});
