import { describe, expectTypeOf, test } from 'vitest';

import { defineSchema, pattern, slots } from '../src/index.ts';
import type { TagsOf } from '../src/index.ts';

const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const color = pattern({ type: 'color', tags: ['color', 'surface'], modes: ['dark'] });

const schema = defineSchema({
  modes: { dark: '(prefers-color-scheme: dark)' },
  shape: { space: slots(['x4', 'x8'], spacing), page: color },
});

describe('defineTokens', () => {
  test('accepts a tree that fills every slot', () => {
    schema.defineTokens({
      space: { x4: { value: '4px' }, x8: { value: '8px' } },
      page: { value: '#fff', dark: '#000' },
    });
  });

  test('rejects a missing slot', () => {
    // @ts-expect-error x8 is missing
    schema.defineTokens({ space: { x4: { value: '4px' } }, page: { value: '#fff', dark: '#000' } });
  });

  test('rejects a key the schema does not have', () => {
    schema.defineTokens({
      // @ts-expect-error x2 is not in the schema
      space: { x2: { value: '2px' }, x4: { value: '4px' }, x8: { value: '8px' } },
      page: { value: '#fff', dark: '#000' },
    });
  });

  test('rejects a leaf without a mode its pattern requires', () => {
    // @ts-expect-error page needs dark
    schema.defineTokens({ space: { x4: { value: '4px' }, x8: { value: '8px' } }, page: { value: '#fff' } });
  });

  test('rejects a mode the schema does not declare', () => {
    schema.defineTokens({
      // @ts-expect-error drak is not a mode
      space: { x4: { value: '4px', drak: '1px' }, x8: { value: '8px' } },
      page: { value: '#fff', dark: '#000' },
    });
  });
});

describe('defineSchema', () => {
  test('rejects a pattern that requires a mode the schema does not declare', () => {
    // @ts-expect-error color requires dark
    defineSchema({ modes: {}, shape: { page: color } });
  });
});

describe('tags', () => {
  test('are collected from every pattern in the shape', () => {
    expectTypeOf<TagsOf<typeof schema.shape>>().toEqualTypeOf<'spacing' | 'color' | 'surface'>();
  });

  test('a generate entry takes only a tag the schema has', () => {
    const template = { fragment: () => '', aggregate: () => [] };
    schema.defineGenerate({ gap: { tag: 'spacing', template } });
    // @ts-expect-error spaceing is not a tag
    schema.defineGenerate({ gap: { tag: 'spaceing', template } });
  });
});
