# tsup Bundler Configuration Research

## Official Documentation

- **Documentation URL**: https://tsup.egoist.dev
- **GitHub**: https://github.com/egoist/tsup

## Example Configuration for ESM with node18 Target

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  minify: false,
});
```

## Type Declarations (.d.ts) Handling

tsup automatically generates type declarations when `dts: true` is set:

```typescript
export default defineConfig({
  dts: true, // Generates .d.ts files alongside outputs
});
```

**Key behaviors:**

- Uses `tsc` under the hood for type declaration generation
- Respects `tsconfig.json` compiler options
- Generates declarations for all entry points
- Handles re-exports and module resolution correctly
- Can be customized with `dts: { only: false }` to generate only types without JS

## Multiple Entry Points Configuration

For projects requiring multiple outputs (e.g., MCP server + hook):

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // MCP server entry
    'mcp-server': 'src/mcp-server/index.ts',
    // React hook entry
    'use-mcp': 'src/hooks/use-mcp.ts',
    // Shared utilities (optional)
    utils: 'src/utils/index.ts',
  },
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  sourcemap: true,
});
```

**Directory structure after build:**

```
dist/
├── mcp-server.js
├── mcp-server.d.ts
├── use-mcp.js
├── use-mcp.d.ts
├── utils.js
└── utils.d.ts
```

## Common Gotchas and Best Practices

### 1. **Entry Point Resolution**

```typescript
// GOOD: Explicit entry names
entry: {
  'server': 'src/server.ts',
  'client': 'src/client.ts',
}

// AVOID: Array format (harder to predict output names)
entry: ['src/server.ts', 'src/client.ts']
```

### 2. **Module Format Consistency**

```typescript
// For Node.js MCP server
format: ['esm'],  // or ['cjs'] if targeting older Node versions

// For dual package support (requires package.json exports configuration)
format: ['esm', 'cjs']
```

### 3. **Target Selection**

```typescript
// Node.js 18+ (modern ESM support)
target: 'node18';

// Node.js 16+ (ESM with caveats)
target: 'node16';

// For browser environments
target: 'es2020';
```

### 4. **Splitting and Code Sharing**

```typescript
// Enable for shared code between entry points
splitting: true,  // Creates chunks for shared dependencies

// Disable for simpler output (recommended for MCP servers)
splitting: false,
```

### 5. **External Dependencies**

```typescript
// Prevent bundling of peer dependencies or runtime dependencies
external: ['react', 'react-dom', '@modelcontextprotocol/sdk'];

// OR use regex for patterns
external: [/^@modelcontextprotocol\//];
```

### 6. **Source Maps for Debugging**

```typescript
// Essential for debugging in development
sourcemap: true,

// For production, can use inline source maps
sourcemap: 'inline',
```

### 7. **Clean Builds**

```typescript
// Always clean dist/ before building to avoid stale files
clean: true,
```

### 8. **Package.json Configuration**

For proper ESM support, ensure `package.json` includes:

```json
{
  "type": "module",
  "exports": {
    "./mcp-server": {
      "import": "./dist/mcp-server.js",
      "types": "./dist/mcp-server.d.ts"
    },
    "./use-mcp": {
      "import": "./dist/use-mcp.js",
      "types": "./dist/use-mcp.d.ts"
    }
  },
  "files": ["dist"]
}
```

### 9. **Watch Mode for Development**

```typescript
// CLI usage with watch mode
tsup --watch

// In build scripts
"scripts": {
  "dev": "tsup --watch",
  "build": "tsup"
}
```

### 10. **Common Issues**

**Issue**: Cannot find module errors after build

- **Solution**: Ensure `dts: true` and check `tsconfig.json` module resolution

**Issue**: Entry points importing from wrong paths

- **Solution**: Use named entry objects, not arrays. Verify output filenames match expectations

**Issue**: Bundled dependencies not resolved at runtime

- **Solution**: Add to `external` config or use `treeshake: false` if needed

**Issue**: Type declarations missing for re-exported modules

- **Solution**: Ensure `tsconfig.json` has `declaration: true` and check for circular dependencies

## Performance Considerations

- **Cache**: tsup caches builds by default. Use `--no-cache` to force rebuild
- **Parallel Builds**: Multiple entry points build in parallel automatically
- **Incremental Builds**: Watch mode only rebuilds changed files

## Additional Resources

- **CLI Options**: Run `npx tsup --help` for all CLI flags
- **TypeScript Options**: All TypeScript compiler options pass through via `tsconfig.json`
- **Plugin System**: tsup supports esbuild plugins for custom transformations
