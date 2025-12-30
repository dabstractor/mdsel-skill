# mdsel-skill

[![npm version](https://badge.fury.io/js/mdsel-skill.svg)](https://www.npmjs.com/package/mdsel-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-darwin%20%7C%20linux-lightgrey.svg)](https://github.com/dabstractor/mdsel-claude)

> Access large Markdown files using declarative selectors via the mdsel CLI

## What is mdsel-skill?

**mdsel-skill** is a cross-platform agent skill for AI coding assistants (Claude Code, OpenCode) that conditions efficient access to large Markdown files using declarative selectors instead of full-file reads.

Instead of reading entire documentation files and wasting thousands of tokens, agents can select specific sections using simple selectors like `h2.0` (first H2 heading) or `h3.1` (second H3 heading).

### Token Efficiency

Using the Read tool on large Markdown files wastes tokens:

| File Size | Read Tool | mdsel | Savings |
|-----------|-----------|-------|---------|
| 500 words | ~2,000 tokens | ~100 tokens | 95% |
| 2,000 words | ~8,000 tokens | ~100 tokens | 98.75% |
| 5,000 words | ~20,000 tokens | ~100 tokens | 99.5% |

### Why mdsel-skill instead of mdsel-mcp?

The older MCP-based approach injected ~1300 tokens of tool schema into every conversation. Skills load on-demand, consuming only ~50-100 tokens when inactive—a **96% reduction** in overhead.

## Features

- **Token Efficient**: Reduces token usage by 95-99.5% for large Markdown files
- **Cross-Platform**: Single installation works for both Claude Code and OpenCode
- **Declarative Selectors**: Simple `h2.0`, `h3.1` syntax for accessing sections
- **Automatic Hooks**: Optional reminder hooks encourage proper usage patterns
- **Zero-Based Indexing**: Predictable selector behavior with 0-based indexing
- **npx Fallback**: Works without global installation using npx

## Installation

### Method 1: npm (Recommended)

```bash
npm install -g mdsel-skill
```

The installation script runs automatically via `postinstall`, detecting your platform(s) and configuring the skill and hooks appropriately.

### Method 2: Direct Script

```bash
curl -fsSL https://raw.githubusercontent.com/dabstractor/mdsel-claude/main/install.sh | bash
```

### Method 3: npx (No Installation)

You can use mdsel without installing anything:

```bash
npx mdsel h2.0 README.md
npx mdsel h1.0 README.md
```

### Platform Support

- **macOS** (darwin): Fully supported
- **Linux**: Fully supported
- **Windows**: Not officially supported (per package.json `os` field)

## Quick Start

```bash
# 1. See available selector formats
mdsel format

# 2. Select specific sections using declarative selectors
mdsel h2.0 README.md    # First H2 heading
mdsel h2.1 README.md    # Second H2 heading
mdsel h3.0 README.md    # First H3 heading
```

## Usage

### When to Use mdsel

Use mdsel when:
- File word count exceeds **MDSEL_MIN_WORDS** (default: 200)
- You need specific sections, not the entire document
- Token efficiency is important

### Decision Flow

1. File is Markdown (`.md` extension)?
2. Word count > MDSEL_MIN_WORDS?
3. **Yes**: Use `mdsel <selector> <file>` for specific content
4. **No**: Read tool is acceptable

### Selector Syntax

mdsel uses **0-based indexing** with the pattern `<element-type>.<index>`.

> **IMPORTANT**: Selectors use **0-based indexing**, not 1-based.
> - `h2.0` = First H2 heading
> - `h2.1` = Second H2 heading

| Selector | Description | Example |
|----------|-------------|---------|
| `h1.0` | First H1 heading | `# Title` |
| `h2.0` | First H2 heading | `## Installation` |
| `h2.1` | Second H2 heading | `## Usage` |
| `h3.0` | First H3 heading | `### Quick Start` |
| `h3.2` | Third H3 heading | `### Advanced Usage` |

### Critical: 0-Based Indexing

**Many users expect 1-based indexing—this is the most common error!**

```
File content:
# Main Title          (h1.0 - FIRST h1)
## Introduction       (h2.0 - FIRST h2)
## Getting Started    (h2.1 - SECOND h2)
### Installation      (h3.0 - FIRST h3)
### Configuration     (h3.1 - SECOND h3)
## API Reference      (h2.2 - THIRD h2)
```

To access "## Introduction", use `h2.0`, not `h2.1`.

### Examples

#### Example 1: Basic Selection

```bash
# Select the first H2 section
mdsel h2.0 docs/API.md

# Select the third H2 section
mdsel h2.2 docs/API.md
```

#### Example 2: Multiple Selections

```bash
# Select multiple sections sequentially
mdsel h2.0 README.md  # Installation section
mdsel h2.1 README.md  # Usage section
mdsel h2.2 README.md  # API Reference section
```

#### Example 3: Nested Headings

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

#### Example 4: Using npx

```bash
# Use npx to run mdsel without global installation
npx mdsel h1.0 README.md
npx mdsel h2.0 README.md
```

## Configuration

### Environment Variables

#### MDSEL_MIN_WORDS

Controls when mdsel should be preferred over Read.

```bash
# Set custom threshold (default is 200)
export MDSEL_MIN_WORDS=300
```

When a Markdown file is accessed:
- If word count **≤ MDSEL_MIN_WORDS**: File may be read in full, no reminder issued
- If word count **> MDSEL_MIN_WORDS**: Selector-based access encouraged, reminder hook fires

### Hook Configuration

Hooks are automatically configured during installation. If manual configuration is needed:

#### Claude Code

Edit `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": {"toolName": "Read"},
        "hook": {
          "type": "command",
          "command": "bash ~/.claude/hooks/mdsel-reminder.sh"
        }
      }
    ]
  }
}
```

#### OpenCode

The TypeScript plugin is installed to `~/.config/opencode/plugins/mdsel-reminder/` during installation.

**Note**: Hooks fire **every time** you use Read on a large Markdown file. This repetition is by design to condition proper usage patterns.

## Platforms

### Claude Code

- **Skill Location**: `~/.claude/skills/mdsel/SKILL.md`
- **Hook Type**: PostToolUse shell command
- **Hook Script**: `~/.claude/hooks/mdsel-reminder.sh`

The skill is automatically recognized by Claude Code. Hooks are configured via settings.json.

### OpenCode

- **Skill Location**: `~/.claude/skills/mdsel/SKILL.md` (OpenCode recognizes `.claude/skills/`)
- **Plugin Type**: TypeScript plugin
- **Plugin Location**: `~/.config/opencode/plugins/mdsel-reminder/`

A single installation works for both platforms thanks to OpenCode's explicit support for `.claude/skills/`.

## Migration from mdsel-mcp

If you're migrating from the older MCP-based approach:

### What Changed

| Aspect | mdsel-mcp | mdsel-skill |
|--------|-----------|-------------|
| Token Overhead | ~1300 tokens (always) | <100 tokens when inactive |
| Configuration | MCP server in settings | Skill file + optional hooks |
| Approach | Tool schema injection | On-demand skill loading |

### Migration Steps

1. **Remove the MCP server** from your Claude Code or OpenCode settings
2. **Install mdsel-skill**: `npm install -g mdsel-skill`
3. **Verify installation**: Check that `~/.claude/skills/mdsel/SKILL.md` exists

The selector syntax and CLI commands remain identical. You gain significant token savings with no functional loss.

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

### "Hook not triggering"

**Possible Causes**:

1. **Hook not installed**: Check `~/.claude/hooks/mdsel-reminder.sh` exists
2. **settings.json not configured**: Verify PostToolUse hook is in your settings
3. **jq not available**: Install jq for JSON manipulation in the hook script

**Verification Steps**:

```bash
# Check hook file exists
ls -la ~/.claude/hooks/mdsel-reminder.sh

# Check settings.json contains hook
cat ~/.claude/settings.json | grep -A5 "PostToolUse"

# Test hook directly
echo '{"tool_name":"Read","tool_input":{"file_path":"README.md"}}' | bash ~/.claude/hooks/mdsel-reminder.sh
```

### "Invalid selector syntax"

**Cause**: Selector format is incorrect.

**Common mistakes**:
- Missing period: `h20` instead of `h2.0`
- **1-based indexing**: `h2.1` when you want the first H2 (should be `h2.0`)
- Wrong element type: `heading.0` instead of `h2.0`

**Correct format**: `<element-type>.<index>`
- Correct: `h2.0`, `h1.1`, `h3.2`
- Incorrect: `h2`, `h1[0]`, `h2_1`, `heading.0`

### "Selector returns empty output"

**Cause**: Selector index is too high for the available elements.

**Solution**: Use `mdsel format` to see available selector formats, then adjust your selector index:

```bash
mdsel format
# This shows the selector format specification
# Use a valid index (e.g., h2.0, h2.1, h3.0)
```

### Reminder Hook Fires Repeatedly

**This is intentional behavior** per the PRD specification.

The reminder fires every time you use Read on a large Markdown file to encourage proper usage patterns.

**Solution**: Use mdsel as intended:
1. Run `mdsel <selector> <file>` for specific content
2. Use selectors like `h2.0`, `h1.0`, `h3.1` to target specific sections
3. Reserve Read only for small files (< MDSEL_MIN_WORDS)

## License

MIT © Dustin Schultz

## Links

- **Repository**: https://github.com/dabstractor/mdsel-claude
- **Issues**: https://github.com/dabstractor/mdsel-claude/issues
- **npm Package**: https://www.npmjs.com/package/mdsel-skill
