# Tool Definitions: mdsel-claude

## Tool Surface (Exactly 2 Tools)

Per PRD Section 4: "Exactly **two tools** are exposed to Claude Code. No more. No fewer."

---

## Tool 1: mdsel_index

### Purpose

Return a selector inventory for one or more Markdown documents.

### MCP Tool Definition

```json
{
  "name": "mdsel_index",
  "title": "Markdown Selector Index",
  "description": "Index Markdown documents to discover available selectors. REQUIRED: Call this BEFORE mdsel_select when working with Markdown documents over 200 words. Do NOT use the Read tool for large Markdown files - use mdsel_index first to understand the document structure, then mdsel_select to retrieve specific sections.\n\nReturns: JSON with selector inventory including headings, blocks (paragraphs, code, lists, tables), and word counts for each section.\n\nSelector Grammar:\n- namespace::type[index]/path?query\n- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table\n- Example: readme::heading:h2[0]/block:code[0]",
  "inputSchema": {
    "type": "object",
    "properties": {
      "files": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Array of absolute file paths to Markdown documents to index"
      }
    },
    "required": ["files"]
  }
}
```

### Handler Implementation

```typescript
async function handleMdselIndex(args: { files: string[] }): Promise<ToolResult> {
  const result = await execMdsel(['index', ...args.files, '--json']);
  // Return verbatim - no post-processing
  return {
    content: [{ type: 'text', text: result.stdout }],
    isError: !result.success,
  };
}
```

### Behavioral Notes

- Must be called BEFORE mdsel_select
- Returns structured JSON from mdsel verbatim
- No validation of file paths
- No caching of results

---

## Tool 2: mdsel_select

### Purpose

Retrieve specific document content using declarative selectors.

### MCP Tool Definition

```json
{
  "name": "mdsel_select",
  "title": "Markdown Selector Select",
  "description": "Retrieve specific content from Markdown documents using selectors. REQUIRED: Call mdsel_index first to discover available selectors. Do NOT use the Read tool for large Markdown files.\n\nReturns: JSON with matched content and available child selectors for further drilling.\n\nSelector Syntax:\n- [namespace::]type[index][/path][?full=true]\n- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table, block:blockquote\n- Examples:\n  - heading:h2[0] - First h2 heading\n  - readme::heading:h1[0]/block:code[0] - First code block under first h1 in readme\n  - section[1]?full=true - Second section with full content (bypass truncation)\n\nUsage Pattern:\n1. mdsel_index to discover selectors\n2. mdsel_select with discovered selectors\n3. Drill down with child selectors as needed",
  "inputSchema": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "Selector string (e.g., 'heading:h2[0]', 'readme::section[1]?full=true')"
      },
      "files": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Array of absolute file paths to Markdown documents to search"
      }
    },
    "required": ["selector", "files"]
  }
}
```

### Handler Implementation

```typescript
async function handleMdselSelect(args: { selector: string; files: string[] }): Promise<ToolResult> {
  const cmdArgs = ['select', args.selector, ...args.files, '--json'];
  const result = await execMdsel(cmdArgs);
  // Return verbatim - no post-processing
  return {
    content: [{ type: 'text', text: result.stdout }],
    isError: !result.success,
  };
}
```

### Behavioral Notes

- Selectors are passed directly to mdsel without validation
- Errors from mdsel returned verbatim
- No summarization or interpretation
- No transformation of content

---

## Tool Descriptions: Behavioral Conditioning

Per PRD Section 7, tool descriptions must:

1. **Explicitly state Read should not be used for large Markdown files**
   - ✓ Included in both tool descriptions

2. **Include minimal selector grammar**
   - ✓ Selector syntax documented in descriptions

3. **Describe canonical usage sequence**
   - ✓ mdsel_index → mdsel_select workflow documented

4. **Avoid philosophy, justification, or marketing language**
   - ✓ Descriptions are functional and mechanical

---

## Error Handling

### Selector Errors

Returned verbatim from mdsel:

```json
{
  "success": false,
  "errors": [
    {
      "type": "INVALID_SELECTOR",
      "message": "Details from mdsel"
    }
  ]
}
```

### File Errors

Returned verbatim from mdsel:

```json
{
  "success": false,
  "errors": [
    {
      "type": "FILE_NOT_FOUND",
      "message": "Cannot read file: /path/to/missing.md"
    }
  ]
}
```

### Handler Must NOT

- Catch errors and rewrite them
- Add suggestions or explanations
- Wrap or transform error messages
