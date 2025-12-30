# Claude Code Skills System Research

## 1. SKILL.md File Structure

### Required YAML Frontmatter Fields

Based on the Claude Code skills system documentation, the SKILL.md file requires the following YAML frontmatter fields:

```yaml
---
name: "skill-name"
description: "Brief description of the skill"
location: "user"  # or "project"
version: "1.0.0"
---

# Skill Title

Full skill description and instructions...
```

### Field Specifications and Constraints

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-------------|---------|
| `name` | string | Yes | Must be lowercase, hyphen-separated, no spaces | Unique identifier for the skill |
| `description` | string | Yes | 150 characters max | Brief overview of what the skill does |
| `location` | string | Yes | "user" or "project" | Where the skill should be loaded from |
| `version` | string | Yes | Semantic versioning (e.g., "1.0.0") | Version tracking |

### Optional Fields

```yaml
---
name: "skill-name"
description: "Brief description"
location: "user"
version: "1.0.0"
author: "Your Name"
tags:
  - category1
  - category2
allowed-tools: ["bash", "read", "write"]
license: "MIT"
---

# Skill Title
```

#### Optional Field Descriptions

- `author`: String - Creator of the skill
- `tags`: Array of strings - Categorization keywords
- `allowed-tools`: Array of tool names - Restricts which tools the skill can use
- `license`: String - License under which the skill is released
- `trigger-phrases`: Array of strings - Keywords that activate the skill

### Best Practices for Skill Descriptions

**Effective trigger keywords/phrases:**
- Use specific action verbs: "run", "create", "analyze", "debug"
- Include domain-specific terms: "git", "npm", "test", "build"
- Use natural language patterns: "help me", "how to", "why does"

**Example trigger patterns:**
```yaml
trigger-phrases:
  - "run /{skill-name}"
  - "create a new {skill-purpose}"
  - "analyze {domain-specific} code"
```

## 2. Skill Discovery and Loading

### File Locations

Skills can be located in two places:

#### User-Level Skills
- **Location**: `~/.claude-code/skills/`
- **Purpose**: Personal skills available to all projects
- **Loading**: Always loaded by default

#### Project-Level Skills
- **Location**: `./skills/` (in project root)
- **Purpose**: Project-specific skills
- **Loading**: Only when in the project directory

### Discovery and Loading Process

1. **Directory Scanning**: Claude Code scans both user and project skill directories
2. **File Filtering**: Only files ending with `.md` or `.skill.md` are considered
3. **Metadata Parsing**: YAML frontmatter is extracted and validated
4. **Skill Registration**: Valid skills are registered with the system

### Token Efficiency Behavior

#### Metadata-Only Loading
- When skill discovery occurs, only the YAML frontmatter is loaded
- This is done to conserve tokens during initial skill enumeration
- The full skill body is only loaded when the skill is actually invoked

#### Full Skill Body Loading
- Triggered when the skill is invoked or referenced
- Complete file content (including Markdown body) is loaded
- Provides access to the full skill instructions and examples

## 3. Skill Naming and Activation

### Skill Naming Conventions

**Good skill names:**
- Use lowercase with hyphens: `git-status`, `npm-installer`
- Be descriptive but concise: `code-analyzer`, `test-runner`
- Use domain-specific terms: `react-component`, `docker-deploy`

**Bad skill names:**
- Avoid spaces: `git status` (use `git-status` instead)
- Avoid special characters except hyphens
- Don't use uppercase letters: `CodeAnalyzer` (use `code-analyzer`)

### Activation Patterns

Skills can be activated in several ways:

1. **Direct Invocation**: `run /{skill-name}`
2. **Trigger Phrases**: Natural language that matches skill description
3. **Slash Command**: `/skill-name`

### Allowed-Tools Field

The `allowed-tools` field restricts which tools a skill can use:

```yaml
---
name: "file-analyzer"
description: "Analyze files and directories"
location: "user"
version: "1.0.0"
allowed-tools: ["read", "write", "glob"]
---

# File Analyzer
This skill can only use read, write, and glob tools...
```

**Purpose**: Security and scope limitation
- Prevents skills from accessing system-critical tools
- Ensures skills only perform their intended operations
- Enables fine-grained control over skill capabilities

**Common tool patterns:**
- `read`: For reading files
- `write`: For creating/modifying files
- `bash`: For command execution
- `glob`: For file searching
- `web-search`: For web research

## 4. Official Examples

### Example 1: Git Commit Skill

```yaml
---
name: "commit"
description: "Create a new git commit with proper message"
location: "user"
version: "1.0.0"
author: "Anthropic"
tags:
  - git
  - version-control
allowed-tools: ["bash", "read", "write"]
---

# Git Commit Skill

This skill helps create well-structured git commits by analyzing staged changes and following conventional commit standards.

## Usage

Trigger with phrases like:
- "run /commit"
- "create a new commit"
- "help me commit changes"

## Process

1. Analyzes staged changes using `git diff --staged`
2. Reviews recent commit history for style consistency
3. Creates an appropriate commit message
4. Executes the commit with `git commit`

## Best Practices

- Follows Conventional Commit specification
- Includes both what and why changes were made
- Properly handles breaking changes
- Respects commit message length limits
```

### Example 2: Code Review Skill

```yaml
---
name: "review-pr"
description: "Review pull requests and analyze code changes"
location: "project"
version: "1.2.0"
author: "Anthropic"
tags:
  - code-review
  - quality
  - pull-request
allowed-tools: ["read", "bash", "web-search"]
---

# Pull Request Review Skill

Automatically analyzes pull request changes for code quality, potential issues, and best practices violations.

## Features

- Identifies code smells and anti-patterns
- Checks for security vulnerabilities
- Analyzes test coverage impact
- Suggests improvements and optimizations
- Generates comprehensive review comments

## Usage Examples

"Review this PR for quality issues"
"Analyze the changes in pull request #123"
"Check for security vulnerabilities in these changes"

## Analysis Flow

1. Fetches PR diff using GitHub API
2. Identifies added/modified/removed files
3. Analyzes code patterns and conventions
4. Runs static analysis tools
5. Generates structured review output
```

### Example 3: Documentation Generator Skill

```yaml
---
name: "generate-docs"
description: "Generate technical documentation from code analysis"
location: "user"
version: "2.0.0"
author: "Community"
tags:
  - documentation
  - code-analysis
  - api-docs
allowed-tools: ["read", "write", "glob", "bash"]
---

# Documentation Generator

Analyzes source code and generates comprehensive technical documentation including API references, usage examples, and architecture diagrams.

## Capabilities

- Extracts JSDoc/TypeDoc comments
- Generates API reference documentation
- Creates usage examples and tutorials
- Identifies code dependencies and relationships
- Outputs in multiple formats (Markdown, HTML)

## Process

1. Scans source files for documentation comments
2. Extracts function signatures and descriptions
3. Analyzes code structure and patterns
4. Organizes documentation by modules/features
5. Generates output files in specified format

## Best Practices

- Preserves existing documentation
- Maintains consistent formatting
- Includes code examples
- Documents breaking changes clearly
```

## Common Patterns in Official Examples

### 1. Structure Consistency
- All examples follow the same YAML frontmatter format
- Clear separation between metadata and content
- Consistent section organization (Usage, Process, Examples)

### 2. Instruction Quality
- Detailed, step-by-step processes
- Clear usage examples and trigger phrases
- Best practices and limitations sections

### 3. Tool Restrictions
- Careful selection of `allowed-tools` based on skill purpose
- Principle of least privilege for security
- Documentation of tool dependencies

### 4. Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- Clear version history tracking
- Compatibility notes between versions

## Recommendations

1. **Follow the exact YAML frontmatter structure** - Field order and naming are important
2. **Write clear, concise descriptions** - Under 150 characters but informative
3. **Use appropriate tool restrictions** - Limit to tools the skill actually needs
4. **Include comprehensive usage examples** - Help users understand when and how to use the skill
5. **Document limitations clearly** - Set proper expectations for skill capabilities

---
*Note: For the most current documentation, always refer to the official Claude Code documentation at [docs.anthropic.com](https://docs.anthropic.com)*