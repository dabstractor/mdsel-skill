# TypeScript ES Modules Build Patterns for Node.js 18+ Projects

## Overview

This document covers comprehensive TypeScript ES modules build patterns specifically designed for Node.js 18+ projects, with focus on MCP servers, CLI tools, and common build challenges.

## 1. Common Build Issues with TypeScript ES Modules

### 1.1 Node.js Version Conflicts
- **Issue**: Mixing `"module": "commonjs"` in tsconfig with `"type": "module"` in package.json
- **Solution**: Use `"module": "NodeNext"` or `"module": "ESNext"` with `"type": "module"` in package.json
- **Reference**: [TypeScript Handbook: Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/module-resolution.html)

### 1.2 Import Extension Problems
- **Issue**: Missing `.js` extensions in import statements when using ES modules
- **Solution**: Always include `.js` extensions for imports:
  ```typescript
  import { Server } from '@modelcontextprotocol/sdk';  // ✅
  import { Server } from './server.js';                // ✅

  import { Server } from '@modelcontextprotocol/sdk';  // ❌ No extension
  import { Server } from './server';                  // ❌ No extension
  ```
- **Why required**: Node.js requires explicit extensions in ES modules when `package.json` has `"type": "module"`

### 1.3 Module Resolution Order
- **Issue**: Bundlers vs Node.js resolving modules differently
- **Solution**: Use `"moduleResolution": "NodeNext"` for hybrid projects

## 2. tsup Configuration Best Practices

### 2.1 Basic tsup Configuration
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  external: ['@modelcontextprotocol/sdk', 'node:*'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

### 2.2 Key Configuration Options

#### Format Settings
- `format: ['esm']` - Output ES modules only
- `platform: 'node'` - Target Node.js environment
- `target: 'node18'` - Compile for Node.js 18+

#### Output Control
- `dts: true` - Generate TypeScript declaration files
- `sourcemap: true` - Generate source maps for debugging
- `clean: true` - Clean output directory before build

### 2.3 Advanced Configuration for MCP Servers
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    server: 'src/server.ts',
    cli: 'src/cli.ts',
  },

  // Multiple formats if needed
  format: ['esm'],

  // Splitting for better code organization
  splitting: false, // Keep as single file for Node.js

  // Define process variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  // Minification for production
  minify: process.env.NODE_ENV === 'production',

  // Watch mode for development
  watch: process.env.NODE_ENV === 'development',
});
```

## 3. External Dependencies Handling

### 3.1 Why Externalize @modelcontextprotocol/sdk
- **Native Node.js Dependencies**: The SDK is designed to work with Node.js native modules
- **Version Compatibility**: Bundling can cause version conflicts
- **Performance**: Native modules load faster when externalized
- **Module Resolution**: Node.js handles native module resolution better

### 3.2 External Dependencies Configuration
```typescript
// tsup.config.ts
external: [
  '@modelcontextprotocol/sdk',
  'node:*',           // All Node.js built-in modules
  'buffer',           // Specific Node.js modules
  'stream',
  'util',
  'path',
  'fs',
  'os',
],
```

### 3.3 When NOT to Externalize
For pure JavaScript libraries that don't have Node.js-specific code, consider bundling:
```typescript
// tsup.config.ts
external: (id) => {
  // Don't bundle npm packages except MCP SDK and Node.js modules
  return id.includes('@modelcontextprotocol/sdk') ||
         id.startsWith('node:') ||
         id.startsWith('buffer') ||
         id.startsWith('stream');
},
```

## 4. .mjs vs .js Output Extensions

### 4.1 When to Use .mjs
- **Explicit ESM**: When you want to force ES module semantics
- **Package.json without "type": "module"**: When your project uses CommonJS by default
- **Mixed Environments**: When some files need to be explicitly ESM

### 4.2 When to Use .js
- **"type": "module" in package.json**: Modern Node.js projects (recommended)
- **Simplicity**: Cleaner file extensions
- **Tooling Support**: Better integration with most modern tools

### 4.3 Your Current Configuration
```json
// package.json
{
  "type": "module",
  "main": "./dist/server.mjs",  // Using .mjs extension
  "bin": {
    "mdsel-claude": "./dist/server.mjs"
  }
}
```

**Recommendation**: Consider using `.js` extensions since you have `"type": "module"`:
```json
{
  "type": "module",
  "main": "./dist/server.js",
  "bin": {
    "mdsel-claude": "./dist/server.js"
  }
}
```

## 5. Import Path Issues and Solutions

### 5.1 Extension Requirements in TypeScript
```typescript
// ✅ Correct - with extensions
import { Server } from '@modelcontextprotocol/sdk';
import { CLI } from './cli.js';
import { utils } from './utils/index.js';

// ❌ Incorrect - missing extensions
import { Server } from '@modelcontextprotocol/sdk';
import { CLI } from './cli';
import { utils } from './utils/index';
```

### 5.2 tsconfig.json Settings for Extensionless Imports
```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "noEmit": false
  }
}
```

### 5.3 Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

## 6. Shebang Handling for CLI Tools

### 6.1 Adding Shebangs
```typescript
// tsup.config.ts
export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

### 6.2 Alternative Methods
#### Method 1: Direct File Editing
```bash
# After build, add shebang manually
echo '#!/usr/bin/env node' | cat - dist/server.js > temp && mv temp dist/server.js
chmod +x dist/server.js
```

#### Method 2: Build Script
```json
// package.json
{
  "scripts": {
    "build": "tsup && node -e \"const fs = require('fs'); const content = '#!/usr/bin/env node\\n' + fs.readFileSync('dist/server.js'); fs.writeFileSync('dist/server.js', content); fs.chmodSync('dist/server.js', '755');\""
  }
}
```

### 6.3 Cross-Platform Considerations
```typescript
// Cross-platform shebang
banner: {
  js: '#!/usr/bin/env node',
},
postBuild: [
  {
    command: 'chmod +x dist/*.js',
    description: 'Make generated files executable',
  },
],
```

## 7. Complete Build Configuration Example

### 7.1 package.json
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "MCP server implementation",
  "type": "module",
  "main": "./dist/server.js",
  "bin": {
    "my-server": "./dist/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "build:dev": "tsup --watch",
    "test": "vitest",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### 7.2 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleDetection": "force",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 7.3 tsup.config.ts
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  external: ['@modelcontextprotocol/sdk', 'node:*'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  minify: process.env.NODE_ENV === 'production',
});
```

## 8. Official Documentation References

- [TypeScript 5.0 Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [tsup Official Documentation](https://tsup.egoist.dev/)
- [Node.js 18+ Release Notes](https://nodejs.org/en/blog/release/v18.0.0/)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)

## 9. Common Gotchas and Solutions

### 9.1 Build Errors
- **Error**: "Cannot find module '@modelcontextprotocol/sdk'"
  **Solution**: Ensure it's listed in `external` array
  **Fix**: `external: ['@modelcontextprotocol/sdk', 'node:*']`

- **Error**: "SyntaxError: Cannot use import statement outside a module"
  **Solution**: Check `package.json` has `"type": "module"`
  **Fix**: Add `"type": "module"` to package.json

### 9.2 Runtime Errors
- **Error**: "Module not found: Error: Can't resolve './utils'"
  **Solution**: Add `.js` extension to imports
  **Fix**: `import { utils } from './utils.js'`

- **Error**: "Invalid shebang in executable"
  **Solution**: Ensure proper line endings
  **Fix**: Use `banner` configuration in tsup

### 9.3 Performance Issues
- **Problem**: Slow build times
  **Solution**: Use tsup's watch mode for development
  **Fix**: `npm run build:dev`

- **Problem**: Large bundle size
  **Solution**: Externalize more dependencies
  **Fix**: Add more packages to `external` array

## 10. Migration Guide

### 10.1 From CommonJS to ES Modules
1. Add `"type": "module"` to package.json
2. Change `module`: `CommonJS` to `module`: `NodeNext` in tsconfig.json
3. Add `.js` extensions to all imports
4. Update build tool configuration (tsup)
5. Test thoroughly with different Node.js versions

### 10.2 Testing Strategy
```bash
# Test with different Node.js versions
nvm use 18
npm test
nvm use 20
npm test
nvm use 22
npm test
```

## Conclusion

TypeScript ES modules with Node.js 18+ offer modern JavaScript features with excellent tooling support. The key to success is:

1. Use `"type": "module"` in package.json
2. Configure tsup with proper external dependencies
3. Always include `.js` extensions in imports
4. Test across multiple Node.js versions
5. Handle shebangs properly for CLI tools

This configuration provides a robust foundation for MCP servers and CLI tools that need to work reliably across different Node.js environments.