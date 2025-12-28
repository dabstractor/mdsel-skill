import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/tools/mdsel-index.ts',
    'src/tools/mdsel-select.ts',
    'src/hooks/read-hook.ts',
  ],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  // Add shebang to all JS outputs (only index.js is used as CLI)
  banner: {
    js: '#!/usr/bin/env node',
  },
});
