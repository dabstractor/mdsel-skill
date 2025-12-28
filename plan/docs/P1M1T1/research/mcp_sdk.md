# MCP SDK Research

## Official Resources

### GitHub Repository

- **Repository**: https://github.com/modelcontextprotocol/sdk
- **Organization**: Model Context Protocol
- **Purpose**: Official SDK for building MCP (Model Context Protocol) servers and clients

### NPM Package

- **Package Name**: `@modelcontextprotocol/sdk`
- **Installation**: `npm install @modelcontextprotocol/sdk`
- **Type**: TypeScript/JavaScript SDK for MCP server implementation

## Core SDK Architecture

### Basic Server Initialization

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Create MCP server instance
const server = new Server(
  {
    name: 'mdsel', // Server identifier
    version: '1.0.0', // Semantic version
  },
  {
    capabilities: {
      tools: {}, // Server capabilities
    },
  }
);
```

### Stdio Transport Setup

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { startServer } from '@modelcontextprotocol/sdk/server/index.js';

// Create stdio transport for Claude Code communication
const transport = new StdioServerTransport();

// Connect server to transport
await startServer(server, transport);

// Server is now listening on stdin/stdout
```

**Transport Characteristics:**

- Communication via standard input/output
- JSON-RPC 2.0 protocol over stdio
- Used by Claude Code for MCP server integration
- Requires Node.js >=18.0.0

## Tool Registration Patterns

### Tool Definition Schema

```typescript
interface ToolDefinition {
  name: string; // Unique tool identifier
  title?: string; // Human-readable name (optional)
  description: string; // Behavioral guidance for Claude
  inputSchema: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        items?: { type: string }; // For array types
      }
    >;
    required?: string[]; // Required property names
  };
}
```

### Registering Tools

```typescript
// Define tool
const toolDefinition = {
  name: 'mdsel_index',
  title: 'Markdown Selector Index',
  description: 'Index Markdown documents to discover available selectors...',
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of absolute file paths to Markdown documents to index',
      },
    },
    required: ['files'],
  },
};

// Register tool with server
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'mdsel_index') {
    // Handle tool invocation
    const args = request.params.arguments as { files: string[] };
    return await handleMdselIndex(args);
  }
  throw new Error('Tool not found');
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [toolDefinition],
  };
});
```

## Tool Handler Implementation Pattern

### Handler Return Type

```typescript
interface ToolResult {
  content: Array<{
    type: 'text';
    text: string; // JSON string or plain text
  }>;
  isError?: boolean; // Optional error flag
}
```

### Handler Implementation

```typescript
async function handleMdselIndex(args: { files: string[] }): Promise<ToolResult> {
  // Execute external command (e.g., mdsel CLI)
  const result = await execMdsel(['index', ...args.files, '--json']);

  // Return result verbatim (no post-processing)
  return {
    content: [{ type: 'text', text: result.stdout }],
    isError: !result.success,
  };
}
```

## Complete Server Example

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Tool definitions
const TOOLS = [
  {
    name: 'mdsel_index',
    title: 'Markdown Selector Index',
    description: 'Index Markdown documents to discover available selectors...',
    inputSchema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of absolute file paths',
        },
      },
      required: ['files'],
    },
  },
  {
    name: 'mdsel_select',
    title: 'Markdown Selector Select',
    description: 'Retrieve specific content from Markdown documents...',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector string (e.g., heading:h2[0])',
        },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file paths',
        },
      },
      required: ['selector', 'files'],
    },
  },
];

// Create server
const server = new Server({ name: 'mdsel', version: '1.0.0' }, { capabilities: { tools: {} } });

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'mdsel_index':
      return await handleMdselIndex(args as { files: string[] });
    case 'mdsel_select':
      return await handleMdselSelect(args as { selector: string; files: string[] });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

## Claude Code Integration

### MCP Server Configuration

```json
{
  "mcpServers": {
    "mdsel": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mdsel-claude/dist/index.mjs"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```

### Tool Invocation Pattern

When registered, tools are exposed with prefix pattern:

- `mcp__<server-name>__<tool-name>`
- Example: `mcp__mdsel__mdsel_index`

### Package.json Configuration

```json
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel-claude": "./dist/index.mjs"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Key SDK Features

### Request/Response Schema

- `CallToolRequestSchema`: Tool invocation requests
- `ListToolsRequestSchema`: Tool discovery requests
- `ListResourcesRequestSchema`: Resource discovery (if supported)
- `ListPromptsRequestSchema`: Prompt discovery (if supported)

### Server Capabilities

```typescript
{
  capabilities: {
    tools: {},           // Tool support
    resources: {},       // Optional: Resource support
    prompts: {},         // Optional: Prompt support
    logging?: {}         // Optional: Logging support
  }
}
```

### Error Handling

```typescript
// Return error via ToolResult
return {
  content: [{ type: 'text', text: errorMessage }],
  isError: true,
};

// Or throw MCP error
throw new Error('Tool execution failed');
```

## Build Requirements

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Bundle Configuration (tsup)

```typescript
export default {
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
};
```

## References from Plan Documentation

### Related Architecture Files

- `/home/dustin/projects/mdsel-claude-glm/plan/architecture/external_deps.md` - MCP server requirements and dependencies
- `/home/dustin/projects/mdsel-claude-glm/plan/architecture/system_context.md` - MCP server integration architecture
- `/home/dustin/projects/mdsel-claude-glm/plan/architecture/tool_definitions.md` - Tool definition patterns and schemas
- `/home/dustin/projects/mdsel-claude-glm/plan/architecture/hook_system.md` - PreToolUse hook patterns

### Project Requirements

- **Platform**: Claude Code (Anthropic's CLI)
- **Transport**: Stdio (standard input/output)
- **Protocol**: JSON-RPC 2.0
- **Language**: TypeScript/JavaScript (ESM)
- **Runtime**: Node.js >=18.0.0

### Behavioral Considerations

Tool descriptions should provide behavioral guidance to Claude:

- Explicitly state when NOT to use other tools (e.g., Read for large files)
- Include usage patterns and workflows
- Document input/output formats
- Provide selector grammar or syntax examples

## Implementation Notes

1. **Verbatim Passthrough**: Per project PRD, tool handlers must return CLI output verbatim without post-processing
2. **Error Handling**: Return errors from underlying tools unchanged (no rewriting)
3. **Stateless Design**: Each tool invocation is independent; no caching between calls
4. **Exit Codes**: Servers should use exit code 0 on success, non-zero on errors
5. **Shebang**: Built executables should include `#!/usr/bin/env node` shebang for direct execution
