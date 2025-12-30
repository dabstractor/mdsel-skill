# Claude Code Hook Configuration: mdsel Reminder

This guide explains how to configure the mdsel reminder hook in Claude Code's `settings.json` to encourage agents to use `mdsel` instead of `Read` for large Markdown files.

## Overview

The mdsel reminder hook is a **PostToolUse** hook that fires after the `Read` tool executes on a Markdown file exceeding the word count threshold.

**Behavior**:
- Triggers: After `Read` tool on `.md` files with word count > `MDSEL_MIN_WORDS` (default: 200)
- Outputs: JSON reminder injected into agent's conversation
- Non-blocking: Never prevents the Read operation from completing

**Reminder text** (normative - no variation allowed):
```
This is a Markdown file over the configured size threshold.
Use `mdsel index` and `mdsel select` instead of Read.
```

## settings.json Location

Claude Code supports two configuration levels for `settings.json`:

### User-Level Configuration

**Location**: `~/.claude/settings.json`

Applies to all Claude Code sessions across all projects. Use this for personal preferences that should be available everywhere.

**When to use**: You want the mdsel reminder active in all projects.

### Project-Level Configuration

**Location**: `.claude/settings.json` (in your project root)

Applies only to the current project. Use this for project-specific hook configurations.

**When to use**: You want the mdsel reminder active only for specific projects.

### How the Levels Interact

- Project-level settings override user-level settings for conflicting configurations
- Hooks at both levels will execute (merged, not replaced)
- For the mdsel reminder, choose one level based on your needs

**Verify which locations exist**:
```bash
# Check user-level
ls -la ~/.claude/settings.json

# Check project-level
ls -la .claude/settings.json
```

## Configuration Structure

The mdsel reminder hook uses the PostToolUse hook event with a command-type hook.

### JSON Structure

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
            "command": "bash /absolute/path/to/hooks/claude/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

### Field Explanations

| Field | Value | Purpose |
|-------|-------|---------|
| `$schema` | URL string | Validates settings.json against official schema (optional but recommended) |
| `hooks` | Object | Container for all hook configurations |
| `PostToolUse` | Array | Hooks that fire after a tool completes |
| `matcher` | "Read" | String pattern - only fire for Read tool (exact match) |
| `hooks` | Array | One or more hooks to execute when matcher matches |
| `type` | "command" | Execute a shell command |
| `command` | string | Shell command to execute (bash script path) |

### How the Hook Receives Data

When the PostToolUse hook fires, Claude Code passes JSON to the script via **stdin**:

```json
{
  "session_id": "unique-session-id",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/file.md"
  },
  "tool_response": {
    "content": "..."
  }
}
```

The hook script (`mdsel-reminder.sh`) parses this JSON to:
1. Extract the `file_path` from `tool_input`
2. Check if the file is a Markdown file (`.md` extension)
3. Count words in the file
4. Output JSON reminder if threshold exceeded

### Important: JSON Output for Reminder Injection

Unlike UserPromptSubmit hooks, PostToolUse hooks do **NOT** automatically inject plain text stdout into the conversation. To inject a reminder, the script must output JSON with `hookSpecificOutput.additionalContext`:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."
  }
}
```

This is the format used by `hooks/claude/mdsel-reminder.sh`.

## Complete Examples

### Example 1: Minimal User-Level Configuration

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
            "command": "bash /home/dustin/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

### Example 2: Project-Level Configuration with Environment Variable

Create or edit `.claude/settings.json` in your project root:

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

**Note**: `${CLAUDE_PROJECT_DIR}` is an environment variable provided by Claude Code that expands to the project root. Use this for portable, project-relative paths.

### Example 3: Integration with Existing Hooks

If you already have hooks configured, add the mdsel reminder alongside them:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "opus",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "write|edit|multiedit",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.rs$ ]]; then rustfmt \"$CLAUDE_FILE_PATHS\"; fi"
          }
        ]
      },
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash /home/dustin/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

### Example 4: Multiple Matchers for Same Tool

You can also combine matchers (the matcher accepts regex patterns):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read|Write",
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
```

**Note**: The mdsel reminder hook only acts on Read operations and checks for `.md` files internally, so combining with Write is harmless (the script will exit silently for non-Read or non-Markdown files).

## Environment Variables

### MDSEL_MIN_WORDS

Controls the word count threshold for triggering the reminder.

| Setting | Behavior |
|---------|----------|
| Not set | Default threshold of 200 words is used |
| Set to "300" | Reminder fires only for Markdown files with >300 words |
| Set to "100" | Reminder fires for Markdown files with >100 words |

### How to Set Environment Variables

In your hook configuration, add an `env` object:

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

**Important**: Environment variables must be set in the `env` object, not in the command string. Setting them in the command string (e.g., `MDSEL_MIN_WORDS=300 bash ...`) will not work reliably.

### Per-Project vs User-Level Environment Configuration

You can set different thresholds at different levels:

- **User-level** (`~/.claude/settings.json`): Sets a default threshold for all projects
- **Project-level** (`.claude/settings.json`): Overrides the user-level threshold for that specific project

Example: Set 300 words globally, but 100 words for a specific project with many large docs.

## Validation

### 1. Validate JSON Syntax

```bash
# Check settings.json is valid JSON
jq '.' ~/.claude/settings.json
# Expected: Pretty-printed JSON (no errors)

# Or for project-level
jq '.' .claude/settings.json

# Or use python
python3 -m json.tool ~/.claude/settings.json
```

### 2. Verify Hook Script Exists and is Executable

```bash
# Check script exists
ls -la hooks/claude/mdsel-reminder.sh
# Expected: File exists

# Check executable permissions
ls -l hooks/claude/mdsel-reminder.sh
# Should show: -rwxr-xr-x (executable)
# If not executable: -rw-r--r--

# Make executable if needed
chmod +x hooks/claude/mdsel-reminder.sh
```

### 3. Test Hook Script Directly

```bash
# Create test JSON input
cat > /tmp/hook-test.json << 'EOF'
{
  "session_id": "test-session",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/tmp/test-large.md"
  },
  "tool_response": {}
}
EOF

# Create a test Markdown file with >200 words
cat > /tmp/test-large.md << 'EOF'
# Test Large Markdown File

This is a test file to verify the mdsel reminder hook works correctly.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
$(printf 'Word %.0s ' {1..200})
EOF

# Test hook script
cat /tmp/hook-test.json | bash hooks/claude/mdsel-reminder.sh
# Expected: JSON output with hookSpecificOutput.additionalContext
# {"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}
```

### 4. Test in Claude Code

1. Create a test Markdown file with >200 words:
```bash
cat > /tmp/test-large.md << 'EOF'
# Test Large Markdown File

This file contains many words to test the mdsel reminder hook.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
EOF

# Add enough content to exceed 200 words
for i in {1..50}; do echo "Word $i: Lorem ipsum dolor sit amet consectetur adipiscing elit." >> /tmp/test-large.md; done
```

2. In Claude Code, run: `Read /tmp/test-large.md`

3. Expected: Reminder appears in conversation after Read completes

## Troubleshooting

### Hook Not Firing

**Possible causes**:
1. Matcher pattern doesn't match "Read"
2. Script path is incorrect
3. Script is not executable
4. settings.json has syntax errors

**Solutions**:
```bash
# 1. Check settings.json syntax
jq '.' ~/.claude/settings.json
# Expected: No errors

# 2. Verify script exists
ls -la hooks/claude/mdsel-reminder.sh
# Expected: File exists

# 3. Make script executable
chmod +x hooks/claude/mdsel-reminder.sh

# 4. Test script directly with valid input
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"}}' | bash hooks/claude/mdsel-reminder.sh
# Expected: No errors, exits with code 0
```

### Permission Denied on Script

**Cause**: Script file is not executable.

**Solution**:
```bash
chmod +x hooks/claude/mdsel-reminder.sh

# Verify
ls -l hooks/claude/mdsel-reminder.sh
# Should show: -rwxr-xr-x
```

### JSON Syntax Errors in settings.json

**Cause**: Invalid JSON syntax (trailing commas, single quotes, missing braces).

**Solution**:
```bash
# Validate with jq
jq '.' ~/.claude/settings.json

# If jq reports errors, fix them:
# - Remove trailing commas
# - Use double quotes for strings (not single quotes)
# - Ensure all braces/brackets are closed
```

### Path Issues

**Cause**: Using tilde (`~`) or relative paths that don't expand correctly in settings.json.

**Solution**:
```bash
# DON'T use tilde (doesn't work in settings.json)
"command": "bash ~/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh"  # WRONG

# DO use absolute paths
"command": "bash /home/user/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh"  # CORRECT

# OR use ${CLAUDE_PROJECT_DIR} for project-relative paths
"command": "bash ${CLAUDE_PROJECT_DIR}/hooks/claude/mdsel-reminder.sh"  # CORRECT
```

### No Reminder Output

**Possible causes**:
1. File word count is below threshold
2. File is not a Markdown file (`.md` extension)
3. `jq` is not installed (hook script requires jq for JSON parsing)

**Solutions**:
```bash
# 1. Check file word count
wc -w /path/to/file.md

# 2. Set lower threshold for testing
# Add to settings.json hook:
"env": { "MDSEL_MIN_WORDS": "10" }

# 3. Verify jq is installed
command -v jq
# If not found: install jq
# Ubuntu/Debian: sudo apt-get install jq
# macOS: brew install jq
# Arch: sudo pacman -S jq
```

### Hook Firing Too Often

**Cause**: Threshold is too low for your use case.

**Solution**: Set a higher `MDSEL_MIN_WORDS` value in the hook's `env` object:
```json
"env": {
  "MDSEL_MIN_WORDS": "500"
}
```

## Related Documentation

### Project Documentation

- **[PRD.md](../PRD.md)** - Complete product requirements, see section 6 (Reminder Hook System) for hook behavior specification
- **[plan/docs/claude_code_skills.md](../plan/docs/claude_code_skills.md)** - Claude Code hooks specification and configuration patterns
- **[plan/docs/implementation_notes.md](../plan/docs/implementation_notes.md)** - Installation flow and architecture notes
- **[plan/P1M2T1/PRP.md](../plan/P1M2T1/PRP.md)** - Hook implementation PRP with technical details

### Hook Script

- **[hooks/claude/mdsel-reminder.sh](../hooks/claude/mdsel-reminder.sh)** - The actual hook script (bash source code)

### External Documentation

- **[Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)** - Official Claude Code hooks documentation
- **[settings.json Schema](https://json.schemastore.org/claude-code-settings.json)** - JSON schema for settings.json validation

### Additional Resources

- **[mdsel CLI](https://www.npmjs.com/package/mdsel)** - The mdsel tool (npm package)
- **[Skill File](../.claude/skills/mdsel/SKILL.md)** - mdsel skill definition for Claude Code

---

*Documentation for mdsel-skill P1.M2.T2*
*Last updated: 2025-12-30*
