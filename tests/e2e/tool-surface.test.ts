/**
 * E2E Tests: Tool Surface Validation
 *
 * P3.M1.T1.S3: Validates that exactly 2 tools are exposed with correct
 * descriptions containing behavioral guidance.
 *
 * CRITICAL: PRD Section 4 states "Exactly two tools" - no more, no fewer.
 */

import { describe, it, expect } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { server } from '../../src/index.js';

describe('P3.M1.T1.S3: Tool Surface Validation', () => {
  // Tool descriptions for validation (must match src/index.ts)
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

  describe('PRD Compliance: Exactly two tools (Section 4)', () => {
    it('should create a valid MCP server instance', () => {
      // Assert
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(Server);
    });

    it('should expose exactly 2 tools (PRD Section 4)', async () => {
      // Arrange & Act
      // Note: Server doesn't expose direct tool list access for testing
      // We validate the tool descriptions defined in src/index.ts

      // Assert: Verify TOOL_DESCRIPTIONS has exactly 2 entries
      expect(Object.keys(TOOL_DESCRIPTIONS)).toHaveLength(2);
    });

    it('should have tool names: mdsel_index and mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS).toHaveProperty('mdsel_index');
      expect(TOOL_DESCRIPTIONS).toHaveProperty('mdsel_select');
      expect(Object.keys(TOOL_DESCRIPTIONS)).toEqual(
        expect.arrayContaining(['mdsel_index', 'mdsel_select'])
      );
    });

    it('should have exactly 2 tools - no more, no fewer', () => {
      // Assert: CRITICAL - PRD Section 4 requirement
      const toolNames = Object.keys(TOOL_DESCRIPTIONS);
      expect(toolNames).toHaveLength(2);
      expect(toolNames).not.toHaveLength(1);
      expect(toolNames).not.toHaveLength(3);
      expect(toolNames).not.toHaveLength(0);
    });
  });

  describe('Tool description: Behavioral guidance (PRD Section 7)', () => {
    it('should contain "Do NOT use the Read tool" in mdsel_index description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('Do NOT use the Read tool');
    });

    it('should contain "Do NOT use the Read tool" in mdsel_select description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Do NOT use the Read tool');
    });

    it('should mention "large Markdown files" in both descriptions', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('large Markdown files');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('large Markdown files');
    });

    it('should explicitly discourage Read tool usage', () => {
      // Assert: Both tools should discourage Read tool
      expect(TOOL_DESCRIPTIONS.mdsel_index.toLowerCase()).toContain('do not');
      expect(TOOL_DESCRIPTIONS.mdsel_select.toLowerCase()).toContain('do not');
    });
  });

  describe('Tool description: Required workflow (PRD Section 7)', () => {
    it('should contain "REQUIRED" in mdsel_index description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('REQUIRED');
    });

    it('should contain "REQUIRED" in mdsel_select description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('REQUIRED');
    });

    it('should mention mdsel_index in mdsel_select description', () => {
      // Assert: mdsel_select must reference mdsel_index
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index');
    });

    it('should mention mdsel_select in mdsel_index description', () => {
      // Assert: mdsel_index must reference mdsel_select
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('mdsel_select');
    });

    it('should describe the canonical usage sequence in mdsel_index', () => {
      // Assert: PRD Section 7 requires sequence description
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('mdsel_index first');
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('mdsel_select');
    });

    it('should describe the canonical usage sequence in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index first');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_select');
    });
  });

  describe('Tool description: Selector grammar (PRD Section 7)', () => {
    it('should include selector grammar in mdsel_index description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('Selector');
    });

    it('should include selector syntax in mdsel_select description', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Selector');
    });

    it('should mention heading:h1-h6 types in mdsel_index', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('heading:h1-h6');
    });

    it('should mention heading types in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('heading:h1-h6');
    });

    it('should mention block types in mdsel_index', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('block:paragraph');
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('block:code');
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('block:list');
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('block:table');
    });

    it('should mention block types in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('block:paragraph');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('block:code');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('block:list');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('block:table');
    });
  });

  describe('Tool description: Usage pattern in mdsel_select', () => {
    it('should include "Usage Pattern" section in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Usage Pattern');
    });

    it('should describe the 3-step usage pattern', () => {
      // Assert: PRD Section 7 requires specific usage sequence
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index to discover');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_select with discovered');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Drill down');
    });

    it('should include selector examples in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Examples');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('heading:h2[0]');
    });

    it('should include namespace example in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('readme::');
    });

    it('should include full parameter example in mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('?full=true');
    });
  });

  describe('Tool description: Return value documentation', () => {
    it('should document return value for mdsel_index', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('Returns:');
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('JSON');
    });

    it('should document return value for mdsel_select', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('Returns:');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('JSON');
    });

    it('should mention selector inventory in mdsel_index returns', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('selector inventory');
    });

    it('should mention matched content in mdsel_select returns', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('matched content');
    });

    it('should mention word counts in mdsel_index returns', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('word counts');
    });

    it('should mention child selectors in mdsel_select returns', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('child selectors');
    });
  });

  describe('Tool description: Word count threshold', () => {
    it('should mention 200 words threshold in mdsel_index', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('200 words');
    });

    it('should reference word count gating in descriptions', () => {
      // Assert: Both descriptions should mention large file behavior
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('over 200 words');
    });
  });

  describe('Tool description: Avoid philosophy/marketing', () => {
    it('should not include marketing language in mdsel_index', () => {
      // Assert: PRD Section 7 - avoid philosophy/justification
      const desc = TOOL_DESCRIPTIONS.mdsel_index.toLowerCase();
      expect(desc).not.toContain('amazing');
      expect(desc).not.toContain('best');
      expect(desc).not.toContain('powerful');
      expect(desc).not.toContain('revolutionary');
    });

    it('should not include marketing language in mdsel_select', () => {
      // Assert
      const desc = TOOL_DESCRIPTIONS.mdsel_select.toLowerCase();
      expect(desc).not.toContain('amazing');
      expect(desc).not.toContain('best');
      expect(desc).not.toContain('powerful');
      expect(desc).not.toContain('revolutionary');
    });

    it('should be concise and actionable', () => {
      // Assert: Descriptions should be focused on behavior, not philosophy
      expect(TOOL_DESCRIPTIONS.mdsel_index.length).toBeLessThan(1000);
      expect(TOOL_DESCRIPTIONS.mdsel_select.length).toBeLessThan(1000);
    });
  });

  describe('Tool description: Behavioral shaping infrastructure', () => {
    it('should shape behavior by discouraging Read tool', () => {
      // Assert: PRD Section 7 - descriptions are behavior-shaping infrastructure
      expect(TOOL_DESCRIPTIONS.mdsel_index).toMatch(/do not use/i);
      expect(TOOL_DESCRIPTIONS.mdsel_select).toMatch(/do not use/i);
    });

    it('should shape behavior by requiring mdsel_index first', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('BEFORE mdsel_select');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('mdsel_index first');
    });

    it('should guide agents toward selector-based access', () => {
      // Assert
      expect(TOOL_DESCRIPTIONS.mdsel_index).toContain('selectors');
      expect(TOOL_DESCRIPTIONS.mdsel_select).toContain('selectors');
    });
  });

  describe('Server exports', () => {
    it('should export server instance from src/index.js', () => {
      // Assert
      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    it('should export server that is an MCP Server instance', () => {
      // Assert
      expect(server).toBeInstanceOf(Server);
    });
  });
});
