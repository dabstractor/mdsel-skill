# Vitest Mocking Patterns for Subprocess Testing

## Official Documentation

### Primary Resources

- **Vitest Mocking API**: https://vitest.dev/guide/mocking.html
- **Vitest vi API**: https://vitest.dev/api/vi.html
- **Vitest Configuration**: https://vitest.dev/config/

## Basic Mocking with vi.mock

### Mocking child_process Module

```typescript
// tests/lib/mdsel-cli.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { exec, spawn } from 'node:child_process';

// Mock the entire child_process module
vi.mock('node:child_process', () => ({
  exec: vi.fn(),
  spawn: vi.fn(),
}));
```

## Mock Patterns for exec()

### Successful Execution

```typescript
import { execMdsel } from '../../src/lib/mdsel-cli.js';

describe('execMdsel', () => {
  let mockExec: ReturnType<typeof vi.mocked<typeof exec>>;

  beforeEach(() => {
    // Get mocked exec function
    mockExec = vi.mocked(exec);
    // Clear previous calls
    mockExec.mockClear();
  });

  it('should execute mdsel index command successfully', async () => {
    // Setup mock to succeed
    mockExec.mockImplementation((command, options, callback) => {
      // Simulate successful execution
      callback(null, new Buffer('{"success": true}'), '');
      return {} as any;
    });

    const result = await execMdsel(['index', 'README.md', '--json']);

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('success');
    expect(mockExec).toHaveBeenCalled();
  });
});
```

### Error Execution (Non-Zero Exit Code)

```typescript
it('should handle mdsel errors', async () => {
  // Create error object with exit code
  const error = new Error('Command failed');
  (error as any).code = 1;
  (error as any).killed = false;

  mockExec.mockImplementation((command, options, callback) => {
    callback(error, '', 'Error: File not found');
    return {} as any;
  });

  const result = await execMdsel(['select', 'invalid']);

  expect(result.success).toBe(false);
  expect(result.stderr).toContain('File not found');
  expect(result.exitCode).toBe(1);
});
```

### ENOENT Error (Command Not Found)

```typescript
it('should handle mdsel not found', async () => {
  const error = new Error('mdsel not found');
  (error as any).code = 'ENOENT';

  mockExec.mockImplementation((command, options, callback) => {
    callback(error, '', '');
    return {} as any;
  });

  const result = await execMdsel(['index', 'README.md']);

  expect(result.success).toBe(false);
  expect(result.stderr).toContain('not found');
});
```

## Mock Patterns for spawn()

### Streaming Output

```typescript
import { spawn } from 'node:child_process';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('execMdsel with spawn', () => {
  let mockSpawn: ReturnType<typeof vi.mocked<typeof spawn>>;

  beforeEach(() => {
    mockSpawn = vi.mocked(spawn);
    mockSpawn.mockClear();
  });

  it('should capture streaming output', async () => {
    // Create mock process object
    const mockProcess = {
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn(),
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    // Simulate stdout data event
    mockProcess.stdout.on.mockImplementation((event, handler) => {
      if (event === 'data') {
        handler('{"success": true}');
      }
    });

    // Simulate close event
    mockProcess.on.mockImplementation((event, handler) => {
      if (event === 'close') {
        handler(0); // Exit code 0
      }
    });

    const result = await execMdsel(['index', 'README.md']);

    expect(result.success).toBe(true);
    expect(mockSpawn).toHaveBeenCalledWith(
      'mdsel',
      ['index', 'README.md'],
      expect.objectContaining({ stdio: expect.arrayContaining(['pipe', 'pipe', 'pipe']) })
    );
  });
});
```

## Mocking JSON Parsing

```typescript
describe('JSON output handling', () => {
  it('should parse valid JSON output', async () => {
    const jsonOutput = JSON.stringify({
      success: true,
      command: 'index',
      data: { documents: [] }
    });

    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(null, new Buffer(jsonOutput), '');
      return {} as any;
    });

    const result = await execMdsel(['index', 'README.md', '--json']);

    expect(result.stdout).toBe(jsonOutput);
    // Note: We DON'T parse JSON - return verbatim per PRD
  });

  it('should handle malformed JSON gracefully', async () => {
    // mdsel returns malformed JSON
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(null, new Buffer('{invalid json}'), '');
      return {} as any;
    });

    const result = await execMdsel(['index', 'README.md', '--json']);

    // Return malformed output verbatim
    expect(result.stdout).toBe('{invalid json}');
    // Success is based on exit code, not JSON validity
    expect(result.success).toBe(true);
  });
});
```

## Test Fixtures

### Creating Fixture Files

```typescript
// tests/fixtures/mdsel-responses.ts
export const mdselResponses = {
  indexSuccess: {
    stdout: JSON.stringify({
      success: true,
      command: 'index',
      timestamp: '2025-12-28T00:10:24.645Z',
      data: {
        documents: [{
          namespace: 'readme',
          file_path: 'README.md',
          headings: [],
          blocks: { paragraphs: 1, code_blocks: 0, lists: 0, tables: 0 }
        }],
        summary: { total_documents: 1, total_nodes: 1, total_selectors: 1 }
      }
    }),
    stderr: ''
  },

  indexError: {
    stdout: '',
    stderr: 'Error: File not found: missing.md'
  },

  selectSuccess: {
    stdout: JSON.stringify({
      success: true,
      command: 'select',
      timestamp: '2025-12-28T00:10:30.065Z',
      data: {
        matches: [{ selector: 'heading:h1[0]', content: '# Title' }],
        unresolved: []
      }
    }),
    stderr: ''
  },

  selectorNotFound: {
    stdout: JSON.stringify({
      success: false,
      command: 'select',
      data: {
        matches: [],
        unresolved: [{
          selector: 'invalid',
          reason: 'Selector not found'
        }]
      }
    }),
    stderr: ''
  }
};

export const mdselCommands = {
  index: ['index', 'README.md', '--json'],
  select: ['select', 'heading:h1[0]', 'README.md', '--json'],
  invalid: ['select', 'invalid::selector', 'README.md', '--json']
};
```

### Using Fixtures in Tests

```typescript
import { mdselResponses, mdselCommands } from '../fixtures/mdsel-responses.js';

describe('execMdsel with fixtures', () => {
  beforeEach(() => {
    mockExec.mockClear();
  });

  it('should return index success response', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      cb(null, new Buffer(mdselResponses.indexSuccess.stdout), '');
      return {} as any;
    });

    const result = await execMdsel(mdselCommands.index);

    expect(result.stdout).toEqual(mdselResponses.indexSuccess.stdout);
    expect(result.success).toBe(true);
  });
});
```

## Common Testing Pitfalls

### 1. Not Resetting Mocks

```typescript
// ❌ BAD: Mocks persist between tests
describe('Bad tests', () => {
  it('test 1', () => {
    vi.mocked(exec).mockReturnValue('result1');
  });

  it('test 2', () => {
    // This will pass unexpectedly because mock wasn't reset
    expect(vi.mocked(exec)).toHaveBeenCalled();
  });
});

// ✅ GOOD: Always reset in beforeEach
describe('Good tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('test 1', () => {
    vi.mocked(exec).mockReturnValue('result1');
  });

  it('test 2', () => {
    // Mock is clean
    expect(vi.mocked(exec)).not.toHaveBeenCalled();
  });
});
```

### 2. Not Handling Async Properly

```typescript
// ❌ BAD: Not awaiting async operations
it('should handle async', () => {
  const result = execMdsel(['index', 'README.md']);
  expect(result).toBe(/* will fail */);
});

// ✅ GOOD: Properly await async
it('should handle async', async () => {
  const result = await execMdsel(['index', 'README.md']);
  expect(result.success).toBe(true);
});
```

### 3. Mock Implementation Too Broad

```typescript
// ❌ BAD: Mocks all exec calls globally
vi.mock('node:child_process', () => ({
  exec: vi.fn(() => 'mocked result')
}));

// ✅ GOOD: Context-specific mocking
describe('Specific command tests', () => {
  it('should mock specific command', () => {
    vi.mocked(exec).mockImplementation((cmd, opts, cb) => {
      if (cmd.includes('mdsel index')) {
        cb(null, new Buffer('{"success": true}'), '');
      }
      // Handle other cases as needed
    });
  });
});
```

## Integration vs Unit Testing

### Unit Test (Pure Mocking)

```typescript
// tests/unit/mdsel-cli.unit.test.ts
describe('execMdsel unit tests', () => {
  it('should format command arguments correctly', async () => {
    mockExec.mockImplementation((cmd, opts, cb) => {
      // Verify arguments passed correctly
      expect(cmd).toContain('mdsel');
      cb(null, new Buffer('{"success": true}'), '');
      return {} as any;
    });

    await execMdsel(['index', 'file1.md', 'file2.md', '--json']);

    expect(mockExec).toHaveBeenCalledWith(
      expect.stringContaining('mdsel'),
      expect.anything(),
      expect.any(Function)
    );
  });
});
```

### Integration Test (Real Subprocess)

```typescript
// tests/integration/mdsel-cli.integration.test.ts
describe('execMdsel integration tests', () => {
  it('should call real mdsel for smoke test', async () => {
    // This test requires mdsel to be installed
    const result = await execMdsel(['--version']);

    // Just verify it runs, don't mock
    expect(result.exitCode).toBe(0);
  });
});
```

## Test Organization

### Group Tests by Concern

```typescript
describe('execMdsel', () => {
  describe('Command Execution', () => {
    it('should execute index command');
    it('should execute select command');
  });

  describe('Error Handling', () => {
    it('should handle ENOENT');
    it('should handle non-zero exit code');
    it('should handle timeout');
  });

  describe('Output Handling', () => {
    it('should capture stdout');
    it('should capture stderr');
    it('should return exit code');
  });

  describe('Verbatim Passthrough', () => {
    it('should not parse JSON output');
    it('should not transform error messages');
    it('should not add explanations');
  });
});
```

## Vitest Configuration for Mocking

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'], // Setup file for global mocks
    mock: {
      // Auto-mock certain modules
      globals: true,
    },
  },
});
```

### Setup File for Global Mocks

```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});
```

## References

- **Vitest Official Docs**: https://vitest.dev
- **Project vitest.config.ts**: `/home/dustin/projects/mdsel-claude-glm/vitest.config.ts`
- **P1M1T1 vitest research**: `/home/dustin/projects/mdsel-claude-glm/plan/docs/P1M1T1/research/vitest_config.md`
