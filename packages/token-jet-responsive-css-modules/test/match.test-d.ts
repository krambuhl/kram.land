import { describe, expectTypeOf, test } from 'vitest';

import { responsive } from '../src/index.ts';
import type { Match } from '../src/index.ts';

declare module '../src/index.ts' {
  interface ResponsiveRegister {
    breakpoint: 'base' | 'sm' | 'md';
    range: readonly ['base'] | readonly ['base', 'sm'] | readonly ['sm'] | readonly ['sm', 'md'] | readonly ['md'];
  }
}

describe('Match', () => {
  test('accepts one option with a known breakpoint or a contiguous run', () => {
    expectTypeOf({ matchMin: 'sm' } as const).toExtend<Match>();
    expectTypeOf({ matchOnly: ['sm', 'md'] } as const).toExtend<Match>();
  });

  test('rejects an unknown breakpoint, a gap and two options at once', () => {
    expectTypeOf({ matchMin: 'xl' } as const).not.toExtend<Match>();
    expectTypeOf({ matchOnly: ['base', 'md'] } as const).not.toExtend<Match>();
    expectTypeOf({ matchMin: 'sm', matchMax: 'md' } as const).not.toExtend<Match>();
  });

  test('the wrapper has a function per class in the module', () => {
    const r = responsive({ cn: 'a', other: 'b' } as const);
    expectTypeOf(r.cn).toEqualTypeOf<(match: Match) => string>();
    // @ts-expect-error a class the module does not have
    void r.missing;
  });
});
