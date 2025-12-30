# YAML Frontmatter Research Report

This document provides comprehensive research on YAML frontmatter conventions in Markdown files, including syntax, best practices, examples from popular projects, and parsing validation techniques.

## 1. YAML Frontmatter Syntax

### Delimiter Syntax
- **Primary Delimiter**: Triple hyphens (`---`)
  - Must be at the very beginning of the file (no preceding whitespace)
  - Opening and closing delimiters must match exactly
  - Required for YAML frontmatter processing

- **Alternative Delimiters**:
  - Triple plus signs (`+++`) - Used by Hugo (TOML format)
  - Triple colons (`:::`) - Rare, occasionally used

### Placement Rules
```yaml
---
# Frontmatter must be the FIRST THING in the file
# No preceding text, whitespace, or other content
# No BOM (Byte Order Mark) headers

# Example correct placement
---
title: "My Blog Post"
date: "2024-01-15"
tags: ["markdown", "yaml", "frontmatter"]
---

# Markdown content starts AFTER the closing delimiter
# There must be at least one blank line between frontmatter and content

# This is the main content...
```

### Common Field Types
```yaml
---
# String (quoted or unquoted)
title: "My Title"
author: John Doe

# Number (integer/float)
word_count: 1500
priority: 1

# Boolean
draft: false
published: true

# Date/DateTime
date: "2024-01-15"
datetime: "2024-01-15T14:30:00Z"

# Array
tags: ["javascript", "web-development", "tutorial"]
categories: [frontend, programming]

# Object/Map
author:
  name: "John Doe"
  email: "john@example.com"

# Null value
reviewed: null

# Mixed arrays
example:
  - "string"
  - 42
  - true
  - nested:
      key: value
---

# Multi-line strings using | or >
description: |
  This is a multi-line string.
  It preserves line breaks.
  And indentation.

# Folded multi-line string (newlines become spaces)
summary: >
  This is a folded multi-line string.
  Newlines are converted to spaces.
```

### Special Characters and Multi-line Strings

#### Quoting Rules
```yaml
---
# Always quote strings that might be interpreted as other types
# Strings that look like numbers, booleans, or null should be quoted
title: "42 is the answer"
string_number: "100"
boolean_like: "yes"
null_like: "null"

# Strings with colons need quoting
path: "/home/user/docs/"

# URLs should be quoted
url: "https://example.com/path?param=value"

# Strings with special characters
title: "Python: A *Practical* Introduction"
description: "Learn about 'Python' and \"best practices\""
---

# YAML automatically converts certain values
# Without quotes:
auto_number: 42          # becomes integer
auto_boolean: yes        # becomes boolean
auto_null: null          # becomes null

# With quotes, they remain strings
string_number: "42"      # remains string
string_boolean: "yes"   # remains string
string_null: "null"      # remains string
```

#### Multi-line String Types
```yaml
---
# Literal block (|)
# Preserves line breaks and indentation
code: |
  function hello() {
    console.log("Hello, world!");
  }

  // Indentation is preserved
  const message = "Multiline string";
  return message;

# Folded block (>)
# Line breaks become spaces, preserves paragraphs
description: >
  This is a folded string. Multiple lines
  are collapsed into single spaces. But paragraph
  breaks (blank lines) are preserved.

  This is a new paragraph with its own
  line breaks and spaces.

# Single quoted multi-line
single: 'This is a single-quoted
  string that spans multiple lines
  but preserves indentation'

# Double quoted multi-line with escapes
escaped: "This is a \"double-quoted\"\nstring with \\escapes\nand\nline breaks"
---
```

### Advanced YAML Features
```yaml
---
# Anchors and references for reuse
defaults: &defaults
  author: "Default Author"
  tags: ["default-tag"]

post1:
  <<: *defaults
  title: "First Post"
  date: "2024-01-01"

post2:
  <<: *defaults
  title: "Second Post"
  date: "2024-01-02"

# Custom data types
phone: !!str 123-456-7890  # Force string interpretation

# Comments
# This is a comment
active: true  # This is an inline comment

# Document markers (multiple documents in one file)
---
title: "First Document"
---
title: "Second Document"  # Second document in same file
---
```

## 2. Best Practices

### Field Naming Conventions
```yaml
---
# Use lowercase with underscores (snake_case)
title: "My Blog Post"
author_name: "John Doe"
publish_date: "2024-01-15"
word_count: 1500

# Avoid hyphens in field names
# Bad:
# publish-date: "2024-01-15"
# Good:
publish_date: "2024-01-15"

# Use descriptive names
# Instead of:
# t: "My Title"
# Use:
title: "My Title"

# Common field names to use:
title: "Title of the content"
description: "Brief description (often used in meta tags)"
author: "Author name"
date: "Creation date"
tags: ["List of tags"]
categories: ["Content categories"]
slug: "url-slug"
draft: false  # Content status
published: true  # Content status
template: "custom-layout"  # Template selection
weight: 10  # Sort order
---
```

### Description Structure for Maximum Clarity
```yaml
---
# Effective description structure
description: |
  This comprehensive guide covers advanced JavaScript concepts
  including closures, prototypes, and async programming.
  Perfect for developers looking to level up their skills.

# Include keywords for SEO
description: |
  Learn React hooks and state management patterns.
  Build modern web applications with useState, useEffect,
  and custom hooks. Includes practical examples.

# Keep it concise but informative
description: |
  Step-by-step tutorial on setting up a Node.js Express
  server with TypeScript and MongoDB integration.

# For technical documentation
description: |
  API reference for the mdsel command-line tool.
  Covers index, select, and configuration options
  for efficient markdown file selection.
---
```

### Character Limits and Handling
```yaml
---
# Common character limits
title: "Short, descriptive title"  # Max ~60 chars
description: "Concise summary"        # Max ~160 chars (meta description)
slug: "url-friendly-slug"         # Max ~50 chars, lowercase

# Long text should be in content, not frontmatter
# Bad - frontmatter with huge description:
# description: "Very long description that should actually be in the content itself..."

# Good - keep frontmatter concise:
summary: "Brief summary"
# Long content in the actual markdown

# Handle long slugs
# Instead of:
# slug: "this-is-a-very-long-blog-post-title-that-exceeds-recommended-length"
# Use:
slug: "long-post-title"  # Truncate for URLs
canonical_url: "https://example.com/very-long-url/title/here"
---

# Alternative for long descriptions
# Use separate fields
short_description: "Brief summary for lists and previews"
full_description: |
  This is the complete description that might be longer
  than the typical character limit for meta tags.
```

### Escaping Special Characters
```yaml
---
# Backticks in descriptions
description: "Use `code` formatting in descriptions for technical terms"

# Double quotes inside strings
description: 'This contains "double quotes" safely'

# Escape sequences
description: "Contains newlines\nand tabs\tand backslashes\\"

# Complex escaping
code_example: |
  console.log(`Template literal with ${variable}`);
  // Escaping backticks in YAML: use \``

# URL with special characters
url: "https://example.com/search?q=markdown+&+yaml+frontmatter"

# File paths with spaces
file_path: "/path with spaces/file.md"

# YAML-specific escaping
# Key with colon
"field:with:colon": "value"

# Key with special characters
"field-with-dashes": "value"
"field.with.dots": "value"

# Multi-line with backticks
description: |
  To use backticks in markdown, escape them as follows:
  - Single backtick: \`
  - Code block: \`\`\`
---
```

## 3. Examples from Popular Projects

### Jekyll Blog Posts
```yaml
---
layout: post
title: "Blogging Like a Hacker"
date: "2024-01-15 10:30:00 -0500"
categories: [web, development]
tags: [jekyll, markdown, frontmatter]
author: "John Smith"
excerpt_separator: <!--more-->

# Front Variables
published: true
comments: true
social_share: true
image: "/assets/images/hacker-blog.png"

# Custom fields
reading_time: "5 min"
word_count: 875
featured: true
---

# Post content here...
```

### Hugo Documentation Pages
```yaml
---
title: "Front Matter"
date: "2024-02-02T04:14:54-08:00"
draft: false
weight: 10
aliases: ["/content-management/frontmatter/", "/front-matter/"]

# Parameters section
params:
  author: "Hugo Documentation Team"
  toc: true
  edit_me:
    repo: "https://github.com/gohugoio/hugo"
    file: "docs/content-management/front-matter.md"
    branch: "main"

# Menu configuration
menu:
  main:
    identifier: "front-matter"
    name: "Front Matter"
    weight: 10
    parent: "content-management"

# Meta information
keywords:
  - front matter
  - yaml
  - metadata
  - hugo
  - markdown
  - content
---

# Content starts here...
```

### Developer Documentation (GitHub-style)
```yaml
---
title: "API Reference: Authentication"
category: "docs"
section: "authentication"
order: 2
last_updated: "2024-01-20"
author: "Engineering Team"
reviewers:
  - "Jane Doe"
  - "Bob Smith"
approved: true

# Technical specifications
api_version: "v2.1"
endpoint: "/api/v2/auth"
methods: ["POST", "GET"]
rate_limit: 1000/hour

# Dependencies
requires:
  - "OAuth 2.0"
  - "TLS 1.3"
tested_on:
  - node: "18.x"
  - python: "3.11"
  - go: "1.21"

# Usage examples
examples:
  - name: "Basic auth"
    code: "curl -X POST https://api.example.com/v2/auth"
    language: "bash"
  - name: "Python example"
    code: "import requests; auth = requests.post('/api/v2/auth')"
    language: "python"
---

# Documentation content...
```

### AI/Agent System Examples
```yaml
---
# Agent skill definition
name: "mdsel"
description: |
  Skill for efficiently selecting content from large markdown files.
  Optimized for handling large documents without consuming excessive
  tokens. Provides indexing and selection capabilities.
version: "1.0.0"

# Configuration
allowed-tools: ["Bash"]
triggers:
  - "markdown"
  - "large files"
  - "selector"
  - "index"
  - "select"

# Performance constraints
token_overhead: 95
max_content_size: 50000
word_threshold: 200

# Schema for expected inputs
input_schema:
  type: object
  properties:
    command:
      type: string
      enum: ["index", "select"]
      description: "Command to execute"
    file_path:
      type: string
      description: "Path to markdown file"
    selector:
      type: string
      description: "Element selector pattern (h1.0, p.2, etc.)"
    limit:
      type: number
      description: "Maximum number of results to return"

# Output expectations
output_schema:
  type: object
  properties:
    content:
      type: array
      items:
        type: object
        properties:
          element:
            type: string
          content:
            type: string
          selector:
            type: string
    index:
      type: object
      additionalProperties: true

# Dependencies and requirements
requires:
  - "mdsel CLI tool"
  - "File system access"
  - "Markdown parsing capability"
---

# Skill instructions...
```

## 4. Parsing Validation

### Common YAML Parsing Libraries and Their Quirks

#### Python - PyYAML
```python
import yaml
import re

def parse_frontmatter(content):
    # Pattern to match frontmatter
    frontmatter_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)

    match = frontmatter_pattern.match(content)
    if not match:
        return None, content

    frontmatter_text = match.group(1)
    try:
        # Load YAML with safe loader (no dangerous objects)
        frontmatter = yaml.safe_load(frontmatter_text)
        # Get content without frontmatter
        body = content[match.end():].lstrip()
        return frontmatter, body
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML frontmatter: {e}")

# Special handling for PyYAML quirks
def handle_special_values(data):
    """Handle YAML's automatic type conversion"""
    if isinstance(data, str):
        # Convert boolean-like strings back to strings
        if data.lower() in ('true', 'false', 'yes', 'no', 'on', 'off', 'null'):
            return data
        # Convert number-like strings back to strings
        if re.match(r'^\d+$', data) or re.match(r'^\d+\.\d+$', data):
            return data
    return data
```

#### JavaScript - gray-matter
```javascript
const matter = require('gray-matter');
const fs = require('fs');

function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter
    const result = matter(content, {
        // Options
        engines: {
            yaml: require('js-yaml'),
        },
        language: 'yaml',
        delimiters: '---',
        excerpt: true,
        excerpt_separator: '<!-- more -->'
    });

    return {
        frontmatter: result.data,
        content: result.content,
        excerpt: result.excerpt
    };
}

// Validation function
function validateFrontmatter(frontmatter) {
    const errors = [];

    // Check required fields
    if (!frontmatter.title) {
        errors.push('title field is required');
    }

    // Check character limits
    if (frontmatter.title && frontmatter.title.length > 100) {
        errors.push('title must be 100 characters or less');
    }

    if (frontmatter.description && frontmatter.description.length > 500) {
        errors.push('description must be 500 characters or less');
    }

    // Check data types
    if (frontmatter.draft !== undefined && typeof frontmatter.draft !== 'boolean') {
        errors.push('draft must be a boolean');
    }

    return errors.length === 0 ? null : errors;
}
```

#### Node.js - front-matter
```javascript
const frontMatter = require('front-matter');

function parseFrontmatter(content) {
    const parsed = frontMatter(content);
    return {
        attributes: parsed.attributes,
        body: parsed.body,
        frontmatter: parsed.frontmatter
    };
}

// Alternative implementation with regex
function parseWithRegex(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { frontmatter: null, content };
    }

    try {
        const frontmatter = require('yaml').parse(match[1]);
        return {
            frontmatter: frontmatter || {},
            content: match[2].trim()
        };
    } catch (e) {
        throw new Error(`Invalid YAML: ${e.message}`);
    }
}
```

### Common Errors and How to Avoid Them

#### 1. Delimiter Issues
```yaml
# Bad - Missing closing delimiter
---
title: "Missing Closing Delimiter"
content: This will cause parsing errors

# Bad - Extra whitespace before opening delimiter
 #---
 #title: "Whitespace before delimiters"
 #---

# Good - Proper delimiters
---
title: "Correct Frontmatter"
---

# Good - Empty frontmatter is allowed
---

# Content here...
```

#### 2. Whitespace and Indentation
```yaml
# Bad - Inconsistent indentation
---
title: "Example"
    author: "John Doe"  # Extra spaces
tags: ["tag1", "tag2"]
  date: "2024-01-01"    # Extra spaces
---

# Good - Consistent 2-space indentation
---
title: "Example"
author: "John Doe"
tags:
  - "tag1"
  - "tag2"
  - "tag3"
date: "2024-01-01"
---

# Bad - Mixing spaces and tabs
---
title: "Mixed Indentation"
	author: "John Doe"  # Tab character
---

# Good - Consistent spaces only
---
title: "Consistent Indentation"
author: "John Doe"
---
```

#### 3. Data Type Issues
```yaml
# Bad - Automatic type conversion might cause issues
---
# These will be converted to different types
number: 42          # Integer
boolean: true       # Boolean
null: null          # Null

# Good - Quote to preserve as strings if needed
string_number: "42"    # String
string_boolean: "true" # String
string_null: "null"   # String
---

# Bad - Complex expressions
# This won't work in YAML:
# calculation: 2 + 2 * 3

# Good - Calculate before or use a tool
result: 8  # Pre-calculated value
---

# Bad - Circular references
# anchor: &anchor
#   value: "test"
# reference: *anchor  # This won't work in simple frontmatter
```

#### 4. Special Character Issues
```yaml
# Bad - Unescaped colons
title: "Invalid: Field"  # Will be parsed as title: "Invalid" and Field: null

# Good - Quote the whole string
title: "Invalid: Field"

# Good - Use object syntax if needed
fields:
  title: "Invalid: Field"
---

# Bad - Unescaped backticks in content
description: "Use `backticks` in markdown"

# Good - No escaping needed in YAML strings
description: "Use `backticks` in markdown"
---

# Bad - Newlines in strings without proper formatting
# This won't work:
# description: "Line 1
# Line 2"

# Good - Use | for multi-line
description: |
  Line 1
  Line 2
  Line 3
```

### Testing YAML Frontmatter

#### Using Command Line Tools
```bash
# Test YAML validity
echo '---
title: "Test"
description: "A test document"
tags: ["test", "yaml"]
---

# This is the content
' | python3 -c "
import yaml
import sys
try:
    frontmatter = yaml.safe_load(sys.stdin.read().split('---')[1])
    print('Valid YAML!')
    print('Title:', frontmatter.get('title'))
except Exception as e:
    print('Error:', e)
"

# Using yq (YAML query tool)
echo '---
title: "Test"
draft: false
tags: ["test"]
---
' | yq '.title'

# Using node/yaml-validator
npm install -g yaml-validator
echo '---
title: "Test"
draft: false
tags:
  - "test"
---
' | yaml-validator
```

#### Testing Scripts
```python
#!/usr/bin/env python3
"""
Test script for YAML frontmatter validation
"""
import yaml
import re
import sys
import argparse

def test_frontmatter(content):
    """Test frontmatter and return results"""
    results = {
        'valid_yaml': False,
        'has_frontmatter': False,
        'frontmatter': {},
        'content': content,
        'errors': []
    }

    # Check for frontmatter
    frontmatter_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
    match = frontmatter_pattern.match(content)

    if match:
        results['has_frontmatter'] = True
        results['content'] = content[match.end():].lstrip()

        try:
            results['frontmatter'] = yaml.safe_load(match.group(1))
            results['valid_yaml'] = True
        except yaml.YAMLError as e:
            results['errors'].append(f"YAML error: {e}")
    else:
        results['errors'].append("No frontmatter found")

    # Validate required fields
    if results['has_frontmatter']:
        if 'title' not in results['frontmatter']:
            results['errors'].append("Missing required field: title")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('file', help="Markdown file to test")
    args = parser.parse_args()

    with open(args.file, 'r') as f:
        content = f.read()

    results = test_frontmatter(content)

    if results['errors']:
        print("❌ Errors found:")
        for error in results['errors']:
            print(f"  - {error}")
    elif results['valid_yaml']:
        print("✅ Frontmatter is valid!")
        print(f"Title: {results['frontmatter'].get('title', 'N/A')}")
    else:
        print("❌ No valid frontmatter found")
```

### Comprehensive Validation Example
```python
def comprehensive_validation(frontmatter, content):
    """Perform comprehensive validation of frontmatter"""
    errors = []
    warnings = []

    # Check required fields
    required_fields = ['title']
    for field in required_fields:
        if field not in frontmatter:
            errors.append(f"Required field '{field}' is missing")

    # Check character limits
    if 'title' in frontmatter and len(frontmatter['title']) > 100:
        errors.append("Title exceeds 100 character limit")

    if 'description' in frontmatter and len(frontmatter['description']) > 500:
        warnings.append("Description exceeds 500 characters (recommended limit)")

    if 'slug' in frontmatter and len(frontmatter['slug']) > 50:
        warnings.append("Slug exceeds 50 character limit (recommended)")

    # Check data types
    if 'draft' in frontmatter and not isinstance(frontmatter['draft'], bool):
        errors.append("Draft field must be boolean (true/false)")

    if 'published' in frontmatter and not isinstance(frontmatter['published'], bool):
        errors.append("Published field must be boolean (true/false)")

    # Check for common fields with warnings
    if 'author' not in frontmatter:
        warnings.append("Consider adding author field")

    if 'date' not in frontmatter:
        warnings.append("Consider adding date field")

    if 'tags' not in frontmatter and 'categories' not in frontmatter:
        warnings.append("Consider adding tags or categories for organization")

    # Check for reserved field names
    reserved_fields = ['type', 'layout', 'template']  # Add as needed
    for field in reserved_fields:
        if field in frontmatter and not isinstance(frontmatter[field], str):
            warnings.append(f"Field '{field}' is typically a string")

    # Check for suspicious patterns (potential security)
    suspicious_fields = ['script', 'eval', 'exec', 'code']
    for field in frontmatter:
        if any(sus in field.lower() for sus in suspicious_fields):
            warnings.append(f"Potential security risk with field name: {field}")

    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'frontmatter': frontmatter,
        'content': content
    }
```

## Tools for Testing YAML Frontmatter

### Command Line Tools
1. **yq** - YAML query tool
   ```bash
   # Validate YAML
   yq validate file.md

   # Extract frontmatter
   yq '.title' file.md
   ```

2. **yaml-cli**
   ```bash
   npm install -g yaml-cli
   yaml validate file.md
   ```

3. **Python with PyYAML**
   ```bash
   python3 -c "
   import yaml
   import re
   with open('file.md') as f:
       content = f.read()
   frontmatter = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
   if frontmatter:
       print(yaml.safe_load(frontmatter.group(1)))
   "
   ```

### Online Validators
1. **YAML Lint** - https://www.yamllint.com/
2. **JSON to YAML Converter** - https://www.json2yaml.com/
3. **YAML Validator** - https://codebeautify.org/yaml-validator

### IDE/Editor Extensions
- VS Code: **YAML** extension by Red Hat
- VS Code: **Markdown All in One** with frontmatter support
- Sublime Text: **YAML** package
- Atom: **language-yaml** package

## Conclusion

YAML frontmatter in Markdown files follows specific conventions that, when followed correctly, provide a robust metadata system for content management. Key takeaways:

1. **Use triple hyphens (`---`) as delimiters** at the very beginning of the file
2. **Keep field names in lowercase with underscores** for consistency
3. **Quote strings that might be interpreted as other data types**
4. **Use proper indentation (2 spaces)** for nested structures
5. **Validate YAML before processing** to catch errors early
6. **Follow character limits** for metadata fields (title: 100 chars, description: 500 chars)
7. **Test with multiple parsers** to ensure compatibility across platforms

By following these guidelines and examples from popular projects, you can create robust, portable frontmatter that works across different static site generators and content management systems.

---
*Research completed: 2024-12-30*
*Sources: Jekyll documentation, Hugo documentation, gray-matter package documentation, PyYAML documentation*