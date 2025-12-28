import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { countWords, getWordThreshold } from '../../src/lib/word-count.js';

describe('countWords', () => {
  describe('basic word counting', () => {
    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 1 for single word', () => {
      expect(countWords('hello')).toBe(1);
    });

    it('should return 2 for two words separated by space', () => {
      expect(countWords('hello world')).toBe(2);
    });

    it('should return 3 for three words', () => {
      expect(countWords('one two three')).toBe(3);
    });
  });

  describe('whitespace handling', () => {
    it('should handle tabs as word separators', () => {
      expect(countWords('hello\tworld\tfoo')).toBe(3);
    });

    it('should handle newlines as word separators', () => {
      expect(countWords('hello\nworld\nfoo')).toBe(3);
    });

    it('should handle mixed whitespace types', () => {
      expect(countWords('hello\nworld\tfoo bar')).toBe(4);
    });

    it('should handle multiple spaces between words', () => {
      expect(countWords('  multiple   spaces  ')).toBe(2);
    });

    it('should handle leading and trailing whitespace', () => {
      expect(countWords('   hello world   ')).toBe(2);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(countWords('   ')).toBe(0);
    });

    it('should return 0 for tab-only string', () => {
      expect(countWords('\t\t')).toBe(0);
    });

    it('should return 0 for newline-only string', () => {
      expect(countWords('\n\n')).toBe(0);
    });

    it('should return 0 for mixed whitespace-only string', () => {
      expect(countWords('  \t\n  \n\t  ')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle single character words', () => {
      expect(countWords('a b c')).toBe(3);
    });

    it('should handle numbers as words', () => {
      expect(countWords('123 456 789')).toBe(3);
    });

    it('should handle special characters as words', () => {
      expect(countWords('hello! world? @tag')).toBe(3);
    });

    it('should handle long text with multiple paragraphs', () => {
      const text = 'This is paragraph one.\n\nThis is paragraph two.\n\nThis is paragraph three.';
      expect(countWords(text)).toBe(12);
    });

    it('should handle words with hyphens as single word', () => {
      expect(countWords('state-of-the-art technology')).toBe(2);
    });

    it('should handle contractions as single word', () => {
      expect(countWords("don't can't won't")).toBe(3);
    });
  });
});

describe('getWordThreshold', () => {
  const originalEnv = process.env.MDSEL_MIN_WORDS;

  beforeEach(() => {
    // CRITICAL: Reset environment variable before each test
    delete process.env.MDSEL_MIN_WORDS;
  });

  // Restore original env after each test
  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.MDSEL_MIN_WORDS = originalEnv;
    } else {
      delete process.env.MDSEL_MIN_WORDS;
    }
  });

  describe('default threshold', () => {
    it('should return 200 when env var is not set', () => {
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 when env var is empty string', () => {
      process.env.MDSEL_MIN_WORDS = '';
      expect(getWordThreshold()).toBe(200);
    });
  });

  describe('valid env var values', () => {
    it('should return 500 when MDSEL_MIN_WORDS=500', () => {
      process.env.MDSEL_MIN_WORDS = '500';
      expect(getWordThreshold()).toBe(500);
    });

    it('should return 100 when MDSEL_MIN_WORDS=100', () => {
      process.env.MDSEL_MIN_WORDS = '100';
      expect(getWordThreshold()).toBe(100);
    });

    it('should return 1 when MDSEL_MIN_WORDS=1', () => {
      process.env.MDSEL_MIN_WORDS = '1';
      expect(getWordThreshold()).toBe(1);
    });

    it('should return 10000 for large threshold', () => {
      process.env.MDSEL_MIN_WORDS = '10000';
      expect(getWordThreshold()).toBe(10000);
    });

    it('should handle numeric string with leading zeros', () => {
      process.env.MDSEL_MIN_WORDS = '00500';
      expect(getWordThreshold()).toBe(500);
    });
  });

  describe('invalid env var values', () => {
    it('should return 200 when MDSEL_MIN_WORDS=invalid', () => {
      process.env.MDSEL_MIN_WORDS = 'invalid';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 when MDSEL_MIN_WORDS=abc123', () => {
      process.env.MDSEL_MIN_WORDS = 'abc123';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 when MDSEL_MIN_WORDS=0', () => {
      process.env.MDSEL_MIN_WORDS = '0';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 when MDSEL_MIN_WORDS=-5', () => {
      process.env.MDSEL_MIN_WORDS = '-5';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 when MDSEL_MIN_WORDS contains spaces', () => {
      process.env.MDSEL_MIN_WORDS = ' 200 ';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return 200 for decimal number', () => {
      process.env.MDSEL_MIN_WORDS = '200.5';
      expect(getWordThreshold()).toBe(200);
    });

    it('should return parsed value for very large number', () => {
      // GOTCHA: JavaScript can handle very large numbers (returned in scientific notation)
      process.env.MDSEL_MIN_WORDS = '999999999999999999999';
      expect(getWordThreshold()).toBe(1e21); // Large number is valid
    });
  });
});
