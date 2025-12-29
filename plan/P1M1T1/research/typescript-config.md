# TypeScript Configuration Research

This document provides comprehensive research on TypeScript `tsconfig.json` configuration for modern Node.js projects, focusing on strict mode, ESM module support, and best practices.

## 1. Strict Mode Settings

### Overview
TypeScript's strict mode enables a collection of compiler options that enforce stronger type checking rules, helping to catch potential errors at compile time rather than runtime.

### Official Documentation
- [TypeScript Compiler Options Documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Strict Mode in TypeScript](https://www.typescriptlang.org/docs/handbook/intro-to-typescript.html#strict-null-checks)

### Enabling Strict Mode

#### Option 1: Enable All Strict Mode
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

#### Option 2: Enable Individual Strict Options
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Strict Mode Components

| Option | Description | Why Use It |
|--------|-------------|-------------|
| `noImplicitAny` | Prevents variables from implicitly having the `any` type | Forces explicit typing, reducing runtime errors |
| `strictNullChecks` | Ensures `null` and `undefined` can only be assigned to types that accept them | Prevents null/undefined reference errors |
| `strictPropertyInitialization` | Checks that class properties are initialized in constructors | Prevents undefined property access |
| `strictFunctionTypes` | More thorough checking of function types | Catches subtle type-related function issues |
| `strictBindCallApply` | Ensures correct type checking for `.bind()`, `.call()`, and `.apply()` | Prevents incorrect method binding |
| `noImplicitThis` | Raises error when `this` is implicitly typed as `any` | Prevents context-related bugs |
| `alwaysStrict` | Ensures files are parsed in ECMAScript strict mode | Enforces modern JavaScript standards |

### Additional Strict Options for Production

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,        // Report unused locals
    "noUnusedParameters": true,     // Report unused parameters
    "noImplicitReturns": true,      // Report functions with missing return statements
    "noFallthroughCasesInSwitch": true  // Report fallthrough in switch statements
  }
}
```

## 2. ESM Module Configuration

### Overview
Modern Node.js (v12+) has excellent ESM support. TypeScript provides several options to configure ESM output and module resolution.

### Official Documentation
- [TypeScript Module Documentation](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [Module Resolution Strategies](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

### Key Configuration Settings

#### Basic ESM Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Node.js Native ESM Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Module Resolution Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `NodeNext` | Follows Node.js native ESM/CommonJS resolution | Pure Node.js projects without bundlers |
| `Node16` | Legacy Node.js 16+ resolution strategy | Older Node.js projects |
| `Bundler` | Optimized for bundler tools (Vite, webpack) | Frontend projects with bundlers |
| `Node` | Legacy Node.js resolution strategy | Legacy projects |

### Package.json Configuration

For ESM projects, ensure your `package.json` has:

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "types": "./dist/index.d.ts"
}
```

### ESM Import Patterns

```typescript
// Default imports (works with esModuleInterop)
import express from 'express';

// Named imports
import { readFileSync } from 'fs';
import { join } from 'path';

// Dynamic imports
const module = await import('./some-module.js');
```

## 3. Best Practices for Node.js 18+ Projects

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    // Target modern JavaScript
    "target": "ES2022",

    // Module system and resolution
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",

    // Type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional strict checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Module and path handling
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,

    // Output settings
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noEmitOnError": false,

    // Performance and optimization
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },

  // File inclusion/exclusion
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],

  // Type roots for better type resolution
  "typeRoots": [
    "./node_modules/@types",
    "./src/types"
  ]
}
```

### Key Best Practices

1. **Use ES2022 Target**: Leverages modern JavaScript features available in Node.js 18+
2. **Enable All Strict Options**: Catches potential errors early in development
3. **Use NodeNext Module Resolution**: Aligns with modern Node.js module behavior
4. **Generate Declaration Files**: Essential for library development and better IDE support
5. **Source Maps**: Important for debugging
6. **Incremental Builds**: Improves build performance for large projects

### Development vs Production Configs

#### `tsconfig.dev.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmitOnError": true,
    "removeComments": false
  }
}
```

#### `tsconfig.prod.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmitOnError": false,
    "removeComments": true,
    "sourceMap": false
  }
}
```

## 4. Module Resolution Settings

### Node16 vs NodeNext

#### Node16 Module Resolution
```json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "Node16"
  }
}
```

**Characteristics:**
- Aligns with Node.js v16+ behavior
- Requires file extensions for imports
- Respects package.json `"type"` field
- Supports `.mjs` and `.cjs` extensions

#### NodeNext Module Resolution
```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext"
  }
}
```

**Characteristics:**
- Latest Node.js module resolution strategy
- More strict than Node16
- Requires `package.json` `"type": "module"` for ESM
- Supports dual package imports (ESM + CommonJS)

### Package.json Requirements

For `NodeNext` resolution:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "types": "./dist/index.d.ts"
}
```

### File Extension Requirements

With Node16/NodeNext resolution, you must use file extensions:

```typescript
// Correct
import { createServer } from 'http';
import config from './config.js';
import utils from '../utils/utils.js';

// Incorrect (will cause errors)
import { createServer } from 'http';
import config from './config';
import utils from '../utils/utils';
```

## 5. Common Pitfalls to Avoid

### 1. Missing File Extensions
**Problem**: Forgetting file extensions with Node16/NodeNext resolution
```typescript
// ❌ This will fail
import { readFile } from 'fs/promises';

// ✅ Correct
import { readFile } from 'fs/promises';
import config from './config.js';
```

### 2. Incorrect Module Resolution Strategy
**Problem**: Using old `module: "commonjs"` with Node.js 18+
```json
// ❌ Outdated configuration
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  }
}

// ✅ Modern configuration
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

### 3. Forgetting esModuleInterop
**Problem**: Cannot use default imports from CommonJS modules
```typescript
// ❌ Without esModuleInterop
import express from 'express'; // Error: Module '"express"' has no default export.

// ✅ With esModuleInterop
import express from 'express'; // Works
```

### 4. Inconsistent Package.json Configuration
**Problem**: Mixed ESM/CommonJS without proper configuration
```json
// ❌ Inconsistent
{
  "type": "module",
  "main": "./dist/index.cjs" // Should be .js for ESM
}

// ✅ Consistent ESM
{
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

### 5. Missing Type Definitions
**Problem**: Poor TypeScript experience without type definitions
```json
// ❌ Missing type exports
{
  "main": "./dist/index.js"
}

// ✅ Complete type exports
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## 6. Example Project Structure

```
my-project/
├── src/
│   ├── server.ts
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── userController.ts
│   ├── services/
│   │   └── authService.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Complete `tsconfig.json` Example

```json
{
  "compilerOptions": {
    // Core settings
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",

    // Strict mode
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // ESM support
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,

    // File handling
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noEmitOnError": false,

    // Performance
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },

  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  "typeRoots": [
    "./node_modules/@types",
    "./src/types"
  ]
}
```

### Build Script for ESM

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "start": "node dist/server.js"
  }
}
```

## 7. Additional Resources

### Official TypeScript Resources
- [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [TypeScript Module Documentation](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)

### Community Resources
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Node.js ESM Guide](https://nodejs.org/api/esm.html)
- [TypeScript ESLint Rules](https://typescript-eslint.io/docs/linting/)

### Migration Guides
- [Migrating to TypeScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [ESM Migration Guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d994)
- [Node.js ESM Migration](https://nodejs.org/en/docs/guides/esm-basics/)

---

*This research document provides comprehensive guidance for configuring TypeScript in modern Node.js projects. Always refer to the official TypeScript documentation for the most current information.*