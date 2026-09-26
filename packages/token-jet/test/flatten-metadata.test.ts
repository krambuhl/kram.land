import { expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';

test('flatten carries type and description, and separates them from mode values', () => {
  const [t] = flatten({
    a: { value: '#666', dark: '#999', type: 'color', description: 'Secondary text.' },
  });
  expect(t).toMatchObject({ value: '#666', modes: { dark: '#999' }, type: 'color', description: 'Secondary text.' });
  expect(Object.keys(t.modes)).toEqual(['dark']);
});

test("flatten records a group's type on each leaf as groupType, nearest group first", () => {
  const tokens = flatten({
    bg: {
      $group: { type: 'color' as const },
      deep: { $group: { type: 'dimension' as const }, x: { value: '1px' } },
      page: { value: '#fff' },
    },
  });
  expect(tokens.find((t) => t.path === 'bg.deep.x')?.groupType).toBe('dimension');
  expect(tokens.find((t) => t.path === 'bg.page')?.groupType).toBe('color');
});

test("flatten records the nearest group's role on each leaf", () => {
  const tokens = flatten({
    font: {
      $group: { type: 'dimension' as const, role: 'fontSize' as const },
      body: { md: { value: '1rem' } },
      corner: { $group: { role: 'radius' as const }, sm: { value: '4px' } },
    },
    ratio: { value: 1.5, type: 'number' as const },
  });
  expect(tokens.find((t) => t.path === 'font.body.md')?.role).toBe('fontSize');
  expect(tokens.find((t) => t.path === 'font.corner.sm')?.role).toBe('radius');
  expect(tokens.find((t) => t.path === 'ratio')?.role).toBeUndefined();
});

test('a group whose only keys are metadata is still empty', () => {
  expect(flatten({ bg: { $group: { type: 'color' as const, description: 'nothing here' } } })).toEqual([]);
});
