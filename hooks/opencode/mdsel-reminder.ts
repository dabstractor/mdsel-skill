/**
 * mdsel-reminder.ts - OpenCode plugin for mdsel usage reminders
 *
 * Reminds agents to use mdsel instead of Read when accessing large Markdown files.
 *
 * Trigger: tool.execute.after hook fires after Read tool completes
 * Logic:
 *   1. Check if tool was Read
 *   2. Check if file path ends with .md
 *   3. Count words using whitespace-delimited tokenization
 *   4. If word count > MDSEL_MIN_WORDS, output reminder to console
 *   5. Never throw exceptions - handle all errors gracefully
 *
 * Environment Variables:
 *   MDSEL_MIN_WORDS: Word count threshold (default: 200)
 */

import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from 'fs'

// Type for hook metadata with args (not in official types, needed for before hook)
interface HookMetaWithArgs {
  tool: string
  sessionID: string
  callID: string
  args?: Record<string, unknown>
}

// Word count threshold from environment variable with default of 200
const MDSEL_MIN_WORDS = parseInt(process.env.MDSEL_MIN_WORDS || '200', 10)

/**
 * Count words in text using whitespace-delimited tokenization.
 * Matches the behavior of `wc -w` command from the bash implementation.
 *
 * @param content - The text content to count words in
 * @returns The number of whitespace-delimited tokens
 */
function countWords(content: string): number {
  // Split by whitespace, filter out empty strings, count remaining tokens
  return content.split(/\s+/).filter(Boolean).length
}

/**
 * OpenCode plugin that reminds agents to use mdsel for large Markdown files.
 *
 * Uses tool.execute.before to track file paths (since args are not available
 * in tool.execute.after) and tool.execute.after to check and remind.
 */
export const mdselReminder: Plugin = async ({ $ }) => {
  // Track file paths from before hook using callID as key
  // Map<callID, filePath>
  const readOperationTracker = new Map<string, string>()

  return {
    // Track file reads in before hook since args are not available in after hook
    'tool.execute.before': async (meta: unknown) => {
      const { tool, args, callID } = meta as HookMetaWithArgs
      if (tool === 'Read' && args?.file_path && typeof args.file_path === 'string') {
        readOperationTracker.set(callID, args.file_path)
      }
    },

    // Check word count and show reminder in after hook
    'tool.execute.after': async ({ tool, callID }, { output }) => {
      // Only process Read tool
      if (tool !== 'Read') return

      // Get file path from tracker
      const filePath = readOperationTracker.get(callID)
      if (!filePath) return

      // Clean up tracking to prevent memory leaks
      readOperationTracker.delete(callID)

      // Early exit if not a Markdown file (case-sensitive check)
      if (!filePath.endsWith('.md')) return

      // Early exit if file doesn't exist
      if (!existsSync(filePath)) return

      try {
        // Read file content and count words
        const content = readFileSync(filePath, 'utf-8')
        const wordCount = countWords(content)

        // Check if threshold exceeded
        if (wordCount > MDSEL_MIN_WORDS) {
          // Output normative reminder text
          // Wording is normative per PRD.md section 6.3 - no variation allowed
          console.log('This is a Markdown file over the configured size threshold.')
          console.log('Use `mdsel index` and `mdsel select` instead of Read.')
        }
      } catch (error) {
        // Silent error handling - never throw exceptions during normal operation
        console.error('Error reading file for word count:', error)
      }
    }
  }
}

// Default export for OpenCode plugin loading
export default mdselReminder
