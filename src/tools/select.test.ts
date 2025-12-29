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
import { mdselSelectHandler, MdselSelectInputSchema } from './select.js';

// ============================================================
// FIXTURES
// ============================================================

/**
 * Creates a fresh server instance with mdsel_select tool registered.
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
  const mdselSelectTool = {
    name: 'mdsel_select',
    description: 'Select content from Markdown documents using declarative selectors. Returns selected content in TEXT format.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        selector: {
          type: 'string' as const,
          description: 'Declarative selector to identify content'
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

  // Register tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [mdselSelectTool]
    };
  });

  // Register tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'mdsel_select') {
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

      return mdselSelectHandler(validationResult.data);
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

describe('MdselSelectInputSchema', () => {
  it('should validate correct input with selector and files', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0',
      files: ['README.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('h2.0');
      expect(result.data.files).toEqual(['README.md']);
    }
  });

  it('should validate input with multiple files', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h1.0',
      files: ['README.md', 'GUIDE.md', 'docs/API.md']
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toHaveLength(3);
    }
  });

  it('should reject empty selector string', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: '',
      files: ['README.md']
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Selector is required');
    }
  });

  it('should reject missing selector property', () => {
    const result = MdselSelectInputSchema.safeParse({
      files: ['README.md']
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty files array', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0',
      files: []
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('At least one file path');
    }
  });

  it('should reject missing files property', () => {
    const result = MdselSelectInputSchema.safeParse({
      selector: 'h2.0'
    });

    expect(result.success).toBe(false);
  });
});

// ============================================================
// TEST SUITE: Tool Registration
// ============================================================

describe('mdsel_select Tool Registration', () => {
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

    const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
    expect(mdselSelectTool).toBeDefined();
  });

  it('should have correct tool name', async () => {
    const { tools } = await client.listTools();

    const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
    expect(mdselSelectTool?.name).toBe('mdsel_select');
  });

  it('should have tool description', async () => {
    const { tools } = await client.listTools();

    const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
    expect(mdselSelectTool?.description).toBeDefined();
    expect(typeof mdselSelectTool?.description).toBe('string');
  });

  it('should have correct input schema with selector and files properties', async () => {
    const { tools } = await client.listTools();

    const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
    expect(mdselSelectTool?.inputSchema).toBeDefined();
    expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('selector');
    expect(mdselSelectTool?.inputSchema.properties).toHaveProperty('files');
  });

  it('should have selector and files as required properties in schema', async () => {
    const { tools } = await client.listTools();

    const mdselSelectTool = tools.find(t => t.name === 'mdsel_select');
    expect(mdselSelectTool?.inputSchema.required).toContain('selector');
    expect(mdselSelectTool?.inputSchema.required).toContain('files');
  });
});

// ============================================================
// TEST SUITE: Tool Execution - Success Path
// ============================================================

describe('mdsel_select Tool Execution - Success Path', () => {
  let client: Client;
  let server: Server;

  beforeEach(async () => {
    const setup = await createConnectedClient();
    client = setup.client;
    server = setup.server;

    // Mock successful executor result with TEXT output format
    vi.mocked(executeMdsel).mockResolvedValue({
      success: true,
      stdout: '## Installation\n\n```bash\nnpm install -g mdsel\n```\n',
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
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });

  it('should return TEXT output in content[0].text', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['README.md'] }
    });

    expect(result.content[0].text).toContain('Installation');
    expect(result.content[0].text).toContain('npm install -g mdsel');
  });

  it('should call executeMdsel with correct arguments', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['README.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h2.0', 'README.md']);
  });

  it('should call executeMdsel with select command', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalled();
    const callArgs = vi.mocked(executeMdsel).mock.calls[0];
    expect(callArgs[0]).toBe('select');
  });

  it('should handle multiple files', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['README.md', 'GUIDE.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h1.0', 'README.md', 'GUIDE.md']);
  });

  it('should pass through stdout unchanged (no transformation)', async () => {
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

  it('should not set isError flag on success', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h1.0', files: ['README.md'] }
    });

    expect(result.isError).toBeUndefined();
  });
});

// ============================================================
// TEST SUITE: Tool Execution - Error Path
// ============================================================

describe('mdsel_select Tool Execution - Error Path', () => {
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
      stderr: '!h2.99\nIndex out of range: document has 3 h2 headings\n~h2.0 ~h2.1 ~h2.2',
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
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['README.md'] }
    });

    expect(result.isError).toBe(true);
  });

  it('should return stderr in content text on error', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['README.md'] }
    });

    expect(result.content[0].text).toContain('Index out of range');
  });

  it('should call executeMdsel even on error path', async () => {
    await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.99', files: ['test.md'] }
    });

    expect(executeMdsel).toHaveBeenCalledWith('select', ['h2.99', 'test.md']);
  });

  it('should return error message when stderr is empty', async () => {
    vi.mocked(executeMdsel).mockResolvedValue({
      success: false,
      stdout: '',
      stderr: '',
      exitCode: 1
    });

    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: ['test.md'] }
    });

    expect(result.content[0].text).toContain('mdsel select command failed');
    expect(result.isError).toBe(true);
  });
});

// ============================================================
// TEST SUITE: Input Validation
// ============================================================

describe('mdsel_select Tool Execution - Input Validation', () => {
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

  it('should reject empty selector string', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: '', files: ['README.md'] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input validation error');
  });

  it('should reject missing selector property', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { files: ['README.md'] }
    } as any);

    expect(result.isError).toBe(true);
  });

  it('should reject empty files array', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0', files: [] }
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input validation error');
  });

  it('should reject missing files property', async () => {
    const result = await client.callTool({
      name: 'mdsel_select',
      arguments: { selector: 'h2.0' }
    } as any);

    expect(result.isError).toBe(true);
  });
});
