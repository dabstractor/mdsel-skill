# MCP Node.js Server Setup Research

## 1. MCP SDK Documentation

### Official Package
- **NPM Package**: [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- **GitHub Repository**: [modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)

### Installation
```bash
npm install @modelcontextprotocol/sdk
```

### Key Documentation Sources
- API Reference: Available in the `docs/` directory of the SDK repository
- Type Definitions: TypeScript definitions are included in the package

## 2. MCP Server Patterns with TypeScript

### Basic Server Structure

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create server instance
const server = new Server({
  name: "my-mcp-server",
  version: "1.0.0"
});

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_weather",
    description: "Get weather for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string" }
      },
      required: ["location"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_weather") {
    const location = request.params.arguments?.location;
    // Implement your logic here
    return {
      content: [{
        type: "text",
        text: `Weather for ${location}: Sunny, 72°F`
      }]
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Register resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "file:///example.txt",
    name: "Example Resource",
    description: "An example resource",
    mimeType: "text/plain"
  }]
}));

// Register prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [{
    name: "summarize",
    description: "Summarize text",
    arguments: [{
      name: "text",
      description: "Text to summarize",
      required: true
    }]
  }]
}));

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

## 3. stdio Transport Configuration

### Import and Usage
```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Key Features
- Uses `stdin` for input and `stdout` for output
- Automatically handles JSON-RPC 2.0 protocol
- Built-in error handling and logging
- Supports bidirectional communication

## 4. Node.js ESM package.json Configuration

### Required Fields for ESM Packages

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Key Configuration Points
- **`"type": "module"`** - Enables ES modules support
- **`"main"`** - Entry point for CommonJS (optional with exports)
- **`"types"`** - TypeScript declaration file location
- **`"bin"`** - Executable script configuration
- **`"exports"`** - Modern module resolution mapping
- **`"files"`** - Specifies which files to include in the package

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 5. bin Configuration for Executable Packages

### Basic bin Configuration
```json
{
  "bin": {
    "my-mcp-server": "./dist/index.js"
  }
}
```

### Advanced bin Configuration with Shebang
```typescript
// src/index.ts
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Server implementation here

main().catch(console.error);
```

### Build Script Configuration
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "prepack": "npm run build"
  }
}
```

### Global Installation Considerations
When installing globally:
```bash
npm install -g .  # Uses the bin configuration
```

## 6. MCP Tool Registration Best Practices

### Tool Schema Guidelines
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tool_name",
      description: "Clear, concise description of what the tool does",
      inputSchema: {
        type: "object",
        properties: {
          required_param: {
            type: "string",
            description: "Description of required parameter"
          },
          optional_param: {
            type: "number",
            description: "Description of optional parameter",
            default: 42
          }
        },
        required: ["required_param"]
      }
    }
  ]
}));
```

### Error Handling
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Tool implementation
    return {
      content: [{
        type: "text",
        text: "Success!"
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`,
        isError: true
      }]
    };
  }
});
```

### Resource Management
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "mcp://my-server/data/123",
      name: "Sample Resource",
      description: "A sample data resource",
      mimeType: "application/json"
    }
  ]
}));
```

## 7. Complete Example Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts
│   ├── server.ts
│   └── types.ts
├── dist/
│   ├── index.js
│   └── index.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

### package.json Example
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "An MCP server implementation",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "prepack": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

## References

- [Model Context Protocol GitHub Repository](https://github.com/modelcontextprotocol/sdk)
- [NPM Package Registry - @modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [NPM Package.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)