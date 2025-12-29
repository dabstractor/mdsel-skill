# Implementation Patterns: mdsel-claude

## Code Organization

### Directory Structure
```
mdsel-claude/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── executor.ts           # Child process executor for mdsel CLI
│   ├── tools/
│   │   ├── index.ts          # Tool handler for mdsel_index
│   │   └── select.ts         # Tool handler for mdsel_select
│   ├── utils/
│   │   ├── word-count.ts     # Mechanical word counting
│   │   └── config.ts         # Environment variable handling
│   ├── index.test.ts         # MCP server tests
│   └── executor.test.ts      # Executor tests
├── hooks/
│   └── PreToolUse.d/
│       └── mdsel-reminder.sh # Read tool hook script
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Executor Pattern (from main branch)

### Child Process Spawning
```typescript
import { spawn } from 'child_process';

interface ExecutorResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function executeMdsel(
  command: 'index' | 'select',
  args: string[]
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    const proc = spawn('mdsel', [command, '--json', ...args], {
      shell: true,
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    proc.on('close', (exitCode) => {
      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode ?? 1
      });
    });
  });
}
```

## Tool Handler Pattern

### MCP Tool Definition
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerIndexTool(server: McpServer): void {
  server.tool(
    "mdsel_index",
    {
      files: z.array(z.string()).min(1).describe(
        "Markdown file paths to index for available selectors"
      )
    },
    async ({ files }) => {
      const result = await executeMdsel('index', files);

      return {
        content: [{
          type: "text",
          text: result.stdout || result.stderr
        }],
        isError: !result.success
      };
    }
  );
}
```

### Tool Description (Behavior-Shaping)
```typescript
const TOOL_DESCRIPTIONS = {
  mdsel_index: `Return a selector inventory for Markdown documents.

IMPORTANT: For Markdown files over ${process.env.MDSEL_MIN_WORDS || 200} words,
use this tool instead of Read.

Canonical usage:
1. Call mdsel_index to discover available selectors
2. Call mdsel_select with specific selectors

Selector Grammar:
- h1.0, h2.1 - Heading by type and index
- code.0, para.0 - Block by type and index
- h2.0/code.0 - Nested selection
- namespace::h2.0 - Scoped to document`,

  mdsel_select: `Retrieve Markdown content using declarative selectors.

IMPORTANT: For Markdown files over ${process.env.MDSEL_MIN_WORDS || 200} words,
use this tool instead of Read.

Selectors:
- h1.0 - First h1 heading
- h2.0-2 - Range of h2 headings
- code.0,2 - Specific code blocks
- h2.0/code.0 - Code block under h2

Always call mdsel_index first to discover valid selectors.`
};
```

## Word Count Utility

### Mechanical Implementation
```typescript
export function countWords(content: string): number {
  // Mechanical: whitespace-delimited tokens
  // Not semantic: no NLP
  // Not cached: fresh each call
  return content
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 0)
    .length;
}
```

## Hook Script Pattern

### PreToolUse Hook (Bash)
```bash
#!/bin/bash
# ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
# matcher: {"toolNames": ["Read"]}

# Read input from stdin (JSON)
INPUT=$(cat)

# Extract file path from tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Check if Markdown file
if [[ "$FILE_PATH" != *.md ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# Count words (mechanical: whitespace-delimited)
WORD_COUNT=$(wc -w < "$FILE_PATH")
THRESHOLD="${MDSEL_MIN_WORDS:-200}"

# Compare and inject reminder if over threshold
if [[ "$WORD_COUNT" -gt "$THRESHOLD" ]]; then
  echo '{"decision": "approve", "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}'
else
  echo '{"decision": "approve"}'
fi

exit 0
```

## Test Patterns

### Mocking Child Process
```typescript
import { vi, describe, it, expect } from 'vitest';
import * as child_process from 'child_process';

vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

describe('executeMdsel', () => {
  it('should parse JSON output from mdsel', async () => {
    const mockSpawn = vi.mocked(child_process.spawn);
    // Setup mock implementation...
  });
});
```

### Testing Tool Handlers
```typescript
describe('mdsel_index tool', () => {
  it('should pass files to mdsel index command', async () => {
    // Test that files array is correctly passed
  });

  it('should return raw JSON from mdsel', async () => {
    // Test no transformation of output
  });

  it('should propagate errors from mdsel', async () => {
    // Test error pass-through
  });
});
```

## Configuration Pattern

### Environment Variable Handling
```typescript
export interface Config {
  minWords: number;
}

export function loadConfig(): Config {
  const minWords = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10);

  return {
    minWords: isNaN(minWords) ? 200 : minWords
  };
}
```

## Error Handling Pattern

### Zero-Transformation Principle
```typescript
// DO NOT catch, rewrite, explain, or suggest fixes
// Simply pass through whatever mdsel returns

export async function handleToolCall(args: unknown): Promise<ToolResult> {
  const result = await executeMdsel(command, processedArgs);

  // Pass through exactly as received
  return {
    content: [{
      type: "text",
      text: result.stdout || result.stderr
    }],
    isError: !result.success
  };
}
```

## Build Configuration

### tsup.config.ts
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  banner: {
    js: '#!/usr/bin/env node'
  }
});
```

### package.json (partial)
```json
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel-claude": "./dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "peerDependencies": {
    "mdsel": "^1.0.0"
  }
}
```
