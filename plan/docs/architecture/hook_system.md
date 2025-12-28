# Hook System: mdsel-claude

## Reminder Hook Architecture

The reminder hook system intercepts `Read` tool invocations for Markdown files and injects reminders when the file exceeds the word count threshold.

## Hook Configuration

### Claude Code Settings Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/mdsel-claude/dist/read-hook.js"
          }
        ]
      }
    ]
  }
}
```

## Hook Behavior

### Trigger Conditions (All Must Be True)

1. Claude invokes the `Read` tool
2. Target file has `.md` extension (Markdown file)
3. File word count exceeds `MDSEL_MIN_WORDS` (default: 200)

### Flow Diagram

```
Claude invokes Read tool
         │
         ▼
┌─────────────────────────┐
│  PreToolUse Hook Fires  │
│  (read-hook.js)         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Is file a .md file?    │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
    No            Yes
     │             │
     ▼             ▼
┌─────────┐  ┌─────────────────────────┐
│Continue │  │ Count words in file     │
│ (exit 0)│  │ (whitespace-delimited)  │
└─────────┘  └───────────┬─────────────┘
                         │
                         ▼
             ┌───────────────────────────┐
             │ word_count > MIN_WORDS?   │
             └───────────┬───────────────┘
                         │
                  ┌──────┴──────┐
                  │             │
                 No            Yes
                  │             │
                  ▼             ▼
           ┌─────────┐   ┌──────────────────────┐
           │Continue │   │ Inject reminder via  │
           │(exit 0) │   │ systemMessage        │
           └─────────┘   │ Continue (exit 0)    │
                         └──────────────────────┘
```

## Implementation

### read-hook.ts

```typescript
#!/usr/bin/env node
import { readFileSync } from 'fs';
import { extname } from 'path';

interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: {
    file_path: string;
  };
}

interface HookOutput {
  continue: boolean;
  systemMessage?: string;
}

const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS ?? '200', 10);

const REMINDER_MESSAGE = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

function countWords(content: string): number {
  return content.split(/\s+/).filter((token) => token.length > 0).length;
}

async function main(): Promise<void> {
  // Read input from stdin
  let inputData = '';
  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  const input: HookInput = JSON.parse(inputData);
  const output: HookOutput = { continue: true };

  // Check if this is a Markdown file
  const filePath = input.tool_input.file_path;
  if (extname(filePath).toLowerCase() !== '.md') {
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // Read file and count words
  try {
    const content = readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);

    if (wordCount > MDSEL_MIN_WORDS) {
      output.systemMessage = REMINDER_MESSAGE;
    }
  } catch {
    // File doesn't exist or can't be read - let Read tool handle error
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
```

## Reminder Content (Normative)

Per PRD Section 6.3, the reminder message is:

```
This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.
```

### Requirements

- Short
- Neutral
- Identical every time
- Non-judgmental
- Non-negotiable in tone

**No variation is allowed.**

## Reminder Frequency

Per PRD Section 6.2:

- Fires **every time**
- No suppression
- No "first warning only" behavior

"Repetition is intentional and considered a feature."

## Word Count Gating

### Environment Variable

```bash
MDSEL_MIN_WORDS=200  # Default
```

### Gating Rules

| Condition                     | Behavior                                  |
| ----------------------------- | ----------------------------------------- |
| word_count <= MDSEL_MIN_WORDS | File may be returned in full, no reminder |
| word_count > MDSEL_MIN_WORDS  | Selector access required, reminder fires  |

### Word Count Algorithm

```typescript
function countWords(content: string): number {
  return content.split(/\s+/).filter((token) => token.length > 0).length;
}
```

Properties:

- Mechanical (simple whitespace split)
- Based on whitespace-delimited tokens
- Not semantic
- Not cached across sessions

## Exit Codes

| Code | Meaning | Hook Action                          |
| ---- | ------- | ------------------------------------ |
| 0    | Success | Continue with optional systemMessage |
| 1    | Error   | Show error to user                   |
| 2    | Block   | Prevent the Read action              |

Note: This hook always uses exit code 0 (continue) with a systemMessage for reminders. It never blocks the Read action - it only reminds.

## Testing Considerations

1. **Hook receives correct input format**
2. **Non-.md files pass through without reminder**
3. **Files <= threshold pass through without reminder**
4. **Files > threshold trigger reminder message**
5. **Word count is accurate (whitespace-delimited)**
6. **Missing files don't crash hook**
7. **Reminder message is exactly as specified**
