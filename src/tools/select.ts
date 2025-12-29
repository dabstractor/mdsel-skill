import { z } from 'zod';
import { executeMdsel } from '../executor.js';

// ============================================================
// ZOD SCHEMA - Input validation for mdsel_select tool
// ============================================================

/**
 * Zod schema for mdsel_select tool input validation.
 * Requires a non-empty selector string and at least one file path.
 */
export const MdselSelectInputSchema = z.object({
  selector: z.string().min(1, 'Selector is required'),
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type inference from Zod schema
export type MdselSelectInput = z.infer<typeof MdselSelectInputSchema>;

// ============================================================
// TOOL HANDLER - mdsel_select implementation
// ============================================================

/**
 * Handler for the mdsel_select tool.
 *
 * Retrieves Markdown content using selectors by invoking the mdsel
 * CLI with the 'select' command.
 *
 * @param args - Validated input arguments containing selector and files
 * @returns CallToolResult with TEXT output from mdsel (pass-through)
 */
export async function mdselSelectHandler(
  args: MdselSelectInput
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const { selector, files } = args;

  // CRITICAL: Selector comes first in args array
  // Command: mdsel select <selector> [files...]
  const result = await executeMdsel('select', [selector, ...files]);

  // Return pass-through result (thin wrapper doctrine)
  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel select command failed'
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: 'text',
      text: result.stdout  // Pass through unchanged - no parsing or transformation
    }]
  };
}

// ============================================================
// TOOL DEFINITION - Tool schema for registration
// ============================================================

/**
 * Tool definition for mdsel_select.
 * This is exported and registered in src/tools/index.ts via the registerTools function.
 */

// Define the tool schema for tools/list response
const mdselSelectTool = {
  name: 'mdsel_select',
  description: 'Select content from Markdown documents using declarative selectors. Returns selected content in TEXT format. Selector syntax: h1.0 (first h1), h2.1-3 (h2 indices 1-3), code.0 (first code block), h2.0/code.0 (code under h2), namespace::h2.0 (scoped selector). Use mdsel_index first to discover available selectors.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      selector: {
        type: 'string' as const,
        description: 'Declarative selector to identify content (e.g., "h1.0", "h2.1-3", "code.0")'
      },
      files: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Array of Markdown file paths to select from',
        minItems: 1
      }
    },
    required: ['selector', 'files']
  }
};

// Export tool definition for registration in index.ts
export { mdselSelectTool };
