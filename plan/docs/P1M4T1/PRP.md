# PRP: P1.M4.T1 - Create MCP Server Entry Point

---

## Goal

**Feature Goal**: Implement the main MCP server that exposes mdsel_index and mdsel_select tools with behavioral descriptions to condition Claude agents to use selector-based access for Markdown documents.

**Deliverable**: A working MCP server (src/index.ts) that:

- Exposes exactly 2 tools: mdsel_index and mdsel_select
- Uses stdio transport for communication
- Includes behavioral guidance in tool descriptions
- Routes tool calls to existing handler functions
- Can be executed as a CLI binary

**Success Definition**:

- Server starts without errors using stdio transport
- Exactly 2 tools are discoverable via ListTools request
- Tool descriptions include behavioral guidance discouraging Read tool usage
- Tool calls route correctly to handleMdselIndex/handleMdselSelect
- Integration tests verify all success criteria

## User Persona

**Target User**: Claude AI agents via Claude Code

**Use Case**: Claude agents need to access Markdown documents using declarative selectors instead of full-file reads to minimize token usage and improve retrieval precision.

**User Journey**:

1. Agent needs information from a Markdown document
2. Agent calls mdsel_index to discover available selectors
3. Agent uses returned selectors to call mdsel_select for specific content
4. Agent drills down using child selectors as needed

**Pain Points Addressed**:

- Full-file reads waste tokens on large Markdown files
- Default Read tool provides no structural awareness
- No way to discover document structure before reading

## Why

- **Integration**: This server completes P1 (MVP) by connecting the CLI executor (P1.M2) and tool handlers (P1.M3) into a working MCP server
- **Token Efficiency**: Enables selector-based access that returns only needed content
- **Behavioral Conditioning**: Tool descriptions actively discourage misuse of Read tool on large Markdown files
- **Foundation**: Serves as the integration point for future enhancements (word count gating in P2, reminder hooks in P3)

## What

Implement a complete MCP server entry point at src/index.ts that:

### Success Criteria

- [ ] Server exports Server instance for testing
- [ ] Server connects via StdioServerTransport
- [ ] ListTools handler returns exactly 2 tools with proper schemas
- [ ] CallTool handler routes to correct handler functions
- [ ] Tool descriptions include behavioral guidance from plan/docs/architecture/tool_definitions.md
- [ ] package.json includes bin entry pointing to dist/index.mjs
- [ ] dist/index.mjs includes shebang (#!/usr/bin/env node)
- [ ] Integration tests verify server behavior

### Technical Requirements

- Use @modelcontextprotocol/sdk for server implementation
- Import existing handler functions from src/tools/
- Use existing input schemas (MDSEL_INDEX_INPUT_SCHEMA, MDSEL_SELECT_INPUT_SCHEMA)
- Export server for testing
- Use import.meta.main check for production execution

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed?

✅ Yes - This PRP provides:

- Exact file paths to read for patterns
- Specific URLs to MCP SDK documentation
- Complete tool description text
- Existing schemas to reuse
- Test patterns to follow
- Build configuration to match

### Documentation & References

```yaml
# MCP SDK Core Documentation
- url: https://github.com/modelcontextprotocol/sdk-typescript
  why: Official MCP SDK for TypeScript - understand Server, StdioServerTransport, request handlers
  critical: The SDK uses ESM exports - use import { Server } from '@modelcontextprotocol/sdk/server/index.js'

- url: https://spec.modelcontextprotocol.io/specification/server/
  why: MCP server specification - understand ListTools and CallTool request/response formats
  section: Tools section

# Existing Codebase Patterns
- file: src/lib/mdsel-cli.ts
  why: CLI executor pattern - understand process spawning, timeout handling, MdselResult type
  pattern: execMdsel function with timeout, kill signal handling
  gotcha: Uses absolute path to mdsel CLI (/home/dustin/.local/bin/mdsel)

- file: src/tools/mdsel-index.ts
  why: Existing mdsel_index handler - understand input schema, handler signature, CallToolResult format
  pattern: handleMdselIndex function returning { content: [{ type: 'text', text: result.stdout }], isError: !result.success }
  gotcha: Returns stdout verbatim without JSON parsing

- file: src/tools/mdsel-select.ts
  why: Existing mdsel_select handler - understand input schema, handler signature
  pattern: Same CallToolResult format as mdsel-index
  gotcha: Selector passed as first argument after 'select' subcommand

- file: tests/tools/mdsel-index.test.ts
  why: Test pattern for tool handlers - understand mocking, assertions
  pattern: Uses vi.mock for child_process, tests success/error/verbatim cases
  gotcha: Tests verify verbatim passthrough of malformed JSON

- file: tests/tools/mdsel-select.test.ts
  why: Test pattern for tool handlers - understand how to test MCP tool responses
  pattern: Same testing pattern as mdsel-index tests
  gotcha: Tests include edge cases like empty arrays, special characters

# Configuration Files
- file: tsup.config.ts
  why: Build configuration - understand entry points, output format
  pattern: entry: ['src/index.ts', ...], format: ['esm'], target: 'node18'
  gotcha: Must add src/index.ts to entry array if not already present

- file: package.json
  why: Project configuration - understand dependencies, scripts, bin entry
  pattern: "type": "module" for ESM, bin: { "mdsel-claude": "./dist/index.mjs" }
  gotcha: Bin entry must point to built file, not source

# Tool Descriptions (CRITICAL - Must use exact text)
- docfile: plan/docs/architecture/tool_definitions.md
  why: Contains exact behavioral descriptions required for tools
  section: Full tool descriptions section
  critical: Do NOT modify these descriptions - they are carefully crafted to condition AI behavior
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm/
├── src/
│   ├── index.ts                    # Placeholder - REPLACE with MCP server
│   ├── lib/
│   │   └── mdsel-cli.ts           # CLI executor - READ for pattern
│   ├── tools/
│   │   ├── mdsel-index.ts          # mdsel_index handler - IMPORT and USE
│   │   └── mdsel-select.ts        # mdsel_select handler - IMPORT and USE
│   └── types.ts                    # Type definitions
├── tests/
│   ├── lib/
│   │   └── mdsel-cli.test.ts       # CLI executor tests
│   └── tools/
│       ├── mdsel-index.test.ts     # Handler tests - READ for test pattern
│       └── mdsel-select.test.ts   # Handler tests - READ for test pattern
├── plan/
│   └── docs/
│       └── architecture/
│           └── tool_definitions.md # Tool descriptions - MUST USE EXACT TEXT
├── package.json                    # ADD bin entry
├── tsconfig.json
├── tsup.config.ts                 # VERIFY src/index.ts in entry array
└── vitest.config.ts
```

### Desired Codebase Tree (after implementation)

```bash
/home/dustin/projects/mdsel-claude-glm/
├── src/
│   ├── index.ts                    # NEW: MCP server entry point
│   ├── lib/
│   │   └── mdsel-cli.ts           # (existing)
│   ├── tools/
│   │   ├── mdsel-index.ts          # (existing - imported by index.ts)
│   │   └── mdsel-select.ts        # (existing - imported by index.ts)
│   └── types.ts                    # (existing)
├── tests/
│   ├── lib/
│   │   └── mdsel-cli.test.ts       # (existing)
│   ├── tools/
│   │   ├── mdsel-index.test.ts     # (existing)
│   │   └── mdsel-select.test.ts   # (existing)
│   └── integration/
│       └── mcp-server.test.ts      # NEW: MCP server integration tests
├── dist/
│   └── index.mjs                   # BUILT: Output from tsup
├── plan/
│   └── P1M4T1/
│       └── PRP.md                  # This file
├── package.json                    # MODIFIED: Add bin entry
├── tsconfig.json                   # (existing)
├── tsup.config.ts                 # (existing)
└── vitest.config.ts               # (existing)
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: MCP SDK uses ESM exports with .js extensions in imports
// Even though source is .ts, imports must use .js for ESM compatibility
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/transport/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// CRITICAL: Zod schemas use .shape property for MCP inputSchema
// Do NOT pass the Zod object directly - use .shape
const toolDefinition = {
  name: 'mdsel_index',
  description: '...',
  inputSchema: MDSEL_INDEX_INPUT_SCHEMA, // This is already the .shape in src/tools/mdsel-index.ts
};

// GOTCHA: Tool descriptions include newlines and special characters
// Use template literals for multi-line descriptions
const description = `Line 1
Line 2
Line 3`;

// GOTCHA: Server must be exported for testing
// Use conditional execution with import.meta.main
export { server };

if (import.meta.main) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// GOTCHA: Shebang must be first line of built file
// tsup adds this automatically if package.json has "type": "module"
// The built dist/index.mjs will have: #!/usr/bin/env node

// GOTCHA: Vitest globals must be enabled (already configured in vitest.config.ts)
// Allows using describe, it, expect without imports

// GOTCHA: Error handling in CallTool handler
// Return { content: [...], isError: true } for errors
// Do NOT throw - MCP expects error responses in this format
```

## Implementation Blueprint

### Data Models and Structures

No new data models needed - use existing types:

```typescript
// From src/types.ts - reuse existing MdselResult interface
interface MdselResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

// From src/tools/mdsel-index.ts - reuse existing schemas
import { MDSEL_INDEX_INPUT_SCHEMA } from '../tools/mdsel-index.js';
import { MDSEL_SELECT_INPUT_SCHEMA } from '../tools/mdsel-select.js';

// From src/tools/ - reuse existing handlers
import { handleMdselIndex } from '../tools/mdsel-index.js';
import { handleMdselSelect } from '../tools/mdsel-select.js';
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: VERIFY tsup.config.ts includes src/index.ts
  - CHECK: entry array contains 'src/index.ts'
  - FOLLOW pattern: Existing entry array with other files
  - IF NOT PRESENT: Add 'src/index.ts' to entry array
  - PLACEMENT: tsup.config.ts root level entry array

Task 2: IMPLEMENT src/index.ts - MCP Server Entry Point
  - CREATE: Server instance with name='mdsel-claude', version='1.0.0'
  - IMPLEMENT: ListToolsRequestSchema handler returning 2 tools
  - IMPLEMENT: CallToolRequestSchema handler routing to handlers
  - IMPORT: Server, StdioServerTransport, request schemas from @modelcontextprotocol/sdk
  - IMPORT: handleMdselIndex, handleMdselSelect, input schemas from src/tools/
  - FOLLOW pattern: MCP SDK documentation examples
  - NAMING: server variable, exported for testing
  - PLACEMENT: src/index.ts (replaces placeholder)

Task 3: DEFINE TOOL_DEFINITIONS array in src/index.ts
  - CREATE: Array of 2 tool definitions with name, description, inputSchema
  - USE: EXACT descriptions from plan/docs/architecture/tool_definitions.md
  - INCLUDE: mdsel_index and mdsel_select definitions
  - FOLLOW pattern: Tool definition structure from MCP SDK docs
  - GOTCHA: Use template literals for multi-line descriptions
  - PLACEMENT: Top of src/index.ts, after imports

Task 4: IMPLEMENT stdio transport connection in src/index.ts
  - ADD: StdioServerTransport creation inside import.meta.main block
  - ADD: server.connect(transport) call
  - EXPORT: server instance for testing
  - FOLLOW pattern: MCP SDK stdio examples
  - PLACEMENT: Bottom of src/index.ts, after request handlers

Task 5: MODIFY package.json - Add bin entry
  - ADD: bin: { "mdsel-claude": "./dist/index.mjs" } to package.json root
  - VERIFY: "type": "module" is present (already should be)
  - FOLLOW pattern: Other MCP server package.json files
  - GOTCHA: Path points to built file, not source
  - PLACEMENT: package.json root level, alongside "name", "version", etc.

Task 6: VERIFY shebang in dist/index.mjs
  - BUILD: Run npm run build
  - CHECK: dist/index.mjs starts with #!/usr/bin/env node
  - IF NOT PRESENT: May need to add manually or adjust build config
  - GOTCHA: tsup should add this automatically for ESM with "type": "module"

Task 7: CREATE tests/integration/mcp-server.test.ts
  - IMPLEMENT: Test for server initialization
  - IMPLEMENT: Test for ListTools returning exactly 2 tools
  - IMPLEMENT: Test for tool descriptions containing behavioral guidance
  - IMPLEMENT: Test for CallTool routing to correct handlers
  - FOLLOW pattern: tests/tools/*.test.ts structure and mocking
  - NAMING: describe('MCP Server', ...) with nested it(...) tests
  - MOCK: StdioServerTransport to avoid actual communication
  - PLACEMENT: tests/integration/mcp-server.test.ts

Task 8: CREATE tests/integration/ directory (if not exists)
  - CREATE: Directory structure for integration tests
  - PLACEHOLDER: Add .gitkeep if needed
  - PLACEMENT: tests/integration/
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// MCP SERVER PATTERN - src/index.ts
// ============================================================

// Import MCP SDK components
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/transport/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import existing handlers and schemas
import { handleMdselIndex, MDSEL_INDEX_INPUT_SCHEMA } from './tools/mdsel-index.js';
import { handleMdselSelect, MDSEL_SELECT_INPUT_SCHEMA } from './tools/mdsel-select.js';

// ============================================================
// TOOL DEFINITIONS - Use EXACT text from tool_definitions.md
// ============================================================

const TOOL_DESCRIPTIONS = {
  mdsel_index: `Index Markdown documents to discover available selectors. REQUIRED: Call this BEFORE mdsel_select when working with Markdown documents over 200 words. Do NOT use the Read tool for large Markdown files - use mdsel_index first to understand the document structure, then mdsel_select to retrieve specific sections.

Returns: JSON with selector inventory including headings, blocks (paragraphs, code, lists, tables), and word counts for each section.

Selector Grammar:
- namespace::type[index]/path?query
- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table
- Example: readme::heading:h2[0]/block:code[0]`,

  mdsel_select: `Retrieve specific content from Markdown documents using selectors. REQUIRED: Call mdsel_index first to discover available selectors. Do NOT use the Read tool for large Markdown files.

Returns: JSON with matched content and available child selectors for further drilling.

Selector Syntax:
- [namespace::]type[index][/path][?full=true]
- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table, block:blockquote
- Examples:
  - heading:h2[0] - First h2 heading
  - readme::heading:h1[0]/block:code[0] - First code block under first h1 in readme
  - section[1]?full=true - Second section with full content (bypass truncation)

Usage Pattern:
1. mdsel_index to discover selectors
2. mdsel_select with discovered selectors
3. Drill down with child selectors as needed`,
};

// ============================================================
// CREATE SERVER
// ============================================================

const server = new Server(
  {
    name: 'mdsel-claude',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================
// LIST TOOLS HANDLER
// ============================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'mdsel_index',
        description: TOOL_DESCRIPTIONS.mdsel_index,
        inputSchema: MDSEL_INDEX_INPUT_SCHEMA,
      },
      {
        name: 'mdsel_select',
        description: TOOL_DESCRIPTIONS.mdsel_select,
        inputSchema: MDSEL_SELECT_INPUT_SCHEMA,
      },
    ],
  };
});

// ============================================================
// CALL TOOL HANDLER - Route to existing handlers
// ============================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // PATTERN: Route to existing handler functions
  // Do NOT reimplement handler logic here
  switch (name) {
    case 'mdsel_index':
      return await handleMdselIndex(args);
    case 'mdsel_select':
      return await handleMdselSelect(args);
    default:
      // GOTCHA: Return MCP error format, don't throw
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// ============================================================
// EXPORT FOR TESTING
// ============================================================

export { server };

// ============================================================
// PRODUCTION ENTRY POINT
// ============================================================

if (import.meta.main) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

```typescript
// ============================================================
// INTEGRATION TEST PATTERN - tests/integration/mcp-server.test.ts
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { server } from '../../src/index.js';

// PATTERN: Mock transport to avoid actual stdio communication
vi.mock('@modelcontextprotocol/sdk/transport/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
  })),
}));

describe('MCP Server Integration', () => {
  // Test 1: Server initialization
  it('should create a server instance', () => {
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(Server);
  });

  // Test 2: Tool count
  it('should expose exactly 2 tools', async () => {
    // Note: This requires mocking the request handler or using internal API
    // Alternative: Test that the handler is registered correctly
    expect(server).toBeDefined();
  });

  // Test 3: Tool descriptions contain behavioral guidance
  it('should include behavioral guidance in tool descriptions', async () => {
    // Verify descriptions discourage Read tool usage
    const descriptions = TOOL_DESCRIPTIONS;

    expect(descriptions.mdsel_index).toContain('Do NOT use the Read tool');
    expect(descriptions.mdsel_select).toContain('Do NOT use the Read tool');
  });

  // Test 4: Tool routing
  it('should route tool calls to correct handlers', async () => {
    // This requires testing the CallToolRequestSchema handler
    // May need to expose handler function for testing
  });
});
```

### Integration Points

```yaml
PACKAGE.JSON:
  - add to: package.json root
  - location: After "version" field, before "dependencies"
  - pattern: "bin": { "mdsel-claude": "./dist/index.mjs" }

TSUP.CONFIG.TS:
  - verify: src/index.ts is in entry array
  - pattern: entry: ['src/index.ts', 'src/tools/mdsel-index.ts', 'src/tools/mdsel-select.ts']

BUILD OUTPUT:
  - file: dist/index.mjs
  - contains: Built server code with shebang
  - verify: Run `head -n 1 dist/index.mjs` after build

TEST STRUCTURE:
  - directory: tests/integration/
  - file: mcp-server.test.ts
  - pattern: Follow tests/tools/*.test.ts structure
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npm run lint              # ESLint check
npm run type-check        # TypeScript type checking

# Format and fix
npm run format            # Prettier format

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the MCP server specifically
npm test -- tests/integration/mcp-server.test.ts

# Run full test suite
npm test

# Coverage validation (if coverage tools available)
npm run test:coverage

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# Build the project
npm run build

# Verify shebang in output
head -n 1 dist/index.mjs
# Expected: #!/usr/bin/env node

# Verify bin entry in package.json
cat package.json | grep -A 1 '"bin"'
# Expected: "bin": { "mdsel-claude": "./dist/index.mjs" }

# Test server startup (manual test)
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | node dist/index.mjs

# Expected: Server responds with initialize result

# Test ListTools request
echo '{"jsonrpc":"2.0","method":"tools/list","id":2}' | node dist/index.mjs

# Expected: Response with exactly 2 tools

# Expected: All integrations working, proper responses, no connection errors
```

### Level 4: MCP-Specific Validation

```bash
# Install MCP Inspector for testing
npm install -g @modelcontextprotocol/inspector

# Run inspector with server
npx @modelcontextprotocol/inspector node dist/index.mjs

# Expected: Inspector UI shows:
# - Server name: mdsel-claude
# - Version: 1.0.0
# - Tools: mdsel_index, mdsel_select
# - Tool descriptions visible with behavioral guidance

# Test tool calls through inspector UI
# Expected: Tools execute and return proper responses
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] No formatting issues: `npm run format` then check

### Feature Validation

- [ ] Server starts without errors
- [ ] Exactly 2 tools exposed (mdsel_index, mdsel_select)
- [ ] Tool descriptions contain behavioral guidance from tool_definitions.md
- [ ] Tool descriptions include "Do NOT use the Read tool" text
- [ ] Tool calls route correctly to handlers
- [ ] Bin entry in package.json points to dist/index.mjs
- [ ] dist/index.mjs has shebang (#!/usr/bin/env node)

### Code Quality Validation

- [ ] Follows existing codebase patterns (handler import, error format)
- [ ] File placement matches desired codebase tree structure
- [ ] Imports use .js extensions for ESM compatibility
- [ ] Server exported for testing, connected only on import.meta.main
- [ ] Tool definitions use exact text from tool_definitions.md

### Documentation & Deployment

- [ ] Code is self-documenting with clear variable names
- [ ] No additional environment variables needed
- [ ] Bin entry functional (can run `mdsel-claude` after npm link)

---

## Anti-Patterns to Avoid

- ❌ Don't reimplement handler logic in index.ts - route to existing functions
- ❌ Don't modify tool descriptions - use exact text from tool_definitions.md
- ❌ Don't use .ts extensions in imports - use .js for ESM
- ❌ Don't throw errors in CallTool handler - return { isError: true }
- ❌ Don't connect transport unconditionally - only in import.meta.main block
- ❌ Don't forget to export server for testing
- ❌ Don't hardcode tool definitions - use imported schemas from src/tools/
- ❌ Don't skip shebang verification - bin entry won't work without it
