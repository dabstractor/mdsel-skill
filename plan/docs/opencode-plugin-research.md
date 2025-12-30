# OpenCode Plugin System Research

## Executive Summary

This document provides comprehensive research on the OpenCode plugin system, focusing on implementing a reminder plugin that encourages agents to use `mdsel` instead of `Read` for large Markdown files. The research covers plugin architecture, hook systems, configuration, and implementation details critical for the mdsel-reminder plugin.

## 1. OpenCode Plugin Overview

### 1.1 What is OpenCode?

OpenCode is an AI agent platform that supports TypeScript/JavaScript plugins to extend functionality. Key features include:
- Plugin-based architecture with hooks and custom tools
- Compatibility with Claude Code's `.claude/skills/` directory structure
- TypeScript-based plugin development
- Event-driven hook system for tool execution

### 1.2 Plugin Architecture

OpenCode plugins are TypeScript modules that follow this structure:

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

## 2. Plugin System Documentation

### 2.1 Plugin Type Definition

Based on the research, the `Plugin` type is imported from `@opencode-ai/plugin`:

```typescript
import type { Plugin } from "@opencode-ai/plugin"
```

### 2.2 Plugin Context

The plugin receives a context object with the following properties:

```typescript
{
  project: ProjectInfo,       // Current project information
  directory: string,          // Working directory path
  worktree: string,           // Git worktree path
  client: OpenCodeClient,     // AI interaction client
  $: BunShellAPI              // Shell execution API
}
```

### 2.3 Plugin Locations

OpenCode discovers plugins in two locations:
- **Project-level**: `.opencode/plugin/plugin-name.ts`
- **Global-level**: `~/.config/opencode/plugin/`

## 3. Hook System: tool.execute.after

### 3.1 Hook Signature

The `tool.execute.after` hook has this exact signature:

```typescript
'tool.execute.after': async (
  { tool, sessionID, callID },
  { title, output, metadata }
) => {
  // Called after tool completes
}
```

### 3.2 Parameters

#### First Parameter (Meta Information)
| Parameter | Type | Description |
|-----------|------|-------------|
| `tool` | string | Tool name (e.g., "Read") |
| `sessionID` | string | Session identifier |
| `callID` | string | Unique call identifier |

#### Second Parameter (Tool Results)
| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Tool title/name |
| `output` | string | Tool output/result |
| `metadata` | object | Additional metadata |

### 3.3 Return Values

The hook does not return any values to modify the conversation context directly. Output must be handled through other mechanisms (console.log, client APIs, etc.).

### 3.4 Critical Limitation

**MCP Tool Calls**: The `tool.execute.before` and `tool.execute.after` hooks do NOT trigger for MCP (Model Context Protocol) tools. This is acceptable for the mdsel-reminder plugin since it hooks the native `Read` tool.

## 4. Tool Arguments (args) Access

### 4.1 Current Implementation Understanding

Based on the research, there appears to be a discrepancy in how tool arguments are accessed:

- **Hook Signature Definition**: Shows `args` parameter
- **Documentation Example**: Shows only `{ title, output, metadata }`

The most reliable approach is to parse the tool output to determine what was read, or maintain state from `tool.execute.before`.

### 4.2 Recommended Approach

For the mdsel-reminder plugin, extract the file path from the tool output or use context tracking:

```typescript
'tool.execute.after': async ({ tool }, { output }) => {
  // Only hook Read tool
  if (tool !== 'Read') return

  // Alternative approaches for file path:
  // 1. Parse output content for file references
  // 2. Use session state from before hook
  // 3. Look for patterns in output

  const filePath = extractFilePath(output) || getSessionState()

  // Rest of implementation...
}
```

## 5. Output Injection into Agent Context

### 5.1 Console Output

The simplest method is using `console.log()`, which is visible in the OpenCode environment but may not directly inject into Claude's context:

```typescript
'tool.execute.after': async ({ tool }, { output }) => {
  if (shouldShowReminder()) {
    console.log('This is a Markdown file over the configured size threshold.')
    console.log('Use `mdsel index` and `mdsel select` instead of Read.')
  }
}
```

### 5.2 Client API Methods

For direct context injection, use the OpenCode client API:

```typescript
'tool.execute.after': async ({ tool, sessionID }, { output }) => {
  if (shouldShowReminder()) {
    // Potentially use client methods to inject context
    // This requires further research into the exact API
  }
}
```

### 5.3 Return Values

Since the hook doesn't return values to the conversation, other output methods must be used.

## 6. Plugin Configuration

### 6.1 opencode.json Structure

The configuration file loads plugins with this structure:

```json
{
  "plugin": [
    "file://.opencode/plugin/mdsel-reminder.ts"
  ]
}
```

### 6.2 File URI Format

Plugins are referenced using file URIs:
- `file://./path/to/plugin.ts` (relative)
- `file:///absolute/path/to/plugin.ts` (absolute)

### 6.3 Dependencies

Plugin projects require these dependencies:

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

## 7. mdsel-reminder Plugin Implementation

### 7.1 Complete Plugin Code

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from 'fs'

const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length
}

function extractFilePathFromOutput(output: string): string | null {
  // Attempt to extract file path from tool output
  // This is a heuristic and may need refinement
  const pathMatch = output.match(/(?:Read|Reading):\s*(.+?)(?:\n|$)/i)
  return pathMatch ? pathMatch[1] : null
}

export const MdselReminder: Plugin = async ({ $ }) => {
  return {
    'tool.execute.after': async ({ tool }, { output }) => {
      // Only hook Read tool
      if (tool !== 'Read') return

      // Extract file path from output
      const filePath = extractFilePathFromOutput(output)

      // Early exit if no file path or not Markdown
      if (!filePath || !filePath.endsWith('.md')) return

      // Check if file exists and count words
      if (!existsSync(filePath)) return

      try {
        const content = readFileSync(filePath, 'utf-8')
        const wordCount = countWords(content)

        if (wordCount > MDSEL_MIN_WORDS) {
          console.log('This is a Markdown file over the configured size threshold.')
          console.log('Use `mdsel index` and `mdsel select` instead of Read.')
        }
      } catch (error) {
        // Silently handle read errors
        console.error('Error reading file for word count:', error)
      }
    }
  }
}
```

### 7.2 File Location

Place the plugin at:
```
.opencode/plugin/mdsel-reminder.ts
```

### 7.3 Environment Variables

The plugin supports the `MDSEL_MIN_WORDS` environment variable:
- Default: 200 words
- Customizable per project or user environment

## 8. Best Practices

### 8.1 Error Handling

- Always wrap file operations in try-catch blocks
- Gracefully handle missing dependencies
- Exit silently on errors rather than breaking execution

### 8.2 Performance Considerations

- Minimize file I/O operations
- Cache word counts when possible
- Use early exits to skip unnecessary processing

### 8.3 Debugging

- Add debug logging with `console.log()`
- Validate file paths before operations
- Test with various file sizes and types

### 8.4 Compatibility

- Design to work with both Claude Code and OpenCode
- Use cross-platform file operations
- Handle different line endings and encodings

## 9. Known Issues and Limitations

### 9.1 Hook Limitations

- MCP tool calls are not supported
- No direct access to tool arguments in after hook
- Limited context injection methods

### 9.2 File Path Extraction

Extracting file paths from tool output is heuristic-based:
- May not work with all tool output formats
- Could break with future tool changes
- Alternative: Use `tool.execute.before` to track state

### 9.3 Word Count Accuracy

- Different implementations may count words differently
- Consider markdown-specific tokenization for accuracy
- Current implementation uses simple whitespace splitting

## 10. Testing and Validation

### 10.1 Test Scenarios

1. **Small Markdown files** (< 200 words) - should not trigger reminder
2. **Large Markdown files** (> 200 words) - should trigger reminder
3. **Non-Markdown files** - should not trigger reminder
4. **Missing files** - should handle gracefully
5. **Different file encodings** - should handle properly

### 10.2 Test Commands

```bash
# Test with TypeScript compiler
tsc --noEmit .opencode/plugin/mdsel-reminder.ts

# Run plugin in OpenCode environment (requires setup)
# Test with various file sizes and types
```

## 11. Alternative Approaches

### 11.1 tool.execute.before Hook

For better argument access, consider using `tool.execute.before`:

```typescript
'tool.execute.before': async ({ tool, args }, context) => {
  if (tool === 'Read' && args.file_path?.endsWith('.md')) {
    // Store state for after hook
    setSessionState({ filePath: args.file_path })
  }
}
```

### 11.2 Combined Hook Strategy

Use both hooks for comprehensive functionality:
- `before`: Track file reads and validate arguments
- `after`: Process results and show reminders

## 12. Resources and References

### 12.1 Official Documentation

- OpenCode Plugin System: [Research needed - web search unavailable]
- @opencode-ai/plugin package: [Research needed - web search unavailable]

### 12.2 Related Project Files

- `/plan/docs/opencode_plugins.md` - Initial plugin documentation
- `/plan/docs/HOOK_CONFIGURATION.md` - Claude Code hook configuration
- `/hooks/claude/mdsel-reminder.sh` - Bash hook implementation for reference
- `/PRD.md` - Product requirements with OpenCode specifications

### 12.3 GitHub Repositories to Research

When web search becomes available, search for:
- `opencode-ai/plugin` - Official plugin package
- `opencode-ai/opencode` - Main OpenCode repository
- Search for `plugin examples` in OpenCode repositories
- Look for `tool.execute.after` implementations

## 13. Next Steps

1. **Validate Hook Signature**: Confirm the exact parameters and return values
2. **Test File Path Extraction**: Verify the heuristic works with actual tool output
3. **Implement Debug Mode**: Add verbose logging for troubleshooting
4. **Cross-Platform Testing**: Ensure compatibility across different environments
5. **Performance Testing**: Validate with large files and concurrent operations

---

*Research compiled from project documentation and existing implementations*
*Date: 2025-12-30*
*Status: Initial research - needs validation with actual OpenCode environment*