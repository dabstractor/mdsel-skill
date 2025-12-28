# MCP Server Development and Publishing Best Practices

## Overview

This document researches best practices for developing and publishing MCP (Model Context Protocol) servers as npm packages, based on the official TypeScript SDK and industry standards.

---

## 1. MCP Server Package Structure

### Required Files for npm Package Publishing

#### package.json Essentials

```json
{
  "name": "mcp-server-example",
  "version": "1.0.0",
  "type": "module",
  "description": "An MCP server for [specific purpose]",
  "keywords": ["modelcontextprotocol", "mcp", "server"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "mcp-server-example": "./dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "vitest run tests/e2e/",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run test && npm run build && npm run lint"
  },
  "peerDependencies": {
    "@modelcontextprotocol/sdk": ">=1.0.0"
  },
  "dependencies": {
    "zod": "^3.25 || ^4.0",
    "@cfworker/json-schema": "^4.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0",
    "@modelcontextprotocol/sdk": "latest",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

### Bin Entry Requirements

- Must be executable (`chmod +x`)
- Should include a shebang: `#!/usr/bin/env node`
- Should follow CLI conventions
- Use ES modules syntax (no commonjs required in modern Node.js)
- Include error handling for CLI usage

```javascript
// dist/index.js (compiled)
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/transport/stdio.js";
import { helloWorld } from './hello-world.js';

async function main() {
  const server = new Server(
    {
      name: "mcp-server-example",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tools and resources
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "hello-world",
          description: "A simple hello world example",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name to greet",
              },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "hello-world") {
      return { content: [{ type: "text", text: await helloWorld(args.name) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  await transport.run();
}

main().catch(console.error);
```

### Directory Structure Best Practices

```
mcp-server-example/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # Tool implementations
│   ├── resources/            # Resource handlers
│   ├── types/                # Type definitions
│   └── utils/                # Utility functions
├── tests/
│   ├── unit/                 # Unit tests
│   ├── e2e/                  # End-to-end tests
│   └── fixtures/             # Test fixtures
├── dist/                     # Compiled output (not committed)
├── .eslintrc.json            # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Package metadata
└── README.md                # Documentation
```

---

## 2. Quality Gates for Publishing

### What Should Run Before npm Publish

#### Prepublish Checklist

1. **Test Suite must pass**

   ```json
   "prepublishOnly": "npm run test && npm run build && npm run lint"
   ```

2. **Build artifacts must be generated**

   ```json
   "build": "tsup --format esm --dts"
   ```

3. **Type checking must pass**

   ```json
   "type-check": "tsc --noEmit"
   ```

4. **Linting must pass**

   ```json
   "lint": "eslint . --ext .ts,.js"
   ```

5. **Formatting must be consistent**
   ```json
   "format": "prettier --write ."
   ```

### Testing Requirements for MCP Servers

#### Minimum Test Coverage

- **Unit Tests**: For all tool implementations (90%+ coverage)
- **E2E Tests**: For MCP protocol compliance
- **Integration Tests**: For CLI binary
- **Type Tests**: For TypeScript definitions

```typescript
// tests/unit/hello-world.test.ts
import { helloWorld } from '../../src/tools/hello-world.js';

describe('helloWorld', () => {
  it('should return greeting', async () => {
    const result = await helloWorld('World');
    expect(result).toBe('Hello, World!');
  });
});
```

```typescript
// tests/e2e/server.test.ts
import { spawn } from 'child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('MCP Server E2E', () => {
  it('should list tools correctly', async () => {
    // Test server-client communication
  });
});
```

### Documentation Requirements

#### README.md Template

````markdown
# MCP Server Example

An MCP server providing [description of capabilities].

## Installation

```bash
npm install mcp-server-example
```
````

## Usage

### As a CLI tool

```bash
mcp-server-example
```

### As a module

```typescript
import { createServer } from 'mcp-server-example';

const server = createServer();
// ...
```

## Configuration

[Configuration documentation]

## Tools

- `tool-name`: [Description]
  - Input schema: [Link or description]
  - Example usage: [Code example]

## Development

```bash
npm install
npm run dev
```

## License

[License]

````

---

## 3. Common MCP Server Patterns

### Linting and Formatting Patterns

#### .eslintrc.json
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": "warn"
  },
  "overrides": [
    {
      "files": ["tests/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
````

#### Prettier Configuration (.prettierrc)

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "printWidth": 80
}
```

### prepublishOnly Scripts in Published MCP Servers

Based on analysis of published MCP servers:

```json
{
  "scripts": {
    "prepublishOnly": "npm run lint && npm run type-check && npm run test && npm run build"
  }
}
```

### CI/CD Patterns in MCP Ecosystem

#### GitHub Actions Example (/.github/workflows/publish.yml)

```yaml
name: Publish MCP Server

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          token: ${{ secrets.NPM_TOKEN }}
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 4. MCP SDK Specifics

### Linting Rules Specific to @modelcontextprotocol/sdk

#### Additional ESLint Rules

```json
{
  "rules": {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/return-await": "always",
    "no-async-promise-executor": "error"
  }
}
```

### Import Patterns That Need ESLint Configuration

```typescript
// Required imports
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/transport/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';

// Additional schemas
import {
  ResourceTemplate,
  ListResourcesRequest,
  CallResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
```

### TypeScript Constraints

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Protocol Compliance Validation

```typescript
// types/validation.ts
import { z } from 'zod';

// Tool input schema validation
const ToolInputSchema = z.object({
  type: z.literal('object'),
  properties: z.record(z.unknown()),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().default(false),
});

// Resource template validation
const ResourceTemplateSchema = z.object({
  uri: z.string().url(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string().optional(),
});

export function validateToolSchema(schema: unknown) {
  return ToolInputSchema.parse(schema);
}

export function validateResourceTemplate(template: unknown) {
  return ResourceTemplateSchema.parse(template);
}
```

---

## 5. Additional Best Practices

### Security Considerations

1. **Input Validation**: Always validate tool inputs with Zod
2. **Error Handling**: Don't leak internal errors to clients
3. **Dependency Updates**: Keep dependencies updated and audit regularly
4. **Permissions**: Set appropriate file permissions (600 for secrets)

### Performance Optimization

1. **Connection Management**: Handle multiple client connections
2. **Resource Cleanup**: Implement proper cleanup in tool handlers
3. **Memory Usage**: Monitor memory usage in long-running processes

### Versioning Strategy

1. **Semantic Versioning**: Follow SemVer strictly
2. **Breaking Changes**: Document protocol changes in MAJOR version
3. **Deprecation**: Provide deprecation warnings before removal

---

## Sources

1. [Model Context Protocol GitHub Repository](https://github.com/modelcontextprotocol)
2. [MCP TypeScript SDK v1.x (Stable)](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
3. [MCP TypeScript SDK v2.x (Development)](https://github.com/modelcontextprotocol/typescript-sdk)
4. [npm Publishing Guidelines](https://docs.npmjs.com/publishing-packages-npm)
5. [ESLint Configuration Best Practices](https://eslint.org/docs/latest/use/configure/)
6. [TypeScript Documentation](https://www.typescriptlang.org/docs/)
7. [Node.js ES Modules](https://nodejs.org/api/esm.html)
8. [Zod Schema Validation Library](https://zod.dev/)
9. [MCP Protocol Specification](https://modelcontextprotocol.io/specification/draft)
