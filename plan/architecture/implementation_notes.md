# Implementation Notes: mdsel-claude

## Critical Architectural Decisions

### 1. Reminder Hook Reality Check

**PRD Requirement**: Fire a reminder when Claude uses Read on large Markdown files.

**Reality**: MCP servers cannot intercept Claude's built-in Read tool. The MCP protocol only allows servers to define their own tools—they cannot hook into or modify Claude's native capabilities.

**Implementation Options**:

1. **Tool Descriptions Only** (Recommended)
   - Behavioral conditioning through explicit tool descriptions
   - No runtime interception needed
   - Aligns with "thin wrapper" philosophy

2. **Claude Code Hook System** (If available)
   - Claude Code may support pre-Read hooks in configuration
   - Would require investigation of Claude Code extension points
   - Not part of standard MCP

3. **Wrapper Tool Approach** (Not recommended)
   - Create a `read_markdown` tool that wraps Read + reminder
   - Violates PRD's "exactly two tools" constraint
   - Would compete with native Read rather than discourage it

**Decision**: Implement behavioral conditioning through tool descriptions. The reminder hook as described in the PRD may not be technically feasible within MCP constraints.

---

### 2. mdsel Invocation Strategy

**Approach**: Child process spawn with JSON output

```typescript
import { spawn } from 'child_process';

async function invokeMdsel(command: string, args: string[]): Promise<CLIResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('mdsel', [command, ...args, '--json']);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    proc.on('close', (code) => {
      try {
        const response = JSON.parse(stdout);
        resolve(response);
      } catch (e) {
        reject(new Error(`mdsel parse error: ${stderr || stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`mdsel spawn error: ${err.message}`));
    });
  });
}
```

**Key Points**:
- Always use `--json` flag for structured output
- Parse JSON response directly
- Pass through errors verbatim (no catch/rewrite)
- Handle spawn errors as tool errors

---

### 3. Error Passthrough Implementation

**PRD Requirement**: Return mdsel errors verbatim, no rewriting.

```typescript
async function handleToolCall(name: string, args: object): Promise<ToolResult> {
  try {
    const response = await invokeMdsel(/* ... */);

    // Pass through regardless of success/failure
    return {
      content: [{
        type: "text",
        text: JSON.stringify(response, null, 2)
      }],
      isError: !response.success
    };
  } catch (spawnError) {
    // Only catch spawn/parse errors, not mdsel errors
    return {
      content: [{
        type: "text",
        text: `mdsel invocation failed: ${spawnError.message}`
      }],
      isError: true
    };
  }
}
```

**The distinction**:
- mdsel errors (invalid selector, file not found) → passthrough in response
- Spawn errors (mdsel not found, JSON parse failure) → tool error

---

### 4. Word Count Gating Considerations

**PRD Requirement**: Word count gating for when to require selector access.

**Challenge**: The MCP server doesn't intercept Read calls, so word count gating cannot be enforced at runtime.

**Options**:

1. **Documentation Only**
   - Tool descriptions state the 200-word threshold
   - Claude decides when to use mdsel vs Read
   - No enforcement

2. **Index-Time Advisory**
   - `mdsel_index` response includes word counts
   - Claude can see section sizes and make informed choices
   - Still no enforcement

3. **Proactive Indexing Recommendation**
   - Tool descriptions strongly recommend indexing first
   - Word counts in index help Claude decide selector scope
   - Behavioral conditioning through information

**Implementation**: Include word counts in tool responses (already provided by mdsel). Tool descriptions guide usage. No runtime enforcement.

---

### 5. Environment Variable Handling

```typescript
const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10);
```

**Usage**: For documentation purposes only in this implementation (since we can't enforce gating).

---

### 6. Project Structure

```
mdsel-claude/
├── src/
│   ├── server.ts           # MCP server entry point
│   ├── tools/
│   │   ├── index.ts        # Tool definitions
│   │   ├── mdsel-index.ts  # mdsel_index handler
│   │   └── mdsel-select.ts # mdsel_select handler
│   ├── mdsel/
│   │   ├── invoke.ts       # Child process invocation
│   │   └── types.ts        # Response types (from mdsel)
│   └── types.ts            # MCP types
├── tests/
│   ├── tools/
│   │   ├── mdsel-index.test.ts
│   │   └── mdsel-select.test.ts
│   └── integration/
│       └── server.test.ts
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

### 7. Testing Strategy

**Unit Tests**:
- Tool input validation
- Response formatting
- Error handling paths

**Integration Tests**:
- Full MCP server lifecycle
- Tool discovery
- Tool invocation with mock mdsel

**E2E Tests** (manual):
- Claude Code integration
- Real mdsel invocation
- Behavioral validation

---

### 8. Build Configuration

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
});
```

**package.json (key fields)**:
```json
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.mjs",
  "bin": {
    "mdsel-claude": "dist/server.mjs"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "start": "node dist/server.mjs"
  }
}
```

---

### 9. Scope Boundaries

**In Scope**:
- MCP server implementation
- Two tools (mdsel_index, mdsel_select)
- Child process mdsel invocation
- Error passthrough
- Tool descriptions for behavioral conditioning

**Out of Scope** (per PRD):
- Markdown parsing
- Selector validation
- Caching
- State management
- Content summarization
- Performance optimization beyond delegation
- New selector concepts
- Read tool interception (technically infeasible)

---

### 10. Definition of Done

Each subtask is complete when:
1. Implementation matches PRD specification
2. Tests pass (TDD implied)
3. No new state introduced
4. Errors pass through verbatim
5. Tool descriptions match normative text
6. mdsel semantics preserved exactly
