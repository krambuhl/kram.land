import { describe, expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';
import { matchGlob } from '../src/core/glob.ts';
import config from './fixtures/basic.config.ts';

const paths = flatten(config.tokens).map((t) => t.path);

describe('matchGlob', () => {
  test('** matches any depth', () => {
    expect(matchGlob('bg.**', paths)).toHaveLength(9);
    expect(matchGlob('bg.**', paths)).toContain('bg.elevated.pressed');
  });

  test('* matches exactly one segment', () => {
    expect(matchGlob('bg.*.hover', paths)).toEqual(['bg.page.hover', 'bg.base.hover', 'bg.elevated.hover']);
    expect(matchGlob('space.*', paths)).toEqual(['space.x0', 'space.x4', 'space.x16']);
  });

  test('** at the start selects by suffix', () => {
    expect(matchGlob('**.default', paths)).toEqual([
      'bg.page.default',
      'bg.base.default',
      'bg.elevated.default',
      'content.regular.default',
    ]);
  });

  test('an exact path matches itself', () => {
    expect(matchGlob('space.x4', paths)).toEqual(['space.x4']);
  });

  test('a pattern that matches no token is an error naming the pattern', () => {
    expect(() => matchGlob('bg.*', paths)).toThrow(/bg\.\*.*matches no tokens/);
    expect(() => matchGlob('nope.**', paths)).toThrow(/nope\.\*\*/);
  });

  test('results keep source order', () => {
    expect(matchGlob('**', paths)).toEqual(paths);
  });
});

describe('matchGlob edge cases', () => {
  const p = ['a.b', 'a.x.b', 'a.x.y.b', 'b', 'a'];
  test('** in the middle matches zero or more segments', () => {
    expect(matchGlob('a.**.b', p)).toEqual(['a.b', 'a.x.b', 'a.x.y.b']);
  });
  test('** alone matches everything', () => {
    expect(matchGlob('**', p)).toEqual(p);
  });
  test('a leading ** matches a bare top-level token too', () => {
    expect(matchGlob('**.b', p)).toEqual(['a.b', 'a.x.b', 'a.x.y.b', 'b']);
  });
  test('a literal dot in a segment is not a wildcard', () => {
    expect(() => matchGlob('a+b', p)).toThrow(/matches no tokens/);
  });
});
