# Vitest Research Documentation

## 1. Official Documentation

**Official Website:** https://vitest.dev

**GitHub Repository:** https://github.com/vitest-dev/vitest

---

## 2. Example vitest.config.ts for TypeScript/Node.js/ESM

### Basic Configuration

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Test environment - use 'node' for backend/testing Node.js code
    environment: 'node',

    // Include patterns for test files
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'build'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', '**/*.test.ts', '**/*.spec.ts'],
    },

    // Setup files to run before tests
    setupFiles: ['./test/setup.ts'],
  },

  // Resolve alias for clean imports
  resolve: {
    alias: {
      '@': '/src',
      '@test': '/test',
    },
  },

  // ESM configuration
  esbuild: {
    target: 'node18',
  },
});
```

### Advanced ESM Configuration

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],

    // For watch mode
    watch: true,

    // Reporter configuration
    reporters: ['verbose', 'json'],

    // Output directory for test results
    outputFile: './test-results/test-results.json',
  },

  // Path resolution
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },

  // Optimize dependencies for faster tests
  optimizeDeps: {
    disabled: false,
  },
});
```

---

## 3. Test Directory Structure Patterns

### Pattern 1: Co-located Tests (Recommended)

```
src/
  lib/
    utils.ts
    utils.test.ts        # Test file next to source
  services/
    user.service.ts
    user.service.test.ts
```

**vitest.config.ts include pattern:**

```typescript
include: ['src/**/*.test.ts'];
```

---

### Pattern 2: Dedicated **tests** Directory

```
src/
  lib/
    utils.ts
    __tests__/
      utils.test.ts
  services/
    user.service.ts
    __tests__/
      user.service.test.ts
```

**vitest.config.ts include pattern:**

```typescript
include: ['src/**/__tests__/**/*.test.ts'];
```

---

### Pattern 3: Separate Test Root Directory

```
src/
  lib/
    utils.ts
test/
  lib/
    utils.test.ts
  services/
    user.service.test.ts
```

**vitest.config.ts include pattern:**

```typescript
include: ['test/**/*.test.ts', 'src/**/*.test.ts'];
```

---

## 4. Configuring Vitest for ESM Modules

### package.json Configuration

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0"
  }
}
```

### tsconfig.json for ESM

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["node"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules"]
}
```

### Key ESM Considerations

1. **File Extensions:** When using ESM with TypeScript, ensure your build tool or runtime handles `.js` extensions in imports correctly. Vitest handles this automatically.

2. **Dynamic Imports:** ESM fully supports dynamic imports for lazy loading:

   ```typescript
   const { default: myModule } = await import('./myModule');
   ```

3. **Top-level Await:** Vitest supports top-level await in ESM mode:

   ```typescript
   // test/setup.ts
   const config = await loadConfig();
   ```

4. **Mocking ESM Modules:** Use vi.mock() for ESM modules:
   ```typescript
   import { vi } from 'vitest';
   vi.mock('./dependency', () => ({
     default: vi.fn(),
   }));
   ```

---

## 5. Best Practices for Testing TypeScript Code

### 5.1 Test File Organization

```typescript
// ✅ Good: Clear, descriptive test file names
// user.service.test.ts
// auth.utils.spec.ts
// api.integration.test.ts

// ❌ Bad: Ambiguous names
// test.ts
// tests.ts
```

### 5.2 Using Test Suites and Descriptions

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserService', () => {
  describe('createUser', () => {
    beforeEach(async () => {
      // Setup before each test
      await clearDatabase();
    });

    it('should create a user with valid data', async () => {
      const user = await userService.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('john@example.com');
    });

    it('should throw error for duplicate email', async () => {
      await expect(
        userService.create({
          name: 'Jane Doe',
          email: 'john@example.com', // duplicate
        })
      ).rejects.toThrow('Email already exists');
    });
  });
});
```

### 5.3 Type-Safe Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserRepository } from './user.repository';

// Mock with type safety
const mockUserRepository: UserRepository = {
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call repository with correct parameters', async () => {
    vi.mocked(mockUserRepository.create).mockResolvedValue({
      id: '1',
      name: 'Test User',
    });

    await userService.create({ name: 'Test User' });

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      name: 'Test User',
    });
  });
});
```

### 5.4 Testing Async Code

```typescript
import { describe, it, expect } from 'vitest';

describe('Async Operations', () => {
  // ✅ Good: Use async/await with expect().resolves/rejects
  it('should resolve with correct value', async () => {
    await expect(asyncOperation()).resolves.toBe('success');
  });

  it('should reject with error', async () => {
    await expect(failingOperation()).rejects.toThrow('Error message');
  });

  // ✅ Good: Try/catch for custom assertions
  it('should handle errors gracefully', async () => {
    try {
      await operation();
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toContain('specific error');
    }
  });

  // ❌ Bad: Not awaiting promises
  it('bad test example', () => {
    operation(); // Missing await
    expect(true).toBe(true); // False positive
  });
});
```

### 5.5 Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Snapshot Tests', () => {
  it('should match output snapshot', () => {
    const result = formatData({
      name: 'Test',
      value: 123,
    });

    expect(result).toMatchSnapshot({
      // Inline snapshot
      name: 'Test',
      value: expect.any(Number),
    });
  });

  it('should match file snapshot', () => {
    const config = generateConfig();
    expect(config).toMatchInlineSnapshot();
  });
});
```

### 5.6 Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';

describe.each([
  { input: 'hello', expected: 'HELLO' },
  { input: 'world', expected: 'WORLD' },
  { input: 'Test', expected: 'TEST' },
])('toUpperCase($input)', ({ input, expected }) => {
  it(`should convert "${input}" to "${expected}"`, () => {
    expect(toUpperCase(input)).toBe(expected);
  });
});

// Or using test.each
describe('Math operations', () => {
  it.each([
    [1, 2, 3],
    [2, 3, 5],
    [-1, 1, 0],
  ])('%i + %i = %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});
```

### 5.7 Test Hooks Usage

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Test Hooks', () => {
  beforeAll(async () => {
    // Run once before all tests in suite
    await setupDatabase();
  });

  afterAll(async () => {
    // Run once after all tests in suite
    await cleanupDatabase();
  });

  beforeEach(() => {
    // Run before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Run after each test
    cleanupTestState();
  });

  it('test 1', () => {
    // beforeEach runs before this
    // afterEach runs after this
  });
});
```

### 5.8 Setup Files Configuration

```typescript
// test/setup.ts
import { vi } from 'vitest';

// Global mocks
vi.mock('./lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Global test utilities
declare global {
  const testUtils: {
    createMockUser: () => User;
  };
}

global.testUtils = {
  createMockUser: () => ({
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test@example.com',
  }),
};
```

### 5.9 Coverage Goals

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80, // Target: 80% line coverage
      functions: 80, // Target: 80% function coverage
      branches: 75, // Target: 75% branch coverage
      statements: 80, // Target: 80% statement coverage
    },
  },
});
```

### 5.10 CI/CD Integration

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage --reporter=json --reporter=verbose",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch"
  }
}
```

---

## Summary Checklist

- [ ] Configure `vitest.config.ts` with proper TypeScript and ESM settings
- [ ] Set `"type": "module"` in `package.json`
- [ ] Configure `tsconfig.json` with `module: "ESNext"` and `moduleResolution: "bundler"`
- [ ] Choose a consistent test directory structure pattern
- [ ] Enable globals in vitest config for cleaner test code
- [ ] Use `vi.mocked()` for type-safe mocking
- [ ] Leverage `test.each()` for parameterized tests
- [ ] Set up coverage thresholds to maintain code quality
- [ ] Configure setup files for shared test utilities
- [ ] Use async/await properly in tests with proper assertions
