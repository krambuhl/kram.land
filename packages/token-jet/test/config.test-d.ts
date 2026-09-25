import { describe, expectTypeOf, test } from 'vitest';

import { defineConfig } from '../src/index.ts';

describe('defineConfig', () => {
  test('accepts a mode key that is in modes', () => {
    const config = defineConfig({
      modes: { dark: '(prefers-color-scheme: dark)' },
      tokens: { bg: { page: { value: '#fff', dark: '#000' } } },
    });
    expectTypeOf(config.modes).toEqualTypeOf<{ readonly dark: '(prefers-color-scheme: dark)' }>();
  });

  test('rejects a mode key that is not in modes', () => {
    defineConfig({
      modes: { dark: '(prefers-color-scheme: dark)' },
      // @ts-expect-error drak is not a mode
      tokens: { bg: { page: { value: '#fff', drak: '#000' } } },
    });
  });
});
