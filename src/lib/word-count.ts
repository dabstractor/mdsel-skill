/**
 * Word count utility functions for behavioral gating
 * Used by PreToolUse hook to determine when to inject reminders
 *
 * Word counting is mechanical - whitespace-delimited tokens only.
 * No semantic analysis, no language-specific handling.
 */

/**
 * Count words in text using whitespace-delimited tokenization
 *
 * Word counting is mechanical - splits by whitespace and counts non-empty tokens.
 * No semantic analysis, language-specific handling, or special cases.
 *
 * @param content - The text content to count words in
 * @returns The number of words found (0 for empty/whitespace-only content)
 *
 * @example
 * ```ts
 * countWords("hello world");  // Returns 2
 * countWords("  multiple   spaces  ");  // Returns 2
 * countWords("");  // Returns 0
 * ```
 */
export function countWords(content: string): number {
  // CRITICAL: Handle empty/undefined input
  if (!content || content.length === 0) {
    return 0;
  }

  // PATTERN: Trim leading/trailing, split by whitespace, filter empty strings
  const tokens = content.trim().split(/\s+/).filter(Boolean);

  return tokens.length;
}

/**
 * Get the word count threshold from environment variable
 *
 * Reads MDSEL_MIN_WORDS environment variable. If not set or invalid,
 * returns default threshold of 200 words.
 *
 * @returns The word count threshold (default 200)
 *
 * @example
 * ```ts
 * getWordThreshold();  // Returns 200 (default)
 * process.env.MDSEL_MIN_WORDS = '500';
 * getWordThreshold();  // Returns 500
 * process.env.MDSEL_MIN_WORDS = 'invalid';
 * getWordThreshold();  // Returns 200 (fallback)
 * ```
 */
export function getWordThreshold(): number {
  // CRITICAL: Read from process.env, fallback to default '200'
  const envValue = process.env.MDSEL_MIN_WORDS;

  if (!envValue) {
    return 200; // Default threshold
  }

  // GOTCHA: parseInt returns NaN for invalid input - use Number() with isNaN check
  const threshold = Number.parseInt(envValue, 10);

  // CRITICAL: Return default if NaN or less than 1
  if (Number.isNaN(threshold) || threshold < 1) {
    return 200;
  }

  return threshold;
}
