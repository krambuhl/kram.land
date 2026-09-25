import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { build, createServer } from 'vite';
import { describe, expect, test } from 'vitest';

import tokenJet from '../src/vite.ts';

const fixture = readFileSync(join(import.meta.dirname, 'fixtures/emit.config.ts'), 'utf8').replace(
  "from '../../src/index.ts'",
  "from 'token-jet'"
);

// A project directory with a config, an entry that imports a css module, and
// token-jet linked into node_modules so the config's import resolves.
function project(): string {
  const dir = mkdtempSync(join(tmpdir(), 'token-jet-vite-'));
  writeFileSync(join(dir, 'tokens.config.ts'), fixture);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', type: 'module' }));
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(join(import.meta.dirname, '..'), join(dir, 'node_modules/token-jet'));
  writeFileSync(join(dir, 'card.module.css'), `.root { padding: token('space.x16'); color: token('bg.page'); }\n`);
  writeFileSync(join(dir, 'entry.ts'), `import styles from './card.module.css';\nexport default styles;\n`);
  return dir;
}

describe('vite adapter', () => {
  test('generates on build start and rewrites token() through postcss', async () => {
    const dir = project();
    await build({
      root: dir,
      logLevel: 'silent',
      plugins: [tokenJet()],
      build: { outDir: 'dist', lib: { entry: 'entry.ts', formats: ['es'], fileName: 'entry' }, cssCodeSplit: false },
    });
    expect(existsSync(join(dir, 'generated/tokens/tokens.css'))).toBe(true);
    expect(existsSync(join(dir, 'generated/tokens/index.ts'))).toBe(true);
    const css = readFileSync(join(dir, 'dist/entry.css'), 'utf8');
    expect(css).toContain('var(--space-x16)');
    expect(css).toContain('var(--bg-page)');
    expect(css).not.toContain('token(');
  });

  test('regenerates when the config file changes during dev', async () => {
    const dir = project();
    const server = await createServer({
      root: dir,
      logLevel: 'silent',
      plugins: [tokenJet()],
      server: { watch: null },
    });
    try {
      await server.listen();
      const before = readFileSync(join(dir, 'generated/tokens/tokens.css'), 'utf8');
      expect(before).toContain('--space-x16: 16px;');

      writeFileSync(join(dir, 'tokens.config.ts'), fixture.replace("x16: { value: '16px'", "x16: { value: '18px'"));
      // Drive the watcher directly: server.watch is off so the test is deterministic.
      await server.watcher.emit('change', join(dir, 'tokens.config.ts'));
      await new Promise((r) => setTimeout(r, 200));

      const after = readFileSync(join(dir, 'generated/tokens/tokens.css'), 'utf8');
      expect(after).toContain('--space-x16: 18px;');
    } finally {
      await server.close();
    }
  });

  test('a config error fails the build with the message', async () => {
    const dir = project();
    writeFileSync(join(dir, 'tokens.config.ts'), fixture.replace("dark: '{gray.900}'", "dark: '{gray.999}'"));
    await expect(
      build({
        root: dir,
        logLevel: 'silent',
        plugins: [tokenJet()],
        build: { lib: { entry: 'entry.ts', formats: ['es'] } },
      })
    ).rejects.toThrow(/gray\.999.*does not exist/);
  });

  test('--out is honoured through the adapter option', async () => {
    const dir = project();
    await build({
      root: dir,
      logLevel: 'silent',
      plugins: [tokenJet({ outDir: 'src/tokens' })],
      build: { lib: { entry: 'entry.ts', formats: ['es'] } },
    });
    expect(existsSync(join(dir, 'src/tokens/tokens.css'))).toBe(true);
  });
});
