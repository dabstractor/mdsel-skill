# tsup Configuration Research

## Overview

tsup is a fast TypeScript bundler built on top of esbuild. This document researches and documents the best practices for configuring tsup for various use cases including ESM output, Node.js 18 targets, type declarations, and executable scripts.

## Official Documentation Sources

- **Official Documentation**: https://tsup.egoist.dev/
- **GitHub Repository**: https://github.com/egoist/tsup
- **npm Package**: https://www.npmjs.com/package/tsup

## 1. ESM Output Configuration

### Key Configuration Options

For pure ESM output, configure tsup with the following options:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',                    // Output format: 'esm', 'cjs', 'iife', or array
  platform: 'node',                // Target platform: 'node', 'browser', 'neutral'
  target: 'esnext',                // Target ECMAScript version
  outDir: 'dist',                 // Output directory
  clean: true,                     // Clean output directory before build
  sourcemap: true,                 // Generate source maps
  minify: false,                   // Minify output (false by default for ESM)
  splitting: false,                // Enable code splitting
})
```

### Package.json Configuration

When using ESM output, ensure your `package.json` is properly configured:

```json
{
  "name": "my-esm-package",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup"
  }
}
```

### Pure ESM Best Practices

1. **Use `format: 'esm'`** for single ESM output
2. **Set `"type": "module"`** in package.json
3. **Include `platform: 'node'`** for Node.js compatibility
4. **Use `target: 'esnext'`** to enable modern JavaScript features
5. **Set `minify: false`** by default (ESM minification has trade-offs)

## 2. Node.js 18+ Target Configuration

### Target Configuration Options

```typescript
// tsup.config.ts for Node.js 18+
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],          // Dual package support
  target: 'node18',                // Node.js 18 target
  platform: 'node',                // Node.js platform
  dts: true,                       // Generate type declarations
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Optional: Configure esbuild options
  esbuildOptions(options) {
    options.conditions = ['node']   // Node.js conditions
  }
})
```

### Dual Package CommonJS + ESM

For maximum Node.js 18+ compatibility:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],          // Generate both formats
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  // Separate output directories for clarity
  outDir: (format) => `dist/${format === 'cjs' ? 'cjs' : 'esm'}`,
  entry: {
    index: ['src/index.ts'],
    cli: ['src/cli.ts']             // Multiple entry points
  }
})
```

### Package.json for Dual Package

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./package.json": "./package.json"
  },
  "bin": {
    "my-cli": "./dist/cjs/cli.js"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

## 3. Type Declaration Generation

### Basic DTS Configuration

```typescript
// tsup.config.ts with DTS
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,                       // Enable declaration generation
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // DTS-specific options
  dts: {
    // Custom output directory for declarations
    outDir: 'dist/types',
    // Include source maps in declarations
    sourcemap: true,
    // Skip .d.ts files for CJS output
    only: ['esm']
  }
})
```

### Advanced DTS Configuration

For more control over declaration generation:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // Legacy option (still works)
  dts: true,
  // Modern option (preferred)
  declaration: {
    outDir: 'dist/types',
    // Emit declaration files only
    emitDeclarationOnly: true,
    // Bundle declarations
    bundle: true,
    // Skip .d.ts.map files
    inlineSources: true
  },
  clean: true,
  sourcemap: true
})
```

### DTS Best Practices

1. **Use `dts: true`** for simple declaration generation
2. **For complex projects**, use the `declaration` option for more control
3. **Include `types` field** in package.json:
   ```json
   {
     "types": "./dist/types/index.d.ts"
   }
   ```
4. **Consider `bundle: true`** to bundle multiple .d.ts files
5. **Use `emitDeclarationOnly: true`** to only generate declarations

## 4. Executable Scripts

### CLI Application Configuration

```typescript
// tsup.config.ts for CLI
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: ['src/index.ts'],
    cli: ['src/cli.ts']
  },
  format: 'cjs',                   // Use CJS for CLI (better shebang support)
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Add shebang to CLI output
  banner: {
    js: '#!/usr/bin/env node\n'
  },
  // Make CLI executable
  outExtension() {
    return { js: '.js' }
  }
})
```

### Package.json for CLI

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup",
    "postbuild": "chmod +x dist/cli.js"
  }
}
```

### Cross-platform Shebang Support

For cross-platform compatibility:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: 'cjs',
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  // Conditional shebang based on platform
  banner: {
    js: process.platform === 'win32'
      : '#!/usr/bin/env node\n'
  }
})
```

## 5. Best Practices and Common Pitfalls

### Recommended Configuration Template

```typescript
// tsup.config.ts - Recommended template
import { defineConfig } from 'tsup'
import { execSync } from 'child_process'

export default defineConfig({
  // Entry points
  entry: ['src/index.ts'],

  // Output formats
  format: ['cjs', 'esm'],

  // Target Node.js 18+
  target: 'node18',
  platform: 'node',

  // Output configuration
  outDir: 'dist',
  clean: true,

  // Development/Production settings
  sourcemap: process.env.NODE_ENV !== 'production',
  minify: process.env.NODE_ENV === 'production',

  // Type declarations
  dts: true,

  // Code splitting
  splitting: false,

  // External dependencies
  external: [
    'fs',
    'path',
    'util',
    // Add other built-in modules
  ],

  // Banner for executable
  banner: {
    js: '#!/usr/bin/env node\n'
  },

  // Post-build hook
  async onSuccess() {
    // Copy additional files
    execSync('cp README.md LICENSE dist/', { stdio: 'inherit' })
  }
})
```

### Common Pitfalls and Solutions

#### 1. **ESM Import/Export Issues**
- **Problem**: Mixed ESM/CJS imports cause errors
- **Solution**: Use `import type` for type-only imports
- **Solution**: Configure proper `exports` in package.json

```typescript
// Good practice
import type { MyType } from './types.js'  // Type-only import
import { myFunction } from './utils.js'   // Runtime import
```

#### 2. **Missing External Dependencies**
- **Problem**: Built-in modules included in bundle
- **Solution**: Use `external` option
```typescript
external: ['fs', 'path', 'crypto', 'util']
```

#### 3. **Type Declaration Errors**
- **Problem**: .d.ts files not generated correctly
- **Solution**: Ensure `tsconfig.json` is properly configured
- **Solution**: Use `dts: true` or `declaration` option

#### 4. **File Size Issues**
- **Problem**: Large bundle sizes
- **Solution**: Use `splitting: true` for large libraries
- **Solution**: Externalize dependencies
- **Solution**: Use `minify: true` for production

#### 5. **Platform-Specific Code**
- **Problem**: Code doesn't work on all platforms
- **Solution**: Use `platform: 'node'` or `platform: 'browser'`
- **Solution**: Handle platform-specific logic with conditions

### Advanced Configuration Patterns

#### Monorepo Configuration

```typescript
// tsup.config.ts for monorepo
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: ['src/index.ts'],
    utils: ['src/utils/index.ts']
  },
  format: ['cjs', 'esm'],
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  // Parallel builds for monorepo
  concurrent: true,
  // Watch mode for development
  watch: process.env.NODE_ENV === 'development'
})
```

#### Library with Subpath Exports

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: ['src/index.ts'],
    utils: ['src/utils/index.ts']
  },
  format: ['cjs', 'esm'],
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  // Match package.json exports
  outDir: (format) => `dist/${format === 'cjs' ? 'cjs' : 'esm'}`,
  // Generate entry files for subpaths
  entryPointsOnly: true
})
```

## Configuration Reference

### Complete Configuration Options

```typescript
interface TsupOptions {
  entry: string | string[] | Record<string, string[]>
  format?: 'cjs' | 'esm' | 'iife' | ('cjs' | 'esm' | 'iife')[]
  target?: string | string[]
  platform?: 'node' | 'browser' | 'neutral'
  outDir?: string | ((format: 'cjs' | 'esm' | 'iife') => string)
  clean?: boolean
  sourcemap?: boolean
  minify?: boolean
  splitting?: boolean
  external?: string[]
  dts?: boolean | DtsOptions
  declaration?: DtsOptions
  banner?: { js?: string; css?: string }
  footer?: { js?: string; css?: string }
  outExtension?: () => Record<string, string>
  watch?: boolean
  onSuccess?: () => Promise<void>
  esbuildOptions?: (options: any) => void
  entryPointsOnly?: boolean
  concurrent?: boolean
}
```

### Key Configuration Options Summary

| Option | Type | Description |
|--------|------|-------------|
| `entry` | string/string[]/Record | Entry files to bundle |
| `format` | string/string[] | Output format (cjs, esm, iife) |
| `target` | string/string[] | Target ECMAScript version |
| `platform` | string | Target platform (node, browser, neutral) |
| `outDir` | string/function | Output directory |
| `clean` | boolean | Clean output before build |
| `sourcemap` | boolean | Generate source maps |
| `minify` | boolean | Minify output |
| `splitting` | boolean | Enable code splitting |
| `external` | string[] | External dependencies |
| `dts` | boolean/DtsOptions | Generate type declarations |
| `banner` | object | Add banner to output |
| `onSuccess` | function | Post-build hook |

## Conclusion

tsup provides a powerful and fast way to bundle TypeScript projects with excellent support for modern JavaScript features. By following the patterns and configurations outlined in this document, you can create optimized builds for Node.js 18+ with proper ESM support, type declarations, and executable scripts.

Remember to:
1. Use `format: 'esm'` for pure ESM packages
2. Set `target: 'node18'` for Node.js 18+ compatibility
3. Enable `dts: true` for type declarations
4. Use banner for executable scripts
5. Configure `external` for built-in modules
6. Test your builds thoroughly across different environments