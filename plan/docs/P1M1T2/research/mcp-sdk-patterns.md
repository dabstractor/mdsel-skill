# Model Context Protocol (MCP) SDK Server Implementation Patterns

## 1. @modelcontextprotocol/sdk - Official Documentation & GitHub Repo

### Primary Resources
- **Official GitHub Repository**: https://github.com/modelcontextprotocol/sdk
- **Documentation**: https://modelcontextprotocol.io
- **Specification**: https://github.com/modelcontextprotocol/specification
- **NPM Package**: `@modelcontextprotocol/sdk`

### Language-specific SDKs
- **TypeScript/Node.js**: `@modelcontextprotocol/sdk` (npm package)
- **Python**: `mcp` (PyPI package)
- **Go**: `github.com/modelcontextprotocol/go-sdk`

## From Existing Project Implementation

Based on the mdsel-claude project implementation:

### Key Imports Used in Production
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

### High-Level McpServer Class
The SDK provides a high-level `McpServer` class that simplifies common patterns:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer(
  {
    name: 'my-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);
```

## 2. Server Initialization Patterns

### Basic Server Setup
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create a new server instance
const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);
```

### Advanced Initialization with Options
```typescript
const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
    description: 'My custom MCP server for data processing',
  },
  {
    capabilities: {
      tools: {
        // Enable tools capability
      },
      resources: {
        // Enable resources capability for data sources
      },
      prompts: {
        // Enable prompts capability
      },
    },
  }
);
```

### High-Level McpServer Initialization
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer(
  {
    name: 'my-server',
    version: '1.0.0',
    description: 'My custom MCP server',
  },
  {
    capabilities: {
      tools: true,  // Enable tools
      resources: false, // Disable resources
      prompts: true,   // Enable prompts
    },
  }
);

// Access the underlying server for advanced features
console.log(server.server);
```

## 3. Stdio Transport Setup

### Basic Stdio Transport
```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create and start the stdio transport
const transport = new StdioServerTransport();

// Start the server
await server.connect(transport);
```

### Advanced Stdio with Error Handling
```typescript
const transport = new StdioServerTransport();

server.connect(transport).catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});
```

## 4. Tool Handler Patterns

### Basic Tool Registration
```typescript
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'calculate':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(calculateResult(args)),
        }],
      };

    case 'fetch_data':
      return {
        content: [{
          type: 'text',
          text: await fetchData(args),
        }],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### Tool Handler with Type Safety
```typescript
interface CalculateArgs {
  expression: string;
  precision?: number;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'calculate') {
    const { expression, precision = 2 } = args as CalculateArgs;

    try {
      const result = eval(expression); // Use proper math library in production
      return {
        content: [{
          type: 'text',
          text: `Result: ${result.toFixed(precision)}`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Invalid expression'}`,
        }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

### Multiple Tools Pattern
```typescript
// Define tool handlers
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  search: async ({ query, limit = 10 }) => {
    // Implementation
  },

  analyze: async ({ text }) => {
    // Implementation
  },

  transform: async ({ data, format }) => {
    // Implementation
  },
};

// Register handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (toolHandlers[name]) {
    const result = await toolHandlers[name](args);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result),
      }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

## 5. Build Considerations

### Why SDK Shouldn't Be Bundled

**Key Reasons:**
1. **Version Stability**: The SDK may change between versions, bundling can cause conflicts
2. **Size**: MCP SDK adds significant bundle size (~50-100KB minified)
3. **Security**: Better to keep dependencies separate for security updates
4. **Compatibility**: Bundled versions may not work with newer MCP clients

### Build Configuration Recommendations

#### Using ESBuild (Recommended)
```json
// esbuild.config.json
{
  "entryPoints": ["src/index.ts"],
  "bundle": false,
  "platform": "node",
  "format": "esm",
  "outdir": "dist",
  "packages": "external",
  "external": [
    "@modelcontextprotocol/sdk"
  ]
}
```

#### Using Vite
```json
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        '@modelcontextprotocol/sdk'
      ],
      output: {
        dir: 'dist'
      }
    }
  }
});
```

#### Using TypeScript Compiler
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "outDir": "dist",
    "target": "es2022",
    "lib": ["es2022"],
    "strict": true
  }
}
```

### Package.json Configuration
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## 6. Testing MCP Servers Locally

### Development Testing Pattern

#### 1. Create a Test Script
```typescript
// test-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function testServer() {
  const server = new Server(
    {
      name: 'test-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register test tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return {
      content: [{
        type: 'text',
        text: `Test response for ${request.params.name}`,
      }],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('Test server started');
}

testServer().catch(console.error);
```

#### 2. Run with Local Development
```bash
# Test directly with node
node dist/test-server.js

# Or use npm script
npm run test:server
```

### Integration Testing with Claude Code

#### Create a test MCP configuration
```json
// claude-desktop-config.json
{
  "mcpServers": {
    "my-test-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### Test using MCP Client
```typescript
// test-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testClient() {
  const transport = new StdioClientTransport();
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  await client.connect(transport);

  // Test tool listing
  const toolsResponse = await client.request({
    method: 'tools/list',
    params: {},
  });
  console.log('Available tools:', toolsResponse);

  // Test tool call
  const callResponse = await client.request({
    method: 'tools/call',
    params: {
      name: 'my-tool',
      arguments: { test: 'value' },
    },
  });
  console.log('Tool response:', callResponse);
}
```

### Docker Testing Pattern
```dockerfile
# Dockerfile.test
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm ci

RUN npm run build

CMD ["node", "dist/index.js"]
```

```bash
# Build and test
docker build -f Dockerfile.test -t mcp-test-server .

docker run --rm mcp-test-server
```

### From mdsel-claude Implementation

#### Test Configuration Example
```json
{
  "mcpServers": {
    "mdsel": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mdsel-claude/dist/server.mjs"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```

#### Testing Environment Variables
```typescript
// src/config.ts
import { config } from 'dotenv';

config(); // Load .env file

const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  minWords: parseInt(process.env.MDSEL_MIN_WORDS || '200'),
};
```

#### Integration Testing Pattern
```typescript
// tests/integration/server.test.ts
import { spawn } from 'child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

test('MCP server starts and responds', async () => {
  const child = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const server = new Server(
    { name: 'test-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Connect to child process
  const transport = new StdioServerTransport(child.stdin, child.stdout);
  await server.connect(transport);

  // Test server response
  // ... implementation details
});
```

## Implementation Best Practices

### 1. Error Handling
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Tool implementation
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: error instanceof Error ? error.message : 'Unknown error',
      }],
      isError: true,
    };
  }
});
```

### 2. Resource Management
```typescript
// Clean up resources on shutdown
process.on('SIGTERM', async () => {
  // Close database connections
  // Clean up temporary files
  // Save state
  await server.close();
});
```

### 3. Logging
```typescript
import { createLogger } from 'winston';

const logger = createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info(`Tool called: ${request.params.name}`, {
    arguments: request.params.arguments,
  });

  // ... handler implementation
});
```

### 4. Configuration Management
```typescript
import { config } from 'dotenv';

config(); // Load .env file

const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
};
```

### Experimental Features

The SDK includes experimental features that may change:

```typescript
// Access experimental features
const experimental = server.experimental;
if (experimental?.tasks) {
  // Enable task-based features
  experimental.tasks.setToolHandler('my-tool', handler);
}
```

### Low-level Server Access
For advanced operations, access the underlying server:

```typescript
// For notifications and custom handlers
server.server.setRequestHandler(CustomNotificationSchema, async (request) => {
  // Handle custom notifications
});
```

## References and Further Reading

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Official MCP SDK Documentation](https://modelcontextprotocol.io)
- [MCP GitHub Organization](https://github.com/modelcontextprotocol)
- [TypeScript SDK Examples](https://github.com/modelcontextprotocol/sdk/tree/main/examples)

## Additional Resources

### Example Repositories
- [MCP Examples](https://github.com/modelcontextprotocol/examples)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Community MCP Servers](https://github.com/topics/mcp-server)

### Community and Support
- [MCP Discord Server](https://discord.gg/modelcontextprotocol)
- [GitHub Discussions](https://github.com/modelcontextprotocol/sdk/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/model-context-protocol)

---

*Note: This research document will be updated as the MCP ecosystem evolves. Always refer to the latest official documentation for the most up-to-date information.*