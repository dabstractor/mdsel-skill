# Vitest Testing Patterns for TypeScript Node.js Projects

## Research Findings

This document contains comprehensive research on vitest testing patterns specifically for TypeScript Node.js projects, including migration from Jest, TypeScript integration, and best practices.

---

## 1. Vitest vs Jest - Key Differences and Migration Considerations

### Core Differences

| Feature | Vitest | Jest |
|---------|--------|------|
| Execution | V8 engine, shared with Node.js | Custom JavaScript engine |
| Watch Mode | Native Node.js watch, faster | Custom watch implementation |
| Performance | Significantly faster test execution | Slower due to test isolation |
| TypeScript | Native support, no transpilation needed | Requires ts-jest transformation |
| ES Modules | First-class support | Legacy support, configuration needed |
| Browser Testing | Playwright integration | Requires additional setup |
| Test Isolation | Worker threads, better isolation | Test runner isolation |
| API Compatibility | Jest-compatible API | N/A |

### Migration Considerations

**Key Advantages of Vitest:**
- No need for `ts-jest`, uses TypeScript directly
- Faster startup time and execution (3-5x faster)
- Better stack traces with source maps
- Native Node.js import/export support
- Better debugging experience with IDE integration
- Automatic test file discovery
- Built-in coverage with multiple providers
- Active development with frequent updates

**Migration Challenges:**
- Different mocking patterns (vi.mock vs jest.mock)
- Global API differences (describe/test vs describe.it)
- Coverage provider configuration changes
- Jest-specific features may need alternatives
- CI/CD pipeline updates needed

**Migration Strategy:**
1. Start with a simple test file
2. Replace Jest configuration with Vitest
3. Gradually migrate tests
4. Address mocking differences
5. Update CI/CD pipelines
6. Address any Jest-specific features

### Jest to Vitest Migration Guide

#### Package.json Changes
```json
{
  "devDependencies": {
-   "jest": "^29.x",
-   "@types/jest": "^29.x",
-   "ts-jest": "^29.x",
+   "vitest": "^1.x",
+   "@vitest/coverage-v8": "^1.x"
  }
}
```

#### Configuration File
```typescript
// vitest.config.ts (replacing jest.config.js)
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true, // Start with Jest compatibility mode
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
```

#### Test File Adjustments
```typescript
// Before (Jest)
describe('My Test', () => {
  test('should work', () => {
    expect(someValue).toBe(expected);
  });
});

// After (Vitest)
import { describe, test, expect } from 'vitest';

describe('My Test', () => {
  test('should work', () => {
    expect(someValue).toBe(expected);
  });
});
```

---

## 2. TypeScript Integration

### Required tsconfig.json Settings

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext" | "ESNext",
    "moduleResolution": "NodeNext" | "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"], // For global test APIs
    "allowJs": true,
    "useDefineForClassFields": true
  }
}
```

### Vitest Configuration for TypeScript

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false, // Recommended for explicit imports
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '**/*.d.ts'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json'
    },
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
```

### TypeScript Project References Setup

For monorepos or complex projects:

```json
// tsconfig.json
{
  "references": [
    {
      "path": "./tsconfig.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}

// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

### Key TypeScript Integration Points

1. **No ts-jest required** - Vitest compiles TypeScript on the fly using the TypeScript compiler
2. **Better type checking** - Integrated with TypeScript language server for real-time feedback
3. **Faster compilation** - Direct use of TypeScript compiler without intermediate steps
4. **Autocomplete support** - Better IDE integration with type information
5. **Project references** - Support for monorepo setups
6. **Type checking** - Built-in type checking for test files

### TypeScript Testing Best Practices

1. **Enable strict mode** - Catch type errors early in development
2. **Use declaration maps** - Better debugging with source maps
3. **Configure paths aliases** - Cleaner import statements
4. **Include type definitions** - Better autocompletion for testing utilities
5. **Use isolated modules** - Prevent test pollution with proper module boundaries

---

## 3. Test File Patterns

### Convention Options

| Pattern | Usage | Recommendation |
|---------|-------|----------------|
| `*.test.ts` | Standard unit tests | Default, widely adopted |
| `*.spec.ts` | Specification/behavior tests | Popular in BDD-style projects |
| Mixed | Project preference | Choose one and stick with it |

### Vitest Configuration for File Patterns

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      'src/**/__tests__/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'src/**/*.d.ts'
    ]
  }
});
```

### Best Practices

1. **Consistency is key** - Stick to one pattern throughout the project
2. **Organize by feature** - Group tests near source files
3. **Use __tests__ directories** - For complex components with multiple test files
4. **Follow the project's existing conventions**

---

## 4. Globals Configuration

### globals: true vs false

**globals: true (Recommended for migration)**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true
  }
});

// Test file - no imports needed
test('my test', () => {
  expect(true).toBe(true);
});
```

**globals: false (Recommended for new projects)**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: false
  }
});

// Test file - explicit imports
import { test, expect, describe, vi } from 'vitest';

test('my test', () => {
  expect(true).toBe(true);
});
```

### When to Use Each Approach

**Use globals: true when:**
- Migrating from Jest
- Rapid prototyping
- Team prefers minimal boilerplate
- Working with many existing test files

**Use globals: false when:**
- Starting a new project
- Better tree-shaking
- Explicit dependency management
- Using test isolation features

### Recommended Configuration for New Projects

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: false, // Explicit imports
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

---

## 5. Mocking Patterns

### Mocking External Dependencies

For `child_process.spawn` usage in `mdsel`:

```typescript
// test/mdsel.test.ts
import { spawn } from 'child_process';
import { mdsel } from '../src/mdsel';
import { vi, describe, test, expect, beforeEach } from 'vitest';

vi.mock('child_process');

describe('mdsel', () => {
  const mockSpawn = vi.mocked(spawn);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock implementations
    mockSpawn.mockImplementation((command: string, args: string[], options: any) => {
      const mockProcess = {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0); // Default success exit code
          }
          if (event === 'error') {
            callback(null); // No error by default
          }
        }),
        stderr: {
          on: vi.fn((event: string, callback: Function) => {
            if (event === 'data') {
              callback(''); // Empty stderr by default
            }
          })
        },
        stdout: {
          on: vi.fn((event: string, callback: Function) => {
            if (event === 'data') {
              callback('Mocked output');
            }
          })
        }
      };
      return mockProcess as any;
    });
  });

  test('should spawn process with correct arguments', () => {
    mdsel(['--help']);

    expect(mockSpawn).toHaveBeenCalledWith(
      'node',
      expect.arrayContaining(['--help']),
      expect.objectContaining({
        stdio: 'pipe',
        shell: false
      })
    );
  });

  test('should handle process success', async () => {
    const result = await mdsel(['--version']);

    expect(result).toBeDefined();
    // Verify the mock was called
    expect(mockSpawn).toHaveBeenCalled();
  });

  test('should handle process errors', async () => {
    mockSpawn.mockImplementation((command: string, args: string[], options: any) => {
      const mockProcess = {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1); // Exit code 1 - error
          }
          if (event === 'error') {
            callback(new Error('Process failed'));
          }
        }),
        stderr: {
          on: vi.fn((event: string, callback: Function) => {
            if (event === 'data') {
              callback('Error: Invalid command');
            }
          })
        },
        stdout: {
          on: vi.fn()
        }
      };
      return mockProcess as any;
    });

    await expect(mdsel(['invalid'])).rejects.toThrow();
  });
});
```

### Advanced Mocking Patterns

#### Mocking with Promise-based API

```typescript
vi.mock('child_process', () => ({
  spawn: vi.fn((command: string, args: string[], options: any) => {
    return {
      on: vi.fn().mockImplementation((event: string, callback: Function) => {
        if (event === 'close') {
          // Simulate async completion
          setTimeout(() => callback(0), 10);
        }
      }),
      stderr: {
        on: vi.fn()
      },
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') {
            callback('Success output');
          }
        })
      }
    };
  })
}));

test('should handle async process completion', async () => {
  await mdsel(['--help']);
  expect(spawn).toHaveBeenCalled();
});
```

#### Mocking with Specific Responses

```typescript
describe('mdsel with different commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.each([
    ['--help', 'Help text'],
    ['--version', '1.0.0'],
    ['--list', 'item1,item2']
  ])('should handle %s command', async (command, expectedOutput) => {
    vi.mocked(spawn).mockReturnValue({
      on: vi.fn((event, callback) => {
        if (event === 'close') callback(0);
      }),
      stderr: { on: vi.fn() },
      stdout: {
        on: vi.fn((event, callback) => {
          if (event === 'data') callback(expectedOutput);
        })
      }
    } as any);

    const result = await mdsel([command]);
    expect(result).toContain(expectedOutput);
  });
});
```

### Mocking Best Practices

1. **Use vi.mock() for module-level mocks** - Ensures consistent mocking across test files
2. **Use vi.spyOn() for method spying** - When you need to verify call counts or arguments
3. **Always clear mocks between tests** - Use `vi.clearAllMocks()` to prevent test pollution
4. **Mock the implementation, not the interface** - Provide realistic mock behavior
5. **Test both success and error cases** - Ensure robust error handling
6. **Use mockImplementation for complex mocks** - When you need custom behavior
7. **Use mockReturnValue for simple mocks** - When you just need to return a value
8. **Type your mocks with vi.mocked()** - Get TypeScript benefits for mocked functions

---

## 6. Coverage Configuration

### V8 Provider Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/types/**',
        '**/mocks/**',
        '**/fixtures/**',
        '**/coverage/**'
      ],
      include: ['src/'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        perFile: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      // Ignore specific files or directories
      skipFull: true,
      allowExternal: false
    }
  }
});
```

### Advanced Coverage Configuration

#### For CI/CD Integration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'clover'],
      reportsDirectory: './coverage',
      tempDirectory: './coverage/.temp',
      reportOnFailure: true,
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}',
        '**/node_modules/**',
        '**/coverage/**',
        '**/config/**'
      ],
      include: ['src/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
          perFile: 70
        }
      }
    }
  }
});
```

#### Coverage Thresholds Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        // Global thresholds for the entire project
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // Per-file thresholds
        perFile: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
          // Lower threshold for specific files
          'src/utils/logger.ts': 50,
          'src/config/*.ts': 60
        },
        // Exclude specific files from threshold checking
        skipFiles: [
          'src/cli.ts',
          'src/bin/mainsel.js'
        ]
      }
    }
  }
});
```

#### Coverage Configuration with Source Maps

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'json',
        'html',
        {
          reporter: 'text',
          // Show detailed coverage information
          detail: 'verbose'
        }
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}',
        '**/node_modules/**',
        '**/coverage/**',
        '**/config/**',
        '**/*.config.{js,ts}',
        '**/setup.{js,ts}',
        '**/types/**'
      ],
      include: ['src/**'],
      // Configuration for coverage instrumentation
      instrumentation: {
        // Include additional file extensions
        include: ['src/**/*.ts', 'src/**/*.js'],
        // Exclude specific patterns
        exclude: ['**/*.test.**', '**/*.spec.**'],
        // Use compact format
        compact: true,
        // Preserve comments
        preserveComments: true
      },
      // Source map configuration
      sourceMap: true,
      // Report uncovered lines
      all: true,
      // Show branch coverage
      branches: true
    }
  }
});
```

### Coverage Best Practices

1. **Use v8 provider** - Better performance for Node.js projects, faster than Istanbul
2. **Exclude test files** - Don't count test coverage in metrics
3. **Set reasonable thresholds** - 80% is a good starting point, adjust based on project needs
4. **Use multiple reporters** - text for CI, HTML for local development, JSON for automation
5. **Include only source files** - Focus on actual application code
6. **Set per-file thresholds** - Ensure consistent coverage across all files
7. **Skip generated files** - Exclude .d.ts files and other auto-generated code
8. **Use threshold configuration** - Enforce coverage standards
9. **Report on failure** - Always generate coverage reports even when tests fail
10. **Use source maps** - Get accurate coverage reports with proper source mapping

### Coverage Command Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:coverage:report": "vitest run --coverage --coverage.reporter=text --coverage.reporter=html",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage:thresholds": "vitest run --coverage --threshold-reporter=text"
  }
}
```

### Coverage in CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: npm run test:coverage:thresholds
```

### Coverage Configuration for CI

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportOnFailure: true,
      tempDirectory: './coverage/.temp'
    }
  }
});
```

---

## Additional Resources

### Official Documentation
- [Vitest Official Documentation](https://vitest.dev/)
- [Vitest TypeScript Guide](https://vitest.dev/guide/typescript.html)
- [Vitest Migration from Jest](https://vitest.dev/guide/migration.html)

### Community Resources
- [Vitest GitHub Repository](https://github.com/vitest-dev/vitest)
- [Vitest Discord Community](https://chat.vitest.dev/)
- [Vitest Examples](https://github.com/vitest-dev/vitest/tree/main/examples)

---

## Summary

Vitest offers a modern, fast testing solution for TypeScript Node.js projects with:

### Key Advantages

1. **Native TypeScript support** - No ts-jest required, direct TypeScript compilation
2. **Better performance** - 3-5x faster than Jest with V8 engine and Node.js integration
3. **Cleaner configuration** - Minimal setup needed, sensible defaults
4. **Better debugging** - Direct stack traces and source maps
5. **Active development** - Regular updates and new features
6. **Jest compatibility** - Easy migration with Jest-like API
7. **Built-in coverage** - V8 provider with multiple reporter options
8. **ESM support** - Native support for modern JavaScript modules

### Recommendations for mdsel Project

Based on this research, for the mdsel Node.js TypeScript project:

1. **Start with explicit imports** (`globals: false`) - Better tree-shaking and explicit dependencies
2. **Use V8 coverage provider** - Optimized for Node.js projects
3. **Adopt `*.test.ts` naming convention** - Widely adopted standard
4. **Mock child_process properly** - Use vi.mock() with TypeScript typing
5. **Set reasonable coverage thresholds** - Start with 80% global, 70% per-file
6. **Exclude test and generated files** - Focus coverage on actual application code
7. **Use multiple reporters** - Text for CI, HTML for local development
8. **Configure TypeScript strict mode** - Catch type errors early

### Migration Timeline

1. **Week 1**: Set up Vitest configuration, run basic tests
2. **Week 2**: Migrate core functionality tests, implement mocking
3. **Week 3**: Add coverage configuration, set up CI integration
4. **Week 4**: Fine-tune configuration, optimize performance

### Next Steps

1. Create `vitest.config.ts` with recommended settings
2. Install required dependencies: `vitest`, `@vitest/coverage-v8`
3. Convert existing Jest tests to Vitest format
4. Set up child_process mocking for the mdsel CLI
5. Configure coverage reporting and thresholds
6. Update CI/CD pipeline to use Vitest

Vitest is an excellent choice for modern TypeScript Node.js development and should provide a significant improvement over Jest in both performance and developer experience.