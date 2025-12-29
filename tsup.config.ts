import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  // CRITICAL: Externalize MCP SDK to avoid bundling errors
  external: ['@modelcontextprotocol/sdk', 'node:*'],
  // Add shebang for executable
  banner: {
    js: '#!/usr/bin/env node',
  },
});
