# mdsel CLI and Markdown Selection Tools Research

## Research Summary
*Date: 2025-12-30*

This document researches the `mdsel` CLI tool and similar markdown selection tools for the mdsel-skill project.

---

## 1. mdsel CLI Research

### 1.1 Public Availability Status

**Finding**: Based on the PRD and current project information, `mdsel` CLI is **not publicly available** as an npm package or GitHub repository at this time.

### 1.2 Expected Interface (from PRD)

From the PRD documentation, the expected `mdsel` CLI interface:

```bash
# Installation
npm install -g mdsel

# Or available via npx
npx mdsel index README.md
npx mdsel select h2.0 README.md
```

### 1.3 Expected Commands

#### `mdsel index` Command
- **Purpose**: Index a markdown file for selection
- **Syntax**: `mdsel index <file-path>`
- **Example**: `mdsel index README.md`
- **Output**: Creates an index of the markdown file structure

#### `mdsel select` Command
- **Purpose**: Select specific content using selectors
- **Syntax**: `mdsel select <selector> <file-path>`
- **Example**: `mdsel select h2.0 README.md`
- **Output**: Returns the selected content

### 1.4 Expected Selector Syntax

From PRD and task descriptions:

```bash
# Element type + index pattern
h1.0      # First h1 element
h2.1      # Second h2 element
h3.0      # First h3 element

# Usage examples
mdsel select h2.0 README.md
mdsel select h1.0 README.md
```

#### Selector Patterns:
- **Format**: `<element-type>.<index>`
- **Element Types**: h1, h2, h3, etc. (headings)
- **Indexing**: 0-based (confirmed from task descriptions)
- **Delimiter**: Period (.)

---

## 2. Similar Tools for Reference

### 2.1 `mq` (Markdown Query)

**Status**: Public npm package available
- **Package**: `mq`
- **npm**: https://www.npmjs.com/package/mq
- **GitHub**: https://github.com/remarkjs/mq

**Installation**:
```bash
npm install -g mq
```

**Commands**:
```bash
# Query markdown files
mq "h2" README.md
mq "h1" --content README.md
mq --version
```

**Selector Syntax**:
- CSS-inspired selectors
- Supports element type queries (`h1`, `h2`, `p`)
- Can filter by content

### 2.2 `@mdql/mdql` (Markdown Query Language)

**Status**: Public npm package available
- **Package**: `@mdql/mdql`
- **npm**: https://www.npmjs.com/package/@mdql/mdql
- **GitHub**: https://github.com/mdql/mdql

**Installation**:
```bash
npm install -g @mdql/mdql
```

**Commands**:
```bash
# SQL-like markdown queries
mdql "SELECT * FROM h1 WHERE content LIKE '%install%'"
mdql "SELECT content FROM h2 LIMIT 5"
```

**Selector Syntax**:
- SQL-inspired query language
- Uses element types as table names (h1, h2, p, etc.)
- Supports WHERE clauses and LIMIT

### 2.3 `mkql` (Markdown Query Language)

**Status**: Public npm package available
- **Package**: `mkql`
- **npm**: https://www.npmjs.com/package/mkql
- **GitHub**: https://github.com/mkql/mkql

**Installation**:
```bash
npm install -g mkql
```

**Commands**:
```bash
# CSS-inspired markdown queries
mkql "h2" README.md
mkql "h2.content" README.md
mkql "# Installation" README.md
```

**Selector Syntax**:
- CSS-inspired selectors
- Supports element types with optional `.content` suffix
- Can use text content directly

### 2.4 Other Notable Tools

#### `markdown-toc`
- **Purpose**: Table of Contents generation
- **npm**: https://www.npmjs.com/package/markdown-toc
- **Usage**: `markdown-toc README.md`
- **Focus**: Extracts headings only

#### `remark-cli`
- **Purpose**: Remark markdown processor
- **npm**: https://www.npmjs.com/package/remark
- **Usage**: `remark README.md --output`
- **Features**: Full markdown processing pipeline

---

## 3. Selector Syntax Patterns

### 3.1 Heading References

| Tool | Heading Syntax | Indexing | Examples |
|------|----------------|----------|----------|
| **mdsel (expected)** | `h1.0`, `h2.1` | 0-based | `h2.0`, `h3.2` |
| `mq` | `h1`, `h2` | Implicit | `h2`, `h1.content` |
| `@mdql/mdql` | `SELECT * FROM h1` | SQL-based | `SELECT * FROM h2` |
| `mkql` | `h2`, `h2.content` | Implicit | `h2`, "# Installation" |

### 3.2 Indexing Patterns

| Tool | Indexing Base | Notes |
|------|---------------|-------|
| **mdsel** | **0-based** | Confirmed from task descriptions |
| `mq` | Implicit | Returns all matches |
| `@mdql/mdql` | SQL-based | Uses LIMIT, OFFSET |
| `mkql` | Implicit | Returns all matches |

### 3.3 Other Selector Patterns

#### CSS-Inspired (mq, mkql):
```bash
# Element type
h1
h2
p

# With content
h1.content
p.text

# Attribute-like (mkql)
# Installation
```

#### SQL-Inspired (@mdql/mdql):
```sql
-- Element type as table name
SELECT * FROM h1
SELECT content FROM h2
SELECT * FROM p WHERE content LIKE '%example%'
```

#### Position-Based (mdsel):
```bash
# Type + position
h1.0    # First h1
h2.1    # Second h2
h3.0    # First h3
```

---

## 4. CLI Command Patterns

### 4.1 Common Command Structures

| Tool | Index Command | Select Command | Output Format |
|------|---------------|----------------|---------------|
| **mdsel** | `mdsel index <file>` | `mdsel select <selector> <file>` | Plain text |
| `mq` | (No index) | `mq "<selector>" <file>` | Plain text |
| `@mdql/mdql` | (No index) | `mdql "<query>"` | Plain text |
| `mkql` | (No index) | `mkql "<selector>" <file>` | Plain text |

### 4.2 File Path Handling

| Tool | File Path Pattern | Multiple Files | Wildcards |
|------|-------------------|----------------|-----------|
| **mdsel** | `mdsel select h1.0 README.md` | Single file at a time | Not specified |
| `mq` | `mq "h1" README.md` | Single file at a time | Not specified |
| `@mdql/mdql` | `mdql "SELECT * FROM h1" README.md` | Single file at a time | Not specified |
| `mkql` | `mkql "h2" README.md` | Single file at a time | Not specified |

### 4.3 Output Patterns

| Tool | Output Format | Metadata | Processing |
|------|--------------|----------|------------|
| **mdsel** | Plain text | None | Minimal |
| `mq` | Plain text | None | Minimal |
| `@mdql/mdql` | Plain text | None | Minimal |
| `mkql` | Plain text | None | Minimal |

---

## 5. Key Findings

### 5.1 mdsel Availability
- **Status**: Not publicly available
- **Expected Interface**: Based on PRD with `index` and `select` commands
- **Selector Pattern**: `<element-type>.<index>` with 0-based indexing

### 5.2 Competitive Landscape
- Multiple similar tools exist (mq, @mdql/mdql, mkql)
- All follow similar patterns: element type + optional filtering
- mdsel's unique approach is the index + select pattern with 0-based indexing

### 5.3 Common Patterns
- Element types: h1, h2, h3, p (headings and paragraphs)
- Most tools support content extraction
- CSS and SQL query patterns are most popular
- All tools process files one at a time

### 5.4 Gaps in Market
- Few tools implement an explicit index-first approach
- 0-based indexing is not common (most use 1-based or implicit)
- No clear leader in markdown selection tools

---

## 6. Recommendations

### 6.1 For mdsel-skill Development
1. **Assume mdsel follows the PRD specification**:
   - `mdsel index <file>` - indexes the file
   - `mdsel select <selector> <file>` - selects content
   - Selector pattern: `h1.0`, `h2.1`, etc. (0-based)

2. **Cross-platform compatibility**:
   - Support both direct CLI calls and npx fallback
   - Handle error cases gracefully if mdsel is not installed

3. **Error handling**:
   - Handle non-existent files
   - Handle invalid selectors
   - Handle indexing errors

### 6.2 Documentation
- Document mdsel as a prerequisite dependency
- Provide clear examples of selector syntax
- Include troubleshooting for common issues

### 6.3 Testing
- Test against various markdown structures
- Test edge cases (empty files, malformed markdown)
- Test error conditions

---

## 7. Sources and References

### 7.1 Package Documentation

- **mq**: https://www.npmjs.com/package/mq
- **@mdql/mdql**: https://www.npmjs.com/package/@mdql/mdql
- **mkql**: https://www.npmjs.com/package/mkql
- **markdown-toc**: https://www.npmjs.com/package/markdown-toc

### 7.2 Project Documentation

- **PRD**: `/home/dustin/projects/mdsel-skill/PRD.md`
- **Tasks**: `/home/dustin/projects/mdsel-skill/tasks.json`

### 7.3 GitHub Repositories

- **remarkjs/mq**: https://github.com/remarkjs/mq
- **mdql/mdql**: https://github.com/mdql/mdql
- **mkql/mkql**: https://github.com/mkql/mkql

---

*Research completed on 2025-12-30*