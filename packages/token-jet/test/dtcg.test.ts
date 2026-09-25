import { describe, expect, test } from 'vitest';

import { defineConfig } from '../src/core/config.ts';
import { toDtcg, toDtcgValue } from '../src/core/dtcg.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const file = toDtcg(loadTokens(config));

describe('toDtcgValue', () => {
  test('a colour is an srgb object with components, hex and alpha only when translucent', () => {
    expect(toDtcgValue('color', '#fafafa', 'x')).toEqual({
      colorSpace: 'srgb',
      components: [0.9804, 0.9804, 0.9804],
      hex: '#fafafa',
    });
    expect(toDtcgValue('color', 'hsl(0 0% 0% / 50%)', 'x')).toEqual({
      colorSpace: 'srgb',
      components: [0, 0, 0],
      alpha: 0.5,
      hex: '#000000',
    });
  });

  test('a dimension is a value and a unit, px or rem', () => {
    expect(toDtcgValue('dimension', '16px', 'x')).toEqual({ value: 16, unit: 'px' });
    expect(toDtcgValue('dimension', '1.5rem', 'x')).toEqual({ value: 1.5, unit: 'rem' });
    expect(toDtcgValue('dimension', '0', 'x')).toEqual({ value: 0, unit: 'px' });
  });

  test('a duration is a value and a unit, a number is a number, a weight is a number or keyword', () => {
    expect(toDtcgValue('duration', '200ms', 'x')).toEqual({ value: 200, unit: 'ms' });
    expect(toDtcgValue('number', 1.618, 'x')).toBe(1.618);
    expect(toDtcgValue('fontWeight', 700, 'x')).toBe(700);
    expect(toDtcgValue('fontWeight', 'bold', 'x')).toBe('bold');
  });

  test('a font family list becomes an array and a single family stays a string', () => {
    expect(toDtcgValue('fontFamily', 'Inter, sans-serif', 'x')).toEqual(['Inter', 'sans-serif']);
    expect(toDtcgValue('fontFamily', 'Inter', 'x')).toBe('Inter');
  });

  test('a reference is kept as written', () => {
    expect(toDtcgValue('color', '{gray.50}', 'x')).toBe('{gray.50}');
  });

  test('a value the format cannot carry is an error naming the token', () => {
    expect(() => toDtcgValue('dimension', '50%', 'size.half')).toThrow(/size\.half.*50%.*px or rem/);
    expect(() => toDtcgValue('color', 'rebeccapurple', 'accent')).toThrow(/accent.*rebeccapurple/);
  });
});

describe('toDtcg', () => {
  test('matches the snapshot', async () => {
    await expect(JSON.stringify(file, null, 2)).toMatchFileSnapshot('./__snapshots__/tokens.dtcg.json');
  });

  test('the modes and their media queries sit at the root under the token-jet extension', () => {
    expect(file.$extensions).toEqual({
      'token-jet': { modes: { dark: '(prefers-color-scheme: dark)', contrast: '(prefers-contrast: more)' } },
    });
  });

  test('a group type is $type on the group and a leaf with the same type repeats nothing', () => {
    const space = file.space as Record<string, unknown>;
    expect(space.$type).toBe('dimension');
    expect(space.x4).toEqual({ $value: { value: 4, unit: 'px' } });
  });

  test('a mode value goes under the token-jet extension on the token, references kept', () => {
    const bg = file.bg as Record<string, Record<string, unknown>>;
    expect(bg.page).toEqual({
      $value: '{gray.50}',
      $extensions: { 'token-jet': { modes: { dark: '{gray.900}' } } },
    });
    expect(bg.card.$extensions).toEqual({
      'token-jet': {
        modes: {
          dark: { colorSpace: 'srgb', components: [0.102, 0.102, 0.102], hex: '#1a1a1a' },
          contrast: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' },
        },
      },
    });
  });

  test('description, deprecated and inherits map to $description, $deprecated and the extension', () => {
    const space = file.space as Record<string, Record<string, unknown>>;
    expect(space.x16.$description).toBe('The default gap.');
    const content = file.content as Record<string, Record<string, unknown>>;
    expect(content.regular.$deprecated).toBe('use content.body');
    const ratio = file.ratio as Record<string, Record<string, unknown>>;
    expect(ratio.golden).toEqual({
      $type: 'number',
      $value: 1.618,
      $extensions: { 'token-jet': { inherits: false } },
    });
  });

  test('a token with no type is an error naming it', () => {
    const untyped = defineConfig({ modes: {}, tokens: { a: { b: { value: '1px' } } } });
    expect(() => toDtcg(loadTokens(untyped))).toThrow(/"a\.b" has no type/);
  });
});
