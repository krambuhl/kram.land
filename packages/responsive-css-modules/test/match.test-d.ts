import { describe, expectTypeOf, test } from 'vitest';

import { responsive } from '../src/index.ts';
import type { Match } from '../src/index.ts';

declare module '../src/index.ts' {
  interface ResponsiveRegister {
    breakpoint: 'base' | 'sm' | 'md';
  }
}

describe('Match', () => {
  test('accepts one option with known breakpoints, in any order', () => {
    expectTypeOf({ matchMin: 'sm' } as const).toExtend<Match>();
    expectTypeOf({ matchOnly: ['md', 'base'] } as const).toExtend<Match>();
  });

  test('rejects an unknown breakpoint and two options at once', () => {
    expectTypeOf({ matchMin: 'xl' } as const).not.toExtend<Match>();
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
