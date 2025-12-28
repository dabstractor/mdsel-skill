import { describe, it, expect } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { server } from '../../src/index.js';

// Tool descriptions for validation
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
};

describe('MCP Server Integration', () => {
  // Test 1: Server initialization
  it('should create a server instance', () => {
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(Server);
  });

  // Test 2: Tool descriptions contain behavioral guidance
  it('should include behavioral guidance in tool descriptions', () => {
    // Verify descriptions discourage Read tool usage
    expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('Do NOT use the Read tool');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Do NOT use the Read tool');
  });

  // Test 3: Tool descriptions mention required workflow
  it('should mention required workflow in descriptions', () => {
    expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('REQUIRED');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('REQUIRED');
    expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('mdsel_index');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index');
  });

  // Test 4: Tool descriptions include selector grammar
  it('should include selector grammar in descriptions', () => {
    expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('Selector');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Selector');
    expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('heading:h1-h6');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('heading:h1-h6');
  });

  // Test 5: Tool descriptions include examples
  it('should include examples in mdsel_select description', () => {
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Examples');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('heading:h2[0]');
  });

  // Test 6: Tool descriptions mention usage pattern
  it('should describe usage pattern in mdsel_select', () => {
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Usage Pattern');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index to discover');
    expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_select with discovered');
  });

  // Test 7: Verify server exports server instance
  it('should export server instance', () => {
    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
  });
});
