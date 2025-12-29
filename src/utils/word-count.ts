/**
 * Count words in a string using whitespace-delimited tokenization.
 *
 * This is a mechanical word count that splits on any whitespace
 * (spaces, tabs, newlines). It does not perform semantic analysis
 * or NLP. This matches the behavior of `wc -w` Unix command.
 *
 * @param content - The text content to count words in
 * @returns The number of whitespace-delimited tokens
 *
 * @example
 * // Basic usage
 * countWords('hello world') // Returns: 2
 *
 * @example
 * // Empty string
 * countWords('') // Returns: 0
 *
 * @example
 * // Leading/trailing whitespace
 * countWords('  hello world  ') // Returns: 2
 *
 * @example
 * // Multiple consecutive whitespace
 * countWords('hello    world\t\nthis') // Returns: 3
 */
export function countWords(content: string): number {
  // Remove leading/trailing whitespace
  const trimmed = content.trim();

  // Handle empty string case
  if (trimmed === '') {
    return 0;
  }

  // Split on any whitespace (spaces, tabs, newlines, etc.)
  // /\s+/ matches one or more consecutive whitespace characters
  const tokens = trimmed.split(/\s+/);

  // Filter out any remaining empty strings and return count
  return tokens.filter(token => token.length > 0).length;
}
