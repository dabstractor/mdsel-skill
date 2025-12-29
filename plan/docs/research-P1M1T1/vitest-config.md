# Vitest Configuration for TypeScript Projects

This document provides comprehensive guidance on configuring Vitest for TypeScript projects, including setup patterns, mocking strategies, coverage configuration, and ESM compatibility.

## 1. Configuration Setup

### Basic vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [vue(), react()],
  test: {
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', 'coverage'],

    // Environment setup
    environment: 'node',
    globals: true,

    // Watch mode
    watch: false,

    // Timeout settings
    hookTimeout: 10000,
    testTimeout: 30000,

    // Reporters
    reporters: ['verbose'],

    // Output files
    outputFile: {
      junit: './test-results/junit.xml'
    }
  }
})
```

### Advanced Configuration with TypeScript

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    // TypeScript-specific settings
    globals: true,

    // Environment options
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
      }
    },

    // Transform and parsing
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.vue$/]
    },

    // Test file extensions
    extensionsToWatch: ['.ts', '.tsx', '.js', '.jsx', '.vue'],

    // Custom setup file
    setupFiles: ['./test/setup.ts'],

    // Test execution order
    sequence: {
      concurrent: true,
      seed: Math.random()
    }
  }
})
```

## 2. Test Patterns for TypeScript

### Basic Test Structure

```typescript
// src/utils/calculator.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Calculator } from './calculator'

describe('Calculator', () => {
  let calculator: Calculator

  beforeEach(() => {
    calculator = new Calculator()
  })

  it('should correctly add numbers', () => {
    expect(calculator.add(5, 3)).toBe(8)
  })

  it('should handle floating point numbers', () => {
    expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3)
  })
})
```

### Testing Async Code

```typescript
// src/services/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiService } from './api'

describe('ApiService', () => {
  let apiService: ApiService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    apiService = new ApiService()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const result = await apiService.getData(1)

    expect(result).toEqual(mockData)
    expect(mockFetch).toHaveBeenCalledWith('/api/data/1')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(apiService.getData(1)).rejects.toThrow('Network error')
  })
})
```

### Component Testing with Vue/React

```typescript
// src/components/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(Button, {
      props: {
        label: 'Click me'
      }
    })

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('emits click event when clicked', async () => {
    const { emitted } = render(Button, {
      props: {
        label: 'Click me'
      }
    })

    const button = screen.getByText('Click me')
    await button.click()

    expect(emitted()).toHaveProperty('click')
  })
})
```

## 3. Mocking Patterns

### Mocking child_process.spawn

```typescript
// src/utils/child-process.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawn } from 'child_process'
import { runCommand } from './child-process'

// Mock the entire child_process module
vi.mock('child_process')

describe('runCommand', () => {
  const mockSpawn = vi.mocked(spawn)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute command successfully', async () => {
    // Setup mock spawn
    mockSpawn.mockReturnValue({
      stdout: {
        on: vi.fn((event, callback) => {
          if (event === 'data') callback('output')
        })
      },
      stderr: {
        on: vi.fn((event, callback) => {
          if (event === 'data') callback('')
        })
      },
      on: vi.fn((event, callback) => {
        if (event === 'close') callback(0)
      })
    } as any)

    const result = await runCommand('echo', ['hello'])
    expect(result).toBe('output')
    expect(mockSpawn).toHaveBeenCalledWith('echo', ['hello'], expect.any(Object))
  })

  it('should handle command errors', async () => {
    mockSpawn.mockReturnValue({
      stdout: {
        on: vi.fn()
      },
      stderr: {
        on: vi.fn((event, callback) => {
          if (event === 'data') callback('Error: command not found')
        })
      },
      on: vi.fn((event, callback) => {
        if (event === 'close') callback(1)
      })
    } as any)

    await expect(runCommand('unknown', [])).rejects.toThrow()
  })
})
```

### Mocking File System Operations

```typescript
// src/utils/file-handler.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs/promises'
import { readFile, writeFile } from './file-handler'

vi.mock('fs/promises')

describe('file-handler', () => {
  const mockFs = vi.mocked(fs)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should read file content', async () => {
    mockFs.readFile.mockResolvedValueOnce('file content')

    const content = await readFile('test.txt')
    expect(content).toBe('file content')
    expect(mockFs.readFile).toHaveBeenCalledWith('test.txt', 'utf-8')
  })

  it('should write file content', async () => {
    mockFs.writeFile.mockResolvedValueOnce()

    await writeFile('test.txt', 'new content')
    expect(mockFs.writeFile).toHaveBeenCalledWith('test.txt', 'new content')
  })
})
```

### Mocking Environment Variables

```typescript
// src/config.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import config from './config'

// Store original environment
const originalEnv = { ...process.env }

describe('config', () => {
  beforeEach(() => {
    // Clear all environment variables
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv }
  })

  it('should use default values when env vars are not set', () => {
    delete process.env.API_URL

    expect(config.apiUrl).toBe('http://localhost:3000')
  })

  it('should use environment variables when set', () => {
    process.env.API_URL = 'https://api.example.com'

    expect(config.apiUrl).toBe('https://api.example.com')
  })
})
```

### Mocking Date and Time

```typescript
// src/utils/date-utils.test.ts
import { describe, it, expect, vi } from 'vitest'
import { formatDate, getCurrentDate } from './date-utils'

describe('date-utils', () => {
  it('should format date correctly', () => {
    const fixedDate = new Date('2023-01-01T12:00:00Z')
    vi.setSystemTime(fixedDate)

    expect(formatDate()).toBe('2023-01-01 12:00:00')
    vi.useRealTimers()
  })

  it('should return current date', () => {
    const date = getCurrentDate()
    expect(date).toBeInstanceOf(Date)
  })
})
```

## 4. Coverage Configuration

### Basic Coverage Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // Coverage reporter
      reporter: ['text', 'json', 'html'],

      // Coverage directory
      reportsDirectory: './coverage',

      // Exclude files from coverage
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/test/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],

      // Include only specific files
      include: ['src/**/*'],

      // Coverage thresholds
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

      // Custom coverage provider
      provider: 'v8',

      // Skip full coverage for certain files
      skipFull: true
    }
  }
})
```

### Advanced Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // Custom coverage report configuration
      reporter: [
        ['text', { file: 'coverage/coverage.txt' }],
        ['json', { file: 'coverage/coverage.json' }],
        ['lcov', { file: 'coverage/lcov.info' }],
        ['clover', { file: 'coverage/clover.xml' }],
        ['html', { subdir: 'html-report' }]
      ],

      // All coverage options
      all: true,

      // Custom hooks
      hooks: {
        // Post-process coverage data
        onCoverageComplete: (coverage, reporter) => {
          console.log('Coverage completed:', coverage)
        }
      },

      // Branch coverage settings
      allowExternal: false,

      // Enable Babel instrumenter
      useBabelInstrumenter: false
    }
  }
})
```

### Coverage Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest watch --coverage",
    "test:coverage:report": "node ./coverage/report.js"
  }
}
```

## 5. ESM Compatibility

### ESM Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { URL } from 'node:url'

export default defineConfig({
  // ESM-specific settings
  test: {
    globals: true,

    // Environment for ESM
    environment: 'node',

    // Enable experimental ESM features
    experimental: {
      esmIntegration: true
    },

    // Resolve extensions for ESM
    resolve: {
      extensions: ['.ts', '.js', '.json', '.node']
    }
  },

  // Vite configuration for ESM
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // ESM-specific build settings
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        exports: 'named'
      }
    }
  }
})
```

### ESM Test Files

Create tests with ESM imports:

```typescript
// src/utils/ESMUtils.test.ts
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './ESMUtils'

describe('ESM Utils', () => {
  it('should calculate total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ]

    expect(calculateTotal(items)).toBe(35)
  })
})
```

### ESM Module Mocking

```typescript
// src/ESMService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ESMService } from './ESMService'
import { importModule } from './module-loader'

vi.mock('./module-loader', async () => {
  const actual = await vi.importActual('./module-loader')
  return {
    ...actual,
    importModule: vi.fn()
  }
})

describe('ESMService', () => {
  const mockImportModule = vi.mocked(importModule)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load ESM module dynamically', async () => {
    const mockModule = { default: { value: 'test' } }
    mockImportModule.mockResolvedValueOnce(mockModule)

    const result = await ESMService.loadModule('dynamic-module')

    expect(result).toBe(mockModule)
    expect(mockImportModule).toHaveBeenCalledWith('dynamic-module')
  })
})
```

## Test File Patterns and Conventions

### File Naming Conventions

```
# Unit tests
filename.test.ts
filename.spec.ts

# Integration tests
filename.integration.test.ts
filename.integration.spec.ts

# Component tests
ComponentName.test.ts
ComponentName.spec.ts

# E2E tests
filename.e2e.test.ts
filename.e2e.spec.ts
```

### Directory Structure

```
src/
├── __tests__/          # Test files alongside source
├── components/
│   ├── Button/
│   │   ├── Button.ts
│   │   ├── Button.test.ts
│   │   └── Button.stories.ts
├── utils/
│   ├── calculator.ts
│   └── calculator.test.ts
├── services/
│   ├── api.ts
│   ├── api.test.ts
│   └── __mocks__/
test/                   # Dedicated test directory
├── setup.ts             # Test setup file
├── utils/
│   ├── test-utils.ts   # Test utilities
│   └── matchers.ts     # Custom matchers
└── fixtures/
    └── sample-data.json # Test fixtures
```

### Common Test Patterns Summary

1. **Arrange-Act-Assert (AAA) Pattern**
   ```typescript
   it('should...', () => {
     // Arrange - setup test data
     const input = 'test'

     // Act - execute the function
     const result = myFunction(input)

     // Assert - verify the result
     expect(result).toBe('expected')
   })
   ```

2. **Test Isolation Pattern**
   ```typescript
   beforeEach(() => {
     // Reset state before each test
   })

   afterEach(() => {
     // Cleanup after each test
   })
   ```

3. **Dependency Injection Pattern**
   ```typescript
   it('should...', () => {
     const mockDependency = createMockDependency()
     const service = new Service(mockDependency)

     // Test the service
   })
   ```

## Additional Resources

### Official Documentation
- [Vitest Configuration Guide](https://vitest.dev/config/)
- [Vitest Testing API](https://vitest.dev/guide/)
- [Vitest GitHub Repository](https://github.com/vitest-dev/vitest)

### Coverage Configuration
- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [Coverage Threshold Configuration](https://vitest.dev/guide/coverage.html#thresholds)

### Mocking Documentation
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Mocking with Vitest](https://vitest.dev/guide/mocking.html)

### ESM Support
- [Vitest ESM Documentation](https://vitest.dev/guide/esm.html)
- [ESM Integration Guide](https://vitest.dev/guide/esm.html)