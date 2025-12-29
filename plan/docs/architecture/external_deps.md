# External Dependencies: mdsel-claude

## Primary Dependency: mdsel

### Installation Requirement

`mdsel` must be available in the system PATH for mdsel-claude to function.

**Installation**:
```bash
npm install -g mdsel
```

### CLI Interface Reference

#### mdsel index

**Invocation**:
```bash
mdsel index <files...> --json
```

**Arguments**:
- `<files...>`: One or more Markdown file paths

**JSON Output Structure** (`CLIResponse<IndexData>`):
```typescript
interface CLIResponse<T> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601
  data: T | null;
  partial_results?: unknown[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

interface IndexData {
  documents: DocumentIndex[];
  summary: IndexSummary;
}

interface DocumentIndex {
  namespace: string;          // Derived from filename
  file_path: string;
  root: NodeDescriptor | null;
  headings: HeadingDescriptor[];
  blocks: BlockSummary;
}

interface HeadingDescriptor {
  selector: string;           // e.g., "h2.0"
  type: string;               // "heading"
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
  section_word_count: number;
  section_truncated: boolean;
}

interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}
```

#### mdsel select

**Invocation**:
```bash
mdsel select <selector> <files...> --json
```

**Arguments**:
- `<selector>`: Selector string (see grammar below)
- `<files...>`: One or more Markdown file paths

**JSON Output Structure** (`CLIResponse<SelectData>`):
```typescript
interface SelectData {
  matches: SelectMatch[];
  unresolved: string[];
}

interface SelectMatch {
  selector: string;
  type: string;
  content: string;              // Full markdown content
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];
}

interface ChildInfo {
  selector: string;
  type: string;
  preview: string;
}
```

### Selector Grammar Reference

**Grammar**:
```
selector     ::= [namespace "::"] path_list [query_params]
path_list    ::= path_segment ("/" path_segment)*
path_segment ::= node_type [index]
node_type    ::= "root" | "heading:h1-6" | "section" | "block:type" | shorthand
shorthand    ::= h1|h2|h3|h4|h5|h6|code|para|list|table|quote
index        ::= "." number | "[" number "]" | "." number "-" number | "." number ("," number)*
query_params ::= "?" param ("&" param)*
param        ::= key "=" value
```

**Examples**:
- `h2.0` - First h2 heading
- `h2.1/code.0` - First code block under second h2
- `readme::h1.0` - First h1 in document with namespace "readme"
- `h2.0?head=10` - First 10 lines of first h2

### Error Response Structure

```typescript
interface ErrorEntry {
  type: ErrorType;
  code: string;
  message: string;
  file?: string;
  selector?: string;
  suggestions?: string[];
}

type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';
```

### Exit Codes

- `0`: Success (all operations completed)
- `1`: Error (partial/complete failure)
- `2`: Usage error (invalid arguments)

---

## MCP SDK Dependency

### Package

```json
{
  "@modelcontextprotocol/sdk": "latest"
}
```

### Key Imports

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

### Server Initialization Pattern

```typescript
const server = new Server(
  {
    name: 'mdsel-claude',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [/* tool definitions */] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle tool calls
});

// Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Tool Definition Format

```typescript
{
  name: "tool_name",
  description: "Tool description for Claude",
  inputSchema: {
    type: "object",
    properties: {
      param1: { type: "string", description: "..." },
    },
    required: ["param1"]
  }
}
```

### Tool Response Format

```typescript
{
  content: [
    {
      type: "text",
      text: "Response text or JSON string"
    }
  ],
  isError: false  // or true for errors
}
```

---

## Development Dependencies

### Build Tooling

```json
{
  "typescript": "^5.0.0",
  "tsup": "^8.0.0"
}
```

### Testing

```json
{
  "vitest": "^2.0.0"
}
```

### Type Definitions

```json
{
  "@types/node": "^20.0.0"
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MDSEL_MIN_WORDS` | `200` | Word count threshold for selector-based access |

---

## Claude Code Configuration

**File**: `~/.claude.json` or project-local `.claude.json`

**Configuration Entry**:
```json
{
  "mcpServers": {
    "mdsel": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mdsel-claude/dist/server.mjs"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```
