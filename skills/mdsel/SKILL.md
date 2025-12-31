---
name: mdsel
description: "Important: NEVER use Read on .md files. Use mcp__mdsel__mdsel instead. Triggers: markdown, .md, README, documentation, docs"
Triggered by: ".md files, markdown, README, documentation"
allowed-tools:
  - mcp__mdsel__mdsel
---

# mdsel

Use `mcp__mdsel__mdsel` tool (NOT Bash, NOT Read):

1. Index first: `files: ["README.md"]` (no selector)
2. Then select: `files: ["README.md"], selector: "h2.0"`

0-based indexing. Always index before selecting.
