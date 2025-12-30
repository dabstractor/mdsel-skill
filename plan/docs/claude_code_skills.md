# Claude Code Skills System

## Overview

Claude Code skills are self-contained instruction sets that provide domain-specific knowledge to the agent. Skills load on-demand, consuming minimal tokens when inactive.

## SKILL.md Structure

### Required Format
```markdown
---
name: skill-name
description: What it does AND when to use it (max 1024 chars)
---

# Skill Title

Instructions, examples, and references...
```

### YAML Frontmatter Fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Lowercase alphanumeric + hyphens, max 64 chars |
| `description` | Yes | Must include trigger keywords, max 1024 chars |
| `allowed-tools` | No | Restrict available tools (e.g., `Read, Grep, Bash`) |
| `disable-model-invocation` | No | If true, requires manual `/skill-name` invocation |

### Token Loading Model

```
Level 1: Metadata only (~50-100 tokens) - Always in context
Level 2: SKILL.md body (< 500 lines) - Loaded when activated
Level 3: Bundled resources - Loaded on-demand
```

## Skill Locations

```
~/.claude/skills/skill-name/SKILL.md        # User-level (personal)
.claude/skills/skill-name/SKILL.md          # Project-level (shareable)
```

## Claude Code Hooks

### Hook Types

| Hook | Fires When | Can Block |
|------|------------|-----------|
| PreToolUse | Before tool executes | Yes (exit 2) |
| PostToolUse | After tool completes | No |
| UserPromptSubmit | Before Claude processes prompt | Yes |
| Stop | When Claude finishes | No |

### PostToolUse Hook (for mdsel-reminder)

**Trigger**: After a tool successfully completes
**Receives**: `tool_name`, `tool_input`, `tool_response` via stdin JSON
**Cannot Block**: The Read operation has already completed
**Output**: Stdout is NOT automatically injected (unlike UserPromptSubmit)

### Hook Configuration (settings.json)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

### Exit Code Semantics

| Code | Meaning |
|------|---------|
| 0 | Success - continue normally |
| 1 | Error - stderr shown to user |
| 2 | Block - stderr fed to Claude (PreToolUse only) |

### Stdin JSON Format

```json
{
  "session_id": "unique-id",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/file.md"
  },
  "tool_response": {
    "content": "..."
  }
}
```

### PostToolUse Output Behavior

**Important**: For PostToolUse hooks, plain text stdout is NOT injected into conversation.

To inject a reminder:
1. Output JSON with `hookSpecificOutput.additionalContext`
2. Or rely on the hook being visible in the session context

**Recommended Approach**: Use JSON output:
```json
{
  "decision": "continue",
  "hookSpecificOutput": {
    "additionalContext": "Reminder: Use mdsel for large Markdown files"
  }
}
```

## Implementation Notes for mdsel-skill

### Skill File: `.claude/skills/mdsel/SKILL.md`

Frontmatter requirements:
- `name: mdsel`
- `description`: Must mention "Markdown", "large files", "selector", trigger words
- `allowed-tools: Bash` (mdsel is CLI-based)

### Hook Script Logic

```bash
#!/bin/bash
# Read stdin JSON
HOOK_INPUT=$(cat)

# Extract file path
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path')

# Check if Markdown
[[ "$FILE_PATH" != *.md ]] && exit 0

# Count words
WORD_COUNT=$(wc -w < "$FILE_PATH" 2>/dev/null || echo 0)
THRESHOLD=${MDSEL_MIN_WORDS:-200}

# Check threshold
if [ "$WORD_COUNT" -gt "$THRESHOLD" ]; then
  # Output reminder as JSON for injection
  echo '{"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold. Use `mdsel index` and `mdsel select` instead of Read."}}'
fi

exit 0
```
