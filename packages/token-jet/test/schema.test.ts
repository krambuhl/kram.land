import { describe, expect, test } from 'vitest';

import { emitCss } from '../src/core/emit-css.ts';
import { loadTokens } from '../src/core/load.ts';
import { defineSchema, isDefinedTokens, pattern, schemaToConfig, slots } from '../src/core/schema.ts';

const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const color = pattern({ type: 'color', tags: ['color', 'surface'], preview: 'swatch', modes: ['dark'] });

const schema = defineSchema({
  modes: { dark: '(prefers-color-scheme: dark)' },
  shape: {
    space: slots(['x4', 'x8'], spacing),
    surface: slots(['default', 'hover'], color),
  },
});

const defined = schema.defineTokens({
  space: { x4: { value: '4px' }, x8: { value: '8px', description: 'The default gap.' } },
  surface: {
    default: { value: '#ffffff', dark: '#000000' },
    hover: { value: '#f0f0f0', dark: '#111111' },
  },
});

describe('slots', () => {
  test('puts the same shape under every key, in key order', () => {
    expect(slots(['a', 'b'], spacing)).toEqual({ a: spacing, b: spacing });
    expect(Object.keys(slots(['b', 'a'], spacing))).toEqual(['b', 'a']);
  });
});

describe('defineSchema', () => {
  test('defineTokens returns the tree with the schema it was checked against', () => {
    expect(defined.schema).toBe(schema);
    expect(isDefinedTokens(defined)).toBe(true);
    expect(isDefinedTokens({ modes: {}, tokens: {} })).toBe(false);
  });

  test('defineGenerate returns the entries with the schema', () => {
    const template = { fragment: () => '', aggregate: () => [] };
    const generate = schema.defineGenerate({ gap: { tag: 'spacing', template } });
    expect(generate.schema).toBe(schema);
    expect(generate.entries.gap).toEqual({ tag: 'spacing', template });
  });
});

describe('schemaToConfig', () => {
  const config = schemaToConfig(defined);

  test('takes the modes from the schema and the type, tags and preview from each pattern', () => {
    expect(config.modes).toEqual({ dark: '(prefers-color-scheme: dark)' });
    expect(config.tokens.space).toEqual({
      x4: { value: '4px', type: 'dimension', tags: ['spacing'], preview: 'gap' },
      x8: { value: '8px', description: 'The default gap.', type: 'dimension', tags: ['spacing'], preview: 'gap' },
    });
  });

  test('loads into tokens that carry their tags and preview, and emits mode values', () => {
    const resolved = loadTokens(config);
    expect(resolved.tokens.find((t) => t.path === 'surface.hover')).toMatchObject({
      type: 'color',
      tags: ['color', 'surface'],
      preview: 'swatch',
      modes: { dark: '#111111' },
    });
    expect(emitCss(resolved)).toContain('--surface-hover--dark: #111111;');
  });

  test('a slot with no token is an error naming it', () => {
    const missing = { schema, tokens: { ...defined.tokens, space: { x4: { value: '4px' } } } };
    expect(() => schemaToConfig(missing as never)).toThrow('"space.x8" is in the schema but has no token.');
  });

  test('a token the schema does not have is an error naming it', () => {
    const extra = { schema, tokens: { ...defined.tokens, radius: { sm: { value: '2px' } } } };
    expect(() => schemaToConfig(extra as never)).toThrow('"radius" is not in the schema.');
  });

  test('a leaf missing a mode its pattern requires is an error naming both', () => {
    const tokens = { ...defined.tokens, surface: { ...defined.tokens.surface, hover: { value: '#f0f0f0' } } };
    expect(() => schemaToConfig({ schema, tokens } as never)).toThrow(
      'Token "surface.hover" needs a value for the mode "dark".'
    );
  });

  test('a group where the schema has a pattern is an error', () => {
    const tokens = { ...defined.tokens, space: { ...defined.tokens.space, x4: { nested: { value: '4px' } } } };
    expect(() => schemaToConfig({ schema, tokens } as never)).toThrow(/Token "space\.x4" needs a value/);
  });
});
