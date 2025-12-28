# mdsel-claude

Claude Code integration for mdsel with behavioral enforcement hooks.

## Overview

Exposes `mdsel_index` and `mdsel_select` as Claude Code tools and configures
a PreToolUse hook to encourage selector-based access for large Markdown files.

## Prerequisites

- Node.js >= 18.0.0
- mdsel CLI installed and available in PATH

## Installation

```bash
# Clone or navigate to project directory
cd /path/to/mdsel-claude

# Install dependencies
npm install

# Build the project
npm run build
```

The build process creates:

- `dist/index.js` - MCP server entry point
- `dist/hooks/read-hook.js` - PreToolUse hook script

## MCP Server Configuration

Create or edit `.claude/settings.json` in your project root or user home directory:

```json
{
  "mcpServers": {
    "mdsel": {
      "command": "node",
      "args": ["/absolute/path/to/mdsel-claude/dist/index.js"],
      "env": {
        "MDSEL_MIN_WORDS": "200"
      }
    }
  }
}
```

Replace `/absolute/path/to/mdsel-claude` with the actual path to this project.

**Configuration locations:**

- Project-level: `.claude/settings.json` (in project root)
- User-level: `~/.claude/settings.json` (in home directory)

## Hook Configuration

Add the PreToolUse hook to the same `.claude/settings.json` file:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/mdsel-claude/dist/hooks/read-hook.js"
          }
        ]
      }
    ]
  }
}
```

### Hook Behavior

The hook fires when **all** of the following are true:

- Claude invokes the `Read` tool
- Target file has `.md` extension
- File word count exceeds `MDSEL_MIN_WORDS` (default: 200)

When triggered, the hook displays:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

The hook **never blocks** the Read action - it only reminds.

## Environment Variables

| Variable          | Description                             | Default |
| ----------------- | --------------------------------------- | ------- |
| `MDSEL_MIN_WORDS` | Word count threshold for hook reminders | 200     |

Set via shell:

```bash
export MDSEL_MIN_WORDS=200
```

Or configure in `.claude/settings.json` under the MCP server `env` section.

## Usage Workflow

For large Markdown files, use the two-tool workflow:

1. **Index the file** to discover structure:

   ```
   mdsel_index with files: ["path/to/document.md"]
   ```

2. **Select content** using returned selectors:
   ```
   mdsel_select with files: ["path/to/document.md"], selector: "heading#Introduction"
   ```

Small files (at or below threshold) may be read normally without reminders.

## Troubleshooting

**Hook not firing:**

- Verify `npm run build` was run
- Check the path to `dist/hooks/read-hook.js` is absolute
- Confirm file has `.md` extension
- Verify word count exceeds threshold

**MCP tools not available:**

- Check MCP server configuration in `.claude/settings.json`
- Verify the path to `dist/index.js` is correct
- Restart Claude Code after configuration changes

**Reminder message variations:**

- The message must be exactly as specified in PRD Section 6.3
- No variation is allowed - same text every time
