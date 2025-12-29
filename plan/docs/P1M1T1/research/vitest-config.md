# Vitest Configuration Research for TypeScript Node.js Projects

## Official Documentation Sources

- **Vitest Official Documentation**: https://vitest.dev
- **Vitest GitHub Repository**: https://github.com/vitest-dev/vitest
- **Vitest Config Reference**: https://vitest.dev/config
- **Vitest TypeScript Guide**: https://vitest.dev/guide/typescript.html

## 1. vitest.config.ts Configuration for TypeScript Projects

### Basic Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Test file patterns
    include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
    ],

    // Global test API
    globals: true,

    // Setup files
    setupFiles: ['./test/setup.ts'],

    // Max workers for parallel testing
    maxWorkers: 4,

    // Run tests in a single thread for debugging
    singleThread: false,

    // Test timeout (ms)
    testTimeout: 10000,

    // Hook timeout (ms)
    hookTimeout: 10000,
  },

  // Resolving aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './test'),
    },
  },

  // Type checking
  typecheck: {
    enabled: true,
  },

  // Coverage configuration
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
      '**/*.test.{ts,tsx,js,jsx}',
    ],
    include: ['src/**/*'],
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
```

### Advanced Configuration with Plugins

```typescript
// vitest.config.ts with plugins
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
    },
  },
})
```

## 2. Test Patterns Configuration

### Including Test Files

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Multiple inclusion patterns
    include: [
      'tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/__tests__/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
    ],

    // Glob patterns
    include: [
      'test/**/*.test.ts',
      'test/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.config.{ts,js}',
      '**/*.d.ts',
      '**/*.stories.{ts,tsx,js,jsx}',
    ],
  },
})
```

### Pattern Examples

| Pattern | Description |
|---------|-------------|
| `**/*.{test,spec}.{ts,tsx}` | Test/Spec files in TypeScript |
| `tests/**/*` | All files in tests directory |
| `src/**/*.test.ts` | Test files in src directory |
| `!**/node_modules/**` | Exclude node_modules |
| `!**/*.d.ts` | Exclude TypeScript declaration files |

## 3. Environment Settings for Node.js Testing

### Node.js Environment Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Node.js environment
    environment: 'node',

    // Node.js specific options
    environmentOptions: {
      /**
       * @see https://nodejs.org/api/vm.html#vm_vm_runinnewcontext_sandbox_options
       */
      vm: {
        // Will be passed to createContext
        context: {
          // Mocks
          console: console,
          process: process,
        },
      },
    },

    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      CUSTOM_VAR: 'test-value',
    },

    // Mock timers
    fakeTimers: {
      // Enable fake timers
      enabled: true,

      // Timer algorithm
      timerLimit: 10000,
    },
  },
})
```

### Environment-Specific Configurations

```typescript
// Development vs Production test configs
export default defineConfig(({ mode }) => ({
  test: {
    environment: mode === 'development' ? 'jsdom' : 'node',
    globals: mode === 'development',
    setupFiles: mode === 'development' ? ['./test/setup.dev.ts'] : ['./test/setup.prod.ts'],
  },
}))
```

## 4. Coverage Configuration

### Basic Coverage Setup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      // Coverage provider
      provider: 'v8',

      // Reporter options
      reporter: [
        'text',           // Console output
        'json',           // JSON report
        'html',           // HTML report
        'lcov',           // LCOV report
        'clover',         // Clover XML report
      ],

      // Include files for coverage
      include: [
        'src/**/*',
        'lib/**/*',
      ],

      // Exclude files from coverage
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/__tests__/**',
      ],

      // Coverage thresholds
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        perFile: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
})
```

### Custom Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul', // Alternative to v8
      enabled: true,
      include: ['src/**'],
      exclude: [
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
      ],
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      thresholds: {
        global: {
          lines: 85,
          statements: 85,
          functions: 85,
          branches: 85,
        },
      },
    },
  },
})
```

## 5. Integration with TypeScript for Type Checking

### TypeScript Configuration

```json
// tsconfig.json additions
{
  "compilerOptions": {
    "types": ["vitest/globals"],
    "esModuleInterop": true,
    "moduleResolution": "node",
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
  },
  "include": [
    "src/**/*.ts",
    "test/**/*.ts",
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
  ]
}
```

### Type Checking Integration

```typescript
// vitest.config.ts
export default defineConfig({
  // Global type checking
  typecheck: {
    enabled: true,

    // Command to run type checking
    command: 'tsc --noEmit',

    // Run type checking in CI
    autoRun: true,
  },

  test: {
    // TypeScript-specific options
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
  },
})
```

### Separate TypeScript Test Config

```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"],
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "module": "ESNext",
    "target": "ESNext",
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "test/**/*.ts",
    "test/**/*.tsx",
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
  ]
}
```

## Best Practices for Test File Organization

### Directory Structure

```
project-root/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.model.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.test.ts
│   │   └── auth/
│   │       ├── auth.service.ts
│   │       └── auth.test.ts
│   └── utils/
│       ├── helpers.ts
│       └── helpers.test.ts
├── test/
│   ├── setup.ts
│   ├── setup.tsx (if using React)
│   ├── utils/
│   │   └── test-utils.ts
│   └── fixtures/
│       └── sample-data.ts
├── __tests__/
│   └── integration/
│       └── app.test.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

### Naming Conventions

| File Type | Pattern | Description |
|-----------|---------|-------------|
| Unit Tests | `*.test.ts` | Unit test files |
| Integration Tests | `*.spec.ts` | Integration test files |
| Test Utilities | `test-utils.ts` | Shared test utilities |
| Test Fixtures | `fixtures/*.ts` | Test data fixtures |

## Common Gotchas and Solutions

### 1. Module Resolution Issues

```typescript
// vitest.config.ts - Common solution for module resolution
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './test'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
  },
})
```

### 2. Type Errors in Tests

```typescript
// test/setup.ts - Global type definitions
import type { Mock } from 'vitest'

declare global {
  export var vi: {
    fn: <T extends (...args: any[]) => any>(fn: T) => Mock<ReturnType<T>, Parameters<T>>
    spyOn: <T extends object>(obj: T, method: keyof T) => Mock
  }
}
```

### 3. Async/Await Issues

```typescript
// Test example - Proper async handling
test('async operation', async () => {
  const result = await someAsyncFunction()
  expect(result).toBeDefined()

  // Use waitFor for async updates
  await vi.waitFor(() => {
    expect(someElement).toHaveTextContent('Expected Text')
  }, { timeout: 3000 })
})
```

### 4. Mocking Issues

```typescript
// test/mocks/node-fetch.ts
export const mockFetch = vi.fn()

global.fetch = mockFetch

export const mockResponse = (data: any, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
```

### 5. Path Mapping Issues

```json
// tsconfig.json - Important for path mapping
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@tests/*": ["test/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### 6. Coverage Configuration Gotchas

```typescript
// vitest.config.ts - Common coverage fixes
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: [
        '**/*.test.{ts,tsx,js,jsx}', // Test files
        '**/*.spec.{ts,tsx,js,jsx}', // Spec files
        '**/node_modules/**',        // Dependencies
        '**/*.d.ts',                 // Declaration files
        '**/dist/**',                // Build output
        '**/coverage/**',            // Coverage reports
      ],
    },
  },
})
```

## Command Line Usage

### Common Vitest Commands

```bash
# Run tests
vitest
vitest run

# Run tests with coverage
vitest run --coverage

# Run tests matching pattern
vitest run --testNamePattern="should"

# Run tests in watch mode
vitest watch

# Run tests with UI
vitest --ui

# Run tests with environment variables
NODE_ENV=test vitest run
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:watch": "vitest watch",
    "test:typecheck": "vitest typecheck",
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

## Additional Resources

- **Vitest Discord**: https://chat.vitest.dev
- **Vitest Examples**: https://github.com/vitest-dev/vitest/tree/main/examples
- **Vitest Blog**: https://vitest.dev/blog
- **Migration from Jest**: https://vitest.dev/guide/migration.html

---

*This research document was created based on Vitest best practices and common configuration patterns for TypeScript Node.js projects. For the most up-to-date information, please refer to the official Vitest documentation.*