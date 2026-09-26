import { describe, expectTypeOf, test } from 'vitest';

import { classNameForPadding } from './__snapshots__/padding.ts';
import { classNameForSurface } from './__snapshots__/surface.ts';
import { spaceValue } from './__snapshots__/spaceValue.ts';
import { token } from './__snapshots__/tokens/index.ts';

describe('generated cssModuleClass function', () => {
  test('accepts every member of its union and returns a string', () => {
    expectTypeOf(classNameForPadding(token('space.x4'))).toEqualTypeOf<string>();
    expectTypeOf(classNameForPadding(token('space.x16'))).toEqualTypeOf<string>();
  });

  test('maps undefined to undefined', () => {
    const maybe = undefined as ReturnType<typeof token<'space.x16'>> | undefined;
    expectTypeOf(classNameForPadding(maybe)).toEqualTypeOf<string | undefined>();
  });

  test('rejects a token outside the selection', () => {
    // @ts-expect-error a colour is not spacing
    classNameForPadding(token('bg.page'));
    // @ts-expect-error a spacing token is not a surface
    classNameForSurface(token('space.x16'));
  });

  test('a glob selection is typed on the matched literals', () => {
    expectTypeOf(classNameForSurface(token('bg.card'))).toEqualTypeOf<string>();
  });
});

describe('generated tsRecord', () => {
  test('is keyed by the union', () => {
    expectTypeOf(spaceValue[token('space.x4')]).toEqualTypeOf<string>();
    // @ts-expect-error not a space token
    expectTypeOf(spaceValue[token('bg.page')]).toBeAny();
  });
});
