import { Ajv } from 'ajv';
import { describe, expect, test } from 'vitest';

import { defineConfig } from '../src/core/config.ts';
import { MANIFEST_SCHEMA, emitManifest } from '../src/core/emit-manifest.ts';
import { generateFiles } from '../src/core/generate.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);
const manifest = emitManifest(resolved);

describe('emitManifest', () => {
  test('matches the snapshot', async () => {
    await expect(JSON.stringify(manifest, null, 2)).toMatchFileSnapshot('./__snapshots__/manifest.json');
  });

  test('validates against the schema emitted beside it', () => {
    const validate = new Ajv().compile(MANIFEST_SCHEMA);
    expect(validate(manifest), JSON.stringify(validate.errors)).toBe(true);
  });

  test('a token carries its path, variable, reference, type, values and resolved values per mode', () => {
    const page = manifest.tokens.find((t) => t.path === 'bg.page');
    expect(page).toEqual({
      path: 'bg.page',
      variable: '--bg-page',
      reference: 'var(--bg-page)',
      type: 'color',
      value: '{gray.50}',
      modes: { dark: '{gray.900}' },
      resolved: { base: '#fafafa', dark: '#171717' },
    });
  });

  test('description, deprecation and inherits appear when set', () => {
    const x16 = manifest.tokens.find((t) => t.path === 'space.x16');
    expect(x16?.description).toBe('The default gap.');
    const regular = manifest.tokens.find((t) => t.path === 'content.regular');
    expect(regular?.deprecated).toBe('use content.body');
    const golden = manifest.tokens.find((t) => t.path === 'ratio.golden');
    expect(golden?.inherits).toBe(false);
  });

  test('the unions and the modes are listed', () => {
    expect(manifest.modes).toEqual(config.modes);
    expect(manifest.unions).toContainEqual({
      name: 'SpaceToken',
      source: 'tokens.space',
      paths: ['space.x4', 'space.x16'],
    });
    expect(manifest.unions.find((u) => u.name === 'ColorToken')?.source).toBe('types.color');
  });

  test('contrast is present with the minimum and every result, or absent when not declared', () => {
    expect(manifest.contrast).toBeUndefined();
    const c = defineConfig({
      modes: {},
      tokens: {
        bg: { $group: { type: 'color' }, page: { value: '#ffffff' } },
        content: { $group: { type: 'color' }, regular: { value: '#000000' } },
      },
      contrast: { minimum: 4.5, pairs: [['content.regular', 'bg.page']] },
    });
    const m = emitManifest(loadTokens(c));
    expect(m.contrast).toEqual({
      minimum: 4.5,
      results: [{ foreground: 'content.regular', background: 'bg.page', mode: 'base', ratio: 21, pass: true }],
    });
    expect(new Ajv().compile(MANIFEST_SCHEMA)(m)).toBe(true);
  });

  test('generate writes the manifest and its schema last', () => {
    const files = generateFiles(resolved).map((f) => f.path);
    expect(files.slice(-2)).toEqual(['manifest.json', 'manifest.schema.json']);
    const written = generateFiles(resolved).find((f) => f.path === 'manifest.json');
    expect(JSON.parse(written?.contents ?? '')).toEqual(manifest);
  });
});
