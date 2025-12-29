name: "PRP: P2.M2.T2 - Hook Installation Documentation"
description: |

---

## Goal

**Feature Goal**: Create comprehensive user documentation that explains how to install the `mdsel-reminder.sh` PreToolUse hook in the user's Claude Code configuration.

**Deliverable**: A new section in the project README.md (or a standalone HOOKS.md file) that provides:
1. Clear step-by-step installation instructions for the hook
2. Explanation of what the hook does and when it fires
3. Configuration options (MDSEL_MIN_WORDS environment variable)
4. Verification steps to confirm the hook is working
5. Troubleshooting guidance for common issues

**Success Definition**:
- Users can successfully install the hook by following the documentation
- Documentation covers all major operating systems (Linux, macOS, Windows with WSL)
- Users understand what the hook does and when it will trigger
- Users know how to configure the threshold via MDSEL_MIN_WORDS
- Documentation includes troubleshooting for common issues (permissions, jq dependency, etc.)

## User Persona

**Target User**: Developers and AI agent users who have installed the mdsel-claude MCP server and want to enable behavioral conditioning reminders for large Markdown file access.

**Use Case**: A user has installed the mdsel-claude MCP server and wants the AI agent to receive automatic reminders when attempting to read large Markdown files, guiding them to use mdsel_index and mdsel_select instead.

**User Journey**:
1. User reads the README or HOOKS documentation
2. User follows installation commands to copy hook to ~/.claude/hooks/PreToolUse.d/
3. User sets executable permissions on the hook script
4. User optionally configures MDSEL_MIN_WORDS environment variable
5. User verifies installation by checking hook file exists and is executable
6. User tests hook by triggering a Read tool invocation on a large Markdown file
7. User sees the reminder message in the agent response

**Pain Points Addressed**:
- Users don't know where Claude Code hooks are installed
- Users don't know how to make shell scripts executable
- Users don't understand what the hook does or when it fires
- Users don't know how to customize the word count threshold
- Users encounter issues (missing jq, wrong permissions) without guidance

## Why

- **Discoverability**: The hook script exists in the project but users won't know about it without clear documentation.
- **Correct Installation**: Hooks must be installed in the specific `~/.claude/hooks/PreToolUse.d/` directory - documentation prevents installation errors.
- **Feature Understanding**: Users need to understand what the hook does (non-blocking reminder) and when it fires (Read tool on large Markdown files).
- **Configuration**: Advanced users need to know how to customize the MDSEL_MIN_WORDS threshold.
- **Troubleshooting**: Common issues (missing jq, permissions, wrong directory) need clear resolution steps.
- **Cross-Platform**: Documentation must support Linux, macOS, and Windows (via WSL) users.

## What

A new documentation section (in README.md or HOOKS.md) that includes:
1. **Overview**: What the hook does and why it's useful
2. **Prerequisites**: jq dependency check, bash/shell access
3. **Installation Steps**: Step-by-step commands for Linux/macOS/Windows
4. **Configuration**: How to set MDSEL_MIN_WORDS environment variable
5. **Verification**: Commands to confirm hook is installed and working
6. **Troubleshooting**: Common issues and solutions
7. **Uninstallation**: How to remove the hook if needed

### Success Criteria

- [ ] Documentation exists in README.md (new "PreToolUse Hook Installation" section) or HOOKS.md
- [ ] Installation commands are copy-paste ready (complete shell commands)
- [ ] Documentation covers Linux, macOS, and Windows (WSL) platforms
- [ ] Prerequisites section mentions jq requirement
- [ ] Configuration section explains MDSEL_MIN_WORDS with examples
- [ ] Verification section includes commands to test hook installation
- [ ] Troubleshooting covers: missing jq, permission denied, wrong directory, hook not firing
- [ ] Uninstallation instructions are provided
- [ ] Code blocks use proper syntax highlighting (bash, sh, etc.)
- [ ] File paths use correct format (~/.claude/hooks/PreToolUse.d/)

## All Needed Context

### Context Completeness Check

_This PRP passes the "No Prior Knowledge" test - an implementer unfamiliar with the codebase has everything needed to write comprehensive hook installation documentation._

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: hooks/PreToolUse.d/mdsel-reminder.sh
  why: This is the hook script being documented; you need to understand what it does to document it
  pattern: Read the entire script to understand: matcher directive, file detection, word count logic, reminder message
  gotcha: The hook is NON-BLOCKING - always returns "approve" - this is key to communicate to users

- file: plan/P2M2T1/PRP.md
  why: Previous task's PRP documents the hook implementation details
  pattern: Sections "Goal", "User Persona", "Implementation Patterns & Key Details" explain hook behavior
  gotcha: Hook location in PROJECT is hooks/PreToolUse.d/ but users install to ~/.claude/hooks/PreToolUse.d/

- file: src/utils/config.ts
  why: Documents MDSEL_MIN_WORDS environment variable handling (default 200)
  pattern: Use "${MDSEL_MIN_WORDS:-200}" bash syntax for default value
  gotcha: Users need to know how to set this in their shell profile (.bashrc, .zshrc, etc.)

- file: README.md
  why: Existing README to understand current documentation structure and tone
  pattern: Follow existing Markdown formatting, heading hierarchy, code block style
  gotcha: If README doesn't exist, create HOOKS.md as a standalone file

- url: https://gist.github.com/nicmcd/0ec20bcb80969877af2651502ca78fbb
  why: Example of PreToolUse hook documentation from Claude Code community
  critical: Shows standard hook installation pattern used by Claude Code users
  gotcha: Claude Code hooks live in ~/.claude/hooks/PreToolUse.d/

# EXTERNAL DOCUMENTATION PATTERNS (for reference)
- url: https://typicode.github.io/husky/
  why: Husky is the gold standard for hook installation documentation
  pattern: Progressive installation (basic → advanced), platform-specific commands, troubleshooting section
  critical: Copy the structure: Quick Start → Installation → Configuration → Troubleshooting

- url: https://pre-commit.com/#installation
  why: Pre-commit framework has excellent hook installation docs
  pattern: Clear prerequisites, step-by-step commands, verification steps
  critical: Include verification commands so users can confirm installation worked

- url: https://docs.github.com/en/actions/using-workflows
  why: GitHub Actions docs show good technical documentation structure
  pattern: Code blocks with syntax highlighting, platform-specific tabs (if using tabs), troubleshooting
```

### Current Codebase tree

```bash
mdsel-claude-attempt-2/
├── src/
│   ├── index.ts                  # MCP server entry point
│   ├── executor.ts               # Child process executor
│   ├── tools/
│   │   ├── index.ts              # mdsel_index tool
│   │   ├── select.ts             # mdsel_select tool
│   │   ├── index.test.ts
│   │   └── select.test.ts
│   ├── utils/
│   │   ├── config.ts             # Config: MDSEL_MIN_WORDS env var
│   │   ├── config.test.ts
│   │   ├── word-count.ts         # Word count utility
│   │   └── word-count.test.ts
│   ├── index.test.ts
│   └── executor.test.ts
├── hooks/                        # Hook scripts for distribution
│   └── PreToolUse.d/             # PreToolUse hooks
│       └── mdsel-reminder.sh     # Hook script (IMPLEMENTED in P2.M2.T1)
├── plan/
│   ├── docs/
│   │   └── architecture/
│   │       ├── implementation_patterns.md
│   │       └── external_deps.md
│   ├── P2M2T1/
│   │   └── PRP.md                # Previous task: Hook implementation
│   └── P2M2T2/
│       └── PRP.md                # This task: Hook documentation
├── README.md                     # MAIN DELIVERABLE TARGET (add section here)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── tasks.json
```

### Desired Codebase tree with files to be modified

```bash
# MODIFIED FILES:
README.md                         # MODIFY: Add new "PreToolUse Hook Installation" section
    # Responsibility: Document hook installation, configuration, verification, troubleshooting

# ALTERNATIVE (if README.md doesn't exist or is too large):
HOOKS.md                          # CREATE: Standalone hooks documentation
    # Responsibility: Complete guide to installing, configuring, and troubleshooting hooks
```

### Known Gotchas of our codebase & Library Quirks

```markdown
# CRITICAL: Hook installation location is in USER'S home directory (~/.claude/), NOT project
# Project contains hooks/PreToolUse.d/mdsel-reminder.sh for DISTRIBUTION
# Users COPY from project to ~/.claude/hooks/PreToolUse.d/ for INSTALLATION
# Do NOT document creating hooks in the project directory - that's for developers

# CRITICAL: Hook must be executable (chmod +x) or Claude Code won't run it
# Document the chmod +x step clearly - this is a common pitfall

# CRITICAL: Hook requires jq for JSON parsing
# Document jq installation: apt-get install jq (Linux), brew install jq (macOS)
# Hook "fails open" if jq is missing, but reminder won't work without it

# CRITICAL: MDSEL_MIN_WORDS environment variable must be set in shell profile
# Document editing ~/.bashrc, ~/.zshrc, or setting per-session
# Default is 200 if not set - document this clearly

# CRITICAL: Hook is NON-BLOCKING (informational only)
# Emphasize this in documentation so users don't expect it to block Read operations
# The hook provides a REMINDER, not a hard requirement

# GOTCHA: Windows support requires WSL (Windows Subsystem for Linux)
# Native Windows cmd/PowerShell doesn't support bash scripts
# Document WSL requirement for Windows users

# GOTCHA: Claude Code may not automatically detect new hooks
# Document that Claude Code might need restart after hook installation
# Or that hooks are loaded on Claude Code startup

# PATTERN: Use shell profile environment variables for persistence
# MDSEL_MIN_WORDS=500 in terminal = session only
# Add to ~/.bashrc or ~/.zshrc = persistent across sessions
```

## Implementation Blueprint

### Documentation Structure

The documentation should follow this structure (inspired by Husky, pre-commit, and other hook documentation):

1. **Overview Section**: What the hook does, why it's useful, what "non-blocking" means
2. **Prerequisites Section**: jq dependency, bash/shell access, Claude Code installed
3. **Quick Install Section**: Copy-paste commands for immediate installation
4. **Detailed Installation Steps**: Step-by-step explanation of each command
5. **Configuration Section**: How to set MDSEL_MIN_WORDS with examples
6. **Verification Section**: Commands to test hook is working
7. **Troubleshooting Section**: Common issues and solutions
8. **Uninstallation Section**: How to remove the hook

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE Documentation Skeleton in README.md or HOOKS.md
  - DECIDE: Add section to existing README.md OR create new HOOKS.md file
  - CHECK: If README.md exists and is < 300 lines, add section to it
  - CHECK: If README.md doesn't exist OR is > 300 lines, create HOOKS.md
  - CREATE: New heading: "## PreToolUse Hook Installation" or "# Hooks" (for HOOKS.md)
  - ADD: Brief overview paragraph explaining what the hook does
  - FOLLOW pattern: Existing README formatting (heading levels, code block style, tone)
  - NAMING: Use "PreToolUse Hook" terminology consistently (matches Claude Code docs)

Task 2: WRITE Overview Section
  - EXPLAIN: What the hook does (reminds to use mdsel_index/select for large Markdown files)
  - EXPLAIN: When it fires (on Read tool for .md files over threshold)
  - EXPLAIN: Non-blocking nature (reminder only, doesn't block Read operation)
  - ADD: Example of the reminder message users will see
  - MENTION: Benefits (token efficiency, behavioral conditioning)
  - GOTCHA: Emphasize "non-blocking" - users might expect it to block, but it doesn't

Task 3: WRITE Prerequisites Section
  - LIST: Required dependencies
    - jq (JSON processor) - with installation commands for each platform
    - bash/shell access (standard on Linux/macOS, WSL on Windows)
    - Claude Code installed (implied, but mention it)
  - ADD: jq installation commands
    - Ubuntu/Debian: sudo apt-get install jq
    - macOS: brew install jq
    - Fedora/CentOS: sudo dnf install jq
  - CHECK: Document how to verify jq is installed (jq --version)

Task 4: WRITE Quick Install Section
  - PROVIDE: Copy-paste ready commands for immediate installation
  - INCLUDE: Commands for Linux/macOS (bash)
  - INCLUDE: Commands for Windows (WSL) - note WSL requirement
  - FORMAT: Use ```bash code block with syntax highlighting
  - COMMANDS:
    ```bash
    # Create hooks directory (if it doesn't exist)
    mkdir -p ~/.claude/hooks/PreToolUse.d/

    # Copy hook from project to Claude Code hooks directory
    cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/

    # Make hook executable
    chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
    ```
  - GOTCHA: Document that users must be in the project directory for cp command to work

Task 5: WRITE Detailed Installation Steps
  - BREAKDOWN: Each command from Quick Install with explanation
  - STEP 1: Explain mkdir -p command (creates directory if missing, -p = no error if exists)
  - STEP 2: Explain cp command (copies hook script from project to Claude Code directory)
  - STEP 3: Explain chmod +x command (makes script executable - required for Claude Code to run it)
  - ADD: Note about project directory (user must cd to project first, or use full path)
  - ADD: Visual indicator showing what ~/.claude/hooks/PreToolUse.d/ looks like after installation

Task 6: WRITE Configuration Section (MDSEL_MIN_WORDS)
  - EXPLAIN: MDSEL_MIN_WORDS environment variable controls word count threshold
  - DEFAULT: Document default value (200 words)
  - PROVIDE: Examples of setting the variable
    - Temporary (session only): export MDSEL_MIN_WORDS=500
    - Persistent (bash): Add to ~/.bashrc
    - Persistent (zsh): Add to ~/.zshrc
  - ADD: Code example for editing ~/.bashrc:
    ```bash
    # Add to ~/.bashrc
    echo 'export MDSEL_MIN_WORDS=500' >> ~/.bashrc
    source ~/.bashrc
    ```
  - EXPLAIN: How the threshold works (files OVER threshold trigger reminder)
  - VALIDATION: How to verify variable is set (echo $MDSEL_MIN_WORDS)

Task 7: WRITE Verification Section
  - PROVIDE: Commands to verify hook is installed correctly
  - CHECK 1: File exists: ls -la ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
  - CHECK 2: File is executable: Look for 'x' in permissions (-rwxr-xr-x)
  - CHECK 3: Hook has correct content: cat ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh | head -2
  - PROVIDE: Manual test command (simulate Read tool invocation):
    ```bash
    # Create test Markdown file with 201+ words
    echo "# Test" > /tmp/test-large.md
    for i in {1..201}; do echo "word$i"; done >> /tmp/test-large.md

    # Test hook (simulates Read tool invocation)
    echo '{"tool_input":{"file_path":"/tmp/test-large.md"}}' | \
      ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
    # Expected: {"decision":"approve","reason":"This is a Markdown file over the configured size threshold..."}
    ```
  - ADD: How to test with actual Claude Code (trigger Read on large .md file)

Task 8: WRITE Troubleshooting Section
  - ORGANIZE: By symptom/problem with clear solutions
  - PROBLEM 1: "Permission denied" error
    - CAUSE: Hook script is not executable
    - SOLUTION: Run chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
  - PROBLEM 2: Hook doesn't fire (no reminder message)
    - CAUSE 1: jq is not installed
    - SOLUTION: Install jq (apt-get install jq or brew install jq)
    - CAUSE 2: File is not a .md file
    - SOLUTION: Hook only fires on .md/.markdown files
    - CAUSE 3: File is under threshold
    - SOLUTION: File must exceed MDSEL_MIN_WORDS (default: 200)
    - CAUSE 4: Claude Code needs restart
    - SOLUTION: Restart Claude Code after installing hook
  - PROBLEM 3: "No such file or directory" error
    - CAUSE: Hooks directory doesn't exist
    - SOLUTION: Run mkdir -p ~/.claude/hooks/PreToolUse.d/ first
  - PROBLEM 4: Hook shows reminder for all files
    - CAUSE: MDSEL_MIN_WORDS is set too low (e.g., 0 or 1)
    - SOLUTION: Set appropriate threshold (unset for default 200, or set higher value)
  - PROBLEM 5: Can't install on Windows
    - CAUSE: Native Windows doesn't support bash scripts
    - SOLUTION: Use WSL (Windows Subsystem for Linux) or install via Git Bash

Task 9: WRITE Uninstallation Section
  - PROVIDE: Commands to remove the hook
  - COMMAND: rm ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
  - OPTIONAL: Remove entire hooks directory if empty: rmdir ~/.claude/hooks/PreToolUse.d/ 2>/dev/null
  - NOTE: Removing MDSEL_MIN_WORDS from shell profile (if previously added)
  - REMIND: Claude Code may need restart to stop using the hook

Task 10: ADD Links and Cross-References
  - IF: Documentation is in README.md
    - ADD: Link to hook section from table of contents (if exists)
    - ADD: Link from MCP server section to hook section (related feature)
  - IF: Documentation is in HOOKS.md
    - ADD: Link in README.md to HOOKS.md for hook installation instructions
    - ADD: "See HOOKS.md for PreToolUse hook installation" in README
  - CROSS-REFERENCE: Link to mdsel_index and mdsel_select tool documentation
  - EXTERNAL: Link to jq documentation (https://stedolan.github.io/jq/)
```

### Implementation Patterns & Key Details

```markdown
# =============================================================================
# DOCUMENTATION TEMPLATE (Follow This Structure)
# =============================================================================

## PreToolUse Hook Installation

The `mdsel-reminder.sh` PreToolUse hook automatically reminds you to use `mdsel_index` and `mdsel_select` when accessing large Markdown files.

### What It Does

- **Fires on**: Every `Read` tool invocation for `.md` or `.markdown` files
- **Checks**: Word count using mechanical `wc -w` (whitespace-delimited)
- **Triggers**: When file exceeds `MDSEL_MIN_WORDS` threshold (default: 200 words)
- **Returns**: Non-blocking reminder message in the agent response
- **Does NOT block**: The Read operation proceeds normally - this is informational only

**Example reminder message**:
> "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."

### Why Use the Hook

- **Token Efficiency**: Large Markdown files consume excessive tokens when read entirely
- **Surgical Access**: `mdsel_select` provides targeted section retrieval
- **Behavioral Conditioning**: Consistent reminders guide efficient tool usage patterns

### Prerequisites

Before installing the hook, ensure you have:

1. **jq** (JSON processor) - Required for parsing Claude Code's JSON input
   ```bash
   # Install jq on Ubuntu/Debian
   sudo apt-get install jq

   # Install jq on macOS
   brew install jq

   # Install jq on Fedora/CentOS
   sudo dnf install jq

   # Verify installation
   jq --version
   ```

2. **Bash/Shell Access** - Standard on Linux/macOS, WSL on Windows

3. **Claude Code Installed** - Hook integrates with Claude Code's PreToolUse system

### Quick Install

```bash
# Create hooks directory (if it doesn't exist)
mkdir -p ~/.claude/hooks/PreToolUse.d/

# Copy hook from project to Claude Code hooks directory
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/

# Make hook executable
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Note**: You must be in the project directory for the `cp` command to work. Alternatively, use the full path to the hook file.

### Installation Steps

**Step 1: Create the hooks directory**

Claude Code stores PreToolUse hooks in `~/.claude/hooks/PreToolUse.d/`. This directory may not exist by default.

```bash
mkdir -p ~/.claude/hooks/PreToolUse.d/
```

The `-p` flag ensures no error if the directory already exists.

**Step 2: Copy the hook script**

Copy the hook from the project to your Claude Code hooks directory:

```bash
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/
```

**Step 3: Make the hook executable**

Claude Code requires hook scripts to be executable:

```bash
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Step 4: Restart Claude Code (if running)**

Claude Code loads hooks on startup. Restart Claude Code to activate the new hook.

### Configuration

The hook uses the `MDSEL_MIN_WORDS` environment variable to control the word count threshold.

**Default behavior**: 200 words

**Set custom threshold** (session only):
```bash
export MDSEL_MIN_WORDS=500
```

**Set custom threshold** (persistent - add to shell profile):

For Bash (`~/.bashrc`):
```bash
echo 'export MDSEL_MIN_WORDS=500' >> ~/.bashrc
source ~/.bashrc
```

For Zsh (`~/.zshrc`):
```bash
echo 'export MDSEL_MIN_WORDS=500' >> ~/.zshrc
source ~/.zshrc
```

**Verify configuration**:
```bash
echo $MDSEL_MIN_WORDS
# Output: 200 (default) or your custom value
```

**How it works**: Files with word counts **over** the threshold trigger the reminder. A 201-word file with default threshold (200) will trigger; a 200-word file will not.

### Verification

**Check the hook is installed**:
```bash
ls -la ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: -rwxr-xr-x (executable permissions)
```

**Check the hook content**:
```bash
cat ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh | head -2
# Expected output:
# #!/bin/bash
# # matcher: {"toolNames": ["Read"]}
```

**Test the hook manually**:
```bash
# Create a test Markdown file with 201+ words
echo "# Test File" > /tmp/test-large.md
for i in {1..201}; do echo "word$i"; done >> /tmp/test-large.md

# Simulate a Read tool invocation
echo '{"tool_input":{"file_path":"/tmp/test-large.md"}}' | \
  ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Expected output:
# {"decision":"approve","reason":"This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}
```

**Test with Claude Code**:
1. Create a Markdown file with 201+ words
2. Use Claude Code to read the file (invokes Read tool)
3. Observe the reminder message in the agent response

### Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Permission denied when running hook | Hook is not executable | Run `chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh` |
| Hook doesn't fire (no reminder) | `jq` is not installed | Install jq: `sudo apt-get install jq` or `brew install jq` |
| Hook doesn't fire on .md file | File is under threshold | File must exceed `MDSEL_MIN_WORDS` (default: 200) |
| Hook doesn't fire on .txt file | Hook only processes Markdown files | Only `.md` and `.markdown` files trigger the hook |
| Hook shows reminder for ALL files | `MDSEL_MIN_WORDS` set too low | Set appropriate threshold or unset to use default (200) |
| "No such file or directory" error | Hooks directory doesn't exist | Run `mkdir -p ~/.claude/hooks/PreToolUse.d/` first |
| Hook not detected by Claude Code | Claude Code needs restart | Restart Claude Code after installing the hook |
| Can't install on Windows | Native Windows doesn't support bash | Use WSL (Windows Subsystem for Linux) or Git Bash |

### Uninstallation

To remove the hook:

```bash
# Remove the hook script
rm ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Optionally, remove the hooks directory if empty
rmdir ~/.claude/hooks/PreToolUse.d/ 2>/dev/null

# Remove MDSEL_MIN_WORDS from shell profile (if previously added)
# Edit ~/.bashrc or ~/.zshrc and remove the export line
```

Restart Claude Code to complete the uninstallation.

# =============================================================================
# END OF DOCUMENTATION TEMPLATE
# =============================================================================
```

### Integration Points

```yaml
README_STRUCTURE:
  - location: "README.md" (main project documentation)
  - insertion_point: "After MCP server documentation, before development section"
  - heading_level: "## (second-level heading)"
  - format: "Follow existing README style (code blocks, lists, etc.)"

ALTERNATIVE_LOCATION:
  - file: "HOOKS.md" (standalone hooks documentation)
  - condition: "Use if README.md is > 300 lines or doesn't exist"
  - cross_reference: "Add link in README.md: 'See HOOKS.md for PreToolUse hook installation'"

CODE_BLOCK_SYNTAX:
  - bash_commands: "```bash ... ```"
  - json_output: "```json ... ```"
  - file_paths: "Use backticks: `~/.claude/hooks/PreToolUse.d/`"

LINK_REFERENCES:
  - mcp_tools: "Link to mdsel_index and mdsel_select tool documentation"
  - jq_docs: "https://stedolan.github.io/jq/ (JSON processor)"
  - claude_code_docs: "Link to Claude Code hooks documentation (if available)"
```

## Validation Loop

### Level 1: Documentation Structure Validation

```bash
# Verify documentation file exists and has correct structure

# If adding to README.md
if [ -f "README.md" ]; then
  echo "README.md exists"
  # Check for hook section
  grep -q "PreToolUse Hook" README.md && echo "Hook section found" || echo "Hook section missing"
  # Check for key headings
  grep -q "## PreToolUse Hook Installation" README.md && echo "Main heading found" || echo "Main heading missing"
  grep -q "### Quick Install" README.md && echo "Quick install found" || echo "Quick install missing"
  grep -q "### Troubleshooting" README.md && echo "Troubleshooting found" || echo "Troubleshooting missing"
else
  echo "README.md does not exist - create HOOKS.md instead"
fi

# If creating HOOKS.md
if [ -f "HOOKS.md" ]; then
  echo "HOOKS.md exists"
  # Check for main sections
  grep -q "# Hooks" HOOKS.md && echo "Main heading found" || echo "Main heading missing"
  grep -q "## Installation" HOOKS.md && echo "Installation section found" || echo "Installation missing"
else
  echo "HOOKS.md does not exist - need to create it"
fi

# Expected: All key sections present (Installation, Configuration, Troubleshooting)
```

### Level 2: Content Quality Validation

```bash
# Verify documentation contains all required information

# Check for prerequisite mentions
if grep -q "jq" README.md 2>/dev/null || grep -q "jq" HOOKS.md 2>/dev/null; then
  echo "jq dependency documented ✓"
else
  echo "WARNING: jq dependency not mentioned"
fi

# Check for installation commands
if grep -q "mkdir -p ~/.claude/hooks/PreToolUse.d/" README.md 2>/dev/null || \
   grep -q "mkdir -p ~/.claude/hooks/PreToolUse.d/" HOOKS.md 2>/dev/null; then
  echo "Installation commands present ✓"
else
  echo "WARNING: Installation commands missing"
fi

# Check for chmod +x command
if grep -q "chmod +x" README.md 2>/dev/null || grep -q "chmod +x" HOOKS.md 2>/dev/null; then
  echo "Executable permissions documented ✓"
else
  echo "WARNING: chmod +x command missing"
fi

# Check for MDSEL_MIN_WORDS configuration
if grep -q "MDSEL_MIN_WORDS" README.md 2>/dev/null || grep -q "MDSEL_MIN_WORDS" HOOKS.md 2>/dev/null; then
  echo "Configuration section present ✓"
else
  echo "WARNING: MDSEL_MIN_WORDS not documented"
fi

# Check for troubleshooting section
if grep -q "Troubleshooting" README.md 2>/dev/null || grep -q "Troubleshooting" HOOKS.md 2>/dev/null; then
  echo "Troubleshooting section present ✓"
else
  echo "WARNING: Troubleshooting section missing"
fi

# Expected: All checks pass with ✓ marks
```

### Level 3: Command Accuracy Validation

```bash
# Test that documented commands actually work

# Test 1: Verify hook file exists in project
if [ -f "hooks/PreToolUse.d/mdsel-reminder.sh" ]; then
  echo "Hook file exists in project ✓"
else
  echo "ERROR: Hook file not found at hooks/PreToolUse.d/mdsel-reminder.sh"
  echo "Documentation commands reference a file that doesn't exist!"
fi

# Test 2: Verify mkdir -p command syntax
# This should create the directory without error
mkdir -p /tmp/test-hooks-dir 2>/dev/null
if [ $? -eq 0 ]; then
  echo "mkdir -p command syntax is correct ✓"
  rmdir /tmp/test-hooks-dir 2>/dev/null
else
  echo "WARNING: mkdir -p command syntax issue"
fi

# Test 3: Verify jq installation command examples are valid
# Just check the syntax is documented, don't actually install
if grep -q "apt-get install jq" README.md 2>/dev/null || \
   grep -q "apt-get install jq" HOOKS.md 2>/dev/null || \
   grep -q "brew install jq" README.md 2>/dev/null || \
   grep -q "brew install jq" HOOKS.md 2>/dev/null; then
  echo "jq installation commands documented ✓"
else
  echo "WARNING: jq installation commands incomplete"
fi

# Test 4: Verify file paths are correct
# The documented path should be ~/.claude/hooks/PreToolUse.d/
if grep -q "~/.claude/hooks/PreToolUse.d/" README.md 2>/dev/null || \
   grep -q "~/.claude/hooks/PreToolUse.d/" HOOKS.md 2>/dev/null; then
  echo "Claude Code hooks path is correct ✓"
else
  echo "WARNING: Claude Code hooks path may be incorrect"
fi

# Expected: All command validations pass
```

### Level 4: User Testing Validation

```bash
# Simulate a user following the documentation

# Step 1: Create a test environment
TEST_DIR="/tmp/mdsel-doc-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Step 2: Create a mock project structure
mkdir -p hooks/PreToolUse.d/
cat > hooks/PreToolUse.d/mdsel-reminder.sh << 'EOF'
#!/bin/bash
# Mock hook for testing documentation
echo '{"decision": "approve"}'
exit 0
EOF

# Step 3: Follow the documented installation steps
# (Extract the commands from documentation and run them)

# Create hooks directory
mkdir -p ~/.claude/hooks/PreToolUse.d-test-$$
HOOK_DIR="$HOME/.claude/hooks/PreToolUse.d-test-$$"

# Copy hook
cp hooks/PreToolUse.d/mdsel-reminder.sh "$HOOK_DIR/"

# Make executable
chmod +x "$HOOK_DIR/mdsel-reminder.sh"

# Step 4: Verify installation
if [ -x "$HOOK_DIR/mdsel-reminder.sh" ]; then
  echo "Installation test PASSED ✓"
else
  echo "Installation test FAILED - hook is not executable"
fi

# Step 5: Test the hook
echo '{"tool_input":{"file_path":"/tmp/test.md"}}' | "$HOOK_DIR/mdsel-reminder.sh"
if [ $? -eq 0 ]; then
  echo "Hook execution test PASSED ✓"
else
  echo "Hook execution test FAILED"
fi

# Cleanup
cd -
rm -rf "$TEST_DIR"
rm -rf "$HOOK_DIR"

# Expected: All user simulation tests pass
```

## Final Validation Checklist

### Technical Validation

- [ ] Documentation file exists (README.md section OR HOOKS.md)
- [ ] All required sections are present (Overview, Installation, Configuration, Troubleshooting)
- [ ] Code blocks use proper syntax highlighting (```bash, ```json)
- [ ] File paths are correct (~/.claude/hooks/PreToolUse.d/)
- [ ] Commands are copy-paste ready (complete, no placeholders)
- [ ] Cross-platform coverage (Linux, macOS, Windows/WSL)

### Content Validation

- [ ] Overview clearly explains what the hook does
- [ ] Non-blocking nature is emphasized
- [ ] Prerequisites section mentions jq dependency
- [ ] Installation steps explain each command
- [ ] Configuration section explains MDSEL_MIN_WORDS with examples
- [ ] Verification section includes test commands
- [ ] Troubleshooting covers common issues (permissions, jq, threshold)
- [ ] Uninstallation instructions are provided

### User Experience Validation

- [ ] Quick Install section for immediate setup
- [ ] Progressive disclosure (quick → detailed)
- [ ] Clear visual hierarchy (headings, code blocks, lists)
- [ ] Example outputs are shown
- [ ] Error messages are explained
- [ ] Links to related documentation (tools, jq, etc.)

### Documentation Quality

- [ ] Follows existing README style (if adding to README.md)
- [ ] Consistent terminology (PreToolUse hook, mdsel_index, mdsel_select)
- [ ] No placeholder text (e.g., "TODO", "coming soon")
- [ ] Spelling and grammar checked
- [ ] Code examples are tested and accurate

---

## Anti-Patterns to Avoid

- **Don't use placeholder paths**: Always use exact paths like `~/.claude/hooks/PreToolUse.d/`, not `[path-to-hooks]`.
- **Don't skip the chmod +x step**: This is the most common installation error - emphasize it clearly.
- **Don't forget to mention jq**: Hook won't work without it - include installation commands.
- **Don't assume user knows where hooks go**: Explicitly state `~/.claude/hooks/PreToolUse.d/`.
- **Don't document creating hooks in project directory**: Project has `hooks/` for distribution, users install to `~/.claude/`.
- **Don't forget Windows users**: Document WSL requirement - native Windows doesn't support bash scripts.
- **Don't omit the "non-blocking" explanation**: Users might expect the hook to block - clarify it's informational only.
- **Don't use overly technical jargon**: Keep explanations accessible to users who may not be shell experts.
- **Don't skip verification steps**: Users need to confirm installation worked - include test commands.
- **Don't forget troubleshooting**: Common issues (permissions, missing jq) need clear solutions.
