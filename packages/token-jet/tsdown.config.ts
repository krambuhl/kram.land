import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/postcss.ts', 'src/vite.ts', 'src/cli.ts'],
  format: 'esm',
  platform: 'node',
  dts: true,
  clean: true,
  fixedExtension: false,
});
