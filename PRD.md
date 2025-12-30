# PRD: mdsel-skill

**Cross-Platform Agent Skill for Declarative Markdown Selection**

---

## 1. Purpose & Scope

`mdsel-skill` is a **cross-platform agent skill** that conditions AI coding agents to access Markdown documents via **declarative selectors** instead of full-file reads.

This project replaces the MCP-based approach (`mdsel-mcp`) to eliminate the ~1300 token overhead from tool schema injection. Skills load on-demand, consuming only ~50-100 tokens when inactive.

### Target Platforms

| Platform | Skill Support | Hook Support |
|----------|---------------|--------------|
| Claude Code | `.claude/skills/` | Shell commands in settings |
| OpenCode | `.opencode/skill/` AND `.claude/skills/` | JS/TS plugins |

### Goals

- Expose `mdsel` CLI as an agent skill with minimal token overhead
- Actively discourage misuse of the `Read` tool on large Markdown files
- Enforce a selector-first access pattern via reminder hooks
- Support both Claude Code and OpenCode from a single skill definition
- Remain **stateless**, **thin**, and **mechanical**

### Non-Goals

- This project does **not** modify `mdsel`
- This project does **not** reinterpret document semantics
- This project does **not** cache state across sessions
- This project does **not** implement MCP tools (see `mdsel-mcp` for that approach)

---

## 2. Design Philosophy

### 2.1 Token Efficiency Over Always-On Access

The MCP approach injects full tool schemas into every conversation. The skill approach loads content only when the agent determines it's relevant.

| Approach | Inactive Cost | Active Cost |
|----------|---------------|-------------|
| MCP Server | ~1300 tokens | ~1300 tokens + output |
| Skill | ~50-100 tokens | Full skill + output |

### 2.2 Selector Discipline Is Mandatory

When working with Markdown files over the size threshold, agents must:

1. Select content directly with `mdsel <selector> <file>`
2. Use selectors like `h2.0`, `h1.0`, `h3.1` to target specific sections
3. Never read the entire file with `Read`

### 2.3 Cross-Platform Compatibility

The skill definition uses only common tools available in both Claude Code and OpenCode:

- `Bash` - For executing `mdsel` CLI commands
- `Read` - Referenced in reminders (what NOT to do)

No platform-specific tools (TodoWrite, Task, etc.) are used in the skill definition.

---

## 3. Dependency Model

### 3.1 Required: mdsel CLI

The `mdsel` CLI must be installed and available in PATH.

```bash
npm install -g mdsel
```

Or available via npx:

```bash
npx mdsel h2.0 README.md
npx mdsel h1.0 README.md
```

### 3.2 No MCP Server Required

This skill does NOT depend on `mdsel-mcp`. It calls the CLI directly via Bash.

---

## 4. Skill Definition

### 4.1 File Location

The skill is installed to a location recognized by both platforms:

```
.claude/skills/mdsel/SKILL.md
```

OpenCode explicitly recognizes `.claude/skills/`, so a single installation works for both.

### 4.2 Skill Structure

```
.claude/skills/mdsel/
└── SKILL.md
```

No additional scripts or resources are required. The skill is self-contained.

### 4.3 Skill Content Requirements

The SKILL.md file contains:

- YAML frontmatter with name, description, and allowed-tools
- Instructions for using mdsel
- Selector syntax reference
- Examples

---

## 5. Word Count Gating (Critical)

### 5.1 Environment Variable

A configurable environment variable controls when `mdsel` should be preferred over `Read`.

```
MDSEL_MIN_WORDS
```

#### Default Value

```
200
```

### 5.2 Gating Rules

When a Markdown file is accessed:

- If total word count **≤ MDSEL_MIN_WORDS**
  - The file may be read in full
  - `mdsel` may be bypassed
  - No reminder is issued

- If total word count **> MDSEL_MIN_WORDS**
  - Selector-based access is required
  - `Read` usage is considered incorrect
  - Reminder hook fires **every time**

Word count is:

- Mechanical
- Based on whitespace-delimited tokens
- Not semantic
- Not cached across sessions

---

## 6. Reminder Hook System (CORE DELIVERABLE)

### 6.1 Trigger Conditions

A reminder is injected when **all** of the following are true:

1. Agent invokes the `Read` tool
2. Target file is a Markdown file (`.md` extension)
3. File word count exceeds `MDSEL_MIN_WORDS`

### 6.2 Reminder Frequency

- Fires **every time**
- No suppression
- No "first warning only" behavior

Repetition is intentional and considered a feature.

### 6.3 Reminder Content (Normative)

Reminder messages must be:

- Short
- Neutral
- Identical every time
- Non-judgmental
- Non-negotiable in tone

Canonical wording:

```
This is a Markdown file over the configured size threshold.
Use `mdsel <selector> <file>` instead of Read.
```

No variation is allowed.

### 6.4 Hook Implementation: Claude Code

Claude Code hooks are shell commands configured in settings.

**Hook type**: PostToolUse (fires after a tool completes)

**Configuration location**: `~/.claude/settings.json` or project `.claude/settings.json`

**Hook logic** (executed by a script):

1. Check if tool name is `Read`
2. Check if file path ends in `.md`
3. Count words in the file (whitespace-delimited tokens)
4. If word count > `MDSEL_MIN_WORDS`, output the reminder to stdout
5. Exit 0 (do not block the tool)

**Hook output behavior**:

- Stdout from the hook is injected into the conversation as a reminder
- The hook must NOT block or fail the Read operation
- The hook must NOT modify the file or the Read result

### 6.5 Hook Implementation: OpenCode

OpenCode hooks are JavaScript/TypeScript plugins.

**Plugin location**: `.opencode/plugin/mdsel-reminder.ts`

**Hook type**: `tool.execute.after`

**Plugin structure**:

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const MdselReminder: Plugin = async ({ project }) => {
  return {
    "tool.execute.after": async ({ tool, args, result }) => {
      // Same logic as Claude Code hook
      // 1. Check tool name
      // 2. Check file extension
      // 3. Count words
      // 4. Return reminder if threshold exceeded
    }
  }
}
```

---

## 7. Deliverables

### 7.1 Skill Package

| File | Purpose |
|------|---------|
| `.claude/skills/mdsel/SKILL.md` | Skill definition (works for both platforms) |

### 7.2 Hook Scripts

| File | Platform | Purpose |
|------|----------|---------|
| `hooks/claude/mdsel-reminder.sh` | Claude Code | Shell hook script |
| `hooks/opencode/mdsel-reminder.ts` | OpenCode | TypeScript plugin |

### 7.3 Installation Script

A single installation script that:

1. Detects which platforms are available
2. Installs the skill to the appropriate location
3. Configures hooks for each detected platform
4. Verifies `mdsel` CLI is available

---

## 8. Success Criteria

1. **Token Reduction**: Baseline token count reduced from ~1300 to <100 when mdsel is not in use
2. **Cross-Platform**: Single skill definition works in both Claude Code and OpenCode
3. **Behavioral Conditioning**: Agents consistently use mdsel for large Markdown files after receiving reminders
4. **No Blocking**: Hooks never prevent the Read operation from completing
5. **Stateless**: No persistent state between sessions

---

## 9. Migration Path

Users of `mdsel-mcp` can migrate by:

1. Removing the MCP server from their configuration
2. Installing `mdsel-skill`
3. Configuring the reminder hooks

The skill provides equivalent functionality with significantly lower token overhead.
