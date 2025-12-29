# System Context: mdsel-claude

## Project Overview

`mdsel-claude` is a **Claude Code MCP server** that exposes the `mdsel` CLI tool as first-class tools for Claude agents. Its purpose is behavioral conditioning—biasing Claude away from full-file reads of Markdown documents toward selector-based access.

## Core Architecture Decision

**Pattern**: Thin MCP Server Wrapper

This project is intentionally minimal. It:
- Delegates ALL Markdown parsing to `mdsel`
- Delegates ALL selector resolution to `mdsel`
- Provides behavioral hooks (reminder system)
- Exposes exactly two tools via MCP

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | Node.js >= 18 | Match mdsel runtime |
| Language | TypeScript | Type safety, matches mdsel |
| Protocol | MCP (JSON-RPC 2.0) | Claude Code integration standard |
| Transport | Stdio | Local process, optimal for Claude Code |
| CLI Execution | Child process spawn | Direct delegation to mdsel |

## External Dependencies

### Direct Dependency: mdsel

**Location**: Must be installed globally or accessible in PATH
**Version**: Latest (no specific version pinning in PRD)

**mdsel CLI Interface**:
```bash
mdsel index <files...> [--json]
mdsel select <selector> [files...] [--json]
```

**Key mdsel Output Structures**:
- Index: Returns `CLIResponse<IndexData>` with documents array, headings, blocks
- Select: Returns `CLIResponse<SelectData>` with matches array

### MCP SDK Dependency

**Package**: `@modelcontextprotocol/sdk`
**Purpose**: MCP server scaffolding, transport handlers, tool definitions

## Tool Surface

Exactly two tools:

1. **mdsel_index**: Selector inventory
2. **mdsel_select**: Content retrieval

No additional tools. This is a hard constraint from the PRD.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   MCP Client                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                       JSON-RPC 2.0                          │
│                            │                                 │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    mdsel-claude                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              MCP Server (Stdio Transport)              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │  │
│  │  │ mdsel_index │  │mdsel_select │  │ Reminder Hook │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                     Child Process                           │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      mdsel CLI                         │  │
│  │            (index | select) --json                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Statelessness Constraint

**Critical**: This server maintains NO state.

- No session memory
- No cached indices
- No document knowledge retention
- Each tool invocation is completely independent

This is a hard requirement from the PRD.

## Word Count Gating

**Environment Variable**: `MDSEL_MIN_WORDS`
**Default**: 200

The reminder system fires when:
1. A Markdown file would be accessed
2. File word count > MDSEL_MIN_WORDS

Word count is:
- Whitespace-delimited token count
- Calculated fresh each time (no caching)
- Mechanical, not semantic

## Reminder Hook System

**Trigger**: When Claude's Read tool is used on Markdown files exceeding threshold

**Note**: The PRD describes a reminder hook that fires when Claude uses Read. However, MCP servers cannot intercept Claude's built-in Read tool. The behavioral conditioning must be achieved through:
1. **Tool descriptions** that explicitly discourage Read usage
2. **Response messaging** that reminds Claude when appropriate

The actual implementation of the reminder hook will need to be reconsidered—it may need to be a Claude Code configuration hook rather than an MCP feature.

## Error Handling Philosophy

**Passthrough**: All errors from mdsel are returned verbatim.

mdsel-claude must NOT:
- Catch and rewrite errors
- Explain errors
- Suggest fixes
- Transform error messages

This preserves mdsel's error semantics exactly.
