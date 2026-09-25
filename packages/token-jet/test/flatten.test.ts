import { describe, expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';
import config from './fixtures/basic.config.ts';

describe('flatten', () => {
  const tokens = flatten(config.tokens);

  test('produces one entry per leaf, in source order', () => {
    expect(tokens.map((t) => t.path)).toEqual([
      'space.x0',
      'space.x4',
      'space.x16',
      'bg.page.default',
      'bg.page.hover',
      'bg.page.pressed',
      'bg.base.default',
      'bg.base.hover',
      'bg.base.pressed',
      'bg.elevated.default',
      'bg.elevated.hover',
      'bg.elevated.pressed',
      'content.regular.default',
      'content.regular.hover',
    ]);
  });

  test('carries the value and the per-mode values', () => {
    const page = tokens.find((t) => t.path === 'bg.page.default');
    expect(page).toMatchObject({ value: '#ffffff', modes: { dark: '#040404' } });
    const space = tokens.find((t) => t.path === 'space.x16');
    expect(space).toMatchObject({ value: '16px', modes: {} });
  });

  test('a leaf is any object with a value key, at any depth', () => {
    expect(flatten({ a: { value: '1' }, b: { c: { d: { value: '2' } } } }).map((t) => t.path)).toEqual(['a', 'b.c.d']);
  });

  test('records the segments as well as the joined path', () => {
    expect(tokens.find((t) => t.path === 'bg.page.default')?.segments).toEqual(['bg', 'page', 'default']);
  });
});
