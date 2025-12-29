# MCP Tool Registration with Zod Schemas - Research Findings

**Research Date:** 2025-12-28
**MCP SDK Version:** ^1.0.4
**Zod Version:** ^3.24.0

---

## Table of Contents

1. [Overview](#overview)
2. [How to Register Tools](#how-to-register-tools)
3. [API: `server.tool()` vs `server.setRequestHandler()`](#api-servertool-vs-serversetrequesthandler)
4. [Zod Integration with MCP](#zod-integration-with-mcp)
5. [Tool Handler Patterns](#tool-handler-patterns)
6. [Returning Results from Tools](#returning-results-from-tools)
7. [Complete Examples](#complete-examples)
8. [Type Definitions Reference](#type-definitions-reference)
9. [Useful URLs](#useful-urls)

---

## Overview

The Model Context Protocol (MCP) TypeScript SDK provides two main classes for building servers:

- **`McpServer`** - High-level API (recommended for most use cases)
- **`Server`** - Low-level API (for advanced use cases)

The SDK has a **required peer dependency on `zod`** for schema validation. It internally imports from `zod/v4` but maintains backward compatibility with Zod v3.25+.

---

## How to Register Tools

### Using `McpServer` (Recommended)

The `McpServer` class provides a high-level API for registering tools using Zod schemas.

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

// Create server instance
const server = new McpServer({
  name: 'my-server',
  version: '1.0.0'
});

// Register a tool with registerTool()
server.registerTool(
  'tool-name',
  {
    title: 'Tool Title',        // Optional display name
    description: 'Tool description',
    inputSchema: {              // Zod schema for input validation
      param1: z.string().describe('Parameter description'),
      param2: z.number().optional().describe('Optional parameter')
    },
    outputSchema: {             // Optional: Zod schema for structured output
      result: z.string()
    },
    annotations: {              // Optional: Tool behavior hints
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false
    }
  },
  async (args, extra) => {
    // Tool handler implementation
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
);
```

### Using Deprecated `server.tool()` Method

The `server.tool()` method is marked as deprecated but still functional:

```typescript
// Zero-argument tool
server.tool('simple-tool', async () => {
  return { content: [{ type: 'text', text: 'Hello' }] };
});

// Tool with description and schema
server.tool(
  'greet',
  'Greets a person',
  {
    name: z.string().describe('Name to greet')
  },
  async ({ name }) => {
    return {
      content: [{ type: 'text', text: `Hello, ${name}!` }]
    };
  }
);
```

### Using Low-Level `Server` Class

For advanced use cases, you can use the low-level `Server` class with `setRequestHandler()`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
});

// Register handler for tools/call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handle tool call
  return {
    content: [{ type: 'text', text: 'Result' }]
  };
});
```

---

## API: `server.tool()` vs `server.setRequestHandler()`

### `server.registerTool()` (Recommended)

**Location:** `/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts`

**Signature:**
```typescript
registerTool<
  OutputArgs extends ZodRawShapeCompat | AnySchema,
  InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined
>(
  name: string,
  config: {
    title?: string;
    description?: string;
    inputSchema?: InputArgs;
    outputSchema?: OutputArgs;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
  },
  cb: ToolCallback<InputArgs>
): RegisteredTool
```

**Features:**
- Automatic Zod schema validation for inputs and outputs
- Type-safe parameter inference from Zod schemas
- High-level API with built-in error handling
- Support for structured output via `outputSchema`

### `server.setRequestHandler()` (Low-Level)

**Location:** `/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.d.ts`

**Signature:**
```typescript
setRequestHandler<T extends AnyObjectSchema>(
  requestSchema: T,
  handler: (
    request: SchemaOutput<T>,
    extra: RequestHandlerExtra<ServerRequest | RequestT, ServerNotification | NotificationT>
  ) => ServerResult | ResultT | Promise<ServerResult | ResultT>
): void
```

**Features:**
- Low-level access to MCP protocol
- Manual request/response handling
- Must implement validation and error handling yourself
- Use only for advanced use cases

---

## Zod Integration with MCP

### Zod Schema Compatibility

The MCP SDK provides Zod compatibility layer in `zod-compat.d.ts`:

```typescript
// Type definitions
type AnySchema = z3.ZodTypeAny | z4.$ZodType;
type AnyObjectSchema = z3.AnyZodObject | z4.$ZodObject | AnySchema;
type ZodRawShapeCompat = Record<string, AnySchema>;
type SchemaOutput<S> = S extends z3.ZodTypeAny ? z3.infer<S> : S extends z4.$ZodType ? z4.output<S> : never;
type ShapeOutput<Shape extends ZodRawShapeCompat> = {
  [K in keyof Shape]: SchemaOutput<Shape[K]>;
};
```

### Input Schema (Zod)

Input schemas define the expected parameters for a tool:

```typescript
// Using Zod v3 or v4
import * as z from 'zod';  // or 'zod/v3' or 'zod/v4'

server.registerTool('calculate', {
  inputSchema: {
    // Required string parameter
    expression: z.string().describe('Math expression to evaluate'),

    // Optional number parameter
    precision: z.number().min(0).max(10).optional().default(2),

    // Enum parameter
    mode: z.enum(['exact', 'approximate']).describe('Calculation mode'),

    // Nested object
    options: z.object({
      caseSensitive: z.boolean().optional(),
      trim: z.boolean().optional()
    }).optional()
  }
}, async (args) => {
  // args is typed based on schema
  const { expression, precision, mode, options } = args;
  // ...
});
```

### Output Schema (Zod)

Output schemas define structured responses:

```typescript
server.registerTool('get-user', {
  inputSchema: {
    userId: z.string()
  },
  outputSchema: {
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      roles: z.array(z.enum(['admin', 'user', 'guest']))
    }),
    metadata: z.object({
      createdAt: z.string(),
      lastLogin: z.string().optional()
    })
  }
}, async ({ userId }) => {
  const user = await fetchUser(userId);
  return {
    content: [
      { type: 'text', text: `Found user: ${user.name}` }
    ],
    structuredContent: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      metadata: {
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  };
});
```

---

## Tool Handler Patterns

### Tool Handler Function Signature

```typescript
type ToolCallback<Args extends undefined | ZodRawShapeCompat | AnySchema = undefined> =
  Args extends ZodRawShapeCompat
    ? (args: ShapeOutput<Args>, extra: RequestHandlerExtra) => CallToolResult | Promise<CallToolResult>
    : Args extends AnySchema
    ? (args: SchemaOutput<Args>, extra: RequestHandlerExtra) => CallToolResult | Promise<CallToolResult>
    : (extra: RequestHandlerExtra) => CallToolResult | Promise<CallToolResult>;
```

### RequestHandlerExtra

The `extra` parameter provides additional context:

```typescript
interface RequestHandlerExtra {
  sendRequest: (request: RequestSchema, responseSchema?: ZodSchema) => Promise<unknown>;
  sessionId?: string;
  // ... other properties
}
```

### Handler Examples

#### Simple Handler (No Arguments)

```typescript
server.registerTool('ping', {}, async (extra) => {
  return {
    content: [{ type: 'text', text: 'pong' }]
  };
});
```

#### Handler with Arguments

```typescript
server.registerTool('echo', {
  inputSchema: {
    message: z.string(),
    count: z.number().optional().default(1)
  }
}, async ({ message, count }, extra) => {
  return {
    content: [{ type: 'text', text: message.repeat(count) }]
  };
});
```

#### Handler with Error Handling

```typescript
server.registerTool('divide', {
  inputSchema: {
    numerator: z.number(),
    denominator: z.number()
  }
}, async ({ numerator, denominator }) => {
  if (denominator === 0) {
    return {
      content: [{ type: 'text', text: 'Error: Division by zero' }],
      isError: true
    };
  }

  return {
    content: [{ type: 'text', text: String(numerator / denominator) }]
  };
});
```

#### Async Handler with External API Call

```typescript
server.registerTool('fetch-url', {
  inputSchema: {
    url: z.string().url()
  }
}, async ({ url }) => {
  try {
    const response = await fetch(url);
    const text = await response.text();

    return {
      content: [{ type: 'text', text: text.substring(0, 1000) }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});
```

---

## Returning Results from Tools

### CallToolResult Structure

```typescript
interface CallToolResult extends Result {
  content: ContentBlock[];      // Unstructured result (text, images, etc.)
  structuredContent?: {          // Structured JSON result (when using outputSchema)
    [key: string]: unknown;
  };
  isError?: boolean;             // Error flag (default: false)
  _meta?: {                      // Optional metadata
    [key: string]: unknown;
  };
}
```

### Content Block Types

#### Text Content

```typescript
{
  content: [
    {
      type: 'text',
      text: 'Hello, world!',
      annotations: {
        audience: ['user', 'assistant'],
        priority: 1,
        lastModified: '2025-01-01T00:00:00Z'
      }
    }
  ]
}
```

#### Image Content

```typescript
{
  content: [
    {
      type: 'image',
      data: 'base64-encoded-image-data',
      mimeType: 'image/png'
    }
  ]
}
```

#### Resource Link

```typescript
{
  content: [
    {
      type: 'resource_link',
      uri: 'file:///path/to/file.txt',
      description: 'Linked file resource',
      name: 'file.txt',
      title: 'File Resource'
    }
  ]
}
```

### Error Results

**Important:** Tool errors should be returned in the result object with `isError: true`, NOT thrown as exceptions:

```typescript
// Correct way to return an error
return {
  content: [{ type: 'text', text: 'Failed to process: reason' }],
  isError: true
};

// Don't throw errors for tool execution failures
// throw new Error('...'); // WRONG - client won't see the error
```

### Structured Output with `outputSchema`

When an `outputSchema` is defined, return both `content` and `structuredContent`:

```typescript
server.registerTool('calculate', {
  inputSchema: {
    a: z.number(),
    b: z.number()
  },
  outputSchema: {
    sum: z.number(),
    difference: z.number(),
    product: z.number(),
    quotient: z.number()
  }
}, async ({ a, b }) => {
  return {
    content: [
      { type: 'text', text: `Calculation complete for ${a} and ${b}` }
    ],
    structuredContent: {
      sum: a + b,
      difference: a - b,
      product: a * b,
      quotient: b !== 0 ? a / b : null
    }
  };
});
```

---

## Complete Examples

### Example 1: Simple Greeting Tool

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'greeting-server',
  version: '1.0.0'
});

server.registerTool('greet', {
  title: 'Greeting Tool',
  description: 'Greets a person by name',
  inputSchema: {
    name: z.string().describe('Name of the person to greet'),
    title: z.string().optional().describe('Optional title (Mr, Ms, Dr, etc.)')
  }
}, async ({ name, title }) => {
  const fullName = title ? `${title} ${name}` : name;
  return {
    content: [
      { type: 'text', text: `Hello, ${fullName}! Nice to meet you.` }
    ]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Example 2: Tool with Structured Output

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'weather-server',
  version: '1.0.0'
});

server.registerTool('get-weather', {
  description: 'Get current weather for a location',
  inputSchema: {
    city: z.string().describe('City name'),
    country: z.string().optional().describe('Country code (e.g., US, UK)')
  },
  outputSchema: {
    location: z.object({
      city: z.string(),
      country: z.string()
    }),
    temperature: z.object({
      celsius: z.number(),
      fahrenheit: z.number()
    }),
    conditions: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy']),
    humidity: z.number().min(0).max(100)
  }
}, async ({ city, country = 'US' }) => {
  // Simulate weather API call
  const tempC = 22;
  const conditions = 'sunny';

  return {
    content: [
      { type: 'text', text: `Weather in ${city}, ${country}: ${conditions}, ${tempC}°C` }
    ],
    structuredContent: {
      location: { city, country },
      temperature: {
        celsius: tempC,
        fahrenheit: (tempC * 9/5) + 32
      },
      conditions,
      humidity: 45
    }
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Example 3: Tool with Annotations

```typescript
server.registerTool('read-file', {
  description: 'Read contents of a text file',
  inputSchema: {
    path: z.string().describe('File path to read'),
    encoding: z.enum(['utf8', 'ascii']).optional().default('utf8')
  },
  annotations: {
    title: 'File Reader',
    readOnlyHint: true,      // Does not modify environment
    destructiveHint: false,  // Not destructive
    idempotentHint: true,    // Same result on repeated calls
    openWorldHint: false      // Closed domain of interaction
  }
}, async ({ path, encoding }) => {
  const fs = await import('fs/promises');
  try {
    const content = await fs.readFile(path, encoding);
    return {
      content: [
        { type: 'text', text: content }
      ]
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error reading file: ${error.message}` }
      ],
      isError: true
    };
  }
});
```

### Example 4: Multiple Tools Registration

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'multi-tool-server',
  version: '1.0.0'
});

// Tool 1: Calculator
server.registerTool('add', {
  description: 'Add two numbers',
  inputSchema: {
    a: z.number(),
    b: z.number()
  },
  outputSchema: {
    result: z.number()
  }
}, async ({ a, b }) => ({
  content: [{ type: 'text', text: `${a} + ${b} = ${a + b}` }],
  structuredContent: { result: a + b }
}));

// Tool 2: String manipulator
server.registerTool('reverse-string', {
  description: 'Reverse a string',
  inputSchema: {
    text: z.string()
  }
}, async ({ text }) => ({
  content: [{ type: 'text', text: text.split('').reverse().join('') }]
}));

// Tool 3: Current time
server.registerTool('current-time', {
  description: 'Get current time in specified timezone',
  inputSchema: {
    timezone: z.string().optional().default('UTC')
  }
}, async ({ timezone }) => ({
  content: [{ type: 'text', text: new Date().toLocaleString('en-US', { timeZone: timezone }) }]
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Multi-tool server running');
}

main().catch(console.error);
```

---

## Type Definitions Reference

### Tool Interface

```typescript
interface Tool extends BaseMetadata, Icons {
  description?: string;        // Human-readable description
  inputSchema: {               // JSON Schema for input parameters
    type: 'object';
    properties?: { [key: string]: object };
    required?: string[];
  };
  outputSchema?: {             // JSON Schema for structured output
    type: 'object';
    properties?: { [key: string]: object };
    required?: string[];
  };
  execution?: ToolExecution;   // Execution-related properties
  annotations?: ToolAnnotations; // Additional tool information
  _meta?: { [key: string]: unknown };
}
```

### Tool Annotations

```typescript
interface ToolAnnotations {
  title?: string;              // Human-readable title
  readOnlyHint?: boolean;      // Tool does not modify environment (default: false)
  destructiveHint?: boolean;   // Tool performs destructive updates (default: true)
  idempotentHint?: boolean;    // Repeated calls have same effect (default: false)
  openWorldHint?: boolean;     // Tool interacts with external entities (default: true)
}
```

### Tool Execution

```typescript
interface ToolExecution {
  taskSupport?: 'forbidden' | 'optional' | 'required';  // Task-augmented execution support
}
```

### CallToolResult

```typescript
interface CallToolResult extends Result {
  content: ContentBlock[];      // Array of content blocks
  structuredContent?: {          // Structured JSON output
    [key: string]: unknown;
  };
  isError?: boolean;             // Error flag
}
```

### ContentBlock Types

```typescript
type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | ResourceLink
  | EmbeddedResource;

interface TextContent {
  type: 'text';
  text: string;
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

interface ImageContent {
  type: 'image';
  data: string;                 // base64-encoded image data
  mimeType: string;
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

interface ResourceLink {
  type: 'resource_link';
  uri: string;
  description?: string;
  mimeType?: string;
  name: string;
  title?: string;
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
  icons?: Icon[];
}
```

---

## Useful URLs

### Official Documentation

- **MCP TypeScript SDK README**
  `file:///home/dustin/projects/mdsel-claude-attempt-2/node_modules/@modelcontextprotocol/sdk/README.md`

- **MCP Specification**
  https://modelcontextprotocol.io
  https://spec.modelcontextprotocol.io

- **GitHub Repository**
  https://github.com/modelcontextprotocol/typescript-sdk

- **Example Servers**
  https://github.com/modelcontextprotocol/servers

### Local SDK Files

- **McpServer Type Definitions**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts`

- **Server Type Definitions**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.d.ts`

- **Zod Compatibility Layer**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.d.ts`

- **MCP Types**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/types.d.ts`

- **MCP Spec Types**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/spec.types.d.ts`

### Example Code Files

- **Simple Streamable HTTP Server**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/simpleStreamableHttp.js`

- **Output Schema Example**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/mcpServerOutputSchema.js`

- **Tool with Sampling Server**
  `/node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/toolWithSampleServer.js`

---

## Key Takeaways

1. **Use `McpServer` and `registerTool()`** for most use cases - it's the high-level, recommended API
2. **Zod schemas are required** for input validation - the SDK has a required peer dependency on Zod
3. **Define `inputSchema`** with Zod schemas for automatic validation and type inference
4. **Use `outputSchema`** when you need structured JSON responses
5. **Return errors with `isError: true`** in the result object, not by throwing exceptions
6. **Tool annotations** provide hints to clients about tool behavior (readOnly, destructive, idempotent, openWorld)
7. **Content types** include text, images, audio, resource links, and embedded resources
8. **Use `structuredContent`** when an outputSchema is defined, otherwise use `content` array

---

*End of Research Document*
