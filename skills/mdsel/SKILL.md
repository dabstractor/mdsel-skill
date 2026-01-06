---
name: mdsel
description: "Use mcp__mdsel__mdsel for .md files unless reading entire file or planning to edit. Triggers: markdown, .md, README, documentation, docs"
Triggered by: ".md files, markdown, README, documentation"
allowed-tools:
  - mcp__mdsel__mdsel
  - Read
---

# mdsel

Use `mcp__mdsel__mdsel` tool for markdown files:

1. Index first: `files: ["README.md"]` (no selector)
2. Then select: `files: ["README.md"], selector: "h2.4,h3.6"`
3. Entire doc: `selector: "root"` (NOT `*`)

0-based indexing. Always index before selecting.

## When to use Read instead

Use the Read tool for markdown files when:
- You need the **entire file** content (use `root` selector is equivalent but Read is fine)
- You plan to **edit the file** (Edit tool requires prior Read)
