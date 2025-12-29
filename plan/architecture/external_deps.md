# External Dependencies: mdsel-claude

## Primary Dependency: mdsel

### Package Information
| Property | Value |
|----------|-------|
| Package | `mdsel` |
| Version | 1.0.0 |
| Registry | npm |
| License | MIT |
| Runtime | Node.js >= 18.0.0 |

### Installation
```bash
# Peer dependency (user must install)
npm install -g mdsel

# Or via npx (no global install)
npx mdsel <command>
```

### CLI Interface

#### Command: `mdsel index`
```bash
mdsel index <files...>
mdsel index <files...> --json
```

**Output (JSON mode)**:
```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "documents": [{
      "namespace": "readme",
      "file_path": "README.md",
      "headings": [{
        "selector": "readme::heading:h1[0]",
        "type": "heading:h1",
        "depth": 1,
        "text": "Title",
        "content_preview": "Title",
        "truncated": false,
        "children_count": 10,
        "word_count": 1,
        "section_word_count": 500
      }],
      "blocks": {
        "paragraphs": 30,
        "code_blocks": 24,
        "lists": 5,
        "tables": 4,
        "blockquotes": 0
      }
    }],
    "summary": {
      "total_documents": 1,
      "total_nodes": 86,
      "total_selectors": 86
    }
  }
}
```

#### Command: `mdsel select`
```bash
mdsel select <selector> [files...]
mdsel select <selector> [files...] --json
mdsel select <selector> [files...] --full
```

**Output (JSON mode)**:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:38:00.000Z",
  "data": {
    "matches": [{
      "selector": "readme::heading:h2[0]",
      "type": "heading:h2",
      "content": "## Installation\n\nContent here...",
      "truncated": false,
      "children_available": [{
        "selector": "/code[0]",
        "type": "block:code",
        "preview": "npm install"
      }]
    }],
    "unresolved": []
  }
}
```

**Error Output**:
```json
{
  "success": false,
  "command": "select",
  "data": {
    "matches": [],
    "unresolved": [{
      "selector": "h2.99",
      "reason": "Index out of range",
      "suggestions": ["h2.0", "h2.1", "h2.2"]
    }]
  }
}
```

### Selector Grammar

#### Type Shorthands
| Full Form | Shorthand |
|-----------|-----------|
| `heading:h1` - `heading:h6` | `h1` - `h6` |
| `block:paragraph` | `para`, `paragraph` |
| `block:code` | `code` |
| `block:list` | `list` |
| `block:table` | `table` |
| `block:blockquote` | `quote`, `blockquote` |

#### Index Notation
| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 |
| Bracket | `h2[0]` | First h2 |
| Range | `h2.1-3` | h2 indices 1,2,3 |
| Comma list | `h2.0,2,4` | Specific indices |
| No index | `h2` | All h2 headings |

#### Full Syntax
```
[namespace::]type[index][/path][?query]

Examples:
  h2.0                    # First h2 heading
  readme::h2.0            # First h2 in readme namespace
  h2.0/code.0             # First code block under first h2
  h2.0?full=true          # Full content, no truncation
```

---

## MCP SDK Dependency

### Package Information
| Property | Value |
|----------|-------|
| Package | `@modelcontextprotocol/sdk` |
| Registry | npm |
| Purpose | MCP server implementation |

### Key Imports
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### Server Pattern
```typescript
const server = new McpServer({
  name: "mdsel-claude",
  version: "1.0.0"
});

server.tool("tool_name", zodSchema, handler);

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Runtime Validation: Zod

### Package Information
| Property | Value |
|----------|-------|
| Package | `zod` |
| Registry | npm |
| Purpose | Runtime input validation |

### Usage Pattern
```typescript
import { z } from "zod";

const IndexSchema = z.object({
  files: z.array(z.string()).min(1)
});

const SelectSchema = z.object({
  selector: z.string().min(1),
  files: z.array(z.string()).min(1)
});
```

---

## Development Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `tsup` | ESM bundling |
| `vitest` | Test runner |
| `@types/node` | Node.js type definitions |

---

## Claude Code Hook Integration

### Hook Location
```
~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

### Hook Behavior
- Fires on every `Read` tool invocation
- Checks if target is Markdown file
- Computes word count
- Returns reminder if threshold exceeded

### Hook Response Format
```json
{
  "decision": "approve",
  "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."
}
```

---

## Configuration Files

### Claude Desktop / VS Code
```json
// ~/.claude.json or .mcp.json
{
  "mcpServers": {
    "mdsel-claude": {
      "type": "stdio",
      "command": "npx",
      "args": ["mdsel-claude"]
    }
  }
}
```

### Environment Variables
```bash
MDSEL_MIN_WORDS=200  # Word count threshold (default: 200)
```
