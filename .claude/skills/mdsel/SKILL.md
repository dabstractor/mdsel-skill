---
name: mdsel
description: |
  Efficiently access large Markdown files using declarative selectors.
  Use mdsel CLI to select specific content without reading entire documents.
  Triggered by: markdown, large files, selector, h2.0, h1.0.
allowed-tools:
  - Bash
---

# mdsel: Markdown Selector Skill

This skill enables efficient access to large Markdown files using the `mdsel` CLI tool.

## Quick Start

### What is mdsel?

`mdsel` is a command-line tool that provides declarative selectors for accessing specific sections of Markdown files without reading the entire document. This is critical for token efficiency when working with large documentation files.

### When to Use mdsel

Use mdsel when:
- File word count exceeds **MDSEL_MIN_WORDS** (default: 200)
- You need specific sections, not the entire document
- Token efficiency is important

### Basic Usage

```bash
# Select specific content using declarative selectors
mdsel h2.0 README.md    # First H2 heading
mdsel h1.0 README.md    # First H1 heading
mdsel h3.1 README.md    # Second H3 heading
```

## Selector Syntax

mdsel uses **0-based indexing** with the pattern `<element-type>.<index>`.

### Selector Pattern

```
<element-type>.<index>
```

- **element-type**: h1, h2, h3, h4, h5, h6 (heading levels)
- **index**: Integer starting from 0 (0 = first occurrence)

### Selector Reference

| Selector | Description | Example |
|----------|-------------|---------|
| `h1.0` | First H1 heading | `# Title` |
| `h2.0` | First H2 heading | `## Installation` |
| `h2.1` | Second H2 heading | `## Usage` |
| `h3.0` | First H3 heading | `### Quick Start` |
| `h3.2` | Third H3 heading | `### Advanced Usage` |

### Critical: 0-Based Indexing

**IMPORTANT**: Selectors use **0-based indexing**, not 1-based.

```
File content:
# Main Title          (h1.0 - FIRST h1)
## Introduction       (h2.0 - FIRST h2)
## Getting Started    (h2.1 - SECOND h2)
### Installation      (h3.0 - FIRST h3)
### Configuration     (h3.1 - SECOND h3)
## API Reference      (h2.2 - THIRD h2)
```

### Selector Examples

```bash
# Get the first H2 (typically "## Installation" or similar)
mdsel h2.0 README.md

# Get the third H2 section
mdsel h2.2 README.md

# Get the second H3 under the second H2
mdsel h3.1 README.md
```

## When to Use This Skill

### Word Count Threshold

The **MDSEL_MIN_WORDS** environment variable controls when mdsel should be used.

```bash
# Set custom threshold (default is 200)
export MDSEL_MIN_WORDS=300
```

### Decision Flow

1. File is Markdown (`.md` extension)?
2. Word count > MDSEL_MIN_WORDS?
3. **Yes**: Use `mdsel <selector> <file>` for specific content
4. **No**: Read tool is acceptable

### Token Efficiency

Using the Read tool on large Markdown files wastes tokens:

| File Size | Read Tool | mdsel | Savings |
|-----------|-----------|-------|---------|
| 500 words | ~2,000 tokens | ~100 tokens | 95% |
| 2,000 words | ~8,000 tokens | ~100 tokens | 98.75% |
| 5,000 words | ~20,000 tokens | ~100 tokens | 99.5% |

### When NOT to Use mdsel

- Small files (< MDSEL_MIN_WORDS)
- Non-Markdown files
- When you need the entire file (rare)

## Examples

### Example 1: Basic Selection

```bash
# Select the first H2 section
mdsel h2.0 docs/API.md

# Select the third H2 section
mdsel h2.2 docs/API.md
```

### Example 2: Multiple Selections

```bash
# Select multiple sections sequentially
mdsel h2.0 README.md  # Installation section
mdsel h2.1 README.md  # Usage section
mdsel h2.2 README.md  # API Reference section
```

### Example 3: Working with Nested Headings

```bash
# For a file like:
# # Documentation
# ## Getting Started
# ### Prerequisites
# ### Installation
# ## Configuration

# Select specific nested sections
mdsel h3.0 README.md  # First H3 (Prerequisites)
mdsel h3.1 README.md  # Second H3 (Installation)
```

### Example 4: Using npx (if mdsel not installed)

```bash
# Use npx to run mdsel without global installation
npx mdsel h1.0 README.md
npx mdsel h2.0 README.md
```

### Example 5: Integrating with Workflows

```bash
# Check word count first
wc -w README.md

# If > 200, use mdsel
mdsel h2.0 README.md

# Otherwise, Read is acceptable
# (but mdsel still works fine on small files too)
```

## Troubleshooting

### "mdsel: command not found"

**Cause**: mdsel CLI is not installed or not in PATH.

**Solutions**:

```bash
# Install globally via npm
npm install -g mdsel

# Or use npx without installation
npx mdsel h1.0 README.md
npx mdsel h2.0 README.md
```

### "Invalid selector syntax"

**Cause**: Selector format is incorrect.

**Common mistakes**:
- Missing period: `h20` instead of `h2.0`
- 1-based indexing: `h2.1` when you want the first H2 (should be `h2.0`)
- Wrong element type: `heading.0` instead of `h2.0`

**Correct format**: `<element-type>.<index>`
- Correct: `h2.0`, `h1.1`, `h3.2`
- Incorrect: `h2`, `h1[0]`, `h2_1`, `heading.0`

### "File not found"

**Cause**: Incorrect file path or file doesn't exist.

**Solutions**:

```bash
# Use relative path from current directory
mdsel h2.0 README.md

# Use absolute path
mdsel h1.0 /home/user/project/README.md

# Use explicit relative path
mdsel h2.0 ./docs/guide.md

# List files to verify
ls -la *.md
```

### Empty output from select command

**Cause**: Selector index is too high for the available elements.

**Solution**: Use `mdsel format` to see available selector formats:

```bash
mdsel format
# This shows the selector format specification
# Use a valid index (e.g., h2.0, h2.1, h3.0)
```

### Reminder Hook Fires Repeatedly

**Cause**: This is intentional behavior per the PRD specification.

**Information**: The reminder fires every time you use Read on a large Markdown file. This repetition is by design to condition proper usage patterns.

**Solution**: Use mdsel as intended:
1. Run `mdsel <selector> <file>` for specific content
2. Use selectors like `h2.0`, `h1.0`, `h3.1` to target specific sections
3. Reserve Read only for small files (< MDSEL_MIN_WORDS)

### Permission Denied on Script Files

**Cause**: Hook scripts may not have execute permissions.

**Solution**: Hook scripts (separate from this skill) should have execute permissions:

```bash
chmod +x hooks/claude/mdsel-reminder.sh
```

Note: This skill file (SKILL.md) does not require execute permissions.

---

## Token Efficiency

This skill loads only metadata (~50-100 tokens) when inactive. Full instructions load only when activated by trigger keywords or explicit invocation.

**Trigger keywords**: markdown, large files, selector, index, select
