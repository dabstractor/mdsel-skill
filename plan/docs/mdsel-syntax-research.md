# mdsel CLI and Selector Syntax Research

## Overview
mdsel is a Declarative Markdown semantic selection CLI tool for LLM agents. It parses Markdown documents into semantic trees and exposes machine-addressable selectors for meaningful content chunks.

## 1. mdsel npm Package Documentation

### Package Information
- **Name**: mdsel
- **Version**: 0.1.1 (as of December 30, 2025)
- **Author**: dabstractor
- **License**: MIT
- **Repository**: https://github.com/dabstractor/mdsel.git
- **npm URL**: https://npm.im/mdsel
- **Keywords**: markdown, selector, cli, llm, ast, parser, semantic, content-selection, agent

### Requirements
- Node.js >= 18.0.0

### Related Package
- **mdsel-mcp**: MCP server for mdsel CLI - Model Context Protocol integration

## 2. Installation

### Global Installation
```bash
npm install -g mdsel
```

### Local Installation
```bash
npm install mdsel
```

## 3. CLI Usage

### Basic Commands
```bash
# Index a document to see its structure
mdsel README.md

# Select specific content by selector
mdsel README.md h2.1

# Drill into nested content
mdsel README.md "h2.1/code.0"

# Select multiple headings with comma syntax
mdsel README.md h2.0,2

# Select multiple selectors at once
mdsel README.md h2.0 h2.1 code.0

# Limit output to first 10 lines
mdsel README.md "h2.0?head=10"

# Limit output to last 5 lines
mdsel README.md "h2.0?tail=5"

# Use JSON output for programmatic consumption
mdsel --json README.md
```

## 4. Selector Syntax

### Syntax Pattern
```
[namespace::]type[index][/path][?query]
```

### Components
- **namespace** (optional): Document identifier, defaults to all documents
- **type**: Node type or shorthand
- **index** (optional): 0-based ordinal notation
- **path** (optional): Additional path segments for nested selection
- **query** (optional): Query parameters

### Index Notation Equivalents
| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 |
| Bracket | `h2[0]` | First h2 |
| Range | `h2.1-3` or `h2[1-3]` | h2.1, h2.2, h2.3 |
| Comma list | `h2.0,2,4` or `h2[0,2,4]` | h2.0, h2.2, h2.4 |
| No index | `h2` | All h2 headings |

### Node Types

| Category | Full Form | Shorthand |
|----------|-----------|-----------|
| Root | `root` | - |
| Headings | `heading:h1` ... `heading:h6` | `h1` ... `h6` |
| Sections | `section` | - |
| Blocks | `block:paragraph` | `para`, `paragraph` |
| | `block:code` | `code` |
| | `block:list` | `list` |
| | `block:table` | `table` |
| | `block:blockquote` | `quote`, `blockquote` |

## 5. Selector Examples

### Basic Selection
```bash
root                # Document root
h1.0                # First h1 heading
h2.1                # Second h2 heading
code.0              # First code block
para.2              # Third paragraph
```

### Full Form Equivalents
```bash
heading:h1[0]       # First h1 heading
block:code[0]       # First code block
```

### Namespace Selection
```bash
readme::root        # Root in specific document
docs::h2.0          # First h2 in docs
api::table.1        # Second table in api
```

### Path Composition
```bash
h2.1/code.0                    # First code block under second h2
section.0/list.1               # Second list in first section
docs::h2.0/section.0/code.0    # Nested path with namespace
```

### Range and List Selection
```bash
h2.0-2              # First three h2 headings
h2.1,3,5            # 2nd, 4th, and 6th h2 headings
code.0,2            # 1st and 3rd code blocks
```

### Query Parameters
```bash
h2.0?head=10        # First 10 lines of content
h2.0?tail=5         # Last 5 lines of content
section.2?head=20   # First 20 lines of section
```

### Cross-document Selection
```bash
h1.0                # First h1 from ALL documents
code.0              # First code block from ALL documents
```

## 6. Index Semantics

- Index is **0-based** (first item is index 0)
- Index counts among siblings of the same type
- Index is relative to parent context, not global
- No index means select **all** matches of that type

## 7. Output Format

### Default Text Output
- Compact format optimized for LLM token efficiency
- Prefixes with type for multiple results
- Error format: `!selector` followed by error message

### JSON Output
Use `--json` flag for structured output with schemas:

#### Index Response Schema
```typescript
interface IndexResponse {
  documents: DocumentIndex[];
  summary: {
    total_documents: number;
    total_nodes: number;
    total_selectors: number;
  };
}
```

#### Select Response Schema
```typescript
interface SelectResponse {
  matches: {
    selector: string;
    type: string;
    content: string;
    truncated: boolean;
    children_available: {
      selector: string;
      type: string;
      preview: string;
    }[];
  }[];
  unresolved: {
    selector: string;
    reason: string;
    suggestions: string[];
  }[];
}
```

## 8. Error Handling

### Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

### Error Types
| Type | Description |
|------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Markdown parsing failed |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Specified namespace does not exist |
| `PROCESSING_ERROR` | General processing error |

### Error Response Examples
**Text format**:
```
!h2.99
Index out of range: document has 3 h2 headings
~h2.0 ~h2.1 ~h2.2
```

**JSON format**:
```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:38:00.000Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "h2.99",
        "reason": "Index out of range: document has 3 h2 headings",
        "suggestions": ["h2.0", "h2.1", "h2.2"]
      }
    ]
  }
}
```

## 9. Practical Examples Tested

### Test File Structure
```
# Main Title (h1.0)
This is a paragraph of text.

## Section 1 (h2.0)
Some content in section 1.

### Subsection 1.1 (h3.0)
More detailed content.

## Section 2 (h2.1)
- List item 1
- List item 2
- List item 3

### Code Example (h3.1)
```javascript
console.log("Hello World");
```

> This is a quote.

[Link to example](https://example.com)
```

### Working Selector Examples
```bash
# Get first h1
$ mdsel test.md h1.0
# Main Title
This is a paragraph of text.

# Get first h2
$ mdsel test.md h2.0
## Section 1
Some content in section 1.

# Get second h2
$ mdsel test.md h2.1
## Section 2
* List item 1
* List item 2
* List item 3

# Get first code block
$ mdsel test.md code.0
```javascript
console.log("Hello World");
```

# Get first list
$ mdsel test.md list.0
* List item 1
* List item 2
* List item 3
```

## 10. GitHub Repository Information

- **Repository**: https://github.com/dabstractor/mdsel
- **Issues**: https://github.com/dabstractor/mdsel/issues
- **Homepage**: https://github.com/dabstractor/mdsel#readme
- **Development**:
  - Built with TypeScript
  - Uses unified remark ecosystem
  - Tests: vitest
  - Build: tsup

## 11. Key Features

1. **Semantic Selection**: Targets meaningful content chunks rather than raw text
2. **Deterministic Selectors**: Same input always produces same output
3. **Nested Path Support**: Can drill into document structure
4. **Query Parameters**: Support for limiting output size
5. **JSON Output**: Structured data for programmatic use
6. **Cross-document Selection**: Can select across multiple files
7. **Error Recovery**: Provides suggestions for invalid selectors
8. **GFM Support**: GitHub Flavored Markdown support via remark-gfm

## 12. Limitations

- Nested path syntax may not work as expected in all cases
- Indexing is relative to siblings of the same type only
- No support for complex queries or filtering beyond line limits
- Limited to the semantic structure provided by the Markdown parser

---

This research provides comprehensive documentation of mdsel's selector syntax and CLI usage patterns for integration with the PRP project.