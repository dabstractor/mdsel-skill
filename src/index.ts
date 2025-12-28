import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  handleMdselIndex,
  MDSEL_INDEX_INPUT_SCHEMA,
} from './tools/mdsel-index.js';
import {
  handleMdselSelect,
  MDSEL_SELECT_INPUT_SCHEMA,
} from './tools/mdsel-select.js';

// ============================================================
// TOOL DEFINITIONS - Use EXACT text from tool_definitions.md
// ============================================================

const TOOL_DESCRIPTIONS = {
  mdsel_index: `Index Markdown documents to discover available selectors. REQUIRED: Call this BEFORE mdsel_select when working with Markdown documents over 200 words. Do NOT use the Read tool for large Markdown files - use mdsel_index first to understand the document structure, then mdsel_select to retrieve specific sections.

Returns: JSON with selector inventory including headings, blocks (paragraphs, code, lists, tables), and word counts for each section.

Selector Grammar:
- namespace::type[index]/path?query
- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table
- Example: readme::heading:h2[0]/block:code[0]`,

  mdsel_select: `Retrieve specific content from Markdown documents using selectors. REQUIRED: Call mdsel_index first to discover available selectors. Do NOT use the Read tool for large Markdown files.

Returns: JSON with matched content and available child selectors for further drilling.

Selector Syntax:
- [namespace::]type[index][/path][?full=true]
- Types: heading:h1-h6, section, block:paragraph, block:code, block:list, block:table, block:blockquote
- Examples:
  - heading:h2[0] - First h2 heading
  - readme::heading:h1[0]/block:code[0] - First code block under first h1 in readme
  - section[1]?full=true - Second section with full content (bypass truncation)

Usage Pattern:
1. mdsel_index to discover selectors
2. mdsel_select with discovered selectors
3. Drill down with child selectors as needed`,
} as const;

// ============================================================
// CREATE SERVER
// ============================================================

const server = new Server(
  {
    name: 'mdsel-claude',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================
// LIST TOOLS HANDLER
// ============================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'mdsel_index',
        description: TOOL_DESCRIPTIONS.mdsel_index,
        inputSchema: MDSEL_INDEX_INPUT_SCHEMA,
      },
      {
        name: 'mdsel_select',
        description: TOOL_DESCRIPTIONS.mdsel_select,
        inputSchema: MDSEL_SELECT_INPUT_SCHEMA,
      },
    ],
  };
});

// ============================================================
// CALL TOOL HANDLER - Route to existing handlers
// ============================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // PATTERN: Route to existing handler functions
  // Do NOT reimplement handler logic here
  switch (name) {
    case 'mdsel_index': {
      // Provide default empty files array if args is undefined
      const indexArgs = args ?? { files: [] };
      return await handleMdselIndex({
        files: Array.isArray(indexArgs.files) ? indexArgs.files : [],
      });
    }
    case 'mdsel_select': {
      // Provide default values if args is undefined
      const selectArgs = args ?? { selector: '', files: [] };
      return await handleMdselSelect({
        selector: String(selectArgs.selector ?? ''),
        files: Array.isArray(selectArgs.files) ? selectArgs.files : [],
      });
    }
    default:
      // GOTCHA: Return MCP error format, don't throw
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// ============================================================
// EXPORT FOR TESTING
// ============================================================

export { server };

// ============================================================
// PRODUCTION ENTRY POINT
// ============================================================

if (import.meta.main) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
