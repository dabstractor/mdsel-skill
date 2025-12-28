import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/tools/mdsel-index.ts', 'src/tools/mdsel-select.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  minify: false,
});
