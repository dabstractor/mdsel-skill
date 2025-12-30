# External Dependencies

## mdsel CLI

### Status: NOT PUBLICLY AVAILABLE

**Research Finding**: No public npm package or GitHub repository exists for `mdsel` as of this analysis.

### PRD Assumption

The PRD explicitly states:
- "This project does **not** modify `mdsel`"
- "The `mdsel` CLI must be installed and available in PATH"

This indicates mdsel is expected to exist as a separate, pre-existing tool.

### Expected Interface

```bash
# Installation
npm install -g mdsel
# or
npx mdsel <command>

# Commands
mdsel index <file.md>              # Index markdown structure
mdsel select <selector> <file.md>  # Select specific content
```

### Selector Syntax (Inferred)

Based on PRD examples (`h2.0`), the syntax appears to be:
```
<element>.<index>

Examples:
h1.0    # First H1 heading
h2.0    # First H2 heading
h2.1    # Second H2 heading
```

### Similar Tools for Reference

| Tool | npm | Description |
|------|-----|-------------|
| `mq` | Yes | jq-like markdown processing |
| `mkql` | Yes | CSS-inspired markdown selectors |
| `@mdql/mdql` | Yes | SQL-like markdown queries |

### Implementation Implications

1. **Skill assumes mdsel exists**: SKILL.md instructions reference `mdsel` commands
2. **Installation script must verify**: Check for `mdsel` or `npx mdsel` availability
3. **Graceful degradation**: If mdsel not found, warn user during install
4. **No CLI changes required**: Skill just wraps existing CLI

## Node.js / npm

Required for:
- Running installation script
- TypeScript compilation for OpenCode plugin
- `jq` alternative for JSON parsing in hook scripts

## jq (Optional)

Shell hook uses `jq` for JSON parsing. Alternatives:
- Node.js inline script
- Python one-liner
- Built-in shell parsing (limited)

## Platform-Specific Dependencies

### Claude Code
- Bash shell (for hook execution)
- `wc` command (for word counting)
- `jq` (for JSON parsing)

### OpenCode
- Bun runtime (OpenCode uses Bun internally)
- `@opencode-ai/plugin` package
- TypeScript compiler

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `MDSEL_MIN_WORDS` | 200 | Word count threshold for reminder |
