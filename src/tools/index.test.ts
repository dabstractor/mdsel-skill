import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';

// CRITICAL: vi.mock must be at top level before imports
vi.mock('../executor.js', () => ({
  executeMdsel: vi.fn()
}));

import { executeMdsel } from '../executor.js';
import { mdselIndexHandler, MdselIndexInputSchema } from './index.js';

// ============================================================
// FIXTURES
// ============================================================

/**
 * Creates a fresh server instance with mdsel_index tool registered.
 * Uses InMemoryTransport for in-process testing.
 */
async function createTestServer() {
  const server = new Server(
    {
      name: 'mdsel-claude-test',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Import and set up the request handlers
  const { CallToolRequestSchema, ListToolsRequestSchema } = await import('@modelcontextprotocol/sdk/types.js');

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

  // Register tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [mdselIndexTool]
    };
  });

  // Register tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'mdsel_index') {
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

      return mdselIndexHandler(validationResult.data);
    }

    return {
      content: [{
        type: 'text',
        text: `Unknown tool: ${name}`
      }],
      isError: true
    };
  });

  return server;
}

/**
 * Creates a connected client-server pair for testing.
 */
async function createConnectedClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const server = await createTestServer();
  await server.connect(serverTransport);

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(clientTransport);

  return { client, server };
}

// ============================================================
// TEST SUITE: Zod Schema Validation
// ============================================================

describe('MdselIndexInputSchema', () => {
  it('should validate correct input with files array', () => {
    const result = MdselIndexInputSchema.safeParse({
      files: ['README.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toEqual(['README.md']);
    }
  });

  it('should validate input with multiple files', () => {
    const result = MdselIndexInputSchema.safeParse({
      files: ['README.md', 'GUIDE.md', 'docs/API.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toHaveLength(3);
    }
  });

  it('should reject empty files array', () => {
    const result = MdselIndexInputSchema.safeParse({
      files: []
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('At least one file path');
    }
  });

  it('should reject input without files property', () => {
    const result = MdselIndexInputSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject non-array files input', () => {
    const result = MdselIndexInputSchema.safeParse({
      files: 'README.md'
    });

    expect(result.success).toBe(false);
  });

  it('should reject array with non-string elements', () => {
    const result = MdselIndexInputSchema.safeParse({
      files: [123, null, undefined]
    });

    expect(result.success).toBe(false);
  });
});

// ============================================================
// TEST SUITE: Tool Registration
// ============================================================

describe('mdsel_index Tool Registration', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should list the registered tool', async () => {
    const { tools } = await client.listTools();

    expect(tools).toBeDefined();
    expect(tools.length).toBeGreaterThan(0);

    const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
    expect(mdselIndexTool).toBeDefined();
  });

  it('should have correct tool name', async () => {
    const { tools } = await client.listTools();

    const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
    expect(mdselIndexTool?.name).toBe('mdsel_index');
  });

  it('should have tool description', async () => {
    const { tools } = await client.listTools();

    const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
    expect(mdselIndexTool?.description).toBeDefined();
    expect(typeof mdselIndexTool?.description).toBe('string');
  });

  it('should have correct input schema with files property', async () => {
    const { tools } = await client.listTools();

    const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
    expect(mdselIndexTool?.inputSchema).toBeDefined();
    expect(mdselIndexTool?.inputSchema.properties).toHaveProperty('files');
  });

  it('should have files as required property in schema', async () => {
    const { tools } = await client.listTools();

    const mdselIndexTool = tools.find(t => t.name === 'mdsel_index');
    expect(mdselIndexTool?.inputSchema.required).toContain('files');
  });
});

// ============================================================
// TEST SUITE: Tool Execution - Success Path
// ============================================================

describe('mdsel_index Tool Execution - Success Path', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;

    // Mock successful executor result with TEXT output format
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: 'h1.0 Main Title\n h2.0 Section One\n h2.1 Section Two\n---\ncode:1 para:5 list:1\n',
      stderr: '',
      exitCode: 0
    });
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should execute tool successfully', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });

  it('should return TEXT output in content[0].text', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(result.content[0].text).toContain('h1.0 Main Title');
    expect(result.content[0].text).toContain('---');
    expect(result.content[0].text).toContain('code:1 para:5 list:1');
  });

  it('should call executeMdsel with correct arguments', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['test.md']);
  });

  it('should call executeMdsel with index command', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(executeMdsel).toHaveBeenCalled();
    const callArgs = vi.mocked(executeMdsel).mock.calls[0];
    expect(callArgs[0]).toBe('index');
  });

  it('should handle multiple files', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md', 'GUIDE.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['README.md', 'GUIDE.md']);
  });

  it('should pass through stdout unchanged (no transformation)', async () => {
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

  it('should not set isError flag on success', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
  });
});

// ============================================================
// TEST SUITE: Tool Execution - Error Path
// ============================================================

describe('mdsel_index Tool Execution - Error Path', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;

    // Mock failed executor result
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '!FILE_NOT_FOUND: File not found: missing.md',
      exitCode: 1
    });
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should handle execution errors with isError flag', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['missing.md'] }
    });

    expect(result.isError).toBe(true);
  });

  it('should return stderr in content text on error', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['nonexistent.md'] }
    });

    expect(result.content[0].text).toContain('FILE_NOT_FOUND');
  });

  it('should call executeMdsel even on error path', async () => {
    await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['missing.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('index', ['missing.md']);
  });

  it('should return error message when stderr is empty', async () => {
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '',
      exitCode: 1
    });

    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: ['test.md'] }
    });

    expect(result.content[0].text).toContain('mdsel index command failed');
    expect(result.isError).toBe(true);
  });
});

// ============================================================
// TEST SUITE: Input Validation
// ============================================================

describe('mdsel_index Tool Execution - Input Validation', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should reject empty files array', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: [] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input validation error');
  });

  it('should reject input without files property', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: {}
    } as any);

    expect(result.isError).toBe(true);
  });

  it('should reject non-array files input', async () => {
    const result = await client.callTool({
      name: 'mdsel_index',
      arguments: { files: 'README.md' }
    } as any);

    expect(result.isError).toBe(true);
  });
});

// ============================================================
// TEST SUITE: Unknown Tool Handling
// ============================================================

describe('Tool Execution - Unknown Tool', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.clearAllMocks();
  });

  it('should return error for unknown tool name', async () => {
    const result = await client.callTool({
      name: 'unknown_tool',
      arguments: { files: ['README.md'] }
    } as any);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });
});
