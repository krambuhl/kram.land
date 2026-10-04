import { expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';

test('flatten carries type and description, and separates them from mode values', () => {
  const [t] = flatten({
    a: { value: '#666', dark: '#999', type: 'color', description: 'Secondary text.' },
  });
  expect(t).toMatchObject({ value: '#666', modes: { dark: '#999' }, type: 'color', description: 'Secondary text.' });
  expect(Object.keys(t.modes)).toEqual(['dark']);
});

test('an empty group has no tokens', () => {
  expect(flatten({ bg: {} })).toEqual([]);
});
