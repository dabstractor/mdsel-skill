import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadConfig, Config } from './config.js';

describe('loadConfig', () => {
  // Clean up environment mocks after each test
  afterEach(() => {
    delete process.env.MDSEL_MIN_WORDS;
  });

  it('should return default value of 200 when MDSEL_MIN_WORDS is not set', () => {
    // Ensure environment variable is unset
    delete process.env.MDSEL_MIN_WORDS;

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should parse valid integer value from environment', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '300');

    const config = loadConfig();

    expect(config.minWords).toBe(300);
  });

  it('should return 200 for NaN values (invalid input)', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', 'invalid');

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should return 200 for partially invalid input (parseInt behavior)', () => {
    // parseInt("200abc") returns 200, not NaN
    vi.stubEnv('MDSEL_MIN_WORDS', '200abc');

    const config = loadConfig();

    expect(config.minWords).toBe(200);
  });

  it('should handle zero value', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '0');

    const config = loadConfig();

    expect(config.minWords).toBe(0);
  });

  it('should handle negative numbers', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '-100');

    const config = loadConfig();

    expect(config.minWords).toBe(-100);
  });

  it('should handle very large numbers', () => {
    vi.stubEnv('MDSEL_MIN_WORDS', '999999');

    const config = loadConfig();

    expect(config.minWords).toBe(999999);
  });
});
