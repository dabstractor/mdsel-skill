import { execMdsel } from '../lib/mdsel-cli.js';
import type { MdselResult } from '../types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Input schema for mdsel_select tool
 * Uses Zod for runtime validation and MCP documentation
 */
export const mdselSelectInputSchema = z.object({
  selector: z
    .string()
    .describe("Selector string (e.g., 'heading:h2[0]', 'readme::section[1]?full=true')"),
  files: z
    .array(z.string())
    .describe('Array of absolute file paths to Markdown documents to search'),
});

/**
 * Raw schema shape for MCP SDK (without .parse() method)
 */
export const MDSEL_SELECT_INPUT_SCHEMA = mdselSelectInputSchema.shape;

/**
 * Type extracted from schema (for TypeScript typing)
 */
export type MdselSelectInput = z.infer<typeof mdselSelectInputSchema>;

/**
 * Re-export CallToolResult for convenience
 */
export type { CallToolResult };

/**
 * Handle mdsel_select tool call
 *
 * Retrieves specific content from Markdown documents using declarative selectors.
 * Returns JSON from mdsel verbatim - no parsing or transformation.
 *
 * @param args - Tool arguments containing selector and files array
 * @returns MCP tool response with verbatim mdsel output
 *
 * @example
 * ```ts
 * const result = await handleMdselSelect({
 *   selector: 'heading:h1[0]',
 *   files: ['/path/to/README.md']
 * });
 * // result.content[0].text contains JSON from mdsel
 * ```
 */
export async function handleMdselSelect(args: {
  selector: string;
  files: string[];
}): Promise<CallToolResult> {
  // Call mdsel CLI with select command
  // Note: selector comes first, then files
  // No --json flag needed (select outputs JSON by default)
  const result: MdselResult = await execMdsel(['select', args.selector, ...args.files]);

  // Return verbatim output in MCP format
  // CRITICAL: No parsing, no transformation, just passthrough
  return {
    content: [
      {
        type: 'text',
        text: result.stdout, // Raw mdsel output
      },
    ],
    isError: !result.success,
  };
}
