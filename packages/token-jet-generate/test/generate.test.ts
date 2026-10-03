import { defineSchema, generateFiles, loadTokens, pattern, schemaToConfig, slots } from 'token-jet';
import type { OutputFile } from 'token-jet';
import { describe, expect, test } from 'vitest';

import { cssModuleClass, defineGenerate, generate, tagTokens } from '../src/index.ts';
import type { Template } from '../src/index.ts';
import config from './fixtures/generate.config.ts';
import tokens from './fixtures/tokens.config.ts';

const resolved = loadTokens(tokens);
const files = generate(config, resolved);
const file = (path: string): OutputFile => {
  const found = files.find((f) => f.path === path);
  if (found === undefined) throw new Error(`no ${path} in ${files.map((f) => f.path).join(', ')}`);
  return found;
};

describe('generate', () => {
  test('writes every entry, and every file matches its snapshot', async () => {
    expect(files.map((f) => f.path)).toEqual([
      'padding.module.css',
      'padding.module.css.d.ts',
      'padding.ts',
      'surface.module.css',
      'surface.module.css.d.ts',
      'surface.ts',
      'spaceValue.ts',
      'spaceStories.stories.tsx',
    ]);
    for (const f of files) await expect(f.contents).toMatchFileSnapshot(`./__snapshots__/${f.path}`);
  });

  test('a user template with a two-line fragment and aggregate produces a file', () => {
    const lines: Template<string> = {
      fragment: (t) => `${t.path}=${String(t.resolved.base)}`,
      aggregate: (fragments, ctx) => [{ path: `${ctx.name}.txt`, contents: `${fragments.join('\n')}\n` }],
    };
    const out = generate(defineGenerate({ list: { tag: 'spacing', template: lines } }), resolved);
    expect(out).toEqual([{ path: 'list.txt', contents: 'space.x4=4px\nspace.x16=16px\n' }]);
  });

  test('two entries writing the same path is an error', () => {
    const t: Template<string> = { fragment: () => '', aggregate: () => [{ path: 'same.txt', contents: '' }] };
    const c = defineGenerate({ a: { tag: 'spacing', template: t }, b: { tag: 'spacing', template: t } });
    expect(() => generate(c, resolved)).toThrow(/"a" and "b" both write same\.txt/);
  });

  test('the template context carries the tokens specifier the generated files import from', () => {
    expect(file('padding.ts').contents).toContain("from './tokens/index.ts'");
    expect(defineGenerate({}).tokens).toBe('../tokens');
  });
});

describe('cssModuleClass', () => {
  test('a rule per token reading the token() call', () => {
    expect(file('padding.module.css').contents).toContain(".spaceX16 {\n  padding: token('space.x16');\n}");
  });

  test('a .d.ts naming every class', () => {
    expect(file('padding.module.css.d.ts').contents).toContain('readonly spaceX16: string;');
  });

  test('a function typed on the union with an undefined overload', () => {
    const ts = file('padding.ts').contents;
    expect(ts).toContain('export function classNameForPadding(token: SpacingToken): string;');
    expect(ts).toContain('export function classNameForPadding(token: SpacingToken | undefined): string | undefined;');
    expect(ts).toContain("'var(--space-x16)': styles.spaceX16,");
  });

  test('a tag spanning a group types the function on the tag union', () => {
    const ts = file('surface.ts').contents;
    expect(ts).toContain("import type { SurfaceToken } from './tokens/index.ts';");
    expect(ts).toContain('export function classNameForSurface(token: SurfaceToken): string;');
  });
});

describe('tsRecord', () => {
  test('a record from the var() literal to the resolved value', () => {
    expect(file('spaceValue.ts').contents).toContain(
      "export const spaceValue: Record<SpacingToken, string> = {\n  'var(--space-x4)': '4px',"
    );
  });
});

describe('storyPerToken', () => {
  test('a default meta and one story per token', () => {
    const tsx = file('spaceStories.stories.tsx').contents;
    expect(tsx).toContain("title: 'Tokens/Space'");
    expect(tsx).toContain(
      "export const SpaceX16: StoryObj = {\n  name: 'space.x16',\n  render: () => <div style={{ width: '16px' }} />,\n};"
    );
  });
});

describe('tokens fixture', () => {
  test('the snapshot tokens the generated files import are the token-jet output for the fixture', async () => {
    for (const f of generateFiles(resolved)) {
      if (f.path === 'types.ts' || f.path === 'index.ts') {
        await expect(f.contents).toMatchFileSnapshot(`./__snapshots__/tokens/${f.path}`);
      }
    }
  });
});

describe('selecting by tag', () => {
  const schema = defineSchema({
    modes: {},
    shape: {
      space: slots(['x4', 'x8'], pattern({ type: 'dimension', tags: ['spacing'] })),
      inset: slots(['sm'], pattern({ type: 'dimension', tags: ['spacing'] })),
      size: slots(['x640'], pattern({ type: 'dimension', tags: ['sizing'] })),
    },
  });
  const tagged = loadTokens(
    schemaToConfig(
      schema.defineTokens({
        space: { x4: { value: '4px' }, x8: { value: '8px' } },
        inset: { sm: { value: '6px' } },
        size: { x640: { value: '640px' } },
      })
    )
  );

  test('a tag selects every token that carries it, across groups, typed on the tag union', () => {
    const { tokens: selected, union } = tagTokens('spacing', tagged);
    expect(selected.map((t) => t.path)).toEqual(['space.x4', 'space.x8', 'inset.sm']);
    expect(union.name).toBe('SpacingToken');
  });

  test('an unknown tag is an error listing the tags', () => {
    expect(() => tagTokens('spaceing', tagged)).toThrow(
      'No token has the tag "spaceing". The tags are: spacing, sizing.'
    );
  });

  test('an entry with a tag generates from that selection and imports the tag union', () => {
    const out = generate(
      defineGenerate({ gap: { tag: 'spacing', template: cssModuleClass({ property: 'gap', fn: 'classNameForGap' }) } }),
      tagged
    );
    const ts = out.find((f) => f.path === 'gap.ts');
    expect(ts?.contents).toContain("import type { SpacingToken } from '../tokens';");
    expect(ts?.contents).toContain('export function classNameForGap(token: SpacingToken): string;');
    expect(out.find((f) => f.path === 'gap.module.css')?.contents).toContain(
      ".insetSm {\n  gap: token('inset.sm');\n}"
    );
  });
});
