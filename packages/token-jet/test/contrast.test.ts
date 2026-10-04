import { describe, expect, test } from 'vitest';

import { contrastRatio, parseColor } from '../src/core/contrast.ts';

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
