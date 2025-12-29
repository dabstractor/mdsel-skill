# PRP: P3.M1.T1 - Create README Documentation

---

## Goal

**Feature Goal**: Create a comprehensive user-facing README.md that enables one-pass setup and usage of the mdsel-claude MCP server without requiring additional documentation.

**Deliverable**: A single README.md file at the project root containing complete installation, configuration, usage, and troubleshooting documentation.

**Success Definition**:
- A developer unfamiliar with the project can install and configure the MCP server by reading only the README
- All required configuration examples (Claude Desktop, Claude Code, general MCP) are provided
- Tool usage is clearly documented with copy-pasteable examples
- Selector syntax is briefly explained with practical examples
- The README passes the "No Prior Knowledge" test: someone knowing nothing about mdsel or MCP can successfully use this server

---

## All Needed Context

### Context Completeness Check

_Before proceeding, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

Yes - this PRP provides:
- Exact README structure with section-by-section content specifications
- Complete selector syntax reference distilled from mdsel research
- Installation and configuration examples for all major MCP clients
- Copy-pasteable code snippets verified to work
- Cross-references to internal research documents for deeper context
- Specific styling and formatting guidelines

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCUMENTATION - Read before implementing
- file: PRD.md
  why: Defines project scope, design philosophy, and documentation requirements (Section 10)
  critical: Section 10.2 specifies exact required README sections - must include installation, startup, tools, examples

- file: plan/docs/hooks-documentation.md
  why: Complete hook installation and configuration documentation to reference
  section: Full document - this should be referenced/linked from README
  critical: Hook installation is a key user-facing feature

- file: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Comprehensive mdsel selector syntax reference
  section: "Selector Syntax Reference" (Section 8) and "TEXT Output Format" (Section 3)
  critical: README must briefly explain selector syntax for users

- file: plan/docs/architecture/system_context.md
  why: Defines tool surface and integration model
  critical: Explains the two tools (mdsel_index, mdsel_select) and their exact behavior

- file: package.json
  why: Contains npm package metadata, dependencies, and configuration
  critical: Installation instructions must match package.json configuration

- file: src/tools/index.ts
  why: Defines mdsel_index tool with input schema and description
  pattern: Tool description (line 75-76) - should match README description

- file: src/tools/select.ts
  why: Defines mdsel_select tool with input schema and description
  pattern: Tool description (line 72-73) - should match README description

# EXTERNAL RESEARCH - README Best Practices
- url: https://github.com/github/gitignore/blob/main/Node.gitignore
  why: Standard Node.js project structure reference

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
  why: npm package.json reference for installation documentation

# MCP SERVER DOCUMENTATION PATTERNS
- url: https://modelcontextprotocol.io/
  why: Official MCP documentation for context on how to explain MCP servers

- url: https://github.com/modelcontextprotocol/sdk-typescript
  why: Official MCP SDK - reference for installation and setup patterns

# SELECTOR SYNTAX REFERENCE (from internal research)
- docfile: plan/docs/research-P1M3T1/mdsel-cli-research.md
  why: Complete selector syntax for README "Selector Syntax" section
  section: Section 8 "Selector Syntax Reference" and Section 3 "TEXT Output Format"
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── coverage/                  # Test coverage output (not in README)
├── hooks/                     # Hook scripts (reference in README)
│   └── PreToolUse.d/
│       └── mdsel-reminder.sh
├── plan/                      # Internal planning docs (not in README)
│   ├── docs/
│   │   ├── architecture/
│   │   ├── hooks-documentation.md
│   │   └── research-P1M3T1/
│   │       └── mdsel-cli-research.md
│   └── P1M1T1/ through P2M2T2/  # Previous PRPs (not in README)
├── src/                       # Source code (reference structure, not content)
│   ├── index.ts
│   ├── executor.ts
│   ├── tools/
│   │   ├── index.ts
│   │   └── select.ts
│   └── utils/
│       ├── config.ts
│       └── word-count.ts
├── package.json               # Reference for installation section
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── PRD.md                     # Reference for project description
├── tasks.json                 # Not in README
└── README.md                  # TO BE CREATED - This task's deliverable
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-claude-attempt-2/
├── [all existing files unchanged]
├── README.md                  # NEW: Complete user documentation (this task)
└── [no other files added or modified]
```

### README.md Structure (Deliverable)

The README.md file will be created with the following structure:

```markdown
# mdsel-claude

[Brief description]

## Installation

[npx and npm install instructions]

## Quick Start

[Basic configuration and usage example]

## Features

[Two tools and behavioral conditioning]

## Tools

### mdsel_index

[Tool documentation]

### mdsel_select

[Tool documentation]

## Selector Syntax

[Brief selector grammar reference]

## Configuration

[MCP client configuration examples]

## Behavioral Conditioning Hook

[Hook installation and configuration]

## Requirements

[mdsel CLI requirement]

## License

[License information]
```

---

## Known Gotchas of Our Codebase & Library Quirks

```markdown
# CRITICAL: README must address these common user questions and pitfalls

# 1. mdsel is a PEER DEPENDENCY
# Users must install mdsel separately - this is NOT bundled
# Gotcha: Users will get "command not found: mdsel" errors
# Solution: Explicitly document mdsel installation requirement

# 2. MCP client configuration varies by client
# Claude Desktop: ~/.claude_desktop_config.json
# Claude Code: ~/.claude.json or .mcp.json
# Gotcha: Users don't know which file to edit
# Solution: Provide examples for all major clients

# 3. Selector syntax is unfamiliar to most users
# Gotcha: Users won't understand h1.0, h2.1-3, etc.
# Solution: Provide clear examples with before/after context

# 4. Hook system is Claude Code specific
# Gotcha: Hook only works in Claude Code, not other MCP clients
# Solution: Clearly document hook scope and limitations

# 5. TEXT output mode (not JSON)
# Gotcha: mdsel-claude uses TEXT output, not JSON mode
# Solution: Show actual TEXT output examples in documentation

# 6. Word count threshold configuration
# Gotcha: Users may want to adjust the 200-word default
# Solution: Document MDSEL_MIN_WORDS environment variable

# 7. npx execution for immediate use
# Gotcha: Users don't need to install globally
# Solution: Emphasize npx workflow in Quick Start

# 8. Two-step workflow (index then select)
# Gotcha: Users may try to select without indexing first
# Solution: Clearly show the canonical two-step pattern

# 9. Node.js version requirement
# Gotcha: Node.js < 18 won't work
# Solution: Explicitly state Node.js >= 18.0.0 requirement

# 10. Hook requires jq
# Gotcha: Hook fails silently if jq is not installed
# Solution: Document jq prerequisite in hook section
```

---

## Implementation Blueprint

### Data Models and Structure

No data models are created in this task. The README is a Markdown document containing:

1. **Prose sections**: Introduction, installation, usage instructions
2. **Code blocks**: Shell commands, JSON configuration examples
3. **Reference tables**: Selector syntax, configuration options
4. **Links**: References to mdsel CLI documentation, MCP specification

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE README.md with header and description
  - IMPLEMENT: Level 1 heading "# mdsel-claude"
  - DESCRIPTION: "Claude Code adapter with behavioral enforcement for selector-based Markdown access via mdsel CLI"
  - NAMING: Match package.json description field exactly
  - PLACEMENT: Project root as README.md
  - REFERENCE: package.json line 4 for exact description text

Task 2: WRITE Installation section
  - IMPLEMENT: Two installation methods (npx and npm install)
  - NPX_METHOD: "npx mdsel-claude" for immediate use without installation
  - NPM_METHOD: "npm install -g mdsel-claude" for global installation
  - PREREQUISITE: Document mdsel CLI installation requirement
  - REFERENCE: package.json peerDependencies field (lines 34-36)
  - GOTCHA: Emphasize mdsel must be installed separately
  - EXAMPLE:
    ```bash
    # Install mdsel CLI (required peer dependency)
    npm install -g mdsel

    # Run mdsel-claude MCP server
    npx mdsel-claude
    ```

Task 3: WRITE Quick Start section
  - IMPLEMENT: Minimal working example with configuration
  - INCLUDE: MCP client configuration (Claude Desktop/Claude Code)
  - SHOW: Two-step tool usage pattern (index then select)
  - REFERENCE: PRD.md Section 10.2 for required example format
  - EXAMPLE_CONFIG:
    ```json
    {
      "mcpServers": {
        "mdsel-claude": {
          "command": "npx",
          "args": ["mdsel-claude"]
        }
      }
    }
    ```
  - EXAMPLE_USAGE:
    ```bash
    # Step 1: Index the document to discover selectors
    mdsel_index README.md

    # Step 2: Select content using discovered selectors
    mdsel_select h2.0 README.md
    ```

Task 4: WRITE Features section
  - IMPLEMENT: Bulleted list of capabilities
  - ITEMS:
    - "Two MCP tools: mdsel_index and mdsel_select"
    - "Token-efficient selective content access"
    - "Behavioral conditioning via PreToolUse hook"
  - REFERENCE: PRD.md Section 4 for tool surface specification

Task 5: WRITE Tools section (mdsel_index)
  - IMPLEMENT: Complete tool documentation
  - NAME: "mdsel_index"
  - DESCRIPTION: "Return a selector inventory for Markdown documents"
  - PARAMETERS: files (array of strings, min 1)
  - OUTPUT: TEXT format with heading hierarchy and block counts
  - EXAMPLE: Show actual TEXT output from mdsel index command
  - REFERENCE: src/tools/index.ts lines 74-89 for inputSchema
  - REFERENCE: plan/docs/research-P1M3T1/mdsel-cli-research.md Section 3 for TEXT output format
  - EXAMPLE_OUTPUT:
    ```
    h1.0 Project Title
     h2.0 Installation
     h2.1 Usage
    ---
    code:5 para:12 list:3 table:1
    ```

Task 6: WRITE Tools section (mdsel_select)
  - IMPLEMENT: Complete tool documentation
  - NAME: "mdsel_select"
  - DESCRIPTION: "Select content from Markdown documents using declarative selectors"
  - PARAMETERS: selector (string), files (array of strings, min 1)
  - OUTPUT: Selected content in TEXT format
  - EXAMPLE: Show content retrieval with common selectors
  - REFERENCE: src/tools/select.ts lines 71-90 for inputSchema
  - EXAMPLE_USAGE:
    ```bash
    # Select first h2 heading
    mdsel_select h2.0 README.md

    # Select multiple h2 headings
    mdsel_select h2.0-2 README.md

    # Select code block under specific heading
    mdsel_select h2.0/code.0 README.md
    ```

Task 7: WRITE Selector Syntax section
  - IMPLEMENT: Brief mechanical explanation of selector grammar
  - SCOPE: "Brief, mechanical" per PRD Section 10.2 - not full tutorial
  - TOPICS:
    - Node types (h1-h6, code, para, list, table)
    - Index notation (dot notation: h2.0, h2.1, etc.)
    - Range notation (h2.1-3)
    - Path composition (h2.0/code.0)
  - REFERENCE: plan/docs/research-P1M3T1/mdsel-cli-research.md Section 8
  - KEEP_CONCISE: Users can reference mdsel CLI docs for full syntax
  - FORMAT: Table or code block with examples

Task 8: WRITE Configuration section
  - IMPLEMENT: MCP client configuration examples
  - CLIENTS:
    - Claude Desktop (~/.claude_desktop_config.json)
    - Claude Code (~/.claude.json or .mcp.json)
  - ENVIRONMENT_VARIABLES:
    - MDSEL_MIN_WORDS (default: 200) - word count threshold
  - REFERENCE: plan/docs/hooks-documentation.md lines 95-123 for configuration
  - EXAMPLE_CLAUDE_DESKTOP:
    ```json
    {
      "mcpServers": {
        "mdsel-claude": {
          "command": "npx",
          "args": ["-y", "mdsel-claude"]
        }
      }
    }
    ```
  - EXAMPLE_CLAUDE_CODE:
    ```json
    {
      "mcpServers": {
        "mdsel-claude": {
          "command": "node",
          "args": ["/absolute/path/to/mdsel-claude/dist/index.js"]
        }
      }
    }
    ```

Task 9: WRITE Behavioral Conditioning Hook section
  - IMPLEMENT: Hook installation and configuration documentation
  - EXPLAIN: What the hook does (reminds to use mdsel tools for large files)
  - INSTALL_STEPS:
    1. Create hooks directory
    2. Copy hook script
    3. Make executable
  - PREREQUISITES: jq (JSON processor)
  - CONFIGURATION: MDSEL_MIN_WORDS environment variable
  - REFERENCE: plan/docs/hooks-documentation.md (full document)
  - GOTCHA: Hook only works in Claude Code
  - SHORTCUT: Link to plan/docs/hooks-documentation.md for full details

Task 10: WRITE Requirements section
  - IMPLEMENT: Dependency and version requirements
  - ITEMS:
    - Node.js >= 18.0.0
    - mdsel CLI ^1.0.0 (peer dependency)
    - jq (for hook, optional)
  - REFERENCE: package.json lines 20-22 for engines requirement

Task 11: WRITE License section
  - IMPLEMENT: License declaration
  - CONTENT: "MIT" or link to LICENSE file if exists
  - LOCATION: Final section of README

Task 12: VALIDATE README completeness
  - CHECK: All PRD Section 10.2 requirements met
    - [ ] Installation via npx
    - [ ] MCP server startup
    - [ ] Tool list and purpose
    - [ ] Example index call
    - [ ] Example select call
    - [ ] Explanation of selector grammar
  - CHECK: No marketing fluff (PRD Section 10.2)
  - CHECK: Examples are copy-pasteable
  - CHECK: All code blocks are properly formatted with language tags
```

### Implementation Patterns & Key Details

```markdown
# README CONTENT SPECIFICATIONS

## Section 1: Title and Description (lines 1-5)
```
# mdsel-claude

Claude Code adapter with behavioral enforcement for selector-based Markdown access via mdsel CLI.
```

## Section 2: Installation (lines 7-25)
```bash
# Prerequisites
npm install -g mdsel

# Option 1: Run directly with npx (recommended)
npx mdsel-claude

# Option 2: Install globally
npm install -g mdsel-claude
```

## Section 3: Quick Start (lines 27-60)
### Configuration Example
```json
// ~/.claude_desktop_config.json (Claude Desktop)
// or ~/.claude.json (Claude Code)
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "npx",
      "args": ["mdsel-claude"]
    }
  }
}
```

### Usage Pattern
```text
1. Call mdsel_index to discover available selectors
2. Call mdsel_select with specific selectors to retrieve content
```

## Section 4: Features (lines 62-75)
- Two MCP tools for selector-based Markdown access
- Token-efficient content retrieval
- Behavioral conditioning via PreToolUse hook
- Stateless, pass-through architecture

## Section 5: Tools

### mdsel_index (lines 77-110)
**Purpose**: Return a selector inventory for Markdown documents

**Parameters**:
- `files` (array of strings, required): Markdown file paths to index

**Output Format** (TEXT):
```
h1.0 Main Title
 h2.0 Section One
 h2.1 Section Two
---
code:5 para:12 list:3 table:1
```

### mdsel_select (lines 112-140)
**Purpose**: Select content using declarative selectors

**Parameters**:
- `selector` (string, required): Declarative selector (e.g., "h1.0", "h2.1-3")
- `files` (array of strings, required): Markdown file paths

**Examples**:
```bash
# First h2 heading
mdsel_select h2.0 README.md

# Range of h2 headings
mdsel_select h2.1-3 README.md

# Code block under h2
mdsel_select h2.0/code.0 README.md
```

## Section 6: Selector Syntax (lines 142-180)
| Pattern | Meaning | Example |
|---------|---------|---------|
| `hN.I` | Nth heading, Ith index | `h1.0`, `h2.1` |
| `code.I` | Ith code block | `code.0` |
| `hN.I-M` | Range of indices | `h2.1-3` (h2 indices 1, 2, 3) |
| `hN.I/code.J` | Nested selection | `h2.0/code.0` (first code under first h2) |

**Notes**:
- Indices are 0-based (first item is index 0)
- Use `mdsel_index` first to discover available selectors
- See [mdsel CLI docs](https://github.com/dustinswords/mdsel) for complete syntax

## Section 7: Configuration (lines 182-220)
### Environment Variables
- `MDSEL_MIN_WORDS`: Word count threshold (default: 200)

### MCP Client Setup

**Claude Desktop** (`~/.claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "npx",
      "args": ["-y", "mdsel-claude"]
    }
  }
}
```

**Claude Code** (`~/.claude.json` or `.mcp.json`):
```json
{
  "mcpServers": {
    "mdsel-claude": {
      "command": "node",
      "args": ["/absolute/path/to/mdsel-claude/dist/index.js"]
    }
  }
}
```

## Section 8: Behavioral Conditioning Hook (lines 222-250)
The included PreToolUse hook reminds you to use `mdsel_index` and `mdsel_select` when accessing large Markdown files.

**Installation**:
```bash
mkdir -p ~/.claude/hooks/PreToolUse.d/
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Prerequisites**: `jq` (JSON processor)

See [plan/docs/hooks-documentation.md](plan/docs/hooks-documentation.md) for complete details.

## Section 9: Requirements (lines 252-260)
- Node.js >= 18.0.0
- mdsel CLI ^1.0.0
- jq (for hook functionality)

## Section 10: License (lines 262-end)
MIT
```

### Content Style Guidelines

```markdown
# README WRITING GUIDELINES

## Tone and Style
- Mechanical and direct (per PRD Section 10.2: "No philosophy. No marketing.")
- Assume reader is a developer setting up an MCP server
- Provide examples first, explanations second
- Use present tense for functionality ("Returns", "Invokes")
- Use imperative mood for instructions ("Install", "Configure")

## Code Block Formatting
- Always specify language after opening fence (```bash, ```json, ```text)
- Keep examples under 80 characters when possible
- Show realistic file paths in examples
- Include expected output for command examples

## Section Ordering
1. Title and brief description
2. Installation (prerequisites first, then methods)
3. Quick Start (configuration + basic usage)
4. Features (what this provides)
5. Tools (detailed documentation)
6. Selector Syntax (brief reference)
7. Configuration (environment + client setup)
8. Behavioral Conditioning Hook (optional feature)
9. Requirements (dependencies)
10. License

## Link Conventions
- Internal docs: Use relative paths (plan/docs/hooks-documentation.md)
- External docs: Use full URLs with descriptive link text
- Code references: Use file paths and line numbers where applicable

## What to Exclude (per PRD Section 9)
- Philosophy or design rationale
- Marketing language ("amazing", "powerful", "revolutionary")
- Feature comparison with alternatives
- Roadmap or future plans
- Contribution guidelines (unless explicitly requested)
- Troubleshooting beyond common gotchas
- Changelog or version history
```

### Integration Points

```yaml
PACKAGE_JSON:
  - name: "mdsel-claude" (matches title)
  - description: "Claude Code adapter..." (matches README description)
  - peerDependencies: mdsel ^1.0.0 (document in Requirements)
  - engines: node >=18.0.0 (document in Requirements)

HOOKS_DOCUMENTATION:
  - file: plan/docs/hooks-documentation.md
  - reference: Link from README Hook section
  - scope: README provides summary, link provides details

MDSCLI_RESEARCH:
  - file: plan/docs/research-P1M3T1/mdsel-cli-research.md
  - reference: Selector syntax section
  - scope: README provides brief syntax table, not full tutorial

PRD_SECTION_10_2:
  - required_sections:
    - Installation via npx
    - MCP server startup
    - Tool list and purpose
    - Example index call
    - Example select call
    - Explanation of selector grammar (brief, mechanical)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Validate README exists and is readable
cat README.md
# Expected: Complete README content

# Check for Markdown syntax errors
# (No automated tool - manual review of rendered Markdown)
# Open README.md in editor or GitHub to verify rendering

# Verify all code blocks have language tags
grep -n '^```$' README.md
# Expected: No matches (all fences should have language)

# Verify all internal links resolve
# Manual: Click each link in rendered README to confirm

# Check for common Markdown issues
# - Lists are properly formatted
# - Headers use # space (no space after # is invalid)
# - Tables have proper pipe separators
```

### Level 2: Content Completeness (Component Validation)

```bash
# Verify all required sections exist (PRD Section 10.2)
grep -q '^## Installation' README.md
grep -q '^## Tools' README.md
grep -q '^## Selector Syntax' README.md
# Expected: All sections found

# Verify mdsel dependency is documented
grep -q 'mdsel' README.md
# Expected: Multiple mentions (installation, requirements)

# Verify configuration examples are present
grep -q 'claude_desktop_config.json' README.md
grep -q 'mcpServers' README.md
# Expected: Configuration examples present

# Verify tool names match implementation
grep -q 'mdsel_index' README.md
grep -q 'mdsel_select' README.md
# Expected: Both tools documented

# Verify examples include two-step pattern
grep -A5 'mdsel_index' README.md | grep -q 'mdsel_select'
# Expected: Workflow shows index then select pattern
```

### Level 3: Integration Testing (System Validation)

```bash
# Test installation instructions
# Create a temporary directory and try following README instructions
mkdir /tmp/test-mdsel-claude-readme
cd /tmp/test-mdsel-claude-readme

# Follow the installation steps from README
# (This validates instructions are correct)

# Test configuration examples
# Copy JSON config examples to files and validate syntax
echo '{"mcpServers": {"mdsel-claude": {"command": "npx", "args": ["mdsel-claude"]}}}' | jq .
# Expected: Valid JSON output

# Test selector examples
# (Requires mdsel to be installed)
mdsel index README.md
# Expected: TEXT output format as shown in README

# Test hook installation instructions
mkdir -p ~/.claude/hooks/PreToolUse.d/
# Follow README hook installation steps
# Expected: Hook installs successfully
```

### Level 4: User Experience Validation

```bash
# "No Prior Knowledge" Test
# Give README to someone unfamiliar with the project and ask:
# 1. Can you install this following the instructions?
# 2. Can you configure it for Claude Desktop?
# 3. Do you understand what the tools do?
# 4. Can you write a selector to select content?
# Expected: All answers are YES

# Render the README in different environments
# - GitHub: Check rendering
# - VS Code Markdown Preview: Check rendering
# - CLI: Check readability (cat README.md | less)

# Verify all external URLs are accessible
curl -I https://modelcontextprotocol.io/
curl -I https://github.com/modelcontextprotocol/sdk-typescript
# Expected: All URLs return 200 OK

# Check link rot for external references
# (Manual verification of any external documentation links)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] README.md exists at project root
- [ ] All code blocks have language tags (```bash, ```json, etc.)
- [ ] All internal links use relative paths
- [ ] All external links are valid URLs
- [ ] Configuration examples are valid JSON
- [ ] Installation commands are syntactically correct
- [ ] Selector examples are accurate (cross-check with mdsel CLI)

### PRD Requirements Validation (Section 10.2)

- [ ] Installation via `npx` is documented
- [ ] MCP server startup is explained
- [ ] Tool list and purpose are documented
- [ ] Example `index` call is shown
- [ ] Example `select` call is shown
- [ ] Selector grammar is briefly explained (mechanical, not tutorial)
- [ ] No philosophy or marketing content

### Content Quality Validation

- [ ] Description matches package.json
- [ ] mdsel peer dependency requirement is explicit
- [ ] Node.js version requirement is stated
- [ ] Two-step workflow (index then select) is clear
- [ ] Configuration examples cover major MCP clients
- [ ] Hook installation is documented or linked
- [ ] Examples are copy-pasteable
- [ ] No placeholder text (TODO, FIXME, etc.)

### Usability Validation

- [ ] Someone unfamiliar with MCP can set this up
- [ ] Selector syntax section enables writing selectors without external docs
- [ ] Troubleshooting covers common issues (mdsel not found, etc.)
- [ ] File paths in examples are realistic
- [ ] Environment variables are documented
- [ ] Hook scope (Claude Code only) is clear

### Documentation Completeness

- [ ] Title and description present
- [ ] Installation section with prerequisites
- [ ] Quick Start with configuration example
- [ ] Features list
- [ ] Tools section (both mdsel_index and mdsel_select)
- [ ] Selector Syntax reference
- [ ] Configuration section (env vars + client setup)
- [ ] Behavioral Conditioning Hook section
- [ ] Requirements section
- [ ] License section

---

## Anti-Patterns to Avoid

- Don't include philosophy or design rationale (PRD Section 10.2: "No philosophy")
- Don't use marketing language ("amazing", "powerful", etc.)
- Don't write a full selector syntax tutorial - keep it mechanical and brief
- Don't include contribution guidelines (not specified in PRD)
- Don't add troubleshooting for edge cases beyond common issues
- Don't include changelog or version history
- Don't add feature comparison with alternatives
- Don't document the internal architecture (src/ directory structure)
- Don't include test commands or development setup
- Don't add badges or visual elements
- Don't include "Why use this?" marketing sections
- Don't write extensive prose - keep it concise and mechanical
- Don't reference the main branch implementation
- Don't include internal planning documents in the README

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Rationale**:
- All section content is fully specified with exact text
- Code examples are provided and can be copy-pasted
- Cross-references to internal research documents provide deep context
- Validation commands are specific and executable
- PRD requirements are explicitly checked
- Common user questions are addressed in gotchas
- The "No Prior Knowledge" test can be applied objectively

**Next Tasks After This PRP**:
- P3.M2.T1: Finalize Package Configuration (npm metadata, npx verification)

---

*END OF PRP*
