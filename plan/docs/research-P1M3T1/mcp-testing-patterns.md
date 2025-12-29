# MCP Testing Patterns: Best Practices for Testing Model Context Protocol Servers

**Date:** 2025-12-28
**Project:** mdsel-claude
**Focus:** Vitest + TypeScript testing patterns for MCP tool handlers

---

## Table of Contents

1. [Overview](#overview)
2. [Testing MCP Tool Handlers](#testing-mcp-tool-handlers)
3. [Mocking the MCP Server](#mocking-the-mcp-server)
4. [Common Testing Patterns](#common-testing-patterns)
5. [Testing Zod Schema Validation](#testing-zod-schema-validation)
6. [Vitest-Specific Patterns](#vitest-specific-patterns)
7. [Example Test Suite](#example-test-suite)
8. [Key References](#key-references)

---

## Overview

The Model Context Protocol (MCP) SDK provides several utilities for testing server implementations. This research focuses on practical testing patterns using **Vitest** and **TypeScript** for MCP tool handlers.

### Key MCP SDK Testing Utilities

1. **InMemoryTransport** - Creates linked in-memory transports for client-server communication within the same process
2. **Server** class - Low-level MCP server with request handler registration
3. **McpServer** class - High-level API for tool registration
4. **Client** class - For integration testing against a real server instance
5. **Zod compatibility layer** - Schema validation utilities in `server/zod-compat.js`

---

## Testing MCP Tool Handlers

### 1. Unit Testing Tool Handlers (Direct Function Testing)

Tool handlers can be tested directly as functions without involving the MCP protocol:

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Your tool handler function
async function myToolHandler(
  args: { file: string; selector: string },
  extra: { signal: AbortSignal }
) {
  // Tool implementation
  return {
    content: [{ type: 'text', text: 'Result' }]
  };
}

describe('myToolHandler', () => {
  it('should process valid arguments', async () => {
    const result = await myToolHandler(
      { file: 'test.md', selector: 'h1.0' },
      { signal: new AbortController().signal }
    );

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });

  it('should handle abort signals', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      myToolHandler(
        { file: 'test.md', selector: 'h1.0' },
        { signal: controller.signal }
      )
    ).rejects.toThrow();
  });
});
```

### 2. Integration Testing with InMemoryTransport

Using `InMemoryTransport.createLinkedPair()` for realistic client-server communication:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

describe('MCP Tool Integration Tests', () => {
  let client: Client;
  let server: McpServer;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create server
    server = new McpServer(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    // Register tool
    server.registerTool(
      'my_tool',
      {
        description: 'Test tool',
        inputSchema: z.object({
          file: z.string(),
          selector: z.string()
        })
      },
      async (args, extra) => {
        return {
          content: [{ type: 'text', text: `Processed ${args.file}` }]
        };
      }
    );

    // Create linked transports
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Create client
    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    // Connect both
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it('should list tools', async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('my_tool');
  });

  it('should call tool successfully', async () => {
    const result = await client.callTool({
      name: 'my_tool',
      arguments: {
        file: 'test.md',
        selector: 'h1.0'
      }
    });

    expect(result.content[0].text).toContain('test.md');
  });
});
```

---

## Mocking the MCP Server

### Approach 1: Mock Child Process (For CLI-based Tools)

When testing tools that spawn child processes (like the executor in this project):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('node:child_process');

import { spawn } from 'node:child_process';
import { executeMdsel } from './executor.js';

describe('executeMdsel with mocked spawn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should spawn mdsel with correct arguments', async () => {
    const mockProcess = {
      on: vi.fn((event: string, callback: Function) => {
        if (event === 'close') callback(0);
        return mockProcess;
      }),
      stdout: {
        on: vi.fn((event: string, callback: Function) => {
          if (event === 'data') callback('mocked output');
        })
      },
      stderr: {
        on: vi.fn()
      }
    };

    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const result = await executeMdsel('index', ['README.md']);

    expect(spawn).toHaveBeenCalledWith('mdsel', ['index', 'README.md'], {
      shell: true,
      env: process.env
    });
    expect(result.success).toBe(true);
  });
});
```

### Approach 2: Mock Tool Handler Directly

For pure unit tests without protocol overhead:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Tool Handler Unit Tests', () => {
  it('should mock tool handler behavior', async () => {
    const mockHandler = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Mocked result' }]
    });

    // Test the mock directly
    const result = await mockHandler({ arg: 'value' }, { signal: new AbortController().signal });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(result.content[0].text).toBe('Mocked result');
  });
});
```

### Approach 3: Using McpServer with Spy Methods

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

describe('Tool Handler with Spies', () => {
  let server: McpServer;
  let toolSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    server = new McpServer(
      { name: 'test', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    toolSpy = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Spy result' }]
    });

    server.registerTool('spy_tool', { description: 'Spy test' }, toolSpy);
  });

  it('should track tool handler calls', async () => {
    // Direct test of the spy
    await toolSpy({ test: 'value' }, { signal: new AbortController().signal });

    expect(toolSpy).toHaveBeenCalledWith(
      { test: 'value' },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
```

---

## Common Testing Patterns

### Pattern 1: Arrange-Act-Assert

```typescript
describe('Tool: index_markdown', () => {
  it('should index markdown file successfully', async () => {
    // Arrange
    const filePath = '/path/to/file.md';
    const mockExecutor = vi.mocked(executeMdsel);
    mockExecutor.mockResolvedValue({
      success: true,
      stdout: 'h1.0 Title\n---\ncode:0 para:1\n',
      stderr: '',
      exitCode: 0
    });

    // Act
    const result = await indexToolHandler(
      { file: filePath },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content[0].type).toBe('text');
    expect(mockExecutor).toHaveBeenCalledWith('index', [filePath]);
  });
});
```

### Pattern 2: Test Suite Organization

```typescript
describe('MCP Tools: Select Markdown', () => {
  describe('when called with valid arguments', () => {
    it('should return selected content', async () => {
      // Test implementation
    });
  });

  describe('when mdsel command fails', () => {
    it('should return error result', async () => {
      // Test implementation
    });
  });

  describe('when request is aborted', () => {
    it('should handle abort signal', async () => {
      // Test implementation
    });
  });
});
```

### Pattern 3: Fixture Pattern for Common Setup

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

function createTestServer() {
  const server = new McpServer(
    { name: 'test', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );
  return server;
}

async function createConnectedClient(server: McpServer) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

describe('Using Fixtures', () => {
  it('simplifies test setup', async () => {
    const server = createTestServer();
    // Register tools...
    const client = await createConnectedClient(server);

    const { tools } = await client.listTools();
    expect(tools).toBeDefined();
  });
});
```

### Pattern 4: Parametrized Tests

```typescript
describe.each([
  { selector: 'h1.0', expected: 'First heading' },
  { selector: 'h2.0', expected: 'First subheading' },
  { selector: 'code.0', expected: 'First code block' }
])('Selector: $selector', ({ selector, expected }) => {
  it(`should extract ${expected}`, async () => {
    const result = await selectToolHandler(
      { file: 'test.md', selector },
      { signal: new AbortController().signal }
    );
    expect(result.content[0].text).toContain(expected);
  });
});
```

---

## Testing Zod Schema Validation

### Testing Input Schema Validation

```typescript
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

const indexToolSchema = z.object({
  file: z.string().min(1),
  selector: z.string().optional()
});

describe('Input Schema Validation', () => {
  it('should validate correct input', () => {
    const result = indexToolSchema.safeParse({
      file: 'test.md'
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty file name', () => {
    const result = indexToolSchema.safeParse({
      file: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('min');
    }
  });

  it('should accept optional selector', () => {
    const result = indexToolSchema.safeParse({
      file: 'test.md',
      selector: 'h1.0'
    });
    expect(result.success).toBe(true);
  });
});
```

### Testing Schema Integration with MCP Server

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';

describe('Schema Validation with MCP Server', () => {
  let server: McpServer;
  let client: Client;

  beforeEach(async () => {
    server = new McpServer(
      { name: 'test', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    server.registerTool(
      'validated_tool',
      {
        description: 'Tool with schema validation',
        inputSchema: z.object({
          file: z.string().min(1),
          count: z.number().int().positive().optional()
        })
      },
      async (args) => ({
        content: [{ type: 'text', text: `File: ${args.file}` }]
      })
    );

    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test', version: '1.0.0' }, { capabilities: {} });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  it('should validate schema via tool registration', async () => {
    const { tools } = await client.listTools();
    const tool = tools[0];

    expect(tool.inputSchema).toBeDefined();
    expect(tool.inputSchema.type).toBe('object');
    expect(tool.inputSchema.required).toContain('file');
  });
});
```

### Testing Output Schema Validation

```typescript
import { z } from 'zod';

const outputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal('text'),
      text: z.string()
    })
  )
});

describe('Output Schema Validation', () => {
  it('should validate correct output', () => {
    const output = {
      content: [{ type: 'text', text: 'Result' }]
    };
    const result = outputSchema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it('should reject invalid content type', () => {
    const output = {
      content: [{ type: 'image', text: 'Result' }]
    };
    const result = outputSchema.safeParse(output);
    expect(result.success).toBe(false);
  });
});
```

---

## Vitest-Specific Patterns

### Using vi.mock for Module Mocking

```typescript
// CRITICAL: Must be at top level, before imports
vi.mock('../src/executor.js', () => ({
  executeMdsel: vi.fn()
}));

import { executeMdsel } from '../src/executor.js';

describe('Module Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mock executeMdsel', async () => {
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    const result = await executeMdsel('index', ['test.md']);
    expect(result.success).toBe(true);
  });
});
```

### Using vi.fn() for Spies

```typescript
describe('Spy Testing', () => {
  it('should track calls with vi.fn()', async () => {
    const spy = vi.fn();

    await someFunction(spy);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.any(Object));
  });
});
```

### Using vi.useFakeTimers for Async Tests

```typescript
describe('Timeout Testing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle timeouts', async () => {
    const promise = new Promise(resolve => setTimeout(resolve, 1000));
    promise.then(() => expect(true).toBe(true));

    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();
  });
});
```

---

## Example Test Suite

### Complete Example: Testing an MCP Tool

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';
import { executeMdsel } from '../src/executor.js';

// Mock the executor
vi.mock('../src/executor.js', () => ({
  executeMdsel: vi.fn()
}));

describe('MCP Tool: mdsel_index', () => {
  let client: Client;
  let server: McpServer;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create server
    server = new McpServer(
      { name: 'mdsel-claude', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    // Register the index tool
    server.registerTool(
      'mdsel_index',
      {
        description: 'Index a markdown file',
        inputSchema: z.object({
          file: z.string().min(1, 'File path is required')
        }),
        outputSchema: z.object({
          content: z.array(
            z.object({
              type: z.literal('text'),
              text: z.string()
            })
          )
        })
      },
      async (args, extra) => {
        const result = await executeMdsel('index', [args.file]);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.stderr || 'Indexing failed'}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: result.stdout
          }]
        };
      }
    );

    // Create transports and client
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  describe('Tool Registration', () => {
    it('should list the registered tool', async () => {
      const { tools } = await client.listTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('mdsel_index');
      expect(tools[0].description).toBe('Index a markdown file');
    });

    it('should have correct input schema', async () => {
      const { tools } = await client.listTools();
      const tool = tools[0];

      expect(tool.inputSchema.properties).toHaveProperty('file');
      expect(tool.inputSchema.required).toContain('file');
    });
  });

  describe('Tool Execution - Success Path', () => {
    beforeEach(() => {
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: 'h1.0 Title\n---\ncode:0 para:1\n',
        stderr: '',
        exitCode: 0
      });
    });

    it('should execute tool successfully', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { file: 'README.md' }
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('h1.0 Title');
    });

    it('should call executeMdsel with correct arguments', async () => {
      await client.callTool({
        name: 'mdsel_index',
        arguments: { file: 'test.md' }
      });

      expect(executeMdsel).toHaveBeenCalledWith('index', ['test.md']);
    });
  });

  describe('Tool Execution - Error Path', () => {
    beforeEach(() => {
      vi.mocked(executeMdsel).mockResolvedValue({
        success: false,
        stdout: '',
        stderr: 'File not found',
        exitCode: 1
      });
    });

    it('should handle execution errors', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { file: 'nonexistent.md' }
      });

      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('Abort Handling', () => {
    it('should respect abort signals', async () => {
      const abortController = new AbortController();

      // Mock executor that aborts
      vi.mocked(executeMdsel).mockImplementation(async () => {
        abortController.abort();
        return {
          success: false,
          stdout: '',
          stderr: 'Aborted',
          exitCode: null
        };
      });

      // Note: Actual abort handling depends on implementation
      // This is a placeholder for how you might test abort scenarios
    });
  });
});
```

---

## Key References

### MCP SDK Type Definitions

- **`@modelcontextprotocol/sdk/dist/esm/server/index.d.ts`** - Core Server class
- **`@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts`** - High-level McpServer class
- **`@modelcontextprotocol/sdk/dist/esm/client/index.d.ts`** - Client class for testing
- **`@modelcontextprotocol/sdk/dist/esm/inMemory.d.ts`** - InMemoryTransport for in-process testing
- **`@modelcontextprotocol/sdk/dist/esm/server/zod-compat.d.ts`** - Zod compatibility utilities
- **`@modelcontextprotocol/sdk/dist/esm/shared/protocol.d.ts`** - Protocol base classes and types

### Key SDK Methods for Testing

1. **`InMemoryTransport.createLinkedPair()`**
   - Creates two transports that communicate in-memory
   - Essential for integration tests without spawning processes

2. **`server.setRequestHandler(schema, handler)`**
   - Low-level request handler registration
   - Useful for testing protocol-level behavior

3. **`mcpServer.registerTool(name, config, callback)`**
   - High-level tool registration
   - Handles schema validation automatically

4. **`client.callTool(params, resultSchema?, options?)`**
   - Invokes tools and validates responses
   - Returns structured results

5. **`client.listTools(params?, options?)`**
   - Lists all available tools
   - Useful for verifying tool registration

### Testing Patterns Summary

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Direct Function Testing | Unit testing tool logic | Low |
| Mocked Dependencies | Testing without external dependencies | Medium |
| InMemoryTransport | Integration testing without network/stdio | Medium |
| Child Process Mocking | Testing CLI-based tools | High |
| Schema Validation Tests | Ensuring input/output contracts | Low-Medium |

---

## Best Practices

1. **Prefer InMemoryTransport** for integration tests over spawning actual processes
2. **Mock external dependencies** (like CLI calls) at module level for faster tests
3. **Test schema validation** both at registration time and during execution
4. **Test error paths** alongside success paths
5. **Use beforeEach/afterEach** for clean test isolation
6. **Parametrize tests** for multiple input scenarios
7. **Test abort handling** for long-running operations
8. **Validate both input and output schemas** when defined

---

## Notes for This Project

Given the current implementation in `/home/dustin/projects/mdsel-claude-attempt-2`:

1. The `executeMdsel` function in `src/executor.ts` is already well-tested with mocked spawn
2. MCP tools haven't been registered yet (see `src/index.ts` line 10 comment)
3. When implementing P1M3 (tool registration), follow these patterns:
   - Use `InMemoryTransport` for integration tests
   - Keep `vi.mock('node:child_process')` pattern for executor tests
   - Test both tool registration and tool invocation
   - Validate Zod schemas for both input and output
4. The existing test in `src/executor.test.ts` is a good reference for mocking patterns

---

## URLs and References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
