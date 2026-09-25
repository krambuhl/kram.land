import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import type { Config, Modes } from '../src/core/config.ts';
import { toDtcg } from '../src/core/dtcg.ts';
import { fromDtcg, fromDtcgValue, renderConfig } from '../src/core/dtcg-import.ts';
import { flatten } from '../src/core/flatten.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const exported = toDtcg(loadTokens(config));

describe('fromDtcgValue', () => {
  test('a colour comes back as its hex, with alpha folded in when present', () => {
    expect(fromDtcgValue('color', { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' })).toBe('#ffffff');
    expect(fromDtcgValue('color', { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.5, hex: '#000000' })).toBe(
      '#00000080'
    );
    expect(fromDtcgValue('color', { colorSpace: 'srgb', components: [0.102, 0.102, 0.102] })).toBe('#1a1a1a');
  });

  test('a colour in another space is an error', () => {
    expect(() => fromDtcgValue('color', { colorSpace: 'oklch', components: [0.5, 0.1, 200] })).toThrow(/oklch/);
  });

  test('dimensions and durations come back as strings, families join, numbers and weights pass through', () => {
    expect(fromDtcgValue('dimension', { value: 16, unit: 'px' })).toBe('16px');
    expect(fromDtcgValue('duration', { value: 0.2, unit: 's' })).toBe('0.2s');
    expect(fromDtcgValue('fontFamily', ['Inter', 'sans-serif'])).toBe('Inter, sans-serif');
    expect(fromDtcgValue('fontFamily', 'Inter')).toBe('Inter');
    expect(fromDtcgValue('number', 1.618)).toBe(1.618);
    expect(fromDtcgValue('fontWeight', 'bold')).toBe('bold');
  });

  test('a reference is kept as written', () => {
    expect(fromDtcgValue('color', '{gray.50}')).toBe('{gray.50}');
  });
});

describe('fromDtcg', () => {
  test('reproduces the modes and the token tree of the config it was exported from', () => {
    const imported = fromDtcg(exported);
    expect(imported.modes).toEqual(config.modes);
    expect(flatten(imported.tokens)).toEqual(flatten(config.tokens));
  });

  test('a $type token-jet does not support is an error naming it', () => {
    expect(() => fromDtcg({ shadow: { card: { $type: 'shadow', $value: {} } } })).toThrow(/shadow\.card.*"shadow"/);
  });

  test('a token with no $type anywhere above it is an error naming it', () => {
    expect(() => fromDtcg({ a: { b: { $value: '1px' } } })).toThrow(/a\.b.*no \$type/);
  });

  test('a mode on a token that the file does not declare is an error', () => {
    const file = {
      a: { $type: 'color', $value: '#fff', $extensions: { 'token-jet': { modes: { dark: '#000' } } } },
    };
    expect(() => fromDtcg(file)).toThrow(/"dark".*a/);
  });
});

describe('renderConfig', () => {
  test('writes a tokens.config.ts that loads to the same tokens', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'token-jet-import-'));
    const text = renderConfig(fromDtcg(exported)).replace(
      "from 'token-jet'",
      `from '${join(import.meta.dirname, '../src/index.ts')}'`
    );
    writeFileSync(join(dir, 'tokens.config.ts'), text);
    const module = (await import(join(dir, 'tokens.config.ts'))) as { default: Config<Modes> };
    expect(flatten(module.default.tokens)).toEqual(flatten(config.tokens));
    expect(module.default.modes).toEqual(config.modes);
  });

  test('quotes keys that are not identifiers and leaves the rest bare', () => {
    const text = renderConfig(fromDtcg(exported));
    expect(text).toContain("    gray: {\n      $group: { type: 'color' },\n      50: { value: '#fafafa' },");
    expect(text).toContain("      bold: { value: 700, type: 'fontWeight' },");
    expect(renderConfig({ modes: {}, tokens: { 'a-b': { value: '1px', type: 'dimension' } } })).toContain("'a-b': {");
    expect(text).toMatch(/^import \{ defineConfig \} from 'token-jet';\n\nexport default defineConfig\(\{/);
  });
});
