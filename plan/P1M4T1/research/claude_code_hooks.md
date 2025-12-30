# Claude Code Hook Configuration and Installation Research

## Executive Summary

This research document details how Claude Code discovers, loads, and configures hooks based on existing implementations in the mdsel-skill project and related documentation. The research covers hook discovery mechanisms, configuration structures, best practices, and implementation patterns.

## 1. How Claude Code Discovers and Loads Hooks

### Hook Discovery Process

Claude Code discovers hooks through two primary mechanisms:

1. **Settings.json Configuration** - Primary method for user-defined hooks
2. **Plugin Directory Structure** - For marketplace and local plugins

### Hook Loading Flow

1. **Session Initialization**: Claude Code loads configuration files during startup
2. **Hook Registration**: Hooks are registered based on event types (UserPromptSubmit, PreToolUse, PostToolUse, Stop)
3. **Event Execution**: Hooks execute in parallel when their corresponding events fire
4. **Cleanup**: Hook execution results are processed and integrated into the conversation

### Important Notes

- **No Hot-Swapping**: Hook changes require restarting Claude Code
- **Parallel Execution**: All matching hooks run simultaneously (no guaranteed order)
- **Event-Specific**: Different hooks receive different JSON structures via stdin

## 2. The settings.json Structure for Hooks

### Basic Hook Configuration

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
    ],
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Add a reminder to test the solution when the user asks for code"
          }
        ]
      }
    ]
  }
}
```

### Configuration Locations

1. **User-level**: `~/.claude/settings.json` - Personal configuration
2. **Project-level**: `.claude/settings.json` - Project-specific configuration
3. **Plugin-level**: `plugins/plugin-name/hooks.json` - Plugin-specific hooks

### Hook Configuration Properties

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `matcher` | Yes | Pattern to match against event data | `"Read"`, `"*"`, `".*"` |
| `hooks` | Yes | Array of hook definitions | `[{...}]` |
| `type` | Yes | Hook execution type | `"command"`, `"prompt"` |
| `command` | Conditional | Command to execute (for type: command) | `"bash script.sh"` |
| `prompt` | Conditional | Prompt to evaluate (for type: prompt) | `"Check for security issues: $USER_PROMPT"` |
| `timeout` | No | Execution timeout in seconds | `30`, `60` |

## 3. Hook Directory Locations and Naming Conventions

### Standard Hook Directory Structure

```
~/.claude/                          # User Claude Code directory
├── settings.json                   # Main configuration
├── skills/                         # Skills directory
├── hooks/                          # User hooks directory
│   └── script-name.sh              # Individual hook scripts
└── plugins/                        # Marketplace plugins

.project-root/
├── .claude/                        # Project-specific Claude Code directory
│   ├── settings.json               # Project-specific configuration
│   ├── skills/                     # Project skills
│   └── hooks/                      # Project hooks
└── [other project files]
```

### Hook Script Naming Conventions

1. **Descriptive Names**: Use descriptive names that indicate purpose
   - Good: `security-check.sh`, `mdsel-reminder.sh`
   - Bad: `hook1.sh`, `script.sh`

2. **Consistent Extension**: Always use `.sh` extension for bash scripts
3. **Kebab-Case**: Use kebab-case for multiple-word names
4. **Namespace**: Consider prefixing with project/plugin name

### Hook File Permissions

```bash
# Make hook scripts executable
chmod +x ~/.claude/hooks/script-name.sh

# Verify permissions
ls -la ~/.claude/hooks/
```

**Required Permissions**:
- Execute permission (755 or 700)
- Read permission (644 or 600 for sensitive scripts)
- Write permission not typically needed

## 4. How Other Skills/Tools Install Their Hooks

### mdsel-skill Implementation Pattern

The mdsel-skill demonstrates a comprehensive hook installation approach:

#### 1. Hook Script Structure

```bash
#!/usr/bin/env bash
# Shebang for portability
set -euo pipefail  # Strict error handling

# Read JSON from stdin
hook_input=$(cat)

# Extract required fields
file_path=$(echo "$hook_input" | jq -r '.tool_input.file_path // ""')

# Early exits for performance
[[ -z "$file_path" ]] && exit 0
[[ "$file_path" != *.md ]] && exit 0

# Main logic
word_count=$(wc -w < "$file_path" 2>/dev/null || echo 0)
threshold="${MDSEL_MIN_WORDS:-200}"

if [[ "$word_count" -gt "$threshold" ]]; then
  echo '{"hookSpecificOutput":{"additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."}}'
fi

exit 0  # Always exit 0 (non-blocking)
```

#### 2. Installation Script Pattern

```bash
#!/bin/bash

# Function to configure Claude Code hooks
configure_claude_hooks() {
    local settings_file=".claude/settings.json"
    local hook_script="hooks/claude/mdsel-reminder.sh"

    # Create settings.json if it doesn't exist
    if [[ ! -f "$settings_file" ]]; then
        mkdir -p "$(dirname "$settings_file")"
        cat > "$settings_file" << 'EOF'
{
  "hooks": {}
}
EOF
    fi

    # Merge hook configuration using jq
    jq --arg hook_script "$hook_script" '
    .hooks.PostToolUse //= [] |
    .hooks.PostToolUse |= (
        if any(.matcher == "Read") then .
        else . + [{
            "matcher": "Read",
            "hooks": [{
                "type": "command",
                "command": $hook_script
            }]
        }]
        end
    )
    ' "$settings_file" > "$settings_file.tmp" && mv "$settings_file.tmp" "$settings_file"

    # Copy hook script and make executable
    mkdir -p "$(dirname "$hook_script")"
    cp source/mdsel-reminder.sh "$hook_script"
    chmod +x "$hook_script"
}
```

### Plugin Dev Skill Patterns

Based on research from the Plugin Dev Skill documentation:

#### Hook Development Best Practices

1. **Always validate stdin JSON**
2. **Handle missing jq gracefully**
3. **Use early exits for performance**
4. **Provide meaningful error messages via stderr**
5. **Use appropriate exit codes**

#### Exit Code Semantics

| Exit Code | Meaning | Use Case |
|-----------|---------|----------|
| `0` | Success - continue normally | Most hooks |
| `1` | Error - stderr shown to user | Non-critical failures |
| `2` | Block - stderr fed to Claude | PreToolUse hooks |

## 5. Hook File Permissions and Requirements

### Required Dependencies

1. **jq**: JSON parser for command hooks
   ```bash
   # Installation
   sudo apt-get install jq    # Debian/Ubuntu
   sudo yum install jq        # RHEL/CentOS
   brew install jq            # macOS
   ```

2. **bash**: Shell execution environment
3. **Standard utilities**: wc, cat, echo, mkdir, chmod

### File Permission Requirements

```bash
# Minimum working permissions
chmod 700 ~/.claude/hooks/private-hook.sh    # Private scripts
chmod 755 ~/.claude/hooks/public-hook.sh     # Scripts others might use

# Directory permissions
chmod 755 ~/.claude/hooks/
```

### Security Requirements

1. **Never execute untrusted scripts**
2. **Validate all JSON input**
3. **Quote all bash variables**
4. **Use `set -euo pipefail` for safety**
5. **Handle all error conditions gracefully**

### Environment Variables Available

| Variable | Description | Availability |
|----------|-------------|--------------|
| `$CLAUDE_PROJECT_DIR` | Project root path | Always |
| `$CLAUDE_PLUGIN_ROOT` | Plugin directory | Always |
| `$CLAUDE_ENV_FILE` | Persist env vars | SessionStart only |
| `$CLAUDE_CODE_REMOTE` | Remote context flag | Always |

## 6. Hook Implementation Patterns

### Prompt-Based Hooks (Recommended)

```json
{
  "UserPromptSubmit": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Check if this prompt requires security considerations: $USER_PROMPT",
          "timeout": 30
        }
      ]
    }
  ]
}
```

**Benefits**:
- Context-aware decisions
- Flexible evaluation logic
- Better edge case handling
- No external dependencies

### Command Hooks

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate-write.sh",
          "timeout": 60
        }
      ]
    }
  ]
}
```

**Use Cases**:
- Fast deterministic validations
- File system operations
- External tool integrations

## 7. Testing and Debugging Hooks

### Direct Hook Testing

```bash
# Test with sample JSON
echo '{"tool_name":"Read","tool_input":{"file_path":"/path/to/test.md"}}' | \
  bash ~/.claude/hooks/mdsel-reminder.sh

# Enable debug mode
claude --debug

# Validate JSON output
output=$(./hook.sh < test-input.json)
echo "$output" | jq .
```

### Common Issues and Solutions

1. **Hook not firing**
   - Check matcher patterns
   - Verify permissions
   - Check syntax errors

2. **jq not found**
   - Install jq package
   - Add graceful fallback in script

3. **Path issues**
   - Use absolute paths or $CLAUDE_PLUGIN_ROOT
   - Verify file existence before operations

## 8. Resources and References

### Found Documentation

- Plugin Dev Skill: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/SKILL.md`
- Advanced Patterns: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/references/advanced.md`
- Hookify Plugin Examples: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/hookify/README.md`

### Implementation Examples in This Project

1. **Bash Hook**: `/home/dustin/projects/mdsel-skill/hooks/claude/mdsel-reminder.sh`
2. **TypeScript Plugin**: `/home/dustin/projects/mdsel-skill/hooks/opencode/mdsel-reminder.ts`
3. **Documentation**: `/home/dustin/projects/mdsel-skill/plan/docs/claude-code-hooks-research.md`

## 9. Best Practices Summary

1. **Always validate input** - Check JSON structure and handle missing fields
2. **Use early exits** - Improve performance with quick rejections
3. **Implement proper error handling** - Use `set -euo pipefail`
4. **Choose appropriate hook types** - Prompt hooks for complex logic, command hooks for speed
5. **Document your hooks** - Include shebang comments and usage instructions
6. **Test thoroughly** - Test with various inputs and edge cases
7. **Follow naming conventions** - Use descriptive, consistent names
8. **Set proper permissions** - Ensure scripts are executable
9. **Handle dependencies gracefully** - Check for required tools like jq
10. **Use environment variables** - Make hooks configurable via environment

## 10. Hook Performance Considerations

1. **Keep hooks independent** - Don't rely on execution order
2. **Minimize execution time** - Use early exits and efficient commands
3. **Use appropriate timeouts** - Prevent hanging the session
4. **Cache results when possible** - Avoid repeated expensive operations
5. **Parallel execution awareness** - Design for simultaneous execution

This research provides a comprehensive foundation for understanding Claude Code hooks based on real-world implementations and existing documentation.