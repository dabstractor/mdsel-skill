---
name: "P1.M3.T1 - Implement TypeScript Plugin"
description: |

---

## Goal

**Feature Goal**: Create a TypeScript plugin for OpenCode that hooks the `tool.execute.after` event to issue reminders when agents read large Markdown files, encouraging the use of `mdsel` instead of the `Read` tool.

**Deliverable**: A production-ready OpenCode TypeScript plugin (`hooks/opencode/mdsel-reminder.ts`) that:
- Exports a valid `Plugin` type from `@opencode-ai/plugin`
- Hooks the `tool.execute.after` event for the `Read` tool
- Detects Markdown files by `.md` extension
- Counts words using whitespace-delimited tokenization
- Outputs reminder messages when threshold is exceeded
- Supports `MDSEL_MIN_WORDS` environment variable (default: 200)
- Includes a package.json with proper dependencies
- Never blocks or throws exceptions during normal operation

**Success Definition**:
- Plugin exports a valid `Plugin` type that OpenCode can load
- Plugin only triggers on `.md` files accessed via the `Read` tool
- Word counting matches the bash implementation (wc -w equivalent)
- Reminder text matches the normative wording from PRD section 6.3
- Plugin handles file access errors gracefully without throwing
- Environment variable `MDSEL_MIN_WORDS` is respected with default of 200
- TypeScript compiles without errors
- Plugin is discoverable via `opencode.json` configuration

## User Persona (if applicable)

**Target User**: AI coding agents using OpenCode

**Use Case**: When an agent reads a Markdown file that exceeds the word threshold, the plugin injects a reminder to use mdsel instead of Read.

**User Journey**:
1. Agent invokes `Read` tool on a Markdown file
2. Read operation completes successfully
3. OpenCode fires `tool.execute.after` hook
4. Plugin checks if tool was `Read`
5. Plugin extracts or tracks the file path
6. Plugin checks if file extension is `.md`
7. Plugin counts words in the file
8. If word count exceeds threshold, plugin outputs reminder to console
9. Reminder is visible to the agent

**Pain Points Addressed**:
- Agents read entire large Markdown files consuming excessive tokens
- No guidance on when to use mdsel instead of Read
- Inconsistent usage patterns across sessions

## Why

- **Cross-Platform Parity**: Completes the OpenCode half of the reminder system (Claude Code hook completed in P1.M2.T1)
- **Token Efficiency**: Reduces token overhead from ~1300 tokens (MCP approach) to <100 tokens when mdsel is not in use
- **Behavioral Conditioning**: Actively discourages misuse of Read tool on large Markdown files through repetitive reminders
- **Selector-First Pattern**: Enforces the mdsel selector-first access pattern defined in the PRD
- **Platform Support**: Ensures mdsel-skill works identically in both Claude Code and OpenCode

## What

Create a TypeScript plugin for OpenCode that:

1. **Exports a Plugin type** using `@opencode-ai/plugin` package
2. **Hooks `tool.execute.after`** to execute after tool completion
3. **Extracts or tracks file path** - The `tool.execute.after` hook signature provides `{ tool, sessionID, callID }` and `{ title, output, metadata }` but does NOT directly provide tool arguments
4. **Validates tool name** - Only process when `tool === 'Read'`
5. **Validates Markdown file** - Check if file path ends with `.md`
6. **Counts words** - Use whitespace splitting: `content.split(/\s+/).filter(Boolean).length`
7. **Compares to threshold** - Check if word count > `MDSEL_MIN_WORDS` (default: 200)
8. **Outputs reminder** - If threshold exceeded, console.log the normative reminder text
9. **Handles errors gracefully** - Never throw exceptions, wrap all file I/O in try-catch

### Success Criteria

- [ ] Plugin exports valid `Plugin` type from `@opencode-ai/plugin`
- [ ] Plugin hooks `tool.execute.after` event correctly
- [ ] Only processes `.md` files (case-sensitive extension check)
- [ ] Word count uses whitespace splitting for accuracy
- [ ] Environment variable `MDSEL_MIN_WORDS` is respected with default of 200
- [ ] Reminder text matches normative wording exactly from PRD section 6.3
- [ ] All file operations are wrapped in try-catch for graceful error handling
- [ ] TypeScript compiles without errors
- [ ] package.json includes proper dependencies

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Yes** - This PRP provides:
- Complete OpenCode plugin architecture and hook signature
- Exact code patterns to follow from the bash implementation
- File structure and naming conventions
- Validation commands for testing
- TypeScript type definitions and dependencies
- Research files with examples

### Documentation & References

```yaml
# MUST READ - Critical for understanding OpenCode plugins

- file: plan/docs/opencode_plugins.md
  why: Complete specification of OpenCode plugin architecture, hook signatures, and configuration
  section: "tool.execute.after Hook" and "mdsel-reminder Plugin Implementation"
  critical: Hook signature is async ({ tool, sessionID, callID }, { title, output, metadata }) => {}
  gotcha: tool.execute.after does NOT receive tool arguments directly - must use alternative approach

- file: PRD.md
  why: Complete project requirements and reminder content specification
  section: "6.3 Reminder Content (Normative)" lines 179-196
  critical: Reminder text is normative - no variation allowed from canonical wording

- file: PRD.md
  why: OpenCode hook implementation requirements
  section: "6.5 Hook Implementation: OpenCode" lines 220-244
  critical: Plugin location, hook type, and example structure

- file: plan/P1M3T1/research/opencode-plugin-research.md
  why: Comprehensive research on OpenCode plugin system with complete implementation examples
  section: "tool.execute.after Hook" and "mdsel-reminder Plugin Implementation"
  critical: Known limitation - args not available in after hook, must use state tracking or output parsing

- file: plan/P1M3T1/research/typescript-plugin-patterns.md
  why: TypeScript plugin development patterns, file operations, and cross-platform handling
  section: "Node.js File System Operations for Word Counting" and "Error Handling Patterns"
  critical: Use fs.readFileSync, proper error handling, cross-platform path handling

- file: plan/P1M3T1/research/mdsel-syntax-research.md
  why: Complete mdsel CLI documentation and selector syntax reference
  section: "CLI Usage" and "Selector Syntax"
  critical: Understanding mdsel commands for reminder text

- file: plan/docs/external_deps.md
  why: Environment variable specification and dependencies
  section: "Environment Variables" table
  critical: MDSEL_MIN_WORDS default is 200; plugin must respect this env var

- file: hooks/claude/mdsel-reminder.sh
  why: Reference implementation of the Claude Code hook with identical logic
  section: Entire file - word counting, threshold comparison, reminder output
  pattern: Use same word count logic and reminder text for consistency
  gotcha: Bash uses wc -w, TypeScript must use split(/\s+/).filter(Boolean).length

- file: plan/P1M2T1/PRP.md
  why: Parallel PRP for Claude Code hook implementation with identical requirements
  section: "Implementation Tasks" and "Validation Loop"
  pattern: Follow same task ordering and validation approach
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
/home/dustin/projects/mdsel-skill
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md          # Created in P1.M1.T1
├── hooks/
│   └── claude/
│       └── mdsel-reminder.sh    # Created in P1.M2.T1 (reference implementation)
├── plan/
│   ├── docs/
│   │   ├── opencode_plugins.md          # OpenCode plugin specification
│   │   ├── external_deps.md             # Environment variables
│   │   └── ...                          # Other documentation
│   ├── P1M2T1/
│   │   └── PRP.md                       # Claude Code hook PRP (parallel reference)
│   └── P1M3T1/
│       └── research/                    # Research files for this PRP
│           ├── opencode-plugin-research.md
│           ├── typescript-plugin-patterns.md
│           └── mdsel-syntax-research.md
├── PRD.md                               # Complete requirements
└── package.json                         # Project dependencies
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
/home/dustin/projects/mdsel-skill
├── hooks/
│   └── opencode/
│       ├── mdsel-reminder.ts    # NEW: TypeScript plugin for OpenCode
│       │                         # Responsibilities:
│       │                         # - Export Plugin type from @opencode-ai/plugin
│       │                         # - Hook tool.execute.after event
│       │                         # - Check if tool is Read
│       │                         # - Extract or track file path (args not directly available)
│       │                         # - Check if file is .md
│       │                         # - Count words using whitespace splitting
│       │                         # - Compare to MDSEL_MIN_WORDS threshold
│       │                         # - Output reminder if threshold exceeded
│       │                         # - Handle all errors gracefully
│       │
│       └── package.json          # NEW: Package configuration for plugin
│                                   # Responsibilities:
│                                   # - Define @opencode-ai/plugin dependency
│                                   # - Define @types/node dev dependency
│                                   # - Define typescript dev dependency
└── ...existing files...
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: tool.execute.after does NOT receive tool arguments directly
// The hook signature is: async ({ tool, sessionID, callID }, { title, output, metadata }) => {}
// Solution: Use tool.execute.before to track state, or parse file path from output

// CRITICAL: Reminder text is NORMATIVE - no variation allowed
// Exact text: "This is a Markdown file over the configured size threshold.\nUse `mdsel index` and `mdsel select` instead of Read."
// See: PRD.md section 6.3

// CRITICAL: OpenCode uses Bun runtime, not Node.js
// But Node.js fs module APIs are compatible
// Use: import { readFileSync, existsSync } from 'fs'

// GOTCHA: @opencode-ai/plugin package may not have published types
// May need to use type assertions or ambient declarations
// import type { Plugin } from "@opencode-ai/plugin"

// GOTCHA: console.log output in plugins is visible but may not inject into agent context
// Unlike Claude Code's hookSpecificOutput, OpenCode plugin output goes to console
// The reminder is still useful for agent conditioning

// CRITICAL: Word count must match bash implementation (wc -w equivalent)
// Bash: wc -w < "$file_path"
// TypeScript: content.split(/\s+/).filter(Boolean).length
// Both count whitespace-delimited tokens

// CRITICAL: Reminder fires EVERY time, not just first time
// No suppression, no "already warned" state
// This is intentional per PRD section 6.2

// CRITICAL: Environment variable default value
// process.env.MDSEL_MIN_WORDS || '200'
// Must be parsed as integer: parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

// GOTCHA: File paths may vary in format
// Use path.resolve() for absolute paths
// Check for .md extension with: filePath.endsWith('.md')

// CRITICAL: All file operations must be wrapped in try-catch
// Plugin should never throw exceptions during normal operation
// Silent degradation on errors is preferred

// GOTCHA: Plugin configuration uses file:// URIs
// In opencode.json: "file://.opencode/plugin/mdsel-reminder.ts"
// Plugin file location: .opencode/plugin/mdsel-reminder.ts

// CRITICAL: MCP tool calls do NOT trigger tool.execute.after
// This is fine - we're hooking the native Read tool
// See: plan/docs/opencode_plugins.md "Known Limitation"
```

## Implementation Blueprint

### Data models and structure

No ORM/database models required. Plugin uses:

```typescript
// Plugin type from @opencode-ai/plugin
import type { Plugin } from "@opencode-ai/plugin"

// Environment configuration
const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

// Simple word counting function
function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length
}

// File path extraction (heuristic or state tracking)
function extractFilePath(output: string): string | null {
  // Heuristic: extract from tool output
  // Alternative: track from tool.execute.before
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE hooks/opencode/ directory structure
  - IMPLEMENT: Directory for OpenCode TypeScript plugins
  - PLACEMENT: hooks/opencode/ in project root
  - NAMING: Lowercase directory names
  - OUTPUT: Empty hooks/opencode/ directory ready for plugin

Task 2: CREATE hooks/opencode/package.json
  - IMPLEMENT: Package configuration for TypeScript dependencies
  - DEPENDENCIES: @opencode-ai/plugin (latest)
  - DEV_DEPENDENCIES: @types/node (latest), typescript (latest)
  - NAMING: package.json (standard npm convention)
  - PLACEMENT: hooks/opencode/package.json
  - OUTPUT: Package configuration with proper dependencies

Task 3: CREATE hooks/opencode/mdsel-reminder.ts with imports and constants
  - IMPLEMENT: Basic plugin structure with imports and threshold constant
  - IMPORTS: import type { Plugin } from "@opencode-ai/plugin"
  - IMPORTS: import { readFileSync, existsSync } from 'fs'
  - CONSTANT: MDSEL_MIN_WORDS from process.env with default 200
  - NAMING: mdsel-reminder.ts (kebab-case, descriptive)
  - PLACEMENT: hooks/opencode/mdsel-reminder.ts
  - OUTPUT: Plugin skeleton with imports

Task 4: IMPLEMENT word count function
  - IMPLEMENT: countWords function using whitespace splitting
  - PATTERN: content.split(/\s+/).filter(Boolean).length
  - MATCH: Must match wc -w behavior from bash implementation
  - REFERENCE: hooks/claude/mdsel-reminder.sh word count logic
  - OUTPUT: Function that counts whitespace-delimited tokens

Task 5: IMPLEMENT file path tracking/extraction
  - IMPLEMENT: Method to obtain file path (args not available in after hook)
  - APPROACH A: Use tool.execute.before to track state
  - APPROACH B: Parse file path heuristically from tool output
  - APPROACH C: Return object from before hook with file path
  - REFERENCE: plan/P1M3T1/research/opencode-plugin-research.md "Alternative Approaches"
  - OUTPUT: Reliable method to get file path in after hook

Task 6: IMPLEMENT tool.execute.after hook
  - IMPLEMENT: Main hook function with tool validation
  - VALIDATION: Check if tool === 'Read'
  - VALIDATION: Check if file path ends with '.md'
  - VALIDATION: Check if file exists
  - ERROR HANDLING: Wrap all file operations in try-catch
  - PATTERN: Early exits for non-matching conditions
  - OUTPUT: Hook that processes Read operations on Markdown files

Task 7: IMPLEMENT reminder output logic
  - IMPLEMENT: Word count comparison and console.log output
  - THRESHOLD: Compare word count to MDSEL_MIN_WORDS
  - OUTPUT: console.log with normative reminder text (two lines)
  - NORMATIVE TEXT: "This is a Markdown file over the configured size threshold."
  - NORMATIVE TEXT: "Use `mdsel index` and `mdsel select` instead of Read."
  - REFERENCE: PRD.md section 6.3 for exact wording
  - OUTPUT: Complete plugin with reminder output

Task 8: CREATE hooks/opencode/tsconfig.json (if needed)
  - IMPLEMENT: TypeScript configuration for plugin compilation
  - TARGET: ES2020 or compatible target for Bun runtime
  - MODULE: ESNext for ESM compatibility
  - OUTPUT: TypeScript configuration file
```

### Implementation Patterns & Key Details

```typescript
// === Plugin Export Pattern ===
import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from 'fs'

const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

export const MdselReminder: Plugin = async ({ $ }) => {
  return {
    'tool.execute.after': async ({ tool }, { output }) => {
      // Implementation
    }
  }
}

// === Word Count Function (matches wc -w behavior) ===
function countWords(content: string): number {
  // Split by whitespace, filter empty strings, count remaining
  return content.split(/\s+/).filter(Boolean).length
}

// === File Path Tracking Challenge ===
// CRITICAL: tool.execute.after does NOT receive args directly
// Solution: Use tool.execute.before to store state

export const MdselReminder: Plugin = async ({ $ }) => {
  // Track file paths from before hook
  const filePathMap = new Map<string, string>()

  return {
    'tool.execute.before': async ({ tool, args }) => {
      if (tool === 'Read' && args?.file_path) {
        // Store file path for after hook
        filePathMap.set(args.file_path, args.file_path)
      }
    },

    'tool.execute.after': async ({ tool, callID }, { output }) => {
      // Only hook Read tool
      if (tool !== 'Read') return

      // CRITICAL: How to get file path here?
      // Option 1: Use callID to look up from before hook
      // Option 2: Parse heuristically from output
      // Option 3: Use a different state tracking approach

      // For now, use heuristic extraction from output
      const filePath = extractFilePathFromOutput(output)

      if (!filePath) return

      // Check if Markdown
      if (!filePath.endsWith('.md')) return

      // Check if file exists
      if (!existsSync(filePath)) return

      try {
        // Read file and count words
        const content = readFileSync(filePath, 'utf-8')
        const wordCount = countWords(content)

        if (wordCount > MDSEL_MIN_WORDS) {
          // Output normative reminder
          console.log('This is a Markdown file over the configured size threshold.')
          console.log('Use `mdsel index` and `mdsel select` instead of Read.')
        }
      } catch (error) {
        // Silent error handling - never throw
        console.error('Error reading file for word count:', error)
      }
    }
  }
}

// === Heuristic File Path Extraction ===
function extractFilePathFromOutput(output: string): string | null {
  // Try to extract file path from tool output
  // This is heuristic and may need adjustment based on actual output format

  // Pattern 1: Look for file path patterns in output
  const pathMatch = output.match(/(?:Read|Reading):\s*(.+?)(?:\n|$)/i)
  if (pathMatch) return pathMatch[1].trim()

  // Pattern 2: Look for absolute paths
  const absolutePathMatch = output.match(/\/[\w\/.-]+\.md/)
  if (absolutePathMatch) return absolutePathMatch[0]

  return null
}

// === State Tracking Alternative ===
// Use a Map to track file paths from before hook
const readOperationTracker = new Map<string, string>() // callID -> filePath

export const MdselReminder: Plugin = async ({ $ }) => {
  return {
    'tool.execute.before': async ({ tool, args, callID }) => {
      if (tool === 'Read' && args?.file_path) {
        readOperationTracker.set(callID, args.file_path)
      }
    },

    'tool.execute.after': async ({ tool, callID }, { output }) => {
      if (tool !== 'Read') return

      const filePath = readOperationTracker.get(callID)
      if (!filePath) return

      // Clean up tracking
      readOperationTracker.delete(callID)

      // Rest of implementation...
    }
  }
}
```

### Integration Points

```yaml
DIRECTORIES:
  - create: hooks/opencode/
  - purpose: Store OpenCode TypeScript plugins
  - location: Project root or user config directory

CONFIG:
  - location: .opencode.json OR ~/.config/opencode/opencode.json
  - configured in: P1.M4.T1 (Installation Script)
  - pattern: "plugin": ["file://hooks/opencode/mdsel-reminder.ts"]
  - NOT part of this task: Configuration comes in P1.M4.T1

DEPENDENCIES:
  - required: @opencode-ai/plugin (OpenCode plugin types)
  - dev: @types/node (Node.js type definitions)
  - dev: typescript (TypeScript compiler)

ENVIRONMENT:
  - variable: MDSEL_MIN_WORDS
  - default: 200
  - usage: parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

PLUGIN_LOCATIONS:
  - project: .opencode/plugin/plugin-name.ts
  - global: ~/.config/opencode/plugin/
  - our choice: hooks/opencode/ (for npm package distribution)

FILE_OPERATIONS:
  - read: fs.readFileSync (sync is fine for small files)
  - check: fs.existsSync (before reading)
  - encoding: 'utf-8'
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after plugin creation - fix before proceeding

# Check TypeScript syntax
cd hooks/opencode
npx tsc --noEmit mdsel-reminder.ts
# Expected: No type errors

# Install dependencies
npm install
# Expected: Dependencies installed successfully

# Run TypeScript compiler
npx tsc
# Expected: Compilation successful, outputs .js file

# Verify package.json is valid
cat package.json | jq .
# Expected: Valid JSON with proper structure
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test word count function
# Create test script
cat > test-wordcount.js << 'EOF'
function countWords(content) {
  return content.split(/\s+/).filter(Boolean).length;
}

// Test cases
console.log(countWords("hello world")); // Should be 2
console.log(countWords("one two three four five")); // Should be 5
console.log(countWords("")); // Should be 0
console.log(countWords("   ")); // Should be 0 (whitespace only)
console.log(countWords("word")); // Should be 1
EOF

node test-wordcount.js
# Expected: 2, 5, 0, 0, 1

# Test file path extraction
node -e "
const extract = (s) => {
  const m = s.match(/Read:\s*(.+?)(?:\n|$)/i);
  return m ? m[1].trim() : null;
};
console.log(extract('Read: /path/to/file.md\ncontent'));
console.log(extract('No file here'));
"
# Expected: /path/to/file.md, null

# Cleanup
rm test-wordcount.js
```

### Level 3: Integration Testing (System Validation)

```bash
# Create test Markdown files
cat > /tmp/small.md << 'EOF'
# Small File
This has few words.
EOF

cat > /tmp/large.md << 'EOF'
# Large File
EOF

# Add many words to large file ( > 200 words)
for i in {1..250}; do echo "word $i" >> /tmp/large.md; done

# Verify word counts
wc -w /tmp/small.md
# Expected: < 200

wc -w /tmp/large.md
# Expected: > 200

# Test plugin in Node.js (if types are available)
# Note: This requires the @opencode-ai/plugin package to be properly installed
cd hooks/opencode
node -e "
const { readFileSync, existsSync } = require('fs');

function countWords(content) {
  return content.split(/\s+/).filter(Boolean).length;
}

const testFiles = ['/tmp/small.md', '/tmp/large.md'];
const threshold = 200;

testFiles.forEach(file => {
  if (existsSync(file)) {
    const content = readFileSync(file, 'utf-8');
    const count = countWords(content);
    if (count > threshold) {
      console.log('File: ' + file + ' - Reminder should be shown');
      console.log('This is a Markdown file over the configured size threshold.');
      console.log('Use \`mdsel index\` and \`mdsel select\` instead of Read.');
    } else {
      console.log('File: ' + file + ' - No reminder needed');
    }
  }
});
"
# Expected: small.md - No reminder, large.md - Reminder shown

# Test environment variable override
MDSEL_MIN_WORDS=500 node -e "
const { readFileSync, existsSync } = require('fs');
const threshold = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10);
console.log('Threshold:', threshold);
"
# Expected: Threshold: 500

# Cleanup
rm /tmp/small.md /tmp/large.md
```

### Level 4: OpenCode Environment Validation

```bash
# Note: These tests require an actual OpenCode installation

# Create opencode.json for testing
cat > opencode.json << 'EOF'
{
  "plugin": [
    "file://./hooks/opencode/mdsel-reminder.ts"
  ]
}
EOF

# Start OpenCode with debug logging
# opencode --debug

# Test Read tool on small Markdown file
# In OpenCode: Read a file with < 200 words
# Expected: No reminder shown

# Test Read tool on large Markdown file
# In OpenCode: Read a file with > 200 words
# Expected: Reminder shown in console

# Test non-Markdown file
# In OpenCode: Read a .txt file
# Expected: No reminder shown

# Test environment variable
MDSEL_MIN_WORDS=500 opencode
# In OpenCode: Read a file with 250 words
# Expected: No reminder shown (threshold is 500)

# Cleanup
rm opencode.json
```

## Final Validation Checklist

### Technical Validation

- [ ] Plugin exists at hooks/opencode/mdsel-reminder.ts
- [ ] package.json exists with @opencode-ai/plugin dependency
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Plugin exports valid `Plugin` type
- [ ] All imports are properly typed
- [ ] Word count function matches wc -w behavior
- [ ] Environment variable MDSEL_MIN_WORDS is respected
- [ ] Default threshold is 200

### Feature Validation

- [ ] Only processes .md files (case-sensitive)
- [ ] Hooks tool.execute.after event
- [ ] Checks if tool is Read before processing
- [ ] File path is obtained (via state tracking or heuristic)
- [ ] File existence is checked before reading
- [ ] Reminder text matches normative wording exactly
- [ ] No output for files under threshold
- [ ] Reminder output for files over threshold

### Code Quality Validation

- [ ] All file operations wrapped in try-catch
- [ ] Silent error handling (no exceptions thrown)
- [ ] Early exits for non-matching conditions
- [ ] Uses fs.existsSync before fs.readFileSync
- [ ] UTF-8 encoding specified for file reads
- [ ] Constants declared at module level
- [ ] Functions are pure and testable

### Documentation & Deployment

- [ ] Code is self-documenting with clear variable names
- [ ] Comments explain non-obvious logic (especially file path extraction)
- [ ] package.json includes proper metadata
- [ ] Ready for P1.M4.T1 (Installation Script)

---

## Anti-Patterns to Avoid

- **Don't assume args is available in tool.execute.after** - It's not in the hook signature
- **Don't modify reminder text** - Wording is normative per PRD section 6.3
- **Don't add "first time only" logic** - Reminder fires every time intentionally
- **Don't throw exceptions** - Wrap all I/O in try-catch, handle errors gracefully
- **Don't use async file operations** - OpenCode uses synchronous execution in hooks
- **Don't cache word counts** - Each check is independent and stateless
- **Don't forget parseInt** - Environment variables are strings, must parse to int
- **Don't hardcode the threshold** - Use MDSEL_MIN_WORDS with default of 200
- **Don't use complex path parsing** - Keep file path extraction simple and heuristic
- **Don't read file content before checking extension** - Early exits save I/O
- **Don't ignore TypeScript errors** - Fix all type errors before considering complete
- **Don't forget to export the Plugin** - The export must be named correctly for OpenCode to load it

## Confidence Score

**8/10** - One-pass implementation success likelihood is very high

**Justification**:
- Complete hook signature and architecture provided
- Research documents address the key challenge (args not available in after hook)
- Exact code patterns and gotchas documented
- Comprehensive validation commands provided
- Research files with implementation examples available
- Parallel implementation (Claude Code hook) provides proven logic

**2 points deduction due to**:
- Uncertainty about exact @opencode-ai/plugin package API (may need type assertions)
- File path extraction method needs validation with actual OpenCode environment
- Tool.execute.before state tracking approach may need refinement

**To achieve 10/10**: Would need actual OpenCode environment testing and official @opencode-ai/plugin documentation, but current information is sufficient for implementation with potential minor adjustments during testing.
