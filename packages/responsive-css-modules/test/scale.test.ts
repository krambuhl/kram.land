import { describe, expect, test } from 'vitest';

import { mediaQuery, rangesOf, toScale, typesFile } from '../src/scale.ts';
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

describe('rangesOf and mediaQuery', () => {
  const query = (match: Parameters<typeof rangesOf>[0]) => mediaQuery(rangesOf(match, scale), scale);

  test('matchMin is the breakpoint and up', () => {
    expect(query({ matchMin: 'sm' })).toBe('(width >= 32rem)');
    expect(query({ matchMin: 'base' })).toBeNull();
  });

  test('matchMax is up to the next breakpoint', () => {
    expect(query({ matchMax: 'sm' })).toBe('(width < 48rem)');
    expect(query({ matchMax: 'lg' })).toBeNull();
  });

  test('matchOnly is one breakpoint or several, merged into runs', () => {
    expect(query({ matchOnly: 'base' })).toBe('(width < 32rem)');
    expect(query({ matchOnly: 'md' })).toBe('(48rem <= width < 64rem)');
    expect(query({ matchOnly: ['sm', 'md'] })).toBe('(32rem <= width < 64rem)');
    expect(query({ matchOnly: 'lg' })).toBe('(width >= 64rem)');
    expect(query({ matchOnly: ['base', 'md'] })).toBe('(width < 32rem), (48rem <= width < 64rem)');
    expect(query({ matchOnly: ['base', 'sm', 'md', 'lg'] })).toBeNull();
  });

  test('a matchOnly list out of order or with repeats is an error naming the order to write', () => {
    expect(() => rangesOf({ matchOnly: ['md', 'sm'] }, scale)).toThrow(
      "matchOnly lists breakpoints in order without repeats; write ['sm', 'md']."
    );
    expect(() => rangesOf({ matchOnly: ['lg', 'base', 'lg'] }, scale)).toThrow("write ['base', 'lg']");
  });

  test('an unknown breakpoint or an empty list is an error', () => {
    expect(() => rangesOf({ matchMin: 'xxl' }, scale)).toThrow(
      '"xxl" is not a breakpoint. Breakpoints are base, sm, md, lg.'
    );
    expect(() => rangesOf({ matchOnly: [] }, scale)).toThrow('matchOnly needs at least one breakpoint.');
  });
});

test('typesFile registers the breakpoint names and every ordered list of them', () => {
  const text = typesFile({ names: ['base', 'sm', 'md'], widths: ['0px', '1px', '2px'] });
  expect(text).toContain("breakpoint: 'base' | 'sm' | 'md';");
  expect(text).toContain(
    "list: readonly ['base'] | readonly ['sm'] | readonly ['base', 'sm'] | readonly ['md'] | readonly ['base', 'md'] | readonly ['sm', 'md'] | readonly ['base', 'sm', 'md'];"
  );
});
