name: "PRP: P2.M2.T1 - Implement Hook Script"
description: |

---

## Goal

**Feature Goal**: Create a bash hook script that automatically reminds users to use `mdsel_index` and `mdsel_select` instead of the `Read` tool when accessing large Markdown files (files exceeding the `MDSEL_MIN_WORDS` threshold).

**Deliverable**: A bash hook script at `hooks/PreToolUse.d/mdsel-reminder.sh` that:
1. Fires on every `Read` tool invocation via the Claude Code PreToolUse hook system
2. Detects Markdown files by extension (`.md`)
3. Computes word count using `wc -w` (mechanical, whitespace-delimited counting)
4. Returns a canonical reminder message when the threshold is exceeded
5. Always exits with "approve" (non-blocking, informational only)

**Success Definition**:
- Hook script executes without errors on all `Read` tool invocations
- Correctly identifies Markdown files by extension
- Word counting matches `wc -w` behavior (matches TypeScript `countWords` utility)
- Threshold comparison uses `MDSEL_MIN_WORDS` environment variable (default: 200)
- Canonical reminder message is displayed EXACTLY as specified when threshold exceeded
- Hook never blocks the agent (always returns `decision: "approve"`)

## User Persona

**Target User**: Claude Code AI agent users who interact with large Markdown documentation files.

**Use Case**: When an AI agent attempts to read a large Markdown file (>200 words by default) using the `Read` tool, the hook injects a reminder suggesting the use of `mdsel_index` and `mdsel_select` tools instead for more token-efficient access.

**User Journey**:
1. Agent invokes `Read` tool on any file
2. Claude Code fires PreToolUse hooks, including `mdsel-reminder.sh`
3. Hook receives JSON input via stdin with `tool_input.file_path`
4. Hook checks if file is Markdown (`.md` extension)
5. If Markdown and exists, hook counts words using `wc -w`
6. If word count > threshold, hook returns reminder message
7. Agent sees reminder but Read operation proceeds (non-blocking)

**Pain Points Addressed**:
- Large Markdown files waste tokens when read entirely
- Users need guidance on when to use selector-based access
- Behavioral conditioning needed for efficient tool usage patterns

## Why

- **Token Efficiency**: Reading entire large Markdown files consumes excessive tokens; `mdsel_select` provides surgical access to specific sections.
- **User Guidance**: Agents need clear, contextual reminders about tool alternatives; the hook provides just-in-time guidance at the moment of Read invocation.
- **Behavioral Conditioning**: Consistent reminders train agents to prefer `mdsel_index` + `mdsel_select` for large files, reducing unnecessary token consumption.
- **Integration with P2.M1**: Builds on word count and config utilities (`countWords`, `loadConfig`) implemented in P2.M1 for threshold detection.

## What

A bash PreToolUse hook script that:
1. **Intercepts Read tool calls** via Claude Code's hook system using the `# matcher: {"toolNames": ["Read"]}` directive
2. **Filters for Markdown files** by checking `.md` file extension (case-insensitive: `.md`, `.MD`, `.markdown`)
3. **Computes mechanical word count** using `wc -w` (whitespace-delimited, matches TypeScript `countWords` utility)
4. **Applies threshold comparison** using `MDSEL_MIN_WORDS` environment variable (default: 200)
5. **Returns canonical reminder** when threshold exceeded: `"This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."`
6. **Never blocks execution** - always returns `decision: "approve"` with optional `reason` field

### Success Criteria

- [ ] Hook script exists at `hooks/PreToolUse.d/mdsel-reminder.sh` with executable permissions (`chmod +x`)
- [ ] Hook script starts with correct shebang (`#!/bin/bash`) and matcher comment
- [ ] Hook script correctly parses JSON input from stdin to extract `file_path`
- [ ] Hook script correctly identifies Markdown files by extension (`.md`)
- [ ] Hook script uses `wc -w` for word counting (matches TypeScript `countWords` behavior)
- [ ] Hook script reads `MDSEL_MIN_WORDS` environment variable with default fallback to 200
- [ ] Hook script outputs EXACT canonical reminder message when threshold exceeded
- [ ] Hook script always exits with code 0 and `decision: "approve"` (non-blocking)
- [ ] Hook script handles all error cases gracefully (missing jq, invalid JSON, missing file) with "fail open" behavior

## All Needed Context

### Context Completeness Check

_This PRP passes the "No Prior Knowledge" test - an implementer unfamiliar with the codebase has everything needed to implement this hook script successfully._

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://stedolan.github.io/jq/manual/
  why: jq is required for JSON parsing in the hook script; manual covers extraction patterns like '.tool_input.file_path'
  critical: Use '-r' flag for raw string output to avoid quotes in extracted values

- url: https://www.gnu.org/software/coreutils/manual/html_node/wc-invocation.html
  why: wc -w is used for mechanical word counting; manual covers exact behavior (whitespace-delimited tokens)
  critical: wc -w counts words separated by whitespace, matching TypeScript countWords utility exactly

- file: plan/docs/architecture/implementation_patterns.md
  why: Contains complete PreToolUse hook script pattern (lines 148-186) with exact structure to follow
  pattern: Hook script with matcher comment, stdin JSON reading, jq parsing, file extension check, word count, JSON response
  gotcha: Hook location in project is `hooks/PreToolUse.d/` not `~/.claude/hooks/PreToolUse.d/` (user installs to their home directory)

- file: plan/docs/architecture/external_deps.md
  why: Documents Claude Code hook behavior (lines 215-234), response format, and integration details
  pattern: Hook response JSON format with `decision` and optional `reason` fields
  gotcha: PreToolUse hooks are NON-BLOCKING - they only provide informational messages

- file: src/utils/config.ts
  why: Shows environment variable handling pattern for MDSEL_MIN_WORDS (default 200, fallback on invalid input)
  pattern: Use "${MDSEL_MIN_WORDS:-200}" bash syntax for default value
  gotcha: Handle invalid/non-numeric values by falling back to default (fail open)

- file: src/utils/word-count.ts
  why: Documents mechanical word counting algorithm that hook must replicate
  pattern: Trim whitespace, split on /\s+/, filter empty tokens, count length
  gotcha: wc -w matches this behavior exactly - use wc -w < "$FILE_PATH" to avoid filename in output

- file: tasks.json
  why: Task P2.M2.T1 subtasks S1/S2/S3 define exact implementation order and requirements
  pattern: S1=structure, S2=detection+word count, S3=canonical reminder output
  gotcha: Canonical reminder message wording is EXACT - no variation allowed (see P2.M2.T1.S3 context_scope)
```

### Current Codebase tree

```bash
mdsel-claude-attempt-2/
├── src/
│   ├── index.ts                  # MCP server entry point
│   ├── executor.ts               # Child process executor for mdsel CLI
│   ├── tools/
│   │   ├── index.ts              # mdsel_index tool handler
│   │   ├── select.ts             # mdsel_select tool handler
│   │   ├── index.test.ts         # Tool tests
│   │   └── select.test.ts        # Select tool tests
│   ├── utils/
│   │   ├── config.ts             # Config: loadConfig(), MDSEL_MIN_WORDS env var
│   │   ├── config.test.ts        # Config utility tests
│   │   ├── word-count.ts         # Word count: countWords() function
│   │   └── word-count.test.ts    # Word count tests
│   ├── index.test.ts             # Main server tests
│   └── executor.test.ts          # Executor tests
├── hooks/                        # Hook scripts directory (CREATE THIS)
│   └── PreToolUse.d/             # PreToolUse hooks directory (CREATE THIS)
│       └── mdsel-reminder.sh     # Hook script to CREATE (P2.M2.T1 deliverable)
├── plan/
│   ├── docs/
│   │   └── architecture/
│   │       ├── implementation_patterns.md  # Hook script pattern reference
│   │       └── external_deps.md            # Hook integration details
│   └── P2M2T1/
│       └── PRP.md                # This PRP document
├── dist/                         # Built JavaScript output (from tsup)
├── node_modules/                 # Dependencies
├── coverage/                     # Test coverage reports
├── package.json                  # Project configuration
├── tsconfig.json                 # TypeScript configuration
├── tsup.config.ts               # Build configuration
├── vitest.config.ts              # Test configuration
└── tasks.json                    # Task definitions (P2.M2.T1 is current task)
```

### Desired Codebase tree with files to be added

```bash
# NEW FILES TO CREATE:
hooks/                           # NEW: Hook scripts directory
└── PreToolUse.d/                # NEW: PreToolUse hooks directory
    └── mdsel-reminder.sh        # NEW: Hook script (P2.M2.T1 deliverable)
        # Responsibility: Intercept Read tool calls, detect large Markdown files,
        # inject canonical reminder message, always approve (non-blocking)
```

### Known Gotchas of our codebase & Library Quirks

```bash
# CRITICAL: Claude Code PreToolUse hooks are NON-BLOCKING
# The hook CANNOT prevent a tool from being invoked - it only provides informational messages
# The 'decision' field MUST be 'approve' - 'reject' or 'modify' are not supported

# CRITICAL: Canonical reminder message wording is EXACT
# "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."
# Do NOT vary this message - it is specified in PRD Section 6.3 and tasks.json P2.M2.T1.S3

# CRITICAL: Hook must "fail open" - never block the agent due to errors
# If jq is missing: output '{"decision": "approve"}' and exit 0
# If JSON is invalid: output '{"decision": "approve"}' and exit 0
# If file doesn't exist: output '{"decision": "approve"}' and exit 0
# If word count fails: output '{"decision": "approve"}' and exit 0

# GOTCHA: wc -w outputs filename when not using redirection
# WRONG: WORD_COUNT=$(wc -w "$FILE_PATH")     # Outputs "1234 /path/to/file.md"
# RIGHT: WORD_COUNT=$(wc -w < "$FILE_PATH")   # Outputs only "1234"

# GOTCHA: jq extraction requires -r flag for raw strings (no quotes)
# WRONG: FILE_PATH=$(echo "$INPUT" | jq '.tool_input.file_path')  # Outputs "/path/file.md" with quotes
# RIGHT: FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')  # Outputs /path/file.md without quotes

# GOTCHA: Bash variable expansion for defaults uses :- syntax
# "${MDSEL_MIN_WORDS:-200}" means: use MDSEL_MIN_WORDS if set and non-empty, else use "200"

# GOTCHA: File extension check is case-sensitive by default
# if [[ "$FILE_PATH" != *.md ]] will NOT match .MD or .Md
# Use bash 4+ ${VAR,,} for lowercase or add explicit checks for variations

# PATTERN: Hook location in PROJECT is hooks/PreToolUse.d/
# User will INSTALL to ~/.claude/hooks/PreToolUse.d/ (documented in P2.M2.T2, not this task)
# Do NOT create files in ~/.claude/ - that's the user's home directory, not the project
```

## Implementation Blueprint

### Data models and structure

No data models - this is a bash script, not TypeScript. The hook works with:

**Input JSON Structure (from Claude Code via stdin)**:
```json
{
  "tool_input": {
    "file_path": "/absolute/path/to/file.md"
  }
}
```

**Output JSON Structure (to Claude Code via stdout)**:
```json
{
  "decision": "approve",
  "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."
}
```

**Configuration**:
- Environment variable: `MDSEL_MIN_WORDS` (default: 200)
- Read via bash parameter expansion: `${MDSEL_MIN_WORDS:-200}`

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE hooks/PreToolUse.d/mdsel-reminder.sh (Hook Script Structure - P2.M2.T1.S1)
  - IMPLEMENT: Bash script skeleton with shebang and matcher comment
  - FOLLOW pattern: plan/docs/architecture/implementation_patterns.md lines 148-186
  - NAMING: mdsel-reminder.sh (snake_case with .sh extension)
  - SHEBANG: #!/bin/bash (must be first line)
  - MATCHER: # matcher: {"toolNames": ["Read"]} (second line, tells Claude Code to fire on Read tool only)
  - INPUT: Read JSON from stdin using INPUT=$(cat)
  - JSON PARSING: Extract file_path using jq: FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  - PLACEMENT: hooks/PreToolUse.d/mdsel-reminder.sh (create both directories)
  - EXECUTABLE: chmod +x hooks/PreToolUse.d/mdsel-reminder.sh (make executable)

Task 2: IMPLEMENT Markdown File Detection and Word Count Check (P2.M2.T1.S2)
  - ADD: File extension check for .md files
  - PATTERN: if [[ "$FILE_PATH" != *.md ]]; then echo '{"decision": "approve"}'; exit 0; fi
  - CASE-INSENSITIVE: Use bash 4+ ${FILE_PATH,,} for lowercase comparison or check for .md and .markdown
  - ADD: File existence check: if [[ ! -f "$FILE_PATH" ]]; then echo '{"decision": "approve"}'; exit 0; fi
  - ADD: Word count using wc -w: WORD_COUNT=$(wc -w < "$FILE_PATH")
  - VALIDATION: Ensure WORD_COUNT is numeric: if ! [[ "$WORD_COUNT" =~ ^[0-9]+$ ]]; then WORD_COUNT=0; fi
  - ADD: Threshold from environment: THRESHOLD="${MDSEL_MIN_WORDS:-200}"
  - COMPARISON: if [[ "$WORD_COUNT" -gt "$THRESHOLD" ]]; then # trigger reminder
  - DEPENDENCIES: Requires Task 1 (hook script skeleton)
  - GOTCHA: Use wc -w < "$FILE_PATH" (redirection) to avoid filename in output

Task 3: IMPLEMENT Canonical Reminder Response (P2.M2.T1.S3)
  - ADD: Conditional response based on word count comparison
  - OVER THRESHOLD: echo '{"decision": "approve", "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}'
  - UNDER THRESHOLD: echo '{"decision": "approve"}'
  - EXIT: Always exit 0 (non-blocking)
  - MESSAGE: EXACT wording - no variation allowed (see tasks.json P2.M2.T1.S3)
  - DEPENDENCIES: Requires Task 2 (word count check)
  - GOTCHA: JSON must be valid - use single quotes for entire string to avoid shell escaping

Task 4: ADD Error Handling (Fail-Open Behavior)
  - ADD: jq availability check at script start: if ! command -v jq &> /dev/null; then echo '{"decision": "approve"}'; exit 0; fi
  - ADD: JSON validation before parsing: if ! echo "$INPUT" | jq . > /dev/null 2>&1; then echo '{"decision": "approve"}'; exit 0; fi
  - ADD: Empty file_path check: if [[ -z "$FILE_PATH" ]]; then echo '{"decision": "approve"}'; exit 0; fi
  - PATTERN: All error paths return '{"decision": "approve"}' - never block the agent
  - DEPENDENCIES: Builds on Task 1-3
  - GOTCHA: Use 2>/dev/null to suppress jq error output (don't pollute stdout)

Task 5: CREATE Manual Test Script (Optional but Recommended)
  - CREATE: tests/test-hook.sh or hooks/test-mdsel-reminder.sh
  - IMPLEMENT: Test harness that simulates JSON input and validates output
  - TEST CASES:
    - Non-Markdown file (should approve without reason)
    - Small Markdown file (< threshold, should approve without reason)
    - Large Markdown file (> threshold, should approve with reason)
    - Invalid JSON input (should approve without reason)
    - Missing file (should approve without reason)
  - ASSERTION: Use jq to validate response structure: echo "$OUTPUT" | jq -e '.decision == "approve"'
  - PLACEMENT: tests/test-hook.sh or hooks/test-mdsel-reminder.sh
  - EXECUTABLE: chmod +x tests/test-hook.sh
```

### Implementation Patterns & Key Details

```bash
# =============================================================================
# COMPLETE HOOK SCRIPT TEMPLATE (Copy and Modify)
# =============================================================================

#!/bin/bash
# hooks/PreToolUse.d/mdsel-reminder.sh
# matcher: {"toolNames": ["Read"]}

# -----------------------------------------------------------------------------
# PATTERN 1: Fail-Open Error Handling
# Hook must never block the agent - all errors result in bare approval
# -----------------------------------------------------------------------------

# Check if jq is available (required for JSON parsing)
if ! command -v jq &> /dev/null; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 2: Read JSON Input from Stdin
# Claude Code sends JSON payload via stdin with tool_input.file_path field
# -----------------------------------------------------------------------------

INPUT=$(cat)

# Validate JSON is well-formed
if ! echo "$INPUT" | jq . > /dev/null 2>&1; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 3: Extract File Path with Default
# Use jq -r for raw string (no quotes), // empty for default if missing
# -----------------------------------------------------------------------------

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If no file path, approve (fail open)
if [[ -z "$FILE_PATH" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 4: Markdown File Detection (Extension Check)
# Check for .md extension (case-insensitive)
# -----------------------------------------------------------------------------

# Get file extension (lowercase for case-insensitive comparison)
EXTENSION="${FILE_PATH##*.}"
EXTENSION="${EXTENSION,,}"  # Bash 4+ lowercase conversion

# Only process Markdown files
if [[ "$EXTENSION" != "md" && "$EXTENSION" != "markdown" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 5: File Existence and Readability Check
# Ensure file exists before attempting word count
# -----------------------------------------------------------------------------

if [[ ! -f "$FILE_PATH" || ! -r "$FILE_PATH" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 6: Mechanical Word Count using wc -w
# CRITICAL: Use redirection (<) to avoid filename in output
# This matches TypeScript countWords utility behavior exactly
# -----------------------------------------------------------------------------

WORD_COUNT=$(wc -w < "$FILE_PATH" 2>/dev/null || echo "0")

# Validate word count is numeric
if ! [[ "$WORD_COUNT" =~ ^[0-9]+$ ]]; then
  WORD_COUNT=0
fi

# -----------------------------------------------------------------------------
# PATTERN 7: Threshold Configuration with Default
# Use MDSEL_MIN_WORDS environment variable, default to 200 if unset
# -----------------------------------------------------------------------------

THRESHOLD="${MDSEL_MIN_WORDS:-200}"

# Validate threshold is numeric
if ! [[ "$THRESHOLD" =~ ^[0-9]+$ ]]; then
  THRESHOLD=200
fi

# -----------------------------------------------------------------------------
# PATTERN 8: Canonical Reminder Response
# EXACT message wording - no variation allowed
# Always return decision: "approve" with optional reason field
# -----------------------------------------------------------------------------

if [[ "$WORD_COUNT" -gt "$THRESHOLD" ]]; then
  # CRITICAL: This message must be EXACT as specified in PRD Section 6.3
  echo '{"decision": "approve", "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}'
else
  echo '{"decision": "approve"}'
fi

# -----------------------------------------------------------------------------
# PATTERN 9: Clean Exit
# Always exit 0 - non-zero exit codes may be treated as hook failures
# -----------------------------------------------------------------------------

exit 0

# =============================================================================
# END OF HOOK SCRIPT TEMPLATE
# =============================================================================
```

### Integration Points

```yaml
CLAUDE_CODE_HOOK_SYSTEM:
  - hook_type: "PreToolUse"
  - hook_directory: "~/.claude/hooks/PreToolUse.d/" (user's home directory, NOT project)
  - project_location: "hooks/PreToolUse.d/mdsel-reminder.sh" (for distribution)
  - installation_command: "mkdir -p ~/.claude/hooks/PreToolUse.d/ && cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/ && chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh"
  - trigger: "Every Read tool invocation"

ENVIRONMENT_CONFIG:
  - variable: "MDSEL_MIN_WORDS"
  - default: 200
  - usage: "${MDSEL_MIN_WORDS:-200}"
  - set_in: Shell profile (.bashrc, .zshrc) or Claude Code environment

EXTERNAL_DEPENDENCIES:
  - required: "jq" (JSON processor)
  - install_command: "sudo apt-get install jq" or "brew install jq"
  - fallback: "Fail open with bare approval if jq missing"

WORD_COUNT_BEHAVIOR:
  - method: "wc -w" (Unix word count command)
  - definition: "Whitespace-delimited token count"
  - matches: "TypeScript countWords utility in src/utils/word-count.ts"
  - gotcha: "Use wc -w < file (redirection) not wc -w file (includes filename in output)"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after creating hook script - fix before proceeding

# Check bash syntax (catches syntax errors, missing quotes, etc.)
bash -n hooks/PreToolUse.d/mdsel-reminder.sh

# Check script is executable
ls -l hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: -rwxr-xr-x (executable permissions)

# Run ShellCheck (if available) for additional linting
shellcheck hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: No errors (warnings are acceptable but review them)

# Verify jq is available (required dependency)
jq --version
# Expected: jq-1.6 or later (any version should work)

# Verify wc -w behaves correctly on test input
echo "hello world this is a test" | wc -w
# Expected: 6

# Expected: Zero syntax errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Manual Testing (Component Validation)

```bash
# Create test Markdown files for validation

mkdir -p /tmp/mdsel-hook-test
cd /tmp/mdsel-hook-test

# Test 1: Small Markdown file (under threshold)
cat > small.md << 'EOF'
# Small File

This is a small Markdown file with fewer than 200 words.
EOF
# Word count: ~13 words (under default threshold of 200)

# Test 2: Large Markdown file (over threshold)
cat > large.md << 'EOF'
# Large File

EOF
# Add 201+ words to large.md
for i in {1..201}; do echo "word$i"; done >> large.md

# Test 3: Non-Markdown file
cat > test.txt << 'EOF'
This is a text file, not Markdown.
EOF

# Test 4: Empty Markdown file
touch empty.md

# =============================================================================
# MANUAL HOOK TESTING
# =============================================================================

# Test 1: Non-Markdown file (should approve without reason)
echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/test.txt"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"}

# Test 2: Small Markdown file (should approve without reason)
echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/small.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"}

# Test 3: Large Markdown file (should approve with reason)
echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/large.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve","reason":"This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}

# Test 4: Empty Markdown file (should approve without reason)
echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/empty.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"}

# Test 5: Invalid JSON (should approve without reason)
echo 'invalid json' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"}

# Test 6: Missing file (should approve without reason)
echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/nonexistent.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"}

# Test 7: Custom threshold (should approve without reason if under custom threshold)
MDSEL_MIN_WORDS=500 echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/large.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: {"decision":"approve"} (201 words < 500 threshold)

# Test 8: Verify JSON output is valid
OUTPUT=$(echo '{"tool_input":{"file_path":"/tmp/mdsel-hook-test/large.md"}}' | \
  /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh)
echo "$OUTPUT" | jq .
# Expected: Pretty-printed JSON with decision and reason fields

# Expected: All tests pass with expected JSON output. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# Install hook to Claude Code hooks directory for end-to-end testing
mkdir -p ~/.claude/hooks/PreToolUse.d/
cp /home/dustin/projects/mdsel-claude-attempt-2/hooks/PreToolUse.d/mdsel-reminder.sh \
   ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Verify hook is installed and executable
ls -la ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Test with actual Claude Code invocation (if available)
# This requires Claude Code CLI or MCP client
# The hook will automatically fire on Read tool invocations

# To test without Claude Code, use the manual testing from Level 2
# The hook behavior is identical when invoked by Claude Code

# Cleanup test files
rm -rf /tmp/mdsel-hook-test

# Expected: Hook installed successfully in ~/.claude/hooks/PreToolUse.d/
# Expected: All manual tests from Level 2 pass
```

### Level 4: Word Count Alignment Validation

```bash
# Verify hook script wc -w behavior matches TypeScript countWords utility

# Create a test file with known word count
cat > /tmp/word-count-test.md << 'EOF'
# Test File

This is a test file with multiple words.

Some words have    extra    whitespace.

And line
breaks
too.
EOF

# Count words using wc -w (hook method)
WC_COUNT=$(wc -w < /tmp/word-count-test.md)
echo "wc -w count: $WC_COUNT"
# Expected: 20 words

# Count words using TypeScript utility (for comparison)
node -e "
import { readFileSync } from 'fs';
const content = readFileSync('/tmp/word-count-test.md', 'utf-8');
const trimmed = content.trim();
const tokens = trimmed.split(/\s+/);
const count = tokens.filter(t => t.length > 0).length;
console.log('TypeScript countWords:', count);
"
# Expected: TypeScript countWords: 20

# Verify counts match
if [[ "$WC_COUNT" -eq 20 ]]; then
  echo "SUCCESS: Word count alignment verified"
else
  echo "FAILURE: Word count mismatch - wc -w returned $WC_COUNT, expected 20"
fi

# Cleanup
rm /tmp/word-count-test.md

# Expected: Both methods return identical word counts (20 in this test case)
```

## Final Validation Checklist

### Technical Validation

- [ ] Hook script exists at `hooks/PreToolUse.d/mdsel-reminder.sh`
- [ ] Hook script is executable (`chmod +x` applied)
- [ ] Bash syntax check passes: `bash -n hooks/PreToolUse.d/mdsel-reminder.sh`
- [ ] Hook script starts with `#!/bin/bash` shebang
- [ ] Hook script has matcher comment: `# matcher: {"toolNames": ["Read"]}`
- [ ] All Level 2 manual tests pass with expected output
- [ ] Hook script uses `wc -w < "$FILE_PATH"` (redirection, not direct path)
- [ ] Hook script uses `jq -r` for raw string extraction
- [ ] Hook script reads `MDSEL_MIN_WORDS` with default fallback to 200
- [ ] Canonical reminder message is EXACT as specified

### Feature Validation

- [ ] Non-Markdown files return `{"decision": "approve"}` without reason
- [ ] Small Markdown files (< threshold) return `{"decision": "approve"}` without reason
- [ ] Large Markdown files (> threshold) return `{"decision": "approve"}` with canonical reason
- [ ] Invalid JSON input returns `{"decision": "approve"}` without error
- [ ] Missing files return `{"decision": "approve"}` without error
- [ ] Missing `jq` dependency returns `{"decision": "approve"}` without error
- [ ] Custom `MDSEL_MIN_WORDS` value is respected
- [ ] Hook never blocks execution (always returns `decision: "approve"`)

### Code Quality Validation

- [ ] Follows implementation pattern from `plan/docs/architecture/implementation_patterns.md`
- [ ] File placement matches desired codebase tree (`hooks/PreToolUse.d/`)
- [ ] Error handling follows "fail open" pattern (all errors result in bare approval)
- [ ] No blocking behavior (exit code always 0, decision always "approve")
- [ ] JSON output is valid and parseable by `jq`
- [ ] Word counting matches TypeScript `countWords` utility behavior

### Documentation & Deployment

- [ ] Hook script is self-documenting with clear comments
- [ ] Environment variable `MDSEL_MIN_WORDS` is documented in comments
- [ ] Hook script is ready for user installation to `~/.claude/hooks/PreToolUse.d/`
- [ ] Hook script does NOT create files in user's home directory (that's P2.M2.T2)

---

## Anti-Patterns to Avoid

- **Don't create files in `~/.claude/`**: That's the user's home directory. Project files go in `hooks/PreToolUse.d/`. User installation is documented in P2.M2.T2, not this task.
- **Don't use `decision: "reject"` or `decision: "modify"`**: PreToolUse hooks only support `decision: "approve"` - they are non-blocking.
- **Don't vary the canonical reminder message**: The message wording is EXACT as specified in PRD Section 6.3. No rewording, no typos, no additions.
- **Don't block on errors**: Always "fail open" with `{"decision": "approve"}`. If jq is missing, JSON is invalid, or file doesn't exist - still approve.
- **Don't use `wc -w "$FILE_PATH"`**: Use `wc -w < "$FILE_PATH"` (redirection) to avoid filename in output.
- **Don't forget `-r` flag for jq**: Use `jq -r` for raw string output to avoid quotes in extracted values.
- **Don't use `set -e`**: Hooks should "fail open" - explicit error handling is better than immediate exit on any error.
- **Don't output to stdout except JSON response**: Debug messages go to stderr (`>&2`), never stdout.
- **Don't exit with non-zero code**: Always `exit 0`. Non-zero exit codes may be treated as hook failures.
- **Don't make file extension check case-sensitive without handling variations**: Use `${VAR,,}` for lowercase or check `.md`, `.MD`, `.markdown` explicitly.
