import { describe, expectTypeOf, test } from 'vitest';

import { responsive } from '../src/index.ts';
import type { Match } from '../src/index.ts';

declare module '../src/index.ts' {
  interface ResponsiveRegister {
    breakpoint: 'base' | 'sm' | 'md';
    list:
      | readonly ['base']
      | readonly ['sm']
      | readonly ['base', 'sm']
      | readonly ['md']
      | readonly ['base', 'md']
      | readonly ['sm', 'md']
      | readonly ['base', 'sm', 'md'];
  }
}

describe('Match', () => {
  test('accepts one option with known breakpoints, listed in order, gaps allowed', () => {
    expectTypeOf({ matchMin: 'sm' } as const).toExtend<Match>();
    expectTypeOf({ matchOnly: ['base', 'md'] } as const).toExtend<Match>();
  });

  test('rejects an unknown breakpoint, a list out of order and two options at once', () => {
    expectTypeOf({ matchMin: 'xl' } as const).not.toExtend<Match>();
    expectTypeOf({ matchOnly: ['md', 'base'] } as const).not.toExtend<Match>();
    expectTypeOf({ matchOnly: ['base', 'xl'] } as const).not.toExtend<Match>();
    expectTypeOf({ matchMin: 'sm', matchMax: 'md' } as const).not.toExtend<Match>();
  });

  test('the wrapper has a function per class in the module', () => {
    const r = responsive({ cn: 'a', other: 'b' } as const);
    expectTypeOf(r.cn).toEqualTypeOf<(match: Match) => string>();
    // @ts-expect-error a class the module does not have
    void r.missing;
  });
});
