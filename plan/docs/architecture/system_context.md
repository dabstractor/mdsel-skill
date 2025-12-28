# System Context: mdsel-claude

## Project Overview

**mdsel-claude** is a Claude Code integration layer that exposes the `mdsel` CLI tool as MCP (Model Context Protocol) tools, while enforcing behavioral conditioning to prefer selector-based access over full-file reads for large Markdown documents.

## Architecture Type: Thin Adapter / Behavioral Wrapper

This is NOT a capabilities project - it's a behavioral conditioning layer:

- No Markdown parsing (delegated to `mdsel`)
- No selector validation (delegated to `mdsel`)
- No caching (stateless)
- No state persistence

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Claude Code Agent                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Tool Invocations                         │   │
│  │  • mdsel_index(files)                                     │   │
│  │  • mdsel_select(selector, files)                          │   │
│  │  • Read(file_path)  ← triggers reminder hook              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     mdsel-claude (MCP Server)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ mdsel_index  │  │ mdsel_select │  │  PreToolUse Hook     │   │
│  │   handler    │  │   handler    │  │  (Read interceptor)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         ▼                 ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   mdsel CLI subprocess                   │    │
│  │   • mdsel index <files...> --json                       │    │
│  │   • mdsel select <selector> <files...> --json           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                Word Count Gating Logic                   │    │
│  │   • Read file → count whitespace-delimited tokens        │    │
│  │   • Compare against MDSEL_MIN_WORDS (default: 200)       │    │
│  │   • If exceeded → inject reminder via hook               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        mdsel CLI Tool                            │
│  • Location: /home/dustin/.local/bin/mdsel                      │
│  • Package: mdsel (npm, node >=18.0.0)                          │
│  • Commands: index, select, format                               │
│  • Output: JSON (always)                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. MCP Server Registration

The project will be registered in Claude Code configuration:

```json
{
  "mcpServers": {
    "mdsel": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mdsel-claude/dist/index.js"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```

### 2. Claude Code Hooks (PreToolUse)

A hook will intercept `Read` tool invocations for .md files:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/mdsel-claude/dist/read-hook.js"
          }
        ]
      }
    ]
  }
}
```

### 3. Tool Exposure

Tools will be exposed as:

- `mcp__mdsel__mdsel_index`
- `mcp__mdsel__mdsel_select`

## External Dependencies

| Dependency  | Type     | Purpose                      | Location                        |
| ----------- | -------- | ---------------------------- | ------------------------------- |
| `mdsel`     | CLI Tool | Markdown parsing & selection | `/home/dustin/.local/bin/mdsel` |
| Claude Code | Platform | Agent runtime                | System                          |
| Node.js     | Runtime  | MCP server execution         | System (>=18.0.0)               |

## Configuration

### Environment Variables

| Variable          | Default | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| `MDSEL_MIN_WORDS` | `200`   | Word count threshold for requiring selector access |

### Word Count Algorithm

```javascript
// Mechanical, whitespace-delimited token counting
function countWords(content) {
  return content.split(/\s+/).filter((token) => token.length > 0).length;
}
```

## Constraints

1. **No Markdown Parsing**: All parsing delegated to `mdsel`
2. **No Selector Validation**: Selectors passed directly to `mdsel`
3. **No Caching**: Each invocation is independent
4. **No State**: Stateless between calls
5. **Verbatim Error Passthrough**: Errors from `mdsel` returned unchanged
6. **No Post-Processing**: JSON output from `mdsel` returned as-is
