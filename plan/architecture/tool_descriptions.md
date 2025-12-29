# Tool Descriptions: mdsel-claude

## Design Philosophy

Tool descriptions are **behavior-shaping infrastructure**. They must:
- Explicitly discourage Read tool usage on large Markdown files
- Include selector grammar reference
- Describe canonical usage sequence
- Avoid philosophy, justification, or marketing language

---

## Tool: mdsel_index

### Name
`mdsel_index`

### Description (Normative)

```
Return a selector inventory for one or more Markdown documents.

IMPORTANT: For Markdown files over 200 words, use this tool instead of Read.
Always call mdsel_index BEFORE mdsel_select to discover available selectors.

Usage:
1. Call mdsel_index with file paths to get document structure
2. Review available selectors (h1.0, h2.0, code.0, etc.)
3. Call mdsel_select with specific selectors

Selector notation in output:
- h1.0, h2.1, h3.0 = Headings (level.index, 0-based)
- code.N, para.N, list.N, table.N, quote.N = Blocks

Output includes:
- Document namespace (derived from filename)
- Heading hierarchy with word counts
- Block type counts (code, paragraph, list, table, blockquote)
```

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "files": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of Markdown file paths to index"
    }
  },
  "required": ["files"]
}
```

---

## Tool: mdsel_select

### Name
`mdsel_select`

### Description (Normative)

```
Retrieve specific content from Markdown documents using selectors.

IMPORTANT: For Markdown files over 200 words, use this tool instead of Read.
Always call mdsel_index first to discover available selectors.

Selector grammar:
- h1.0, h2.1, h3.0 = Heading at level.index (0-based)
- code.0, para.0, list.0, table.0, quote.0 = Block at index
- h2.0/code.0 = Nested: first code block under first h2
- readme::h2.0 = Namespaced: h2.0 in specific document
- h2.0-2 = Range: h2.0, h2.1, h2.2
- h2.0,2,4 = List: specific indices
- h2.0?head=10 = Query: first 10 lines

Examples:
- "h2.0" = First h2 section
- "h2.1/code.0" = First code block in second h2
- "readme::h1.0" = First h1 in readme document

Returns exact markdown content. No summarization or interpretation.
```

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "selector": {
      "type": "string",
      "description": "Selector string (e.g., 'h2.0', 'code.1', 'h2.0/para.0')"
    },
    "files": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of Markdown file paths to search"
    }
  },
  "required": ["selector", "files"]
}
```

---

## Reminder Message (Normative)

When the reminder hook fires (if implemented), this exact message must be used:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

**Constraints**:
- No variation allowed
- Short, neutral, identical every time
- Non-judgmental, non-negotiable tone

---

## Implementation Notes

### Word Count Threshold

The tool descriptions reference "200 words" as the threshold. This should be:
- Read from `MDSEL_MIN_WORDS` environment variable
- Default to 200 if not set
- Tool descriptions are static, so the 200 value is hardcoded in descriptions

### No Post-Processing

Both tools return mdsel output verbatim:
- No summarization
- No interpretation
- No transformation
- No error rewriting

### Canonical Usage Sequence

The descriptions enforce this pattern:
1. `mdsel_index` first (always)
2. Review selectors from index
3. `mdsel_select` with specific selectors

This is the behavioral conditioning the PRD requires.
