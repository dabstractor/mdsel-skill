# TypeScript/tsup Build Errors and Debugging Patterns

## Research Summary

This document covers common build errors and debugging patterns for TypeScript/tsup projects, with specific focus on the issues you've encountered in the mdsel-claude-attempt-3 project.

---

## 1. "Cannot bundle Node.js built-in module" Error

### Why This Happens

The "Cannot bundle Node.js built-in module" error occurs when tsup attempts to bundle Node.js core modules that should be available at runtime, such as `path`, `fs`, `crypto`, `buffer`, etc.

### Root Causes

1. **Implicit imports**: Code imports Node.js builtins without explicit bundling decisions
2. **External dependency declarations**: Missing `external` configuration in tsup config
3. **Plugin limitations**: Some tsup plugins may not handle Node.js builtins correctly
4. **Transitive dependencies**: Dependencies that import Node.js builtins

### Solutions

#### Configuration Fix (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  external: [
    // Explicitly exclude Node.js builtins
    'path',
    'fs',
    'crypto',
    'buffer',
    'stream',
    'util',
    'os',
    'url',
    'querystring',
    'zlib',
    'child_process',
    'events',
    'timers',
    'perf_hooks',
    'async_hooks',
    'v8',
    'vm',
    'worker_threads',
    'inspector',
    'module',
    'process',
    'punycode',
    'string_decoder',
    'sys',
    'constants',
    'domain',
    'http',
    'https',
    'http2',
    'net',
    'dgram',
    'tls',
    'dns',
    'repl',
    'readline',
    'tty',
    '_stream_duplex',
    '_stream_passthrough',
    '_stream_readable',
    '_stream_transform',
    '_stream_writable',
  ],
});
```

#### Alternative: Use `skipNodeModulesBundle`

```typescript
export default defineConfig({
  // ... other options
  skipNodeModulesBundle: true,
  treeshake: true,
});
```

### Debugging Commands

```bash
# Check which modules are causing the issue
grep -r "require\|import.*fs\|import.*path" src/

# Check bundled size
npm run build && npx analyze-bundle dist/index.js

# Debug specific imports
node -e "console.log(require.resolve('path')); console.log(require.resolve('fs'))"
```

---

## 2. Import Resolution Errors - "Cannot find module" with ES Modules

### Why This Happens

ESM import resolution works differently than CommonJS, leading to resolution issues with TypeScript/tsup.

### Root Causes

1. **File extension confusion**: `.js` vs `.mjs` vs `.ts`
2. **Missing type declarations**: `@types/` not properly installed
3. **Path mapping issues**: Incorrect `baseUrl` or `paths` in tsconfig
4. **Module resolution configuration**: Wrong `module` or `moduleResolution` settings

### Solutions

#### Fix tsconfig.json

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "target": "ES2022",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node"]
  }
}
```

#### Fix Package.json (ESM)

```json
{
  "type": "module",
  "module": "ESNext",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Debugging Commands

```bash
# Check module resolution
npx ts-node --project tsconfig.json -e "import('path').then(console.log)"

# Check what files are being resolved
npx es-module-lexer ./src/index.ts

# Check if types are properly installed
npx tsc --noEmit --traceResolution

# Verify package.json configuration
cat package.json | grep -A 10 '"type"'
```

---

## 3. Type Errors with @modelcontextprotocol/sdk

### Common Issues

1. **Missing type definitions**: SDK not properly installed
2. **Version conflicts**: Incompatible SDK versions
3. **Import syntax**: Incorrect import patterns for SDK

### Solutions

#### Correct Installation

```bash
npm install @modelcontextprotocol/sdk
npm install --save-dev @types/node
```

#### Import Patterns

```typescript
// Correct imports for MCP SDK
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/transport/stdio/index.js";

// Alternative named imports
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
```

#### Type Declaration Files

Create `src/types/mcp.d.ts` if needed:

```typescript
declare module "@modelcontextprotocol/sdk" {
  export interface Server {
    // Custom server implementations
  }

  export namespace Transport {
    export interface StdioServerTransport {
      // Custom transport implementations
    }
  }
}
```

### Debugging Commands

```bash
# Check SDK installation
npm ls @modelcontextprotocol/sdk

# Verify types are working
npx tsc --noEmit --strict

# Check SDK version compatibility
npm view @modelcontextprotocol/sdk versions --json

# Debug import issues
node -e "try { require('@modelcontextprotocol/sdk/server'); console.log('OK') } catch(e) { console.error(e) }"
```

---

## 4. Shebang Not Working - tsup Banner Issues

### Why This Happens

tsup banner may not add executable shebang due to:

1. **Platform differences**: Line ending issues (CRLF vs LF)
2. **File permissions**: Missing execute permissions
3. **Bundle splitting**: Shebang lost in split chunks
4. **ESM restrictions**: Shebang doesn't work with .mjs files

### Solutions

#### Use post-build script

```json
{
  "scripts": {
    "build": "tsup && echo '#!/usr/bin/env node' | cat - dist/index.js > dist/cli && chmod +x dist/cli && rm dist/index.js"
  }
}
```

#### tsup Config with Banner

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  outDir: 'dist',
  dts: true,
});
```

### Debugging Commands

```bash
# Check file permissions
ls -la dist/

# Check shebang is present
head -1 dist/index.js | cat -A

# Test execution directly
node dist/index.js

# Test as executable
./dist/index.js

# Check for hidden carriage returns
file dist/index.js
```

---

## 5. .mjs Files Not Executing - Node.js ESM Issues

### Why This Happens

Node.js ESM execution has several quirks:

1. **Package.json configuration**: Missing `"type": "module"`
2. **Import resolution**: Incorrect file extensions
3. **Shebang limitations**: Shebang doesn't work with .mjs
4. **CommonJS interop**: Issues with `require()` in ESM

### Solutions

#### Package.json Configuration

```json
{
  "type": "module",
  "name": "your-package",
  "version": "1.0.0",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

#### Mixed Mode Support

```typescript
// src/index.ts
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For CommonJS compatibility
export const __filename_cjs = __filename;
export const __dirname_cjs = __dirname;
```

### Debugging Commands

```bash
# Check Node.js version and ESM support
node -p "process.version"

# Test ESM execution
node --experimental-modules dist/index.mjs

# Check package.json type
cat package.json | grep -A 2 '"type"'

# Debug import errors
NODE_OPTIONS="--loader ts-node/esm" node dist/index.js
```

---

## 6. npm Script Failures - Debugging Build/Test/Start Issues

### Common Issues

1. **Path resolution**: Scripts can't find files
2. **Environment variables**: Missing env vars
3. **Concurrency**: Race conditions in build steps
4. **Exit codes**: Non-zero exits not properly handled

### Solutions

#### Enhanced package.json Scripts

```json
{
  "scripts": {
    "build": "tsup",
    "build:debug": "echo 'Building with debug info...' && tsup --verbose",
    "build:watch": "tsup --watch",
    "dev": "npm run build:watch",
    "start": "node dist/index.js",
    "start:debug": "node --inspect-brk dist/index.js",
    "test": "echo 'No tests configured'",
    "test:watch": "echo 'Watching tests...'",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "type-check": "tsc --noEmit"
  }
}
```

#### Debug Helper Scripts

Create `scripts/debug-build.js`:

```javascript
#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');

function debugBuild() {
  console.log('=== Build Debug Information ===');

  // Check tsup config
  if (fs.existsSync('tsup.config.ts')) {
    console.log('✓ tsup.config.ts exists');
  } else {
    console.log('✗ tsup.config.ts missing');
  }

  // Check dependencies
  const pkg = require('../package.json');
  console.log('\n=== Package Dependencies ===');
  console.log('tsup:', pkg.devDependencies?.tsup);
  console.log('typescript:', pkg.devDependencies?.typescript);
  console.log('@modelcontextprotocol/sdk:', pkg.dependencies?.['@modelcontextprotocol/sdk']);

  // Run build with debug info
  console.log('\n=== Running Build with Debug Info ===');
  const build = spawn('npx', ['tsup', '--verbose'], { stdio: 'inherit' });

  build.on('close', (code) => {
    console.log(`Build process exited with code: ${code}`);

    // Check output files
    console.log('\n=== Checking Output Files ===');
    const files = ['dist/index.js', 'dist/index.d.ts'];
    files.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✓ ${file} (${fs.statSync(file).size} bytes)`);
      } else {
        console.log(`✗ ${file} missing`);
      }
    });
  });
}

debugBuild();
```

### Debugging Commands

```bash
# Debug build step-by-step
echo "=== Step 1: Check tsup config ==="
cat tsup.config.ts

echo -e "\n=== Step 2: Check dependencies ==="
npm ls tsup typescript @modelcontextprotocol/sdk

echo -e "\n=== Step 3: Clean build ==="
rm -rf dist && npm run build

echo -e "\n=== Step 4: Check output ==="
ls -la dist/

echo -e "\n=== Step 5: Test execution ==="
node dist/index.js --help

echo -e "\n=== Step 6: Check environment ==="
echo "NODE_ENV: $NODE_ENV"
echo "Platform: $(uname -a)"
```

---

## General Debugging Strategy

1. **Isolate the issue**: Try to reproduce the error in a minimal case
2. **Check logs**: Look at tsup's verbose output with `--verbose`
3. **Verify dependencies**: Ensure all packages are installed correctly
4. **Test step-by-step**: Build individual files first
5. **Check Node.js version**: Compatibility issues can cause weird errors
6. **Use debugging tools**: Node.js inspector, ts-node, etc.

## Recommended Development Setup

```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "dev": "npm run build:watch",
    "start": "node dist/index.js",
    "start:debug": "node --inspect-brk dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "echo 'No tests configured'",
    "debug": "node scripts/debug-build.js"
  }
}
```

## Troubleshooting Checklist

- [ ] Check `package.json` configuration (type, main, module)
- [ ] Verify tsup config exists and is correct
- [ ] Confirm all dependencies are installed
- [ ] Check file permissions
- [ ] Verify Node.js version compatibility
- [ ] Test with minimal case
- [ ] Check for hidden characters or encoding issues
- [ ] Look at tsup verbose output
- [ ] Try running commands one by one
- [ ] Check environment variables

This research provides comprehensive coverage of common TypeScript/tsup build errors with practical solutions and debugging commands.