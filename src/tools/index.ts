import { z } from 'zod';
import { executeMdsel } from '../executor.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { MdselSelectInputSchema, mdselSelectHandler, mdselSelectTool } from './select.js';

// ============================================================
// ZOD SCHEMA - Input validation for mdsel_index tool
// ============================================================

/**
 * Zod schema for mdsel_index tool input validation.
 * Requires at least one file path to be provided.
 */
export const MdselIndexInputSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file path is required')
});

// Type inference from Zod schema
export type MdselIndexInput = z.infer<typeof MdselIndexInputSchema>;

// ============================================================
// TOOL HANDLER - mdsel_index implementation
// ============================================================

/**
 * Handler for the mdsel_index tool.
 *
 * Returns a selector inventory for Markdown documents by invoking
 * the mdsel CLI with the 'index' command.
 *
 * @param args - Validated input arguments containing files array
 * @returns CallToolResult with TEXT output from mdsel (pass-through)
 */
export async function mdselIndexHandler(
  args: MdselIndexInput
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const { files } = args;

  // Delegate to executor (already configured for TEXT output mode)
  const result = await executeMdsel('index', files);

  // Return pass-through result (thin wrapper doctrine)
  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: result.stderr || 'mdsel index command failed'
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
// TOOL REGISTRATION - Register with MCP Server
// ============================================================

/**
 * Register the mdsel_index tool with the MCP server.
 *
 * Uses the low-level Server.setRequestHandler() API to register
 * handlers for 'tools/list' and 'tools/call' request types.
 */

// Define the tool schema for tools/list response
const mdselIndexTool = {
  name: 'mdsel_index',
  description: 'Return a selector inventory for Markdown documents. Lists all available selectors (headings, code blocks, etc.) in hierarchical TEXT format.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      files: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Array of Markdown file paths to index',
        minItems: 1
      }
    },
    required: ['files']
  }
};

/**
 * Register all mdsel tools with the MCP server instance.
 * This function is called from src/index.ts after the server is created.
 *
 * @param server - The MCP server instance to register tools with
 */
export function registerTools(server: Server): void {
  // Register tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [mdselIndexTool, mdselSelectTool]
    };
  });

  // Register tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Handle mdsel_index tool calls
    if (name === 'mdsel_index') {
      // Validate input using Zod schema
      const validationResult = MdselIndexInputSchema.safeParse(args);

      if (!validationResult.success) {
        return {
          content: [{
            type: 'text',
            text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
          }],
          isError: true
        };
      }

      // Call the handler with validated input
      return mdselIndexHandler(validationResult.data);
    }

    // Handle mdsel_select tool calls
    if (name === 'mdsel_select') {
      // Validate input using Zod schema
      const validationResult = MdselSelectInputSchema.safeParse(args);

      if (!validationResult.success) {
        return {
          content: [{
            type: 'text',
            text: `Input validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`
          }],
          isError: true
        };
      }

      // Call the handler with validated input
      return mdselSelectHandler(validationResult.data);
    }

    // Unknown tool
    return {
      content: [{
        type: 'text',
        text: `Unknown tool: ${name}`
      }],
      isError: true
    };
  });
}
