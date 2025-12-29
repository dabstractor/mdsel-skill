import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/executor.ts', 'src/utils/config.ts', 'src/utils/word-count.ts'],
  format: 'esm',
  target: 'node18',
  platform: 'node',
  dts: true,
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node\n'
  }
});
