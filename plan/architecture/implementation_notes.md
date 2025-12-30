# Implementation Notes

## Critical Findings from Research

### 1. PostToolUse Stdout Injection

**Issue**: PostToolUse hooks do NOT automatically inject stdout into the conversation like UserPromptSubmit hooks do.

**Solution Options**:

A. **JSON Output with hookSpecificOutput**:
```json
{
  "hookSpecificOutput": {
    "additionalContext": "Reminder message here"
  }
}
```

B. **Leverage session context**: The hook execution is visible in the session, even if not directly injected.

C. **Consider PreToolUse alternative**: Could intercept BEFORE Read completes, but PRD specifies non-blocking behavior.

**Recommendation**: Use JSON output format and verify behavior during testing.

### 2. OpenCode tool.execute.after Arguments

**Issue**: The `tool.execute.after` hook receives `{ title, output, metadata }` but may not have direct access to `args` (tool arguments like file path).

**Solution Options**:

A. **Use tool.execute.before to capture args**:
```typescript
let lastReadPath: string | undefined

return {
  'tool.execute.before': async ({ tool }, { args }) => {
    if (tool === 'Read') {
      lastReadPath = args.file_path
    }
  },
  'tool.execute.after': async ({ tool }) => {
    if (tool === 'Read' && lastReadPath?.endsWith('.md')) {
      // Check word count
    }
  }
}
```

B. **Parse from output**: Extract file path from Read tool output header.

C. **Check metadata**: May contain file path information.

**Recommendation**: Implement with `tool.execute.before` state capture for reliability.

### 3. mdsel CLI Availability

**Issue**: mdsel is not publicly available.

**Mitigation**:
1. Document the dependency clearly
2. Installation script warns if not found
3. Skill provides fallback instructions

### 4. Cross-Platform Skill Compatibility

**Verified**: OpenCode explicitly supports `.claude/skills/` directory.

**Single Installation**: Place skill at `.claude/skills/mdsel/SKILL.md` for both platforms.

## File Structure

```
mdsel-skill/
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md              # Cross-platform skill
├── hooks/
│   ├── claude/
│   │   └── mdsel-reminder.sh         # Claude Code PostToolUse hook
│   └── opencode/
│       └── mdsel-reminder.ts         # OpenCode plugin
├── install.sh                         # Cross-platform installer
├── package.json                       # npm package definition
├── plan/
│   └── architecture/                  # This documentation
├── PRD.md                            # Product requirements
├── README.md                         # Usage documentation
└── tasks.json                        # Implementation backlog
```

## Testing Strategy

### Manual Testing

1. **Skill Loading**:
   - Verify skill appears in `/skills` listing
   - Verify skill activates on markdown-related prompts

2. **Hook Triggering**:
   - Read a small .md file (<200 words) - no reminder
   - Read a large .md file (>200 words) - reminder fires

3. **Word Count Accuracy**:
   - Test files with exact threshold boundary (199, 200, 201 words)

4. **Cross-Platform**:
   - Test in Claude Code
   - Test in OpenCode

### Automated Testing

- Unit tests for word counting logic
- Shell script syntax validation
- TypeScript compilation check

## Installation Flow

```
install.sh
├── Detect platforms (Claude Code, OpenCode)
├── Verify mdsel CLI availability
│   ├── Found: Continue
│   └── Not found: Warn and continue
├── Install skill
│   └── Copy SKILL.md to .claude/skills/mdsel/
├── Configure hooks (per platform)
│   ├── Claude Code: Update settings.json
│   └── OpenCode: Copy plugin to .opencode/plugin/
└── Verify installation
```

## Normative Reminder Text

Per PRD, the exact reminder wording (no variation allowed):

```
This is a Markdown file over the configured size threshold.
Use `mdsel index` and `mdsel select` instead of Read.
```
