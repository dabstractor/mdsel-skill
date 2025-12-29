# mdsel-claude

Claude Code adapter with behavioral enforcement for selector-based Markdown access via mdsel CLI.

## Installation

### Prerequisites

Install the `mdsel` CLI (required peer dependency):

```bash
npm install -g mdsel
```

### Run mdsel-claude

```bash
# Option 1: Run directly with npx (recommended)
npx mdsel-claude

# Option 2: Install globally
npm install -g mdsel-claude
```

## Quick Start

### Configuration

Add to your MCP client configuration:

**Claude Desktop** (`~/.claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "npx",
      "args": ["-y", "mdsel-claude"]
    }
  }
}
```

**Claude Code** (`~/.claude.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "node",
      "args": ["/absolute/path/to/mdsel-claude/dist/index.js"]
    }
  }
}
```

### Usage Pattern

1. Call `mdsel_index` to discover available selectors
2. Call `mdsel_select` with specific selectors to retrieve content

```text
mdsel_index README.md
# Returns selector inventory like:
# h1.0 Main Title
#  h2.0 Section One
#  h2.1 Section Two
# ---
# code:5 para:12 list:3 table:1

mdsel_select h2.0 README.md
# Returns content under first h2 heading
```

## Features

- Two MCP tools for selector-based Markdown access
- Token-efficient content retrieval via declarative selectors
- Behavioral conditioning via PreToolUse hook
- Stateless, pass-through architecture

## Tools

### mdsel_index

Return a selector inventory for Markdown documents.

**Parameters**:
- `files` (array of strings, required): Markdown file paths to index

**Output Format** (TEXT):

```text
h1.0 Main Title
 h2.0 Section One
 h2.1 Section Two
  h3.0 Subsection
---
code:5 para:12 list:3 table:1
```

**Example**:

```bash
mdsel_index README.md
```

### mdsel_select

Select content from Markdown documents using declarative selectors.

**Parameters**:
- `selector` (string, required): Declarative selector (e.g., "h1.0", "h2.1-3")
- `files` (array of strings, required): Markdown file paths

**Output**: Selected content in TEXT format

**Examples**:

```bash
# First h2 heading
mdsel_select h2.0 README.md

# Range of h2 headings (indices 1, 2, 3)
mdsel_select h2.1-3 README.md

# Code block under specific heading
mdsel_select h2.0/code.0 README.md

# All h2 headings
mdsel_select h2 README.md
```

## Selector Syntax

| Pattern | Meaning | Example |
|---------|---------|---------|
| `hN.I` | Nth heading, Ith index | `h1.0`, `h2.1` |
| `code.I` | Ith code block | `code.0` |
| `para.I` | Ith paragraph | `para.0` |
| `list.I` | Ith list | `list.0` |
| `hN.I-M` | Range of indices | `h2.1-3` (h2 indices 1, 2, 3) |
| `hN.I/code.J` | Nested selection | `h2.0/code.0` (first code under first h2) |

**Notes**:
- Indices are 0-based (first item is index 0)
- Use `mdsel_index` first to discover available selectors
- See [mdsel CLI documentation](https://github.com/dustinswords/mdsel) for complete syntax

## Configuration

### Environment Variables

- `MDSEL_MIN_WORDS`: Word count threshold for behavioral hook (default: 200)

### MCP Client Setup

**Claude Desktop** (`~/.claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "npx",
      "args": ["-y", "mdsel-claude"]
    }
  }
}
```

**Claude Code** (`~/.claude.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "node",
      "args": ["/absolute/path/to/mdsel-claude/dist/index.js"]
    }
  }
}
```

**Other MCP Clients**: Use stdio transport with `npx mdsel-claude` command.

## Behavioral Conditioning Hook

The included PreToolUse hook reminds you to use `mdsel_index` and `mdsel_select` when accessing large Markdown files.

**Installation**:

```bash
# Create hooks directory
mkdir -p ~/.claude/hooks/PreToolUse.d/

# Copy hook script
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/

# Make executable
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Prerequisites**: `jq` (JSON processor)

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

**Configuration**: Set `MDSEL_MIN_WORDS` environment variable to adjust threshold.

See [plan/docs/hooks-documentation.md](plan/docs/hooks-documentation.md) for complete details.

## Requirements

- Node.js >= 18.0.0
- mdsel CLI ^1.0.0
- jq (for hook functionality)

## License

MIT
