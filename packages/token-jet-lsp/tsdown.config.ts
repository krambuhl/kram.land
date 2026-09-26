import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/analyze.ts', 'src/server.ts'],
  format: 'esm',
  platform: 'node',
  dts: true,
  clean: true,
  fixedExtension: false,
});
