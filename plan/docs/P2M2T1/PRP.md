# PRP: P2.M2.T1 - Implement Read Hook Script

---

## Goal

**Feature Goal**: Create a standalone PreToolUse hook script that intercepts `Read` tool calls for Markdown files and injects behavioral reminders when the file exceeds the configured word count threshold.

**Deliverable**: A new hook script `src/hooks/read-hook.ts` that:

- Reads hook input from stdin (JSON format)
- Filters for `.md` files only
- Counts words using existing utilities
- Injects reminder message when threshold exceeded
- Outputs proper JSON to stdout
- Exits with code 0 (continue, never block)

**Success Definition**:

- Hook correctly receives and parses HookInput JSON from stdin
- Non-`.md` files pass through without any reminder
- `.md` files below threshold pass through without reminder
- `.md` files above threshold receive exact reminder message via systemMessage
- Hook always exits with code 0 (never blocks the Read)
- Missing/unreadable files don't crash the hook
- Built artifact `dist/hooks/read-hook.js` is executable standalone
- All tests pass with full coverage

## User Persona (if applicable)

**Target User**: Internal - Claude Code agents who invoke the `Read` tool on Markdown files

**Use Case**: When a Claude Code agent uses the `Read` tool on a Markdown file:

1. If the file is small (<= threshold), allow silent reading
2. If the file is large (> threshold), remind the agent to use mdsel tools instead

**User Journey**:

```
1. Claude agent invokes Read tool on file "large-document.md"
2. Claude Code's hook system detects PreToolUse hook configured
3. Hook receives JSON input via stdin with session_id, tool_name, tool_input.file_path
4. Hook checks if file_path ends with ".md"
5. Hook reads file content and counts words
6. If word_count > MDSEL_MIN_WORDS:
   - Hook sets systemMessage to exact reminder text
7. Hook outputs JSON with continue=true and optional systemMessage
8. Hook exits with code 0
9. Claude Code receives the systemMessage and displays it to agent
10. Read tool proceeds normally (hook never blocks)
```

**Pain Points Addressed**:

- Without this hook, agents have no reminder to use mdsel tools for large Markdown files
- Full-file reads on large documents waste tokens
- Behavioral conditioning requires consistent reminders every time

## Why

- **Integration with existing features**: Builds on word count utilities from P2.M1 (countWords, getWordThreshold)
- **Problems this solves**:
  - Agents don't know when a file is "large enough" to warrant mdsel usage
  - Token waste from reading large Markdown files in full
  - Inconsistent agent behavior across sessions
- **Architectural role**: Part of behavioral enforcement system (P2) that encourages selector-based access over full-file reads
- **PRD alignment**: Implements PRD Section 6 "Reminder Hook System" with exact trigger conditions and message

## What

**User-visible behavior**: When a Claude Code agent reads a Markdown file exceeding the word count threshold, they see a reminder message before the file contents:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

**Technical requirements**:

- Standalone Node.js script (executable via `node dist/hooks/read-hook.js`)
- Reads JSON input from stdin (HookInput interface)
- Writes JSON output to stdout (HookOutput interface)
- Exit code 0 always (never blocks)
- Uses existing word count utilities from `src/lib/word-count.ts`
- Configurable threshold via `MDSEL_MIN_WORDS` environment variable

### Success Criteria

- [ ] Hook receives HookInput JSON from stdin correctly
- [ ] Hook ignores non-`.md` files (no reminder, exit 0)
- [ ] Hook reads `.md` file content and counts words accurately
- [ ] Hook compares count against threshold from `getWordThreshold()`
- [ ] Files <= threshold pass through without systemMessage
- [ ] Files > threshold receive exact reminder in systemMessage
- [ ] Reminder message is exact: `This is a Markdown file over the configured size threshold.\nUse mdsel_index and mdsel_select instead of Read.`
- [ ] Hook handles missing/unreadable files gracefully (no crash, exit 0)
- [ ] Hook always exits with code 0 (continue)
- [ ] Built artifact is executable standalone
- [ ] All tests in `tests/hooks/read-hook.test.ts` pass
- [ ] tsup build includes hook in entry points

## All Needed Context

### Context Completeness Check

_If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

**Yes** - This PRP provides:

- Exact hook input/output schema with TypeScript interfaces
- Complete implementation blueprint with code patterns
- Build configuration changes needed
- Test patterns from existing codebase
- Word count utility integration points
- Exact reminder message wording (normative from PRD)

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: plan/docs/architecture/hook_system.md
  why: Complete hook system architecture with flow diagram, example implementation
  section: Full document - contains normative reminder message and implementation skeleton
  critical: Reminder message must be EXACT - no variation allowed
  gotcha: Hook always exits 0, uses systemMessage for reminders (never blocks)

- file: src/lib/word-count.ts
  why: Already-implemented word count utilities to import and use
  pattern: Import { countWords, getWordThreshold } from '../lib/word-count.js'
  gotcha: Must use .js extension in ESM imports even for TypeScript files

- file: PRD.md
  why: Normative requirements for reminder hook system
  section: Section 6 "Reminder Hook System" (lines 160-200)
  critical: Reminder fires EVERY TIME, no suppression, no "first warning only"
  gotcha: Message must be identical every time - no variation allowed

- file: tests/lib/mdsel-cli.test.ts
  why: Reference pattern for test structure with beforeEach, nested describe blocks
  pattern: describe blocks for success/error cases, mock helpers, environment cleanup
  gotcha: Use vi.mock() at top level, reset in beforeEach()

- file: tsup.config.ts
  why: Build configuration that needs modification to add hook entry point
  pattern: Add 'src/hooks/read-hook.ts' to entry array
  gotcha: Hooks directory doesn't exist yet - needs to be created

- file: src/types.ts
  why: Type definition patterns (though hook types should be local to hook file)
  pattern: TypeScript interfaces with JSDoc documentation
  gotcha: Keep HookInput and HookOutput types local to read-hook.ts (not in shared types)

- docfile: plan/docs/P2M1T1/PRP.md
  why: Reference PRP for word count utilities showing documentation patterns
  section: Implementation Blueprint section
  pattern: JSDoc comments with @param, @returns, @example, CRITICAL comments
```

### Current Codebase Tree

```bash
mdsel-claude-glm/
├── dist/                          # Compiled output (generated by tsup)
│   ├── index.js                   # MCP server with shebang
│   └── tools/
│       ├── mdsel-index.js
│       └── mdsel-select.js
├── src/
│   ├── hooks/                     # Hook scripts (empty - needs creation)
│   ├── lib/
│   │   ├── mdsel-cli.ts           # CLI executor utility
│   │   └── word-count.ts          # Word count utilities (USE THIS)
│   ├── tools/                     # MCP tool handlers
│   │   ├── mdsel-index.ts
│   │   └── mdsel-select.ts
│   ├── index.ts                   # MCP server entry point
│   └── types.ts                   # Shared type definitions
├── tests/
│   ├── hooks/                     # Hook tests (empty - needs creation)
│   ├── integration/
│   │   └── mcp-server.test.ts
│   ├── lib/
│   │   ├── mdsel-cli.test.ts
│   │   └── word-count.test.ts
│   └── tools/
│       ├── mdsel-index.test.ts
│       └── mdsel-select.test.ts
├── plan/
│   ├── docs/
│   │   └── architecture/
│   │       └── hook_system.md     # Hook architecture documentation
│   └── P2M1T1/
│       └── PRP.md                 # Word count PRP (reference)
├── package.json
├── tsconfig.json
├── tsup.config.ts                 # BUILD CONFIG (needs modification)
└── vitest.config.ts
```

### Desired Codebase Tree After Implementation

```bash
src/hooks/
└── read-hook.ts                    # NEW - standalone hook script

tests/hooks/
└── read-hook.test.ts               # NEW - hook tests

dist/
└── hooks/
    └── read-hook.js                # NEW - built hook artifact

tsup.config.ts                      # MODIFIED - add hook entry point
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM imports require .js extension even for TypeScript files
// import { countWords } from '../lib/word-count.js';  // Correct
// import { countWords } from '../lib/word-count';     // WRONG - will fail

// CRITICAL: Hook input/output schemas (from hook_system.md)
// interface HookInput {
//   session_id: string;
//   hook_event_name: string;
//   tool_name: string;
//   tool_input: { file_path: string; };
// }
// interface HookOutput {
//   continue: boolean;
//   systemMessage?: string;
// }

// CRITICAL: Exit code semantics
// 0 = Continue (with optional systemMessage)
// 1 = Show error to user
// 2 = Block the action
// This hook ALWAYS uses exit 0 - never blocks Read

// CRITICAL: Reminder message MUST be exact (PRD Section 6.3)
// const REMINDER = `This is a Markdown file over the configured size threshold.
// Use mdsel_index and mdsel_select instead of Read.`;
// NO VARIATION ALLOWED - same text every time

// GOTCHA: process.stdin is async - use for await...of loop
// let inputData = '';
// for await (const chunk of process.stdin) {
//   inputData += chunk;
// }

// GOTCHA: readFileSync throws on missing file - must catch
// try { content = readFileSync(filePath, 'utf-8'); }
// catch { /* file doesn't exist - let Read tool handle error */ }

// GOTCHA: extname() returns extension WITH dot, e.g. ".md"
// import { extname } from 'path';
// if (extname(filePath).toLowerCase() !== '.md') { /* not markdown */ }

// CRITICAL: Shebang for standalone execution
// #!/usr/bin/env node
// Must be first line of file - tsup banner handles this automatically

// PATTERN: Project uses 'CRITICAL:' comments for implementation details
// PATTERN: Project uses 'GOTCHA:' for library-specific quirks
```

## Implementation Blueprint

### Data Models and Structure

```typescript
/**
 * PreToolUse Hook Input Schema
 *
 * Received from Claude Code via stdin when Read tool is invoked.
 */
interface HookInput {
  session_id: string;
  hook_event_name: string; // Always "PreToolUse"
  tool_name: string; // Always "Read" for this hook
  tool_input: {
    file_path: string; // Absolute path to file being read
  };
}

/**
 * PreToolUse Hook Output Schema
 *
 * Returned to Claude Code via stdout.
 */
interface HookOutput {
  continue: boolean; // Always true for this hook (never block)
  systemMessage?: string; // Reminder message if threshold exceeded
}

/**
 * Normative reminder message (PRD Section 6.3)
 *
 * MUST be exact - no variation allowed.
 */
const REMINDER_MESSAGE = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: DEFINE hook input/output types in src/hooks/read-hook.ts
  - IMPLEMENT: HookInput interface with session_id, hook_event_name, tool_name, tool_input.file_path
  - IMPLEMENT: HookOutput interface with continue (boolean), systemMessage (optional string)
  - DEFINE: REMINDER_MESSAGE constant with exact text from PRD
  - PATTERN: Keep types local to hook file (not in shared src/types.ts)
  - NAMING: PascalCase for interfaces, UPPER_SNAKE_CASE for constant
  - PLACEMENT: Top of src/hooks/read-hook.ts
  - GOTCHA: Message must include newline between sentences - EXACT match to PRD

Task 2: IMPLEMENT main hook logic in src/hooks/read-hook.ts
  - IMPLEMENT: Async main() function that:
    a. Reads JSON from process.stdin using for await...of loop
    b. Parses JSON as HookInput
    c. Initializes HookOutput with continue: true
    d. Checks if file_path ends with ".md" (using extname from 'path')
    e. If not .md: output JSON and exit 0
    f. If .md: read file content with readFileSync
    g. Import and call countWords(content) from '../lib/word-count.js'
    h. Import and call getWordThreshold() from '../lib/word-count.js'
    i. If wordCount > threshold: set output.systemMessage = REMINDER_MESSAGE
    j. Handle file read errors gracefully (try/catch, let Read tool handle)
    k. Stringify output to JSON and console.log()
    l. Exit with process.exit(0)
  - FOLLOW pattern: plan/docs/architecture/hook_system.md implementation example
  - IMPORT: { readFileSync } from 'fs', { extname } from 'path'
  - IMPORT: { countWords, getWordThreshold } from '../lib/word-count.js'
  - NAMING: camelCase for function names
  - PLACEMENT: src/hooks/read-hook.ts (create new file)
  - SHEBANG: #!/usr/bin/env node as first line (tsup banner will handle)

Task 3: MODIFY tsup.config.ts to add hook entry point
  - ADD: 'src/hooks/read-hook.ts' to entry array
  - FIND pattern: Existing entry: ['src/index.ts', 'src/tools/mdsel-index.ts', ...]
  - MODIFY: entry: ['src/index.ts', 'src/tools/mdsel-index.ts', 'src/tools/mdsel-select.ts', 'src/hooks/read-hook.ts']
  - PRESERVE: All existing configuration (format, target, banner, etc.)
  - VERIFY: Build will create dist/hooks/read-hook.js with shebang

Task 4: CREATE tests/hooks/read-hook.test.ts
  - IMPLEMENT: describe('read-hook', () => { ... }) test suite
  - IMPLEMENT: describe('input parsing', ...) with tests for valid JSON input
  - IMPLEMENT: describe('file type filtering', ...) with tests for .md vs non-.md
  - IMPLEMENT: describe('word count gating', ...) with tests for below/above threshold
  - IMPLEMENT: describe('error handling', ...) with tests for missing files
  - IMPLEMENT: describe('reminder message', ...) with test for exact message content
  - FOLLOW pattern: tests/lib/mdsel-cli.test.ts (test structure, helpers)
  - MOCK: fs.readFileSync for file reading scenarios
  - MOCK: process.stdin for input JSON simulation
  - MOCK: process.stdout for output JSON capture
  - MOCK: process.exit for exit code verification
  - NAMING: test files use .test.ts suffix, kebab-case
  - PLACEMENT: tests/hooks/read-hook.test.ts
  - COVERAGE: All code paths including happy path and error cases

Task 5: CREATE research documentation file (optional but recommended)
  - CREATE: plan/P2M2T1/research/hook_implementation.md
  - DOCUMENT: Key findings about hook system behavior
  - DOCUMENT: JSON input/output format examples
  - DOCUMENT: Exit code semantics
  - DOCUMENT: Any edge cases discovered during implementation
```

### Implementation Patterns & Key Details

```typescript
/**
 * PreToolUse Hook Script for Read Tool Interception
 *
 * Intercepts Read tool invocations for Markdown files and injects
 * behavioral reminders when file exceeds word count threshold.
 *
 * @module read-hook
 */

#!/usr/bin/env node
import { readFileSync } from 'fs';
import { extname } from 'path';
import { countWords, getWordThreshold } from '../lib/word-count.js';

// CRITICAL: Types must be local to hook file (not in shared types)
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

// CRITICAL: Reminder message MUST be exact (PRD Section 6.3)
// No variation allowed - must match exactly every time
const REMINDER_MESSAGE = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

/**
 * Main hook execution function
 *
 * Reads HookInput from stdin, processes file, outputs HookOutput to stdout.
 * Always exits with code 0 (continue), never blocks the Read action.
 */
async function main(): Promise<void> {
  // PATTERN: Read stdin asynchronously using for await...of
  let inputData = '';
  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  // GOTCHA: JSON.parse can throw - but Claude Code guarantees valid JSON
  const input: HookInput = JSON.parse(inputData);

  // PATTERN: Initialize output with continue: true (never block)
  const output: HookOutput = { continue: true };

  // CRITICAL: Only process .md files - let other files pass through
  const filePath = input.tool_input.file_path;
  if (extname(filePath).toLowerCase() !== '.md') {
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // PATTERN: Try/catch for file operations - let Read tool handle errors
  try {
    const content = readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    const threshold = getWordThreshold();

    // CRITICAL: Only inject reminder if above threshold
    if (wordCount > threshold) {
      output.systemMessage = REMINDER_MESSAGE;
    }
  } catch {
    // File doesn't exist or can't be read
    // Let Read tool handle the error - don't crash the hook
    // PATTERN: Silent failure - output remains { continue: true }
  }

  // PATTERN: Output JSON to stdout, exit with 0
  console.log(JSON.stringify(output));
  process.exit(0);
}

// PATTERN: Invoke main and handle promise rejection
main().catch((error) => {
  console.error(JSON.stringify({ continue: true }));
  process.exit(0);
});
```

### Integration Points

```yaml
CODE:
  - create: src/hooks/read-hook.ts
  - pattern: 'Standalone script with shebang, stdin/stdout JSON I/O'
  - imports: |
      import { readFileSync } from 'fs';
      import { extname } from 'path';
      import { countWords, getWordThreshold } from '../lib/word-count.js';
  - types: 'HookInput, HookOutput interfaces local to file'

BUILD:
  - modify: tsup.config.ts
  - action: Add 'src/hooks/read-hook.ts' to entry array
  - output: dist/hooks/read-hook.js (executable with shebang)
  - verify: Build creates proper artifact in dist/hooks/

TESTS:
  - create: tests/hooks/read-hook.test.ts
  - pattern: 'Vitest with describe/it/expect, heavy mocking for stdin/stdout/fs'
  - coverage: All code paths including error handling

DEPENDENCIES:
  - existing: src/lib/word-count.ts (P2.M1 - already implemented)
  - existing: vitest, @vitest/coverage-v8 (test framework)
  - no_new_dependencies: Use only Node.js built-ins and existing utilities

NO CHANGES NEEDED TO:
  - src/index.ts (hook is standalone, not part of MCP server)
  - package.json (bin entry not needed - hook configured via .claude/settings.json)
  - src/types.ts (keep hook types local to hook file)
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npm run lint                       # ESLint check with auto-fix
npm run format                     # Prettier formatting
npm run type-check                 # TypeScript type checking

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test the new hook specifically
npm test -- tests/hooks/read-hook.test.ts

# Run all hook tests (will grow over time)
npm test -- tests/hooks/

# Full test suite
npm test

# Coverage validation
npm run test:coverage  # If configured

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# Build validation - ensure hook compiles
npm run build
# Verify dist/hooks/read-hook.js exists and is executable
ls -la dist/hooks/read-hook.js

# Standalone execution test (manually simulate hook input)
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | \
  node dist/hooks/read-hook.js
# Expected: {"continue":true} (no reminder if file doesn't exist or is small)

# Build artifact validation
node -e "import('./dist/hooks/read-hook.js').then(m => console.log('Module loaded'))"
# Expected: Module loads successfully

# Expected: All integrations working, hook is standalone executable.
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Hook Input/Output Format Testing
# Create test files of various sizes and verify hook behavior

# Test 1: Small Markdown file (below threshold)
echo "# Small file" > /tmp/small.md
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/small.md"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true} (no systemMessage)

# Test 2: Large Markdown file (above threshold - default 200 words)
python3 -c "print('# Large\n\n' + 'word ' * 250)" > /tmp/large.md
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/large.md"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true,"systemMessage":"This is a Markdown file over the configured size threshold.\nUse mdsel_index and mdsel_select instead of Read."}

# Test 3: Non-Markdown file
echo "not markdown" > /tmp/file.txt
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/file.txt"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true} (no systemMessage, not filtered as .md)

# Test 4: Custom threshold
MDSEL_MIN_WORDS=50 echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/small.md"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: Behavior changes based on custom threshold

# Test 5: Missing file (error handling)
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/nonexistent.md"}}' | \
  node dist/hooks/read-hook.js; echo "Exit code: $?"
# Expected: {"continue":true} and exit code 0 (no crash)

# Test 6: Exact message content verification
python3 -c "print('# Large\n\n' + 'word ' * 250)" > /tmp/large.md
MESSAGE=$(echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/large.md"}}' | \
  node dist/hooks/read-hook.js | jq -r '.systemMessage')
EXPECTED="This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read."
if [ "$MESSAGE" = "$EXPECTED" ]; then
  echo "PASS: Message matches exactly"
else
  echo "FAIL: Message does not match"
  echo "Got: $MESSAGE"
  echo "Expected: $EXPECTED"
fi

# Expected: All creative validations pass with exact message matching.
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test -- tests/hooks/read-hook.test.ts`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] No formatting issues: `npm run format -- --check`
- [ ] Build succeeds: `npm run build`
- [ ] Built artifact exists: `dist/hooks/read-hook.js`

### Feature Validation

- [ ] Hook receives HookInput JSON from stdin correctly
- [ ] Non-`.md` files pass through without reminder
- [ ] `.md` files below threshold pass through without reminder
- [ ] `.md` files above threshold receive reminder via systemMessage
- [ ] Reminder message is EXACT match to PRD specification
- [ ] Hook handles missing/unreadable files gracefully (no crash)
- [ ] Hook always exits with code 0 (never blocks)
- [ ] Environment variable `MDSEL_MIN_WORDS` affects threshold correctly
- [ ] Word count uses mechanical whitespace tokenization

### Code Quality Validation

- [ ] Follows existing codebase patterns (JSDoc, CRITICAL comments)
- [ ] File placement matches desired structure (src/hooks/read-hook.ts)
- [ ] Test placement matches desired structure (tests/hooks/read-hook.test.ts)
- [ ] Uses existing word count utilities (no duplicate logic)
- [ ] ESM imports use .js extension correctly
- [ ] Shebang present for standalone execution
- [ ] Hook types are local to file (not in shared types.ts)

### Documentation & Deployment

- [ ] JSDoc comments complete with descriptions
- [ ] CRITICAL comments for important implementation details
- [ ] README will be updated in P2.M3.T1 (hook configuration guide)
- [ ] tsup.config.ts includes hook entry point

---

## Anti-Patterns to Avoid

- **Don't** block the Read action - always exit with code 0
- **Don't** vary the reminder message - must be EXACT every time
- **Don't** add logic to suppress reminders after first warning
- **Don't** parse Markdown content - this is mechanical word counting only
- **Don't** add caching - each invocation is independent
- **Don't** add types to src/types.ts - keep hook types local
- **Don't** forget to use .js extension in ESM imports
- **Don't** crash on file read errors - handle gracefully
- **Don't** implement selector logic - that's what mdsel tools are for
- **Don't** add complex configuration - only MDSEL_MIN_WORDS env var
- **Don't** process non-`.md` files - let them pass through silently
- **Don't** use sync stdin reading - must use async for await...of
- **Don't** forget to add to tsup entry points - won't build otherwise

---

## Confidence Score

**9/10** - One-pass implementation success likelihood

**Validation**:

- Complete context provided with exact schemas and implementation blueprint
- Word count utilities already implemented and tested (P2.M1)
- Clear reference implementation in hook_system.md
- Test patterns well-established in codebase
- Simple, well-defined scope with clear edge cases
- Only risk: Mocking stdin/stdout in tests can be tricky - follow patterns carefully

**Notes for Implementation Agent**:

1. Keep the reminder message EXACT - copy from PRD, don't rephrase
2. Always exit with code 0 - never block the Read action
3. Use the existing word count utilities - don't reimplement
4. Test file read errors specifically - this is a common failure point
5. Verify the .js extension in imports - ESM requirement
6. Don't forget to add to tsup.config.ts entry points
7. The hook is standalone - not part of the MCP server itself
