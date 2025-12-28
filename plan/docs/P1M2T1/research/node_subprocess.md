# Node.js child_process Research

## Official Documentation

### Primary Resources

- **Node.js child_process API**: https://nodejs.org/api/child_process.html
- **Node.js ESM docs**: https://nodejs.org/api/esm.html
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

## Import Patterns for ESM

### Using `node:` Prefix (Node.js 18+)

```typescript
// RECOMMENDED: Use node: prefix for built-in modules
import { spawn, exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';
```

### Converting Callback-based Functions to Promises

```typescript
// Convert exec callback to Promise-based
const execAsync = promisify(exec);

// Usage
const { stdout, stderr } = await execAsync('command');
```

## Subprocess Methods Comparison

| Method | Best For | Output Handling | Use Case |
|--------|----------|-----------------|----------|
| `exec` | Short commands | Buffered (complete) | Simple commands with arguments |
| `spawn` | Long processes | Streaming | Real-time data, large outputs |
| `execFile` | Executing files | Buffered | Direct executable execution |
| `execSync` | Synchronous | Buffered (blocking) | Scripting (avoid in async) |
| `fork` | Node.js processes | IPC-aware | Separate Node.js processes |

## Type Definitions

### Process Result Interface

```typescript
interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal?: NodeJS.Signals | null;
  error?: Error;
  timedOut?: boolean;
}

interface CommandOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  maxBuffer?: number;
  killSignal?: NodeJS.Signals;
  shell?: boolean;
  encoding?: BufferEncoding;
}
```

## spawn() Pattern for CLI Execution

### Basic spawn with Promise wrapper

```typescript
import { spawn } from 'node:child_process';

async function executeCommand(
  command: string,
  args: string[],
  options?: CommandOptions
): Promise<ProcessResult> {
  return new Promise<ProcessResult>((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });

    // Capture stdout
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    // Capture stderr
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code, signal) => {
      const result: ProcessResult = {
        stdout,
        stderr,
        exitCode: code,
        signal,
      };

      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    // Handle process errors
    child.on('error', (err) => {
      reject(err);
    });
  });
}
```

### Timeout Handling

```typescript
async function executeCommandWithTimeout(
  command: string,
  args: string[],
  timeout: number = 30000
): Promise<ProcessResult> {
  const child = spawn(command, args);
  let stdout = '';
  let stderr = '';

  const timeoutId = setTimeout(() => {
    child.kill('SIGTERM');
    // Force kill if graceful shutdown fails
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }, 5000);
  }, timeout);

  return new Promise<ProcessResult>((resolve, reject) => {
    // ... capture stdout/stderr as above ...

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      // ... resolve/reject as above ...
    });
  });
}
```

## Common Pitfalls and Gotchas

### 1. Shell Injection Vulnerability

```typescript
// ❌ DANGEROUS: Vulnerable to shell injection
const userInput = '; rm -rf /';
spawn('sh', ['-c', `mdsel ${userInput}`]);

// ✅ SAFE: Use arrays for arguments
spawn('mdsel', ['index', 'README.md', '--json']);
```

### 2. Buffer Overflow with Large Outputs

```typescript
// ❌ Can cause issues with large outputs
const { stdout } = await execAsync('cat huge-file.txt');

// ✅ Process output in chunks or increase maxBuffer
const { stdout } = await execAsync('cat huge-file.txt', {
  maxBuffer: 1024 * 1024 * 10 // 10MB
});
```

### 3. Zombie Processes

```typescript
// ❌ Not handling exit/close events
const process = spawn('command');
process.unref(); // Process may become zombie

// ✅ Always handle exit events
const process = spawn('command');
process.on('exit', () => {
  console.log('Process cleaned up');
});
```

### 4. Environment Variable Handling

```typescript
// ❌ Don't mutate process.env directly
process.env.MY_VAR = 'value';

// ✅ Use spawn's env option
spawn('command', [], {
  env: { ...process.env, MY_VAR: 'value' }
});
```

### 5. Signal Handling

```typescript
// Use proper signals for graceful shutdown
process.kill('SIGTERM'); // Graceful shutdown (allows cleanup)
process.kill('SIGKILL'); // Force kill (immediate termination)
```

## Error Handling Patterns

### ENOENT Error (Command Not Found)

```typescript
try {
  await executeCommand('nonexistent-command', []);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.error('Command not found');
  }
}
```

### Non-Zero Exit Code

```typescript
child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Command failed with exit code ${code}`);
    console.error(`stderr: ${stderr}`);
  }
});
```

## Memory and Performance Considerations

### Stream Processing for Large Data

```typescript
async function streamOutput(command: string, args: string[]): Promise<string> {
  const child = spawn(command, args);
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    child.stdout?.on('data', (chunk) => {
      chunks.push(chunk);
    });

    child.on('close', (code) => {
      if (code === 0) {
        const output = Buffer.concat(chunks).toString();
        resolve(output);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
```

### Process Pool Management

For high-throughput scenarios, consider a process pool to limit concurrent subprocesses.

## Complete CLI Wrapper Example

```typescript
import { spawn } from 'node:child_process';

interface MdselResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export async function execMdsel(args: string[]): Promise<MdselResult> {
  return new Promise<MdselResult>((resolve) => {
    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;

    const child = spawn('mdsel', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      exitCode = code;
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode,
      });
    });

    child.on('error', (error) => {
      stderr += error.message;
      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: 1,
      });
    });
  });
}
```

## References from Plan Documentation

### Related Architecture Files

- `/home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/external_deps.md` - mdsel CLI interface
- `/home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/tool_definitions.md` - Tool handler patterns

### Project Requirements

- **CLI Location**: `/home/dustin/.local/bin/mdsel`
- **Output Format**: JSON with `--json` flag
- **Error Handling**: Verbatim passthrough, no rewriting
