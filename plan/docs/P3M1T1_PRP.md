# Product Requirement Prompt (PRP): E2E Test Suite

---

## Goal

**Feature Goal**: Create comprehensive end-to-end test suite validating all PRD success criteria for the mdsel-claude MCP server integration.

**Deliverable**: Three new E2E test files validating:
1. mdsel CLI output passthrough fidelity (byte-for-byte verbatim passthrough)
2. Reminder hook consistency (fires every time with exact message)
3. Tool surface validation (exactly 2 tools exposed with correct descriptions)

**Success Definition**: All E2E tests pass, validating that:
- mdsel output is passed through unchanged (no transformation, no parsing)
- Reminder hook fires consistently for large .md files with exact message from PRD
- Exactly 2 tools are exposed with behavioral guidance in descriptions

## User Persona (if applicable)

**Target User**: Development team / CI/CD pipeline

**Use Case**: Validate the complete integration of mdsel-claude MCP server before release

**User Journey**:
1. Developer runs `npm run test:e2e`
2. All E2E tests execute and pass
3. CI/CD pipeline validates no regressions in PRD success criteria

**Pain Points Addressed**:
- Lack of validation that mdsel output is truly passed verbatim
- Uncertainty whether hook fires consistently
- No automated verification of PRD requirements

## Why

- **PRD Compliance**: Per PRD Section 11, success requires "No divergence from mdsel output"
- **Quality Assurance**: E2E tests are the final validation gate before considering the feature complete
- **Regression Prevention**: Automated tests ensure future changes don't break core behavioral requirements
- **Confidence**: Comprehensive tests provide confidence that the integration works as specified

## What

Create end-to-end tests that validate the complete behavior of the mdsel-claude MCP server integration, ensuring PRD success criteria are met.

### Success Criteria

- [ ] **P3.M1.T1.S1**: mdsel output passthrough fidelity validated - tests confirm byte-for-byte verbatim passthrough
- [ ] **P3.M1.T1.S2**: Reminder hook consistency validated - tests confirm exact message and consistent firing
- [ ] **P3.M1.T1.S3**: Tool surface validated - tests confirm exactly 2 tools exposed with behavioral guidance

## All Needed Context

### Context Completeness Check

**Question**: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"

**Answer**: Yes - this PRP provides:
- Complete file structure with exact paths
- Existing test patterns to follow
- MCP SDK testing patterns
- mdsel CLI output format for validation
- Exact PRD requirements to test against

### Documentation & References

```yaml
# MUST READ - Core PRD Requirements
- file: PRD.md
  why: Normative requirements for reminder message, word count gating, tool surface
  section: Section 6 (Reminder Hook System), Section 11 (Success Criteria)
  critical: Reminder message is EXACT: "This is a Markdown file over the configured size threshold.\nUse mdsel_index and mdsel_select instead of Read."
  gotcha: No variation allowed in reminder message - must match exactly

- file: plan/docs/architecture/system_context.md
  why: System architecture showing MCP server structure and integration points
  section: Integration Points, External Dependencies

- file: plan/docs/architecture/tool_definitions.md
  why: Exact tool definitions and behavioral descriptions
  section: Tool Definitions (mdsel_index, mdsel_select)

- file: plan/docs/architecture/hook_system.md
  why: Hook system behavior and reminder message specification
  section: Hook Behavior, Reminder Content (Normative)

# EXISTING TEST PATTERNS - Follow These Patterns
- file: tests/integration/mcp-server.test.ts
  why: Existing MCP server integration test patterns
  pattern: Describe/it blocks, server import, tool description validation
  gotcha: Uses vitest with globals enabled

- file: tests/tools/mdsel-index.test.ts
  why: Mock pattern for child_process.spawn and MCP response validation
  pattern: createMockProcess helper function for testing spawn behavior
  gotcha: Mock at top level with vi.mock(), reset in beforeEach

- file: tests/tools/mdsel-select.test.ts
  why: Similar to mdsel-index, shows verbatim passthrough testing
  pattern: Test that malformed JSON is passed through unchanged
  gotcha: Never parse or transform output - test verbatim passthrough

- file: tests/hooks/read-hook.test.ts
  why: Hook testing pattern with stdin/stdout mocking
  pattern: Mock process.stdin async iterator, capture console.log output
  gotcha: Hook receives JSON via stdin, outputs JSON via stdout

# MCP SDK DOCUMENTATION
- url: https://modelcontextprotocol.io/docs/tools/server
  why: MCP server request/response patterns, tool invocation testing
  critical: MCP responses require { content: [{type, text}], isError: boolean } format

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: TypeScript SDK source code for understanding Server class and request handlers
  section: src/server/index.ts for Server class, getRequestHandler method

# MDSEL CLI DOCUMENTATION
- docfile: plan/P3M1T1/research/mdsel_cli_research.md
  why: mdsel CLI output format for passthrough fidelity validation
  section: mdsel_index output format, mdsel_select output format
  critical: Output is JSON by default - no --json flag needed
```

### Current Codebase Tree

```bash
mdsel-claude/
├── dist/                          # Build output (generated)
├── plan/
│   ├── docs/
│   │   └── architecture/          # Architecture documentation
│   └── P3M1T1/
│       └── PRP.md                 # This file
├── src/
│   ├── hooks/
│   │   └── read-hook.ts           # PreToolUse hook implementation
│   ├── index.ts                   # MCP server entry point
│   ├── lib/
│   │   ├── mdsel-cli.ts           # CLI wrapper for mdsel execution
│   │   └── word-count.ts          # Word counting utilities
│   ├── tools/
│   │   ├── mdsel-index.ts         # mdsel_index tool handler
│   │   └── mdsel-select.ts        # mdsel_select tool handler
│   └── types.ts                   # TypeScript type definitions
├── tests/
│   ├── hooks/
│   │   └── read-hook.test.ts      # Hook unit tests
│   ├── integration/
│   │   └── mcp-server.test.ts     # Existing MCP server integration tests
│   ├── lib/
│   │   ├── mdsel-cli.test.ts      # CLI wrapper tests
│   │   └── word-count.test.ts     # Word count utility tests
│   └── tools/
│       ├── mdsel-index.test.ts    # mdsel_index tool tests
│       └── mdsel-select.test.ts   # mdsel_select tool tests
├── vitest.config.ts               # Test configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project dependencies
```

### Desired Codebase Tree with New Files

```bash
tests/
├── e2e/                           # NEW: E2E test directory
│   ├── fixtures/                  # NEW: Test fixtures
│   │   ├── sample-docs/           # NEW: Sample markdown files
│   │   │   ├── small.md           # < 200 words (should not trigger reminder)
│   │   │   └── large.md           # > 200 words (should trigger reminder)
│   │   └── mdsel-responses/       # NEW: Expected mdsel outputs
│   │       ├── index-success.json # Expected mdsel index output
│   │       └── select-success.json # Expected mdsel select output
│   ├── passthrough-fidelity.test.ts  # NEW: P3.M1.T1.S1 - mdsel output fidelity
│   ├── hook-consistency.test.ts      # NEW: P3.M1.T1.S2 - Reminder hook tests
│   └── tool-surface.test.ts          # NEW: P3.M1.T1.S3 - Tool count/description tests
└── [existing test files...]
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: MCP Server Testing
// The Server class doesn't expose direct request handler access for testing
// Must use pattern: import { server } from '../src/index.js' and validate setup
// Cannot easily simulate JSON-RPC requests without setting up full transport

// CRITICAL: Hook Testing
// Hooks are standalone scripts that read from stdin and write to stdout
// Must mock: process.stdin (async iterator), process.stdout.write, console.log
// Hook receives JSON input, outputs JSON with { continue: boolean, systemMessage?: string }

// CRITICAL: mdsel CLI
// mdsel outputs JSON by default - no --json flag needed
// Output format is: { success: boolean, command: string, timestamp: string, data: {...} }
// For E2E tests, mock the spawn call rather than calling actual mdsel binary

// CRITICAL: Word Count Algorithm
// Whitespace-delimited: content.split(/\s+/).filter(t => t.length > 0).length
// This is tested in tests/lib/word-count.test.ts - reuse this pattern

// CRITICAL: Reminder Message
// EXACT string from PRD Section 6.3 - no variation allowed
// const REMINDER = "This is a Markdown file over the configured size threshold.\nUse mdsel_index and mdsel_select instead of Read.";

// CRITICAL: Tool Surface
// PRD Section 4: "Exactly two tools" - no more, no fewer
// Must test that ListToolsRequestSchema returns exactly 2 tools

// CRITICAL: Vitest Configuration
// Tests use vitest with globals: true (describe, it, expect available globally)
// Mock pattern: vi.mock at top level, vi.clearAllMocks() in beforeEach
```

## Implementation Blueprint

### Data Models and Structure

No new data models required for E2E tests. Tests will use existing types from `src/types.ts` and MCP SDK types.

```typescript
// Test fixture types (inline in test files)
interface MdselIndexResponse {
  success: boolean;
  command: string;
  timestamp: string;
  data: {
    documents: Array<{
      namespace: string;
      file_path: string;
      headings: Array<{
        selector: string;
        type: string;
        text: string;
        // ... other fields
      }>;
    }>;
  };
}

interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: {
    file_path: string;
  };
}

interface HookOutput {
  continue: boolean;
  systemMessage?: string;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE tests/e2e/fixtures/sample-docs/small.md
  - IMPLEMENT: Sample Markdown file with < 200 words
  - CONTENT: Simple markdown with 50-100 words
  - PURPOSE: Test that files below threshold don't trigger reminder
  - PLACEMENT: tests/e2e/fixtures/sample-docs/small.md

Task 2: CREATE tests/e2e/fixtures/sample-docs/large.md
  - IMPLEMENT: Sample Markdown file with > 200 words
  - CONTENT: Markdown with 250+ words, multiple sections
  - PURPOSE: Test that files above threshold trigger reminder
  - PLACEMENT: tests/e2e/fixtures/sample-docs/large.md

Task 3: CREATE tests/e2e/fixtures/mdsel-responses/index-success.json
  - IMPLEMENT: Expected mdsel index output for fixture files
  - FORMAT: Valid mdsel index JSON response
  - REFERENCE: See mdsel CLI research for exact format
  - PLACEMENT: tests/e2e/fixtures/mdsel-responses/index-success.json

Task 4: CREATE tests/e2e/fixtures/mdsel-responses/select-success.json
  - IMPLEMENT: Expected mdsel select output for a selector
  - FORMAT: Valid mdsel select JSON response
  - REFERENCE: See mdsel CLI research for exact format
  - PLACEMENT: tests/e2e/fixtures/mdsel-responses/select-success.json

Task 5: CREATE tests/e2e/passthrough-fidelity.test.ts
  - IMPLEMENT: E2E tests for mdsel output passthrough fidelity (P3.M1.T1.S1)
  - FOLLOW pattern: tests/tools/mdsel-index.test.ts (createMockProcess helper)
  - TEST: Valid JSON passed through verbatim
  - TEST: Malformed JSON passed through verbatim (no parsing)
  - TEST: Empty output passed through verbatim
  - TEST: Multi-line output passed through verbatim
  - TEST: Special characters passed through verbatim
  - MOCK: child_process.spawn with controlled stdout/stderr/exitCode
  - NAMING: describe('P3.M1.T1.S1: mdsel Output Passthrough Fidelity')
  - PLACEMENT: tests/e2e/passthrough-fidelity.test.ts

Task 6: CREATE tests/e2e/hook-consistency.test.ts
  - IMPLEMENT: E2E tests for reminder hook consistency (P3.M1.T1.S2)
  - FOLLOW pattern: tests/hooks/read-hook.test.ts (stdin/stdout mocking)
  - TEST: Non-.md files don't trigger reminder
  - TEST: .md files below threshold don't trigger reminder
  - TEST: .md files above threshold trigger reminder
  - TEST: Reminder message is EXACT match to PRD specification
  - TEST: Hook fires every time (no suppression)
  - TEST: Hook never blocks (always returns continue: true)
  - MOCK: fs.readFileSync, process.stdin, console.log
  - NAMING: describe('P3.M1.T1.S2: Reminder Hook Consistency')
  - PLACEMENT: tests/e2e/hook-consistency.test.ts

Task 7: CREATE tests/e2e/tool-surface.test.ts
  - IMPLEMENT: E2E tests for tool surface validation (P3.M1.T1.S3)
  - FOLLOW pattern: tests/integration/mcp-server.test.ts (server import pattern)
  - TEST: Exactly 2 tools exposed (no more, no fewer)
  - TEST: Tool names are mdsel_index and mdsel_select
  - TEST: Both tool descriptions contain "Do NOT use the Read tool"
  - TEST: Both tool descriptions contain "REQUIRED"
  - TEST: Tool descriptions include selector grammar
  - TEST: mdsel_select includes usage pattern (1. index, 2. select, 3. drill)
  - IMPORT: server from '../src/index.js'
  - NAMING: describe('P3.M1.T1.S3: Tool Surface Validation')
  - PLACEMENT: tests/e2e/tool-surface.test.ts

Task 8: MODIFY package.json
  - ADD: "test:e2e": "vitest run tests/e2e/" script
  - FIND pattern: Existing test scripts in package.json
  - PRESERVE: All existing scripts
  - PLACEMENT: In "scripts" section of package.json

Task 9: MODIFY vitest.config.ts
  - VERIFY: tests/e2e/**/*.test.ts is included in test patterns
  - CURRENT: test.files includes 'tests/**/*.test.ts' - should cover e2e/
  - PLACEMENT: No changes likely needed - verify coverage

Task 10: UPDATE README.md (if needed)
  - ADD: E2E test section documentation
  - DESCRIBE: How to run E2E tests
  - PLACEMENT: In testing section of README
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// PATTERN 1: Mock Process for mdsel Spawn (from tests/tools/)
// ============================================================

function createMockProcess(stdoutData = '', stderrData = '', exitCode = 0) {
  const mockProcess = {
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
    kill: vi.fn(),
    killed: false,
  };

  // Simulate stdout data event
  mockProcess.stdout.on.mockImplementation((event, handler) => {
    if (event === 'data') {
      handler(Buffer.from(stdoutData));
    }
  });

  // Simulate close event
  mockProcess.on.mockImplementation((event, handler) => {
    if (event === 'close') {
      (handler as (code: number) => void)(exitCode);
    }
  });

  return mockProcess;
}

// ============================================================
// PATTERN 2: Hook Input/Output Mocking (from tests/hooks/)
// ============================================================

async function executeHook(inputJson: string): Promise<HookOutput> {
  let output = '';

  // Mock console.log to capture output
  const mockConsoleLog = vi.fn();
  mockConsoleLog.mockImplementation((data: string) => {
    output = data;
  });

  // Mock stdin
  const mockStdinChunks = [inputJson];
  vi.spyOn(process.stdin, 'Symbol.asyncIterator').mockReturnValue(
    (async function* () {
      for (const chunk of mockStdinChunks) {
        yield chunk;
      }
    })()
  );

  // Import and execute hook
  await import('../../src/hooks/read-hook.js');

  return JSON.parse(output) as HookOutput;
}

// ============================================================
// PATTERN 3: Exact Reminder Message Validation
// ============================================================

// CRITICAL: Must match PRD Section 6.3 EXACTLY
const EXACT_REMINDER = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

it('should use exact reminder message from PRD', async () => {
  const result = await executeHook(JSON.stringify({
    session_id: 'test',
    hook_event_name: 'PreToolUse',
    tool_name: 'Read',
    tool_input: { file_path: '/path/to/large.md' },
  }));

  expect(result.systemMessage).toBe(EXACT_REMINDER);
});

// ============================================================
// PATTERN 4: Verbatim Passthrough Testing
// ============================================================

it('should pass through malformed JSON verbatim', async () => {
  const malformedJson = '{invalid json output}';
  const mockProcess = createMockProcess(malformedJson, '', 0);

  mockSpawn.mockReturnValue(mockProcess);

  const result = await handleMdselIndex({ files: ['test.md'] });

  // CRITICAL: No parsing or transformation
  expect(result.content[0].text).toBe(malformedJson);
  expect(result.isError).toBe(false); // Success based on exit code
});

// ============================================================
// PATTERN 5: Tool Count Validation
// ============================================================

it('should expose exactly 2 tools', async () => {
  // Import server instance
  const { server } = await import('../../src/index.js');

  // Get list tools handler
  const listToolsHandler = server.getRequestHandler?.('tools/list');

  if (listToolsHandler) {
    const response = await listToolsHandler({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    });

    expect(response.result?.tools).toHaveLength(2);
  }
});
```

### Integration Points

```yaml
NO NEW INTEGRATIONS:
  - E2E tests only validate existing integration points
  - No new MCP server functionality
  - No new hook behavior
  - No changes to tool handlers

MOCK INTEGRATIONS:
  - child_process.spawn: Mock mdsel CLI calls
  - fs.readFileSync: Mock file reads for hook tests
  - process.stdin/stdout: Mock for hook script testing

TEST SCRIPT ADDITIONS:
  - add to: package.json
  - pattern: "test:e2e": "vitest run tests/e2e/"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npx tsc --noEmit tests/e2e/passthrough-fidelity.test.ts    # Type check new test file
npx tsc --noEmit tests/e2e/hook-consistency.test.ts
npx tsc --noEmit tests/e2e/tool-surface.test.ts

# Project-wide linting
npm run lint        # or: npx eslint tests/e2e/ --fix

# Expected: Zero TypeScript errors, zero linting errors
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test each E2E file as it's created
npm test -- tests/e2e/passthrough-fidelity.test.ts
npm test -- tests/e2e/hook-consistency.test.ts
npm test -- tests/e2e/tool-surface.test.ts

# Full E2E test suite
npm run test:e2e

# Expected: All tests pass. E2E tests may mock dependencies, so no external services needed.
```

### Level 3: Integration Testing (System Validation)

```bash
# Run full test suite including E2E
npm test           # Runs all tests via vitest

# Verify E2E tests are included
npm test -- --reporter=verbose tests/e2e/

# Expected: All tests pass, including existing unit + integration tests + new E2E tests
```

### Level 4: PRD Success Criteria Validation

```bash
# Manual verification of PRD requirements:

# 1. Passthrough Fidelity (P3.M1.T1.S1)
npm test -- tests/e2e/passthrough-fidelity.test.ts
# Verify: Tests confirm byte-for-byte passthrough

# 2. Hook Consistency (P3.M1.T1.S2)
npm test -- tests/e2e/hook-consistency.test.ts
# Verify: Tests confirm exact reminder message and consistent firing

# 3. Tool Surface (P3.M1.T1.S3)
npm test -- tests/e2e/tool-surface.test.ts
# Verify: Tests confirm exactly 2 tools with behavioral descriptions

# Expected: All PRD success criteria validated by automated tests
```

## Final Validation Checklist

### Technical Validation

- [ ] All 3 E2E test files created with appropriate describe/it blocks
- [ ] All TypeScript files compile without errors: `npx tsc --noEmit`
- [ ] All E2E tests pass: `npm run test:e2e`
- [ ] Existing tests still pass: `npm test`
- [ ] Code follows existing test patterns (mock reset in beforeEach, etc.)

### Feature Validation

- [ ] P3.M1.T1.S1: mdsel output passthrough fidelity tested
  - [ ] Valid JSON passed verbatim
  - [ ] Malformed JSON passed verbatim (no parsing)
  - [ ] Empty output passed verbatim
  - [ ] Special characters preserved
- [ ] P3.M1.T1.S2: Reminder hook consistency tested
  - [ ] Exact reminder message matches PRD Section 6.3
  - [ ] Fires every time for .md files > threshold
  - [ ] Never fires for .md files <= threshold
  - [ ] Never fires for non-.md files
  - [ ] Never blocks (always continue: true)
- [ ] P3.M1.T1.S3: Tool surface validated
  - [ ] Exactly 2 tools exposed
  - [ ] Tool names are mdsel_index and mdsel_select
  - [ ] Descriptions contain behavioral guidance
  - [ ] Descriptions mention REQUIRED workflow

### Code Quality Validation

- [ ] Test file placement matches desired codebase tree
- [ ] Fixture files created in tests/e2e/fixtures/
- [ ] package.json updated with test:e2e script
- [ ] Tests are self-documenting with clear describe/it names
- [ ] Mock patterns follow existing codebase conventions

### PRD Compliance Validation

- [ ] PRD Section 6.3: Reminder message is EXACT match
- [ ] PRD Section 11: "No divergence from mdsel output" validated
- [ ] PRD Section 4: "Exactly two tools" validated

---

## Anti-Patterns to Avoid

- ❌ Don't modify MCP server implementation - only add tests
- ❌ Don't parse or transform mdsel output in tests - test verbatim passthrough
- ❌ Don't use approximate string matching for reminder - use exact match
- ❌ Don't skip edge cases (malformed JSON, special characters, etc.)
- ❌ Don't forget to mock at top level (vi.mock), reset in beforeEach
- ❌ Don't hardcode file paths - use relative paths from test file location
- ❌ Don't test implementation details - test PRD requirements and observable behavior

## Appendix: Test Fixture Examples

### Sample Markdown Files

```markdown
<!-- tests/e2e/fixtures/sample-docs/small.md (< 200 words) -->
# Small Document

This is a small markdown file with fewer than two hundred words. It should not trigger the reminder hook when read.

## Section One

Some content here.

## Section Two

More content here.

Total word count is approximately fifty words.
```

```markdown
<!-- tests/e2e/fixtures/sample-docs/large.md (> 200 words) -->
# Large Document

This is a large markdown file with more than two hundred words. It should trigger the reminder hook when read using the Read tool. The purpose of this file is to test the word count gating logic in the reminder hook system.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

[... additional content to exceed 200 words ...]

## Conclusion

This document exceeds the threshold and should trigger the reminder.
```

### Expected mdsel Responses

```json
// tests/e2e/fixtures/mdsel-responses/index-success.json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-12-27T00:00:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "sample",
        "file_path": "small.md",
        "root": null,
        "headings": [
          {
            "selector": "sample::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Small Document",
            "content_preview": "Small Document",
            "truncated": false,
            "children_count": 2,
            "word_count": 3
          }
        ],
        "blocks": {
          "paragraphs": 3,
          "code_blocks": 0,
          "lists": 0,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ]
  },
  "summary": {
    "total_documents": 1,
    "total_nodes": 3,
    "total_selectors": 3
  }
}
```

---

## Confidence Score

**Rating: 9/10** for one-pass implementation success

**Rationale**:
- Comprehensive research completed with existing test patterns identified
- Clear task dependencies defined
- Specific file paths and patterns provided
- PRD requirements clearly mapped to test cases
- Mock patterns documented with code examples
- Only minor uncertainty: MCP Server class may have limited testing APIs, but existing tests show this is workable

**Risk Mitigation**: Existing test files show working patterns for all required test types (MCP server testing, hook testing, spawn mocking).
