# OpenCode Plugin System

## Overview

OpenCode plugins are TypeScript/JavaScript modules that extend agent functionality. They support hooks, custom tools, and event handling.

## Plugin Structure

### Basic Plugin Template

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async (ctx) => {
  return {
    'tool.execute.after': async (meta, { output }) => {
      // Post-execution logic
    }
  }
}
```

### Plugin Context

```typescript
{
  project: ProjectInfo,       // Current project
  directory: string,          // Working directory
  worktree: string,           // Git worktree path
  client: OpenCodeClient,     // AI interaction client
  $: BunShellAPI              // Shell execution
}
```

## Plugin Locations

```
.opencode/plugin/plugin-name.ts     # Project-level
~/.config/opencode/plugin/          # Global-level
```

## Skill Compatibility

### Critical Finding: OpenCode Supports `.claude/skills/`

OpenCode explicitly discovers skills from:
- `.opencode/skill/<name>/SKILL.md` (native)
- `.claude/skills/<name>/SKILL.md` (Claude Code compatible)

**Implication**: Single SKILL.md at `.claude/skills/mdsel/SKILL.md` works for both platforms.

## tool.execute.after Hook

### Signature

```typescript
'tool.execute.after': async (
  { tool, sessionID, callID },
  { title, output, metadata }
) => {
  // Called after tool completes
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tool` | string | Tool name (e.g., "Read") |
| `sessionID` | string | Session identifier |
| `callID` | string | Unique call ID |
| `output` | string | Tool output |
| `metadata` | object | Additional metadata |

### Known Limitation

**MCP Tool Calls**: `tool.execute.before` and `tool.execute.after` do NOT trigger for MCP tools. This is fine for mdsel-skill since we're hooking the native `Read` tool.

## mdsel-reminder Plugin Implementation

### File: `.opencode/plugin/mdsel-reminder.ts`

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from 'fs'

const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length
}

export const MdselReminder: Plugin = async ({ $ }) => {
  return {
    'tool.execute.after': async ({ tool }, { output }) => {
      // Only hook Read tool
      if (tool !== 'Read') return

      // Extract file path from context (implementation depends on args access)
      // Note: May need to parse output or use alternative approach

      const filePath = /* extract from args or context */

      // Check if Markdown
      if (!filePath?.endsWith('.md')) return

      // Check if file exists and count words
      if (!existsSync(filePath)) return

      const content = readFileSync(filePath, 'utf-8')
      const wordCount = countWords(content)

      if (wordCount > MDSEL_MIN_WORDS) {
        console.log('This is a Markdown file over the configured size threshold.')
        console.log('Use `mdsel index` and `mdsel select` instead of Read.')
      }
    }
  }
}
```

### Dependencies

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

## Configuration

### opencode.json Plugin Loading

```json
{
  "plugin": [
    "file://.opencode/plugin/mdsel-reminder.ts"
  ]
}
```

## Implementation Considerations

1. **Argument Access**: The `tool.execute.after` hook may not directly receive tool arguments. Research indicates `tool.execute.before` can modify args, but `tool.execute.after` receives `{ title, output, metadata }`.

2. **Alternative Approach**: Parse the tool output to determine if it was a Markdown file, or maintain session state from `tool.execute.before`.

3. **Console Output**: `console.log` in plugins is visible but may not directly inject into Claude's context. May need to use return values or plugin-specific output mechanisms.
