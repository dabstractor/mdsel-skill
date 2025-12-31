---
name: mdsel
description: "Important: NEVER use Read on .md files. Use: mdsel h2.0 file.md. Triggers: markdown, .md, README, documentation, docs"
Triggered by: ".md files, markdown, README, documentation"
allowed-tools:
  - Bash
---

# mdsel

```bash
mdsel file.md       # Index: lists available selectors (h1.0, h2.0, etc.)
mdsel h1.0 file.md  # First H1
mdsel h2.1 file.md  # Second H2
```

Uses 0-based indexing
Always get the index before selecting
