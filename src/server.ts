// CRITICAL: Note the .js extension in this import
// Source file is .ts, but import references compiled .js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

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

export { server };
