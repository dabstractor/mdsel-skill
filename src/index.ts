import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create MCP server instance with tools capability
export const server = new Server(
  {
    name: "mdsel-claude",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Import tools to register them with the server
import './tools/index.js';

// Main function to start the MCP server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Define cleanup handler for graceful shutdown
  const cleanup = async (): Promise<void> => {
    await transport.close();
    process.exit(0);
  };

  // Register signal handlers for graceful shutdown
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// Start the server with error handling
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
