# ESM Configuration for Node.js/TypeScript Projects

## Overview

This document summarizes the key configuration requirements and gotchas for setting up ESM (ECMAScript Modules) in Node.js/TypeScript projects, with specific considerations for MCP SDK projects.

## 1. Package.json Configuration

### Essential Settings

```json
{
  "type": "module"
}
```

**Key Points:**

- Setting `"type": "module"` in `package.json` enables ESM mode for the entire project
- This tells Node.js to treat `.js` files as ES modules
- Requires Node.js 12.20+ (recommended: Node.js 18+ or 20+)
- Cannot mix CommonJS and ESM in the same package (without workarounds)

### Additional Considerations

```json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./package.json": "./package.json"
  }
}
```

- Use `"exports"` field to define entry points (recommended over `"main"`)
- Explicitly define file extensions in exports
- Consider adding `"imports"` for internal path aliases

## 2. tsconfig.json Settings for ESM

### Recommended Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key Settings Explained:**

- **`"module": "NodeNext"`**: Outputs ESM-compatible code for Node.js
- **`"moduleResolution": "NodeNext"`**: Uses Node.js ESM resolution algorithm
- **`"target": "ES2022"`**: Ensures modern JavaScript features are available
- **`"outDir": "./dist"`**: Separate build directory from source
- **`"rootDir": "./src"`**: Clear source directory structure

## 3. File Extensions - Common Gotchas

### The .js Extension Requirement

**In TypeScript (source):**

```typescript
// ❌ Wrong - Missing extension
import { myFunction } from './utils';

// ✅ Correct - Must include .js
import { myFunction } from './utils.js';
```

**Why `.js` in TypeScript source?**

- TypeScript transpiles `.ts` → `.js`
- At runtime, Node.js needs the actual file extension
- TypeScript's `module: "NodeNext"` requires extensions in imports
- The extension refers to the _output_ file, not the source file

### File Extension Rules

| Scenario                     | Import Statement                                   | Notes                                |
| ---------------------------- | -------------------------------------------------- | ------------------------------------ |
| Local `.ts` file             | `from './file.js'`                                 | Always use `.js` extension           |
| Local folder with `index.ts` | `from './folder/index.js'` or `from './folder.js'` | Must point to entry point            |
| `node_modules` package       | `from 'package-name'`                              | No extension needed                  |
| Built-in Node.js modules     | `from 'node:path'`                                 | Use `node:` prefix (optional)        |
| JSON files                   | `from './data.json'`                               | Requires `"resolveJsonModule": true` |

### Common Errors

**Error: Cannot find module**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/path/to/project/src/utils.js'
```

**Solution:** Ensure all local imports include `.js` extension.

**Error: Unknown file extension**

```
Error [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```

**Solution:** Run TypeScript compiler (`tsc`) to transpile before executing with Node.js, or use a loader like `tsx` for development.

## 4. MCP SDK Specific Considerations

### Package.json for MCP Projects

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### MCP SDK Import Patterns

```typescript
// ✅ Correct - ESM import
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// ❌ Wrong - Missing extension
import { Server } from '@modelcontextprotocol/sdk/server/index';
```

**Key Points:**

- MCP SDK is ESM-only in recent versions
- Must include `.js` extensions for SDK imports
- Use `StdioServerTransport` for CLI-based MCP servers
- Ensure all async functions use top-level `await` if needed

### Executable MCP Server

```typescript
#!/usr/bin/env node
// src/index.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'my-server',
  version: '1.0.0',
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Build steps:**

```bash
# 1. Compile TypeScript
npm run build

# 2. Make executable (Unix/Linux)
chmod +x dist/index.js

# 3. Run directly
./dist/index.js
```

## 5. Official Documentation

### TypeScript

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [TSConfig Reference - Module](https://www.typescriptlang.org/tsconfig#module)
- [TSConfig Reference - ModuleResolution](https://www.typescriptlang.org/tsconfig#moduleResolution)

### Node.js

- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [Node.js package.json type field](https://nodejs.org/api/packages.html#type)
- [Node.js Exports Field](https://nodejs.org/api/packages.html#exports)

### MCP SDK

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Quick Reference Checklist

- [ ] `package.json` has `"type": "module"`
- [ ] `tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- [ ] All local imports include `.js` extension
- [ ] Build output directory (`dist`) is separate from source (`src`)
- [ ] Node.js version is 18+ or 20+
- [ ] MCP SDK imports include `.js` extension
- [ ] Executable files have shebang `#!/usr/bin/env node`
- [ ] `package.json` exports field defined for library packages

## Troubleshooting

### Import errors with `.ts` extensions

**Problem:** TypeScript complains about `.ts` extensions
**Solution:** Use `.js` extensions in imports - they refer to the compiled output

### "Cannot find module" after build

**Problem:** Runtime can't find modules
**Solution:** Check that:

1. Files were compiled to `dist/` directory
2. Imports use `.js` extensions
3. `outDir` in `tsconfig.json` matches actual output location

### MCP SDK import errors

**Problem:** Cannot import from `@modelcontextprotocol/sdk`
**Solution:** Ensure you're using `.js` extensions:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
```

### Type definitions not found

**Problem:** `Cannot find module '@modelcontextprotocol/sdk/server/index.js' or its corresponding type declarations`
**Solution:** This is expected with ESM. TypeScript will still provide types through `.d.ts` files. The error is from the type checker but will work at runtime.
