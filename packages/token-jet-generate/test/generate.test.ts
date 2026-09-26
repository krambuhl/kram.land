import { describe, expect, test } from 'vitest';

import { generateFiles, loadTokens } from 'token-jet';
import type { OutputFile } from 'token-jet';

import { defineGenerate, generate, selectTokens } from '../src/index.ts';
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

describe('selectTokens', () => {
  test('a union name selects its members in config order', () => {
    const { tokens: selected, union } = selectTokens('SpaceToken', resolved);
    expect(selected.map((t) => t.path)).toEqual(['space.x4', 'space.x16']);
    expect(union?.source).toBe('tokens.space');
  });

  test('a types-block union works the same', () => {
    expect(selectTokens('ColorToken', resolved).union?.source).toBe('types.color');
  });

  test('a glob selects by path and has no union', () => {
    const { tokens: selected, union } = selectTokens('bg.*', resolved);
    expect(selected.map((t) => t.path)).toEqual(['bg.page', 'bg.card']);
    expect(union).toBeUndefined();
  });

  test('an unknown name lists the valid names', () => {
    expect(() => selectTokens('SpaicToken', resolved)).toThrow(/"SpaicToken".*SpaceToken.*ColorToken/s);
  });
});

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
    const out = generate(defineGenerate({ list: { select: 'SpaceToken', template: lines } }), resolved);
    expect(out).toEqual([{ path: 'list.txt', contents: 'space.x4=4px\nspace.x16=16px\n' }]);
  });

  test('two entries writing the same path is an error', () => {
    const t: Template<string> = { fragment: () => '', aggregate: () => [{ path: 'same.txt', contents: '' }] };
    const c = defineGenerate({ a: { select: 'SpaceToken', template: t }, b: { select: 'SpaceToken', template: t } });
    expect(() => generate(c, resolved)).toThrow(/"a" and "b" both write same\.txt/);
  });

  test('the template context carries the tokens specifier the generated files import from', () => {
    expect(file('padding.ts').contents).toContain("from './tokens/index.ts'");
    expect(defineGenerate({}).tokens).toBe('./tokens');
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
    expect(ts).toContain('export function classNameForPadding(token: SpaceToken): string;');
    expect(ts).toContain('export function classNameForPadding(token: SpaceToken | undefined): string | undefined;');
    expect(ts).toContain("'var(--space-x16)': styles.spaceX16,");
  });

  test('a glob selection types the function on an inline union of the literals', () => {
    const ts = file('surface.ts').contents;
    expect(ts).toContain('type Selected = BgPage | BgCard;');
    expect(ts).toContain('export function classNameForSurface(token: Selected): string;');
  });
});

describe('tsRecord', () => {
  test('a record from the var() literal to the resolved value', () => {
    expect(file('spaceValue.ts').contents).toContain(
      "export const spaceValue: Record<SpaceToken, string> = {\n  'var(--space-x4)': '4px',"
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
