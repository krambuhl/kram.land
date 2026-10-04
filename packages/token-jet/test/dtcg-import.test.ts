import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { fromDtcg, fromDtcgValue, renderTokensFile } from '../src/core/dtcg-import.ts';
import { toDtcg } from '../src/core/dtcg.ts';
import { flatten } from '../src/core/flatten.ts';
import type { Token } from '../src/core/flatten.ts';
import { loadConfigFile } from '../src/core/load.ts';
import { loadTokens } from '../src/core/load.ts';
import { inferType } from '../src/core/metadata.ts';
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

describe('renderTokensFile', () => {
  test('writes a tokens/tokens.ts that loads to the same tokens', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'token-jet-import-'));
    const text = renderTokensFile(fromDtcg(exported)).replace(
      "from 'token-jet'",
      `from '${join(import.meta.dirname, '../src/index.ts')}'`
    );
    mkdirSync(join(dir, 'tokens'));
    writeFileSync(join(dir, 'tokens/tokens.ts'), text);
    const project = (tokens: Token[]) =>
      tokens.map(({ path, value, modes, description, deprecated, inherits }) => ({
        path,
        value,
        modes,
        description,
        deprecated,
        inherits,
      }));
    const { config: loaded } = await loadConfigFile(dir);
    const original = loadTokens(config);
    const roundTrip = loadTokens(loaded);
    expect(project(roundTrip.tokens)).toEqual(project(original.tokens));
    expect(roundTrip.tokens.map(inferType)).toEqual(original.tokens.map(inferType));
    expect(loaded.modes).toEqual(config.modes);
  });

  test('names a pattern by its tags, or by its type without any, and collapses a uniform group to slots', () => {
    const text = renderTokensFile({
      modes: {},
      tokens: {
        space: { x4: { value: '4px', type: 'dimension', tags: ['spacing'], preview: 'gap' } as never },
        mixed: {
          a: { value: '1px', type: 'dimension' },
          b: { value: '#fff', type: 'color', tags: ['color', 'surface'] } as never,
        },
      },
    });
    expect(text).toContain("const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });");
    expect(text).toContain("const colorSurface = pattern({ type: 'color', tags: ['color', 'surface'] });");
    expect(text).toContain("    space: slots(['x4'], spacing),");
    expect(text).toContain('    mixed: {\n      a: dimension,\n      b: colorSurface,\n    },');
    expect(text).toContain('  modes: {},');
  });

  test('quotes keys that are not identifiers and skips slots when nothing uses it', () => {
    const text = renderTokensFile({ modes: {}, tokens: { 'a-b': { value: '1px', type: 'dimension' } } });
    expect(text).toContain("  'a-b': dimension,");
    expect(text).toMatch(/^import \{ defineSchema, pattern \} from 'token-jet';/);
  });
});
