# External Dependencies: mdsel-claude

## Primary Dependency: mdsel

### Installation Status

- **Installed**: Yes
- **Location**: `/home/dustin/.local/bin/mdsel`
- **Version**: 1.0.0
- **Runtime**: Node.js >=18.0.0

### CLI Interface

```bash
# Main commands
mdsel index <files...>                    # Parse documents, emit selector inventory
mdsel select <selector> [files...] --full # Retrieve content via selectors
mdsel format [command]                    # Output format specification
```

### Selector Grammar

```
[namespace::]type[index][/path]?query

Types:
- root                           # Document root
- heading:h1..h6                # Heading levels
- section                        # Document sections
- block:paragraph               # Paragraph blocks
- block:list                    # List blocks
- block:code                    # Code blocks
- block:table                   # Table blocks
- block:blockquote             # Blockquote blocks

Examples:
- readme::heading:h1[0]         # First h1 in readme
- heading:h2[1]                 # Second h2 globally
- heading:h2[1]/block:code[0]   # First code block under second h2
- section[0]?full=true          # Full content, bypass truncation
```

### JSON Output Format

#### Index Response

```json
{
  "success": true,
  "command": "index",
  "timestamp": "ISO8601",
  "data": {
    "documents": [
      {
        "namespace": "filename",
        "file_path": "/path/to/file.md",
        "headings": [
          {
            "selector": "namespace::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Title",
            "word_count": 1,
            "section_word_count": 100
          }
        ],
        "blocks": {
          "paragraphs": 5,
          "code_blocks": 2,
          "lists": 1,
          "tables": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 10,
      "total_selectors": 10
    }
  }
}
```

#### Select Response

```json
{
  "success": true,
  "command": "select",
  "timestamp": "ISO8601",
  "data": {
    "matches": [
      {
        "selector": "heading:h2[0]",
        "type": "section",
        "content": "## Heading\n\nContent here...",
        "truncated": false,
        "children_available": [
          {
            "selector": "h2[0]",
            "type": "heading",
            "preview": "Heading text"
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

#### Error Response

```json
{
  "success": false,
  "command": "select",
  "timestamp": "ISO8601",
  "data": null,
  "errors": [
    {
      "type": "INVALID_SELECTOR",
      "code": "INVALID_SYNTAX",
      "message": "Invalid character '#' in selector",
      "selector": "## Invalid"
    }
  ]
}
```

### Error Types

| Type                  | Description                        |
| --------------------- | ---------------------------------- |
| `FILE_NOT_FOUND`      | Specified file does not exist      |
| `PARSE_ERROR`         | Markdown parsing failed            |
| `INVALID_SELECTOR`    | Selector syntax is invalid         |
| `SELECTOR_NOT_FOUND`  | Selector does not match any nodes  |
| `NAMESPACE_NOT_FOUND` | Specified namespace does not exist |
| `PROCESSING_ERROR`    | General processing error           |

## Claude Code Platform

### MCP Server Requirements

```typescript
// Tool Definition Schema
interface ToolDefinition {
  name: string; // Unique identifier
  title?: string; // Human-readable name
  description: string; // Behavioral guidance
  inputSchema: {
    type: 'object';
    properties: Record<string, PropertySchema>;
    required?: string[];
  };
}
```

### Hook System

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "ToolName",
        "hooks": [
          {
            "type": "command",
            "command": "shell-command"
          }
        ]
      }
    ]
  }
}
```

#### Hook Input (stdin JSON)

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/file.md"
  }
}
```

#### Hook Output (stdout JSON)

```json
{
  "continue": true,
  "systemMessage": "Optional message to Claude"
}
```

#### Exit Codes

- `0`: Success, continue
- `1`: Error, show to user
- `2`: Block the action

## Development Dependencies

### Required for Implementation

```json
{
  "devDependencies": {
    "@types/node": "^22.x",
    "typescript": "^5.x",
    "tsup": "^8.x",
    "vitest": "^2.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest"
  }
}
```

### Build Configuration

```javascript
// tsup.config.ts
export default {
  entry: ['src/index.ts', 'src/read-hook.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
};
```

## Project Structure (Recommended)

```
mdsel-claude/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── tools/
│   │   ├── mdsel-index.ts # mdsel_index tool handler
│   │   └── mdsel-select.ts# mdsel_select tool handler
│   ├── hooks/
│   │   └── read-hook.ts   # PreToolUse hook for Read
│   ├── lib/
│   │   ├── mdsel-cli.ts   # mdsel CLI wrapper
│   │   └── word-count.ts  # Word counting utility
│   └── types.ts           # TypeScript interfaces
├── tests/
│   ├── tools/
│   ├── hooks/
│   └── lib/
├── dist/                  # Built output
├── package.json
├── tsconfig.json
└── README.md
```
