import { describe, expect, test } from 'vitest';

import { defineConfig } from '../src/core/config.ts';
import { checkContrast, contrastRatio, parseColor } from '../src/core/contrast.ts';
import { generateFiles } from '../src/core/generate.ts';
import { loadTokens } from '../src/core/load.ts';

function config(contrast: { minimum: number; pairs: [string, string][] }) {
  return defineConfig({
    modes: { dark: '(prefers-color-scheme: dark)' },
    tokens: {
      gray: {
        $group: { type: 'color' },
        900: { value: '#171717' },
      },
      bg: {
        $group: { type: 'color' },
        page: { value: '#ffffff', dark: '{gray.900}' },
      },
      content: {
        $group: { type: 'color' },
        regular: { value: '#000000', dark: '#ffffff' },
        muted: { value: '#767676', dark: '#555555' },
        faint: { value: 'rgb(0 0 0 / 0.5)' },
      },
      space: { x16: { value: '16px', type: 'dimension' } },
      accent: { value: 'rebeccapurple', type: 'color' },
    },
    contrast,
  });
}

describe('parseColor', () => {
  test('reads hex in every length', () => {
    expect(parseColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor('#0008')).toEqual({ r: 0, g: 0, b: 0, a: 136 / 255 });
    expect(parseColor('#171717')).toEqual({ r: 23 / 255, g: 23 / 255, b: 23 / 255, a: 1 });
    expect(parseColor('#ffffff80')?.a).toBeCloseTo(128 / 255);
  });

  test('reads rgb() and hsl() in modern and legacy syntax', () => {
    expect(parseColor('rgb(255 0 0)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
    expect(parseColor('rgb(100% 0% 0% / 50%)')).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
    expect(parseColor('hsl(0deg 0% 100%)')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor('hsl(215deg 0% 0%)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor('hsl(120, 100%, 50%)')).toEqual({ r: 0, g: 1, b: 0, a: 1 });
  });

  test('returns null for anything else', () => {
    expect(parseColor('rebeccapurple')).toBeNull();
    expect(parseColor('16px')).toBeNull();
    expect(parseColor('oklch(0.5 0.1 200)')).toBeNull();
  });
});

describe('contrastRatio', () => {
  test('black on white is 21 and #767676 on white is 4.54', () => {
    expect(contrastRatio('#000', '#fff')).toBe(21);
    expect(contrastRatio('#767676', '#fff')).toBe(4.54);
  });

  test('is symmetric', () => {
    expect(contrastRatio('#fff', '#767676')).toBe(4.54);
  });

  test('composites a translucent foreground over the background', () => {
    expect(contrastRatio('rgb(0 0 0 / 0.5)', '#fff')).toBe(3.98);
  });
});

describe('checkContrast', () => {
  test('reports every pair in the base and every mode with its ratio', () => {
    const c = config({ minimum: 4.5, pairs: [['content.regular', 'bg.page']] });
    const results = checkContrast(c, loadTokens(c).tokens);
    expect(results).toEqual([
      { foreground: 'content.regular', background: 'bg.page', mode: 'base', ratio: 21, pass: true },
      { foreground: 'content.regular', background: 'bg.page', mode: 'dark', ratio: 17.93, pass: true },
    ]);
  });

  test('a pair that passes in light and fails in dark fails the dark mode only', () => {
    const c = config({ minimum: 4.5, pairs: [['content.muted', 'bg.page']] });
    const failures = checkContrast(c, loadTokens(c).tokens).filter((r) => !r.pass);
    expect(failures).toEqual([
      { foreground: 'content.muted', background: 'bg.page', mode: 'dark', ratio: 2.4, pass: false },
    ]);
  });

  test('references resolve before the ratio is computed', () => {
    const c = config({ minimum: 4.5, pairs: [['content.regular', 'bg.page']] });
    const dark = checkContrast(c, loadTokens(c).tokens).find((r) => r.mode === 'dark');
    expect(dark?.ratio).toBe(contrastRatio('#ffffff', '#171717'));
  });

  test('a pair naming a non-color token, a missing token or an unparseable colour is a finding, and the rest still run', () => {
    const c = config({
      minimum: 4.5,
      pairs: [
        ['content.regular', 'space.x16'],
        ['content.regular', 'bg.nope'],
        ['accent', 'bg.page'],
        ['content.regular', 'bg.page'],
      ],
    });
    const results = checkContrast(c, loadTokens(c).tokens);
    expect(results.filter((r) => r.pass)).toHaveLength(2);
    const errors = [...new Set(results.filter((r) => r.error !== undefined).map((r) => r.error))];
    expect(errors).toEqual([
      '"space.x16" is a dimension token, not a color',
      '"bg.nope" does not exist',
      '"rebeccapurple" is not a colour token-jet can read; write it as hex, rgb() or hsl()',
    ]);
  });

  test('no contrast block means no results', () => {
    const c = defineConfig({ modes: {}, tokens: { a: { value: '#fff', type: 'color' } } });
    expect(checkContrast(c, loadTokens(c).tokens)).toEqual([]);
  });
});

describe('contrast gates generation', () => {
  test('loadTokens carries the results and generateFiles refuses when a pair fails', () => {
    const c = config({ minimum: 4.5, pairs: [['content.muted', 'bg.page']] });
    const resolved = loadTokens(c);
    expect(resolved.contrast).toHaveLength(2);
    expect(() => generateFiles(resolved)).toThrow(/content\.muted on bg\.page in dark: 2\.4, below 4\.5/);
  });

  test('a finding that is not a ratio is listed the same way', () => {
    const c = config({ minimum: 4.5, pairs: [['content.regular', 'space.x16']] });
    expect(() => generateFiles(loadTokens(c))).toThrow(/space\.x16.*dimension token/);
  });

  test('a passing palette generates', () => {
    const c = config({ minimum: 4.5, pairs: [['content.regular', 'bg.page']] });
    expect(generateFiles(loadTokens(c))).toHaveLength(3);
  });
});
