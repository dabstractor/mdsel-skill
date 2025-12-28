import { execMdsel } from '../lib/mdsel-cli.js';
import type { MdselResult } from '../types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Input schema for mdsel_index tool
 * Uses Zod for runtime validation and MCP documentation
 */
export const mdselIndexInputSchema = z.object({
  files: z
    .array(z.string())
    .describe('Array of absolute file paths to Markdown documents to index'),
});

/**
 * Raw schema shape for MCP SDK (without .parse() method)
 */
export const MDSEL_INDEX_INPUT_SCHEMA = mdselIndexInputSchema.shape;

/**
 * Type extracted from schema (for TypeScript typing)
 */
export type MdselIndexInput = z.infer<typeof mdselIndexInputSchema>;

/**
 * Re-export CallToolResult for convenience
 */
export type { CallToolResult };

/**
 * Handle mdsel_index tool call
 *
 * Indexes Markdown documents to discover available selectors.
 * Returns JSON from mdsel verbatim - no parsing or transformation.
 *
 * @param args - Tool arguments containing files array
 * @returns MCP tool response with verbatim mdsel output
 *
 * @example
 * ```ts
 * const result = await handleMdselIndex({
 *   files: ['/path/to/README.md']
 * });
 * // result.content[0].text contains JSON from mdsel
 * ```
 */
export async function handleMdselIndex(args: { files: string[] }): Promise<CallToolResult> {
  // Call mdsel CLI with index command
  // Note: mdsel index outputs JSON by default, no --json flag needed
  const result: MdselResult = await execMdsel(['index', ...args.files]);

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
