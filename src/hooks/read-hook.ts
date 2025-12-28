/**
 * PreToolUse Hook Script for Read Tool Interception
 *
 * Intercepts Read tool invocations for Markdown files and injects
 * behavioral reminders when file exceeds word count threshold.
 *
 * @module read-hook
 */

import { readFileSync } from 'fs';
import { extname } from 'path';
import { countWords, getWordThreshold } from '../lib/word-count.js';

// CRITICAL: Types must be local to hook file (not in shared types)
/**
 * PreToolUse Hook Input Schema
 *
 * Received from Claude Code via stdin when Read tool is invoked.
 */
interface HookInput {
  session_id: string;
  hook_event_name: string; // Always "PreToolUse"
  tool_name: string; // Always "Read" for this hook
  tool_input: {
    file_path: string; // Absolute path to file being read
  };
}

/**
 * PreToolUse Hook Output Schema
 *
 * Returned to Claude Code via stdout.
 */
interface HookOutput {
  continue: boolean; // Always true for this hook (never block)
  systemMessage?: string; // Reminder message if threshold exceeded
}

// CRITICAL: Reminder message MUST be exact (PRD Section 6.3)
// No variation allowed - must match exactly every time
const REMINDER_MESSAGE = `This is a Markdown file over the configured size threshold.
Use mdsel_index and mdsel_select instead of Read.`;

/**
 * Main hook execution function
 *
 * Reads HookInput from stdin, processes file, outputs HookOutput to stdout.
 * Always exits with code 0 (continue), never blocks the Read action.
 *
 * @example
 * ```bash
 * echo '{"session_id":"test","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/file.md"}}' | \
 *   node dist/hooks/read-hook.js
 * ```
 */
async function main(): Promise<void> {
  // PATTERN: Read stdin asynchronously using for await...of
  let inputData = '';
  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  // GOTCHA: JSON.parse can throw - but Claude Code guarantees valid JSON
  const input: HookInput = JSON.parse(inputData);

  // PATTERN: Initialize output with continue: true (never block)
  const output: HookOutput = { continue: true };

  // CRITICAL: Only process .md files - let other files pass through
  const filePath = input.tool_input.file_path;
  if (extname(filePath).toLowerCase() !== '.md') {
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // PATTERN: Try/catch for file operations - let Read tool handle errors
  try {
    const content = readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    const threshold = getWordThreshold();

    // CRITICAL: Only inject reminder if above threshold
    if (wordCount > threshold) {
      output.systemMessage = REMINDER_MESSAGE;
    }
  } catch {
    // File doesn't exist or can't be read
    // Let Read tool handle the error - don't crash the hook
    // PATTERN: Silent failure - output remains { continue: true }
  }

  // PATTERN: Output JSON to stdout, exit with 0
  console.log(JSON.stringify(output));
  process.exit(0);
}

// PATTERN: Invoke main and handle promise rejection
main().catch((_error) => {
  console.error(JSON.stringify({ continue: true }));
  process.exit(0);
});
