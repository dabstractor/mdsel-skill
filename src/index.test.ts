// CRITICAL: vi.mock must be at top level before imports
vi.mock('./executor.js', () => ({
  executeMdsel: vi.fn()
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { executeMdsel } from './executor.js';
import { server } from './index.js';

// ============================================================
// FIXTURES
// ============================================================

/**
 * Creates a connected client-server pair for integration testing.
 * Uses the exported server instance from src/index.ts which already has
 * both mdsel_index and mdsel_select tools registered via registerTools().
 *
 * NOTE: The server instance is created at module load time, so we need
 * to create a fresh transport connection for each test rather than
 * creating a new server instance.
 */
async function createConnectedClient() {
  // Create linked transport pair for client-server communication
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  // Connect the exported server instance to the server transport
  await server.connect(serverTransport);

  // Create a client instance
  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  // Connect client to the client transport
  await client.connect(clientTransport);

  return { client, server };
}

// ============================================================
// TEST SUITE: MCP Server Integration
// ============================================================

describe('MCP Server Integration', () => {
  let client: Client;
  let testServer: Server;

  beforeEach(async () => {
    // Create fresh client-server pair for each test
    const setup = await createConnectedClient();
    client = setup.client;
    testServer = setup.server;
  });

  afterEach(async () => {
    // Clean up resources after each test
    await client.close();
    await testServer.close();
    vi.clearAllMocks();
  });

  // ============================================================
  // TEST SUITE: Tool Registration
  // ============================================================

  describe('Tool Registration', () => {
    it('should list exactly 2 tools', async () => {
      const { tools } = await client.listTools();

      expect(tools).toBeDefined();
      expect(tools.length).toBe(2);
    });

    it('should have mdsel_index tool with correct properties', async () => {
      const { tools } = await client.listTools();

      const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
      expect(mdselIndexTool).toBeDefined();
      expect(mdselIndexTool?.name).toBe('mdsel_index');
      expect(mdselIndexTool?.description).toContain('selector inventory');
      expect(mdselIndexTool?.inputSchema).toBeDefined();
      expect(mdselIndexTool?.inputSchema.properties).toHaveProperty('files');
      expect(mdselIndexTool?.inputSchema.required).toContain('files');
    });

    it('should have mdsel_select tool with correct properties', async () => {
      const { tools } = await client.listTools();

      const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
      expect(mdselSelectTool).toBeDefined();
      expect(mdselSelectTool?.name).toBe('mdsel_select');
      expect(mdselSelectTool?.description.toLowerCase()).toContain('select content');
      expect(mdselSelectTool?.inputSchema).toBeDefined();
      expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('selector');
      expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('files');
      expect(mdselSelectTool?.inputSchema.required).toContain('selector');
      expect(mdselSelectTool?.inputSchema.required).toContain('files');
    });

    it('should have correct tool names exactly', async () => {
      const { tools } = await client.listTools();

      const toolNames = tools.map(t => t.name).sort();
      expect(toolNames).toEqual(['mdsel_index', 'mdsel_select']);
    });
  });

  // ============================================================
  // TEST SUITE: mdsel_index Tool Execution
  // ============================================================

  describe('mdsel_index Tool Execution', () => {
    beforeEach(async () => {
      // Mock successful executor result with TEXT output format
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: 'h1.0 Main Title\n h2.0 Section One\n h2.1 Section Two\n---\ncode:1 para:5 list:1\n',
        stderr: '',
        exitCode: 0
      });
    });

    it('should execute mdsel_index successfully', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { files: ['README.md'] }
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('h1.0 Main Title');
    });

    it('should call executor with correct arguments for mdsel_index', async () => {
      await client.callTool({
        name: 'mdsel_index',
        arguments: { files: ['test.md', 'docs.md'] }
      });

      expect(executeMdsel).toHaveBeenCalledWith('index', ['test.md', 'docs.md']);
    });

    it('should pass through stdout unchanged for mdsel_index', async () => {
      const expectedOutput = 'h1.0 Test\n h2.0 Sub\n---\ncode:0 para:1\n';
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: expectedOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { files: ['test.md'] }
      });

      expect(result.content[0].text).toBe(expectedOutput);
    });

    it('should handle executor errors for mdsel_index', async () => {
      vi.mocked(executeMdsel).mockResolvedValue({
        success: false,
        stdout: '',
        stderr: '!FILE_NOT_FOUND: File not found',
        exitCode: 1
      });

      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { files: ['missing.md'] }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('FILE_NOT_FOUND');
    });

    it('should reject empty files array for mdsel_index', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { files: [] }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Input validation error');
    });
  });

  // ============================================================
  // TEST SUITE: mdsel_select Tool Execution
  // ============================================================

  describe('mdsel_select Tool Execution', () => {
    beforeEach(async () => {
      // Mock successful executor result with TEXT output format
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: '## Installation\n\n```bash\nnpm install -g mdsel\n```\n',
        stderr: '',
        exitCode: 0
      });
    });

    it('should execute mdsel_select successfully', async () => {
      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: 'h2.0', files: ['README.md'] }
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Installation');
    });

    it('should call executor with correct arguments for mdsel_select', async () => {
      await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: 'h1.0', files: ['test.md', 'docs.md'] }
      });

      expect(executeMdsel).toHaveBeenCalledWith('select', ['h1.0', 'test.md', 'docs.md']);
    });

    it('should pass through stdout unchanged for mdsel_select', async () => {
      const expectedOutput = '## Test Heading\n\nContent here\n';
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: expectedOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: 'h2.0', files: ['test.md'] }
      });

      expect(result.content[0].text).toBe(expectedOutput);
    });

    it('should handle executor errors for mdsel_select', async () => {
      vi.mocked(executeMdsel).mockResolvedValue({
        success: false,
        stdout: '',
        stderr: '!h2.99\nIndex out of range: document has 3 h2 headings\n',
        exitCode: 1
      });

      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: 'h2.99', files: ['README.md'] }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Index out of range');
    });

    it('should reject empty selector for mdsel_select', async () => {
      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: '', files: ['test.md'] }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Input validation error');
    });

    it('should reject empty files array for mdsel_select', async () => {
      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { selector: 'h1.0', files: [] }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Input validation error');
    });
  });

  // ============================================================
  // TEST SUITE: Input Validation
  // ============================================================

  describe('Input Validation', () => {
    it('should reject unknown tool name', async () => {
      const result = await client.callTool({
        name: 'unknown_tool',
        arguments: { files: ['test.md'] }
      } as any);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    it('should reject missing files property for mdsel_index', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: {}
      } as any);

      expect(result.isError).toBe(true);
    });

    it('should reject missing selector property for mdsel_select', async () => {
      const result = await client.callTool({
        name: 'mdsel_select',
        arguments: { files: ['test.md'] }
      } as any);

      expect(result.isError).toBe(true);
    });

    it('should reject non-array files input for mdsel_index', async () => {
      const result = await client.callTool({
        name: 'mdsel_index',
        arguments: { files: 'README.md' }
      } as any);

      expect(result.isError).toBe(true);
    });
  });

  // ============================================================
  // TEST SUITE: Concurrent Tool Execution
  // ============================================================

  describe('Concurrent Tool Execution', () => {
    beforeEach(async () => {
      // Mock successful executor result
      vi.mocked(executeMdsel).mockResolvedValue({
        success: true,
        stdout: 'mock output',
        stderr: '',
        exitCode: 0
      });
    });

    it('should execute both tools in parallel', async () => {
      const [indexResult, selectResult] = await Promise.all([
        client.callTool({
          name: 'mdsel_index',
          arguments: { files: ['README.md'] }
        }),
        client.callTool({
          name: 'mdsel_select',
          arguments: { selector: 'h1.0', files: ['README.md'] }
        })
      ]);

      expect(indexResult.isError).toBeUndefined();
      expect(selectResult.isError).toBeUndefined();
      expect(executeMdsel).toHaveBeenCalledTimes(2);
    });
  });
});
