---
name: "P1.M2.T1 - Implement Shell Hook Script"
description: |

---

## Goal

**Feature Goal**: Create a bash shell script that serves as a Claude Code PostToolUse hook to remind agents about mdsel usage when they read large Markdown files.

**Deliverable**: A production-ready bash hook script (`hooks/claude/mdsel-reminder.sh`) that:
- Parses PostToolUse JSON input from stdin
- Detects Markdown files by extension
- Counts words using standard Unix utilities
- Outputs reminder messages via JSON when threshold exceeded
- Always exits with code 0 (non-blocking)

**Success Definition**:
- Script correctly parses PostToolUse JSON input
- Script only triggers on `.md` files
- Script accurately counts words using `wc -w`
- Script outputs proper JSON format for Claude Code to inject into conversation
- Script never blocks or fails the Read operation
- Script is executable and compatible with Linux and macOS

## User Persona (if applicable)

**Target User**: AI coding agents using Claude Code

**Use Case**: When an agent reads a Markdown file that exceeds the word threshold, the hook injects a reminder to use mdsel instead of Read.

**User Journey**:
1. Agent invokes `Read` tool on a Markdown file
2. Read operation completes successfully
3. Claude Code fires PostToolUse hook
4. Hook script checks if file is Markdown
5. Hook script counts words in file
6. If word count exceeds threshold, hook outputs JSON reminder
7. Reminder is injected into agent's context for next response

**Pain Points Addressed**:
- Agents read entire large Markdown files consuming excessive tokens
- No guidance on when to use mdsel instead of Read
- Inconsistent usage patterns across sessions

## Why

- **Token Efficiency**: Reduces token overhead from ~1300 tokens (MCP approach) to <100 tokens when mdsel is not in use
- **Behavioral Conditioning**: Actively discourages misuse of Read tool on large Markdown files through repetitive reminders
- **Cross-Platform Foundation**: Establishes the Claude Code half of the cross-platform reminder system (OpenCode plugin comes in P1.M3)
- **Selector-First Pattern**: Enforces the mdsel selector-first access pattern defined in the PRD

## What

Create a bash hook script for Claude Code that:

1. **Reads PostToolUse JSON from stdin** containing:
   - `tool_name`: The name of the tool that was executed
   - `tool_input`: Object containing tool parameters (including `file_path` for Read)
   - `tool_response`: The result of the tool execution

2. **Validates the tool is Read** - Early exit if tool_name is not "Read"

3. **Validates Markdown file** - Check if file_path ends with `.md`

4. **Counts words** - Use `wc -w < "$file_path"` for whitespace-delimited token count

5. **Compares to threshold** - Check if word count > `MDSEL_MIN_WORDS` (default: 200)

6. **Outputs JSON reminder** - If threshold exceeded, output:
   ```json
   {"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}
   ```

7. **Exits cleanly** - Always exit 0 to never block the Read operation

### Success Criteria

- [ ] Script correctly parses JSON input and extracts file_path
- [ ] Script only processes `.md` files (case-sensitive extension check)
- [ ] Word count uses `wc -w` for accuracy
- [ ] Environment variable `MDSEL_MIN_WORDS` is respected with default of 200
- [ ] JSON output is valid and matches required format
- [ ] Script handles missing `jq` gracefully (silent exit)
- [ ] Script is executable (`chmod +x` compatible)
- [ ] Script works on both Linux and macOS (GNU and BSD wc compatibility)
- [ ] Script exits 0 in all cases (non-blocking)

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Yes** - This PRP provides:
- Complete hook input/output specifications
- Exact code patterns to follow
- File structure and naming conventions
- Validation commands for testing
- Cross-platform compatibility notes

### Documentation & References

```yaml
# MUST READ - Critical for understanding Claude Code hooks

- file: plan/docs/claude_code_skills.md
  why: Complete specification of Claude Code hooks, JSON format, and exit code semantics
  section: "PostToolUse Hook (for mdsel-reminder)" lines 56-122
  critical: PostToolUse hooks cannot block; must output JSON with hookSpecificOutput.additionalContext
  gotcha: Plain text stdout is NOT automatically injected - must use specific JSON format

- file: plan/docs/external_deps.md
  why: Environment variable specification and tool dependencies
  section: "Environment Variables" table
  critical: MDSEL_MIN_WORDS default is 200; script must respect this env var

- file: PRD.md
  why: Complete project requirements and reminder content specification
  section: "6.3 Reminder Content (Normative)" lines 179-196
  critical: Reminder text is normative - no variation allowed from canonical wording

- file: PRD.md
  why: Hook implementation requirements for Claude Code
  section: "6.4 Hook Implementation: Claude Code" lines 198-219
  critical: Hook must NOT block, must NOT modify file, must exit 0

- file: plan/P1M2T1/research/bash-best-practices.md
  why: Production-ready bash patterns for JSON parsing, error handling, cross-platform compatibility
  section: "Production-Ready Template" lines 411-475
  critical: Use set -euo pipefail, check for jq availability, use cleanup functions

- file: plan/P1M2T1/research/claude-code-hooks-research.md
  why: Claude Code hook examples and configuration patterns
  section: "Exit Code Semantics" and "Stdin JSON Format"
  critical: Exit 0 for success, JSON stdin format with tool_name/tool_input/tool_response

- url: https://jqlang.github.io/jq/manual/
  why: jq documentation for JSON parsing in bash
  section: Basic filters and -r flag for raw output
  critical: Use jq -r '.tool_input.file_path' to extract string values

- url: https://www.gnu.org/software/coreutils/manual/html_node/wc-invocation.html
  why: wc command documentation for word counting
  section: wc -w for word count
  critical: Use wc -w < file (not wc -w file) to get just the number
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
/home/dustin/projects/mdsel-skill
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md          # Created in P1.M1.T1
├── plan/
│   ├── docs/
│   │   ├── claude_code_skills.md        # Hook specification
│   │   ├── external_deps.md             # Environment variables
│   │   └── ...                          # Other documentation
│   └── P1M2T1/
│       └── research/                    # This PRP location
├── PRD.md                               # Complete requirements
└── tasks.json                           # Task tracking
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
/home/dustin/projects/mdsel-skill
├── hooks/
│   └── claude/
│       └── mdsel-reminder.sh    # NEW: PostToolUse hook script for Claude Code
│                                   # Responsibilities:
│                                   # - Parse PostToolUse JSON from stdin
│                                   # - Extract file_path from tool_input
│                                   # - Check if file is .md
│                                   # - Count words using wc -w
│                                   # - Compare to MDSEL_MIN_WORDS threshold
│                                   # - Output JSON reminder if threshold exceeded
│                                   # - Always exit 0 (non-blocking)
└── ...existing files...
```

### Known Gotchas of our codebase & Library Quirks

```bash
# CRITICAL: PostToolUse hooks cannot block the operation
# The Read has already completed when this hook fires
# Exit code must ALWAYS be 0 - never use exit 1 or exit 2

# CRITICAL: JSON output format is specific for PostToolUse
# Plain text is NOT automatically injected
# Must use: {"hookSpecificOutput":{"additionalContext":"..."}}
# See: plan/docs/claude_code_skills.md lines 108-122

# CRITICAL: Reminder text is NORMATIVE - no variation allowed
# Exact text: "This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."
# See: PRD.md section 6.3

# GOTCHA: wc output format varies between GNU and BSD
# GNU wc: "  123 filename" (with filename)
# BSD wc: "  123" (just number)
# Solution: Use wc -w < "$file_path" to get just the number

# GOTCHA: jq may not be installed on all systems
# Solution: Check for jq with command -v jq, exit silently if missing
# Do NOT error out - hooks should degrade gracefully

# GOTCHA: File path may contain special characters or spaces
# Solution: Always quote variables: "$FILE_PATH"
# Use jq -r for raw output to avoid extra quotes

# GOTCHA: JSON input may be malformed or missing fields
# Solution: Use jq's // operator for defaults: jq -r '.tool_input.file_path // ""'

# CRITICAL: Script must be executable
# Use shebang: #!/usr/bin/env bash for maximum portability
# chmod +x hooks/claude/mdsel-reminder.sh

# CRITICAL: Reminder fires EVERY time, not just first time
# No suppression, no "already warned" state
# This is intentional per PRD section 6.2

# CRITICAL: Word count is whitespace-delimited tokens
# Not semantic, not cached, purely mechanical
# Use: wc -w for simple, fast counting
```

## Implementation Blueprint

### Data models and structure

No data models required - this is a pure bash script with no ORM or database interactions.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE hooks/claude/ directory structure
  - IMPLEMENT: Directory for Claude Code hook scripts
  - PLACEMENT: hooks/claude/ in project root
  - NAMING: Lowercase directory names
  - OUTPUT: Empty hooks/claude/ directory ready for script

Task 2: CREATE hooks/claude/mdsel-reminder.sh with shebang and error handling
  - IMPLEMENT: Basic script structure with proper shebang and bash strict mode
  - SHEBANG: #!/usr/bin/env bash (portable shebang)
  - STRICT MODE: set -euo pipefail (exit on error, undefined vars, pipe failures)
  - NAMING: mdsel-reminder.sh (kebab-case, descriptive)
  - PATTERN: Follow plan/P1M2T1/research/bash-best-practices.md lines 411-475
  - PLACEMENT: hooks/claude/mdsel-reminder.sh
  - OUTPUT: Executable script skeleton

Task 3: IMPLEMENT stdin JSON parsing with jq
  - IMPLEMENT: Read stdin, extract file_path using jq
  - PATTERN: HOOK_INPUT=$(cat); FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // ""')
  - ERROR HANDLING: Check if jq exists, exit 0 if missing (graceful degradation)
  - VALIDATION: Exit 0 if FILE_PATH is empty
  - REFERENCE: plan/P1M2T1/research/bash-best-practices.md lines 1-48
  - OUTPUT: Script with FILE_PATH variable populated

Task 4: IMPLEMENT Markdown file detection
  - IMPLEMENT: Check if FILE_PATH ends with .md extension
  - PATTERN: [[ "$FILE_PATH" == *.md ]] || exit 0 (early exit for non-Markdown)
  - CASE SENSITIVE: Exact .md match required
  - OUTPUT: Script that only processes Markdown files

Task 5: IMPLEMENT word count logic
  - IMPLEMENT: Count words using wc, compare to threshold
  - PATTERN: WORD_COUNT=$(wc -w < "$FILE_PATH" 2>/dev/null || echo 0)
  - THRESHOLD: THRESHOLD=${MDSEL_MIN_WORDS:-200} (env var with default)
  - COMPARISON: [ "$WORD_COUNT" -gt "$THRESHOLD" ] || exit 0
  - CROSS-PLATFORM: Use < redirect for wc to handle GNU/BSD differences
  - QUOTING: Always quote "$FILE_PATH" to handle spaces
  - OUTPUT: Script that only proceeds when threshold exceeded

Task 6: IMPLEMENT JSON reminder output
  - IMPLEMENT: Output normative reminder as JSON
  - FORMAT: echo '{"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}'
  - NORMATIVE TEXT: Exact wording from PRD.md section 6.3 - no variation
  - NEWLINE: Use \n for line break in JSON
  - OUTPUT: Complete script with JSON output

Task 7: IMPLEMENT exit code handling
  - IMPLEMENT: Ensure script always exits 0
  - PATTERN: exit 0 at end of script (explicit)
  - CRITICAL: Never use exit 1 or exit 2 (PostToolUse cannot block)
  - ERROR HANDLING: Wrap critical sections, ensure any error path leads to exit 0
  - OUTPUT: Production-ready hook script
```

### Implementation Patterns & Key Details

```bash
# === Shebang and Strict Mode ===
#!/usr/bin/env bash
# Use /usr/bin/env bash for maximum portability across systems
set -euo pipefail
# -e: Exit on error
# -u: Error on undefined variables
# -o pipefail: Exit on pipe failures

# === Main Script Structure ===
main() {
    # Read JSON input from stdin
    local hook_input
    hook_input=$(cat)

    # Extract file_path using jq with null safety
    local file_path
    file_path=$(echo "$hook_input" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || return 0

    # Early exit if no file path
    [[ -z "$file_path" ]] && exit 0

    # Early exit if not a Markdown file
    [[ "$file_path" != *.md ]] && exit 0

    # Count words with cross-platform compatible wc
    local word_count
    word_count=$(wc -w < "$file_path" 2>/dev/null || echo 0)

    # Get threshold from environment with default
    local threshold="${MDSEL_MIN_WORDS:-200}"

    # Check if threshold exceeded
    if [[ "$word_count" -gt "$threshold" ]]; then
        # Output normative reminder as JSON
        echo '{"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}'
    fi

    # Always exit 0 (non-blocking)
    exit 0
}

# === jq Availability Check ===
# Check if jq is installed before attempting to use it
if ! command -v jq >/dev/null 2>&1; then
    # Graceful degradation - exit silently if jq not available
    exit 0
fi

# === Execute Main ===
main "$@"
```

### Integration Points

```yaml
DIRECTORIES:
  - create: hooks/claude/
  - purpose: Store Claude Code hook scripts
  - permissions: Scripts must be executable (chmod +x)

CONFIG:
  - location: ~/.claude/settings.json OR project .claude/settings.json
  - configured in: P1.M2.T2 (Document Hook Configuration)
  - pattern: PostToolUse hook matching "Read" tool
  - NOT part of this task: Configuration comes in P1.M2.T2

ENVIRONMENT:
  - variable: MDSEL_MIN_WORDS
  - default: 200
  - usage: THRESHOLD="${MDSEL_MIN_WORDS:-200}"

DEPENDENCIES:
  - required: bash (version 3+)
  - required: wc (GNU or BSD coreutils)
  - optional: jq (graceful degradation if missing)
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after script creation - fix before proceeding
# Check script syntax (no actual execution)
bash -n hooks/claude/mdsel-reminder.sh
# Expected: No syntax errors

# Make script executable
chmod +x hooks/claude/mdsel-reminder.sh
# Verify executable bit is set
ls -l hooks/claude/mdsel-reminder.sh
# Expected: -rwxr-xr-x (executable)

# Validate shell script with shellcheck if available
command -v shellcheck >/dev/null 2>&1 && shellcheck hooks/claude/mdsel-reminder.sh
# Expected: No warnings or errors (if shellcheck installed)
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test JSON parsing with mock input
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"},"tool_response":{}}' | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: No output (file doesn't exist, graceful handling)

# Test with jq missing
# Temporarily hide jq
PATH=/tmp:$PATH echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: Silent exit 0

# Test Markdown detection
# Create non-Markdown file
echo "test" > /tmp/test.txt
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.txt"}}' | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: No output (not a .md file)

# Test small Markdown file
echo "small file" > /tmp/small.md
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/small.md"}}' | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: No output (under threshold)
```

### Level 3: Integration Testing (System Validation)

```bash
# Create test Markdown file over threshold
cat > /tmp/large.md << 'EOF'
# Large Markdown File

This file contains many words to test the word count threshold.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.
(Repeat to exceed 200 words...)
EOF

# Ensure file is over threshold
wc -w /tmp/large.md
# Expected: Number > 200

# Test hook with large file
echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/large.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: {"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}

# Verify JSON output is valid
echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/large.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh | jq .
# Expected: Pretty-printed JSON with hookSpecificOutput.additionalContext

# Test custom threshold
MDSEL_MIN_WORDS=5000 echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/large.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: No output (threshold not met)

# Test exit code is always 0
echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/nonexistent.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh
echo "Exit code: $?"
# Expected: Exit code: 0

# Test exit code with large file
echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/large.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh
echo "Exit code: $?"
# Expected: Exit code: 0

# Cleanup test files
rm -f /tmp/small.md /tmp/large.md /tmp/test.txt
```

### Level 4: Cross-Platform Validation

```bash
# Verify wc compatibility (GNU vs BSD)
# Create test file
echo "one two three four five" > /tmp/wc-test.txt

# Test wc output format
wc -w < /tmp/wc-test.txt
# Expected: Just "5" on both Linux and macOS

# Verify script handles both formats
echo "{\"tool_name\":\"Read\",\"tool_input\":{\"file_path\":\"/tmp/wc-test.md\"}}" | \
  bash hooks/claude/mdsel-reminder.sh
# Expected: No output (under threshold, no errors)

# Cleanup
rm -f /tmp/wc-test.txt

# Note: Full cross-platform testing requires:
# - Linux system with GNU coreutils
# - macOS system with BSD utilities
# Both should produce identical behavior
```

## Final Validation Checklist

### Technical Validation

- [ ] Script exists at hooks/claude/mdsel-reminder.sh
- [ ] Script is executable (chmod +x)
- [ ] Script passes bash -n syntax check
- [ ] Script passes shellcheck (if available)
- [ ] jq dependency check implemented (graceful degradation)
- [ ] wc -w word counting works correctly
- [ ] JSON output is valid and parseable by jq
- [ ] Exit code is always 0 (never blocks)

### Feature Validation

- [ ] Only processes .md files (case-sensitive)
- [ ] Respects MDSEL_MIN_WORDS environment variable
- [ ] Default threshold is 200 when env var not set
- [ ] Outputs correct JSON format with hookSpecificOutput
- [ ] Reminder text matches normative wording exactly
- [ ] No output for files under threshold
- [ ] JSON reminder output for files over threshold

### Code Quality Validation

- [ ] Uses #!/usr/bin/env bash shebang
- [ ] Implements set -euo pipefail for error handling
- [ ] All variables are properly quoted ("$VAR")
- [ ] Early exits for non-Markdown files
- [ ] Early exits for missing file_path
- [ ] Handles file read errors gracefully (2>/dev/null)
- [ ] No blocking exit codes (only exit 0)

### Documentation & Deployment

- [ ] Script is self-documenting with clear variable names
- [ ] Comments explain non-obvious logic (if any)
- [ ] Research files stored in plan/P1M2T1/research/
- [ ] Ready for P1.M2.T2 (configuration documentation)

---

## Anti-Patterns to Avoid

- **Don't use exit 1 or exit 2**: PostToolUse hooks cannot block - must always exit 0
- **Don't output plain text**: JSON output format is required for injection
- **Don't modify reminder text**: Wording is normative per PRD section 6.3
- **Don't add "first time only" logic**: Reminder fires every time intentionally
- **Don't error on missing jq**: Graceful degradation, not hard requirement
- **Don't use wc -w file**: Use wc -w < file for cross-platform compatibility
- **Don't forget to quote variables**: "$FILE_PATH" to handle spaces/special chars
- **Don't cache state**: Script is stateless, runs fresh each time
- **Don't check tool_name in JSON**: PostToolUse matcher in config handles this
- **Don't read file content**: Only count words, don't read entire file

## Confidence Score

**9/10** - One-pass implementation success likelihood is very high

**Justification**:
- Complete JSON input/output specification provided
- Exact code patterns and gotchas documented
- Cross-platform compatibility considerations addressed
- Comprehensive validation commands provided
- Research files with examples available
- Only 1 point deduction due to jq dependency complexity (but graceful degradation specified)

**To achieve 10/10**: Would need example configurations from actual Claude Code setups, but current documentation is sufficient for implementation
