# PRD: `mdsel-claude`

**Claude Code Adapter with Behavioral Enforcement for Selector-Based Markdown Access**

---

## 1. Purpose & Scope

`mdsel-claude` is a **Claude Code–specific integration layer** that conditions Claude agents to access Markdown documents via **declarative selectors** instead of full-file reads.

This project exists to:

- Expose `mdsel` as first-class Claude Code tools
- Actively discourage misuse of Claude’s default `Read` tool on Markdown files
- Enforce a selector-first access pattern while remaining **stateless**, **thin**, and **mechanical**
- Preserve the core philosophy of `mdsel`: minimal tokens, no inference, no summarization

This project does **not** modify `mdsel`.
It **does not** reinterpret document semantics.
It exists solely to shape _agent behavior_.

---

## 2. Design Philosophy

### 2.1 Behavioral Conditioning, Not Capability Expansion

Claude Code already has powerful primitives (`Read`, tools, system messages).
`mdsel-claude` does not replace them — it **biases usage** toward selector-based access.

This tool:

- Nudges
- Reminds
- Conditions
- Never enforces via hard failure

---

### 2.2 Selector Discipline Is Mandatory

For Markdown documents above a configurable size threshold:

- Using `Read` is considered **incorrect usage**
- Claude is reminded **every time** this occurs
- Selector-based access is treated as **required**, not optional

---

### 2.3 Extreme Thinness

`mdsel-claude` is intentionally minimal:

- No Markdown parsing
- No selector validation
- No caching
- No heuristics beyond word-count gating
- No state

All real work is delegated to `mdsel`.

---

## 3. Dependency Model

- **Direct dependency**: `mdsel`
- `mdsel` is authoritative for:
  - Parsing
  - Selector grammar
  - Output format
  - Error behavior

`mdsel-claude` must not diverge from `mdsel` semantics in any way.

---

## 4. Tool Surface (Claude Code)

Exactly **two tools** are exposed to Claude Code.

No more.
No fewer.

---

### 4.1 Tool: `mdsel_index`

#### Purpose

Return a selector inventory for one or more Markdown documents.

#### Behavior

- Passes file paths directly to `mdsel index`
- Returns structured JSON exactly as emitted by `mdsel`
- No post-processing

#### Intended Usage

This tool is always called **before** any selection when working with non-trivial Markdown documents.

---

### 4.2 Tool: `mdsel_select`

#### Purpose

Retrieve specific document content using declarative selectors.

#### Behavior

- Passes selectors directly to `mdsel select`
- Returns structured JSON exactly as emitted by `mdsel`
- No summarization
- No interpretation
- No transformation

---

## 5. Word Count Gating (Critical)

### 5.1 Environment Variable

A configurable environment variable controls when `mdsel` should be preferred over `Read`.

```
MDSEL_MIN_WORDS
```

#### Default Value

```
200
```

---

### 5.2 Gating Rules

When a Markdown file is accessed:

- If total word count **≤ MDSEL_MIN_WORDS**
  - The file may be returned in full
  - `mdsel` may be bypassed
  - No reminder is issued

- If total word count **> MDSEL_MIN_WORDS**
  - Selector-based access is required
  - `Read` usage is considered incorrect
  - Reminder hook fires **every time**

Word count is:

- Mechanical
- Based on whitespace-delimited tokens
- Not semantic
- Not cached across sessions

---

## 6. Reminder Hook System

### 6.1 Trigger Conditions

A reminder is injected when **all** of the following are true:

1. Claude invokes the `Read` tool
2. Target file is a Markdown file supported by `mdsel`
3. File word count exceeds `MDSEL_MIN_WORDS`

---

### 6.2 Reminder Frequency

- Fires **every time**
- No suppression
- No “first warning only” behavior

Repetition is intentional and considered a feature.

---

### 6.3 Reminder Content (Normative)

Reminder messages must be:

- Short
- Neutral
- Identical every time
- Non-judgmental
- Non-negotiable in tone

Canonical wording:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

No variation is allowed.

---

## 7. Tool Description Requirements (Claude-Facing)

The tool description must:

- Explicitly state that `Read` should not be used for large Markdown files
- Include a minimal selector grammar
- Describe the canonical usage sequence:
  1. `mdsel_index`
  2. `mdsel_select`

- Avoid philosophy, justification, or marketing language

The tool description is considered **behavior-shaping infrastructure** and must be treated as part of the system design.

---

## 8. Error Handling

### 8.1 Selector Errors

- Invalid selectors
- Ambiguous selectors
- Missing documents

All such errors are returned **verbatim** from `mdsel`.

`mdsel-claude` must not:

- Catch
- Rewrite
- Explain
- Suggest fixes

---

### 8.2 Partial Results

If `mdsel` returns partial results, they are passed through unchanged.

---

## 9. Statelessness

- No session memory
- No cached indices
- No retained document knowledge
- Each invocation is independent

---

## 10. Non-Goals (Explicit)

This project will **not**:

- Summarize content
- Interpret semantics
- Validate selectors
- Track agent behavior
- Persist state
- Optimize performance beyond delegation
- Introduce new selector concepts

---

## 11. Success Criteria

`mdsel-claude` is successful if:

- Claude Code agents stop reading full Markdown files
- Agents reliably index before selecting
- Token usage drops significantly for large documents
- No divergence from `mdsel` output is observed
