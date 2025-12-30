# System Context: mdsel-skill

## Overview

This document captures the architectural context for implementing `mdsel-skill`, a cross-platform agent skill that conditions AI coding agents to use declarative selectors for Markdown document access.

## Current State

### Repository State (main branch)
- **Clean slate**: Only PRD.md exists on main branch
- **No existing implementation**: All previous work (MCP-based) is on feature branches
- **Directory structure**: Only `plan/architecture/` placeholder exists

### Previous Attempts (Feature Branches)
- `attempt-2`, `attempt-3`, `glm` branches contain MCP server implementations
- These are **superseded** by the skill-based approach in the current PRD
- Learnings from these can inform hook logic, but implementation differs fundamentally

## Target Architecture

### Skill System (Primary Deliverable)
```
.claude/skills/mdsel/
└── SKILL.md          # Cross-platform skill definition
```

### Hook System (Platform-Specific)
```
hooks/
├── claude/
│   └── mdsel-reminder.sh    # Shell script for Claude Code
└── opencode/
    └── mdsel-reminder.ts    # TypeScript plugin for OpenCode
```

### Installation
```
install.sh            # Cross-platform detection and setup
```

## External Dependencies

### mdsel CLI (CRITICAL ASSUMPTION)
**Status**: The PRD assumes `mdsel` CLI exists as an external dependency.

**Research Finding**: No public npm package or GitHub repository found for `mdsel`.

**Resolution Options**:
1. **Assume mdsel will be published** separately (PRD states: "This project does not modify mdsel")
2. **Skill can be implemented** to call `npx mdsel` commands - will gracefully fail if not installed
3. **Installation script** must verify mdsel availability and warn if missing

**Expected CLI Interface**:
```bash
mdsel index <file.md>          # Index a markdown file
mdsel select <selector> <file> # Select specific content (e.g., h2.0)
```

## Platform Compatibility Matrix

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| Skill Location | `.claude/skills/` | `.claude/skills/` (supported) OR `.opencode/skill/` |
| Hook Type | PostToolUse shell command | `tool.execute.after` plugin |
| Config Location | `~/.claude/settings.json` | `.opencode/plugin/` |
| Stdin Format | JSON object | Plugin parameters |

## Key Constraints

1. **Token Efficiency**: Skill must remain <100 tokens when inactive
2. **Cross-Platform**: Single SKILL.md works for both platforms
3. **Stateless**: No persistence between sessions
4. **Non-Blocking**: Hooks must never prevent Read from completing
5. **Mechanical Word Count**: Whitespace-delimited, not semantic
