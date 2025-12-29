name: "P1.M2.T1: Implement MCP Server Initialization"
description: |

---

## Goal

**Feature Goal**: Initialize a functional MCP server instance using the Model Context Protocol SDK that communicates via stdio transport and is ready to accept tool registrations.

**Deliverable**: A complete `src/index.ts` file containing:
- Configured `Server` instance from `@modelcontextprotocol/sdk`
- `StdioServerTransport` connection for stdio-based communication
- Proper error handling and graceful shutdown
- Exported server instance for tool registration by P1.M3 tasks

**Success Definition**:
- Server starts without errors when executed
- Server responds to MCP protocol initialization messages
- Server is ready to accept tool registrations (no tools yet, but infrastructure exists)
- Transport successfully connects and listens on stdin/stdout
- Process handles SIGTERM/SIGINT for clean shutdown

## User Persona

**Target User**: Claude Code agents and users who will consume this MCP server to access mdsel functionality.

**Use Case**: Claude Code invokes this MCP server via stdio transport to discover and use mdsel_index and mdsel_select tools for selector-based Markdown access.

**User Journey**:
1. User configures Claude Code with mdsel-claude MCP server in ~/.claude.json
2. Claude Code spawns the mdsel-claude process: `npx mdsel-claude`
3. MCP server initializes and connects via stdio transport
4. Server sends initialization message with server metadata
5. Claude Code sends list_tools request to discover available tools
6. Server responds with tool list (empty initially, will be populated in P1.M3)

**Pain Points Addressed**:
- Provides clean initialization pattern for MCP server
- Establishes proper stdio transport for local subprocess communication
- Sets up graceful shutdown to prevent zombie processes
- Creates exportable server instance for modular tool registration

## Why

- **Foundation for P1.M3**: Tool handlers (P1.M3.T1, P1.M3.T2) require a configured server instance to register against
- **MCP Protocol Compliance**: Proper initialization ensures Claude Code can discover and interact with the server
- **Process Management**: Graceful shutdown prevents resource leaks and ensures clean Claude Code integration
- **Thin Layer Principle**: Server initialization is minimal infrastructure that delegates all actual work to mdsel CLI

## What

Implement MCP server initialization with stdio transport for local subprocess communication with Claude Code.

### Core Implementation

1. **Server Instance Creation** (P1.M2.T1.S1):
   - Import `Server` from `@modelcontextprotocol/sdk/server/index.js`
   - Create instance with `name: "mdsel-claude"` and `version: "1.0.0"`
   - Export server for tool registration in P1.M3

2. **Transport Connection** (P1.M2.T1.S2):
   - Import `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`
   - Create transport instance
   - Connect server to transport in async `main()` function
   - Handle process signals (SIGTERM, SIGINT) for graceful shutdown

3. **Error Handling**:
   - Catch and log initialization errors
   - Ensure transport closes properly on shutdown

### Success Criteria

- [ ] `src/index.ts` imports Server and StdioServerTransport from correct SDK paths with .js extensions
- [ ] Server instance is created with name "mdsel-claude" and version "1.0.0"
- [ ] Server instance is exported for use by tool registration modules
- [ ] StdioServerTransport is created in async main() function
- [ ] Server connects to transport via `await server.connect(transport)`
- [ ] main() is invoked at module level with `.catch(console.error)`
- [ ] Process signal handlers (SIGTERM, SIGINT) close transport gracefully
- [ ] File compiles with `npm run build` without errors
- [ ] Built output includes shebang for npx execution

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Exact import paths with .js extensions (ESM requirement)
- Server configuration with specific name/version
- Complete main() function pattern with signal handling
- Integration points with existing src/index.ts scaffolding
- Build command validation
- Testing approach for server initialization

### Documentation & References

```yaml
# MUST READ - MCP SDK Server Initialization

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP SDK repository with server initialization patterns and examples
  critical: Server constructor requires name/version object, StdioServerTransport for local communication

- url: https://www.npmjs.com/package/@modelcontextprotocol/sdk
  why: Package documentation with API reference for Server and transport classes
  critical: Import paths must include .js extensions for ESM compatibility

- file: src/index.ts
  why: Current scaffolding from P1.M1.T1.S6 that needs enhancement
  pattern: Existing Server and StdioServerTransport import structure, placeholder main() function
  gotcha: DO NOT remove existing structure - ENHANCE it by adding proper transport connection and signal handling

- docfile: plan/architecture/external_deps.md
  why: MCP SDK dependency specifications and server pattern reference
  section: Lines 149-176 show complete server pattern with imports and connection

- docfile: plan/architecture/implementation_patterns.md
  why: Overall code organization and build configuration context
  section: Lines 262-278 show tsup configuration with shebang banner

- docfile: plan/P1M1T1/research/mcp-node-setup.md
  why: Complete MCP Node.js setup research with server initialization examples
  section: Lines 22-98 show basic server structure with stdio transport

- file: tsup.config.ts
  why: Build configuration that adds shebang banner for npx execution
  pattern: banner.js: '#!/usr/bin/env node\n' makes dist/index.js executable

- file: vitest.config.ts
  why: Test configuration for validation approach
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - tests must match this pattern

- file: package.json
  why: Project metadata including bin entry and ESM type configuration
  gotcha: "type": "module" requires ALL imports to use .js extensions
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (generated by tsup)
│   ├── index.d.ts                 # TypeScript declarations
│   ├── index.js                   # Compiled JavaScript (with shebang)
│   └── index.js.map              # Source maps
├── src/
│   └── index.ts                  # MCP server entry point (TO BE ENHANCED)
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md      # MCP SDK patterns
│   │   ├── implementation_patterns.md  # Code organization patterns
│   │   └── system_context.md     # System architecture
│   └── P1M1T1/
│       └── research/
│           └── mcp-node-setup.md # MCP server setup research
├── package.json                  # Project configuration
├── tsconfig.json                # TypeScript configuration
├── tsup.config.ts               # Build configuration (shebang banner)
├── vitest.config.ts             # Test configuration
├── tasks.json                   # Task breakdown with P1.M2.T1 subtasks
└── PRD.md                       # Product requirements
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (unchanged)
│   ├── index.d.ts
│   ├── index.js                   # Will contain complete server initialization
│   └── index.js.map
├── src/
│   ├── index.ts                  # ENHANCED: Complete MCP server with transport connection
│   ├── index.test.ts             # NEW: Server initialization tests (P1.M3.T3.S2 will add)
│   ├── executor.ts               # FUTURE: P1.M2.T2 will add
│   └── tools/                    # FUTURE: P1.M3 will add
│       ├── index.ts              # mdsel_index tool
│       ├── select.ts             # mdsel_select tool
│       ├── index.test.ts
│       └── select.test.ts
├── plan/
│   ├── P1M2T1/
│   │   └── PRP.md                # THIS DOCUMENT
│   └── ...
└── ...
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// ALL imports MUST include .js file extensions (not .ts)
// The compiler transforms .js extensions to .ts at build time
// WRONG: import { Server } from '@modelcontextprotocol/sdk/server/index'
// CORRECT: import { Server } from '@modelcontextprotocol/sdk/server/index.js'

// CRITICAL: MCP SDK Import Paths
// The SDK exports from specific subdirectories, not root
// Import Server from @modelcontextprotocol/sdk/server/index.js
// Import StdioServerTransport from @modelcontextprotocol/sdk/server/stdio.js
// WRONG: import { Server } from '@modelcontextprotocol/sdk'
// CORRECT: import { Server } from '@modelcontextprotocol/sdk/server/index.js'

// CRITICAL: Server Export Pattern
// Server instance MUST be exported for tool registration in P1.M3
// Tools are registered by calling server.setRequestHandler() before transport connection
// Tools CANNOT be registered after server.connect() is called
// Pattern: Export server, register tools in separate modules, then connect

// CRITICAL: Stdio Transport Lifecycle
// StdioServerTransport reads from process.stdin and writes to process.stdout
// Once connected, the server blocks until connection is closed
// Signal handlers (SIGTERM, SIGINT) must close transport gracefully
// Without signal handlers, killing the process leaves zombie connections

// CRITICAL: Shebang Banner
// tsup.config.ts adds '#!/usr/bin/env node' as banner.js
// This makes dist/index.js executable directly by npx
// DO NOT add shebang manually in src/index.ts - tsup handles it

// CRITICAL: TypeScript Compilation
// Test files use *.test.ts extension and are excluded from tsconfig.json
// To test server initialization, create src/index.test.ts (will be added in P1.M3.T3.S2)
// For now, validate server by building and running the process

// CRITICAL: Process Signal Handling
// Node.js processes need explicit SIGTERM/SIGINT handlers for graceful shutdown
// Claude Code may send these signals when shutting down
// Always close transport before exiting to prevent stdout buffer corruption
```

## Implementation Blueprint

### Data Models and Structure

No new data models required for this task. The focus is on infrastructure setup using existing SDK types.

```typescript
// SDK Types (imported from @modelcontextprotocol/sdk)
// - Server: Main server class with connect() method
// - StdioServerTransport: stdio-based transport implementation
// No custom types needed - using SDK defaults
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: ENHANCE src/index.ts - Import MCP SDK Components
  - PRESERVE: Existing imports and structure from P1.M1.T1.S6
  - VERIFY: Import paths use .js extensions (ESM requirement)
  - IMPORT: Server from '@modelcontextprotocol/sdk/server/index.js'
  - IMPORT: StdioServerTransport from '@modelcontextprotocol/sdk/server/stdio.js'
  - NAMING: Use exact import names as shown
  - PLACEMENT: Top of src/index.ts, after existing imports
  - GOTCHA: Do NOT change existing imports - only verify .js extensions

Task 2: CREATE Server Instance with Metadata
  - PRESERVE: Existing Server creation code (lines 5-8)
  - VERIFY: Server constructor uses exact name: "mdsel-claude" and version: "1.0.0"
  - EXPORT: Add 'export const server = new Server({...})' before or replacing existing 'const server'
  - FOLLOW: Pattern in plan/architecture/external_deps.md lines 165-169
  - NAMING: Variable must be named 'server' (lowercase) for consistency with P1.M3 tasks
  - CRITICAL: Server MUST be exported for tool registration in P1.M3.T1.S2 and P1.M3.T2.S2
  - PLACEMENT: After imports, before main() function

Task 3: ENHANCE main() Function - Connect Transport
  - PRESERVE: Existing async main() function structure (lines 13-16)
  - IMPLEMENT: Create StdioServerTransport instance: 'const transport = new StdioServerTransport()'
  - IMPLEMENT: Connect server to transport: 'await server.connect(transport)'
  - ADD: Console log for successful startup (optional, for debugging)
  - FOLLOW: Pattern in plan/P1M1T1/research/mcp-node-setup.md lines 92-96
  - GOTCHA: server.connect() is async - must await
  - PLACEMENT: Inside existing main() function

Task 4: ADD Process Signal Handlers for Graceful Shutdown
  - IMPLEMENT: SIGTERM handler that calls 'await transport.close()'
  - IMPLEMENT: SIGINT handler that calls 'await transport.close()'
  - IMPLEMENT: Define cleanup function that both handlers call
  - FOLLOW: Standard Node.js signal handling pattern
  - GOTCHA: transport.close() is async - must await
  - GOTCHA: Signal handlers should be registered AFTER transport creation
  - PLACEMENT: After transport connection in main()

Task 5: VERIFY Module-Level main() Invocation
  - PRESERVE: Existing 'main().catch(console.error)' at end of file
  - VERIFY: main() is called at module level (not wrapped in any condition)
  - GOTCHA: This starts the server immediately when file is executed
  - PLACEMENT: Bottom of src/index.ts

Task 6: BUILD and Validate
  - RUN: 'npm run build' to compile TypeScript and generate dist/index.js
  - VERIFY: No TypeScript compilation errors
  - VERIFY: dist/index.js exists and includes shebang (#!/usr/bin/env node)
  - VERIFY: dist/index.js is executable (ls -l dist/index.js shows x permissions)
  - RUN: 'node dist/index.js' to test server starts (will block waiting for stdin)
  - TERMINATE: Use Ctrl+C to test graceful shutdown
  - EXPECTED: Server starts, blocks on stdin, exits cleanly on SIGINT

Task 7: MANUAL Test with MCP Inspector (Optional but Recommended)
  - INSTALL: 'npm install -g @modelcontextprotocol/inspector'
  - RUN: 'npx @modelcontextprotocol/inspector node dist/index.js'
  - VERIFY: Inspector shows server name "mdsel-claude" and version "1.0.0"
  - VERIFY: No tools listed yet (expected - tools will be added in P1.M3)
  - TERMINATE: Ctrl+C when done
  - NOTE: This validates MCP protocol compliance before adding tools
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// SERVER INSTANCE CREATION PATTERN (Task 2)
// ============================================================

// BEFORE (existing from P1.M1.T1.S6):
// const server = new Server({
//   name: "mdsel-claude",
//   version: "1.0.0"
// });

// AFTER (enhanced with export):
export const server = new Server({
  name: "mdsel-claude",
  version: "1.0.0"
});

// CRITICAL: 'export' keyword makes server available to tool registration modules
// CRITICAL: Exact name "mdsel-claude" matches package.json and PRD requirements
// CRITICAL: Version "1.0.0" matches initial release

// ============================================================
// TRANSPORT CONNECTION PATTERN (Task 3)
// ============================================================

async function main(): Promise<void> {
  // Create stdio transport for local subprocess communication
  const transport = new StdioServerTransport();

  // Connect server to transport - THIS BLOCKS until connection closed
  await server.connect(transport);

  // OPTIONAL: Log for debugging (remove in production if desired)
  console.error('mdsel-claude MCP server running on stdio'); // Use stderr to not interfere with stdout
}

// GOTCHA: StdioServerTransport() takes no arguments in basic usage
// GOTCHA: server.connect() blocks - code after it won't execute until connection closes
// GOTCHA: Use console.error() for logs (stdout is reserved for MCP protocol)

// ============================================================
// SIGNAL HANDLING PATTERN (Task 4)
// ============================================================

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Define cleanup handler
  const cleanup = async (): Promise<void> => {
    await transport.close();
    process.exit(0);
  };

  // Register signal handlers
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// ALTERNATIVE (more explicit):
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    await transport.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await transport.close();
    process.exit(0);
  });
}

// GOTCHA: transport.close() is async - must await
// GOTCHA: process.exit(0) ensures clean termination
// GOTCHA: Register handlers AFTER connect() so transport exists

// ============================================================
// MODULE INVOCATION PATTERN (Task 5)
// ============================================================

// At bottom of src/index.ts:
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

// GOTCHA: main() must be called at module level (not in a condition)
// GOTCHA: Catch block logs errors and exits with code 1
// GOTCHA: Use console.error() to avoid stdout pollution
```

### Integration Points

```yaml
PACKAGE.JSON:
  - verified: "type": "module" enables ESM
  - verified: "bin": {"mdsel-claude": "./dist/index.js"} for npx execution
  - verified: "engines": {"node": ">=18.0.0"} for mdsel compatibility
  - no changes needed for this task

TSCONFIG.JSON:
  - verified: "module": "NodeNext" for ESM with .js extensions
  - verified: "moduleResolution": "NodeNext" for modern Node.js
  - verified: "strict": true for type safety
  - no changes needed for this task

TSUP.CONFIG.TS:
  - verified: banner.js adds shebang for executable
  - verified: format: 'esm' for ESM output
  - verified: target: 'node18' for compatibility
  - no changes needed for this task

VITEST.CONFIG.TS:
  - verified: test.include pattern for test discovery
  - note: src/index.test.ts will be added in P1.M3.T3.S2, not this task
  - no changes needed for this task

P1.M2.T2 (NEXT TASK):
  - will create src/executor.ts for mdsel CLI spawning
  - depends on: src/index.ts server export for tool registration
  - integration: executor will be called by tool handlers in P1.M3

P1.M3 (FUTURE MILESTONE):
  - will create src/tools/index.ts and src/tools/select.ts
  - will import server from src/index.ts
  - will register tools using server.setRequestHandler()
  - integration: server export enables modular tool registration
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing implementation - fix before proceeding
npm run build

# Expected Output:
# > mdsel-claude@1.0.0 build
# > tsup
# CLI Building entry: src/index.ts
# CLI dist/index.js   2.50 KB
# CLI dist/index.d.ts 1.23 KB
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/index.js generated successfully
# - dist/index.d.ts generated successfully
# - File size reasonable (~2-3 KB for server initialization)

# Verify shebang in built output:
head -n 1 dist/index.js

# Expected Output:
# #!/usr/bin/env node

# Verify executable permissions:
ls -la dist/index.js

# Expected: Should show -rwxr-xr-x (executable bit set)

# If errors occur:
# - Check import paths include .js extensions
# - Check Server and StdioServerTransport imports are correct
# - Check no typos in variable names
# - Read TypeScript error messages carefully
```

### Level 2: Basic Runtime Validation

```bash
# Test server startup (will block waiting for stdin - this is expected)
node dist/index.js

# Expected: Process starts and blocks (no output, waiting for MCP messages on stdin)

# To exit: Press Ctrl+C

# Expected: Clean exit, no error messages

# If process exits immediately:
# - Check main() is called at module level
# - Check console.error is used for any logging (not console.log)
# - Check for syntax errors in dist/index.js

# If process hangs on Ctrl+C:
# - Check signal handlers are registered
# - Check transport.close() is awaited in handlers
# - Check process.exit(0) is called after cleanup

# Test with MCP Inspector (optional but highly recommended):
npx @modelcontextprotocol/inspector node dist/index.js

# Expected:
# - Inspector UI opens in browser or terminal
# - Server info shows: name "mdsel-claude", version "1.0.0"
# - Tools list shows: [] (empty - tools added in P1.M3)
# - No errors in inspector console

# If inspector fails to connect:
# - Verify stdio transport is created correctly
# - Verify server.connect(transport) is called
# - Check for errors in inspector console
```

### Level 3: Integration Testing (System Validation)

```bash
# Test npx execution (verifies shebang and bin configuration):
npx mdsel-claude --version 2>/dev/null || echo "Server started (no --version flag expected)"

# Note: MCP servers don't respond to --version flags
# This test verifies the executable can be spawned

# Test with Claude Code configuration (requires Claude Code installed):
# Create test config file:
cat > test-mcp-config.json << 'EOF'
{
  "mcpServers": {
    "mdsel-claude-test": {
      "command": "node",
      "args": ["/home/dustin/projects/mdsel-claude-attempt-2/dist/index.js"]
    }
  }
}
EOF

# Note: Actual Claude Code integration test requires P1.M3 (tool implementation)
# For this task, server initialization alone is validated by MCP Inspector

# Test process lifecycle:
timeout 2 node dist/index.js 2>&1 || echo "Process timed out as expected (waiting for stdin)"

# Expected: Process starts and waits (timeout kills it after 2 seconds)
# This validates that server.connect() is blocking correctly
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check ESM imports use .js extensions:
grep -n "from '@modelcontextprotocol/sdk" src/index.ts

# Expected: All imports end with .js
# Example: import { Server } from '@modelcontextprotocol/sdk/server/index.js';

# 2. Check server is exported:
grep -n "export.*server" src/index.ts

# Expected: export const server = new Server({...})

# 3. Check transport connection:
grep -n "server.connect" src/index.ts

# Expected: await server.connect(transport)

# 4. Check signal handlers:
grep -n "process.on\('SIG" src/index.ts

# Expected: At least two handlers (SIGTERM, SIGINT)

# 5. Check for console.log (should NOT be present - use console.error):
grep -n "console\.log" src/index.ts

# Expected: No results (console.log interferes with stdio transport)
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/index.js exists and includes shebang: `head -n 1 dist/index.js` shows `#!/usr/bin/env node`
- [ ] dist/index.js is executable: `ls -la dist/index.js` shows executable permissions
- [ ] All imports use .js extensions (ESM requirement verified)
- [ ] Server is exported: `export const server = new Server({...})`
- [ ] Level 2 validation passed: `node dist/index.js` starts and blocks waiting for stdin
- [ ] Ctrl+C exits cleanly (no zombie process, no error messages)
- [ ] MCP Inspector (optional) shows server name/version correctly
- [ ] No console.log calls present (only console.error for debugging)

### Feature Validation

- [ ] Server instance created with exact name "mdsel-claude" and version "1.0.0"
- [ ] Server is exported for tool registration in P1.M3
- [ ] StdioServerTransport created and connected
- [ ] Signal handlers (SIGTERM, SIGINT) close transport gracefully
- [ ] main() function is async and calls server.connect()
- [ ] main() is invoked at module level with error handling
- [ ] Code preserves existing structure from P1.M1.T1.S6
- [ ] No tool registrations present (correct - tools added in P1.M3)

### Code Quality Validation

- [ ] Follows ESM import pattern with .js extensions
- [ ] Uses SDK import paths: `@modelcontextprotocol/sdk/server/index.js` and `@modelcontextprotocol/sdk/server/stdio.js`
- [ ] Server variable named `server` (lowercase) for consistency
- [ ] Async/await used correctly for transport connection
- [ ] Signal handlers use async/await for transport.close()
- [ ] Error handling in place at module level (main().catch())
- [ ] No debug console.log calls that would interfere with stdio transport
- [ ] Code placement matches desired codebase tree structure

### Integration Readiness

- [ ] Server export is available for import by tool modules in P1.M3
- [ ] Transport connection blocks correctly (waiting for MCP messages)
- [ ] Graceful shutdown ensures clean Claude Code integration
- [ ] No dependencies on P1.M3 components (pure infrastructure task)
- [ ] Ready for P1.M2.T2 (executor implementation) to follow
- [ ] Build output compatible with npx execution (shebang present)

---

## Anti-Patterns to Avoid

- ❌ Don't import from `@modelcontextprotocol/sdk` root - must use full path with `/server/index.js`
- ❌ Don't use `.ts` extensions in imports - must use `.js` for ESM compatibility
- ❌ Don't use `console.log()` for debugging - use `console.error()` to avoid stdout pollution
- ❌ Don't forget to export the server instance - tools need to import it
- ❌ Don't use `new Server()` without exporting - tool registration won't work
- ❌ Don't call `server.connect()` synchronously - must await the async call
- ❌ Don't skip signal handlers - zombie processes will cause issues
- ❌ Don't use `process.exit()` without closing transport first - causes stdout corruption
- ❌ Don't add tools in this task - that's P1.M3's responsibility
- ❌ Don't change the server name or version - must be "mdsel-claude" and "1.0.0"
- ❌ Don't add shebang manually in src/index.ts - tsup banner.js handles it
- ❌ Don't register request handlers in this task - that happens during tool registration

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete SDK import patterns with exact paths
- Existing code structure provides clear enhancement target
- Build and test commands are specific and executable
- All gotchas documented with correct/incorrect examples
- Integration points clearly defined with downstream task dependencies
- Validation gates are deterministic and checkable

**Expected Implementation Time**: ~15-30 minutes for a developer familiar with TypeScript and MCP SDK

**Risk Factors**:
- ESM .js extension requirement (mitigated: explicit examples provided)
- Async transport connection blocking (mitigated: pattern documented)
- Signal handling (mitigated: complete code pattern provided)

**Post-Implementation**:
- Server will be ready for P1.M2.T2 (executor implementation)
- P1.M3.T1 and P1.M3.T2 will import server to register tools
- P1.M3.T3.S2 will add integration tests for complete server
