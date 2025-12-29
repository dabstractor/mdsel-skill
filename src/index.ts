import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create MCP server instance
const server = new Server({
  name: "mdsel-claude",
  version: "1.0.0"
});

// Tools will be registered in P1.M2.T1 and P1.M3

// Main function to start the MCP server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start the server with error handling
main().catch(console.error);
