# TypeScript ES Modules Best Practices for Node.js 18+ (2025)

## Overview

This document outlines the current best practices for setting up a TypeScript project with ES modules ("type": "module") for Node.js 18+, based on the latest standards and community recommendations as of 2025.

## 1. package.json Configuration

### Basic ES Module Setup

```json
{
  "name": "your-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.js",
      "types": "./dist/utils.d.ts"
    }
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  }
}
```

### Enhanced Package.json with Conditional Exports

```json
{
  "name": "your-package",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": {
        "node": "./dist/index.js",
        "default": "./dist/index.esm.js"
      },
      "require": "./dist/index.cjs"
    }
  },
  "imports": {
    "#dep": {
      "node": "dep/nodejs",
      "default": "dep/browser"
    }
  }
}
```

### Key package.json Settings

1. **`"type": "module"`** - Enables ES module mode for all `.js` files
2. **`"exports"` field** - Provides controlled package entry points
3. **`"types"` field** - Specifies location of TypeScript declaration files
4. **`"engines"`** - Specifies minimum Node.js version
5. **Use `.js` extension** in exports even for TypeScript projects

## 2. tsconfig.json Compiler Options

### Recommended Configuration for Node.js 18+

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
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "moduleDetection": "force"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### tsconfig for Mixed Environments

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "rootDir": "./src",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Key tsconfig Settings

1. **`"module": "NodeNext"`** - Uses Node.js's ES module resolution
2. **`"moduleResolution": "NodeNext"`** - Enables Node.js-style module resolution
3. **`"target": "ES2022"`** - Targets modern Node.js features
4. **`"moduleDetection": "force"`** - Ensures strict ES module mode
5. **`"esModuleInterop": true`** - Better CommonJS/ESM interop
6. **`"composite": true`** - Enables project references

## 3. Best Practices for package.json exports Field

### 1. Always Use the `exports` Field
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  }
}
```

### 2. Specify Entry Points Clearly
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. Use Conditional Exports for Multi-Environment Support
```json
{
  "exports": {
    ".": {
      "node": {
        "import": "./dist/node.js",
        "types": "./dist/node.d.ts"
      },
      "browser": {
        "import": "./dist/browser.js",
        "types": "./dist/browser.d.ts"
      }
    }
  }
}
```

### 4. Maintain Backward Compatibility
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "browser": "./dist/browser.js"
}
```

## 4. Common Gotchas and Pitfalls

### 1. Missing .js Extensions in Imports
```typescript
// ❌ Wrong - Missing extension
import { utils } from './utils';

// ✅ Correct - With .js extension
import { utils } from './utils.js';
```

### 2. __dirname and __filename Issues
```typescript
// ❌ Not available in ES modules
console.log(__dirname, __filename);

// ✅ Use import.meta.url
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 3. CommonJS require() Usage
```typescript
// ❌ Mixing require() with ES modules
const fs = require('fs');

// ✅ Use ES modules
import fs from 'fs';
```

### 4. Dynamic Import Syntax
```typescript
// ✅ Correct dynamic import
const module = await import('./utils.js');
```

### 5. Package.json Import Field
```json
{
  "imports": {
    "#dep": {
      "node": "dep-nodejs",
      "browser": "dep-browser"
    }
  }
}
```

### 6. TypeScript Declaration Files
Ensure your tsconfig generates proper declaration files:
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false
  }
}
```

## 5. Directory Structure Example

```
your-project/
├── src/
│   ├── index.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── validate.ts
│   └── config/
│       └── database.ts
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   ├── utils/
│   │   ├── format.js
│   │   ├── format.d.ts
│   │   ├── validate.js
│   │   └── validate.d.ts
│   └── config/
│       ├── database.js
│       └── database.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 6. Testing Configuration

### package.json Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc -w",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write src"
  }
}
```

### vitest.config.ts (for testing)
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
```

## 7. Build Optimization

### Use TypeScript Project References
```json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/cli" }
  ]
}
```

### Enable Incremental Builds
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

## 8. Migration from CommonJS

### Step-by-Step Migration Guide

1. **Add `"type": "module"` to package.json**
2. **Update imports to use `.js` extensions**
3. **Change `require()` to `import`**
4. **Replace `__dirname` and `__filename`**
5. **Update build scripts to use `.js` output**
6. **Test thoroughly in ES module environment**

### Migration Tool
```bash
npx commonjs-to-esm src/
```

## 9. Performance Considerations

### 1. Use ESM-specific tools
```json
{
  "devDependencies": {
    "tsx": "^4.6.0",
    "esbuild": "^0.19.0",
    "rollup": "^3.29.0"
  }
}
```

### 2. Configure bundlers for ESM
```javascript
// esbuild.config.js
export default {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  platform: 'node'
};
```

## 10. Troubleshooting Common Issues

### 1. Module Resolution Errors
```
Error: Cannot find module './utils'
```
**Solution**: Add `.js` extension to import statements

### 2. TypeScript Declaration Issues
```
Error: 'export' declarations can only appear at the top level
```
**Solution**: Use proper ES module export syntax

### 3. Runtime Errors
```
Error: Cannot find module
```
**Solution**: Ensure all dependencies support ESM or have proper interop

### 4. Build Issues
```
Error: File extension ".ts" not supported
```
**Solution**: Configure tsconfig properly for ESM builds

## 11. Official Documentation Sources

- [TypeScript Module Documentation](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [package.json Exports Field](https://nodejs.org/api/packages.html#packages_exports)
- [TypeScript NodeNext Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution-strategies)
- [MDN ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 12. Recommended Tools (2025)

```json
{
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.6.0",
    "vitest": "^1.0.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "@types/node": "^20.10.0"
  }
}
```

## Summary

The key to successful TypeScript ES module setup in Node.js 18+ is:
1. Use `"type": "module"` in package.json
2. Configure `module: "NodeNext"` and `moduleResolution: "NodeNext"` in tsconfig
3. Always use `.js` extensions in import statements
4. Leverage the `exports` field for better package control
5. Test thoroughly in the target environment

This setup ensures proper ES module support, better interop, and follows current Node.js best practices for 2025.