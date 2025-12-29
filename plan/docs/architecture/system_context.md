# System Context: mdsel-claude

## Project State

**Status**: Greenfield project on `attempt-2` branch
**Starting Point**: PRD.md only; reference implementation exists on `main` branch

### Branch Context
- `attempt-2` (current): Clean slate with only PRD.md
- `main`: Contains completed `mdsel-mcp` MCP server implementation (reference only)

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript (strict mode) | Matches mdsel ecosystem; strong typing |
| Runtime | Node.js >= 18.0.0 | Required by mdsel dependency |
| Build | tsup (ESM format) | Consistent with main branch patterns |
| Test | Vitest | Fast, modern, TypeScript-native |
| Validation | Zod | Runtime type safety for tool inputs |

## Integration Model

### Claude Code Integration Point

**Primary Method**: MCP Server (stdio transport)

The project exposes functionality through the Model Context Protocol:
- Tools are exposed with naming convention: `mcp__mdsel-claude__<tool_name>`
- Configuration via `~/.claude.json` or `.mcp.json`
- Stateless invocation per tool call

### Hook-Based Behavioral Conditioning

**Method**: PreToolUse Hook for Read tool interception

Claude Code supports hooks that fire when tools are invoked:
- `PreToolUse` hook intercepts Read calls on Markdown files
- Hook checks word count threshold (MDSEL_MIN_WORDS)
- Returns reminder message when threshold exceeded
- Cannot block Read; only inject behavioral nudge

## Tool Surface

Exactly **two tools** as specified in PRD:

### 1. `mdsel_index`
- **Purpose**: Selector inventory for Markdown documents
- **Invocation**: Spawns `mdsel index <files...> --json`
- **Output**: Pass-through JSON from mdsel
- **No transformation**: Raw relay only

### 2. `mdsel_select`
- **Purpose**: Content retrieval via selectors
- **Invocation**: Spawns `mdsel select <selector> <files...> --json`
- **Output**: Pass-through JSON from mdsel
- **No transformation**: Raw relay only

## Word Count Gating

### Configuration
```
Environment Variable: MDSEL_MIN_WORDS
Default Value: 200
```

### Logic Flow
```
IF file.wordCount > MDSEL_MIN_WORDS:
  → Selector-based access REQUIRED
  → Read usage triggers REMINDER
ELSE:
  → Full file read acceptable
  → No reminder needed
```

### Word Count Calculation
- Mechanical: whitespace-delimited tokens
- Not semantic: no NLP, no preprocessing
- Not cached: computed fresh each invocation
- Stateless: no session memory

## Reminder System

### Trigger Conditions (ALL must be true)
1. Claude invokes `Read` tool
2. Target is a Markdown file (`.md` extension)
3. Word count > MDSEL_MIN_WORDS

### Reminder Behavior
- Fires **every time** (no suppression)
- Identical message each time (no variation)
- Non-blocking (Read still executes)

### Canonical Reminder Message
```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

## Error Handling

### Principle: Zero Transformation
- Invalid selectors: Pass through verbatim from mdsel
- Missing documents: Pass through verbatim from mdsel
- Parse errors: Pass through verbatim from mdsel

### Exit Codes from mdsel
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (selector not found, parse error) |
| 2 | Usage error (invalid arguments) |

## Non-Functional Requirements

### Statelessness
- No session memory
- No cached indices
- No retained document knowledge
- Each invocation is independent

### Performance
- Thin layer: minimal overhead
- Delegate all parsing to mdsel
- No caching (by design)
- No optimization beyond delegation

## Success Criteria

1. Claude stops reading full Markdown files (behavioral)
2. Agents reliably index before selecting (workflow)
3. Token usage drops for large documents (measurable)
4. No divergence from mdsel output (correctness)
