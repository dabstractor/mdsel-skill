# PRP: P2.M3.T1 - Create Hook Configuration Guide

---

## Goal

**Feature Goal**: Create comprehensive user-facing documentation that enables users to successfully configure and use the PreToolUse hook system with Claude Code.

**Deliverable**: Two new documentation files:

1. `README.md` - Main project documentation with installation and configuration instructions
2. `.claude/settings.json.example` - Example Claude Code settings configuration file

**Success Definition**:

- Users can install the project and build the hook script
- Users can configure Claude Code settings with the MCP server
- Users can configure Claude Code settings with the PreToolUse hook
- Users understand the behavioral conditioning workflow (index -> select)
- Users can configure the `MDSEL_MIN_WORDS` environment variable
- Documentation is clear, actionable, and follows the project's minimal philosophy

## User Persona

**Target User**: Developers using Claude Code who work with large Markdown files and want to condition the AI to use selector-based access patterns.

**Use Case**: A developer installs `mdsel-claude` to:

1. Expose `mdsel_index` and `mdsel_select` as Claude Code tools
2. Configure a PreToolUse hook that reminds the AI to use selectors for large Markdown files
3. Configure a word count threshold for when reminders should fire

**User Journey**:

```
1. User installs mdsel-claude via npm
2. User builds the project to generate dist/hooks/read-hook.js
3. User creates or edits .claude/settings.json
4. User configures MCP server for mdsel tools
5. User configures PreToolUse hook with path to built script
6. User optionally sets MDSEL_MIN_WORDS environment variable
7. User tests configuration by reading a large Markdown file
8. User sees reminder message when threshold exceeded
```

**Pain Points Addressed**:

- Claude Code hook configuration is not well-documented elsewhere
- Users need exact JSON schema for hook configuration
- Users need to understand both MCP server AND hook setup (two separate systems)
- Path resolution can be confusing (absolute vs relative paths)
- Users may not understand when/why reminders fire

## Why

- **Completes the behavioral enforcement system**: P2.M1 (word count) and P2.M2 (hook implementation) are complete, but users have no way to use the hook without documentation
- **Enables actual usage**: Without documentation, the hook system is unusable
- **Bridges two configuration systems**: Users need to understand both MCP servers (for tools) and hooks (for behavioral conditioning)
- **Follows PRD philosophy**: Documentation should be minimal and actionable - no marketing language, just clear instructions

## What

Create user-facing documentation for configuring the PreToolUse hook system in Claude Code.

### Success Criteria

- [ ] README.md exists in project root with installation instructions
- [ ] README.md contains Prerequisites section (Node.js, mdsel CLI)
- [ ] README.md contains Installation section (npm install, build)
- [ ] README.md contains MCP Server Configuration section
- [ ] README.md contains Hook Configuration section with exact JSON
- [ ] README.md contains Environment Variables section (MDSEL_MIN_WORDS)
- [ ] README.md contains Usage Workflow section (index -> select)
- [ ] .claude/settings.json.example exists with commented configuration
- [ ] Documentation avoids philosophy/marketing language (per PRD)
- [ ] All code examples are copy-paste ready
- [ ] File paths are clear about absolute vs relative requirements

## All Needed Context

### Context Completeness Check

_If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

**Yes** - This PRP provides:

- Exact content for README.md with all required sections
- Complete JSON schema for Claude Code settings
- Example .claude/settings.json with comments
- Build command verification steps
- Hook behavior explanation with trigger conditions
- Environment variable configuration
- Troubleshooting guidance

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: src/hooks/read-hook.ts
  why: Hook implementation to document (input/output, behavior, environment variables)
  section: Lines 1-102 (complete file)
  critical: Reminder message is exact - no variation allowed
  pattern: stdin JSON input, stdout JSON output, exit code 0 always

- file: plan/docs/architecture/hook_system.md
  why: Complete hook architecture with configuration examples
  section: Lines 1-227 (full document)
  critical: Hook configuration JSON schema, trigger conditions, reminder message
  pattern: .claude/settings.json structure with hooks.PreToolUse array

- file: PRD.md
  why: Normative requirements for documentation philosophy and hook behavior
  section: Section 6 "Reminder Hook System" (lines 161-200), Section 7 "Tool Description Requirements" (lines 204-216)
  critical: Avoid philosophy/marketing language, keep documentation minimal
  pattern: "No variation is allowed" for reminder message

- file: tsup.config.ts
  why: Build configuration to document in installation instructions
  section: Lines 1-22 (complete file)
  critical: Hook built to dist/hooks/read-hook.js
  pattern: entry array includes 'src/hooks/read-hook.ts'

- file: package.json
  why: Project metadata, dependencies, scripts for installation instructions
  section: Lines 1-35 (complete file)
  critical: Node.js >= 18.0.0 requirement, npm run build command
  pattern: "type": "module", scripts.build = "tsup"

- file: plan/P2M2T1/PRP.md
  why: Reference PRP showing documentation patterns for this project
  section: Implementation Blueprint section
  pattern: JSDoc comments, CRITICAL comments, gotcha documentation

- docfile: plan/docs/P1M3T1/PRP.md
  why: Reference for MCP tool descriptions to document in README
  section: Tool description patterns
  pattern: Tool descriptions that discourage Read usage

- docfile: plan/docs/architecture/tool_definitions.md
  why: Complete tool definitions for mdsel_index and mdsel_select
  section: Full document
  pattern: Tool descriptions with behavioral guidance
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-claude-glm/
├── dist/                          # Build output (generated by tsup)
│   ├── index.js                   # MCP server entry point
│   ├── hooks/
│   │   └── read-hook.js           # Built hook script (for hook configuration)
│   ├── tools/
│   │   ├── mdsel-index.js
│   │   └── mdsel-select.js
│   └── lib/
│       ├── mdsel-cli.js
│       └── word-count.js
├── src/
│   ├── hooks/
│   │   └── read-hook.ts           # Hook source (P2.M2.T1 - Complete)
│   ├── lib/
│   │   ├── mdsel-cli.ts           # CLI executor
│   │   └── word-count.ts          # Word count utilities (P2.M1.T1 - Complete)
│   ├── tools/
│   │   ├── mdsel-index.ts         # mdsel_index tool (P1.M3.T1 - Complete)
│   │   └── mdsel-select.ts        # mdsel_select tool (P1.M3.T2 - Complete)
│   ├── index.ts                   # MCP server entry point (P1.M4.T1 - Complete)
│   └── types.ts                   # Type definitions
├── tests/
│   ├── hooks/
│   │   └── read-hook.test.ts      # Hook tests (P2.M2.T1 - Complete)
│   ├── lib/
│   │   ├── mdsel-cli.test.ts
│   │   └── word-count.test.ts     # Word count tests (P2.M1.T1 - Complete)
│   └── tools/
│       ├── mdsel-index.test.ts
│       └── mdsel-select.test.ts
├── plan/
│   ├── docs/
│   │   └── architecture/
│   │       ├── hook_system.md     # Hook architecture documentation
│   │       └── tool_definitions.md # Tool definitions
│   ├── P2M1T1/PRP.md              # Word count utilities PRP (Complete)
│   ├── P2M2T1/PRP.md              # Hook implementation PRP (Complete)
│   └── P2M3T1/                    # THIS TASK - Documentation PRP
├── .claude/                       # DOES NOT EXIST YET - Will create example file
│   └── settings.json.example      # NEW - Example Claude Code configuration
├── README.md                      # DOES NOT EXIST YET - Main documentation
├── package.json                   # Project configuration
├── tsconfig.json                  # TypeScript configuration
├── tsup.config.ts                 # Build configuration
└── vitest.config.ts               # Test configuration
```

### Desired Codebase Tree After Implementation

```bash
/home/dustin/projects/mdsel-claude-glm/
├── .claude/
│   └── settings.json.example      # NEW - Example Claude Code settings with hooks
├── README.md                      # NEW - Main project documentation
```

**Note**: No changes to source code - this task is pure documentation.

### Known Gotchas of Our Codebase & Library Quirks

```bash
# CRITICAL: Hook script path in configuration must be absolute or resolvable
# The hook is built to dist/hooks/read-hook.js
# Use absolute path in .claude/settings.json for reliability
# Example: "command": "node /home/user/projects/mdsel-claude/dist/hooks/read-hook.js"

# CRITICAL: MCP server and hooks are SEPARATE configuration systems
# MCP server: Exposes tools (mdsel_index, mdsel_select)
# Hooks: Intercept tool usage (Read tool)
# Both go in .claude/settings.json but in different sections

# CRITICAL: Build is required before hook configuration
# Hook script must be built first: npm run build
# Then reference dist/hooks/read-hook.js in configuration

# CRITICAL: Reminder message is normative (PRD Section 6.3)
# "This is a Markdown file over the configured size threshold.
#  Use mdsel_index and mdsel_select instead of Read."
# NO VARIATION ALLOWED - document exactly as implemented

# GOTCHA: Claude Code settings location
# Project-level: .claude/settings.json (in project root)
# User-level: ~/.claude/settings.json (in home directory)
# Document both options

# GOTCHA: Environment variable scope
# MDSEL_MIN_WORDS affects hook behavior
# Set in shell profile for global, or in Claude Code env for local
# Document both approaches

# CRITICAL: Documentation philosophy from PRD Section 7
# "Avoid philosophy, justification, or marketing language"
# Keep instructions minimal and actionable
# No "why this is amazing" - just "how to use it"

# PATTERN: Project uses 'CRITICAL:' comments for implementation details
# PATTERN: Project uses 'GOTCHA:' for library-specific quirks
```

## Implementation Blueprint

### Data Models and Structure

```yaml
# README.md Structure (minimal, actionable, copy-paste ready)

Title: mdsel-claude (one-line description)
Badge: npm version, license (optional)

Sections: 1. Overview (1-2 sentences)
  2. Prerequisites (Node.js version, mdsel CLI)
  3. Installation (npm install, build)
  4. MCP Server Configuration
  5. Hook Configuration
  6. Environment Variables
  7. Usage Workflow
  8. Troubleshooting (optional)

Style:
  - No philosophy or marketing language
  - Code blocks are copy-paste ready
  - File paths are explicit
  - JSON examples are complete and valid

# .claude/settings.json.example Structure

Purpose: Example configuration file with comments

Contains: 1. MCP server configuration (mcpServers section)
  2. Hook configuration (hooks section)
  3. Inline comments explaining each field
  4. Placeholder paths for user to replace

Format: Valid JSON with comments (user strips comments before use)
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE README.md in project root
  - IMPLEMENT: Title and one-line description
  - IMPLEMENT: Prerequisites section with Node.js >= 18.0.0, mdsel CLI
  - IMPLEMENT: Installation section with npm install, npm run build commands
  - IMPLEMENT: MCP Server Configuration section
    - Show .claude/settings.json location
    - Show mcpServers configuration with mdsel-claude entry
    - Explain command path (node /path/to/dist/index.js)
    - Explain MDSEL_MIN_WORDS env var configuration
  - IMPLEMENT: Hook Configuration section
    - Show hooks.PreToolUse configuration
    - Explain matcher: "Read"
    - Show command path to dist/hooks/read-hook.js
    - Include complete JSON example
  - IMPLEMENT: Environment Variables section
    - Document MDSEL_MIN_WORDS (default: 200)
    - Show shell export syntax
    - Show Claude Code env configuration
  - IMPLEMENT: Usage Workflow section
    - Explain index -> select pattern
    - Show example tool usage
    - Reference reminder message behavior
  - IMPLEMENT: Troubleshooting section (optional)
    - Hook not firing (check path, build status)
    - Reminder not appearing (check file extension, word count)
    - MCP tools not available (check server config)
  - FOLLOW pattern: Minimal language, no marketing fluff
  - NAMING: README.md (standard)
  - PLACEMENT: Project root (/home/dustin/projects/mdsel-claude-glm/README.md)
  - GOTCHA: Keep descriptions factual - avoid "powerful", "amazing", etc.

Task 2: CREATE .claude/settings.json.example
  - IMPLEMENT: Complete JSON structure with both MCP and hook config
  - IMPLEMENT: Inline comments explaining each section (JSON with comments)
  - IMPLEMENT: Placeholder path for MCP server: /path/to/mdsel-claude/dist/index.js
  - IMPLEMENT: Placeholder path for hook: /path/to/mdsel-claude/dist/hooks/read-hook.js
  - IMPLEMENT: Example MDSEL_MIN_WORDS configuration
  - IMPLEMENT: Comment explaining that users must replace placeholders
  - IMPLEMENT: Comment about removing comments before use (JSON spec)
  - FOLLOW pattern: plan/docs/architecture/hook_system.md lines 11-27
  - NAMING: settings.json.example
  - PLACEMENT: .claude/settings.json.example (create .claude directory)
  - GOTCHA: JSON doesn't support comments - this is a "example" file with comments that user strips

Task 3: VERIFY build and test documentation
  - RUN: npm run build to ensure dist/ is populated
  - VERIFY: dist/hooks/read-hook.js exists
  - VERIFY: dist/index.js exists
  - RUN: npm test to ensure all tests pass (documentation references working code)
  - VALIDATE: Paths in documentation match actual build output
```

### Implementation Patterns & Key Details

````markdown
# ============================================

# Pattern 1: README.md Structure

# ============================================

# File: README.md

# mdsel-claude

Claude Code integration for mdsel with behavioral enforcement hooks.

## Overview

Exposes `mdsel_index` and `mdsel_select` as Claude Code tools and configures
a PreToolUse hook to encourage selector-based access for large Markdown files.

## Prerequisites

- Node.js >= 18.0.0
- mdsel CLI installed and available in PATH

## Installation

```bash
# Clone or navigate to project directory
cd /path/to/mdsel-claude

# Install dependencies
npm install

# Build the project
npm run build
```
````

The build process creates:

- `dist/index.js` - MCP server entry point
- `dist/hooks/read-hook.js` - PreToolUse hook script

## MCP Server Configuration

Create or edit `.claude/settings.json` in your project root or user home directory:

```json
{
  "mcpServers": {
    "mdsel": {
      "command": "node",
      "args": ["/absolute/path/to/mdsel-claude/dist/index.js"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```

Replace `/absolute/path/to/mdsel-claude` with the actual path to this project.

## Hook Configuration

Add the PreToolUse hook to the same `.claude/settings.json` file:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/mdsel-claude/dist/hooks/read-hook.js"
          }
        ]
      }
    ]
  }
}
```

### Hook Behavior

The hook fires when **all** of the following are true:

- Claude invokes the `Read` tool
- Target file has `.md` extension
- File word count exceeds `MDSEL_MIN_WORDS` (default: 200)

When triggered, the hook displays:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

The hook **never blocks** the Read action - it only reminds.

## Environment Variables

| Variable          | Description                             | Default |
| ----------------- | --------------------------------------- | ------- |
| `MDSEL_MIN_WORDS` | Word count threshold for hook reminders | 200     |

Set via shell:

```bash
export MDSEL_MIN_WORDS=200
```

Or configure in `.claude/settings.json` under the MCP server `env` section.

## Usage Workflow

For large Markdown files, use the two-tool workflow:

1. **Index the file** to discover structure:

   ```
   mdsel_index with files: ["path/to/document.md"]
   ```

2. **Select content** using returned selectors:
   ```
   mdsel_select with files: ["path/to/document.md"], selector: "heading#Introduction"
   ```

Small files (at or below threshold) may be read normally without reminders.

## Troubleshooting

**Hook not firing:**

- Verify `npm run build` was run
- Check the path to `dist/hooks/read-hook.js` is absolute
- Confirm file has `.md` extension
- Verify word count exceeds threshold

**MCP tools not available:**

- Check MCP server configuration in `.claude/settings.json`
- Verify the path to `dist/index.js` is correct
- Restart Claude Code after configuration changes

**Reminder message variations:**

- The message must be exactly as specified in PRD Section 6.3
- No variation is allowed - same text every time

```

# ============================================
# Pattern 2: .claude/settings.json.example
# ============================================
# File: .claude/settings.json.example

# NOTE: This is an example file with comments.
# Remove all comments before using this configuration.

{
  // MCP Server Configuration
  // Exposes mdsel_index and mdsel_select tools to Claude Code
  "mcpServers": {
    "mdsel": {
      "command": "node",
      // Replace with absolute path to mdsel-claude/dist/index.js
      "args": ["/path/to/mdsel-claude/dist/index.js"],
      "env": {
        // Word count threshold for hook reminders (default: 200)
        "MDSEL_MIN_WORDS": "200"
      }
    }
  },

  // PreToolUse Hook Configuration
  // Intercepts Read tool for large Markdown files
  "hooks": {
    "PreToolUse": [
      {
        // Match only the Read tool
        "matcher": "Read",
        "hooks": [
          {
            // Command-type hook executes external script
            "type": "command",
            // Replace with absolute path to mdsel-claude/dist/hooks/read-hook.js
            "command": "node /path/to/mdsel-claude/dist/hooks/read-hook.js"
          }
        ]
      }
    ]
  }
}
```

````

### Integration Points

```yaml
NO CODE CHANGES:
  - This is pure documentation task
  - No source files modified
  - No test files modified
  - No build configuration changes

DOCUMENTATION:
  - create: README.md (project root)
  - create: .claude/settings.json.example
  - reference: src/hooks/read-hook.ts (for behavior documentation)
  - reference: plan/docs/architecture/hook_system.md (for configuration format)

DEPENDENCIES:
  - existing: All source code (P1, P2.M1, P2.M2 complete)
  - existing: dist/ build output (requires npm run build)
  - documentation: PRD.md (for philosophy and requirements)
  - documentation: plan/docs/architecture/hook_system.md (for hook spec)
````

## Validation Loop

### Level 1: Syntax & Style (Documentation Quality)

````bash
# Verify README.md exists and is readable
test -f README.md && echo "README.md exists" || echo "README.md missing"

# Check for common documentation issues
grep -q "Prerequisites" README.md && echo "Has Prerequisites section"
grep -q "Installation" README.md && echo "Has Installation section"
grep -q "MCP Server Configuration" README.md && echo "Has MCP Config section"
grep -q "Hook Configuration" README.md && echo "Has Hook Config section"
grep -q "MDSEL_MIN_WORDS" README.md && echo "Documents environment variable"

# Verify JSON example is valid (strip comments first if using JSON-with-comments)
cat README.md | sed -n '/```json/,/```/p' | sed '1d;$d' | jq . > /dev/null 2>&1 \
  && echo "JSON examples are valid" || echo "JSON examples have errors"

# Verify .claude/settings.json.example exists
test -f .claude/settings.json.example && echo "Example config exists" || echo "Example config missing"

# Expected: All checks pass, documentation is complete and valid
````

### Level 2: Content Validation (Instruction Clarity)

```bash
# Test installation instructions by following them
cd /tmp && mkdir -p test-mdsel-claude && cd test-mdsel-claude
cp -r /home/dustin/projects/mdsel-claude-glm/* .
# Follow README installation steps
npm install
npm run build
# Verify expected outputs exist
test -f dist/hooks/read-hook.js && echo "Hook built successfully"
test -f dist/index.js && echo "MCP server built successfully"

# Test configuration example validity
# Strip comments from example file and validate JSON
cat .claude/settings.json.example | grep -v '^\s*//' | jq . > /dev/null 2>&1 \
  && echo "Example config is valid JSON" || echo "Example config has JSON errors"

# Expected: All instructions work as documented, no ambiguity
```

### Level 3: Functional Validation (Configuration Works)

```bash
# Test hook script standalone (simulates Claude Code invocation)
# Create a test Markdown file above threshold
echo "# Test File

$(for i in {1..250}; do echo "word $i"; done)" > /tmp/test-large.md

# Test hook with sample input
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test-large.md"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true,"systemMessage":"This is a Markdown file over the configured size threshold.\nUse mdsel_index and mdsel_select instead of Read."}

# Test with small file (no reminder expected)
echo "# Small" > /tmp/test-small.md
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test-small.md"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true} (no systemMessage)

# Test with non-Markdown file (no reminder expected)
echo "not markdown" > /tmp/test.txt
echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test.txt"}}' | \
  node dist/hooks/read-hook.js | jq .
# Expected: {"continue":true} (no systemMessage)

# Verify MCP server loads
node -e "import('./dist/index.js').then(() => console.log('MCP server loads'))"
# Expected: No errors, module loads successfully

# Expected: All functional tests pass, hook behaves as documented
```

### Level 4: Documentation Validation (User Experience)

```bash
# Verify reminder message is EXACT to PRD specification
MESSAGE=$(echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test-large.md"}}' | \
  node dist/hooks/read-hook.js | jq -r '.systemMessage')

EXPECTED="This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read."

if [ "$MESSAGE" = "$EXPECTED" ]; then
  echo "PASS: Reminder message matches PRD specification exactly"
else
  echo "FAIL: Reminder message does not match PRD"
  echo "Got: $MESSAGE"
  echo "Expected: $EXPECTED"
fi

# Verify documentation mentions key concepts
grep -q "index" README.md && echo "Documents index workflow"
grep -q "select" README.md && echo "Documents select workflow"
grep -q "word count" README.md && echo "Explains word count threshold"

# Verify paths are clearly documented
grep -q "dist/hooks/read-hook.js" README.md && echo "Documents hook path"
grep -q "dist/index.js" README.md && echo "Documents MCP server path"

# Verify troubleshooting section exists
grep -q "Troubleshooting" README.md && echo "Has troubleshooting section"

# Expected: All key concepts documented, paths explicit, troubleshooting present
```

## Final Validation Checklist

### Technical Validation

- [ ] README.md exists in project root
- [ ] .claude/settings.json.example exists
- [ ] All JSON examples in documentation are valid
- [ ] Paths referenced in documentation match actual build output
- [ ] Reminder message in docs matches implementation exactly

### Content Validation

- [ ] Prerequisites section lists Node.js >= 18.0.0
- [ ] Prerequisites section lists mdsel CLI requirement
- [ ] Installation section shows npm install
- [ ] Installation section shows npm run build
- [ ] MCP Server Configuration section present with complete JSON
- [ ] Hook Configuration section present with complete JSON
- [ ] Environment Variables section documents MDSEL_MIN_WORDS
- [ ] Usage Workflow section explains index -> select pattern
- [ ] Troubleshooting section addresses common issues

### Style Validation

- [ ] No marketing language (e.g., "powerful", "amazing")
- [ ] No philosophical justification (per PRD Section 7)
- [ ] Code examples are copy-paste ready
- [ ] File paths are explicit (absolute vs relative)
- [ ] JSON examples are complete and valid
- [ ] Tone is neutral and instructional

### Completeness Validation

- [ ] Documentation enables standalone installation
- [ ] User can configure both MCP server AND hook from docs
- [ ] User understands when hook fires (trigger conditions)
- [ ] User understands what message appears
- [ ] User knows how to customize threshold
- [ ] Troubleshooting covers common failure modes

---

## Anti-Patterns to Avoid

- **Don't** add marketing fluff or enthusiastic language - keep minimal
- **Don't** explain "why" this is better - just explain "how" to use it
- **Don't** vary the reminder message wording - must be EXACT to PRD
- **Don't** use relative paths in configuration examples - use absolute paths
- **Don't** forget to document both MCP server AND hook (two separate systems)
- **Don't** assume user knows about Claude Code configuration - explain locations
- **Don't** leave placeholder paths like `/path/to` without explanation
- **Don't** make the user figure out word count behavior - document threshold
- **Don't** forget to mention that build is required before configuration
- **Don't** skip troubleshooting - users will encounter issues
- **Don't** create different documentation formats - follow established patterns
- **Don't** use complex or fancy markdown - keep it simple and readable

---

## Confidence Score

**9/10** - One-pass implementation success likelihood

**Validation**:

- Complete codebase understanding with all context gathered
- Existing hook implementation provides exact behavior to document
- PRD provides clear philosophy requirements for documentation style
- Architecture doc provides complete hook specification
- Existing PRPs show documentation patterns to follow
- Clear task breakdown with specific content requirements
- Only risk: Balancing completeness vs minimal philosophy - but PRD is explicit

**Notes for Implementation Agent**:

1. Follow the minimal philosophy from PRD Section 7 - no marketing language
2. Keep the reminder message EXACT when documenting - copy from read-hook.ts or PRD
3. Use absolute paths in all configuration examples
4. Document both MCP server AND hook as separate but related systems
5. Make all code examples copy-paste ready (no placeholders without explanation)
6. Include the troubleshooting section - users will have path resolution issues
7. Verify JSON examples are valid before considering documentation complete
8. Test the documented installation process end-to-end
