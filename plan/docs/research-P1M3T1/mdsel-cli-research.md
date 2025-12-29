# mdsel CLI Research Document

## Summary

**mdsel** is a "Declarative Markdown semantic selection CLI for LLM agents" that parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk.

**Repository**: `/home/dustin/projects/mdsel` (local project)
**Version**: 1.0.0
**Author**: Dustin (local developer)
**License**: MIT
**Required**: Node.js >=18.0.0

---

## 1. What is the mdsel CLI Tool?

### Overview

mdsel is a command-line interface tool designed specifically for LLM (Large Language Model) agents. It enables:

- **Semantic parsing** of Markdown documents into AST (Abstract Syntax Trees)
- **Selector-based retrieval** of specific document sections
- **Token-efficient** content access (no need to load entire files)
- **Machine-addressable** selectors for every meaningful content chunk

### Key Features

1. **Path-based selectors** - Similar to CSS/XPath but purpose-built for Markdown
2. **Ordinal indexing** - 0-based indexing for deterministic selection
3. **Stateless operation** - No persistent state or caching
4. **Dual output modes** - TEXT (default, token-efficient) and JSON (structured)
5. **Cross-document selection** - Query across multiple Markdown files
6. **Truncation control** - Bypass content limits with `--full` flag

### Purpose

The tool enables LLMs to:
- Request exactly the content they want
- Avoid loading entire files into context
- Use declarative selectors instead of line-based retrieval
- Access specific sections, headings, code blocks, tables, etc.

---

## 2. What Does `mdsel index` Do?

### Command Syntax

```bash
mdsel index <files...>
mdsel index <files...> --json
```

### Purpose

The `index` command parses one or more Markdown documents and emits a **selector inventory** - a listing of all available selectors in the document(s).

### What It Returns

1. **Hierarchy tree** - Visual representation of document structure with indentation
2. **Selector list** - Machine-readable selectors for each heading
3. **Block counts** - Summary of content blocks (code, paragraphs, lists, tables)

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `files...` | string[] | Yes | One or more Markdown file paths to index |

### Options

| Option | Type | Description |
|--------|------|-------------|
| `--json` | flag | Output structured JSON instead of compact text |
| `-h, --help` | flag | Display help for the index command |

---

## 3. TEXT Output Format of `mdsel index`

### Format Specification (Default TEXT Mode)

**CRITICAL**: The mdsel-claude project uses TEXT output mode (NOT JSON) for token efficiency per PRD specification.

#### Structure

```
[HEADING HIERARCHY]
---
[BLOCK COUNTS]
```

#### Section 1: Heading Hierarchy

Each heading is displayed on a separate line with:

- **Indentation** - Spaces indicating nesting level (2 spaces per depth)
- **Selector** - Machine-readable selector (e.g., `h1.0`, `h2.1`, `h3.0`)
- **Title** - Human-readable heading text

**Pattern**: `<indent><selector> <title>`

#### Section 2: Separator

Three dashes: `---`

#### Section 3: Block Counts

Space-separated key-value pairs:

```
code:<N> para:<N> list:<N> table:<N>
```

Where `<N>` is the count of each block type in the document.

### Example TEXT Output

#### Input Document (`test-sample.md`)

```markdown
# Main Title

This is a paragraph of text.

## Section One

Some content here with a code block:

```javascript
function hello() {
  console.log("Hello World");
}
```

## Section Two

More content with a list:

- Item 1
- Item 2
- Item 3

### Subsection 2.1

Nested content.

## Conclusion

Final paragraph.
```

#### Command

```bash
mdsel index test-sample.md
```

#### TEXT Output

```
h1.0 Main Title
 h2.0 Section One
 h2.1 Section Two
  h3.0 Subsection 2.1
 h2.2 Conclusion
---
code:1 para:5 list:1
```

### Output Parsing Guide

**Line-by-line breakdown**:

1. `h1.0 Main Title` - Level 1 heading, index 0, text "Main Title"
2. ` h2.0 Section One` - Level 2 heading (indented), index 0
3. ` h2.1 Section Two` - Level 2 heading (indented), index 1
4. `  h3.0 Subsection 2.1` - Level 3 heading (double-indented), index 0
5. ` h2.2 Conclusion` - Level 2 heading (indented), index 2
6. `---` - Separator between hierarchy and counts
7. `code:1 para:5 list:1` - Block counts (1 code block, 5 paragraphs, 1 list)

### Multi-Document Index

When indexing multiple files:

```bash
mdsel index README.md GUIDE.md
```

The output combines all documents into a single hierarchy.

---

## 4. Arguments Accepted by `mdsel index`

### Positional Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `files...` | `string[]` | Yes | One or more Markdown file paths |

### Minimum

```bash
mdsel index README.md
```

### Multiple Files

```bash
mdsel index README.md docs/API.md docs/GUIDE.md
```

### Glob Patterns (Shell-Expanded)

```bash
mdsel index docs/**/*.md
mdsel index *.md
```

### Options/Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--json` | boolean | false | Output JSON instead of text |
| `-h, --help` | flag | - | Display help for index command |
| `-V, --version` | flag | - | Output version number |

**Note**: The `--json` flag is NOT used in mdsel-claude project (PRD specifies TEXT output).

---

## 5. Exit Codes for Success/Failure

### Exit Code Reference

| Code | Meaning | Usage |
|------|---------|-------|
| 0 | Success | Command completed successfully |
| 1 | Error | File not found, parse error, selector not found |
| 2 | Usage Error | Invalid command syntax, missing arguments |

### Success Exit (0)

```bash
mdsel index README.md
echo $?  # Output: 0
```

### Error Exit Examples

#### File Not Found (Exit Code 1)

```bash
mdsel index nonexistent.md
# Output: !FILE_NOT_FOUND: File not found: nonexistent.md
# Exit code: 1
```

#### Invalid Selector (Exit Code 1)

```bash
mdsel select "h2.99" README.md
# Output: !heading:h2[99]
#         No matches found in any document
#         ~readme::heading:h2[0] ~readme::heading:h2[1]
# Exit code: 1
```

### Error Format (TEXT Mode)

Errors in TEXT mode use special prefixes:

- `!<selector>` - Indicates the failing selector
- `~<suggestion>` - Suggested alternatives (if available)

#### Example Error Output

```
!h2.99
Index out of range: document has 3 h2 headings
~h2.0 ~h2.1 ~h2.2
```

### Usage Error (Exit Code 2)

```bash
mdsel index
# Output: error: required argument 'files' was not specified
# Exit code: 2
```

---

## 6. Example Usage and Sample Output

### Example 1: Index Single Document

#### Command

```bash
mdsel index README.md
```

#### Sample Output (TEXT)

```
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
 h2.2 Commands
  h3.0 index
  h3.1 select
  h3.2 format
 h2.3 Selectors
  h3.0 Syntax
  h3.1 Node Types
  h3.2 Index Semantics
 h2.4 Output Format
 h2.5 Error Handling
---
code:19 para:23 list:5 table:3
```

### Example 2: Index Multiple Documents

#### Command

```bash
mdsel index README.md docs/API.md
```

#### Sample Output (TEXT)

```
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
 h2.2 Commands
  h3.0 index
  h3.1 select
---
code:15 para:18 list:3 table:1
h1.0 API Reference
 h2.0 Authentication
 h2.1 Endpoints
  h3.0 GET /users
  h3.1 POST /users
 h2.2 Responses
---
code:8 para:12 list:7 table:0
```

### Example 3: Real Document Index

#### Sample Document (package documentation)

```markdown
# @package/cli

Command-line interface for package management.

## Installation

```bash
npm install @package/cli
```

## Commands

### init

Initialize a new project.

```bash
package-cli init my-project
```

### build

Build the project.

```bash
package-cli build
```

## Configuration

Create a `package.config.json` file:

```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```

## Options

| Option | Description |
|--------|-------------|
| `--verbose` | Enable verbose logging |
| `--dry-run` | Show what would be done |
```

#### Index Command

```bash
mdsel index package-docs.md
```

#### TEXT Output

```
h1.0 @package/cli
 h2.0 Installation
 h2.1 Commands
  h3.0 init
  h3.1 build
 h2.2 Configuration
 h2.3 Options
---
code:3 para:7 list:0 table:1
```

### Example 4: Error Handling

#### Non-Existent File

```bash
mdsel index missing.md
```

#### Output

```
!FILE_NOT_FOUND: File not found: missing.md
file: missing.md
```

#### Exit Code

```bash
echo $?  # Output: 1
```

### Example 5: Select Content (For Comparison)

#### Command

```bash
mdsel select "h2.0" README.md
```

#### TEXT Output

```
## Installation

```bash
npm install -g mdsel
```

**Requirements**: Node.js >=18.0.0
```

---

## 7. Comparison: TEXT vs JSON Output

### TEXT Output (Used in mdsel-claude)

**Command**: `mdsel index README.md`

**Output**:
```
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
---
code:15 para:18 list:3 table:1
```

**Advantages**:
- Token-efficient (minimal overhead)
- Human-readable
- Easy to parse for LLMs
- Compact format

### JSON Output (NOT Used in mdsel-claude)

**Command**: `mdsel index README.md --json`

**Output**:
```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-01-15T10:30:00.000Z",
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
            "children_count": 11,
            "word_count": 1,
            "section_word_count": 500,
            "section_truncated": false
          }
        ],
        "blocks": {
          "paragraphs": 5,
          "code_blocks": 2,
          "lists": 1,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 86,
      "total_selectors": 86
    }
  }
}
```

**Advantages**:
- Structured data
- Complete metadata
- Programmatic access
- Type definitions available

**Why mdsel-claude uses TEXT**: PRD specifies token efficiency - TEXT output is ~10x smaller than equivalent JSON.

---

## 8. Selector Syntax Reference

### Basic Syntax

```
[namespace::]type[index][/path][?query]
```

### Shorthand Types

| Full Form | Shorthand | Description |
|-----------|-----------|-------------|
| `heading:h1` - `heading:h6` | `h1` - `h6` | Headings by level |
| `block:paragraph` | `para`, `paragraph` | Paragraphs |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | Lists |
| `block:table` | `table` | Tables |
| `block:blockquote` | `quote`, `blockquote` | Blockquotes |

### Index Notation

| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 heading |
| Bracket | `h2[0]` | First h2 heading (equivalent) |
| Range | `h2.1-3` | h2 indices 1, 2, 3 |
| Comma | `h2.0,2,4` | Specific indices (0, 2, 4) |
| None | `h2` | All h2 headings |

### Examples

```bash
# First heading (h1)
h1.0

# Third h2 heading
h2.2

# First code block under second h2
h2.1/code.0

# All h2 headings
h2

# Range: h2 indices 1 through 3
h2.1-3

# Multiple specific indices
h2.0,2,4

# Namespace-specific selection
readme::h2.0

# Full content (no truncation)
h2.0?full=true
```

---

## 9. Related Commands

### `mdsel select`

Retrieve content via selectors.

```bash
mdsel select <selector> [files...]
mdsel select <selector> [files...] --full
mdsel select <selector> [files...] --json
```

**Options**:
- `--full` - Bypass truncation and return full content
- `--json` - Output JSON instead of text

**Examples**:
```bash
# Select first h2
mdsel select h2.0 README.md

# Select with full content
mdsel select h2.1 README.md --full

# Cross-document selection
mdsel select h1.0 README.md GUIDE.md
```

### `mdsel format`

Output format specification for tool descriptions.

```bash
mdsel format
```

**Output**:
```
# index
hN.I title (indented)\n---\ncode:N para:N list:N table:N

# select
content only. multiple: selector: prefix. no index = all
```

---

## 10. Installation and Requirements

### Installation

```bash
npm install -g mdsel
```

### Requirements

- **Node.js**: >=18.0.0
- **npm**: Any version

### Verification

```bash
mdsel --version  # Output: 1.0.0
mdsel --help     # Display help
```

### Local Development Installation

For the local mdsel project at `/home/dustin/projects/mdsel`:

```bash
cd /home/dustin/projects/mdsel
npm run build
npm link
```

This creates a symlink from global npm to the local project.

---

## 11. Key Implementation Details for mdsel-claude

### TEXT Output Mode (CRITICAL)

The mdsel-claude project uses TEXT output mode exclusively:

**DO NOT use `--json` flag**:
```typescript
// CORRECT (TEXT mode)
spawn('mdsel', ['index', 'README.md'], { shell: true })

// INCORRECT (JSON mode - do NOT use)
spawn('mdsel', ['index', '--json', 'README.md'], { shell: true })
```

### Expected Output Structure

When implementing the `mdsel_index` tool, expect TEXT output with:

1. **Heading lines** - One per heading, with indentation
2. **Separator** - Line containing only `---`
3. **Block counts** - Space-separated `key:value` pairs

### Exit Code Handling

```typescript
const result = await executeMdsel('index', ['README.md']);

if (result.success) {
  // Exit code was 0 - parse stdout
  const lines = result.stdout.split('\n');
  // Process heading hierarchy and block counts
} else {
  // Exit code was non-zero - handle error
  const error = result.stderr;
  // Error format: !<selector>\n<message>\n~<suggestions>
}
```

---

## 12. Resources and References

### Primary Documentation

- **README**: `/home/dustin/projects/mdsel/README.md`
- **Package.json**: `/home/dustin/projects/mdsel/package.json`
- **Binary**: `/home/dustin/.local/bin/mdsel`

### Local Repository

```bash
cd /home/dustin/projects/mdsel
```

### Command Reference

```bash
mdsel --help          # General help
mdsel index --help    # Index command help
mdsel select --help   # Select command help
mdsel format          # Output format specification
```

### Online Resources

- **npm**: https://www.npmjs.com/package/mdsel (Note: May not be published)
- **GitHub**: (Local project only - no public repository found)

### Test Files

The mdsel project includes comprehensive tests at:
- `/home/dustin/projects/mdsel/src/**/*.test.ts`

Run tests with:
```bash
cd /home/dustin/projects/mdsel
npm test
```

---

## Appendix A: TEXT Output Format BNF Grammar

```
<output>         ::= <heading-list> "\n---\n" <block-counts>
<heading-list>   ::= <heading-line> ("\n" <heading-line>)*
<heading-line>   ::= <indent> <selector> " " <title>
<indent>         ::= "  " | "    " | "      " | ... (2 * depth spaces)
<selector>       ::= <type> "." <index>
<type>           ::= "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
<index>          ::= <digit>+
<title>          ::= <any-char-except-newline>*
<block-counts>   ::= "code:" <number> " para:" <number> " list:" <number> " table:" <number>
<number>         ::= <digit>+
```

---

## Appendix B: Sample Implementation Code

### Parsing TEXT Output

```typescript
interface IndexOutput {
  headings: Array<{
    selector: string;
    level: number;
    index: number;
    title: string;
  }>;
  blocks: {
    code: number;
    para: number;
    list: number;
    table: number;
  };
}

function parseIndexOutput(text: string): IndexOutput {
  const lines = text.split('\n');
  const separatorIndex = lines.indexOf('---');

  if (separatorIndex === -1) {
    throw new Error('Invalid format: separator not found');
  }

  // Parse heading lines
  const headingLines = lines.slice(0, separatorIndex);
  const headings = headingLines.map(line => {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const level = indent / 2 + 1; // 2 spaces per level

    const parts = line.trim().split(' ');
    const selector = parts[0];
    const typeIndex = selector.split('.');
    const type = typeIndex[0];
    const index = parseInt(typeIndex[1], 10);
    const title = parts.slice(1).join(' ');

    return { selector, level, index, title };
  });

  // Parse block counts
  const countLines = lines.slice(separatorIndex + 1);
  const countsText = countLines[0] || '';
  const counts: Record<string, number> = {};

  countsText.split(' ').forEach(part => {
    const [key, value] = part.split(':');
    if (key && value) {
      counts[key] = parseInt(value, 10);
    }
  });

  return {
    headings,
    blocks: {
      code: counts.code || 0,
      para: counts.para || 0,
      list: counts.list || 0,
      table: counts.table || 0,
    },
  };
}
```

---

## Document Metadata

**Generated**: 2025-12-29
**mdsel Version**: 1.0.0
**Research Method**: Direct execution, local source code, official README
**Purpose**: Support mdsel-claude MCP server implementation (P1.M3.T1)

---

*END OF RESEARCH DOCUMENT*
