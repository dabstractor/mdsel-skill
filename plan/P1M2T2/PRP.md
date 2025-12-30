---
name: "P1.M2.T2 - Document Hook Configuration"
description: |

---

## Goal

**Feature Goal**: Create comprehensive documentation for configuring the mdsel reminder hook in Claude Code's settings.json.

**Deliverable**: A documentation file (`docs/HOOK_CONFIGURATION.md`) that explains:
- Where settings.json lives (user-level vs project-level)
- How to configure PostToolUse hooks for the mdsel-reminder.sh script
- Environment variable configuration (MDSEL_MIN_WORDS)
- Complete examples and validation steps

**Success Definition**:
- Documentation exists at docs/HOOK_CONFIGURATION.md
- File contains complete settings.json examples
- Documentation explains both user-level and project-level configuration
- Environment variable setup is clearly documented
- Validation commands are provided for testing
- Documentation is cross-referenced with existing docs

## User Persona

**Target User**: Developers installing mdsel-skill who need to configure Claude Code hooks.

**Use Case**: After running the installation script, users need to manually configure their settings.json to enable the mdsel reminder hook. This documentation provides the complete reference.

**User Journey**:
1. User completes installation script (hook script is installed)
2. Installation script outputs a message referencing this documentation
3. User reads HOOK_CONFIGURATION.md to understand settings.json structure
4. User updates their settings.json with the hook configuration
5. User validates the configuration works using provided commands
6. Hook is active and reminders fire when reading large Markdown files

**Pain Points Addressed**:
- Claude Code hooks documentation is scattered and unclear
- settings.json syntax is not obvious (matcher patterns, command format)
- Environment variable configuration in hooks is poorly documented
- No clear examples of PostToolUse hooks that call shell scripts

## Why

- **Installation Completeness**: Hook script is useless without proper settings.json configuration
- **User Self-Service**: Provides complete reference without requiring support
- **Configuration Validation**: Includes commands to verify hook works correctly
- **Cross-Level Clarity**: Explains differences between user-level and project-level configuration
- **Environment Variable Handling**: Documents MDSEL_MIN_WORDS configuration in hook context

## What

Create documentation file `docs/HOOK_CONFIGURATION.md` that includes:

### Required Sections

1. **Overview**
   - What is the mdsel reminder hook?
   - Why is it needed?
   - How does it work?

2. **settings.json Location**
   - User-level: `~/.claude/settings.json`
   - Project-level: `.claude/settings.json`
   - When to use which level

3. **Configuration Structure**
   - Complete JSON example with PostToolUse hook
   - Explanation of each field (matcher, hooks array, command type)
   - How the hook script receives data via stdin

4. **Complete Example**
   - Full settings.json with just the mdsel hook
   - Full settings.json showing mdsel hook alongside existing hooks

5. **Environment Variables**
   - How to set MDSEL_MIN_WORDS in settings.json
   - Default value (200) behavior
   - Per-project vs user-level environment configuration

6. **Validation**
   - Commands to test hook script directly
   - Commands to verify settings.json is valid JSON
   - How to test hook triggers in Claude Code

7. **Troubleshooting**
   - Hook not firing
   - Permission denied on script
   - JSON syntax errors
   - Path issues

### Success Criteria

- [ ] Documentation file created at docs/HOOK_CONFIGURATION.md
- [ ] Includes both user-level and project-level configuration examples
- [ ] Complete settings.json examples are valid JSON
- [ ] Environment variable configuration is documented
- [ ] Validation commands are provided and tested
- [ ] Cross-references to related docs (PRD, claude_code_skills.md)
- [ ] Troubleshooting section covers common issues

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**YES** - This PRP provides:
- Complete settings.json examples with exact syntax
- Hook script reference and how it's called
- Environment variable handling
- Validation commands to test configuration
- Cross-references to internal documentation
- Real examples from existing settings.json files

### Documentation & References

```yaml
# MUST READ - Critical for understanding hook configuration

- file: /home/dustin/.claude/settings.json
  why: Real-world example of PostToolUse hook configuration with matcher patterns
  section: "hooks" -> "PostToolUse" lines 4-15
  critical: Shows exact JSON structure for command hooks with matcher patterns
  pattern: Use "matcher": "tool_pattern" for filtering by tool name

- file: plan/docs/claude_code_skills.md
  why: Complete specification of Claude Code hooks system
  section: "Hook Configuration (settings.json)" lines 63-81
  critical: Shows PostToolUse JSON structure and matcher syntax
  gotcha: Plain text stdout is NOT automatically injected - must use specific JSON format

- file: plan/docs/implementation_notes.md
  why: Installation flow and configuration expectations
  section: "Installation Flow" lines 118-132
  critical: Hook configuration is step in installation process
  pattern: settings.json update happens after skill installation

- file: PRD.md
  why: Complete product requirements and hook behavior specification
  section: "6.4 Hook Implementation: Claude Code" lines 198-219
  critical: Hook must NOT block, must NOT modify file, must exit 0
  gotcha: Reminder text is normative - no variation allowed

- file: hooks/claude/mdsel-reminder.sh
  why: The actual hook script that documentation must reference
  section: Lines 1-57 (complete script)
  critical: Script expects JSON input via stdin with tool_name, tool_input, tool_response
  gotcha: Script outputs JSON with hookSpecificOutput.additionalContext for injection

- file: plan/P1M2T1/PRP.md
  why: Previous task's PRP with hook implementation details
  section: "Integration Points" and "Implementation Patterns"
  critical: Shows how script is structured and what it expects
  pattern: Command format for calling hook script in settings.json

- file: plan/P1M2T1/research/claude-code-hooks-research.md
  why: Comprehensive research on Claude Code hooks
  section: "Hook Configuration Formats" lines 54-73
  critical: Shows both Settings Format and Plugin Format
  pattern: Settings format uses hooks object with event names as keys

# EXTERNAL REFERENCES (when web search is available)

- url: https://docs.anthropic.com/en/docs/claude-code/hooks
  why: Official Claude Code hooks documentation (when available)
  section: PostToolUse hooks, settings.json configuration

- url: https://json.schemastore.org/claude-code-settings.json
  why: JSON schema for settings.json validation
  critical: Use this for validating settings.json syntax
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-skill
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md              # Created in P1.M1.T1
├── hooks/
│   └── claude/
│       └── mdsel-reminder.sh          # Created in P1.M2.T1
├── plan/
│   ├── docs/
│   │   ├── claude_code_skills.md     # Hook specification
│   │   ├── implementation_notes.md   # Installation flow
│   │   └── ...
│   └── P1M2T1/
│       ├── PRP.md                     # Hook implementation PRP
│       └── research/
│           └── claude-code-hooks-research.md
├── PRD.md                              # Product requirements
├── tasks.json                          # Implementation tracking
└── docs/                               # NEW: Documentation directory to create
    └── HOOK_CONFIGURATION.md          # DELIVERABLE: Hook configuration guide
```

### Desired Codebase Tree (After Implementation)

```bash
/home/dustin/projects/mdsel-skill
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md              # Created in P1.M1.T1
├── hooks/
│   └── claude/
│       └── mdsel-reminder.sh          # Created in P1.M2.T1
├── plan/
│   ├── docs/
│   │   ├── claude_code_skills.md     # Hook specification
│   │   ├── implementation_notes.md   # Installation flow
│   │   └── ...
│   └── P1M2T1/
│       ├── PRP.md                     # Hook implementation PRP
│       └── research/
│           └── claude-code-hooks-research.md
├── docs/
│   └── HOOK_CONFIGURATION.md          # NEW: Hook configuration documentation
├── PRD.md
└── tasks.json
```

**File Responsibility**:
- `docs/HOOK_CONFIGURATION.md` - Complete guide for configuring mdsel reminder hook in settings.json

### Known Gotchas & Library Quirks

```yaml
# CRITICAL: PostToolUse hooks fire AFTER tool completes
# The Read operation is already done when hook fires
# Cannot block the Read - must always exit 0
# See: PRD.md section 6.4

# CRITICAL: settings.json has two valid locations
# User-level: ~/.claude/settings.json (applies to all projects)
# Project-level: .claude/settings.json (applies to current project only)
# Project-level overrides user-level for conflicting settings

# CRITICAL: Hook matcher patterns are string-based
# Use exact tool name: "matcher": "Read"
# OR regex: "matcher": "Read|Write"
# NOT a boolean filter - must match string pattern

# CRITICAL: Command hooks use bash -c execution
# Script path must be absolute or relative to project root
# Use ${CLAUDE_PROJECT_DIR} for project-relative paths
# Example: "command": "bash ${CLAUDE_PROJECT_DIR}/hooks/claude/mdsel-reminder.sh"

# CRITICAL: Environment variables in hooks
# Set in hook's "env" object: "env": {"MDSEL_MIN_WORDS": "300"}
# NOT set in command string (that doesn't work)
# Environment applies to that hook execution only

# CRITICAL: JSON syntax in settings.json
# Must be valid JSON - no trailing commas
# Use double quotes for strings (not single quotes)
# Validate with: jq '.' ~/.claude/settings.json

# GOTCHA: PostToolUse stdout is NOT automatically injected
# Unlike UserPromptSubmit, plain text is not shown to agent
# Must output JSON: {"hookSpecificOutput":{"additionalContext":"..."}}
# See: plan/docs/claude_code_skills.md lines 108-122

# CRITICAL: Hook script must be executable
# chmod +x hooks/claude/mdsel-reminder.sh
# Non-executable scripts will fail silently

# CRITICAL: Path handling in settings.json
~ (tilde) expansion does NOT work in settings.json
# Use $HOME or absolute paths
# OR use ${CLAUDE_PROJECT_DIR} for project-relative paths

# CRITICAL: Multiple hooks for same event
# All matching hooks execute in parallel (no guaranteed order)
# Don't rely on execution order for logic
```

## Implementation Blueprint

### Data Models and Structure

No data models - this is pure documentation (markdown file).

### Documentation Structure

```markdown
# HOOK_CONFIGURATION.md

## 1. Overview (What and Why)
## 2. settings.json Location (Where)
## 3. Configuration Structure (How)
## 4. Complete Examples (Reference)
## 5. Environment Variables (Customization)
## 6. Validation (Testing)
## 7. Troubleshooting (Common Issues)
## 8. Related Documentation (Cross-refs)
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE docs/ directory structure
  - IMPLEMENT: mkdir -p docs/
  - PLACEMENT: Project root docs/
  - OUTPUT: Empty docs/ directory ready for documentation

Task 2: CREATE docs/HOOK_CONFIGURATION.md with Overview section
  - CREATE: docs/HOOK_CONFIGURATION.md
  - IMPLEMENT: Overview section explaining what the mdsel reminder hook is
  - CONTENT:
    - Hook purpose and behavior
    - When it fires (PostToolUse after Read on large .md files)
    - What it outputs (reminder to use mdsel)
  - CROSS-REFERENCE: PRD.md section 6 (Reminder Hook System)
  - OUTPUT: Documentation file with overview

Task 3: WRITE settings.json Location section
  - APPEND: ## settings.json Location section
  - IMPLEMENT: Documentation of user-level vs project-level locations
  - CONTENT:
    - User-level: ~/.claude/settings.json
    - Project-level: .claude/settings.json
    - When to use each level
    - How project-level overrides user-level
  - EXAMPLE: Show path examples with ls commands
  - OUTPUT: Expanded documentation

Task 4: WRITE Configuration Structure section
  - APPEND: ## Configuration Structure section
  - IMPLEMENT: Explanation of PostToolUse hook JSON structure
  - FOLLOW: plan/docs/claude_code_skills.md lines 63-81
  - CONTENT:
    - hooks.PostToolUse array structure
    - matcher pattern syntax (string matching)
    - hooks array with type: "command"
    - command field format
  - DIAGRAM: Show JSON structure with field explanations
  - OUTPUT: Expanded documentation

Task 5: WRITE Complete Examples section
  - APPEND: ## Complete Examples section
  - IMPLEMENT: Full settings.json examples
  - CONTENT:
    - Minimal example: Just mdsel hook
    - Integration example: mdsel hook alongside existing hooks
    - User-level example: Full ~/.claude/settings.json with mdsel
    - Project-level example: .claude/settings.json with mdsel
  - VALIDATE: All JSON examples are valid (use jq)
  - PATTERN: Use actual settings.json structure from ~/.claude/settings.json as reference
  - OUTPUT: Expanded documentation with working examples

Task 6: WRITE Environment Variables section
  - APPEND: ## Environment Variables section
  - IMPLEMENT: Documentation of MDSEL_MIN_WORDS configuration
  - CONTENT:
    - How to set env vars in hook configuration
    - Default value (200) when not set
    - Example: "env": {"MDSEL_MIN_WORDS": "300"}
    - Per-project vs user-level environment configuration
  - CROSS-REFERENCE: plan/docs/external_deps.md "Environment Variables" table
  - OUTPUT: Expanded documentation

Task 7: WRITE Validation section
  - APPEND: ## Validation section
  - IMPLEMENT: Commands to test and verify hook configuration
  - CONTENT:
    - JSON syntax validation: jq '.' settings.json
    - Hook script test: echo '{"tool_name":"Read",...}' | bash hooks/claude/mdsel-reminder.sh
    - Create test file and trigger hook in Claude Code
    - Verify reminder appears in conversation
  - TEST: Run all validation commands to ensure they work
  - OUTPUT: Expanded documentation with tested commands

Task 8: WRITE Troubleshooting section
  - APPEND: ## Troubleshooting section
  - IMPLEMENT: Common issues and solutions
  - CONTENT:
    - Hook not firing (check matcher, check script permissions)
    - Permission denied (chmod +x)
    - JSON syntax errors (use jq to validate)
    - Path issues (use absolute paths or ${CLAUDE_PROJECT_DIR})
    - No reminder output (check MDSEL_MIN_WORDS threshold)
  - PATTERN: Problem -> Cause -> Solution format
  - OUTPUT: Expanded documentation

Task 9: WRITE Related Documentation section
  - APPEND: ## Related Documentation section
  - IMPLEMENT: Cross-references to related project documentation
  - CONTENT:
    - PRD.md (product requirements)
    - plan/docs/claude_code_skills.md (hook specification)
    - hooks/claude/mdsel-reminder.sh (hook script)
    - plan/P1M2T1/PRP.md (hook implementation PRP)
  - FORMAT: Use markdown links with specific sections
  - OUTPUT: Complete documentation file

Task 10: VALIDATE documentation completeness
  - REVIEW: docs/HOOK_CONFIGURATION.md against success criteria
  - VERIFY: All sections from task list are present
  - CHECK: All JSON examples are valid (test with jq)
  - CONFIRM: All validation commands work
  - ENSURE: Cross-references are correct and linkable
  - OUTPUT: Final validated documentation
```

### Implementation Patterns & Key Details

```markdown
<!-- Documentation Header Pattern -->

# Claude Code Hook Configuration: mdsel Reminder

This guide explains how to configure the mdsel reminder hook in Claude Code's `settings.json` to encourage agents to use `mdsel` instead of `Read` for large Markdown files.

## Overview

The mdsel reminder hook is a **PostToolUse** hook that fires after the `Read` tool executes on a Markdown file exceeding the word count threshold.

**Behavior**:
- Triggers: After `Read` tool on `.md` files with word count > MDSEL_MIN_WORDS (default: 200)
- Outputs: JSON reminder injected into agent's conversation
- Non-blocking: Never prevents the Read operation from completing

**Reminder text** (normative - no variation allowed):
```
This is a Markdown file over the configured size threshold.
Use `mdsel index` and `mdsel select` instead of Read.
```

<!-- Configuration Example Pattern -->

## Complete Example: User-Level Configuration

Edit `~/.claude/settings.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash /home/user/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

**Field explanations**:
- `matcher`: "Read" - Only fire for Read tool (exact match)
- `type`: "command" - Execute a shell command
- `command`: Full path to hook script (use absolute path or ${CLAUDE_PROJECT_DIR})

<!-- Environment Variable Pattern -->

## Environment Variables

Set `MDSEL_MIN_WORDS` to customize the word count threshold:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PROJECT_DIR}/hooks/claude/mdsel-reminder.sh",
            "env": {
              "MDSEL_MIN_WORDS": "300"
            }
          }
        ]
      }
    ]
  }
}
```

- Default: `200` (when not set)
- Per-hook: Set in hook's `env` object
- Applies to: Only that hook execution

<!-- Validation Commands Pattern -->

## Validation

### 1. Validate JSON Syntax

```bash
# Check settings.json is valid JSON
jq '.' ~/.claude/settings.json
# Expected: Pretty-printed JSON (no errors)

# Or use python
python3 -m json.tool ~/.claude/settings.json
```

### 2. Test Hook Script Directly

```bash
# Create test JSON input
cat > /tmp/hook-test.json << 'EOF'
{
  "session_id": "test",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/large.md"
  },
  "tool_response": {}
}
EOF

# Test hook script
cat /tmp/hook-test.json | bash hooks/claude/mdsel-reminder.sh
# Expected: JSON output with hookSpecificOutput.additionalContext (if file exists and is large)
```

### 3. Test in Claude Code

1. Create a test Markdown file with >200 words:
```bash
cat > /tmp/test-large.md << 'EOF'
# Test File

This file contains many words to test the mdsel reminder hook.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
(repeat to exceed 200 words...)
EOF
```

2. In Claude Code, run: `Read /tmp/test-large.md`

3. Expected: Reminder appears in conversation after Read completes

<!-- Troubleshooting Pattern -->

## Troubleshooting

### Hook Not Firing

**Possible causes**:
1. Matcher pattern doesn't match "Read"
2. Script path is incorrect
3. Script is not executable

**Solutions**:
```bash
# 1. Check settings.json syntax
jq '.' ~/.claude/settings.json

# 2. Verify script exists and is executable
ls -l hooks/claude/mdsel-reminder.sh
# Should show: -rwxr-xr-x (executable)

# 3. Make script executable if needed
chmod +x hooks/claude/mdsel-reminder.sh

# 4. Test script directly with valid input
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | bash hooks/claude/mdsel-reminder.sh
```
```

### Integration Points

```yaml
DOCUMENTATION:
  - create: docs/HOOK_CONFIGURATION.md
  - purpose: User-facing configuration guide
  - audience: Developers installing mdsel-skill

CROSS REFERENCES:
  - link: PRD.md section 6 (Reminder Hook System)
  - link: plan/docs/claude_code_skills.md (Hook Configuration)
  - link: hooks/claude/mdsel-reminder.sh (Hook script)
  - link: plan/P1M2T1/PRP.md (Hook implementation)

INSTALLATION FLOW:
  - step: After install.sh completes
  - message: "Configure your hooks: See docs/HOOK_CONFIGURATION.md"
  - next: User reads docs, updates settings.json, validates

FUTURE WORK:
  - P1.M4: Installation script will automate settings.json updates
  - For now: Manual configuration is documented
```

## Validation Loop

### Level 1: Documentation Structure (Immediate Feedback)

```bash
# After creating docs/HOOK_CONFIGURATION.md, verify structure

# Check file exists
ls -la docs/HOOK_CONFIGURATION.md
# Expected: File exists

# Check required sections are present
grep -E "^## (Overview|settings.json Location|Configuration Structure|Complete Examples|Environment Variables|Validation|Troubleshooting|Related Documentation)" docs/HOOK_CONFIGURATION.md
# Expected: All 8 sections found

# Check markdown formatting
# (Use markdown linter if available, or manual review)
# Expected: Proper heading hierarchy, code blocks with language tags
```

### Level 2: Content Validation (Accuracy Check)

```bash
# Validate all JSON examples in documentation

# Extract all JSON code blocks and validate
# (Manual process: copy each JSON example and test)

# Example: Validate the main configuration example
cat > /tmp/test-settings.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PROJECT_DIR}/hooks/claude/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
EOF

jq '.' /tmp/test-settings.json
# Expected: Valid JSON, pretty-printed

# Verify all command examples work
# Copy each bash command from documentation and test

# Test: jq validation command from Validation section
jq '.' ~/.claude/settings.json
# Expected: Works without errors

# Test: Hook script direct test
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | bash hooks/claude/mdsel-reminder.sh
# Expected: No syntax errors (exits 0)
```

### Level 3: Link Validation (Cross-Reference Check)

```bash
# Verify all cross-references are valid

# Check linked files exist
ls -la PRD.md
ls -la plan/docs/claude_code_skills.md
ls -la hooks/claude/mdsel-reminder.sh
ls -la plan/P1M2T1/PRP.md
# Expected: All files exist

# Verify section references are correct
grep "section 6" PRD.md | head -5
# Should show: "6. Reminder Hook System (CORE DELIVERABLE)"

grep "Hook Configuration" plan/docs/claude_code_skills.md
# Should show the section with settings.json examples
```

### Level 4: User Testing (Usability Validation)

```bash
# Simulate user following the documentation

# 1. Start from a clean state (no hook configured)
# Backup existing settings.json
cp ~/.claude/settings.json ~/.claude/settings.json.backup

# 2. Follow documentation to add hook
# (Manual: Copy JSON example from docs, add to settings.json)

# 3. Validate JSON syntax (per documentation)
jq '.' ~/.claude/settings.json
# Expected: Valid JSON

# 4. Test hook script (per documentation)
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | bash hooks/claude/mdsel-reminder.sh
# Expected: Runs without errors

# 5. Create test Markdown file and trigger hook in Claude Code
# (Manual: Use Claude Code UI to Read a large .md file)
# Expected: Reminder appears in conversation

# 6. Restore settings.json
mv ~/.claude/settings.json.backup ~/.claude/settings.json
```

## Final Validation Checklist

### Technical Validation

- [ ] File exists at docs/HOOK_CONFIGURATION.md
- [ ] All required sections are present (8 sections)
- [ ] All JSON examples are valid (tested with jq)
- [ ] All bash commands are tested and working
- [ ] Markdown formatting is consistent
- [ ] Code blocks use proper language tags (json, bash)
- [ ] Cross-references link to existing files

### Content Validation

- [ ] Overview explains hook purpose clearly
- [ ] Both user-level and project-level locations documented
- [ ] Configuration structure explanation is complete
- [ ] Complete examples show integration scenarios
- [ ] Environment variable configuration is clear
- [ ] Validation commands are tested and accurate
- [ ] Troubleshooting covers common issues
- [ ] Related Documentation section has all cross-refs

### Feature Validation

- [ ] Documentation enables standalone configuration
- [ ] Examples use correct JSON structure per plan/docs/claude_code_skills.md
- [ ] Matcher patterns are correctly documented
- [ ] Environment variable handling matches PRD specification
- [ ] Validation steps verify hook works end-to-end
- [ ] Cross-references are accurate and helpful

### Documentation Quality

- [ ] Writing is clear and concise
- [ ] Examples are complete and working
- [ ] Troubleshooting solutions are actionable
- [ ] Structure follows logical flow (overview -> config -> examples -> validation)
- [ ] No prior knowledge assumed (No Prior Knowledge test passed)

---

## Anti-Patterns to Avoid

- **Don't** use invalid JSON in examples (always test with jq)
- **Don't** assume user knows where settings.json lives (document both locations)
- **Don't** forget to document environment variable configuration
- **Don't** use untested bash commands in validation section
- **Don't** skip the cross-reference section (users need deeper docs)
- **Don't** make examples too minimal (show integration scenarios)
- **Don't** forget to mention file permissions (chmod +x)
- **Don't** use tilde (~) paths in examples (not reliable in settings.json)
- **Don't** assume user-level vs project-level is obvious (explain differences)
- **Don't** skip the troubleshooting section (common issues will occur)

## Confidence Score

**9/10** - One-pass implementation success likelihood is very high

**Justification**:
- Real settings.json example available from ~/.claude/settings.json
- Complete hook specification in plan/docs/claude_code_skills.md
- Hook script already implemented and available for reference
- PRD has complete product requirements
- Git history shows previous hook documentation patterns

**Risk Mitigation**:
- Only risk is ensuring JSON examples are valid
- Mitigated by: Testing all examples with jq before including
- Validation commands in documentation itself for user self-verification

---

*PRP Version: 1.0*
*Created: 2025-12-30*
*Task: P1.M2.T2 - Document Hook Configuration*
