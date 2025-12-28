# Node.js Subprocess Research: Best Practices for CLI Executor Utility

## 1. Official Node.js Documentation

### Primary Documentation
- [Node.js child_process Module](https://nodejs.org/api/child_process.html)
- [child_process.exec()](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback)
- [child_process.execFile()](https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback)
- [child_process.spawn()](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options)

### Key Documentation Sections
- [Process Management](https://nodejs.org/api/child_process.html#process-management)
- [Event Emitter](https://nodejs.org/api/child_process.html#class-childprocess)
- [Class Method: ChildProcess](https://nodejs.org/api/child_process.html#class-childprocess)

## 2. Comparison: exec vs execFile vs spawn

### exec()
```typescript
// Best for: Shell commands with small output
const { exec } = require('child_process');

exec('ls -la', (error, stdout, stderr) => {
  if (error) throw error;
  console.log(stdout);
});
```

**Characteristics:**
- Spawns a shell (`/bin/sh` by default)
- Buffers output (max 200KB by default)
- Simple callback interface
- Vulnerable to shell injection if used with user input

### execFile()
```typescript
// Best for: Direct executable execution
const { execFile } = require('child_process');

execFile('ls', ['-la'], (error, stdout, stderr) => {
  if (error) throw error;
  console.log(stdout);
});
```

**Characteristics:**
- Executes file directly without shell
- More secure than exec
- Buffers output (max 200KB by default)
- No shell features (pipes, redirects, wildcards)
- **RECOMMENDED FOR CLI TOOL EXECUTOR**

### spawn()
```typescript
// Best for: Large data or streaming
const { spawn } = require('child_process');

const child = spawn('ls', ['-la']);
child.stdout.on('data', (data) => {
  console.log(data.toString());
});
```

**Characteristics:**
- Returns streams instead of buffering
- No shell by default (set `shell: true` to enable)
- More memory efficient for large outputs
- More complex API
- Requires manual handling of streams

## 3. Recommended Approach: execFile for CLI Tool Executor

For a CLI executor utility, `execFile` is the recommended choice because:

1. **Security**: No shell injection risk
2. **Performance**: Direct execution without shell overhead
3. **Simplicity**: Callback/Promise interface
4. **Output**: Perfect for JSON output (within buffer limits)

### TypeScript Implementation

```typescript
import { execFile, ExecFileOptions } from 'child_process';
import { promisify } from 'util';

interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

// Promisify execFile for async/await
const execFileAsync = promisify(execFile);

async function executeCLITool(
  command: string,
  args: string[] = [],
  options: ExecFileOptions = {}
): Promise<CLIResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      encoding: 'utf8',
      timeout: options.timeout ?? 30000,
      env: { ...process.env, ...options.env },
      ...options
    });

    return {
      stdout,
      stderr,
      exitCode: 0 // Only available if using callback version
    };
  } catch (error: any) {
    // Handle specific error types
    if (error.code === 'ETIMEDOUT') {
      throw new Error(`Command timed out after ${error.timeout}ms`);
    }
    if (error.code === 'ENOENT') {
      throw new Error(`Command not found: ${command}`);
    }

    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1
    };
  }
}

// Enhanced version with JSON parsing
async function executeCLIWithJSON<T>(
  command: string,
  args: string[] = [],
  options: {
    timeout?: number;
    env?: NodeJS.ProcessEnv;
    jsonSchema?: any; // Zod schema validation
  } = {}
): Promise<T> {
  const result = await executeCLITool(command, args, options);

  if (result.exitCode !== 0) {
    throw new Error(`CLI tool exited with code ${result.exitCode}: ${result.stderr}`);
  }

  try {
    const parsed = JSON.parse(result.stdout);

    // Validate against schema if provided
    if (options.jsonSchema) {
      // Example using Zod: const validated = options.jsonSchema.parse(parsed);
      return parsed;
    }

    return parsed as T;
  } catch (parseError) {
    throw new Error(
      `Failed to parse JSON output: ${(parseError as Error).message}\n` +
      `Output: ${result.stdout}`
    );
  }
}
```

## 4. Error Handling Patterns

### Comprehensive Error Handling

```typescript
class CLIExecutionError extends Error {
  constructor(
    message: string,
    public readonly exitCode?: number | null,
    public readonly stderr?: string,
    public readonly command?: string,
    public readonly args?: string[]
  ) {
    super(message);
    this.name = 'CLIExecutionError';
  }
}

async function safeExecuteCLI(
  command: string,
  args: string[],
  options: {
    timeout?: number;
    env?: NodeJS.ProcessEnv;
    maxBuffer?: number;
  } = {}
): Promise<CLIResult> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      command,
      args,
      {
        encoding: 'utf8',
        timeout: options.timeout,
        maxBuffer: options.maxBuffer ?? 1024 * 1024, // 1MB default
        env: { ...process.env, ...options.env }
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new CLIExecutionError(
            `Command failed: ${error.message}`,
            error.code,
            stderr,
            command,
            args
          ));
          return;
        }

        // Check exit code (only available in callback version)
        if (child.exitCode !== 0) {
          reject(new CLIExecutionError(
            `Command exited with code ${child.exitCode}`,
            child.exitCode,
            stderr,
            command,
            args
          ));
          return;
        }

        resolve({ stdout: stdout || '', stderr: stderr || '', exitCode: 0 });
      }
    );
  });
}
```

## 5. TypeScript Typing Patterns

### Strongly Typed Results

```typescript
interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  memory: {
    total: number;
    free: number;
  };
}

interface CLICommand<T = any> {
  command: string;
  args: string[];
  expectedOutputType?: new (...args: any[]) => T;
  options?: {
    timeout?: number;
    env?: NodeJS.ProcessEnv;
    cwd?: string;
  };
}

class CLIExecutor {
  async execute<T>(config: CLICommand<T>): Promise<T> {
    const result = await executeCLITool(
      config.command,
      config.args,
      config.options
    );

    if (result.exitCode !== 0) {
      throw new CLIExecutionError(
        `${config.command} failed`,
        result.exitCode,
        result.stderr
      );
    }

    const parsed = JSON.parse(result.stdout);

    if (config.expectedOutputType) {
      // Type assertion based on expected type
      return parsed as T;
    }

    return parsed;
  }
}

// Usage
const executor = new CLIExecutor();
const systemInfo = await executor.execute<SystemInfo>({
  command: 'node',
  args: ['-e', 'console.log(JSON.stringify(process))'],
  expectedOutputType: SystemInfo,
  options: { timeout: 5000 }
});
```

## 6. Testing Patterns

### Using Jest with Mocking

```typescript
// __mocks__/child_process.ts
module.exports = {
  execFile: jest.fn(),
};

// CLIExecutor.test.ts
import { CLIExecutor } from './CLIExecutor';
import { execFile } from 'child_process';

jest.mock('child_process');

describe('CLIExecutor', () => {
  let executor: CLIExecutor;

  beforeEach(() => {
    jest.clearAllMocks();
    executor = new CLIExecutor();
  });

  test('executes command successfully', async () => {
    (execFile as jest.Mock).mockImplementation((cmd, args, options, callback) => {
      callback(null, '{"success": true}', '');
    });

    const result = await executor.execute({
      command: 'test-tool',
      args: ['--option', 'value']
    });

    expect(result).toEqual({ success: true });
    expect(execFile).toHaveBeenCalledWith(
      'test-tool',
      ['--option', 'value'],
      expect.any(Object),
      expect.any(Function)
    );
  });

  test('handles non-zero exit codes', async () => {
    (execFile as jest.Mock).mockImplementation((cmd, args, options, callback) => {
      callback(null, '', 'Error message', 1);
    });

    await expect(
      executor.execute({
        command: 'failing-tool',
        args: []
      })
    ).rejects.toThrow('failed with exit code 1');
  });
});
```

### Using Vitest with Mocks

```typescript
// CLIExecutor.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { execFile } from 'child_process';
import { CLIExecutor } from './CLIExecutor';

vi.mock('child_process');

describe('CLIExecutor', () => {
  let executor: CLIExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new CLIExecutor();
  });

  it('should execute command and return JSON', async () => {
    vi.mocked(execFile).mockImplementation(
      (cmd, args, options, callback) => {
        callback(null, '{"data": "test"}', '');
      }
    );

    const result = await executor.execute({
      command: 'test-tool',
      args: ['--output', 'json']
    });

    expect(result).toEqual({ data: 'test' });
  });
});
```

### Integration Testing with Test Containers

```typescript
// For testing real CLI tools
import { TestContainers } from 'testcontainers';
import { CLIExecutor } from './CLIExecutor';

describe('CLI Integration Tests', () => {
  let executor: CLIExecutor;

  beforeAll(async () => {
    executor = new CLIExecutor();
  });

  it('should interact with docker container', async () => {
    const container = await new TestContainers().run('alpine:latest');

    try {
      const result = await executor.execute({
        command: 'docker',
        args: ['exec', container.getId(), 'ls', '/']
      });

      expect(Array.isArray(result)).toBe(true);
    } finally {
      await container.stop();
    }
  });
});
```

## 7. Common Pitfalls to Avoid

### 1. Shell Injection
```typescript
// ❌ VULNERABLE
const userInput = 'file.txt; rm -rf /';
exec(`cat ${userInput}`, callback);

// ✅ SAFE
const userInput = 'file.txt';
execFile('cat', [userInput], callback);
```

### 2. Buffer Overflow
```typescript
// ❌ RISKY
exec('large-command', callback); // May hit 200KB limit

// ✅ SAFE
const child = spawn('large-command');
child.stdout.on('data', (chunk) => processChunk(chunk));
```

### 3. Resource Leaks
```typescript
// ❌ LEAKS RESOURCES
spawn('long-running-process');
// No cleanup on error/timeout

// ✅ SAFE
const child = spawn('long-running-process');
child.on('error', () => child.kill());
setTimeout(() => child.kill(), 30000); // Timeout
```

### 4. Race Conditions
```typescript
// ❌ RACE CONDITION
let result;
spawn('command').stdout.on('data', (data) => {
  result = data.toString(); // May not capture all data
});

// ✅ SAFE
const { stdout } = await execFileAsync('command', args);
const result = stdout;
```

### 5. Error Message Quality
```typescript
// ❌ POOR ERROR MESSAGES
if (error) throw error;

// ✅ GOOD ERROR MESSAGES
if (error) {
  throw new CLIExecutionError(
    `Failed to execute ${command} with args ${JSON.stringify(args)}`,
    error.code,
    error.stderr
  );
}
```

## 8. Recommended Libraries

### For JSON Validation
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [io-ts](https://github.com/gcanti/io-ts) - Functional runtime type checking
- [ajv](https://ajv.js.org/) - JSON Schema validator

### For Process Management
- [zx](https://github.com/google/zx) - Better tools for scripts
- [execa](https://github.com/sindresorhus/execa) - Enhanced subprocess execution
- [cross-spawn](https://github.com/moxystudio/node-cross-spawn) - Cross-platform spawn

### For Testing
- [jest-mock-process](https://github.com/thomas-jung/jest-mock-process) - Process mocking
- [mock-child-process](https://github.com/nkint/mock-child-process) - Child process mocking

## 9. Performance Considerations

### Memory Usage
- `exec/execFile`: Buffers output (memory intensive for large outputs)
- `spawn`: Streams output (memory efficient for large outputs)
- Consider buffer limits and adjust with `maxBuffer` option

### Execution Speed
- `execFile` is faster than `exec` (no shell overhead)
- `spawn` is most efficient for streaming data
- Warm up processes for frequently executed commands

### Timeout Handling
```typescript
// Always implement timeouts
async function executeWithTimeout(
  command: string,
  args: string[],
  timeout: number = 30000
): Promise<CLIResult> {
  const promise = executeCLITool(command, args);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
}
```

## 10. Security Best Practices

### Input Validation
```typescript
function sanitizeCommandInput(input: string): string {
  // Remove shell metacharacters
  return input.replace(/[;&|`$(){}[\]<>]/g, '');
}

// Validate file paths
function isValidFilePath(path: string): boolean {
  // Implement path validation logic
  return !/[;|`$&]/.test(path) && path.length > 0;
}
```

### Environment Isolation
```typescript
async function executeInIsolatedEnv(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = {}
): Promise<CLIResult> {
  // Only pass specific environment variables
  const sanitizedEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    ...env
  };

  return executeCLITool(command, args, { env: sanitizedEnv });
}
```

This comprehensive research provides the foundation for building a secure, robust CLI executor utility in Node.js/TypeScript, with best practices for error handling, testing, and security.