/**
 * Application configuration for behavioral conditioning system.
 *
 * @example
 * const config = loadConfig();
 * if (wordCount > config.minWords) {
 *   // Show reminder to use mdsel tools
 * }
 */
export interface Config {
  /**
   * Word count threshold for showing reminders.
   * Markdown files exceeding this count should be accessed
   * via mdsel_index and mdsel_select instead of direct Read.
   */
  minWords: number;
}

/**
 * Load application configuration from environment variables.
 *
 * Reads the MDSEL_MIN_WORDS environment variable and returns
 * a typed configuration object. Uses default value of 200 if
 * the variable is unset or contains invalid input.
 *
 * @returns Config object with minWords threshold
 *
 * @example
 * // With MDSEL_MIN_WORDS=300
 * const config = loadConfig();
 * console.log(config.minWords); // 300
 *
 * @example
 * // With MDSEL_MIN_WORDS unset
 * const config = loadConfig();
 * console.log(config.minWords); // 200 (default)
 *
 * @example
 * // With MDSEL_MIN_WORDS=invalid
 * const config = loadConfig();
 * console.log(config.minWords); // 200 (fallback)
 */
export function loadConfig(): Config {
  // Read environment variable (string | undefined)
  const envValue = process.env.MDSEL_MIN_WORDS;

  // Parse to integer with radix 10 (decimal)
  // Use '200' as default if envValue is undefined/null
  const parsedValue = parseInt(envValue || '200', 10);

  // Handle NaN - parseInt returns NaN for invalid input
  // Use Number.isNaN() for type-safe checking
  const minWords = Number.isNaN(parsedValue) ? 200 : parsedValue;

  return { minWords };
}
