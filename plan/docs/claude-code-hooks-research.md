# Claude Code Hooks Research Documentation

Based on research from existing Claude Code plugins and documentation found in the local marketplace.

## 1. How Claude Code Hooks Work - user-prompt-submit-hook

Claude Code hooks are event-driven automation scripts that execute in response to specific events. The `UserPromptSubmit` hook fires when a user submits a prompt to Claude, allowing you to:

- Add context or instructions before Claude processes the prompt
- Validate or filter user input
- Modify prompts based on context
- Provide warnings or guidance

### Hook Execution Flow

1. User submits a prompt
2. UserPromptSubmit hooks execute in parallel
3. Hooks can modify, validate, or block the prompt
4. Modified prompt (if any) is sent to Claude
5. Claude processes and responds

## 2. JSON Format Received on Stdin

All hooks receive JSON via stdin with common fields:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.txt",
  "cwd": "/current/working/dir",
  "permission_mode": "ask|allow",
  "hook_event_name": "UserPromptSubmit",
  "user_prompt": "The actual user prompt text"
}
```

### Event-Specific Fields

- **UserPromptSubmit**: `user_prompt` contains the submitted prompt text
- **PreToolUse/PostToolUse**: `tool_name`, `tool_input`, `tool_result`
- **Stop/SubagentStop**: `reason`

### Access Fields in Prompts

For prompt-based hooks, you can use variables like:
- `$USER_PROMPT` - The user's submitted prompt
- `$TOOL_INPUT` - For PreToolUse/PostToolUse events
- `$TOOL_RESULT` - For PostToolUse events

## 3. Best Practices for Writing Claude Code Hooks

### Hook Configuration Formats

#### Plugin Format (hooks/hooks.json)
```json
{
  "description": "Brief explanation of hooks (optional)",
  "hooks": {
    "UserPromptSubmit": [...],
    "PreToolUse": [...],
    "Stop": [...]
  }
}
```

#### Settings Format (.claude/settings.json)
```json
{
  "UserPromptSubmit": [...],
  "PreToolUse": [...],
  "Stop": [...]
}
```

### Hook Types

#### Prompt-Based Hooks (Recommended)
```json
{
  "type": "prompt",
  "prompt": "Evaluate this user prompt: $USER_PROMPT",
  "timeout": 30
}
```

**Benefits:**
- Context-aware decisions based on natural language reasoning
- Flexible evaluation logic without bash scripting
- Better edge case handling
- Easier to maintain

#### Command Hooks
```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 60
}
```

**Use for:**
- Fast deterministic validations
- File system operations
- External tool integrations

## 4. Examples of Existing Claude Code Hooks

### Example 1: Security Prompt Validation
```json
{
  "UserPromptSubmit": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Check if prompt requires security guidance. If discussing auth, permissions, or API security, return relevant warnings."
        }
      ]
    }
  ]
}
```

### Example 2: Hookify Plugin Rule
```markdown
---
name: warn-sensitive-prompts
enabled: true
event: prompt
action: warn
pattern: (password|secret|key).{0,20}['\"]?[A-Za-z0-9]{20,}
---

🔐 **Potential sensitive data detected in prompt**

Please avoid sharing passwords, API keys, or secrets in prompts.
```

### Example 3: Session Context Hook
```json
{
  "UserPromptSubmit": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Based on the current project context and transcript, suggest relevant context that should be added to better answer: $USER_PROMPT"
        }
      ]
    }
  ]
}
```

## 5. Constraints and Limitations of Claude Code Hooks

### Hook Limitations

1. **No Hot-Swapping**: Hooks are loaded at session start. Changes require restarting Claude Code.
2. **Parallel Execution**: All matching hooks run simultaneously - no guaranteed order.
3. **Timeouts**:
   - Command hooks default: 60 seconds
   - Prompt hooks default: 30 seconds
4. **Exit Codes**:
   - `0` - Success (stdout shown in transcript)
   - `2` - Blocking error (stderr fed back to Claude)
   - Other - Non-blocking error

### Performance Considerations

1. **Keep hooks independent** - Don't rely on execution order
2. **Use appropriate timeouts** - Prevent long-running hooks
3. **Quote all bash variables** - Prevent injection attacks
4. **Validate all inputs** - Especially in command hooks

### Security Best Practices

```bash
#!/bin/bash
set -euo pipefail

input=$(cat)

# Validate user prompt format
prompt=$(echo "$input" | jq -r '.user_prompt')

# Check for sensitive content
if echo "$prompt" | grep -qE "(password|secret|key).{0,20}['\"]?[A-Za-z0-9]{20,}"; then
  echo '{"decision": "block", "reason": "Potential sensitive data detected"}' >&2
  exit 2
fi

exit 0
```

### Available Environment Variables

- `$CLAUDE_PROJECT_DIR` - Project root path
- `$CLAUDE_PLUGIN_ROOT` - Plugin directory (use for portable paths)
- `$CLAUDE_ENV_FILE` - SessionStart only: persist env vars here
- `$CLAUDE_CODE_REMOTE` - Set if running in remote context

## Configuration Examples

### Basic UserPromptSubmit Hook
```json
{
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
```

### Conditional Hook Based on Project Type
```json
{
  "UserPromptSubmit": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/check-project-type.sh",
          "timeout": 10
        }
      ]
    }
  ]
}
```

### With Multiple Hooks
```json
{
  "UserPromptSubmit": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Check if this prompt requires security considerations"
        },
        {
          "type": "prompt",
          "prompt": "Suggest best practices related to: $USER_PROMPT"
        }
      ]
    }
  ]
}
```

## Testing and Debugging

### Test Hooks Directly
```bash
echo '{"user_prompt": "Write code to access database"}' | \
  bash ${CLAUDE_PLUGIN_ROOT}/scripts/security-check.sh
```

### Enable Debug Mode
```bash
claude --debug
```

### Validate Hook JSON Output
```bash
output=$(./your-hook.sh < test-input.json)
echo "$output" | jq .
```

## Additional Resources

### Found Documentation
- Plugin Dev Skill: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/SKILL.md`
- Advanced Patterns: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/hook-development/references/advanced.md`
- Hookify Plugin Examples: `/home/dustin/.claude/plugins/marketplaces/claude-plugins-official/plugins/hookify/README.md`

### Official Documentation (when available)
- https://docs.claude.com/en/docs/claude-code/hooks

### Example Hook Scripts
- Security validation hooks
- Context loading hooks
- Logging hooks
- File system hooks

## Summary

Claude Code hooks provide powerful event-driven automation capabilities. The `UserPromptSubmit` hook is particularly useful for:

1. **Context Enhancement** - Adding relevant project context
2. **Input Validation** - Preventing security issues
3. **Guidance Provision** - Suggesting best practices
4. **Pattern Recognition** - Detecting recurring needs

When implementing hooks, prioritize prompt-based hooks for complex logic and command hooks for fast deterministic operations. Always follow security best practices and test thoroughly before deployment.