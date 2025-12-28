# Testing Research: TypeScript Subprocess Testing with Vitest

## Table of Contents
1. [Vitest Mocking Capabilities](#vitest-mocking-capabilities)
2. [Testing Patterns for child_process](#testing-patterns-for-child_process)
3. [Error and Edge Case Testing](#error-and-edge-case-testing)
4. [Best Practices for Test Data and Fixtures](#best-practices-for-test-data-and-fixtures)
5. [Recommended Libraries and Tools](#recommended-libraries-and-tools)

---

## Vitest Mocking Capabilities

### Core Vitest Mocking Documentation

#### Vitest Guide: Mocking
**URL:** [https://vitest.dev/guide/mocking.html](https://vitest.dev/guide/mocking.html)

**Key Sections:**
- **Mocking Modules** - How to use `vi.mock()` to replace modules with mocks
- **Spies** - Using `vi.fn()`, `vi.spyOn()`, and `vi.stubGlobal()`
- **Mock Implementations** - Creating mock functions that behave like the real ones
- **Timer Mocking** - Mocking timers for async operations
- **Automatic Mocks** - Creating default mock behaviors

#### Mock API Reference
**URL:** [https://vitest.dev/api/vi.html](https://vitest.dev/api/vi.html)

**Key Functions:**
- `vi.fn()` - Creates a spy function that can be called
- `vi.mock()` - Mocks a module
- `vi.spyOn()` - Spies on an existing function
- `vi.doMock()` - Mocks a module asynchronously
- `vi.clearAllMocks()` - Clears all mock calls
- `vi.restoreAllMocks()` - Restores all original implementations

---

## Testing Patterns for child_process

### Basic Mocking Setup

#### Example 1: Simple vi.mock Implementation

```typescript
import { vi } from 'vitest'
import { exec, spawn } from 'child_process'

// Mock the entire child_process module
vi.mock('child_process', () => ({
  exec: vi.fn(),
  spawn: vi.fn(),
  execSync: vi.fn(),
  spawnSync: vi.fn(),
}))
```

#### Example 2: Mock Implementation with Specific Behaviors

```typescript
import { vi } from 'vitest'
import { exec, ChildProcess } from 'child_process'

vi.mock('child_process', () => {
  const mockExec = vi.fn((command: string, callback: Function) => {
    // Simulate successful execution
    if (command.includes('success')) {
      process.nextTick(() => callback(null, 'success output', ''))
    }
    // Simulate error execution
    else if (command.includes('error')) {
      process.nextTick(() => callback(new Error('Command failed'), '', 'error output'))
    }
    // Simulate timeout
    else if (command.includes('timeout')) {
      // Don't call the callback to simulate hanging
    }
    return { on: vi.fn() }
  })

  const mockSpawn = vi.fn((command: string, args: string[], options: any) => {
    const mockProcess = new (require('events')).EventEmitter()

    // Emit data events based on command
    if (command.includes('data')) {
      setImmediate(() => mockProcess.emit('data', Buffer.from('mock output')))
      setImmediate(() => mockProcess.emit('close', 0))
    }

    return mockProcess
  })

  return {
    exec: mockExec,
    spawn: mockSpawn,
    execSync: vi.fn(),
    spawnSync: vi.fn(),
  }
})

// In your test file:
import { exec, spawn } from 'child_process'
import { mySubprocessFunction } from '../src/my-module'

describe('mySubprocessFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute successfully', async () => {
    const result = await mySubprocessFunction('success')
    expect(result).toBe('success output')
  })

  it('should handle errors', async () => {
    await expect(mySubprocessFunction('error')).rejects.toThrow('Command failed')
  })
})
```

#### Example 3: Using vi.spyOn for Partial Mocking

```typescript
import * as childProcess from 'child_process'
import { vi } from 'vitest'

describe('spyOn example', () => {
  beforeEach(() => {
    vi.spyOn(childProcess, 'exec').mockImplementation(
      (command: string, callback: Function) => {
        callback(null, 'spied output', '')
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the spied version of exec', () => {
    // Test your function that calls exec
    expect(childProcess.exec).toHaveBeenCalled()
  })
})
```

---

## Error and Edge Case Testing

### Testing Successful Execution Scenarios

```typescript
describe('successful execution', () => {
  beforeEach(() => {
    vi.mock('child_process', () => ({
      exec: vi.fn((command, callback) => {
        callback(null, 'Success: Command completed', '')
      })
    }))
  })

  it('returns correct output on success', async () => {
    const result = await executeCommand('ls -la')
    expect(result).toBe('Success: Command completed')
  })
})
```

### Testing Error Scenarios (Non-zero Exit Codes)

```typescript
describe('error scenarios', () => {
  beforeEach(() => {
    vi.mock('child_process', () => ({
      exec: vi.fn((command, callback) => {
        // Simulate non-zero exit code
        const error = new Error('Command failed with exit code 1')
        ;(error as any).code = 1
        callback(error, '', 'Error: file not found')
      })
    }))
  })

  it('throws error when command fails', async () => {
    await expect(executeCommand('nonexistent-command')).rejects.toThrow()
  })

  it('captures stderr output on failure', async () => {
    const error = await executeCommand('nonexistent-command').catch(e => e)
    expect(error.message).toContain('Error: file not found')
  })
})
```

### Testing Timeout Scenarios

```typescript
describe('timeout scenarios', () => {
  beforeEach(() => {
    vi.mock('child_process', () => ({
      spawn: vi.fn((command) => {
        const process = new (require('events')).EventEmitter()
        // Never emit close to simulate hanging process
        return process
      })
    }))
  })

  it('times out after specified duration', async () => {
    const promise = executeLongRunningCommand('sleep 10')
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 100)
    )

    await expect(Promise.race([promise, timeoutPromise])).rejects.toThrow('Timeout')
  })
})
```

### Testing Invalid JSON Output Scenarios

```typescript
describe('invalid JSON output', () => {
  beforeEach(() => {
    vi.mock('child_process', () => ({
      exec: vi.fn((command, callback) => {
        // Return malformed JSON
        callback(null, '{"invalid": json}', '')
      })
    }))
  })

  it('throws error when JSON is invalid', async () => {
    await expect(parseJsonOutput()).rejects.toThrow('Unexpected token')
  })
})
```

---

## Best Practices for Test Data and Fixtures

### Test Data Structure

Create fixture data in a dedicated directory structure:

```
tests/
├── fixtures/
│   ├── subprocess/
│   │   ├── success/
│   │   │   ├── command.txt
│   │   │   ├── expected.json
│   │   │   └── mock-response.json
│   │   ├── error/
│   │   │   ├── command.txt
│   │   │   ├── expected-error.json
│   │   │   └── stderr.txt
│   │   └── timeout/
│   │       ├── command.txt
│   │       └── timeout-ms.json
```

### Fixture File Examples

#### command.txt (success case)
```
ls -la /tmp
echo "Hello, World!"
```

#### expected.json (success case)
```json
{
  "exitCode": 0,
  "stdout": "Hello, World!\n",
  "stderr": ""
}
```

#### mock-response.json
```json
{
  "command": "ls -la /tmp",
  "exitCode": 0,
  "stdout": "total 16\ndrwxrwxrwt 1 root root 4096 Jan 1 12:00 .\ndrwxr-xr-x 1 root root 4096 Jan 1 12:00 ..\n-rw-r--r-- 1 root root    0 Jan 1 12:00 test.txt\n",
  "stderr": ""
}
```

### Test Helper Functions

Create helper utilities for common mocking patterns:

```typescript
// test/helpers/subprocess-mocks.ts
import { vi } from 'vitest'

export const createSuccessfulMock = (stdout: string, stderr = '') => {
  return vi.fn((command: string, callback: Function) => {
    process.nextTick(() => callback(null, stdout, stderr))
  })
}

export const createErrorMock = (exitCode: number, stderr: string) => {
  return vi.fn((command: string, callback: Function) => {
    const error = new Error(`Command failed with exit code ${exitCode}`)
    ;(error as any).code = exitCode
    process.nextTick(() => callback(error, '', stderr))
  })
}

export const createTimeoutMock = () => {
  return vi.fn((command: string) => {
    const process = new (require('events')).EventEmitter()
    // Never close to simulate hanging
    return process
  })
}
```

### Using Fixtures in Tests

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

describe('with fixtures', () => {
  const fixturesDir = join(__dirname, 'fixtures', 'subprocess')

  it('processes success case correctly', () => {
    const command = readFileSync(join(fixturesDir, 'success', 'command.txt'), 'utf8')
    const expected = JSON.parse(readFileSync(join(fixturesDir, 'success', 'expected.json'), 'utf8'))

    vi.mock('child_process', () => ({
      exec: createSuccessfulMock(expected.stdout)
    }))

    return expect(executeCommand(command)).resolves.toEqual(expected.stdout)
  })
})
```

---

## Recommended Libraries and Tools

### 1. **Vitest** (already included)
- **Purpose:** Modern testing framework for Vite projects
- **URL:** [https://vitest.dev](https://vitest.dev)
- **Key Features:** Native mocking, TypeScript support, fast execution

### 2. **@sinonjs/fake-timers**
- **Purpose:** Advanced timer mocking for testing timeout scenarios
- **URL:** [https://github.com/sinonjs/fake-timers](https://github.com/sinonjs/fake-timers)
- **Installation:** `npm install --save-dev @sinonjs/fake-timers`

```typescript
import { useFakeTimers } from 'sinon'

describe('with fake timers', () => {
  let clock: any

  beforeEach(() => {
    clock = useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('respects timeout', () => {
    const mockProcess = new EventEmitter()
    vi.spyOn(childProcess, 'spawn').mockReturnValue(mockProcess)

    const promise = executeCommandWithTimeout('sleep 5', 1000)

    clock.tick(1000) // Advance time by 1 second
    return expect(promise).rejects.toThrow('Timeout')
  })
})
```

### 3. **cross-spawn**
- **Purpose:** Cross-platform child_process wrapper
- **URL:** [https://github.com/moxystudio/node-cross-spawn](https://github.com/moxystudio/node-cross-spawn)
- **Benefits:** Consistent behavior across Windows/Linux/macOS

### 4. **signal-exit**
- **Purpose:** Handle process exits and signals
- **URL:** [https://github.com/tapjs/signal-exit](https://github.com/tapjs/signal-exit)
- **Use Case:** Testing process signal handling

### 5. **wait-for-exit**
- **Purpose:** Utility for waiting for process exit
- **URL:** [https://www.npmjs.com/package/wait-for-exit](https://www.npmjs.com/package/wait-for-exit)
- **Installation:** `npm install wait-for-exit`

---

## Test Structure Patterns

### Organizing Test Files

```
tests/
├── unit/
│   ├── subprocess/
│   │   ├── execution.test.ts
│   │   ├── error-handling.test.ts
│   │   └── timeout.test.ts
├── integration/
│   ├── end-to-end.test.ts
│   └── workflow.test.ts
├── helpers/
│   └── subprocess-mocks.ts
└── fixtures/
    └── subprocess/
        ├── success/
        ├── error/
        └── timeout/
```

### Test Structure Template

```typescript
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { executeCommand } from '../../src/subprocess-executor'
import { createSuccessfulMock, createErrorMock } from '../../helpers/subprocess-mocks'

describe('Subprocess Executor', () => {
  describe('successful execution', () => {
    beforeEach(() => {
      vi.mock('child_process', () => ({
        exec: createSuccessfulMock('Command output')
      }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('returns trimmed stdout', async () => {
      const result = await executeCommand('echo "test"')
      expect(result).toBe('Command output')
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      vi.mock('child_process', () => ({
        exec: createErrorMock(1, 'Command not found')
      }))
    })

    it('throws error with stderr message', async () => {
      await expect(executeCommand('unknown-command')).rejects.toThrow('Command not found')
    })
  })

  describe('timeout behavior', () => {
    beforeEach(() => {
      vi.mock('child_process', () => ({
        spawn: vi.fn(() => {
          const process = new (require('events')).EventEmitter()
          return process
        })
      }))
    })

    it('times out after specified duration', async () => {
      // Test implementation here
    })
  })
})
```

### Integration Testing Approach

```typescript
describe('integration tests', () => {
  it('executes real commands in controlled environment', () => {
    // Use real child_process but in a controlled test environment
    // Only for well-tested, safe commands
  })
})
```

---

## Coverage Expectations for Subprocess Testing

### Minimum Coverage Requirements

1. **Code Coverage:** 90%+ for subprocess-related code
2. **Scenario Coverage:**
   - ✅ Success paths
   - ✅ Error handling (various error codes)
   - ✅ Timeout scenarios
   - ✅ Edge cases (malformed output, large outputs)
   - ✅ Parameter validation

3. **Lines to Cover:**
   - All branches in conditional logic
   - Error handling code paths
   - Cleanup and teardown code
   - Edge case handling

### Coverage Example

```typescript
// src/subprocess-executor.ts
export async function executeCommand(command: string, timeout = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      process.kill(child.pid, 'SIGTERM')
      reject(new Error(`Command timed out after ${timeout}ms`))
    }, timeout)

    const child = exec(command, (error, stdout, stderr) => {
      clearTimeout(timer)

      if (error) {
        reject(new Error(stderr || error.message))
      } else {
        resolve(stdout.trim())
      }
    })

    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}
```

Corresponding test coverage should ensure all code paths are tested:
- Normal execution path
- Error path (non-zero exit code)
- Timeout path
- Process error path
- Success path with stderr

---

## Summary

This research document provides comprehensive patterns and examples for testing TypeScript subprocess code with Vitest. Key takeaways:

1. Use `vi.mock()` for complete module replacement
2. Implement spies (`vi.spyOn()`) for partial mocking
3. Create comprehensive fixture data for different scenarios
4. Test all error conditions and edge cases
5. Consider integration testing for critical workflows
6. Maintain high coverage (90%+) for subprocess-related code

Remember to follow the principle: "Mock the implementation, not the interface" when testing subprocess code to ensure your tests remain maintainable and reflect real-world behavior.

**Sources:**
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Vitest API Reference](https://vitest.dev/api/vi.html)
- [Vitest Official Documentation](https://vitest.dev)