---
name: mdsel
description: "Markdown selective reader. Run `mdsel <file>` via bash to get a table of contents (headings + structure) in a fraction of the tokens — use it for overviews, navigation, or when you only need specific sections. Also supports fuzzy search by keyword. Only use read when you need full file content or plan to edit. Triggers: markdown, .md, README, documentation, docs, overview, table of contents"
---

# mdsel

`mdsel` is a markdown selective reader with three modes:

1. **Index** (no selector) — returns a table of contents with all headings and available selectors. This IS an overview.
2. **Select** — returns only the matched sections by selector path.
3. **Search** — fuzzy match a keyword against headings, returns matching selectors.

### Workflow

1. Index first: `mdsel README.md` (no selector) → get the TOC
2. Then either:
   - **Select**: `mdsel "h2.4,h3.6" README.md` — grab specific sections
   - **Search**: `mdsel "installation" README.md` — fuzzy-find by keyword

0-based indexing. Always index before selecting.

**NEVER use the `*` wildcard selector.** If you need the entire document, use the Read tool instead — that's what it's for. The purpose of mdsel is selective reading to save tokens.

## When to use Read instead

Use the Read tool for markdown files when:
- You need the **entire file** content (don't use mdsel with `*` or `root` — just use Read)
- You plan to **edit the file** (Edit tool requires prior Read)
