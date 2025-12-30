# AI Agent Skill Systems Research

## 1. Claude Code Community Skills

### GitHub Repositories & Examples

**Note**: Specific GitHub repositories and examples should be researched when web search becomes available. Common patterns to look for:

- `anthropics/claude-skills`
- `claude-code/skill-examples`
- `awesome-claude-skills` curated lists
- Individual developer repositories with skill implementations

### Common Skill File Patterns

```yaml
# Skill Metadata
name: "github-issues"
description: "Manage GitHub issues with smart categorization and prioritization"
version: "1.0.0"
author: "developer@example.com"
tags: ["github", "issues", "productivity"]

# Tool Dependencies
tools:
  - "github-api"
  - "ai-classification"
  - "text-generation"

# Instruction Body
instructions: |
  ## Quick Start
  This skill helps you efficiently manage GitHub issues by providing smart categorization and prioritization suggestions.

  ### Basic Usage:
  ```
  /github-issues --repo "owner/repo" --action analyze
  /github-issues --repo "owner/repo" --action prioritize
  ```

  ## Reference
  ### Commands
  - `analyze`: Analyze issues in repository
  - `prioritize`: Suggest priority levels for issues
  - `categorize`: Categorize issues by type
  - `report`: Generate weekly/monthly reports

  ### Parameters
  - `--repo`: Repository in format "owner/repo"
  - `--action`: Action to perform
  - `--label`: Filter by label
  - `--priority`: Filter by priority level

  ## Examples
  ### Analyzing repository issues
  ```
  /github-issues --repo "anthropic/claude" --action analyze
  ```

  ### Prioritizing bug reports
  ```
  /github-issues --repo "anthropic/claude" --action prioritize --label "bug"
  ```

  ## Troubleshooting
  - If authentication fails, ensure you have GITHUB_TOKEN environment variable set
  - For rate limiting, wait 1 minute between API calls
```

### Instruction Body Best Practices

1. **Clear Structure**: Use markdown sections (Quick Start, Reference, Examples)
2. **Concise Headers**: Make it easy to scan and find information
3. **Practical Examples**: Include common use cases with code snippets
4. **Error Guidance**: Provide troubleshooting for common issues
```

## 2. OpenCode Skills

### .claude/skills/ Compatibility

**Note**: Research needed on OpenCode's specific implementation details. General patterns to expect:

- Directory structure: `~/.claude/skills/` or project-specific `.claude/skills/`
- File extensions: `.skill`, `.yaml`, `.json`, or `.md`
- Configuration format: Likely similar to Claude Code with some OpenCode-specific additions

### OpenCode-Specific Patterns

```yaml
# OpenCode Enhanced Skill Example
name: "openai-api-interaction"
description: "Integrate with OpenAI APIs using OpenCode's enhanced tool ecosystem"
version: "1.2.0"
author: "opencode-community"

# OpenCode-specific additions
opencode_extensions:
  - "enhanced_error_handling"
  - "rate_limit_aware"
  - "caching_layer"

# Tool mapping for OpenCode ecosystem
tool_mappings:
  claude_api: "openai_compatible"
  file_operations: "enhanced_fs"

instructions: |
  ## OpenCode Features
  This skill includes OpenCode-specific enhancements:

  - Enhanced error handling with automatic retries
  - Rate limit awareness and smart backoff
  - Intelligent caching for frequent API calls
  - Progress tracking for long-running operations

  ## Usage Examples
  Demonstrates OpenCode's improved capabilities over standard implementations.
```

## 3. Best Practices for Agent Skills

### Structuring the Instruction Body

#### A. Quick Start Section
- Purpose: Get users started immediately
- Elements:
  - Core functionality overview
  - Most common commands
  - Minimal required parameters
  - Expected output examples

#### B. Reference Section
- Purpose: Comprehensive documentation
- Elements:
  - All available commands and parameters
  - Detailed parameter descriptions
  - Return value specifications
  - Error conditions and codes

#### C. Examples Section
- Purpose: Show practical applications
- Elements:
  - Real-world use cases
  - Complex multi-step workflows
  - Common patterns and anti-patterns
  - Edge case handling

### Including Examples Effectively

1. **Progressive Complexity**
   ```markdown
   ## Examples

   ### Basic Usage
   Simple, single-command examples

   ### Advanced Usage
   Multi-step workflows with combinations

   ### Edge Cases
   Error handling and unusual scenarios
   ```

2. **Contextual Examples**
   - Show before/after states
   - Include expected outputs
   - Explain the "why" behind each step

3. **Template Examples**
   ```markdown
   ## Templates

   ### Daily Report
   ```
   /generate-report --type daily --include metrics --format markdown
   ```

   ### Weekly Summary
   ```
   /generate-report --type weekly --include trends --format pdf
   ```
   ```

### Referencing Tools and Commands

1. **Tool Documentation Links**
   ```markdown
   ## Dependencies

   This skill requires:
   - [GitHub CLI](https://cli.github.com/) for repository operations
   - [jq](https://stedolan.github.io/jq/) for JSON processing
   - [curl](https://curl.se/) for API calls
   ```

2. **Command Reference Format**
   ```markdown
   ### Command: analyze-repo
   Analyze repository structure and provide insights.

   **Syntax:**
   ```
   /analyze-repo --path <path> [--depth <depth>] [--format <format>]
   ```

   **Parameters:**
   - `--path`: Repository directory (required)
   - `--depth`: Analysis depth (default: 3)
   - `--format`: Output format (json, yaml, markdown)

   **Examples:**
   ```bash
   /analyze-repo --path ./my-project --depth 5 --format markdown
   ```
   ```

### Writing "When to Use" Guidance

1. **Use Case Scenarios**
   ```markdown
   ## When to Use This Skill

   ### ✅ Recommended Use Cases
   - Analyzing code quality in large repositories
   - Identifying technical debt hotspots
   - Generating architecture documentation
   - Preparing for code reviews

   ### ❌ Not Recommended For
   - Simple file searches (use grep instead)
   - Direct code editing (use IDE features)
   - Real-time collaboration (use GitHub PRs)
   ```

2. **Decision Flow**
   ```markdown
   ## Usage Decision Tree

   1. **Repository Size > 1k files?** → Use deep analysis
   2. **Multiple programming languages?** → Use multi-language mode
   3. **Legacy code suspected?** → Enable technical debt detection
   4. **Team collaboration?** → Generate team reports
   ```

## 4. Instruction Body Patterns

### Section Organization Templates

#### Template A: Tool-Focused Skill
```markdown
## Quick Start
Use this skill for [primary function].

### Basic Command
```
/skill-name --required-param value
```

## Reference
### Commands
- `command1`: Description
- `command2`: Description

### Parameters
- `--param1`: Description
- `--param2`: Description

## Examples
### Example 1: Basic Usage
```bash
/skill-name --param1 value
```

### Example 2: Advanced Usage
```bash
/skill-name --param1 value --param2 value2 --option
```

## Troubleshooting
- Error 1: Solution
- Error 2: Solution
```

#### Template B: Analysis-Focused Skill
```markdown
## Overview
This skill performs [analysis type] on [target].

## Quick Start
Analyze current state:
```
/analyze-skill --target ./project
```

## Analysis Types
- Type 1: Description
- Type 2: Description

## Configuration
Create `.analysis-config.json`:
```json
{
  "depth": 5,
  "includeTests": true,
  "excludePatterns": ["node_modules/**"]
}
```

## Example Reports
### Report 1: Code Quality
```bash
/analyze-skill --target ./project --type quality --format markdown
```

### Report 2: Dependencies
```bash
/analyze-skill --target ./project --type deps --format json
```

## Interpreting Results
- Metric 1: What it means
- Metric 2: What it means
```

### Writing Concise but Complete Instructions

1. **The 80/20 Rule**
   - Cover 80% of use cases in 20% of the space
   - Provide links to detailed documentation for edge cases

2. **Progressive Disclosure**
   ```markdown
   ## Quick Reference
   Most common use cases covered here.

   ## Full Documentation
   [Link to detailed documentation]
   ```

3. **Standardized Format**
   - Consistent command syntax
   - Standard parameter naming
   - Uniform example formatting

### Handling Edge Cases and Troubleshooting

1. **Common Error Patterns**
   ```markdown
   ## Common Issues

   ### Authentication Failures
   **Error:** "Permission denied"
   **Solution:** Check API tokens and permissions
   **Example:** `export TOKEN=your-token`

   ### Rate Limiting
   **Error:** "Too many requests"
   **Solution:** Add delays between requests
   **Example:** Add `--wait 2` parameter
   ```

2. **Environment Setup**
   ```markdown
   ## Prerequisites

   ### Required Tools
   - tool1: Install via `pip install tool1`
   - tool2: Download from [website](url)

   ### Environment Variables
   ```bash
   export API_KEY=your_key
   export CONFIG_PATH=/path/to/config
   ```
   ```

## Complete Skill File Templates

### Template 1: Simple File Processing Skill
```yaml
name: "file-processor"
description: "Process and transform files with various formats"
version: "1.0.0"
author: "developer@example.com"

tools:
  - "file-read"
  - "file-write"
  - "text-transform"
  - "format-conversion"

instructions: |
  ## Quick Start
  Process a single file:
  ```
  /file-processor --input document.txt --output processed.txt --format markdown
  ```

  Batch process multiple files:
  ```
  /file-processor --input-dir ./docs --output-dir ./processed --format html
  ```

  ## Reference
  ### Commands
  - `process`: Process single file or directory
  - `validate`: Validate file format
  - `convert`: Convert between formats
  - `batch`: Process multiple files with same settings

  ### Parameters
  - `--input`: Input file or directory
  - `--output`: Output file or directory
  - `--format`: Target format (markdown, html, json)
  - `--options`: Processing options as JSON string

  ## Examples
  ### Convert Markdown to HTML
  ```bash
  /file-processor --input readme.md --output readme.html --format html
  ```

  ### Batch Process with Custom Options
  ```bash
  /file-processor --input-dir ./articles --output-dir ./html \
    --format html \
    --options '{"extract_images": true, "optimize": true}'
  ```

  ## Troubleshooting
  - "Permission denied": Check file read/write permissions
  - "Invalid format": Use --validate to check file format
  - "Conversion failed": Check source file encoding
```

### Template 2: API Integration Skill
```yaml
name: "api-integrator"
description: "Integrate with external APIs using secure authentication"
version: "2.1.0"
author: "api-team@example.com"

tools:
  - "http-client"
  - "json-parser"
  - "authentication"
  - "rate-limit"

instructions: |
  ## Quick Start
  Make a simple API call:
  ```
  /api-integrator --endpoint https://api.example.com/data --method GET
  ```

  With authentication:
  ```
  /api-integrator --endpoint https://api.example.com/data \
    --method POST \
    --auth bearer \
    --token your-token \
    --data '{"key": "value"}'
  ```

  ## Reference
  ### Authentication Methods
  - `bearer`: Bearer token authentication
  - `basic`: Basic HTTP authentication
  - `oauth2`: OAuth 2.0 flow
  - `api-key`: API key in headers

  ### Parameters
  - `--endpoint`: API endpoint URL
  - `--method`: HTTP method (GET, POST, PUT, DELETE)
  - `--auth`: Authentication type
  - `--token`: Authentication token
  - `--data`: Request body (JSON)
  - `--headers`: Additional headers (JSON)

  ## Examples
  ### GET Request with Authentication
  ```bash
  /api-integrator --endpoint https://api.github.com/repos/owner/repo \
    --method GET \
    --auth bearer \
    --token your-github-token
  ```

  ### POST Request with JSON Data
  ```bash
  /api-integrator --endpoint https://api.example.com/users \
    --method POST \
    --auth api-key \
    --token your-api-key \
    --data '{"name": "John", "email": "john@example.com"}'
  ```

  ### Rate-Limited Requests
  ```bash
  /api-integrator --endpoint https://api.example.com/data \
    --method GET \
    --wait 1 \
    --max-retries 3
  ```

  ## Troubleshooting
  - "401 Unauthorized": Check authentication token and permissions
  - "429 Too Many Requests": Increase wait time or use cached responses
  - "Connection Timeout": Check network connectivity and endpoint availability
  - "Invalid JSON": Validate request data format
```

### Template 3: Data Analysis Skill
```yaml
name: "data-analyzer"
description: "Analyze datasets and generate insights"
version: "1.5.0"
author: "data-team@example.com"

tools:
  - "csv-reader"
  - "data-processor"
  - "statistics"
  - "visualization"

instructions: |
  ## Quick Start
  Analyze a CSV file:
  ```
  /data-analyzer --input data.csv --type basic-stats
  ```

  Generate comprehensive report:
  ```
  /data-analyzer --input data.csv --type comprehensive --output report.html
  ```

  ## Analysis Types
  - `basic-stats`: Descriptive statistics
  - `trend-analysis`: Time series analysis
  - `correlation`: Correlation matrix
  - `distribution`: Data distribution analysis
  - `comprehensive`: Full analysis with visualization

  ## Configuration
  Create `.data-analyzer-config.json`:
  ```json
  {
    "exclude_columns": ["id", "timestamp"],
    "visualization_theme": "dark",
    "statistical_significance": 0.05
  }
  ```

  ## Examples
  ### Basic Statistics Analysis
  ```bash
  /data-analyzer --input sales.csv --type basic-stats --format markdown
  ```

  ### Trend Analysis with Visualization
  ```bash
  /data-analyzer --input stock_prices.csv \
    --type trend-analysis \
    --output trends.html \
    --visualization true
  ```

  ### Correlation Analysis
  ```bash
  /data-analyzer --input customer_data.csv \
    --type correlation \
    --threshold 0.7 \
    --format json
  ```

  ## Interpreting Results
  - **Mean vs Median**: Identify data skewness
  - **Correlation > 0.7**: Strong relationship between variables
  - **P-value < 0.05**: Statistically significant result
  - **Outliers**: Check for data quality issues

  ## Data Quality Checks
  - Missing values: Use `--fill-strategy mean|median|mode`
  - Duplicate rows: Enable `--remove-duplicates`
  - Data types: Validate with `--validate-types`
```

## Research Recommendations

1. **Claude Code Community Skills Research Needed**:
   - Search GitHub for `claude-skills` repositories
   - Look for `skills/` directories in popular projects
   - Examine skill file formats and structures

2. **OpenCode Research Needed**:
   - Documentation on `.claude/skills/` compatibility
   - OpenCode-specific skill examples
   - Enhanced features compared to Claude Code

3. **Additional Sources to Research**:
   - Anthropic's official skill documentation
   - Community tutorials and guides
   - Enterprise skill implementations
   - Multi-agent skill composition examples

4. **Template Validation**:
   - Test templates with actual skill systems
   - Get feedback from experienced users
   - Refine based on real-world usage patterns
```