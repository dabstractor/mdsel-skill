# PRP: Create SKILL.md with YAML Frontmatter

---

## Goal

**Feature Goal**: Create a self-contained `SKILL.md` file that defines the mdsel agent skill for both Claude Code and OpenCode platforms.

**Deliverable**: `.claude/skills/mdsel/SKILL.md` with valid YAML frontmatter and comprehensive instruction body.

**Success Definition**:
- File is created at `.claude/skills/mdsel/SKILL.md`
- YAML frontmatter is valid and parseable
- Skill is discoverable by both Claude Code and OpenCode
- Token overhead when inactive is <100 tokens (metadata only)
- Instruction body provides complete guidance for using mdsel CLI

---

## User Persona

**Target User**: AI coding agents (Claude Code, OpenCode) that need to efficiently access content from large Markdown files.

**Use Case**: When an agent needs to read a large Markdown file (>200 words), it should use mdsel's declarative selectors instead of the Read tool to avoid consuming excessive tokens.

**User Journey**:
1. Agent encounters task requiring Markdown file access
2. Skill is activated (manually or via trigger keywords: "markdown", "large files", "selector")
3. Agent loads skill instructions and learns mdsel usage patterns
4. Agent uses `mdsel index` to understand file structure
5. Agent uses `mdsel select` with declarative selectors to access specific content
6. Agent avoids full-file Read operations that waste tokens

**Pain Points Addressed**:
- Reading entire large Markdown files consumes 1000+ tokens unnecessarily
- No built-in way to select specific sections of Markdown in AI coding environments
- Existing MCP approach has ~1300 token overhead even when inactive

---

## Why

- **Token Efficiency**: Reduce baseline token consumption from ~1300 (MCP) to <100 (skill) when mdsel is not in use
- **Cross-Platform Compatibility**: Single skill definition works for both Claude Code and OpenCode (both recognize `.claude/skills/`)
- **Behavioral Conditioning**: Teach agents to use selector-based access patterns for large Markdown files
- **Declarative Access**: Enable precise content selection with simple selector syntax (`h1.0`, `h2.1`, etc.)

---

## What

Create a SKILL.md file that:

1. Defines skill metadata in YAML frontmatter
2. Provides Quick Start for mdsel CLI usage
3. Documents selector syntax reference
4. Explains when to use mdsel vs Read tool
5. Includes practical examples
6. Troubleshooting common issues

### Success Criteria

- [ ] YAML frontmatter validates correctly (can be parsed by PyYAML/gray-matter)
- [ ] `name` field is `mdsel` (lowercase, hyphen-separated)
- [ ] `description` includes trigger keywords: "markdown", "large files", "selector", "index", "select"
- [ ] `allowed-tools` is set to `["Bash"]` (mdsel is CLI-based)
- [ ] Description is <1024 characters
- [ ] Instruction body <500 lines
- [ ] Selector syntax documented with 0-based indexing
- [ ] MDSEL_MIN_WORDS threshold (default 200) documented
- [ ] Examples show both `mdsel index` and `mdsel select` usage

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**YES** - This PRP provides:
- Exact YAML frontmatter specification with field constraints
- Complete code examples for all sections
- Research file references with specific documentation
- Directory structure and file paths
- mdsel CLI interface assumptions (PRD-based)
- Selector syntax specification

### Documentation & References

```yaml
# MUST READ - Internal Project Documentation
- file: /home/dustin/projects/mdsel-skill/PRD.md
  why: Product requirements, selector syntax, word count threshold, hook system
  section: Sections 4-6 (Skill Definition, Word Count Gating, Reminder Hook System)
  critical: mdsel is NOT MCP-based; it's a CLI tool called via Bash

- file: /home/dustin/projects/mdsel-skill/plan/architecture/claude_code_skills.md
  why: Official Claude Code skills system specification
  section: YAML Frontmatter Fields, Skill Locations, Token Loading Model
  critical: .claude/skills/ works for BOTH Claude Code and OpenCode

- file: /home/dustin/projects/mdsel-skill/plan/architecture/external_deps.md
  why: mdsel CLI interface and selector syntax expectations
  section: Expected Interface, Selector Syntax (Inferred)
  critical: mdsel may not be publicly available; skill must handle missing CLI gracefully

- file: /home/dustin/projects/mdsel-skill/plan/architecture/implementation_notes.md
  why: Project structure, normative reminder text, implementation considerations
  section: File Structure, Normative Reminder Text, Installation Flow
  critical: Skill goes to .claude/skills/mdsel/SKILL.md for cross-platform compatibility

- file: /home/dustin/projects/mdsel-skill/plan/P1M1T1/research/claude_code_skills_research.md
  why: Comprehensive Claude Code skills system research with examples
  section: Official Examples (Example 1: Git Commit Skill, Example 2: Code Review Skill)
  pattern: Follow the structure: YAML frontmatter + instruction body with Usage/Reference/Examples sections

- file: /home/dustin/projects/mdsel-skill/plan/P1M1T1/research/yaml_frontmatter_research.md
  why: YAML frontmatter syntax, validation, best practices
  section: Delimiter Syntax, Common Field Types, Special Characters and Multi-line Strings
  gotcha: Description strings with backticks must use proper escaping; use `|` for multi-line descriptions

- file: /home/dustin/projects/mdsel-skill/plan/P1M1T1/research/mdsel_cli_research.md
  why: Expected mdsel CLI interface, selector syntax, similar tools
  section: Expected Commands, Expected Selector Syntax, Selector Patterns
  critical: Selector pattern is `<element-type>.<index>` with 0-based indexing (h1.0, h2.1, h3.0)

- file: /home/dustin/projects/mdsel-skill/plan/P1M1T1/research/agent_skill_examples_research.md
  why: Complete skill file templates and best practices
  section: Complete Skill File Templates, Section Organization Templates
  pattern: Use Quick Start / Reference / Examples / Troubleshooting structure

# EXTERNAL DOCUMENTATION (when web search available)
- url: https://docs.anthropic.com/claude-code/skills
  why: Official Claude Code skills documentation (most current reference)
  section: Skill file format, frontmatter fields, activation patterns

# REFERENCE IMPLEMENTATIONS (to be researched when available)
- url: https://github.com/anthropics/claude-skills
  why: Official Anthropic skill examples
  pattern: Study frontmatter structure and instruction body organization
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-skill
├── PRD.md                                    # Product requirements
├── tasks.json                                # Implementation backlog
└── plan/
    ├── architecture/
    │   ├── claude_code_skills.md            # Skills system spec
    │   ├── external_deps.md                 # mdsel CLI interface
    │   ├── implementation_notes.md          # Project structure
    │   ├── opencode_plugins.md              # OpenCode plugin spec
    │   └── system_context.md                # System architecture
    └── P1M1T1/
        └── PRP.md                           # This file
        └── research/
            ├── claude_code_skills_research.md     # Skills research
            ├── yaml_frontmatter_research.md       # YAML frontmatter
            ├── mdsel_cli_research.md              # CLI interface
            └── agent_skill_examples_research.md   # Skill templates
```

### Desired Codebase Tree (After Implementation)

```bash
/home/dustin/projects/mdsel-skill
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md                     # DELIVERABLE: Cross-platform skill definition
├── PRD.md
├── tasks.json
└── plan/
    └── (existing files...)
```

**File Responsibility**:
- `.claude/skills/mdsel/SKILL.md` - Cross-platform skill definition with YAML frontmatter and instruction body

### Known Gotchas & Library Quirks

```yaml
# CRITICAL: Claude Code vs OpenCode skill location
# Both platforms recognize .claude/skills/ - single installation works for both
# Do NOT create separate .opencode/skill/ files

# CRITICAL: mdsel CLI availability
# mdsel is NOT publicly available as of research date
# Skill must assume CLI exists; installation script will verify
# Use npx mdsel as fallback: npx mdsel index README.md

# CRITICAL: Selector syntax is 0-based indexing
# h1.0 = first h1, h2.1 = second h2
# NOT 1-based like typical UI numbering

# CRITICAL: allowed-tools must be ["Bash"]
# mdsel is CLI-based, not a direct tool
# Do NOT use Read tool in skill (read tool is what we're avoiding)

# CRITICAL: Description must include trigger keywords
# Keywords: "markdown", "large files", "selector", "index", "select"
# Without these, skill may not activate when needed

# CRITICAL: Token efficiency requirement
# Inactive overhead must be <100 tokens
# Achieved by metadata-only loading (frontmatter only)

# CRITICAL: YAML frontmatter delimiter placement
# --- must be at VERY beginning of file (no preceding whitespace)
# Closing --- must be on its own line

# CRITICAL: Backtick escaping in descriptions
# YAML strings can contain backticks without escaping
# But be consistent with quote style

# CRITICAL: MDSEL_MIN_WORDS environment variable
# Default threshold is 200 words
# Document this clearly in instruction body
```

---

## Implementation Blueprint

### Data Models and Structure

No ORM/Pydantic models needed - this is a static markdown file with YAML frontmatter.

YAML frontmatter structure:
```yaml
---
name: string           # "mdsel" - lowercase, hyphen-separated, max 64 chars
description: string    # Max 1024 chars, must include trigger keywords
allowed-tools: array   # ["Bash"] - restricts to Bash tool only
---
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE directory structure .claude/skills/mdsel/
  - IMPLEMENT: mkdir -p .claude/skills/mdsel/
  - FOLLOW: plan/architecture/claude_code_skills.md (Skill Locations section)
  - NAMING: All lowercase, hyphen-separated skill directory name
  - PLACEMENT: Project-level .claude/skills/ (not user-level ~/.claude/skills/)
  - DEPENDENCIES: None (first task)
  - OUTPUT: Empty directory ready for SKILL.md

Task 2: IMPLEMENT YAML frontmatter in SKILL.md
  - CREATE: .claude/skills/mdsel/SKILL.md
  - IMPLEMENT: YAML frontmatter block with --- delimiters
  - FOLLOW: plan/P1M1T1/research/claude_code_skills_research.md (Field Specifications)
  - FIELD: name: "mdsel"
  - FIELD: description: |
      Efficiently access large Markdown files using declarative selectors.
      Use mdsel CLI to index files and select specific content without reading entire documents.
      Triggered by: markdown, large files, selector, index, select.
  - FIELD: allowed-tools: ["Bash"]
  - GOTCHA: Description must include trigger keywords for skill activation
  - PLACEMENT: First thing in file (no preceding content)
  - OUTPUT: File with valid YAML frontmatter

Task 3: WRITE instruction body - Quick Start section
  - APPEND: Instruction body after YAML frontmatter
  - IMPLEMENT: ## Quick Start section with basic mdsel usage
  - FOLLOW: plan/P1M1T1/research/agent_skill_examples_research.md (Section Organization Templates)
  - CONTENT:
    - What is mdsel?
    - When to use it (MDSEL_MIN_WORDS threshold)
    - Basic command examples
  - PATTERN: Use code blocks for command examples
  - DEPENDENCIES: Task 2 (file must exist)
  - OUTPUT: Partial instruction body

Task 4: WRITE instruction body - Selector Syntax Reference
  - APPEND: ## Selector Syntax section
  - IMPLEMENT: Document selector pattern <element-type>.<index>
  - FOLLOW: plan/P1M1T1/research/mdsel_cli_research.md (Selector Syntax Patterns)
  - CONTENT:
    - h1.0, h2.1, h3.0 patterns
    - 0-based indexing (CRITICAL to document)
    - Element types (h1, h2, h3, etc.)
  - EXAMPLES: Show concrete selector examples
  - DEPENDENCIES: Task 3 (follows Quick Start)
  - OUTPUT: Expanded instruction body

Task 5: WRITE instruction body - When to Use section
  - APPEND: ## When to Use This Skill section
  - IMPLEMENT: Clear guidance on mdsel vs Read tool
  - FOLLOW: PRD.md Section 5 (Word Count Gating)
  - CONTENT:
    - MDSEL_MIN_WORDS environment variable (default 200)
    - Word count calculation (whitespace-delimited)
    - When Read tool is acceptable
    - When mdsel is required
  - CRITICAL: Emphasize NEVER use Read on large markdown files
  - DEPENDENCIES: Task 4 (follows Syntax Reference)
  - OUTPUT: Expanded instruction body

Task 6: WRITE instruction body - Examples section
  - APPEND: ## Examples section with progressive complexity
  - IMPLEMENT: Real-world usage scenarios
  - FOLLOW: plan/P1M1T1/research/agent_skill_examples_research.md (Complete Skill File Templates)
  - CONTENT:
    - Basic: Index and select single heading
    - Advanced: Multiple selections from same file
    - Edge case: File not found, invalid selector
  - PATTERN: Use bash code blocks with expected output
  - DEPENDENCIES: Task 5 (follows When to Use)
  - OUTPUT: Expanded instruction body

Task 7: WRITE instruction body - Troubleshooting section
  - APPEND: ## Troubleshooting section
  - IMPLEMENT: Common issues and solutions
  - FOLLOW: plan/P1M1T1/research/agent_skill_examples_research.md (Handling Edge Cases)
  - CONTENT:
    - mdsel command not found
    - Invalid selector syntax
    - File doesn't exist
    - npx fallback usage
  - PATTERN: Problem -> Solution format
  - DEPENDENCIES: Task 6 (follows Examples)
  - OUTPUT: Complete SKILL.md file

Task 8: VALIDATE YAML frontmatter
  - RUN: Python YAML validation script or yq CLI tool
  - IMPLEMENT: Use plan/P1M1T1/research/yaml_frontmatter_research.md (Testing YAML Frontmatter)
  - COMMAND: python3 -c "import yaml, re; content = open('.claude/skills/mdsel/SKILL.md').read(); fm = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL); print('Valid!' if yaml.safe_load(fm.group(1)) else 'Invalid')"
  - EXPECTED: "Valid!" output
  - DEPENDENCIES: Task 7 (complete file required)
  - OUTPUT: Validation confirmation

Task 9: VERIFY file placement and discoverability
  - CHECK: File exists at .claude/skills/mdsel/SKILL.md
  - VERIFY: YAML frontmatter has required fields (name, description, allowed-tools)
  - CONFIRM: Description includes trigger keywords
  - ENSURE: File is readable and <500 lines
  - DEPENDENCIES: Task 8 (validated frontmatter)
  - OUTPUT: Final verification checklist complete
```

### Implementation Patterns & Key Details

```markdown
<!-- CRITICAL: File must start with --- delimiter, no whitespace before -->
---
name: "mdsel"
description: |
  Efficiently access large Markdown files using declarative selectors.
  Use mdsel CLI to index files and select specific content without reading entire documents.
  Triggered by: markdown, large files, selector, index, select.
allowed-tools: ["Bash"]
---

# mdsel: Markdown Selector Skill

## Quick Start

<!-- PATTERN: Explain what, when, how in first section -->

This skill enables efficient access to large Markdown files using the `mdsel` CLI tool.

### When to Use

Use mdsel when:
- File word count exceeds **MDSEL_MIN_WORDS** (default: 200)
- You need specific sections, not the entire document
- Token efficiency is important

### Basic Usage

```bash
# Index a markdown file to understand its structure
mdsel index README.md

# Select specific content using declarative selectors
mdsel select h2.0 README.md    # First H2 heading
mdsel select h1.0 README.md    # First H1 heading
```

## Selector Syntax

<!-- CRITICAL: Document 0-based indexing clearly -->

mdsel uses **0-based indexing** with the pattern `<element-type>.<index>`:

| Selector | Description | Example |
|----------|-------------|---------|
| `h1.0` | First H1 heading | `# Title` |
| `h2.1` | Second H2 heading | `## Subtitle` (second occurrence) |
| `h3.0` | First H3 heading | `### Section` |

### Selector Examples

```bash
# Get the first H2 (typically "## Installation" or similar)
mdsel select h2.0 README.md

# Get the third H2 section
mdsel select h2.2 README.md
```

## When to Use This Skill

### Word Count Threshold

The **MDSEL_MIN_WORDS** environment variable controls when mdsel should be used:

```bash
# Set custom threshold (default is 200)
export MDSEL_MIN_WORDS=300
```

- **≤ threshold**: File may be read in full with Read tool
- **> threshold**: Use mdsel for selector-based access

### Decision Flow

1. File is Markdown (.md extension)?
2. Word count > MDSEL_MIN_WORDS?
3. **Yes**: Use `mdsel index` then `mdsel select`
4. **No**: Read tool is acceptable

## Examples

### Example 1: Basic Selection

```bash
# Step 1: Index the file to see available sections
mdsel index docs/API.md

# Step 2: Select the first H2 section (e.g., "## Authentication")
mdsel select h2.0 docs/API.md
```

### Example 2: Multiple Selections

```bash
# Index once
mdsel index README.md

# Select multiple sections
mdsel select h2.0 README.md  # Installation
mdsel select h2.1 README.md  # Usage
mdsel select h2.2 README.md  # API Reference
```

### Example 3: Using npx (if mdsel not installed)

```bash
# Use npx to run mdsel without installation
npx mdsel index README.md
npx mdsel select h1.0 README.md
```

## Troubleshooting

### "mdsel: command not found"

**Solution**: Install mdsel CLI or use npx:

```bash
# Install globally
npm install -g mdsel

# Or use npx without installation
npx mdsel index README.md
```

### "Invalid selector syntax"

**Solution**: Ensure selector uses `<type>.<index>` format with 0-based indexing:

- Correct: `h2.0`, `h1.1`
- Incorrect: `h2`, `h1[0]`, `h2_1`

### "File not found"

**Solution**: Use relative or absolute path:

```bash
# Relative path
mdsel index README.md

# Absolute path
mdsel index /home/user/project/README.md

# From different directory
mdsel index ./path/to/file.md
```

---

**Token Efficiency**: This skill loads only metadata (~50-100 tokens) when inactive. Full instructions load only when activated.
```

### Integration Points

```yaml
# No database or API integrations needed for this task

FILESYSTEM:
  - create: ".claude/skills/mdsel/" directory
  - create: ".claude/skills/mdsel/SKILL.md" file

CONFIGURATION:
  - add to: project root .claude/ directory
  - note: No config files needed (skill is self-contained)

HOOKS:
  - future: P1.M2 (Claude Code Hook Implementation)
  - future: P1.M3 (OpenCode Plugin Implementation)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Validate YAML frontmatter syntax
python3 << 'EOF'
import yaml
import re
import sys

file_path = ".claude/skills/mdsel/SKILL.md"
try:
    with open(file_path, 'r') as f:
        content = f.read()

    # Extract frontmatter
    fm_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
    match = fm_pattern.match(content)

    if not match:
        print("ERROR: No YAML frontmatter found")
        sys.exit(1)

    # Parse YAML
    frontmatter = yaml.safe_load(match.group(1))
    print("Valid YAML frontmatter!")
    print(f"Name: {frontmatter.get('name')}")
    print(f"Allowed tools: {frontmatter.get('allowed-tools')}")

except FileNotFoundError:
    print(f"ERROR: File not found: {file_path}")
    sys.exit(1)
except yaml.YAMLError as e:
    print(f"ERROR: Invalid YAML: {e}")
    sys.exit(1)
EOF

# Expected: "Valid YAML frontmatter!" + name and allowed-tools

# Check file placement
ls -la .claude/skills/mdsel/SKILL.md

# Expected: File exists at correct path

# Verify file size (<500 lines)
wc -l .claude/skills/mdsel/SKILL.md

# Expected: Line count < 500
```

### Level 2: Content Validation

```bash
# Verify required YAML fields exist
grep -E "^name:|description:|allowed-tools:" .claude/skills/mdsel/SKILL.md

# Expected: All three fields present

# Verify description includes trigger keywords
grep -E "markdown|large files|selector|index|select" .claude/skills/mdsel/SKILL.md

# Expected: At least 3 trigger keywords found

# Verify instruction body sections present
grep -E "^## (Quick Start|Selector Syntax|When to Use|Examples|Troubleshooting)" .claude/skills/mdsel/SKILL.md

# Expected: All 5 sections present

# Verify 0-based indexing is documented
grep "0-based" .claude/skills/mdsel/SKILL.md

# Expected: At least one mention of 0-based indexing

# Verify MDSEL_MIN_WORDS is documented
grep "MDSEL_MIN_WORDS" .claude/skills/mdsel/SKILL.md

# Expected: At least one mention with default value (200)
```

### Level 3: Cross-Platform Compatibility

```bash
# Verify skill location works for both platforms
# Both Claude Code and OpenCode recognize .claude/skills/

# Test file is readable
cat .claude/skills/mdsel/SKILL.md | head -20

# Expected: First 20 lines show YAML frontmatter + content start

# Verify no platform-specific content
# (skill should work identically on both platforms)
grep -i "claude code\|opencode" .claude/skills/mdsel/SKILL.md | wc -l

# Expected: Minimal mentions (if any, should be in context, not instructions)
```

### Level 4: Manual Testing (Future - when mdsel CLI available)

```bash
# These tests require mdsel CLI to be installed
# To be executed during P1.M2 (Hook Implementation) or later

# Test skill can be invoked
# In Claude Code: /skills should list mdsel
# In OpenCode: /skills should list mdsel

# Test skill activates on trigger keywords
# Prompt: "I need to access a large markdown file"
# Expected: mdsel skill loads

# Test mdsel commands work (if CLI installed)
mdsel index README.md
mdsel select h1.0 README.md

# Expected: Valid output from mdsel CLI
```

---

## Final Validation Checklist

### Technical Validation

- [ ] File exists at `.claude/skills/mdsel/SKILL.md`
- [ ] YAML frontmatter parses without errors
- [ ] Required fields present: `name`, `description`, `allowed-tools`
- [ ] `name` value is "mdsel"
- [ ] `allowed-tools` value is `["Bash"]`
- [ ] Description < 1024 characters
- [ ] File < 500 lines
- [ ] No syntax errors in markdown

### Content Validation

- [ ] Description includes trigger keywords: markdown, large files, selector, index, select
- [ ] Quick Start section explains what mdsel is
- [ ] Selector Syntax section documents `<type>.<index>` pattern
- [ ] 0-based indexing clearly documented
- [ ] When to Use section explains MDSEL_MIN_WORDS threshold (default 200)
- [ ] Examples section shows `mdsel index` and `mdsel select` usage
- [ ] Troubleshooting section covers common issues
- [ ] npx fallback documented

### Feature Validation

- [ ] Skill is self-contained (no external file dependencies)
- [ ] Works cross-platform (Claude Code and OpenCode)
- [ ] Token efficiency maintained (metadata-only loading)
- [ ] Instructions are clear and actionable
- [ ] No platform-specific tools referenced (only Bash)
- [ ] Reminder hook behavior mentioned (for future P1.M2 integration)

### Code Quality Validation

- [ ] Follows PRD specifications exactly
- [ ] Matches research findings from plan/P1M1T1/research/
- [ ] Consistent with project architecture (plan/architecture/*.md)
- [ ] YAML frontmatter follows best practices
- [ ] Markdown formatting is consistent
- [ ] Code examples use proper syntax highlighting

---

## Anti-Patterns to Avoid

- [ ] Don't use Read tool examples in the skill (we're teaching agents to AVOID Read)
- [ ] Don't include platform-specific instructions (keep cross-platform)
- [ ] Don't exceed 1024 character description limit
- [ ] Don't use 1-based indexing in examples (mdsel is 0-based)
- [ ] Don't forget to document MDSEL_MIN_WORDS environment variable
- [ ] Don't assume mdsel is globally installed (document npx fallback)
- [ ] Don't create separate OpenCode skill file (single SKILL.md works for both)
- [ ] Don't use MCP tool references (this is NOT an MCP implementation)
- [ ] Don't exceed 500 lines total (token efficiency requirement)
- [ ] Don't use ambiguous selector examples (be explicit about h1.0 vs h2.1)

---

## Confidence Score

**9/10** - One-pass implementation success likelihood is very high

**Rationale**:
- Comprehensive research documentation available
- Clear specification from PRD and architecture docs
- Specific examples and templates from research
- Single file deliverable with no complex dependencies
- Validation commands are straightforward

**Risk Mitigation**:
- Only risk is mdsel CLI not being available for testing
- Mitigated by clear specification in PRD and expected interface documentation
- Installation script (P1.M4) will handle CLI verification

---

*PRP Version: 1.0*
*Created: 2025-12-30*
*Task: P1.M1.T1 - Create SKILL.md with YAML Frontmatter*
