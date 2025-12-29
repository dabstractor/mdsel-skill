name: "P1.M3.T2: Implement mdsel_select Tool"
description: |

---

## Goal

**Feature Goal**: Implement the `mdsel_select` MCP tool that retrieves content from Markdown documents using declarative selectors by invoking the `mdsel select` CLI command.

**Deliverable**: A complete `src/tools/select.ts` file containing:
- Zod schema for `mdsel_select` input validation (selector and files parameters)
- MCP tool registration using low-level `Server.setRequestHandler()` API
- Tool handler that delegates to `executeMdsel('select', [selector, ...files])` from P1.M2.T2
- Pass-through of mdsel TEXT output unchanged (thin wrapper doctrine)
- Complete unit tests in `src/tools/select.test.ts`

**Success Definition**:
- Tool is registered with MCP server under name `mdsel_select`
- Tool accepts `selector: string` and `files: string[]` parameters
- Tool invokes `executeMdsel('select', [selector, ...files])` correctly
- Tool returns TEXT output from mdsel unchanged in `content[0].text`
- Tool sets `isError: true` when mdsel exits with non-zero code
- All tests pass (tool registration, success path, error path, input validation)

## User Persona

**Target User**: Claude Code agents and users who need to retrieve specific sections of Markdown documents using selectors discovered via `mdsel_index`.

**Use Case**: After discovering available selectors via `mdsel_index`, the agent retrieves specific content sections (headings, code blocks, paragraphs) using selectors without loading the entire file.

**User Journey**:
1. Agent has already called `mdsel_index` to discover available selectors
2. Agent identifies relevant selector (e.g., `h2.0` for first h2 heading)
3. Agent invokes `mdsel_select` tool with selector and file path
4. Tool returns selected content in TEXT format
5. Agent avoids loading entire file into context, saving tokens

**Pain Points Addressed**:
- Enables selective content retrieval (only what's needed)
- Provides token-efficient alternative to reading full files
- Returns content directly without parsing or transformation
- Follows PRD "thin wrapper" doctrine - no interpretation of mdsel output

## Why

- **Complements P1.M3.T1**: `mdsel_select` completes the two-step workflow (index then select)
- **Primary Use Case**: PRD specifies that select is the main content retrieval mechanism
- **Token Efficiency**: Returns only selected content instead of entire files
- **Deterministic Output**: Selector-based retrieval is consistent and reproducible
- **Existing Infrastructure**: Builds on `executeMdsel()` from P1.M2.T2

## What

Implement the `mdsel_select` MCP tool that retrieves Markdown content using declarative selectors.

### Core Implementation

1. **Zod Schema Definition** (P1.M3.T2.S1):
   - Define input schema with `selector: z.string().min(1)` and `files: z.array(z.string()).min(1)`
   - Selector must be non-empty string
   - Files must be non-empty array of strings
   - Export schema for testing reuse

2. **Tool Handler Implementation** (P1.M3.T2.S2):
   - Import `executeMdsel` from `../executor.js`
   - Import `server` from `../index.js` (MCP server instance)
   - Register tool using `server.setRequestHandler(CallToolRequestSchema, ...)`
   - Handler calls `executeMdsel('select', [selector, ...files])`
   - Return `{ content: [{ type: 'text', text: result.stdout }], isError: !result.success }`
   - **No transformation** of mdsel output (thin wrapper doctrine)

3. **Unit Tests** (P1.M3.T2.S3):
   - Test tool registration via `client.listTools()`
   - Test success path (mock executor returning success)
   - Test error path (mock executor returning failure)
   - Test input validation (empty selector, empty files array rejection)
   - Use `InMemoryTransport` for integration testing

### Success Criteria

- [ ] `src/tools/select.ts` created with mdsel_select tool
- [ ] Zod schema defines `selector: z.string().min(1)` and `files: z.array(z.string()).min(1)`
- [ ] Tool registered with name `mdsel_select`
- [ ] Tool handler calls `executeMdsel('select', [selector, ...files])`
- [ ] Success returns TEXT output in `content[0].text` with `isError: undefined`
- [ ] Failure returns stderr in `content[0].text` with `isError: true`
- [ ] No transformation of mdsel output (pass-through)
- [ ] `src/tools/select.test.ts` created with all tests passing
- [ ] Tests verify tool registration, success, error, and validation paths

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: YES - This PRP provides:
- Complete mdsel CLI documentation for select command with selector syntax
- Exact MCP tool registration API with Zod schema examples from mdsel_index
- Existing executor pattern from P1.M2.T2 to delegate to
- Complete test patterns with Vitest and InMemoryTransport from mdsel_index
- File placement and naming conventions from codebase
- Validation commands that work in this project

### Documentation & References

```yaml
# MUST READ - mdsel CLI Select Command Documentation

- docfile: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Complete mdsel CLI documentation including select command syntax
  section: Lines 606-654 describe mdsel select command, arguments, and options
  critical: mdsel select accepts <selector> [files...] arguments - selector comes first

- docfile: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Selector syntax reference for tool description
  section: Lines 548-604 show selector syntax (h1.0, h2.1-3, code.0, etc.)
  critical: Selector syntax examples: h1.0, h2.0/code.0, h2.1-3, namespace::h2.0

- docfile: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Select command output format
  section: Lines 448-467 show example mdsel select output (TEXT format)
  critical: Select returns content only (no hierarchy, no counts) - just the selected content

- docfile: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Exit codes and error handling for select command
  section: Lines 234-293 show exit codes (0=success, 1=error, 2=usage error)
  critical: TEXT mode errors use !<selector> and ~<suggestion> prefixes

# MUST READ - Existing Implementation Pattern

- file: src/tools/index.ts
  why: Complete reference implementation for mdsel_index tool
  pattern: Use same structure for mdsel_select (schema, handler, registration)
  critical: Follow same low-level API pattern with setRequestHandler, not registerTool

- file: src/tools/index.ts
  why: Zod schema pattern and tool registration approach
  section: Lines 14-19 show Zod schema definition with z.object() and type inference
  critical: Export schema and type for testing reuse

- file: src/tools/index.ts
  why: Tool handler structure and return format
  section: Lines 34-59 show handler with executeMdsel call and error handling
  critical: Return { content: [{ type: 'text', text: result.stdout }], isError?: boolean }

- file: src/tools/index.ts
  why: MCP tool registration using low-level API
  section: Lines 73-128 show setRequestHandler pattern for tools/list and tools/call
  critical: Use same pattern for mdsel_select registration

- file: src/tools/index.test.ts
  why: Complete test suite reference for tool testing
  section: Lines 1-494 show full test structure with fixtures, mocks, and assertions
  critical: Follow same test structure: schema tests, registration tests, success/error paths

# MUST READ - Executor Integration

- file: src/executor.ts
  why: Execute mdsel CLI command - already implemented in P1.M2.T2
  section: Lines 46-99 show executeMdsel function signature and implementation
  critical: executeMdsel('select', [selector, ...files]) - selector first, then files

- file: src/executor.ts
  why: ExecutorResult interface for return type
  section: Lines 14-26 show ExecutorResult interface with success, stdout, stderr, exitCode
  critical: Check result.success for errors, use result.stdout for content

# MUST READ - Testing Patterns

- file: src/tools/index.test.ts
  why: Complete reference test implementation
  section: Lines 1-113 show imports, mocks, and fixture functions
  critical: Use vi.mock('../executor.js') at top level before imports

- file: src/tools/index.test.ts
  why: Zod schema validation test pattern
  section: Lines 119-174 show schema validation tests (happy path, edge cases)
  critical: Test empty selector, empty files array, invalid inputs

- file: src/tools/index.test.ts
  why: Tool registration test pattern
  section: Lines 180-235 show registration tests with client.listTools()
  critical: Verify tool name, description, inputSchema properties

- file: src/tools/index.test.ts
  why: Success path test pattern
  section: Lines 241-341 show success tests with mocked executor
  critical: Mock executeMdsel with success result, verify arguments

- file: src/tools/index.test.ts
  why: Error path test pattern
  section: Lines 347-414 show error tests with mocked executor
  critical: Mock executeMdsel with failure result, verify isError flag

# MUST READ - PRD Requirements

- file: PRD.md
  why: Tool specification and requirements
  section: Lines 94-110 describe mdsel.select tool purpose and behavior
  critical: Tool must invoke mdsel select, return output unchanged, no interpretation

- file: PRD.md
  why: Thin wrapper doctrine - core design principle
  section: Lines 22-34 describe thin wrapper doctrine (transport adapter, not feature layer)
  critical: No transformation of mdsel output - pass through unchanged

- file: PRD.md
  why: Output fidelity requirements
  section: Lines 144-151 specify output must be byte-for-byte identical
  critical: Return stdout unchanged, no parsing, no metadata injection

# MUST READ - Architecture Patterns

- file: plan/docs/architecture/implementation_patterns.md
  why: Tool handler pattern from reference implementation
  section: Lines 69-130 show tool registration pattern with Zod schemas
  critical: Note: This shows deprecated registerTool() - use setRequestHandler instead

- file: plan/docs/architecture/implementation_patterns.md
  why: Error handling pattern
  section: Lines 241-260 show zero-transformation principle
  critical: Pass through exactly as received, no error rewriting
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── dist/
│   ├── index.js                   # MCP server (with shebang)
│   ├── index.d.ts                 # Server type declarations
│   ├── executor.js                # Executor from P1.M2.T2
│   ├── executor.d.ts              # Executor types
│   └── tools/
│       └── index.js               # Compiled mdsel_index tool (P1.M3.T1)
├── src/
│   ├── index.ts                   # MCP server entry point (exports server)
│   ├── executor.ts                # Child process executor (P1.M2.T2)
│   ├── executor.test.ts           # Executor tests
│   └── tools/
│       ├── index.ts               # mdsel_index tool (P1.M3.T1) - REFERENCE
│       └── index.test.ts          # Tool tests - REFERENCE
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md       # MCP SDK and mdsel docs
│   │   ├── implementation_patterns.md  # Code patterns
│   │   └── system_context.md      # System architecture
│   ├── P1M2T2/
│   │   └── PRP.md                 # Executor PRP
│   ├── P1M3T1/
│   │   └── PRP.md                 # mdsel_index PRP - REFERENCE
│   └── P1M3T2/
│       └── PRP.md                 # THIS DOCUMENT
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
│   └── tools/
│       ├── index.js               # mdsel_index tool (existing)
│       ├── index.d.ts             # mdsel_index types
│       ├── select.js              # NEW: Compiled mdsel_select tool
│       └── select.d.ts            # NEW: Tool type declarations
├── src/
│   ├── index.ts                   # UNCHANGED
│   ├── executor.ts                # UNCHANGED
│   ├── executor.test.ts           # UNCHANGED
│   └── tools/
│       ├── index.ts               # mdsel_index tool (existing)
│       ├── index.test.ts          # mdsel_index tests (existing)
│       ├── select.ts              # NEW: mdsel_select tool implementation
│       └── select.test.ts         # NEW: Tool tests
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: Command Argument Order for mdsel select
// mdsel select requires: selector first, then files
// WRONG: executeMdsel('select', files) or executeMdsel('select', [files, selector])
// CORRECT: executeMdsel('select', [selector, ...files])

// CRITICAL: Use Low-Level API, Not registerTool()
// The codebase uses setRequestHandler for tool registration
// WRONG: server.registerTool('mdsel_select', config, handler)
// CORRECT: server.setRequestHandler(CallToolRequestSchema, async (request) => {...})

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
// Don't parse or transform - pass through unchanged

// CRITICAL: Selector Must Be Non-Empty String
// Use z.string().min(1) for selector validation
// WRONG: selector: z.string() (allows empty string)
// CORRECT: selector: z.string().min(1, 'Selector is required')

// CRITICAL: Files Array Must Have At Least One Element
// Use z.array(z.string()).min(1) for files validation
// WRONG: files: z.array(z.string())
// CORRECT: files: z.array(z.string()).min(1, 'At least one file path is required')

// CRITICAL: Tool Naming Convention
// Tool name in registration must match PRD specification
// Use 'mdsel_select' as tool name (not 'mdsel.select' or 'mdsel-select')

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

// CRITICAL: Vitest Mock Module Location
// vi.mock() must be at top level, not inside describe blocks

// CRITICAL: Selector Syntax Examples for Tool Description
// Include common selector patterns in description:
// h1.0, h2.1-3, code.0, h2.0/code.0, namespace::h2.0
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Input Schema - Zod schema for mdsel_select tool parameters
// Defines the contract for tool input validation
// Validated automatically by MCP SDK before handler is called

import { z } from 'zod';

const MdselSelectInputSchema = z.object({
  selector: z.string().min(1, 'Selector is required'),
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type inference from Zod schema (automatic)
type MdselSelectInput = z.infer<typeof MdselSelectInputSchema>;
// Result: { selector: string; files: string[] }
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/tools/select.ts - Import Dependencies and Define Schema
  - CREATE: src/tools/select.ts (new file)
  - IMPORT: z from 'zod'
  - IMPORT: executeMdsel from '../executor.js' (use .js extension)
  - IMPORT: server from '../index.js' (MCP server instance)
  - IMPORT: CallToolRequestSchema, ListToolsRequestSchema from '@modelcontextprotocol/sdk/types.js'
  - DEFINE: MdselSelectInputSchema with selector: z.string().min(1) and files: z.array(z.string()).min(1)
  - EXPORT: MdselSelectInputSchema for testing
  - EXPORT: MdselSelectInput type (via z.infer)
  - NAMING: Use exact schema name as specified
  - PLACEMENT: Top of src/tools/select.ts
  - GOTCHA: Use .js extension in import paths even though source is .ts

Task 2: IMPLEMENT Tool Handler Function
  - CREATE: Async handler function mdselSelectHandler with signature (args: MdselSelectInput)
  - DESTRUCTURE: selector and files from args
  - CALL: await executeMdsel('select', [selector, ...files])
  - CRITICAL: Selector comes first in args array, then spread files
  - RETURN: On success - { content: [{ type: 'text', text: result.stdout }] }
  - RETURN: On failure - { content: [{ type: 'text', text: result.stderr || 'mdsel select command failed' }], isError: true }
  - GOTCHA: Don't transform or parse output - pass through unchanged
  - GOTCHA: Return error in result object, don't throw exception
  - PLACEMENT: After schema definition, before registration

Task 3: DEFINE Tool Schema for tools/list Response
  - CREATE: mdselSelectTool object with name, description, inputSchema
  - SET: name to 'mdsel_select' (exact match)
  - SET: description explaining tool purpose and selector syntax
  - SET: inputSchema.type to 'object'
  - SET: inputSchema.properties.selector with type 'string', description
  - SET: inputSchema.properties.files with type 'array', items type 'string', minItems 1
  - SET: inputSchema.required to ['selector', 'files']
  - NAMING: Tool name must be 'mdsel_select' (exact string)
  - PLACEMENT: After handler function, before registration

Task 4: REGISTER Tool with MCP Server - tools/list Handler
  - MODIFY: Existing tools/list handler (not create new one)
  - FIND: Existing server.setRequestHandler(ListToolsRequestSchema, ...) in src/tools/index.ts
  - UPDATE: Return both mdselIndexTool and mdselSelectTool in tools array
  - GOTCHA: This is a modification to existing handler, not creating a new one
  - PLACEMENT: In src/tools/index.ts, update existing tools/list handler

Task 5: REGISTER Tool with MCP Server - tools/call Handler
  - MODIFY: Existing tools/call handler (not create new one)
  - FIND: Existing server.setRequestHandler(CallToolRequestSchema, ...) in src/tools/index.ts
  - ADD: New if branch for 'mdsel_select' tool name
  - VALIDATE: Input using MdselSelectInputSchema.safeParse(args)
  - CALL: mdselSelectHandler(validationResult.data) on success
  - RETURN: Validation error on schema failure
  - GOTCHA: This is a modification to existing handler, not creating a new one
  - PLACEMENT: In src/tools/index.ts, update existing tools/call handler

Task 6: CREATE src/tools/select.test.ts - Test File Setup
  - CREATE: src/tools/select.test.ts
  - IMPORT: describe, it, expect, vi, beforeEach, afterEach from 'vitest'
  - IMPORT: Client from '@modelcontextprotocol/sdk/client/index.js'
  - IMPORT: Server from '@modelcontextprotocol/sdk/server/index.js'
  - IMPORT: InMemoryTransport from '@modelcontextprotocol/sdk/inMemory.js'
  - IMPORT: z from 'zod'
  - MOCK: vi.mock('../executor.js', () => ({ executeMdsel: vi.fn() }))
  - IMPORT: executeMdsel from '../executor.js' (after mock)
  - IMPORT: mdselSelectHandler, MdselSelectInputSchema from './select.js'
  - GOTCHA: vi.mock() must come before import of mocked module
  - GOTCHA: Use .js extension in all import paths

Task 7: IMPLEMENT Test Suite - Zod Schema Validation Tests
  - DESCRIBE: 'MdselSelectInputSchema' test suite
  - TEST: should validate correct input with selector and files
  - TEST: should validate input with multiple files
  - TEST: should reject empty selector string
  - TEST: should reject missing selector property
  - TEST: should reject empty files array
  - TEST: should reject missing files property
  - MOCK: No mocks needed for schema tests

Task 8: IMPLEMENT Test Suite - Tool Registration Tests
  - DESCRIBE: 'mdsel_select Tool Registration' test suite
  - BEFORE-EACH: Set up InMemoryTransport, client, server connection
  - AFTER-EACH: Close client and server, clear mocks
  - TEST: should list the registered tool (client.listTools())
  - TEST: should have correct tool name (expect(tool.name).toBe('mdsel_select'))
  - TEST: should have tool description
  - TEST: should have correct input schema with selector and files properties
  - TEST: should have selector and files as required properties
  - GOTCHA: Use InMemoryTransport.createLinkedPair() for transport

Task 9: IMPLEMENT Test Suite - Success Path Tests
  - DESCRIBE: 'mdsel_select Tool Execution - Success Path' test suite
  - BEFORE-EACH: Mock executeMdsel to return success result
  - MOCK: executeMdsel.mockResolvedValue({ success: true, stdout: '## Selected Content\n\nContent here\n', stderr: '', exitCode: 0 })
  - TEST: should execute tool successfully (client.callTool())
  - TEST: should call executeMdsel with correct arguments ('select', [selector, ...files])
  - TEST: should return TEXT output in content[0].text
  - TEST: should not set isError flag on success
  - TEST: should handle multiple files (verify selector + multiple files passed)
  - GOTCHA: Use vi.mocked(executeMdsel) for type-safe mock access

Task 10: IMPLEMENT Test Suite - Error Path Tests
  - DESCRIBE: 'mdsel_select Tool Execution - Error Path' test suite
  - BEFORE-EACH: Mock executeMdsel to return failure result
  - MOCK: executeMdsel.mockResolvedValue({ success: false, stdout: '', stderr: '!INVALID_SELECTOR', exitCode: 1 })
  - TEST: should handle execution errors (check result.isError is true)
  - TEST: should return stderr in content text
  - TEST: should call executeMdsel with correct arguments on error
  - TEST: should return error message when stderr is empty
  - GOTCHA: Error should be returned, not thrown

Task 11: IMPLEMENT Test Suite - Input Validation Tests
  - DESCRIBE: 'mdsel_select Tool Execution - Input Validation' test suite
  - BEFORE-EACH: Set up client and server
  - TEST: should reject empty selector string
  - TEST: should reject missing selector property
  - TEST: should reject empty files array
  - TEST: should reject missing files property
  - GOTCHA: Validation happens at MCP layer, check for isError: true

Task 12: BUILD and Validate
  - RUN: npm run build to compile TypeScript
  - VERIFY: dist/tools/select.js and dist/tools/select.d.ts generated
  - RUN: npm test to execute all tests including new tool tests
  - VERIFY: All tests pass
  - VERIFY: Both mdsel_index and mdsel_select tools are registered
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// IMPORT PATTERN (Task 1)
// ============================================================

// src/tools/select.ts

import { z } from 'zod';
import { executeMdsel, ExecutorResult } from '../executor.js';
import { server } from '../index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// GOTCHA: Use .js extension in imports (ESM requirement)
// GOTCHA: Import server from index.ts, don't create new instance
// GOTCHA: Import schemas from SDK for type safety

// ============================================================
// ZOD SCHEMA PATTERN (Task 1)
// ============================================================

/**
 * Zod schema for mdsel_select tool input validation.
 * Requires a non-empty selector string and at least one file path.
 */
export const MdselSelectInputSchema = z.object({
  selector: z.string().min(1, 'Selector is required'),
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type is inferred automatically:
// type MdselSelectInput = { selector: string; files: string[] }

export type MdselSelectInput = z.infer<typeof MdselSelectInputSchema>;

// ============================================================
// TOOL HANDLER PATTERN (Task 2)
// ============================================================

/**
 * Handler for the mdsel_select tool.
 *
 * Retrieves Markdown content using selectors by invoking the mdsel
 * CLI with the 'select' command.
 *
 * @param args - Validated input arguments containing selector and files
 * @returns CallToolResult with TEXT output from mdsel (pass-through)
 */
export async function mdselSelectHandler(
  args: MdselSelectInput
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const { selector, files } = args;

  // CRITICAL: Selector comes first, then spread files
  // Command: mdsel select <selector> [files...]
  const result: ExecutorResult = await executeMdsel('select', [selector, ...files]);

  // Return pass-through result (thin wrapper doctrine)
  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel select command failed'
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
// GOTCHA: Selector must be first argument to executeMdsel

// ============================================================
// TOOL SCHEMA DEFINITION (Task 3)
// ============================================================

// Define the tool schema for tools/list response
const mdselSelectTool = {
  name: 'mdsel_select',
  description: 'Select content from Markdown documents using declarative selectors. Returns selected content in TEXT format. Selector syntax: h1.0 (first h1), h2.1-3 (h2 indices 1-3), code.0 (first code block), h2.0/code.0 (code under h2), namespace::h2.0 (scoped selector). Use mdsel_index first to discover available selectors.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      selector: {
        type: 'string' as const,
        description: 'Declarative selector to identify content (e.g., "h1.0", "h2.1-3", "code.0")'
      },
      files: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Array of Markdown file paths to select from',
        minItems: 1
      }
    },
    required: ['selector', 'files']
  }
};

// GOTCHA: Tool name must be 'mdsel_select' (exact string)
// GOTCHA: Include selector syntax examples in description for discoverability

// ============================================================
// MODIFYING EXISTING REGISTRATION - src/tools/index.ts (Tasks 4-5)
// ============================================================

// In src/tools/index.ts, UPDATE the existing handlers:

// UPDATE tools/list handler (Task 4):
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [mdselIndexTool, mdselSelectTool]  // ADD mdselSelectTool
  };
});

// UPDATE tools/call handler (Task 5):
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handle mdsel_index tool calls (EXISTING)
  if (name === 'mdsel_index') {
    const validationResult = MdselIndexInputSchema.safeParse(args);
    if (!validationResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
        }],
        isError: true
      };
    }
    return mdselIndexHandler(validationResult.data);
  }

  // Handle mdsel_select tool calls (NEW)
  if (name === 'mdsel_select') {
    const validationResult = MdselSelectInputSchema.safeParse(args);
    if (!validationResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
        }],
        isError: true
      };
    }
    return mdselSelectHandler(validationResult.data);
  }

  // Unknown tool (EXISTING)
  return {
    content: [{
      type: 'text',
      text: `Unknown tool: ${name}`
    }],
    isError: true
  };
});

// GOTCHA: Modify existing handlers, don't create new ones
// GOTCHA: Import MdselSelectInputSchema and mdselSelectHandler from './select.js'
// GOTCHA: Add handler for mdsel_select before the "unknown tool" fallback

// ============================================================
// COMPLETE FILE: src/tools/select.ts (Tasks 1-3 combined)
// ============================================================

import { z } from 'zod';
import { executeMdsel } from '../executor.js';
import { server } from '../index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// ============================================================
// ZOD SCHEMA - Input validation for mdsel_select tool
// ============================================================

/**
 * Zod schema for mdsel_select tool input validation.
 * Requires a non-empty selector string and at least one file path.
 */
export const MdselSelectInputSchema = z.object({
  selector: z.string().min(1, 'Selector is required'),
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type inference from Zod schema
export type MdselSelectInput = z.infer<typeof MdselSelectInputSchema>;

// ============================================================
// TOOL HANDLER - mdsel_select implementation
// ============================================================

/**
 * Handler for the mdsel_select tool.
 *
 * Retrieves Markdown content using selectors by invoking the mdsel
 * CLI with the 'select' command.
 *
 * @param args - Validated input arguments containing selector and files
 * @returns CallToolResult with TEXT output from mdsel (pass-through)
 */
export async function mdselSelectHandler(
  args: MdselSelectInput
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const { selector, files } = args;

  // CRITICAL: Selector comes first in args array
  // Command: mdsel select <selector> [files...]
  const result = await executeMdsel('select', [selector, ...files]);

  // Return pass-through result (thin wrapper doctrine)
  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel select command failed'
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

// ============================================================
// TOOL REGISTRATION - Register with MCP Server
// ============================================================

/**
 * Register the mdsel_select tool with the MCP server.
 *
 * NOTE: This exports the tool definition for registration in index.ts.
 * The actual registration happens in src/tools/index.ts to keep
 * all tool registration in one place.
 */

// Define the tool schema for tools/list response
const mdselSelectTool = {
  name: 'mdsel_select',
  description: 'Select content from Markdown documents using declarative selectors. Returns selected content in TEXT format. Selector syntax: h1.0 (first h1), h2.1-3 (h2 indices 1-3), code.0 (first code block), h2.0/code.0 (code under h2), namespace::h2.0 (scoped selector). Use mdsel_index first to discover available selectors.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      selector: {
        type: 'string' as const,
        description: 'Declarative selector to identify content (e.g., "h1.0", "h2.1-3", "code.0")'
      },
      files: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Array of Markdown file paths to select from',
        minItems: 1
      }
    },
    required: ['selector', 'files']
  }
};

// Export tool definition for registration in index.ts
export { mdselSelectTool };

// ============================================================
// UPDATED FILE: src/tools/index.ts (showing modifications)
// ============================================================

// ADD these imports at top:
import { MdselSelectInputSchema, mdselSelectHandler, mdselSelectTool } from './select.js';

// UPDATE tools/list handler (add mdselSelectTool):
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [mdselIndexTool, mdselSelectTool]  // ADD mdselSelectTool here
  };
});

// UPDATE tools/call handler (add mdsel_select branch):
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handle mdsel_index tool calls (EXISTING - unchanged)
  if (name === 'mdsel_index') {
    const validationResult = MdselIndexInputSchema.safeParse(args);
    if (!validationResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
        }],
        isError: true
      };
    }
    return mdselIndexHandler(validationResult.data);
  }

  // Handle mdsel_select tool calls (NEW)
  if (name === 'mdsel_select') {
    const validationResult = MdselSelectInputSchema.safeParse(args);
    if (!validationResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
        }],
        isError: true
      };
    }
    return mdselSelectHandler(validationResult.data);
  }

  // Unknown tool (EXISTING - unchanged)
  return {
    content: [{
      type: 'text',
      text: `Unknown tool: ${name}`
    }],
    isError: true
  };
});

// ============================================================
// TEST FILE SETUP PATTERN (Task 6)
// ============================================================

// src/tools/select.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('../executor.js', () => ({
  executeMdsel: vi.fn()
}));

import { executeMdsel } from '../executor.js';
import { mdselSelectHandler, MdselSelectInputSchema } from './select.js';

// GOTCHA: Import select.ts to execute any registrations
// GOTCHA: Mock must be defined before importing executor

// ============================================================
// FIXTURES (reference from index.test.ts)
// ============================================================

async function createTestServer() {
  const server = new Server(
    {
      name: 'mdsel-claude-test',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const { CallToolRequestSchema, ListToolsRequestSchema } = await import('@modelcontextprotocol/sdk/types.js');

  // Define tool schemas
  const mdselSelectTool = {
    name: 'mdsel_select',
    description: 'Select content from Markdown documents using declarative selectors.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        selector: {
          type: 'string' as const,
          description: 'Declarative selector to identify content'
        },
        files: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Array of Markdown file paths to select from',
          minItems: 1
        }
      },
      required: ['selector', 'files']
    }
  };

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [mdselSelectTool]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'mdsel_select') {
      const validationResult = MdselSelectInputSchema.safeParse(args);
      if (!validationResult.success) {
        return {
          content: [{
            type: 'text',
            text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
          }],
          isError: true
        };
      }
      return mdselSelectHandler(validationResult.data);
    }

    return {
      content: [{
        type: 'text',
        text: `Unknown tool: ${name}`
      }],
      isError: true
    };
  });

  return server;
}

async function createConnectedClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const server = await createTestServer();
  await server.connect(serverTransport);

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(clientTransport);

  return { client, server };
}

// ============================================================
// TEST SUITE PATTERN - ZOD SCHEMA (Task 7)
// ============================================================

describe('MdselSelectInputSchema', () => {
  it('should validate correct input with selector and files', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0',
      files: ['README.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('h2.0');
      expect(result.data.files).toEqual(['README.md']);
    }
  });

  it('should validate input with multiple files', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h1.0',
      files: ['README.md', 'GUIDE.md', 'docs/API.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toHaveLength(3);
    }
  });

  it('should reject empty selector string', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: '',
      files: ['README.md']
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Selector is required');
    }
  });

  it('should reject missing selector property', () => {
    const result = MdselSelectInputSchema.safeParse({
      files: ['README.md']
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty files array', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0',
      files: []
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('At least one file path');
    }
  });

  it('should reject missing files property', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0'
    });

    expect(result.success).toBe(false);
  });
});

// ============================================================
// TEST SUITE PATTERN - SUCCESS PATH (Task 9)
// ============================================================

describe('mdsel_select Tool Execution - Success Path', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;

    // Mock successful executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: '## Installation\n\n```bash\nnpm install -g mdsel\n```\n',
      stderr: '',
      exitCode: 0
    });
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should execute tool successfully', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe('text');
  });

  it('should call executeMdsel with correct arguments', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['README.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h2.0', 'README.md']);
  });

  it('should call executeMdsel with select command', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalled();
    const callArgs = vi.mocked(executeMdsel).mock.calls[0];
    expect(callArgs[0]).toBe('select');
  });

  it('should handle multiple files', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['README.md', 'GUIDE.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h1.0', 'README.md', 'GUIDE.md']);
  });

  it('should pass through stdout unchanged (no transformation)', async () => {
    const expectedOutput = '## Test Heading\n\nContent here\n';
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: expectedOutput,
      stderr: '',
      exitCode: 0
    });

    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['test.md'] }
    });

    expect(result.content[0].text).toBe(expectedOutput);
  });

  it('should not set isError flag on success', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
  });
});

// GOTCHA: Use vi.mocked(executeMdsel) for type-safe access
// GOTCHA: Verify selector comes first in executeMdsel arguments
// GOTCHA: Verify all files are spread after selector

// ============================================================
// TEST SUITE PATTERN - ERROR PATH (Task 10)
// ============================================================

describe('mdsel_select Tool Execution - Error Path', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;

    // Mock failed executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '!h2.99\nIndex out of range: document has 3 h2 headings\n~h2.0 ~h2.1 ~h2.2',
      exitCode: 1
    });
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should handle execution errors with isError flag', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['README.md'] }
    });

    expect(result.isError).toBe(true);
  });

  it('should return stderr in content text on error', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['README.md'] }
    });

    expect(result.content[0].text).toContain('Index out of range');
  });

  it('should call executeMdsel even on error path', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h2.99', 'test.md']);
  });

  it('should return error message when stderr is empty', async () => {
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '',
      exitCode: 1
    });

    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['test.md'] }
    });

    expect(result.content[0].text).toContain('mdsel select command failed');
    expect(result.isError).toBe(true);
  });
});

// GOTCHA: Error is returned in result object, not thrown
// GOTCHA: isError flag should be true on failure
// GOTCHA: Verify selector still passed correctly even on error
```

### Integration Points

```yaml
SRC/TOOLS/INDEX.TS:
  - action: Modify existing tools/list handler to include mdselSelectTool
  - action: Modify existing tools/call handler to handle 'mdsel_select' name
  - import: Add import for MdselSelectInputSchema, mdselSelectHandler, mdselSelectTool from './select.js'
  - integration: Both tools registered to same server instance
  - gotcha: This is a modification to existing handlers, not creating new ones

SRC/EXECUTOR.TS:
  - verified: executeMdsel function handles 'select' command
  - verified: Returns ExecutorResult with success, stdout, stderr, exitCode
  - verified: Uses TEXT output mode (no --json flag)
  - integration: Import executeMdsel from '../executor.js'
  - gotcha: Command is 'select', args array is [selector, ...files]

SRC/INDEX.TS:
  - verified: Exports server instance for tool registration
  - integration: Import server from '../index.js'
  - gotcha: Don't create new Server instance - use exported one

VITEST.CONFIG.TS:
  - verified: test.include: ['src/**/*.{test,spec}.{js,ts}']
  - integration: src/tools/select.test.ts will be picked up automatically
  - no changes needed

PACKAGE.JSON:
  - verified: "type": "module" for ESM
  - verified: zod is in dependencies
  - verified: @modelcontextprotocol/sdk is in dependencies
  - no changes needed

P1.M3.T3 (NEXT TASK):
  - will add integration tests for both tools together
  - will verify both tools registered in same server
  - integration: Both tools accessible from same MCP server
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing src/tools/select.ts implementation
npm run build

# Expected Output:
# > mdsel-claude@1.0.0 build
# > tsup
# CLI Building entry: src/index.ts
# CLI Building entry: src/executor.ts
# CLI Building entry: src/tools/index.ts
# CLI Building entry: src/tools/select.ts
# CLI dist/index.js   2.50 KB
# CLI dist/executor.js   1.80 KB
# CLI dist/tools/index.js   1.50 KB
# CLI dist/tools/select.js   1.50 KB
# CLI Success in 234ms

# Validation Checks:
# - Zero TypeScript compilation errors
# - dist/tools/select.js generated successfully
# - dist/tools/select.d.ts generated successfully
# - No import errors (check .js extensions are used)

# Verify generated type definitions:
cat dist/tools/select.d.ts

# Expected: Should contain exports for schema and handler
# export declare const MdselSelectInputSchema: z.ZodObject<...>
# export declare type MdselSelectInput = ...
# export declare function mdselSelectHandler(...)
# export declare const mdselSelectTool: {...}

# If errors occur:
# - Check all imports use .js extensions
# - Check executeMdsel import path is correct
# - Check server import path is correct
# - Check SDK types import is correct
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
# ✓ src/tools/select.test.ts (10)
#   ✓ MdselSelectInputSchema (6)
#     ✓ should validate correct input with selector and files
#     ✓ should validate input with multiple files
#     ✓ should reject empty selector string
#     ✓ should reject missing selector property
#     ✓ should reject empty files array
#     ✓ should reject missing files property
#   ✓ mdsel_select Tool Registration (5)
#     ✓ should list the registered tool
#     ✓ should have correct tool name
#     ✓ should have tool description
#     ✓ should have correct input schema
#     ✓ should have selector and files as required
#   ✓ mdsel_select Tool Execution - Success Path (6)
#     ✓ should execute tool successfully
#     ✓ should call executeMdsel with correct arguments
#     ✓ should call executeMdsel with select command
#     ✓ should handle multiple files
#     ✓ should pass through stdout unchanged
#     ✓ should not set isError flag on success
#   ✓ mdsel_select Tool Execution - Error Path (4)
#     ✓ should handle execution errors with isError flag
#     ✓ should return stderr in content text on error
#     ✓ should call executeMdsel even on error path
#     ✓ should return error message when stderr is empty
#   ✓ mdsel_select Tool Execution - Input Validation (4)
#     ✓ should reject empty selector string
#     ✓ should reject missing selector property
#     ✓ should reject empty files array
#     ✓ should reject missing files property
#
# Test Files  2 passed (2)  # index.test.ts and select.test.ts
# Tests  22 passed (22)

# Full test suite:
npm test

# Expected: All tests pass, including new and existing tool tests

# If tests fail:
# - Check vi.mock() is at top level before imports
# - Check mock returns proper ExecutorResult structure
# - Check InMemoryTransport setup is correct
# - Verify selector comes first in executeMdsel arguments
# - Check args.selector and args.files parameter access in handler
# - Verify both tools are registered in index.ts

# Debug failing tests:
npm test tools --reporter=verbose

# Watch mode for iterative development:
npm test -- --watch tools
```

### Level 3: Integration Testing (System Validation)

```bash
# Test with MCP Inspector (optional but recommended)

# First, build the project:
npm run build

# Start the server (will block waiting for stdin):
node dist/index.js

# In another terminal, run MCP Inspector:
npx @modelcontextprotocol/inspector node dist/index.js

# In Inspector UI:
# 1. Check that BOTH mdsel_index and mdsel_select tools appear in tools list
# 2. Click on mdsel_select tool
# 3. Enter test parameters: { "selector": "h1.0", "files": ["README.md"] }
# 4. Click "Call Tool"
# 5. Verify output contains selected content (not full hierarchy)

# Expected Output Example (for h1.0 selector):
# mdsel
#
# Main heading content...

# If inspector fails:
# - Verify server starts without errors
# - Check both tools are registered (no console errors on startup)
# - Verify README.md exists in project root
# - Check executeMdsel can be called (mdsel must be installed)
# - Verify both tools appear in tools/list response

# Manual test with echo (stdio test):
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js

# Expected: JSON response with tools list containing BOTH mdsel_index and mdsel_select
# {"jsonrpc":"2.0","result":{"tools":[
#   {"name":"mdsel_index",...},
#   {"name":"mdsel_select",...}
# ]},"id":1}
```

### Level 4: Code Quality & Pattern Validation

```bash
# Verify code follows project patterns:

# 1. Check ESM imports use .js extensions:
grep -n "import.*from" src/tools/select.ts

# Expected: All imports end with .js
# import { z } from 'zod';
# import { executeMdsel } from '../executor.js';
# import { server } from '../index.js';

# 2. Check tool schema is defined:
grep -n "MdselSelectInputSchema" src/tools/select.ts

# Expected: const MdselSelectInputSchema = z.object({...})

# 3. Check handler calls executeMdsel with correct arguments:
grep -n "executeMdsel" src/tools/select.ts

# Expected: const result = await executeMdsel('select', [selector, ...files]);

# 4. Verify selector comes first:
grep -A 2 "executeMdsel('select'" src/tools/select.ts

# Expected: [selector, ...files] - selector first, then spread files

# 5. Verify no transformation of stdout:
grep -n "stdout" src/tools/select.ts

# Expected: text: result.stdout (pass-through, no parsing)

# 6. Check error handling returns isError flag:
grep -n "isError" src/tools/select.ts

# Expected: isError: true (on error path)

# 7. Verify test file has vi.mock at top level:
head -n 15 src/tools/select.test.ts | grep vi.mock

# Expected: vi.mock('../executor.js', ...)

# 8. Check test uses InMemoryTransport:
grep -n "InMemoryTransport" src/tools/select.test.ts

# Expected: InMemoryTransport.createLinkedPair()

# 9. Verify both tools registered in index.ts:
grep -n "tools: \[" src/tools/index.ts

# Expected: tools: [mdselIndexTool, mdselSelectTool]

# 10. Verify handlers for both tools in index.ts:
grep -n "if (name ===" src/tools/index.ts

# Expected:
# if (name === 'mdsel_index')
# if (name === 'mdsel_select')
```

## Final Validation Checklist

### Technical Validation

- [ ] Level 1 validation passed: `npm run build` completes without errors
- [ ] dist/tools/select.js and dist/tools/select.d.ts generated successfully
- [ ] MdselSelectInputSchema exported in dist/tools/select.d.ts
- [ ] MdselSelectInput type exported in dist/tools/select.d.ts
- [ ] mdselSelectHandler exported in dist/tools/select.d.ts
- [ ] mdselSelectTool exported in dist/tools/select.d.ts
- [ ] All imports use `.js` extensions (ESM requirement verified)
- [ ] Level 2 validation passed: `npm test tools` shows all tests passing
- [ ] Mock setup uses vi.mock() correctly at top level
- [ ] Tests verify tool registration via client.listTools()
- [ ] Tests verify success path with mocked executor
- [ ] Tests verify error path with mocked executor
- [ ] Tests verify selector comes first in executeMdsel arguments
- [ ] Level 3 validation passed: MCP Inspector shows both mdsel_index and mdsel_select tools

### Feature Validation

- [ ] Tool name is exactly 'mdsel_select'
- [ ] Tool accepts `selector: string` parameter (non-empty)
- [ ] Tool accepts `files: string[]` parameter (min 1 item)
- [ ] Zod schema uses `z.string().min(1)` for selector
- [ ] Zod schema uses `z.array(z.string()).min(1)` for files
- [ ] Tool handler calls `executeMdsel('select', [selector, ...files])`
- [ ] Selector comes first in executeMdsel arguments
- [ ] Files are spread after selector in executeMdsel arguments
- [ ] Success returns TEXT output in `content[0].text`
- [ ] Success does NOT set `isError` flag
- [ ] Failure returns stderr in `content[0].text` with `isError: true`
- [ ] Output is passed through unchanged (no parsing/transformation)
- [ ] Both tools registered in same server instance
- [ ] Tool description includes selector syntax examples

### Code Quality Validation

- [ ] Follows ESM import pattern with `.js` extensions
- [ ] Imports server from index.ts (doesn't create new instance)
- [ ] Imports executeMdsel from executor.ts (doesn't reimplement)
- [ ] Handler function is async
- [ ] Error handling returns errors, doesn't throw
- [ ] Type annotations are correct (TypeScript strict mode)
- [ ] Zod schema is properly defined and exported
- [ ] Tool exported as mdselSelectTool for registration in index.ts
- [ ] Test file uses vi.mock() correctly before imports
- [ ] Tests cover schema validation, registration, success, error, and input validation
- [ ] Tests use InMemoryTransport for integration testing
- [ ] Tests verify selector comes first in executeMdsel arguments

### Integration Readiness

- [ ] executeMdsel can be imported from executor module
- [ ] server instance can be imported from index module
- [ ] Both tools are registered when server starts
- [ ] src/tools/index.ts modified to register both tools
- [ ] No conflicts between mdsel_index and mdsel_select
- [ ] Ready for P1.M3.T3 (integration tests for complete server)
- [ ] Test coverage sufficient for regression prevention
- [ ] Both tools work with MCP Inspector for manual testing
- [ ] Tool names match PRD specification (mdsel_index, mdsel_select)

---

## Anti-Patterns to Avoid

- [ ] Don't put selector after files in executeMdsel arguments - selector must be first
- [ ] Don't create new Server instance - import from `../index.js`
- [ ] Don't throw errors for tool failures - return `{ isError: true }`
- [ ] Don't parse or transform stdout - pass through unchanged
- [ ] Don't add `--json` flag to mdsel command - executor already configured for TEXT
- [ ] Don't forget `.min(1)` on selector or files array - empty values should be rejected
- [ ] Don't put `vi.mock()` inside describe block - must be at top level
- [ ] Don't import executor before `vi.mock()` - causes reference to real module
- [ ] Don't use real child_process in tests - mock executeMdsel instead
- [ ] Don't forget to export mdselSelectTool - needed for registration in index.ts
- [ ] Don't create new setRequestHandler calls in select.ts - modify existing in index.ts
- [ ] Don't use sync functions - handler must be async
- [ ] Don't set `isError: false` on success - omit the property entirely
- [ ] Don't validate selector syntax - let mdsel CLI handle validation
- [ ] Don't add namespace handling - pass selector directly to mdsel
- [ ] Don't truncate or modify selected content - pass through unchanged

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Reasoning**:
- Complete mdsel CLI documentation for select command with selector syntax
- Exact MCP tool registration API from existing mdsel_index implementation
- Existing executor to delegate to (no reimplementation needed)
- Comprehensive test patterns from mdsel_index with InMemoryTransport
- All gotchas documented with correct/incorrect examples
- Integration points clearly defined (modify existing handlers, not create new)
- Validation gates are deterministic and checkable
- Command argument order explicitly documented (selector first, then files)

**Expected Implementation Time**: ~45-60 minutes for a developer familiar with TypeScript and MCP SDK

**Risk Factors**:
- Command argument order (selector first) - mitigated: explicitly documented with examples
- Modifying existing handlers instead of creating new - mitigated: clear instructions provided
- ESM .js extension requirement - mitigated: explicit patterns documented
- Test setup with InMemoryTransport - mitigated: complete test suite provided
- Tool registration timing - mitigated: import pattern documented

**Post-Implementation**:
- `mdsel_select` tool will be registered and callable via MCP
- Both mdsel_index and mdsel_select tools available from same server
- P1.M3.T3 (integration tests) can verify complete server functionality
- Agent will be able to retrieve specific Markdown content using selectors
- Token-efficient content access workflow will be fully enabled

**Selector Syntax Reference** (for tool description):
- `h1.0` - First h1 heading
- `h2.1-3` - h2 headings at indices 1, 2, 3
- `code.0` - First code block
- `h2.0/code.0` - First code block under first h2
- `namespace::h2.0` - Scoped selector for specific document
