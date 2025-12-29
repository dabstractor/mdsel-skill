# MCP SDK Research Summary

## Overview

This document summarizes the Model Context Protocol (MCP) SDK research for building TypeScript servers, focusing on the `@modelcontextprotocol/sdk` package and implementation patterns for the mdsel-claude project.

## Key Findings

### 1. Official MCP SDK Documentation and Resources

**Package**: `@modelcontextprotocol/sdk`

**Key Imports** (from external_deps.md):
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

**Note**: Due to API usage limitations, the official MCP documentation website (modelcontextprotocol.io) could not be accessed. The documentation was primarily derived from the project architecture files.

### 2. MCP Server Initialization Patterns

**Basic Server Setup**:
```typescript
const server = new Server(
  {
    name: 'mdsel-claude',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [/* tool definitions */] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle tool calls
});

// Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 3. Tool Definition and Handler Patterns

**Tool Definition Format**:
```typescript
{
  name: "tool_name",
  description: "Tool description for Claude",
  inputSchema: {
    type: "object",
    properties: {
      param1: { type: "string", description: "..." },
    },
    required: ["param1"]
  }
}
```

**Tool Response Format**:
```typescript
{
  content: [
    {
      type: "text",
      text: "Response text or JSON string"
    }
  ],
  isError: false  // or true for errors
}
```

**Handler Pattern**:
```typescript
async function handleToolCall(name: string, args: object): Promise<ToolResult> {
  try {
    const response = await invokeMdsel(/* ... */);

    return {
      content: [{
        type: "text",
        text: JSON.stringify(response, null, 2)
      }],
      isError: !response.success
    };
  } catch (spawnError) {
    return {
      content: [{
        type: "text",
        text: `mdsel invocation failed: ${spawnError.message}`
      }],
      isError: true
    };
  }
}
```

### 4. Stdio Transport Setup Methods

**Stdio Transport Initialization**:
```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Transport Configuration**:
- Uses standard input/output streams
- Ideal for local process communication with Claude Code
- No additional configuration required beyond basic instantiation

**Claude Code Configuration** (from external_deps.md):
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

### 5. MCP Server Structure Best Practices

**Project Structure** (from implementation_notes.md):
```
mdsel-claude/
├── src/
│   ├── server.ts           # MCP server entry point
│   ├── tools/
│   │   ├── index.ts        # Tool definitions
│   │   ├── mdsel-index.ts  # mdsel_index handler
│   │   └── mdsel-select.ts # mdsel_select handler
│   ├── mdsel/
│   │   ├── invoke.ts       # Child process invocation
│   │   └── types.ts        # Response types (from mdsel)
│   └── config.ts           # Environment configuration
├── tests/
│   ├── tools/
│   ├── integration/
│   └── mocks/
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

**Build Configuration** (from implementation_notes.md):
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
});
```

**Key Best Practices Identified**:

1. **Stateless Design**: The server maintains no state between requests
2. **Error Passthrough**: All errors from the underlying tool (mdsel) are returned verbatim
3. **Minimal Surface Area**: Only expose the required tools (2 in this case)
4. **Type Safety**: Use TypeScript interfaces for all request/response types
5. **Child Process Communication**: Use `child_process.spawn` for external tool invocation
6. **JSON Output**: Always use `--json` flag for structured output from external tools
7. **ES Modules**: Configure project for ES modules with proper build output
8. **Testing Strategy**: Unit tests for individual components, integration tests for server lifecycle

### 6. Implementation Notes from Architecture

**Error Handling Philosophy**:
- Pass through errors verbatim from mdsel
- Only catch spawn-level errors (mdsel not found, JSON parse failure)
- Do not rewrite or modify error messages

**Scope Boundaries**:
- In scope: MCP server implementation, tool definitions, child process invocation
- Out of scope: Markdown parsing, selector validation, caching, state management

**Tool Descriptions**:
- Use tool descriptions for behavioral conditioning
- Encourage selector-based access over full file reads
- Provide clear guidance on usage patterns

## Package Dependencies

**Primary Dependencies**:
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "typescript": "^5.0.0",
  "tsup": "^8.0.0",
  "vitest": "^2.0.0",
  "@types/node": "^20.0.0"
}
```

## Limitations and Considerations

1. **Documentation Access**: Could not access official MCP documentation due to API limitations
2. **Reminder Hook Feasibility**: The PRD's reminder hook may not be technically feasible within MCP constraints, as MCP servers cannot intercept Claude's built-in Read tool
3. **Behavioral Conditioning**: Must be achieved through tool descriptions rather than runtime interception
4. **Word Count Gating**: Cannot be enforced at runtime; must be documented and encouraged through tool descriptions

## Recommendations

1. **Official Documentation**: When available, refer to modelcontextprotocol.io for complete API documentation
2. **Tool Design**: Keep tools focused and single-purpose
3. **Error Handling**: Maintain clear separation between tool errors and invocation errors
4. **Testing**: Implement comprehensive testing for both success and error scenarios
5. **Build Pipeline**: Use a modern build tool like tsup for efficient bundling
6. **Type Definitions**: Maintain strict TypeScript interfaces for all data structures

## URLs for Further Research

Due to API usage limitations, the following URLs could not be accessed:
- https://modelcontextprotocol.io/ (Official MCP documentation)

Recommended search terms for future research:
- "Model Context Protocol SDK documentation"
- "MCP TypeScript server examples"
- "@modelcontextprotocol/sdk GitHub"
- "MCP stdio transport setup"

---

*Research completed based on project architecture files and implementation notes*