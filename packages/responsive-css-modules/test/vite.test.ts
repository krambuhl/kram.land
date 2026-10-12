import { mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import tokenJet from 'token-jet/vite';
import { build } from 'vite';
import { describe, expect, test } from 'vitest';

import { fromTokenJet } from '../src/token-jet.ts';
import responsiveCssModules from '../src/vite.ts';
import type { ResponsiveOptions } from '../src/vite.ts';

const TOKENS = `import { defineSchema, pattern, slots } from 'token-jet';

const breakpoint = pattern({ type: 'dimension', tags: ['media-breakpoint'] });
const spacing = pattern({ type: 'dimension' });

const schema = defineSchema({
  modes: {},
  shape: { breakpoint: slots(['base', 'sm', 'md'], breakpoint), space: { x16: spacing } },
});

export default schema.defineTokens({
  breakpoint: { base: { value: '0px' }, sm: { value: '32rem' }, md: { value: '48rem' } },
  space: { x16: { value: '16px' } },
});
`;

function project(entry: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'responsive-css-modules-'));
  mkdirSync(join(dir, 'tokens'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'tokens/tokens.ts'), TOKENS);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', type: 'module' }));
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(join(import.meta.dirname, '../../token-jet'), join(dir, 'node_modules/token-jet'));
  symlinkSync(join(import.meta.dirname, '..'), join(dir, 'node_modules/responsive-css-modules'));
  writeFileSync(join(dir, 'src/card.module.css'), `.cn { gap: token('space.x16'); }\n.unused { gap: 1px; }\n`);
  writeFileSync(join(dir, 'src/entry.ts'), entry);
  return dir;
}

async function bundle(
  dir: string,
  breakpoints: ResponsiveOptions['breakpoints'] = fromTokenJet()
): Promise<{ css: string; js: string }> {
  await build({
    root: dir,
    logLevel: 'silent',
    plugins: [tokenJet(), responsiveCssModules({ breakpoints })],
    build: { lib: { entry: 'src/entry.ts', formats: ['es'], fileName: 'entry' }, cssCodeSplit: false },
  });
  const files = readdirSync(join(dir, 'dist'));
  const read = (ext: string) => readFileSync(join(dir, 'dist', files.find((f) => f.endsWith(ext)) ?? ''), 'utf8');
  return { css: read('.css'), js: read('.js') };
}

describe('vite plugin', () => {
  test('emits the used variant as a hashed module class and writes the breakpoint types', async () => {
    const dir = project(`import styles from './card.module.css';
import { responsive } from 'responsive-css-modules';

const r = responsive(styles);
export default r.cn({ matchMin: 'sm' });
`);
    const { css, js } = await bundle(dir);
    expect(css).toMatch(/@media \(width>=32rem\)\{\._cn--min-sm_\w+\{gap:var\(--space-x16\)\}\}/);
    expect(css).not.toMatch(/unused--|cn--max|cn--only/);
    expect(js).toMatch(/"cn--min-sm"/);
    expect(readFileSync(join(dir, 'generated/responsive/breakpoints.d.ts'), 'utf8')).toContain(
      "breakpoint: 'base' | 'sm' | 'md';"
    );
  });

  test('takes breakpoints as a list too', async () => {
    const dir = project(`import styles from './card.module.css';
import { responsive } from 'responsive-css-modules';

export default responsive(styles).cn({ matchMax: 'narrow' });
`);
    const { css } = await bundle(dir, [
      { name: 'narrow', width: '0px' },
      { name: 'wide', width: '60rem' },
    ]);
    expect(css).toMatch(/@media \(width<60rem\)\{\._cn--max-narrow_\w+/);
  });

  test('a call the scanner cannot read fails the build with its location', async () => {
    const dir = project(`import styles from './card.module.css';
import { responsive } from 'responsive-css-modules';

export default (size: 'sm') => responsive(styles).cn({ matchMin: size });
`);
    await expect(bundle(dir)).rejects.toThrow('src/entry.ts:4: cn() needs one of matchMin, matchMax, matchOnly');
  });
});
