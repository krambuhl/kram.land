import { describe, expect, test } from 'vitest';

import { mediaQuery, rangeOf, toScale, typesFile } from '../src/scale.ts';
import type { Scale } from '../src/scale.ts';

const scale: Scale = { names: ['base', 'sm', 'md', 'lg'], widths: ['0px', '32rem', '48rem', '64rem'] };

describe('toScale', () => {
  test('keeps the order it is given', () => {
    expect(
      toScale([
        { name: 'base', width: '0px' },
        { name: 'sm', width: '32rem' },
      ])
    ).toEqual({
      names: ['base', 'sm'],
      widths: ['0px', '32rem'],
    });
  });

  test('an empty list or a repeated name is an error', () => {
    expect(() => toScale([])).toThrow('There are no breakpoints.');
    expect(() =>
      toScale([
        { name: 'sm', width: '1px' },
        { name: 'sm', width: '2px' },
      ])
    ).toThrow('The breakpoint "sm" is listed twice.');
  });
});

describe('rangeOf and mediaQuery', () => {
  const query = (match: Parameters<typeof rangeOf>[0]) => mediaQuery(rangeOf(match, scale), scale);

  test('matchMin is the breakpoint and up', () => {
    expect(query({ matchMin: 'sm' })).toBe('(width >= 32rem)');
    expect(query({ matchMin: 'base' })).toBeNull();
  });

  test('matchMax is up to the next breakpoint', () => {
    expect(query({ matchMax: 'sm' })).toBe('(width < 48rem)');
    expect(query({ matchMax: 'lg' })).toBeNull();
  });

  test('matchOnly is one breakpoint or a contiguous run', () => {
    expect(query({ matchOnly: 'base' })).toBe('(width < 32rem)');
    expect(query({ matchOnly: 'md' })).toBe('(48rem <= width < 64rem)');
    expect(query({ matchOnly: ['sm', 'md'] })).toBe('(32rem <= width < 64rem)');
    expect(query({ matchOnly: 'lg' })).toBe('(width >= 64rem)');
  });

  test('an unknown breakpoint or a gap is an error', () => {
    expect(() => rangeOf({ matchMin: 'xxl' }, scale)).toThrow(
      '"xxl" is not a breakpoint. Breakpoints are base, sm, md, lg.'
    );
    expect(() => rangeOf({ matchOnly: ['base', 'md'] }, scale)).toThrow('is not a contiguous run');
    expect(() => rangeOf({ matchOnly: ['md', 'sm'] }, scale)).toThrow('is not a contiguous run');
  });
});

test('typesFile registers the names and every contiguous run', () => {
  const text = typesFile({ names: ['base', 'sm', 'md'], widths: ['0px', '1px', '2px'] });
  expect(text).toContain("breakpoint: 'base' | 'sm' | 'md';");
  expect(text).toContain(
    "range: readonly ['base'] | readonly ['base', 'sm'] | readonly ['base', 'sm', 'md'] | readonly ['sm'] | readonly ['sm', 'md'] | readonly ['md'];"
  );
});
