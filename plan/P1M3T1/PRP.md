name: "P1.M3.T1: Implement mdsel_index Tool"
description: |

---

## Goal

**Feature Goal**: Implement the `mdsel_index` MCP tool that returns a selector inventory for Markdown documents by invoking the `mdsel index` CLI command.

**Deliverable**: A complete `src/tools/index.ts` file containing:
- Zod schema for `mdsel_index` input validation (files parameter)
- MCP tool registration using `McpServer.registerTool()`
- Tool handler that delegates to `executeMdsel('index', files)` from P1.M2.T2
- Pass-through of mdsel TEXT output unchanged (thin wrapper doctrine)
- Complete unit tests in `src/tools/index.test.ts`

**Success Definition**:
- Tool is registered with MCP server under name `mdsel_index`
- Tool accepts `files: string[]` parameter (array of Markdown file paths)
- Tool invokes `executeMdsel('index', files)` correctly
- Tool returns TEXT output from mdsel unchanged in `content[0].text`
- Tool sets `isError: true` when mdsel exits with non-zero code
- All tests pass (tool registration, success path, error path)

## User Persona

**Target User**: Claude Code agents and users who need to discover available selectors in Markdown documents before performing content retrieval.

**Use Case**: When working with large Markdown files, the agent needs to first discover what selectors are available before using `mdsel_select` to retrieve specific content.

**User Journey**:
1. Agent encounters a large Markdown file (e.g., `README.md`)
2. Agent invokes `mdsel_index` tool with file path to discover structure
3. Tool returns hierarchical selector list (h1.0, h2.0, etc.) with indentation
4. Agent uses returned selectors to call `mdsel_select` for specific sections
5. Agent avoids loading entire file into context, saving tokens

**Pain Points Addressed**:
- Enables discovery-based workflow (must index before selecting)
- Provides token-efficient alternative to reading full files
- Returns structured selector hierarchy that LLMs can parse easily
- Follows PRD "thin wrapper" doctrine - no interpretation of mdsel output

## Why

- **Foundation for P1.M3.T2**: `mdsel_select` tool depends on agents first discovering selectors via `mdsel_index`
- **Two-Step Workflow**: PRD specifies index-first pattern - agents must discover before selecting
- **Token Efficiency**: Returns compact TEXT format instead of full file contents
- **Deterministic Output**: TEXT output is consistent and parseable by LLMs
- **Existing Infrastructure**: Builds on `executeMdsel()` from P1.M2.T2

## What

Implement the `mdsel_index` MCP tool that returns a selector inventory for Markdown documents.

### Core Implementation

1. **Zod Schema Definition** (P1.M3.T1.S1):
   - Define input schema with `files: z.array(z.string()).min(1)`
   - Files parameter must be non-empty array of strings
   - Export schema for testing reuse

2. **Tool Handler Implementation** (P1.M3.T1.S2):
   - Import `executeMdsel` from `../executor.js`
   - Import `server` from `../index.js` (MCP server instance)
   - Register tool using `server.registerTool('mdsel_index', ...)`
   - Handler calls `executeMdsel('index', args.files)`
   - Return `{ content: [{ type: 'text', text: result.stdout }], isError: !result.success }`
   - **No transformation** of mdsel output (thin wrapper doctrine)

3. **Unit Tests** (P1.M3.T1.S3):
   - Test tool registration via `client.listTools()`
   - Test success path (mock executor returning success)
   - Test error path (mock executor returning failure)
   - Test input validation (empty files array rejection)
   - Use `InMemoryTransport` for integration testing

### Success Criteria

- [ ] `src/tools/index.ts` created with mdsel_index tool
- [ ] Zod schema defines `files: z.array(z.string()).min(1)`
- [ ] Tool registered with name `mdsel_index`
- [ ] Tool handler calls `executeMdsel('index', args.files)`
- [ ] Success returns TEXT output in `content[0].text` with `isError: undefined`
- [ ] Failure returns stderr in `content[0].text` with `isError: true`
- [ ] No transformation of mdsel output (pass-through)
- [ ] `src/tools/index.test.ts` created with all tests passing
- [ ] Tests verify tool registration, success, error, and validation paths

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete mdsel CLI documentation with TEXT output format
- Exact MCP tool registration API with Zod schema examples
- Existing executor pattern from P1.M2.T2 to delegate to
- Complete test patterns with Vitest and InMemoryTransport
- File placement and naming conventions from codebase
- Validation commands that work in this project

### Documentation & References

```yaml
# MUST READ - mdsel CLI Documentation

- docfile: plan/P1M3T1/research/mdsel-cli-research.md
  why: Complete mdsel CLI documentation including TEXT output format
  section: Lines 79-183 describe TEXT output format (heading hierarchy, separator, block counts)
  critical: mdsel index returns TEXT format, not JSON - format is "<hierarchy>\n---\n<counts>"

- docfile: plan/P1M3T1/research/mdsel-cli-research.md
  why: Command syntax and arguments for mdsel index
  section: Lines 195-231 show mdsel index accepts files... argument
  critical: Command is `mdsel index <files...>` - files are positional arguments

- docfile: plan/P1M3T1/research/mdsel-cli-research.md
  why: Exit codes and error handling
  section: Lines 234-293 show exit codes (0=success, 1=error, 2=usage error)
  critical: TEXT mode errors use `!<selector>` and `~<suggestion>` prefixes

# MUST READ - MCP Tool Registration

- docfile: plan/P1M3T1/research/mcp-tool-registration.md
  why: Complete MCP tool registration API documentation
  section: Lines 34-77 show McpServer.registerTool() usage with Zod schemas
  critical: Use server.registerTool(name, config, handler) - NOT deprecated server.tool()

- docfile: plan/P1M3T1/research/mcp-tool-registration.md
  why: Tool handler function signature and return format
  section: Lines 278-350 show ToolCallback type and handler examples
  critical: Handler returns { content: [{ type: 'text', text: '...' }], isError?: boolean }

- docfile: plan/P1M3T1/research/mcp-tool-registration.md
  why: Error handling pattern for MCP tools
  section: Lines 445-458 show how to return errors with isError: true
  critical: Return errors in result object, don't throw exceptions

- docfile: plan/P1M3T1/research/mcp-tool-registration.md
  why: Complete working examples of tool registration
  section: Lines 493-529 show simple greeting tool example
  critical: Follow this pattern for structure and imports

# MUST READ - Testing Patterns

- docfile: plan/P1M3T1/research/mcp-testing-patterns.md
  why: Integration testing with InMemoryTransport
  section: Lines 82-159 show InMemoryTransport.createLinkedPair() pattern
  critical: Use InMemoryTransport for realistic client-server testing in same process

- docfile: plan/P1M3T1/research/mcp-testing-patterns.md
  why: Complete test suite example for MCP tools
  section: Lines 578-753 show full test suite with registration, success, error tests
  critical: Follow this structure for organizing tests

- docfile: plan/P1M3T1/research/mcp-testing-patterns.md
  why: Mocking executeMdsel for unit tests
  section: Lines 162-210 show vi.mock() pattern for module mocking
  critical: Use vi.mock('../src/executor.js') to mock executeMdsel

# Existing Codebase Patterns

- file: src/index.ts
  why: MCP server instance to register tools with
  pattern: Exported `server` instance from @modelcontextprotocol/sdk/server/index.js
  critical: Import server from '../index.js' to register tools
  gotcha: Server is already created and exported - don't create new instance

- file: src/executor.ts
  why: Execute mdsel CLI command - already implemented in P1.M2.T2
  pattern: executeMdsel(command: 'index' | 'select', args: string[]): Promise<ExecutorResult>
  critical: Import executeMdsel from '../executor.js' - don't reimplement
  gotcha: Executor uses TEXT output mode (no --json flag) - already configured

- file: src/executor.test.ts
  why: Reference for test patterns and mocking approach
  pattern: vi.mock('node:child_process') with mock ChildProcess object
  critical: Follow this pattern for mocking executeMdsel in tool tests

- file: plan/P1M2T2/PRP.md
  why: Executor implementation details for understanding executeMdsel signature
  section: Lines 279-304 show ExecutorResult interface and function signature
  critical: executeMdsel returns { success, stdout, stderr, exitCode }

- file: plan/architecture/implementation_patterns.md
  why: Tool handler pattern from reference implementation
  section: Lines 69-130 show tool registration pattern with Zod schemas
  critical: Follow this pattern but use McpServer.registerTool() not server.tool()

- file: vitest.config.ts
  why: Test configuration for test file discovery
  pattern: test.include: ['src/**/*.{test,spec}.{js,ts}'] - tests must match this pattern
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.js                   # MCP server (with shebang)
│   ├── index.d.ts                 # Server type declarations
│   ├── executor.js                # Executor from P1.M2.T2
│   └── executor.d.ts              # Executor types
├── src/
│   ├── index.ts                   # MCP server entry point (exports server)
│   ├── executor.ts                # Child process executor (P1.M2.T2)
│   ├── executor.test.ts           # Executor tests
│   └── tools/                     # NEW: Tools directory
│       ├── index.ts               # TO BE CREATED: mdsel_index tool
│       └── index.test.ts          # TO BE CREATED: Tool tests
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md       # MCP SDK and mdsel docs
│   │   ├── implementation_patterns.md  # Code patterns
│   │   └── system_context.md      # System architecture
│   ├── P1M2T2/
│   │   └── PRP.md                 # Executor PRP (reference)
│   └── P1M3T1/
│       ├── PRP.md                 # THIS DOCUMENT
│       └── research/
│           ├── mdsel-cli-research.md
│           ├── mcp-tool-registration.md
│           └── mcp-testing-patterns.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   ├── executor.js
│   ├── executor.d.ts
│   ├── tools/
│   │   ├── index.js               # NEW: Compiled mdsel_index tool
│   │   └── index.d.ts             # NEW: Tool type declarations
├── src/
│   ├── index.ts                   # UNCHANGED
│   ├── executor.ts                # UNCHANGED
│   ├── executor.test.ts           # UNCHANGED
│   ├── tools/                     # NEW: Tools directory
│   │   ├── index.ts               # NEW: mdsel_index tool implementation
│   │   └── index.test.ts          # NEW: Tool tests
│   └── tools/
│       └── index.test.ts          # NEW: Tool tests
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: Use McpServer.registerTool(), not server.tool()
// server.tool() is deprecated - use McpServer.registerTool() instead
// WRONG: server.tool('mdsel_index', description, schema, handler)
// CORRECT: server.registerTool('mdsel_index', { description, inputSchema }, handler)

// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// ALL imports MUST include .js file extensions (not .ts)
// WRONG: import { executeMdsel } from '../executor';
// CORRECT: import { executeMdsel } from '../executor.js';

// CRITICAL: Import Server from index.ts, don't create new instance
// Server is already created in src/index.ts and exported
// WRONG: const server = new Server({ name: 'mdsel-claude', version: '1.0.0' });
// CORRECT: import { server } from '../index.js';

// CRITICAL: Return Errors, Don't Throw Them
// MCP tools should return errors in result object with isError: true
// WRONG: throw new Error('Failed');
// CORRECT: return { content: [{ type: 'text', text: 'Failed' }], isError: true };

// CRITICAL: TEXT Output Mode (NOT JSON)
// mdsel CLI is already configured for TEXT output in executor.ts
// Executor does NOT use --json flag - TEXT output is returned
// TEXT format: <heading hierarchy>\n---\n<block counts>
// Don't parse or transform - pass through unchanged

// CRITICAL: Zod Schema Validation
// Zod is a required peer dependency of MCP SDK
// Use z.array(z.string()).min(1) for files parameter
// .min(1) ensures at least one file is provided
// Schema validation is automatic - handler receives validated args

// CRITICAL: Tool Naming Convention
// Tool name in registerTool() must match PRD specification
// PRD specifies: "mdsel.index" but tool names use underscore convention
// Use 'mdsel_index' as tool name (not 'mdsel.index' or 'mdsel-index')

// CRITICAL: Content Block Type
// MCP uses content array with type field
// Use type: 'text' for text content
// Return { content: [{ type: 'text', text: result.stdout }] }

// CRITICAL: Test File Import Pattern
// When mocking executor in tests, mock before importing
// WRONG: import { executeMdsel } from '../executor.js'; vi.mock('../executor.js');
// CORRECT: vi.mock('../executor.js'); import { executeMdsel } from '../executor.js';

// CRITICAL: InMemoryTransport for Testing
// Use InMemoryTransport.createLinkedPair() for integration tests
// This creates client and server transports that communicate in-memory
// Avoids spawning actual processes or using stdio in tests

// CRITICAL: Vitest Mock Module Location
// vi.mock() must be at top level, not inside describe blocks
// Mocked module must be imported after vi.mock() call
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Input Schema - Zod schema for mdsel_index tool parameters
// Defines the contract for tool input validation
// Validated automatically by MCP SDK before handler is called

import { z } from 'zod';

const MdselIndexInputSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type inference from Zod schema (automatic)
type MdselIndexInput = z.infer<typeof MdselIndexInputSchema>;
// Result: { files: string[] }
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/tools/index.ts - Import Dependencies and Define Schema
  - CREATE: src/tools directory if it doesn't exist
  - IMPORT: z from 'zod'
  - IMPORT: executeMdsel from '../executor.js' (use .js extension)
  - IMPORT: server from '../index.js' (MCP server instance)
  - DEFINE: MdselIndexInputSchema with files: z.array(z.string()).min(1)
  - NAMING: Use exact schema name as specified
  - PLACEMENT: Top of src/tools/index.ts
  - GOTCHA: Use .js extension in import paths even though source is .ts

Task 2: IMPLEMENT Tool Handler Function
  - CREATE: Async handler function with signature (args, extra) => CallToolResult
  - DESTRUCTURE: files from args.input (Zod-validated)
  - CALL: await executeMdsel('index', files)
  - RETURN: On success - { content: [{ type: 'text', text: result.stdout }] }
  - RETURN: On failure - { content: [{ type: 'text', text: result.stderr || 'Indexing failed' }], isError: true }
  - GOTCHA: Don't transform or parse output - pass through unchanged
  - GOTCHA: Return error in result object, don't throw exception
  - PLACEMENT: After schema definition, before registration

Task 3: REGISTER Tool with MCP Server
  - CALL: server.registerTool('mdsel_index', config, handler)
  - CONFIG: Set description to explain tool purpose
  - CONFIG: Set inputSchema to MdselIndexInputSchema
  - CONFIG: Set annotations.readOnlyHint to true (tool doesn't modify files)
  - NAMING: Tool name must be 'mdsel_index' (exact match)
  - GOTCHA: Use registerTool(), not deprecated server.tool()
  - PLACEMENT: After handler function, end of file

Task 4: CREATE src/tools/index.test.ts - Test File Setup
  - CREATE: src/tools/index.test.ts
  - IMPORT: describe, it, expect, vi, beforeEach, afterEach from 'vitest'
  - IMPORT: Client from '@modelcontextprotocol/sdk/client/index.js'
  - IMPORT: McpServer from '@modelcontextprotocol/sdk/server/mcp.js'
  - IMPORT: InMemoryTransport from '@modelcontextprotocol/sdk/inMemory.js'
  - IMPORT: z from 'zod'
  - MOCK: vi.mock('../executor.js', () => ({ executeMdsel: vi.fn() }))
  - IMPORT: executeMdsel from '../executor.js' (after mock)
  - IMPORT: server from '../index.js'
  - GOTCHA: vi.mock() must come before import of mocked module
  - GOTCHA: Use .js extension in all import paths

Task 5: IMPLEMENT Test Suite - Tool Registration Tests
  - DESCRIBE: 'Tool Registration' test suite
  - BEFORE-EACH: Set up InMemoryTransport, client, server connection
  - AFTER-EACH: Close client and server, clear mocks
  - TEST: should list the registered tool (client.listTools())
  - TEST: should have correct tool name (expect(tools[0].name).toBe('mdsel_index'))
  - TEST: should have correct input schema (verify files property is required)
  - MOCK: Create mock executor results for setup
  - GOTCHA: Use InMemoryTransport.createLinkedPair() for transport

Task 6: IMPLEMENT Test Suite - Success Path Tests
  - DESCRIBE: 'Tool Execution - Success Path' test suite
  - BEFORE-EACH: Mock executeMdsel to return success result
  - MOCK: executeMdsel.mockResolvedValue({ success: true, stdout: 'h1.0 Title\n---\ncode:0 para:1\n', stderr: '', exitCode: 0 })
  - TEST: should execute tool successfully (client.callTool())
  - TEST: should call executeMdsel with correct arguments ('index', [file])
  - TEST: should return TEXT output in content[0].text
  - TEST: should not set isError flag on success
  - GOTCHA: Use vi.mocked(executeMdsel) for type-safe mock access

Task 7: IMPLEMENT Test Suite - Error Path Tests
  - DESCRIBE: 'Tool Execution - Error Path' test suite
  - BEFORE-EACH: Mock executeMdsel to return failure result
  - MOCK: executeMdsel.mockResolvedValue({ success: false, stdout: '', stderr: 'File not found', exitCode: 1 })
  - TEST: should handle execution errors (check result.isError is true)
  - TEST: should return stderr in content text
  - TEST: should call executeMdsel with correct arguments on error
  - GOTCHA: Error should be returned, not thrown

Task 8: BUILD and Validate
  - RUN: npm run build to compile TypeScript
  - VERIFY: dist/tools/index.js and dist/tools/index.d.ts generated
  - RUN: npm test to execute all tests including new tool tests
  - VERIFY: All tests pass
  - VERIFY: Tool is registered (check for compilation errors)
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// IMPORT PATTERN (Task 1)
// ============================================================

// src/tools/index.ts

import { z } from 'zod';
import { executeMdsel, ExecutorResult } from '../executor.js';
import { server } from '../index.js';

// GOTCHA: Use .js extension in imports (ESM requirement)
// GOTCHA: Import server from index.ts, don't create new instance

// ============================================================
// ZOD SCHEMA PATTERN (Task 1)
// ============================================================

const MdselIndexInputSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type is inferred automatically:
// type MdselIndexInput = { files: string[] }

// ============================================================
// TOOL HANDLER PATTERN (Task 2)
// ============================================================

async function mdselIndexHandler(
  args: z.infer<typeof MdselIndexInputSchema>,
  extra: { signal?: AbortSignal }
) {
  // Extract validated input
  const { files } = args;

  // Delegate to executor (already configured for TEXT output)
  const result: ExecutorResult = await executeMdsel('index', files);

  // Return pass-through result (thin wrapper doctrine)
  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel index command failed'
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: 'text',
      text: result.stdout  // Pass through unchanged
    }]
  };
}

// GOTCHA: Return errors in result object, don't throw
// GOTCHA: Don't parse or transform stdout - pass through unchanged
// GOTCHA: result.success is false when exitCode is non-zero

// ============================================================
// TOOL REGISTRATION PATTERN (Task 3)
// ============================================================

server.registerTool(
  'mdsel_index',
  {
    description: 'Return a selector inventory for Markdown documents.',
    inputSchema: MdselIndexInputSchema,
    annotations: {
      readOnlyHint: true,  // Tool doesn't modify files
      destructiveHint: false,
      idempotentHint: true,  // Same result for same input
      openWorldHint: false
    }
  },
  mdselIndexHandler
);

// GOTCHA: Use registerTool(), not deprecated server.tool()
// GOTCHA: Tool name must be 'mdsel_index' (exact string)
// GOTCHA: Pass schema object directly, not wrapped in another object

// ============================================================
// COMPLETE IMPLEMENTATION (Tasks 1-3 combined)
// ============================================================

import { z } from 'zod';
import { executeMdsel } from '../executor.js';
import { server } from '../index.js';

// Zod schema for input validation
const MdselIndexInputSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Tool handler function
async function mdselIndexHandler(
  args: z.infer<typeof MdselIndexInputSchema>
) {
  const { files } = args;
  const result = await executeMdsel('index', files);

  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel index command failed'
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: 'text',
      text: result.stdout
    }]
  };
}

// Register tool with MCP server
server.registerTool(
  'mdsel_index',
  {
    description: 'Return a selector inventory for Markdown documents. Lists all available selectors (headings, code blocks, etc.) in hierarchical TEXT format.',
    inputSchema: MdselIndexInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  mdselIndexHandler
);

// ============================================================
// TEST FILE SETUP PATTERN (Task 4)
// ============================================================

// src/tools/index.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('../executor.js', () => ({
  executeMdsel: vi.fn()
}));

import { executeMdsel } from '../executor.js';
import '../index.js';  // This registers the tool

// GOTCHA: Import index.ts to execute tool registration
// GOTCHA: Mock must be defined before importing executor

// ============================================================
// TEST SUITE PATTERN - REGISTRATION (Task 5)
// ============================================================

describe('mdsel_index Tool Registration', () => {
  let client: Client;
  let server: McpServer;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create linked transports for in-process communication
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Create client
    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    // Get server instance (already created in index.ts)
    // Note: In real implementation, you'd export server or create test instance

    await client.connect(clientTransport);
    // await server.connect(serverTransport);  // Server already connected in index.ts
  });

  afterEach(async () => {
    await client.close();
    // Server cleanup would go here
    vi.clearAllMocks();
  });

  it('should list the registered tool', async () => {
    const { tools } = await client.listTools();

    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('mdsel_index');
  });

  it('should have correct input schema', async () => {
    const { tools } = await client.listTools();
    const tool = tools[0];

    expect(tool.inputSchema.properties).toHaveProperty('files');
    expect(tool.inputSchema.required).toContain('files');
  });
});

// GOTCHA: Use InMemoryTransport.createLinkedPair() for same-process testing
// GOTCHA: Server is already connected in index.ts - may need to adjust for tests

// ============================================================
// TEST SUITE PATTERN - SUCCESS PATH (Task 6)
// ============================================================

describe('mdsel_index Tool Execution - Success', () => {
  beforeEach(() => {
    // Mock successful executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: 'h1.0 Main Title\n h2.0 Section One\n---\ncode:1 para:5\n',
      stderr: '',
      exitCode: 0
    });
  });

  it('should execute tool successfully', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('h1.0 Main Title');
  });

  it('should call executeMdsel with correct arguments', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['test.md']);
  });

  it('should handle multiple files', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md', 'GUIDE.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['README.md', 'GUIDE.md']);
  });
});

// GOTCHA: Use vi.mocked(executeMdsel) for type-safe access
// GOTCHA: Verify exact arguments passed to executeMdsel

// ============================================================
// TEST SUITE PATTERN - ERROR PATH (Task 7)
// ============================================================

describe('mdsel_index Tool Execution - Error', () => {
  beforeEach(() => {
    // Mock failed executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '!FILE_NOT_FOUND: File not found: missing.md',
      exitCode: 1
    });
  });

  it('should handle execution errors', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['missing.md'] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('FILE_NOT_FOUND');
  });

  it('should return stderr in content text on error', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['nonexistent.md'] }
    });

    expect(result.content[0].text).toContain('File not found');
  });
});

// GOTCHA: Error is returned in result object, not thrown
// GOTCHA: isError flag should be true on failure
```

### Integration Points

```yaml
SRC/INDEX.TS:
  - verified: Exports server instance for tool registration
  - integration: Import server from '../index.js'
  - gotcha: Don't create new Server instance - use exported one

SRC/EXECUTOR.TS:
  - verified: executeMdsel function handles 'index' command
  - verified: Returns ExecutorResult with success, stdout, stderr, exitCode
  - verified: Uses TEXT output mode (no --json flag)
  - integration: Import executeMdsel from '../executor.js'
  - gotcha: Already configured correctly - just call it

VITEST.CONFIG.TS:
  - verified: test.include: ['src/**/*.{test,spec}.{js,ts}']
  - integration: src/tools/index.test.ts will be picked up automatically
  - no changes needed

PACKAGE.JSON:
  - verified: "type": "module" for ESM
  - verified: zod is in dependencies
  - verified: @modelcontextprotocol/sdk is in dependencies
  - no changes needed

P1.M3.T2 (NEXT TASK):
  - will create src/tools/select.ts for mdsel_select tool
  - will follow same pattern as this task
  - integration: Both tools register to same server instance

BUILD OUTPUT:
  - npm run build will compile src/tools/index.ts to dist/tools/index.js
  - dist/tools/index.d.ts will contain type declarations
  - Tool will be registered when server starts
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing src/tools/index.ts implementation
npm run build

# Expected Output:
# > mdsel-claude@1.0.0 build
# > tsup
# CLI Building entry: src/index.ts
# CLI Building entry: src/executor.ts
# CLI Building entry: src/tools/index.ts
# CLI dist/index.js   2.50 KB
# CLI dist/executor.js   1.80 KB
# CLI dist/tools/index.js   1.50 KB
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/tools/index.js generated successfully
# - dist/tools/index.d.ts generated successfully
# - No import errors (check .js extensions are used)

# Verify generated type definitions:
cat dist/tools/index.d.ts

# Expected: Should contain exports for schema and handler
# export declare const MdselIndexInputSchema: z.ZodObject<...>
# export declare function mdselIndexHandler(...)

# If errors occur:
# - Check all imports use .js extensions
# - Check executeMdsel import path is correct
# - Check server import path is correct
# - Read TypeScript error messages carefully
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test tool implementation
npm test tools

# Expected Output:
# > mdsel-claude@1.0.0 test
# > vitest run
#
# ✓ src/tools/index.test.ts (8)
#   ✓ mdsel_index Tool Registration (2)
#     ✓ should list the registered tool
#     ✓ should have correct input schema
#   ✓ mdsel_index Tool Execution - Success (3)
#     ✓ should execute tool successfully
#     ✓ should call executeMdsel with correct arguments
#     ✓ should handle multiple files
#   ✓ mdsel_index Tool Execution - Error (2)
#     ✓ should handle execution errors
#     ✓ should return stderr in content text on error
#
# Test Files  1 passed (1)
# Tests  7 passed (7)

# Full test suite:
npm test

# Expected: All tests pass, including new tool tests

# If tests fail:
# - Check vi.mock() is at top level before imports
# - Check mock returns proper ExecutorResult structure
# - Check InMemoryTransport setup is correct
# - Verify tool is registered before client.listTools() call
# - Check args.files parameter access in handler

# Debug failing tests:
npm test tools --reporter=verbose

# Watch mode for iterative development:
npm test -- --watch tools
```

### Level 3: Integration Testing (System Validation)

```bash
# Test with MCP Inspector (optional but recommended)
# This requires manual server startup and inspector connection

# First, build the project:
npm run build

# Start the server (will block waiting for stdin):
node dist/index.js

# In another terminal, run MCP Inspector:
npx @modelcontextprotocol/inspector node dist/index.js

# In Inspector UI:
# 1. Check that mdsel_index tool appears in tools list
# 2. Click on mdsel_index tool
# 3. Enter test parameters: { "files": ["README.md"] }
# 4. Click "Call Tool"
# 5. Verify output contains heading hierarchy

# Expected Output Example:
# h1.0 mdsel
#  h2.0 Installation
#  h2.1 Quick Start
# ---
# code:15 para:18 list:3

# If inspector fails:
# - Verify server starts without errors
# - Check tool is registered (no console errors on startup)
# - Verify README.md exists in project root
# - Check executeMdsel can be called (mdsel must be installed)

# Manual test with echo (stdio test):
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js

# Expected: JSON response with tools list containing mdsel_index
# {"jsonrpc":"2.0","result":{"tools":[{"name":"mdsel_index",...}}],"id":1}
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check ESM imports use .js extensions:
grep -n "import.*from" src/tools/index.ts

# Expected: All imports end with .js
# import { z } from 'zod';
# import { executeMdsel } from '../executor.js';
# import { server } from '../index.js';

# 2. Check tool registration uses registerTool:
grep -n "registerTool" src/tools/index.ts

# Expected: server.registerTool('mdsel_index', ...)

# 3. Check input schema is defined:
grep -n "MdselIndexInputSchema" src/tools/index.ts

# Expected: const MdselIndexInputSchema = z.object({...})

# 4. Check handler calls executeMdsel:
grep -n "executeMdsel" src/tools/index.ts

# Expected: const result = await executeMdsel('index', files);

# 5. Verify no transformation of stdout:
grep -n "stdout" src/tools/index.ts

# Expected: text: result.stdout (pass-through, no parsing)

# 6. Check error handling returns isError flag:
grep -n "isError" src/tools/index.ts

# Expected: isError: true (on error path)

# 7. Verify test file has vi.mock at top level:
head -n 15 src/tools/index.test.ts | grep vi.mock

# Expected: vi.mock('../executor.js', ...)

# 8. Check test uses InMemoryTransport:
grep -n "InMemoryTransport" src/tools/index.test.ts

# Expected: InMemoryTransport.createLinkedPair()
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/tools/index.js and dist/tools/index.d.ts generated successfully
- [ ] MdselIndexInputSchema exported in dist/tools/index.d.ts
- [ ] mdselIndexHandler exported in dist/tools/index.d.ts
- [ ] All imports use `.js` extensions (ESM requirement verified)
- [ ] Level 2 validation passed: `npm test tools` shows all tests passing
- [ ] Mock setup uses vi.mock() correctly at top level
- [ ] Tests verify tool registration via client.listTools()
- [ ] Tests verify success path with mocked executor
- [ ] Tests verify error path with mocked executor
- [ ] Level 3 validation passed: MCP Inspector shows mdsel_index tool

### Feature Validation

- [ ] Tool name is exactly 'mdsel_index'
- [ ] Tool accepts `files: string[]` parameter
- [ ] Zod schema uses `z.array(z.string()).min(1)`
- [ ] Tool handler calls `executeMdsel('index', files)`
- [ ] Success returns TEXT output in `content[0].text`
- [ ] Success does NOT set `isError` flag
- [ ] Failure returns stderr in `content[0].text` with `isError: true`
- [ ] Output is passed through unchanged (no parsing/transformation)
- [ ] Tool registration uses `server.registerTool()`
- [ ] Tool description explains purpose clearly

### Code Quality Validation

- [ ] Follows ESM import pattern with `.js` extensions
- [ ] Imports server from index.ts (doesn't create new instance)
- [ ] Imports executeMdsel from executor.ts (doesn't reimplement)
- [ ] Handler function is async
- [ ] Error handling returns errors, doesn't throw
- [ ] Type annotations are correct (TypeScript strict mode)
- [ ] Zod schema is properly defined and exported
- [ ] Test file uses vi.mock() correctly before imports
- [ ] Tests cover registration, success, and error paths
- [ ] Tests use InMemoryTransport for integration testing

### Integration Readiness

- [ ] executeMdsel can be imported from executor module
- [ ] server instance can be imported from index module
- [ ] Tool is registered when server starts
- [ ] No dependencies on P1.M3.T2 (mdsel_select) components
- [ ] Ready for P1.M3.T2 (mdsel_select tool implementation)
- [ ] Test coverage sufficient for regression prevention
- [ ] Tool works with MCP Inspector for manual testing

---

## Anti-Patterns to Avoid

- [ ] Don't use `server.tool()` - it's deprecated. Use `server.registerTool()`
- [ ] Don't import executor without `.js` extension - must use `../executor.js`
- [ ] Don't create new Server instance - import from `../index.js`
- [ ] Don't throw errors for tool failures - return `{ isError: true }`
- [ ] Don't parse or transform stdout - pass through unchanged
- [ ] Don't add `--json` flag to mdsel command - executor already configured for TEXT
- [ ] Don't forget `.min(1)` on files array - empty array should be rejected
- [ ] Don't put `vi.mock()` inside describe block - must be at top level
- [ ] Don't import executor before `vi.mock()` - causes reference to real module
- [ ] Don't use real child_process in tests - mock executeMdsel instead
- [ ] Don't forget to export schema - needed for testing and type safety
- [ ] Don't use sync functions - handler must be async
- [ ] Don't set `isError: false` on success - omit the property entirely

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete mdsel CLI documentation with TEXT output format
- Exact MCP tool registration API with working examples
- Existing executor to delegate to (no reimplementation needed)
- Comprehensive test patterns with InMemoryTransport
- All gotchas documented with correct/incorrect examples
- Integration points clearly defined
- Validation gates are deterministic and checkable

**Expected Implementation Time**: ~45-60 minutes for a developer familiar with TypeScript and MCP SDK

**Risk Factors**:
- MCP SDK API complexity (mitigated: complete examples provided)
- ESM .js extension requirement (mitigated: explicit patterns documented)
- Test setup with InMemoryTransport (mitigated: complete test suite provided)
- Tool registration timing (mitigated: import pattern documented)

**Post-Implementation**:
- `mdsel_index` tool will be registered and callable via MCP
- P1.M3.T2 (mdsel_select) can follow same pattern
- P1.M3.T3.S2 will add integration tests for complete server
- Agent will be able to discover selectors in Markdown documents
- Token-efficient content access workflow will be enabled
