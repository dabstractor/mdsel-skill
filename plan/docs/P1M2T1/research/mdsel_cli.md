# mdsel CLI Research

## Overview

**mdsel** is a Declarative Markdown semantic selection CLI for LLM agents. It parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk of content.

## Installation and Location

- **Installation Method**: npm global package
- **Location**: `/home/dustin/.local/bin/mdsel`
- **Version**: 1.0.0
- **Runtime**: Node.js >=18.0.0

## CLI Commands

### `index` Command

```bash
mdsel index <files...>
```

**Purpose**: Parse documents and emit selector inventory

**Arguments**:
- `files...`: One or more Markdown file paths to index

**Output**: JSON with all available selectors, headings, blocks, and word counts

**Example**:
```bash
mdsel index README.md docs/API.md
```

### `select` Command

```bash
mdsel select [options] <selector> [files...]
```

**Purpose**: Retrieve content via selectors

**Arguments**:
- `selector`: Declarative selector string
- `files...`: One or more Markdown file paths to search

**Options**:
- `--full`: Bypass truncation and return full content

**Example**:
```bash
mdsel select "readme::heading:h2[0]" README.md
mdsel select "section[0]?full=true" README.md --full
```

### `format` Command

```bash
mdsel format [command]
```

**Purpose**: Output format specification for tool descriptions

**Options**:
- `--example`: Show example output instead of terse spec

## JSON Output Format

### Response Envelope

All mdsel responses follow this structure:

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;        // ISO 8601 format
  data: T | null;
  errors?: ErrorEntry[];
}
```

### Index Response Structure

```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-12-28T00:10:24.645Z",
  "data": {
    "documents": [
      {
        "namespace": "readme",
        "file_path": "README.md",
        "headings": [
          {
            "selector": "readme::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "mdsel",
            "content_preview": "mdsel",
            "truncated": false,
            "children_count": 71,
            "word_count": 1,
            "section_word_count": 1,
            "section_truncated": false
          }
        ],
        "blocks": {
          "paragraphs": 23,
          "code_blocks": 19,
          "lists": 5,
          "tables": 3,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 72,
      "total_selectors": 72
    }
  }
}
```

### Select Response Structure

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-12-28T00:10:30.065Z",
  "data": {
    "matches": [
      {
        "selector": "readme::heading:h1.0",
        "type": "section",
        "content": "# mdsel\n\nDeclarative Markdown semantic selection CLI...",
        "truncated": false,
        "children_available": [
          {
            "selector": "h1[0]",
            "type": "heading",
            "preview": "mdsel"
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-12-28T00:11:40.377Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "readme::heading:h2.99",
        "reason": "Index 99 out of range (only 8 heading:h2(s) found)",
        "suggestions": [
          "readme::heading:h2[0]",
          "readme::heading:h2[1]",
          "readme::heading:h2[2]"
        ]
      }
    ]
  }
}
```

## Selector Grammar

```
[namespace::]type[index][/path]?query
```

### Components

- **namespace** (optional): Document identifier (defaults to filename without extension)
- **type**: Node type
- **index** (optional): 0-based ordinal among siblings
- **path** (optional): Additional path segments for nested selection
- **query** (optional): Query parameters (e.g., `?full=true`)

### Node Types

| Type | Description | Example |
|------|-------------|---------|
| `root` | Document root | `root` |
| `heading:h1` | Level 1 heading | `heading:h1[0]` |
| `heading:h2` | Level 2 heading | `heading:h2[1]` |
| `heading:h3` | Level 3 heading | `heading:h3[0]` |
| `heading:h4` | Level 4 heading | `heading:h4[0]` |
| `heading:h5` | Level 5 heading | `heading:h5[0]` |
| `heading:h6` | Level 6 heading | `heading:h6[0]` |
| `section` | Document section | `section[0]` |
| `block:paragraph` | Paragraph block | `block:paragraph[0]` |
| `block:list` | List block | `block:list[0]` |
| `block:code` | Code block | `block:code[0]` |
| `block:table` | Table block | `block:table[0]` |
| `block:blockquote` | Blockquote block | `block:blockquote[0]` |

### Selector Examples

```bash
# First h1 in readme namespace
readme::heading:h1[0]

# Second h2 globally
heading:h2[1]

# First code block under second h2
heading:h2[1]/block:code[0]

# Full content, bypass truncation
section[0]?full=true

# Nested selection
readme::heading:h1[0]/block:code[0]
```

## Error Types

| Type | Description |
|------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Markdown parsing failed |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Specified namespace does not exist |
| `PROCESSING_ERROR` | General processing error |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

## Critical Implementation Notes

### Always Use `--json` Flag

All mdsel commands should include the `--json` flag to ensure structured output:

```bash
# CORRECT
mdsel index README.md --json
mdsel select "heading:h1[0]" README.md --json

# WRONG (returns plain text)
mdsel index README.md
```

### Verbatim Passthrough Requirement

Per PRD section 8, mdsel output must be returned **verbatim**:
- No JSON parsing or transformation
- No error message rewriting
- No adding explanations or suggestions

### CLI Location

The mdsel CLI is installed at:
```
/home/dustin/.local/bin/mdsel
```

This path should be used directly in subprocess execution (no need for PATH resolution).

## References

- **Local Installation**: `/home/dustin/.local/lib/node_modules/mdsel/`
- **README**: `/home/dustin/.local/lib/node_modules/mdsel/README.md`
- **Architecture Docs**: `/home/dustin/projects/mdsel-claude-glm/plan/docs/architecture/external_deps.md`
