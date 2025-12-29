# PRP: P1.M1.T1 - Initialize Node.js TypeScript Project

---

## Goal

**Feature Goal**: Create a production-ready Node.js TypeScript project foundation with ESM support, strict type checking, MCP SDK integration, tsup bundling, and Vitest testing.

**Deliverable**: Six foundational configuration files and a skeletal source structure that enables one-pass implementation of the remaining mdsel-claude MCP server features.

**Success Definition**:
- `npm install` completes without errors
- `npm run build` produces ESM bundle in `dist/` with type declarations
- `npm test` executes Vitest successfully (even with no tests)
- `npx mdsel-claude` from project root executes the entry point
- `tsc --noEmit` validates type checking with zero errors

---

## All Needed Context

### Context Completeness Check

_Before proceeding, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

Yes - this PRP provides:
- Complete file specifications with exact content
- All dependency versions and rationale
- Official documentation URLs for each tool
- Expected project structure before and after
- Common gotchas specific to this stack

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCUMENTATION - Read before implementing
- file: plan/architecture/system_context.md
  why: Defines the technology stack (TypeScript, Node.js >=18.0.0, tsup, Vitest, MCP SDK, Zod)
  critical: This task establishes the foundation for ALL subsequent tasks

- file: plan/architecture/external_deps.md
  why: Defines the MCP SDK dependency pattern and mdsel peer dependency
  critical: Understanding @modelcontextprotocol/sdk structure is essential

- file: plan/architecture/implementation_patterns.md
  why: Contains the complete directory structure and file placement patterns
  critical: Shows exactly where each file belongs in the final project

- file: PRD.md
  why: Defines the project's behavioral conditioning philosophy and tool surface
  critical: The architecture must support exactly two tools (mdsel_index, mdsel_select)

# TYPESCRIPT CONFIGURATION RESEARCH
- docfile: plan/P1M1T1/research/typescript-config.md
  why: Complete tsconfig.json patterns for Node.js 18+ with ESM and strict mode
  section: "Best Practices for Node.js 18+ Projects" - contains the recommended configuration
  url: https://www.typescriptlang.org/tsconfig
  url: https://www.typescriptlang.org/docs/handbook/modules/reference.html

# TSUP BUNDLING RESEARCH
- docfile: plan/P1M1T1/research/tsup-config.md
  why: ESM bundling with shebang support for executable MCP servers
  section: "CLI Application Configuration" - MCP servers are CLI tools
  url: https://tsup.egoist.dev/
  gotcha: Use banner.js for shebang, not file-level shebang (tsup handles this)

# VITEST TESTING RESEARCH
- docfile: plan/P1M1T1/research/vitest-config.md
  why: TypeScript-native testing configuration for ESM projects
  section: "Basic vitest.config.ts" - minimal configuration for Node.js projects
  url: https://vitest.dev/config/

# MCP SDK RESEARCH
- docfile: plan/P1M1T1/research/mcp-node-setup.md
  why: MCP server initialization pattern with stdio transport
  section: "Basic Server Structure" - shows Server creation and tool registration
  url: https://github.com/modelcontextprotocol/sdk
  url: https://www.npmjs.com/package/@modelcontextprotocol/sdk
  gotcha: Imports must use .js extensions even for TypeScript files (ESM requirement)

# NPM PACKAGE.JSON REFERENCE
  url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
  why: Complete reference for all package.json fields used in this task
```

### Current Codebase Tree (Before Implementation)

```bash
mdsel-claude-attempt-2/
├── .git/
├── plan/
│   ├── architecture/
│   │   ├── system_context.md
│   │   ├── external_deps.md
│   │   └── implementation_patterns.md
│   └── P1M1T1/
│       └── research/
│           ├── typescript-config.md
│           ├── tsup-config.md
│           ├── vitest-config.md
│           └── mcp-node-setup.md
├── PRD.md
├── tasks.json
└── .gitignore (may or may not exist)
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── .git/
├── dist/                      # Created by build process
│   ├── index.js               # ESM bundle with shebang
│   └── index.d.ts             # Type declarations
├── node_modules/              # Created by npm install
├── plan/                      # Existing (unchanged)
├── src/                       # NEW: Source directory
│   ├── index.ts               # NEW: MCP server entry point
│   ├── executor.ts            # FUTURE: Child process executor (P1.M2.T2)
│   ├── tools/                 # FUTURE: Tool handlers (P1.M3)
│   │   ├── index.ts
│   │   └── select.ts
│   └── utils/                 # FUTURE: Utilities (P2.M1)
│       ├── word-count.ts
│       └── config.ts
├── hooks/                     # FUTURE: PreToolUse hooks (P2.M2)
│   └── PreToolUse.d/
│       └── mdsel-reminder.sh
├── package.json               # NEW: Project metadata and dependencies
├── tsconfig.json              # NEW: TypeScript configuration
├── tsup.config.ts             # NEW: Build configuration
├── vitest.config.ts           # NEW: Test configuration
├── .gitignore                 # NEW: Git ignore patterns
├── PRD.md                     # Existing (unchanged)
└── tasks.json                 # Existing (unchanged)
```

### File Responsibilities

| File | Responsibility |
|------|---------------|
| `package.json` | Project metadata, dependencies, scripts for build/test/start |
| `tsconfig.json` | TypeScript compiler options (strict mode, ESM, NodeNext resolution) |
| `tsup.config.ts` | ESM bundling with shebang, type declarations, sourcemaps |
| `vitest.config.ts` | Test runner configuration for TypeScript with globals |
| `.gitignore` | Excludes node_modules, dist, .DS_Store, etc. |
| `src/index.ts` | MCP server entry point (skeletal - will be expanded in P1.M2.T1) |

---

## Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: TypeScript ESM imports require .js extensions
// Even though source files are .ts, imports must use .js
// This is because TypeScript emits .js files, and ESM requires real file extensions

// CORRECT:
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { executeMdsel } from './executor.js';

// INCORRECT (will fail at runtime):
import { Server } from '@modelcontextprotocol/sdk/server/index';
import { executeMdsel } from './executor';

// CRITICAL: package.json must have "type": "module" for ESM
// Without this, Node.js will treat .js files as CommonJS

// CRITICAL: tsup banner.js adds shebang, do NOT add #!/usr/bin/env node to source
// tsup handles this via configuration: banner: { js: '#!/usr/bin/env node\n' }

// CRITICAL: Node.js 18+ is required by mdsel dependency
// Engines field must specify: "node": ">=18.0.0"

// CRITICAL: Vitest globals must be enabled in config OR explicit imports
// This PRP uses globals: true for cleaner test code

// CRITICAL: MCP SDK imports are deeply nested with .js extensions
// Follow the exact import pattern in research/mcp-node-setup.md

// CRITICAL: mdsel is a PEER DEPENDENCY, not a regular dependency
// Users must install mdsel globally or have it available in PATH

// CRITICAL: This is a GREENFIELD project on attempt-2 branch
// Do NOT reference main branch implementation - create from scratch
```

---

## Implementation Blueprint

### Data Models and Structure

No data models are created in this task. This task establishes the project infrastructure only.

Type definitions will be added in later tasks:
- `P1.M2.T2.S1`: ExecutorResult interface for CLI execution
- `P2.M1.T1.S1`: Config interface for environment variables

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE package.json
  - IMPLEMENT: Complete package.json with all required fields
  - METADATA: name="mdsel-claude", version="1.0.0", type="module"
  - ENGINES: node >=18.0.0 (required by mdsel)
  - BIN: { "mdsel-claude": "./dist/index.js" }
  - EXPORTS: { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } }
  - DEPENDENCIES:
    - @modelcontextprotocol/sdk (MCP server framework)
    - zod (runtime validation - needed for future tasks)
  - DEV_DEPENDENCIES:
    - typescript (compiler)
    - @types/node (Node.js type definitions)
    - tsup (ESM bundler)
    - vitest (test runner)
    - @vitest/coverage-v8 (coverage provider)
  - SCRIPTS:
    - build: tsup
    - test: vitest run
    - test:watch: vitest
    - dev: tsup --watch
    - prepack: npm run build
  - FOLLOW pattern: See research/mcp-node-setup.md section 4
  - GOTCHA: "type": "module" is critical for ESM
  - GOTCHA: mdsel is peerDependency, not dependency

Task 2: CREATE tsconfig.json
  - IMPLEMENT: Strict TypeScript configuration for Node.js 18+
  - TARGET: ES2022 (matches Node.js 18 capabilities)
  - MODULE: NodeNext (modern ESM support)
  - MODULE_RESOLUTION: NodeNext (matches module setting)
  - STRICT: true (enables all strict type checking)
  - ADDITIONAL_STRICT_OPTS: noUnusedLocals, noUnusedParameters, noImplicitReturns, noFallthroughCasesInSwitch
  - INTEROP: esModuleInterop, allowSyntheticDefaultImports, resolveJsonModule
  - OUTPUT: outDir="./dist", rootDir="./src", declaration=true, sourceMap=true
  - INCLUDE: ["src/**/*"]
  - EXCLUDE: ["node_modules", "dist", "**/*.test.ts"]
  - FOLLOW pattern: research/typescript-config.md "Best Practices for Node.js 18+ Projects"
  - GOTCHA: NodeNext resolution requires .js extensions in imports

Task 3: CREATE tsup.config.ts
  - IMPLEMENT: ESM bundling configuration with shebang
  - ENTRY: ['src/index.ts']
  - FORMAT: 'esm' (pure ESM output)
  - TARGET: 'node18' (matches runtime requirement)
  - PLATFORM: 'node'
  - DTS: true (generate type declarations)
  - CLEAN: true (clean dist before build)
  - SOURCEMAP: true (for debugging)
  - BANNER: { js: '#!/usr/bin/env node\n' } (shebang for CLI)
  - FOLLOW pattern: research/tsup-config.md "CLI Application Configuration"
  - GOTCHA: Use banner.js for shebang, don't add to source file
  - GOTCHA: Format is 'esm' (string), not ['esm'] (array) for single format

Task 4: CREATE vitest.config.ts
  - IMPLEMENT: Vitest configuration for TypeScript projects
  - IMPORT: defineConfig from 'vitest/config'
  - GLOBALS: true (enables describe, it, expect without imports)
  - ENVIRONMENT: 'node' (MCP server runs in Node.js)
  - INCLUDE: ['src/**/*.{test,spec}.{js,ts}']
  - EXCLUDE: ['node_modules', 'dist']
  - COVERAGE:
    - provider: 'v8'
    - reporter: ['text', 'json', 'html']
    - exclude: ['**/*.test.ts', '**/*.spec.ts']
  - FOLLOW pattern: research/vitest-config.md "Basic vitest.config.ts"
  - GOTCHA: globals: true eliminates need for test imports

Task 5: CREATE .gitignore
  - IMPLEMENT: Standard Node.js .gitignore patterns
  - PATTERNS: node_modules/, dist/, *.log, .DS_Store, .env, .env.local, coverage/
  - FOLLOW: Standard Node.js .gitignore conventions
  - REFERENCE: https://github.com/github/gitignore/blob/main/Node.gitignore

Task 6: CREATE src/index.ts
  - IMPLEMENT: Skeletal MCP server entry point
  - SHEBANG: None (tsup adds via banner)
  - IMPORTS: Server from @modelcontextprotocol/sdk/server/index.js, StdioServerTransport from @modelcontextprotocol/sdk/server/stdio.js
  - SERVER: const server = new Server({ name: "mdsel-claude", version: "1.0.0" })
  - MAIN: async function main() with server.connect(transport)
  - ERROR: main().catch(console.error) at file level
  - PLACEHOLDER: Comment "// Tools will be registered in P1.M2.T1 and P1.M3"
  - FOLLOW pattern: research/mcp-node-setup.md "Basic Server Structure"
  - GOTCHA: Imports MUST use .js extensions (ESM requirement)
```

### Implementation Patterns & Key Details

```typescript
// FILE: package.json - CRITICAL PATTERNS

// 1. ESM type declaration is non-negotiable
{
  "type": "module"  // MUST be present
}

// 2. MCP SDK provides the server framework
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",  // Latest stable
    "zod": "^3.24.0"  // Runtime validation for P1.M3
  }
}

// 3. mdsel is PEER dependency - users install it
{
  "peerDependencies": {
    "mdsel": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "mdsel": {
      "optional": false
    }
  }
}

// FILE: tsconfig.json - CRITICAL PATTERNS

// 1. NodeNext is the modern choice for Node.js 18+
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}

// 2. Strict mode catches errors at compile time
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// FILE: tsup.config.ts - CRITICAL PATTERNS

// 1. Shebang via banner, NOT in source
export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node\n'
  }
});

// FILE: vitest.config.ts - CRITICAL PATTERNS

// 1. Globals eliminates import boilerplate
export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
});

// FILE: src/index.ts - CRITICAL PATTERNS

// 1. ESM imports require .js extensions
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 2. Server initialization follows MCP SDK pattern
const server = new Server({
  name: "mdsel-claude",
  version: "1.0.0"
});

// 3. Async main with error handling
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Integration Points

```yaml
PACKAGE_JSON:
  - engines: "node": ">=18.0.0" (mdsel requirement)
  - bin: "mdsel-claude": "./dist/index.js" (CLI executable)
  - exports: ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }

TSCONFIG_JSON:
  - extends: None (standalone configuration)
  - references: None (single project, no project references yet)

TSUP_CONFIG_TS:
  - entry: src/index.ts (single entry point)
  - output: dist/ directory with index.js and index.d.ts

VITEST_CONFIG_TS:
  - root: process.cwd()
  - configFiles: vitest.config.ts

FUTURE_INTEGRATIONS (not in this task):
  - P1.M2.T1: Add tool registration to src/index.ts
  - P1.M2.T2: Create src/executor.ts
  - P1.M3: Create src/tools/index.ts and src/tools/select.ts
  - P2.M1: Create src/utils/config.ts and src/utils/word-count.ts
  - P2.M2: Create hooks/PreToolUse.d/mdsel-reminder.sh
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after creating package.json - verify JSON is valid
cat package.json | node -e "JSON.parse(require('fs').readFileSync(0, 'utf-8'))"
# Expected: No output (successful parse)

# Run after creating tsconfig.json - verify TypeScript accepts config
npx tsc --showConfig
# Expected: JSON output of parsed configuration

# Run after creating all config files - TypeScript type checking
npx tsc --noEmit
# Expected: Zero errors (may have "File 'src/index.ts' not found" before creating it)

# After creating src/index.ts, verify compilation
npx tsc --noEmit
# Expected: Zero errors

# Project-wide validation after all files created
npx tsc --noEmit
# Expected: Zero errors

# Run tsup build
npm run build
# Expected: Creates dist/index.js and dist/index.d.ts with shebang

# Verify shebang in output
head -n1 dist/index.js
# Expected: #!/usr/bin/env node
```

### Level 2: Unit Tests (Component Validation)

```bash
# Even with no tests, verify Vitest can run
npm test
# Expected: "No test files found" or similar (not an error)

# Run tests in watch mode (verify config works)
npm run test:watch
# Expected: Vitest starts in watch mode, press Ctrl+C to exit

# Verify test file discovery
npx vitest list
# Expected: Lists test files (empty list is OK for this task)
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify package can be installed
rm -rf node_modules package-lock.json
npm install
# Expected: Clean install with zero vulnerabilities (ignore audit warnings for dependencies)

# Verify build produces correct output
npm run build
ls -la dist/
# Expected: dist/index.js and dist/index.d.ts present

# Verify built file is executable ESM
node dist/index.js --help 2>&1 | head -5
# Expected: Process starts (may error due to incomplete MCP implementation)

# Verify npx execution (from project root)
npx mdsel-claude 2>&1 | head -5
# Expected: MCP server starts listening on stdio

# Verify type declarations are generated
cat dist/index.d.ts | head -20
# Expected: TypeScript declaration file with Server export

# Verify ESM format in output
head -5 dist/index.js
# Expected: #!/usr/bin/env node followed by ESM code (import statements)

# Verify engines constraint works
npm install --engine-strict=false  # Should succeed
# Expected: Normal installation
```

### Level 4: Creative & Domain-Specific Validation

```bash
# MCP Server Validation (manual - requires Claude Code setup)

# 1. Create a test MCP configuration in ~/.claude.json or .mcp.json:
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "mdsel-claude-dev": {
      "type": "stdio",
      "command": "node",
      "args": ["/home/dustin/projects/mdsel-claude-attempt-2/dist/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
EOF

# 2. Test MCP server initialization
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js
# Expected: JSON-RPC response with server capabilities

# 3. Test tools listing (should be empty in this task)
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node dist/index.js
# Expected: {"jsonrpc":"2.0","id":2,"result":{"tools":[]}}

# Environment Variable Validation
# Verify Node.js version requirement
node --version
# Expected: v18.x.x or higher

# Verify project is truly ESM
grep -c '"type": "module"' package.json
# Expected: 1 (found in package.json)

# Verify TypeScript strict mode
grep -c '"strict": true' tsconfig.json
# Expected: 1 (found in tsconfig.json)

# Verify tsup ESM output
grep -c '"format": "esm"' tsup.config.ts || grep -c "format: 'esm'" tsup.config.ts
# Expected: 1 (found in tsup.config.ts)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] `npm install` completes without errors
- [ ] `npx tsc --noEmit` produces zero type errors
- [ ] `npm run build` creates dist/index.js with shebang
- [ ] `npm test` runs Vitest successfully (no test files is OK)
- [ ] dist/index.d.ts contains type declarations
- [ ] `node dist/index.js` starts MCP server (hangs waiting for stdio input is expected)

### File Structure Validation

- [ ] package.json exists with all required fields (name, version, type, bin, exports, scripts)
- [ ] tsconfig.json exists with NodeNext module resolution and strict mode
- [ ] tsup.config.ts exists with ESM format and shebang banner
- [ ] vitest.config.ts exists with globals and node environment
- [ ] .gitignore exists with node_modules and dist patterns
- [ ] src/index.ts exists with MCP server skeleton

### Configuration Validation

- [ ] package.json has "type": "module"
- [ ] package.json has "engines": { "node": ">=18.0.0" }
- [ ] package.json has @modelcontextprotocol/sdk and zod in dependencies
- [ ] package.json has mdsel as peerDependency
- [ ] tsconfig.json has "module": "NodeNext" and "moduleResolution": "NodeNext"
- [ ] tsconfig.json has "strict": true
- [ ] tsup.config.ts has format: 'esm' and banner with shebang
- [ ] vitest.config.ts has globals: true and environment: 'node'

### Code Quality Validation

- [ ] src/index.ts imports use .js extensions (ESM requirement)
- [ ] src/index.ts has Server and StdioServerTransport imported from MCP SDK
- [ ] src/index.ts has main() function with async/await
- [ ] src/index.ts has main().catch(console.error) error handling
- [ ] No CommonJS patterns (require, module.exports) in any file
- [ ] All imports in src/index.ts are from @modelcontextprotocol/sdk

### Dependency Validation

- [ ] @modelcontextprotocol/sdk >= 1.0.0 in dependencies
- [ ] zod >= 3.0.0 in dependencies
- [ ] typescript in devDependencies
- [ ] @types/node in devDependencies
- [ ] tsup in devDependencies
- [ ] vitest in devDependencies
- [ ] @vitest/coverage-v8 in devDependencies
- [ ] mdsel in peerDependencies (not dependencies)

### Build Output Validation

- [ ] dist/index.js exists and is executable
- [ ] dist/index.js starts with #!/usr/bin/env node
- [ ] dist/index.js contains ESM import statements
- [ ] dist/index.d.ts exists with TypeScript declarations
- [ ] dist/index.js can be executed with node

---

## Anti-Patterns to Avoid

- ❌ Don't add shebang (`#!/usr/bin/env node`) to src/index.ts - tsup banner handles this
- ❌ Don't use CommonJS imports (`require`, `module.exports`) - this is an ESM project
- ❌ Don't omit .js extensions from imports in src/index.ts - ESM requires real file extensions
- ❌ Don't add mdsel as a regular dependency - it's a peer dependency
- ❌ Don't use "module": "commonjs" or "moduleResolution": "node" - use NodeNext
- ❌ Don't skip strict mode in tsconfig.json - all code must be strictly typed
- ❌ Don't use format: ['cjs', 'esm'] in tsup - this is a pure ESM project
- ❌ Don't add test files yet - this task only establishes infrastructure
- ❌ Don't register tools in src/index.ts - that's P1.M2.T1 and P1.M3
- ❌ Don't create executor.ts yet - that's P1.M2.T2
- ❌ Don't use `import.meta.url` relative paths in tsup.config.ts - use standard paths
- ❌ Don't forget to add "type": "module" to package.json - critical for ESM

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Rationale**:
- All configuration files are fully specified with exact content
- Official documentation URLs provided for each tool
- Common gotchas explicitly listed
- Validation commands are specific and executable
- File structure is clearly defined before and after
- Research documents provide deep context for each technology
- PRD and architecture docs provide overall project context

**Next Tasks After This PRP**:
- P1.M2.T1: Implement MCP Server Initialization (add tool registration to src/index.ts)
- P1.M2.T2: Implement CLI Executor (create src/executor.ts with executeMdsel)
- P1.M3.T1: Implement mdsel_index Tool (create src/tools/index.ts)
- P1.M3.T2: Implement mdsel_select Tool (create src/tools/select.ts)
