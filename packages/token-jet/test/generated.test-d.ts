import { describe, expectTypeOf, test } from 'vitest';

import { token } from './__snapshots__/index.ts';

describe('generated token()', () => {
  test('returns the exact var() literal for a known path', () => {
    expectTypeOf(token('space.x16')).toEqualTypeOf<'var(--space-x16)'>();
    expectTypeOf(token('bg.page')).toEqualTypeOf<'var(--bg-page)'>();
  });

  test('rejects an unknown path and a group path', () => {
    // @ts-expect-error no such token
    token('space.x17');
    // @ts-expect-error bg is a group, not a token
    token('bg');
  });

  test('rejects a non-literal argument', () => {
    const dynamic: string = 'space.x16';
    // @ts-expect-error a plain string is not a TokenPath
    token(dynamic);
  });
});
