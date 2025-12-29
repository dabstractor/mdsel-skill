name: "P1.M3.T3: Integrate Tools into MCP Server"
description: |

---

## Goal

**Feature Goal**: Verify that both `mdsel_index` and `mdsel_select` tools are properly registered with the MCP server and create comprehensive integration tests to validate end-to-end functionality.

**Deliverable**:
1. Verified tool registration in `src/index.ts` (call to `registerTools(server)`)
2. New integration test file `src/index.test.ts` that validates:
   - Server lists exactly 2 tools
   - Tool names, descriptions, and schemas match specifications
   - Both tools execute successfully end-to-end
   - Error handling works correctly

**Success Definition**:
- `npm test` passes all existing tests plus new integration tests
- Integration tests verify both tools are registered and callable
- Server responds to `tools/list` with exactly 2 tools
- Server handles `tools/call` for both tools with proper validation
- Tests mock the executor to avoid requiring actual mdsel CLI installation

## User Persona

**Target User**: Claude Code agents and developers who will consume this MCP server to access mdsel functionality.

**Use Case**: Claude Code invokes this MCP server via stdio transport to discover and use mdsel_index and mdsel_select tools for selector-based Markdown access.

**User Journey**:
1. User configures Claude Code with mdsel-claude MCP server in ~/.claude.json
2. Claude Code spawns the mdsel-claude process: `npx mdsel-claude`
3. MCP server initializes and calls `registerTools(server)` to register both tools
4. Claude Code sends `list_tools` request to discover available tools
5. Server responds with tool list containing exactly 2 tools: `mdsel_index` and `mdsel_select`
6. Claude Code invokes tools via `call_tool` requests with validated arguments

**Pain Points Addressed**:
- Ensures both tools are properly discoverable by MCP clients
- Validates end-to-end functionality before deployment
- Provides regression test suite for future changes
- Verifies tool schema compliance with MCP protocol

## Why

- **Phase 1 Completion**: This task completes P1 (MVP phase) by validating that all components work together
- **Quality Assurance**: Integration tests catch issues that unit tests miss (e.g., tool registration, request routing)
- **MCP Protocol Compliance**: Validates that the server properly implements MCP tool discovery and invocation
- **Regression Prevention**: Future changes to tool registration or server setup will be caught by tests
- **Documentation**: Integration tests serve as executable documentation of how the server works

## What

Verify tool integration and create comprehensive integration tests for the MCP server with both tools registered.

### Current State (Pre-Implementation)

The codebase already has:
- `src/tools/index.ts` with `registerTools()` function that registers both tools
- `src/index.ts` that imports and calls `registerTools(server)` on line 19
- `src/tools/index.test.ts` with unit tests for `mdsel_index` tool
- `src/tools/select.test.ts` with unit tests for `mdsel_select` tool

**What's Missing**:
- Integration test file `src/index.test.ts` that tests the complete server with both tools
- Validation that tools are registered correctly when server starts
- End-to-end tests of tool invocation through the MCP protocol

### Implementation Scope

**P1.M3.T3.S1: Register both tools in server entry point**
- Status: **ALREADY COMPLETE** - `src/index.ts` line 19 calls `registerTools(server)`
- Verification needed: Ensure the import path and function call are correct

**P1.M3.T3.S2: Add integration tests for server**
- Status: **NEW WORK** - Create `src/index.test.ts`
- Test coverage:
  - Server initialization with tools registered
  - Tool listing via `list_tools` request
  - Tool invocation via `call_tool` request
  - Input validation at the MCP protocol level
  - Error handling for unknown tools and invalid arguments

### Success Criteria

- [ ] `src/index.ts` correctly imports and calls `registerTools(server)`
- [ ] `src/index.test.ts` created with comprehensive integration tests
- [ ] Integration tests verify exactly 2 tools are registered
- [ ] Integration tests verify tool names: `mdsel_index` and `mdsel_select`
- [ ] Integration tests verify tool schemas match specifications
- [ ] Integration tests verify both tools execute successfully with mocked executor
- [ ] Integration tests verify error handling for invalid inputs
- [ ] All tests pass: `npm test` (or `npm run test`)
- [ ] Test coverage remains high (check with `npm run test:coverage`)

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Exact file structure showing where integration tests should go
- Complete code patterns from existing test files to follow
- Mock patterns for the executor dependency
- MCP SDK testing patterns with InMemoryTransport
- Specific test cases to implement with expected assertions
- Commands to run tests and verify results

### Documentation & References

```yaml
# MUST READ - Integration Context

- file: src/index.ts
  why: Main server entry point that registers tools via registerTools()
  pattern: Lines 1-42 show complete server setup including tool registration call
  gotcha: registerTools() must be called AFTER server creation but BEFORE transport connection

- file: src/tools/index.ts
  why: Contains registerTools() function and both tool definitions
  pattern: Lines 97-156 show the complete registerTools() implementation
  critical: This is the pattern to follow - uses ListToolsRequestSchema and CallToolRequestSchema handlers

- file: src/tools/index.test.ts
  why: Reference for test patterns, InMemoryTransport usage, and mocking
  pattern: Lines 7-10 show vi.mock for executor; lines 23-113 show createTestServer and createConnectedClient fixtures
  gotcha: vi.mock must be at top level before imports

- file: src/tools/select.test.ts
  why: Additional reference for test patterns
  pattern: Similar structure to index.test.ts - shows consistency in test organization

- file: vitest.config.ts
  why: Test configuration - ensures tests are discovered correctly
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - new test file must match this pattern

- docfile: plan/docs/architecture/system_context.md
  why: System architecture context including tool surface specifications
  section: Lines 43-58 define the two tools and their exact purposes

- docfile: plan/docs/architecture/implementation_patterns.md
  why: Test patterns and code organization
  section: Lines 188-221 show testing patterns for mocking and tool handler testing

- docfile: PRD.md
  why: Product requirements defining the thin wrapper doctrine and tool specifications
  section: Lines 69-110 define exactly two tools with their purposes and behaviors

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP SDK with testing utilities and patterns
  critical: InMemoryTransport for in-process testing, Client class for making test requests

- url: https://www.npmjs.com/package/@modelcontextprotocol/sdk
  why: Package documentation with API reference for Client and testing utilities
  critical: Client.listTools() and Client.callTool() are the primary test methods
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (generated by tsup)
│   ├── index.d.ts
│   ├── index.js
│   └── index.js.map
├── src/
│   ├── index.ts                   # MCP server entry point (calls registerTools)
│   ├── executor.ts                # CLI executor for mdsel
│   ├── executor.test.ts           # Executor unit tests
│   └── tools/
│       ├── index.ts               # mdsel_index tool + registerTools() function
│       ├── index.test.ts          # mdsel_index unit tests (reference pattern)
│       ├── select.ts              # mdsel_select tool
│       └── select.test.ts         # mdsel_select unit tests
├── plan/
│   ├── P1M3T3/
│   │   └── PRP.md                # THIS DOCUMENT
│   └── docs/architecture/         # Architecture documentation
├── coverage/                      # Test coverage reports
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── tasks.json
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── dist/                          # Built output (unchanged)
├── src/
│   ├── index.ts                   # MCP server entry point (VERIFIED - calls registerTools)
│   ├── index.test.ts              # NEW: Integration tests for complete server
│   ├── executor.ts                # CLI executor (unchanged)
│   ├── executor.test.ts           # Executor unit tests (unchanged)
│   └── tools/
│       ├── index.ts               # mdsel_index tool + registerTools() (unchanged)
│       ├── index.test.ts          # mdsel_index unit tests (unchanged)
│       ├── select.ts              # mdsel_select tool (unchanged)
│       └── select.test.ts         # mdsel_select unit tests (unchanged)
└── ...
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM Module System
// ALL imports MUST use .js file extensions (not .ts)
// Test files are .test.ts, but imports use .js extensions
// Example: import { server } from './index.js' (not './index.ts')

// CRITICAL: vi.mock Placement
// vi.mock() calls must be at the TOP LEVEL before imports
// They cannot be inside describe blocks or functions
// WRONG:
//   describe('test', () => {
//     vi.mock('../executor.js', () => ({}));
//   });
// CORRECT:
//   vi.mock('../executor.js', () => ({ executeMdsel: vi.fn() }));
//   import { executeMdsel } from '../executor.js';

// CRITICAL: Server Import Pattern
// src/index.test.ts imports the server from src/index.ts
// The server is created at module level, so importing the file runs the initialization
// For testing, we need to import the server instance directly

// CRITICAL: Tool Registration Timing
// registerTools() MUST be called before server.connect()
// In src/index.ts, this is already handled correctly
// Tests should not call registerTools() again - use the already-configured server

// CRITICAL: InMemoryTransport.createLinkedPair()
// Returns an array: [clientTransport, serverTransport]
// The order matters - client uses first, server uses second

// CRITICAL: Test Cleanup
// Always call await client.close() and await server.close() in afterEach
// Without cleanup, tests will hang or leak resources

// CRITICAL: Mocking executeMdsel
// Use vi.mocked(executeMdsel) to access the mocked function with proper typing
// Call vi.clearAllMocks() in beforeEach to reset mock state between tests

// CRITICAL: Test File Naming
// Integration test file must be named src/index.test.ts (not src/index.spec.ts)
// This matches the vitest.config.ts pattern: src/**/*.{test,spec}.{js,ts}

// CRITICAL: Tool Schema Format
// MCP tools use JSON Schema format for inputSchema
// Properties use 'as const' for type narrowing
// Example: type: 'array' as const (not just 'array')

// CRITICAL: Server Export Pattern
// The server is exported as 'export const server' in src/index.ts
// Tests can import it directly: import { server } from './index.js'
// Do NOT create a new server in tests - use the exported instance

// CRITICAL: Async Test Handling
// All test functions interacting with MCP client/server must be async
// Use 'await' for all client operations (listTools, callTool)
// Use 'await expect(...).resolves' or 'await expect(...).rejects' for assertions

// CRITICAL: Tool Response Format
// MCP tools return { content: Array<{type: string, text: string}>, isError?: boolean }
// Tests should check result.content[0].text for output
// Tests should check result.isError for error conditions
```

## Implementation Blueprint

### Data Models and Structure

No new data models needed. This task uses existing types:

```typescript
// MCP SDK Types (from @modelcontextprotocol/sdk/types.js)
// - ListToolsRequestSchema: Schema for tools/list requests
// - CallToolRequestSchema: Schema for tools/call requests
// - Tool: Tool definition type with name, description, inputSchema

// Existing Types (from src/tools/index.ts)
// - MdselIndexInput: Type for mdsel_index tool input
// - MdselSelectInput: Type for mdsel_select tool input

// No new types required for integration tests
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: VERIFY src/index.ts - Tool Registration
  - VERIFY: Line 3 imports registerTools from './tools/index.js'
  - VERIFY: Line 19 calls registerTools(server) before transport connection
  - VERIFY: No syntax errors by running 'npm run build'
  - FOLLOW: Pattern in src/index.ts lines 17-19
  - GOTCHA: If registerTools call is missing, add: 'registerTools(server);'
  - PLACEMENT: src/index.ts, after server creation (line 6-16), before main() function (line 22+)

Task 2: CREATE src/index.test.ts - Integration Test File Structure
  - IMPLEMENT: Import test utilities from vitest
  - IMPLEMENT: Import MCP SDK Client, Server, InMemoryTransport
  - IMPLEMENT: Top-level vi.mock for executor
  - IMPLEMENT: Import server and executor after mocks
  - IMPLEMENT: Import both tool schemas and handlers
  - FOLLOW: Pattern from src/tools/index.test.ts lines 1-13
  - NAMING: File name must be 'src/index.test.ts' (matches vitest pattern)
  - PLACEMENT: src/index.test.ts (same directory as src/index.ts)

Task 3: CREATE Test Fixtures - createTestServer() and createConnectedClient()
  - IMPLEMENT: createTestServer() function that creates a fresh server instance
  - IMPLEMENT: createConnectedClient() function that creates linked client-server pair
  - FOLLOW: Pattern from src/tools/index.test.ts lines 23-113
  - CRITICAL: Use InMemoryTransport.createLinkedPair() for in-process testing
  - CRITICAL: Connect server to serverTransport, client to clientTransport
  - PLACEMENT: Top of src/index.test.ts, before describe blocks

Task 4: IMPLEMENT Test Suite - Server Initialization and Tool Registration
  - IMPLEMENT: describe('MCP Server Integration', () => {...})
  - IMPLEMENT: beforeEach to create connected client-server pair
  - IMPLEMENT: afterEach to close client and server
  - IMPLEMENT: 'should list exactly 2 tools' test
  - IMPLEMENT: 'should have mdsel_index tool with correct schema' test
  - IMPLEMENT: 'should have mdsel_select tool with correct schema' test
  - FOLLOW: Pattern from src/tools/index.test.ts lines 180-251
  - ASSERTIONS: Verify tools.length === 2, tool names, descriptions, inputSchema properties
  - PLACEMENT: First describe block in src/index.test.ts

Task 5: IMPLEMENT Test Suite - mdsel_index Tool Execution
  - IMPLEMENT: describe('mdsel_index Tool Execution', () => {...})
  - IMPLEMENT: 'should execute mdsel_index successfully' test
  - IMPLEMENT: 'should return TEXT output' test
  - IMPLEMENT: 'should pass files to executor' test
  - IMPLEMENT: 'should handle executor errors' test
  - IMPLEMENT: Mock executeMdsel to return successful result
  - FOLLOW: Pattern from src/tools/index.test.ts lines 241-341
  - ASSERTIONS: Verify result.isError is undefined, result.content[0].text contains expected output
  - MOCK: vi.mocked(executeMdsel).mockResolvedValue({ success: true, stdout: '...', stderr: '', exitCode: 0 })
  - PLACEMENT: Second describe block in src/index.test.ts

Task 6: IMPLEMENT Test Suite - mdsel_select Tool Execution
  - IMPLEMENT: describe('mdsel_select Tool Execution', () => {...})
  - IMPLEMENT: 'should execute mdsel_select successfully' test
  - IMPLEMENT: 'should pass selector and files to executor' test
  - IMPLEMENT: 'should handle executor errors' test
  - IMPLEMENT: Mock executeMdsel to return successful result
  - FOLLOW: Pattern from src/tools/select.test.ts lines 257-356
  - ASSERTIONS: Verify result.isError is undefined, result.content[0].text contains expected output
  - MOCK: vi.mocked(executeMdsel).mockResolvedValue({ success: true, stdout: '...', stderr: '', exitCode: 0 })
  - PLACEMENT: Third describe block in src/index.test.ts

Task 7: IMPLEMENT Test Suite - Input Validation and Error Handling
  - IMPLEMENT: describe('Input Validation', () => {...})
  - IMPLEMENT: 'should reject invalid tool name' test
  - IMPLEMENT: 'should reject empty files array for mdsel_index' test
  - IMPLEMENT: 'should reject empty selector for mdsel_select' test
  - FOLLOW: Pattern from src/tools/index.test.ts lines 420-463
  - ASSERTIONS: Verify result.isError === true, result.content[0].text contains error message
  - PLACEMENT: Fourth describe block in src/index.test.ts

Task 8: RUN and VALIDATE Tests
  - RUN: 'npm test' to execute all tests
  - VERIFY: All existing tests still pass
  - VERIFY: New integration tests pass
  - RUN: 'npm run test:coverage' (if available) to check coverage
  - VERIFY: No tests are skipped or todo
  - EXPECTED: All test suites pass with no errors

Task 9: MANUAL VALIDATION with MCP Inspector (Optional)
  - INSTALL: 'npm install -g @modelcontextprotocol/inspector'
  - RUN: 'npm run build' to build the server
  - RUN: 'npx @modelcontextprotocol/inspector node dist/index.js'
  - VERIFY: Inspector shows exactly 2 tools
  - VERIFY: Tool names are 'mdsel_index' and 'mdsel_select'
  - VERIFY: Tool schemas match expected format
  - TERMINATE: Ctrl+C when done
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// TEST FILE STRUCTURE PATTERN (Task 2)
// ============================================================

// File: src/index.test.ts

// CRITICAL: vi.mock at top level BEFORE imports
vi.mock('../executor.js', () => ({
  executeMdsel: vi.fn()
}));

// Import test utilities
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import MCP SDK components
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

// Import executor after mock
import { executeMdsel } from '../executor.js';

// Import server and tools
import { server } from './index.js';
import { MdselIndexInputSchema, mdselIndexHandler } from './tools/index.js';
import { MdselSelectInputSchema, mdselSelectHandler } from './tools/select.js';

// GOTCHA: Import order matters - mocks first, then imports
// GOTCHA: Use .js extensions even though source files are .ts

// ============================================================
// TEST FIXTURES PATTERN (Task 3)
// ============================================================

/**
 * Creates a connected client-server pair for integration testing.
 * Uses InMemoryTransport for in-process communication.
 */
async function createConnectedClient() {
  // Create linked transport pair for client-server communication
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  // Connect the exported server instance to the server transport
  await server.connect(serverTransport);

  // Create a client instance
  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  // Connect client to the client transport
  await client.connect(clientTransport);

  return { client, server };
}

// GOTCHA: InMemoryTransport.createLinkedPair() returns [clientTransport, serverTransport]
// GOTCHA: Order matters - client gets first element, server gets second

// ============================================================
// TEST SUITE PATTERN - Tool Registration (Task 4)
// ============================================================

describe('MCP Server Integration', () => {
  let client: Client;
  let testServer: Server;

  beforeEach(async () => {
    // Create fresh client-server pair for each test
    const setup = await createConnectedClient();
    client = setup.client;
    testServer = setup.server;
  });

  afterEach(async () => {
    // Clean up resources after each test
    await client.close();
    await testServer.close();
    vi.clearAllMocks();
  });

  describe('Tool Registration', () => {
    it('should list exactly 2 tools', async () => {
      const { tools } = await client.listTools();

      expect(tools).toBeDefined();
      expect(tools.length).toBe(2);
    });

    it('should have mdsel_index tool with correct properties', async () => {
      const { tools } = await client.listTools();

      const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
      expect(mdselIndexTool).toBeDefined();
      expect(mdselIndexTool?.name).toBe('mdsel_index');
      expect(mdselIndexTool?.description).toContain('selector inventory');
      expect(mdselIndexTool?.inputSchema).toBeDefined();
      expect(mdselIndexTool?.inputSchema.properties).toHaveProperty('files');
      expect(mdselIndexTool?.inputSchema.required).toContain('files');
    });

    it('should have mdsel_select tool with correct properties', async () => {
      const { tools } = await client.listTools();

      const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
      expect(mdselSelectTool).toBeDefined();
      expect(mdselSelectTool?.name).toBe('mdsel_select');
      expect(mdselSelectTool?.description).toContain('select content');
      expect(mdselSelectTool?.inputSchema).toBeDefined();
      expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('selector');
      expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('files');
      expect(mdselSelectTool?.inputSchema.required).toContain('selector');
      expect(mdselSelectTool?.inputSchema.required).toContain('files');
    });
  });
});

// ============================================================
// TEST SUITE PATTERN - Tool Execution (Task 5 & 6)
// ============================================================

describe('mdsel_index Tool Execution', () => {
  let client: Client;
  let testServer: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    testServer = setup.server;

    // Mock successful executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: 'h1.0 Main Title\n h2.0 Section One\n---\ncode:1 para:5\n',
      stderr: '',
      exitCode: 0
    });
  });

  afterEach(async () => {
    await client.close();
    await testServer.close();
    vi.clearAllMocks();
  });

  it('should execute mdsel_index successfully', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('h1.0 Main Title');
  });

  it('should call executor with correct arguments', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['test.md', 'docs.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['test.md', 'docs.md']);
  });

  it('should handle executor errors', async () => {
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '!FILE_NOT_FOUND: File not found',
      exitCode: 1
    });

    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['missing.md'] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('FILE_NOT_FOUND');
  });
});

// Similar pattern for mdsel_select...

// ============================================================
// TEST SUITE PATTERN - Input Validation (Task 7)
// ============================================================

describe('Input Validation', () => {
  let client: Client;
  let testServer: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    testServer = setup.server;
  });

  afterEach(async () => {
    await client.close();
    await testServer.close();
    vi.clearAllMocks();
  });

  it('should reject unknown tool name', async () => {
    const result = await client.callTool({
      name: 'unknown_tool',
      arguments: { files: ['test.md'] }
    } as any);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });

  it('should reject empty files array for mdsel_index', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: [] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input validation error');
  });

  it('should reject empty selector for mdsel_select', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: '', files: ['test.md'] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input validation error');
  });
});
```

### Integration Points

```yaml
SRC/INDEX.TS:
  - verified: Line 3 imports registerTools from './tools/index.js'
  - verified: Line 19 calls registerTools(server)
  - no changes expected - integration is already complete

SRC/TOOLS/INDEX.TS:
  - verified: Exports registerTools() function
  - verified: Handles both tools in tools/call handler
  - no changes expected

SRC/EXECUTOR.TS:
  - mocked in tests using vi.mock
  - tests do not require actual mdsel CLI installation
  - no changes expected

VITEST.CONFIG.TS:
  - verified: test.include pattern matches src/index.test.ts
  - no changes expected

PACKAGE.JSON:
  - scripts: "test": "vitest run" for running tests
  - scripts: "test:watch": "vitest" for watch mode
  - optional: "test:coverage": "vitest run --coverage"
  - no changes expected
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after creating src/index.test.ts - fix before proceeding
npm run build

# Expected Output:
# > mdsel-claude@1.0.0 build
# > tsup
# CLI Building entry: src/index.ts
# CLI dist/index.js   X.XX KB
# CLI dist/index.d.ts X.XX KB
# CLI Success in XXXms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/index.js and dist/index.d.ts generated successfully
# - No type errors in test file

# If errors occur:
# - Check import paths use .js extensions
# - Check vi.mock is at top level before imports
# - Check type annotations match MCP SDK types
```

### Level 2: Unit Tests (Component Validation)

```bash
# Run all tests including new integration tests
npm test

# Expected Output:
# > mdsel-claude@1.0.0 test
# > vitest run
#
# TEST SUITE: MCP Server Integration
#   Tool Registration
#     should list exactly 2 tools ... ok (XXms)
#     should have mdsel_index tool with correct properties ... ok (XXms)
#     should have mdsel_select tool with correct properties ... ok (XXms)
#   mdsel_index Tool Execution
#     should execute mdsel_index successfully ... ok (XXms)
#     should call executor with correct arguments ... ok (XXms)
#     should handle executor errors ... ok (XXms)
#   mdsel_select Tool Execution
#     should execute mdsel_select successfully ... ok (XXms)
#     should call executor with correct arguments ... ok (XXms)
#     should handle executor errors ... ok (XXms)
#   Input Validation
#     should reject unknown tool name ... ok (XXms)
#     should reject empty files array for mdsel_index ... ok (XXms)
#     should reject empty selector for mdsel_select ... ok (XXms)
#
# TEST SUITE: MdselIndexInputSchema (existing tests)
#   ... (all existing tests pass)
#
# TEST SUITE: MdselSelectInputSchema (existing tests)
#   ... (all existing tests pass)
#
# TEST SUITE: executeMdsel (existing tests)
#   ... (all existing tests pass)
#
# Test Files  X passed (X)
# Tests        XX passed (XX)
# Time        X.XXs

# Validation Checks:
# - All tests pass (no failures, no skipped)
# - Integration tests verify both tools are registered
# - Integration tests verify tool execution
# - Integration tests verify error handling

# If tests fail:
# - Read error messages carefully
# - Check mock setup is correct
# - Check async/await usage
# - Verify client-server connection is established

# Run specific test file for debugging:
npx vitest run src/index.test.ts

# Run tests in watch mode for development:
npm run test:watch
```

### Level 3: Integration Testing (System Validation)

```bash
# Build the server
npm run build

# Test with MCP Inspector (optional but recommended)
npx @modelcontextprotocol/inspector node dist/index.js

# Expected:
# - Inspector UI opens (browser or terminal)
# - Server info shows: name "mdsel-claude", version "1.0.0"
# - Tools list shows exactly 2 tools:
#   1. mdsel_index - "Return a selector inventory for Markdown documents..."
#   2. mdsel_select - "Select content from Markdown documents..."
# - Click on each tool to see input schema
# - Try calling each tool with test arguments
# - Verify tools execute successfully (will fail if mdsel CLI not installed)

# Manual tool invocation test (requires mdsel CLI installed):
# Create a test Markdown file
echo "# Test
## Section One
Some content
" > test-file.md

# Use inspector to call mdsel_index with files: ["test-file.md"]
# Expected: Returns selector inventory showing h1.0, h2.0, para.0

# Use inspector to call mdsel_select with selector: "h2.0", files: ["test-file.md"]
# Expected: Returns content of h2.0 heading

# Cleanup
rm test-file.md

# Test server startup and shutdown
timeout 3 node dist/index.js 2>&1 || echo "Server started and timed out as expected"

# Expected: Server starts, waits for stdin (timeout kills it after 3 seconds)
```

### Level 4: Code Quality & Coverage Validation

```bash
# Run tests with coverage (if coverage script exists)
npm run test:coverage

# Or run with vitest directly
npx vitest run --coverage

# Expected Output:
# % Coverage report
# --------------------|---------|----------|---------|---------|-------------------
# File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
# --------------------|---------|----------|---------|---------|-------------------
# All files           |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
#  src                |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
#   index.ts          |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  | XX-XX
#   executor.ts       |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
#   tools/            |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
#     index.ts        |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
#     select.ts       |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
# --------------------|---------|----------|---------|---------|-------------------

# Target: Maintain high coverage (>80% for src files)

# Check for linting issues (if linter configured)
npm run lint 2>/dev/null || echo "No lint script configured"

# Check for type issues
npx tsc --noEmit

# Expected: No type errors

# Verify test file follows patterns
grep -n "vi.mock" src/index.test.ts | head -1

# Expected: vi.mock call at top of file (before imports)

# Verify ESM imports use .js extensions
grep -n "from '\\./" src/index.test.ts

# Expected: All imports use .js extensions (e.g., './index.js', '../executor.js')
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] src/index.test.ts created at correct location
- [ ] Test file uses .js extensions in all imports
- [ ] vi.mock for executor is at top level before imports
- [ ] Level 2 validation passed: `npm test` - all tests pass including new integration tests
- [ ] Integration tests verify exactly 2 tools are registered
- [ ] Integration tests verify tool names: mdsel_index and mdsel_select
- [ ] Integration tests verify tool schemas are correct
- [ ] Integration tests verify tool execution with mocked executor
- [ ] Integration tests verify error handling

### Feature Validation

- [ ] src/index.ts calls registerTools(server) on line 19 (verified)
- [ ] Integration test 'should list exactly 2 tools' passes
- [ ] Integration test 'should have mdsel_index tool with correct properties' passes
- [ ] Integration test 'should have mdsel_select tool with correct properties' passes
- [ ] mdsel_index execution tests pass (success path, error path)
- [ ] mdsel_select execution tests pass (success path, error path)
- [ ] Input validation tests pass (unknown tool, empty files, empty selector)
- [ ] All existing unit tests still pass (no regressions)

### Code Quality Validation

- [ ] Test file follows pattern from src/tools/index.test.ts
- [ ] Test fixtures (createConnectedClient) match existing patterns
- [ ] beforeEach/afterEach properly set up and tear down test environment
- [ ] vi.clearAllMocks() called in afterEach
- [ ] Mock uses vi.mocked(executeMdsel) for type safety
- [ ] Test descriptions are clear and descriptive
- [ ] Assertions are specific (checking exact values, not just existence)
- [ ] No console.log calls in tests (use expect for assertions)

### Integration Readiness

- [ ] MCP Inspector (optional) shows exactly 2 tools
- [ ] Tool names in inspector match mdsel_index and mdsel_select
- [ ] Tool schemas in inspector are complete and correct
- [ ] Tools can be invoked through inspector (if mdsel CLI installed)
- [ ] Server starts and shuts down gracefully
- [ ] No resource leaks or hanging processes
- [ ] Test coverage remains high (check coverage report)
- [ ] Ready for Phase 2 (Behavioral Conditioning) to begin

---

## Anti-Patterns to Avoid

- Don't create a new server instance in tests - use the exported one from src/index.ts
- Don't call registerTools() in tests - it's already called in src/index.ts
- Don't put vi.mock inside describe blocks - must be at top level
- Don't use .ts extensions in imports - must use .js for ESM
- Don't forget to close client and server in afterEach - causes resource leaks
- Don't forget vi.clearAllMocks() in afterEach - causes test pollution
- Don't test private implementation details - test behavior through public API
- Don't skip cleanup in afterEach - tests will hang
- Don't use console.log for debugging in tests - use expect assertions
- Don't hardcode tool counts in a way that breaks when adding new tools
- Don't mock the MCP SDK Client or Server - test real behavior
- Don't forget to await async operations - causes flaky tests
- Don't use synchronous spawn in tests - must mock the executor
- Don't create tests that require actual mdsel CLI installation
- Don't add tests for individual tool schemas - those are unit tests, not integration tests

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Tool registration is already complete in src/index.ts and src/tools/index.ts
- Clear pattern to follow from existing test files (src/tools/index.test.ts, src/tools/select.test.ts)
- Mock pattern for executor is well-established in existing tests
- MCP SDK testing utilities (InMemoryTransport, Client) are documented
- Test cases are specific and actionable with expected assertions
- All gotchas documented with correct/incorrect examples
- Validation commands are deterministic and checkable

**Expected Implementation Time**: ~45-90 minutes for a developer familiar with TypeScript, Vitest, and MCP SDK

**Risk Factors**:
- ESM .js extension requirement (mitigated: explicit examples provided)
- vi.mock placement (mitigated: pattern clearly documented)
- Server import pattern (mitigated: specific instructions provided)
- Test cleanup (mitigated: beforeEach/afterEach pattern provided)

**Post-Implementation**:
- P1 (MVP phase) will be complete
- Server will be ready for production use
- Phase 2 (Behavioral Conditioning) can begin
- Tests will serve as regression suite for future changes

**Next Steps After P1.M3.T3**:
- P2.M1: Implement word count gating utility
- P2.M2: Implement PreToolUse hook for behavioral conditioning
- P3: Documentation and distribution
