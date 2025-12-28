# MCP Server Implementation Examples

## 1. GitHub Repository Examples

### Official MCP SDK Repositories

- **[Anthropic MCP SDK](https://github.com/modelcontextprotocol/sdk)** - Main TypeScript SDK
- **[Python MCP SDK](https://github.com/modelcontextprotocol/python-sdk)** - Python implementation
- **[MCP Specification](https://github.com/modelcontextprotocol/spec)** - Official specification

### Example Implementations with stdio Transport

- **[Filesystem MCP Server](https://github.com/modelcontextprotocol/sdk/tree/main/examples/filesystem)** - Complete stdio example
- **[Git MCP Server](https://github.com/modelcontextprotocol/sdk/tree/main/examples/git)** - Advanced tool registration
- **[Brave Search MCP Server](https://github.com/modelcontextprotocol/sdk/tree/main/examples/brave-search)** - External API integration

## 2. Tool Registration with Behavioral Descriptions

### Basic Tool Registration

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'filesystem-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool with behavioral description
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'read_file',
        description: 'Read the complete contents of a file at the specified path',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Absolute path to the file to read',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description:
          "Write content to a file, creating it if it doesn't exist or overwriting it if it does",
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Absolute path where the file should be written',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
    ],
  };
});

// Tool handler implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'read_file':
      return {
        content: [
          {
            type: 'text',
            text: await fs.readFile(args.path, 'utf-8'),
          },
        ],
      };

    case 'write_file':
      await fs.writeFile(args.path, args.content);
      return {
        content: [
          {
            type: 'text',
            text: `File written successfully to ${args.path}`,
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### Advanced Tool with Error Handling

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'complex_operation':
        // Validate required arguments
        if (!args.input || typeof args.input !== 'string') {
          throw new Error('Input must be a non-empty string');
        }

        // Perform operation with proper error handling
        const result = await performComplexOperation(args.input);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Convert errors to MCP error format
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});
```

## 3. MCP Server Entry Points with Proper Exports

### ESM Implementation (Modern)

```typescript
// src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { filesystemTool } from './tools/filesystem.js';
import { searchTool } from './tools/search.js';

async function createServer() {
  const server = new Server(
    {
      name: 'example-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tools
  await server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [filesystemTool, searchTool],
    };
  });

  // Set up tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'filesystem_read':
        return await handleFilesystemRead(args);
      case 'web_search':
        return await handleWebSearch(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

async function main() {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Export for use in tests
export { createServer };

// If this is the main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
```

### Package.json Configuration

```json
{
  "name": "example-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "example-mcp-server": "dist/server.js"
  },
  "main": "dist/server.js",
  "exports": {
    ".": "./dist/server.js",
    "./server": "./dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "stdio": "node dist/server.js"
  }
}
```

## 4. Integration Testing for MCP Servers

### Test Setup with Vitest

```typescript
// tests/server.test.ts
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../src/server';

describe('MCP Server', () => {
  let server: Server;
  let mockStdin: any;
  let mockStdout: any;

  beforeEach(async () => {
    // Mock stdio
    mockStdin = {
      onData: vi.fn(),
      end: vi.fn(),
    };
    mockStdout = {
      write: vi.fn(),
      end: vi.fn(),
    };

    // Create server with mocked transport
    server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should list available tools', async () => {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    };

    // Send request and get response
    const response = await sendRequestToServer(listToolsRequest);

    expect(response.jsonrpc).toBe('2.0');
    expect(response.result?.tools).toHaveLength(2);
    expect(response.result?.tools[0].name).toBe('filesystem_read');
  });

  it('should handle tool calls successfully', async () => {
    const callToolRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'filesystem_read',
        arguments: {
          path: '/tmp/test.txt',
        },
      },
    };

    const response = await sendRequestToServer(callToolRequest);

    expect(response.jsonrpc).toBe('2.0');
    expect(response.result?.content).toBeDefined();
  });

  it('should handle unknown tools gracefully', async () => {
    const callToolRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'unknown_tool',
        arguments: {},
      },
    };

    const response = await sendRequestToServer(callToolRequest);

    expect(response.jsonrpc).toBe('2.0');
    expect(response.error?.code).toBeDefined();
  });
});

// Helper function to simulate JSON-RPC communication
async function sendRequestToServer(request: any): Promise<any> {
  // Implementation would depend on your test setup
  // This is a simplified version
  return new Promise((resolve) => {
    // Mock the server's response handling
    setTimeout(() => {
      resolve({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: 'Mock response',
            },
          ],
        },
      });
    }, 10);
  });
}
```

### Test Utilities

```typescript
// tests/test-utils.ts
import { spawn } from 'child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export class MCPServerTestHarness {
  private serverProcess: any;
  private requests: any[] = [];
  private responses: any[] = [];

  async start(serverPath: string) {
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Handle incoming messages
    this.serverProcess.stdout.on('data', (data) => {
      const message = JSON.parse(data.toString());
      this.responses.push(message);
    });

    // Send initial connection message
    await this.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    });
  }

  async send(request: any): Promise<any> {
    this.requests.push(request);
    this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

    // Wait for response with matching ID
    return new Promise((resolve) => {
      const checkResponse = () => {
        const response = this.responses.find((r) => r.id === request.id);
        if (response) {
          resolve(response);
        } else {
          setTimeout(checkResponse, 10);
        }
      };
      checkResponse();
    });
  }

  async stop() {
    this.serverProcess.kill();
  }
}
```

## 5. Common Patterns for Tool Routing and Error Handling

### Tool Router Pattern

```typescript
class ToolRouter {
  private handlers: Map<string, (args: any) => Promise<any>> = new Map();

  constructor() {
    // Register all tool handlers
    this.registerHandler('filesystem_read', this.handleFilesystemRead);
    this.registerHandler('filesystem_write', this.handleFilesystemWrite);
    this.registerHandler('web_search', this.handleWebSearch);
    this.registerHandler('data_analysis', this.handleDataAnalysis);
  }

  registerHandler(name: string, handler: (args: any) => Promise<any>) {
    this.handlers.set(name, handler);
  }

  async route(request: { name: string; arguments: any }): Promise<any> {
    const handler = this.handlers.get(request.name);

    if (!handler) {
      throw new Error(`Unknown tool: ${request.name}`);
    }

    return await handler(request.arguments);
  }

  private async handleFilesystemRead(args: { path: string }) {
    // Implementation with validation
    if (!args.path || typeof args.path !== 'string') {
      throw new Error('Path must be a non-empty string');
    }

    try {
      const content = await fs.readFile(args.path, 'utf-8');
      return { content };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  private async handleWebSearch(args: { query: string; count?: number }) {
    // Implementation with defaults
    const { query, count = 10 } = args;

    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    if (count < 1 || count > 100) {
      throw new Error('Count must be between 1 and 100');
    }

    // Perform search
    return await performWebSearch(query, count);
  }
}

// Usage in MCP server
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const router = new ToolRouter();
  const result = await router.route({
    name: request.params.name,
    arguments: request.params.arguments,
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});
```

### Comprehensive Error Handling

```typescript
class MCPServerError extends Error {
  constructor(
    public code: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPServerError';
  }
}

async function safeToolHandler(handler: (args: any) => Promise<any>) {
  return async (args: any) => {
    try {
      const result = await handler(args);
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle different types of errors
      if (error instanceof MCPServerError) {
        return {
          content: [
            {
              type: 'text',
              text: `Error [${error.code}]: ${error.message}`,
            },
          ],
          isError: true,
        };
      }

      if (error instanceof Error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }

      // Unknown error type
      return {
        content: [
          {
            type: 'text',
            text: `Unknown error occurred`,
          },
        ],
        isError: true,
      };
    }
  };
}

// Usage
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'risky_operation':
      return safeToolHandler(async (args) => {
        if (!args.input) {
          throw new MCPServerError(400, 'Input is required');
        }

        // Simulate error
        if (args.input === 'error') {
          throw new MCPServerError(500, 'Internal server error');
        }

        return { success: true, input: args.input };
      })(args);

    default:
      throw new MCPServerError(-32601, `Unknown tool: ${name}`);
  }
});
```

### Logging and Monitoring

```typescript
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console(), new transports.File({ filename: 'mcp-server.log' })],
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;

  logger.info({
    event: 'tool_call_started',
    tool: name,
    arguments: args,
    requestId: request.id,
  });

  try {
    const result = await callToolImplementation(name, args);

    const duration = Date.now() - startTime;
    logger.info({
      event: 'tool_call_completed',
      tool: name,
      duration,
      success: true,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({
      event: 'tool_call_failed',
      tool: name,
      duration,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
});
```

## Key Implementation Notes

1. **stdio Transport**: Always handle stdin/stdout properly with proper JSON-RPC message framing
2. **Error Handling**: Use proper error codes and messages following JSON-RPC standards
3. **Tool Descriptions**: Be specific about what each tool does and what parameters it expects
4. **Testing**: Test both success and error cases, including edge cases
5. **Logging**: Implement comprehensive logging for debugging and monitoring
6. **Performance**: Consider timeouts for long-running operations
7. **Security**: Validate all inputs and sanitize outputs appropriately
