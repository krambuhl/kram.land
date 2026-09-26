import { describe, expect, test } from 'vitest';

import { loadTokens } from 'token-jet';

import { callAt, complete, diagnose, findCalls, hover } from '../src/analyze.ts';
import config from './fixtures/tokens.config.ts';

const resolved = loadTokens(config);

describe('findCalls', () => {
  test('finds every token() literal with the offsets of its argument', () => {
    const text = '.a { gap: token(\'space.x16\'); color: token("content.body"); }';
    expect(findCalls(text)).toEqual([
      { path: 'space.x16', start: 17, end: 26, closed: true },
      { path: 'content.body', start: 44, end: 56, closed: true },
    ]);
  });

  test('an unclosed call while typing is found, marked open', () => {
    expect(findCalls(".a { gap: token('spa")).toEqual([{ path: 'spa', start: 17, end: 20, closed: false }]);
    expect(findCalls(".a { gap: token('')")).toEqual([{ path: '', start: 17, end: 17, closed: true }]);
  });

  test('tokenize( and plain words are not calls', () => {
    expect(findCalls("tokenize('a.b') token")).toEqual([]);
  });
});

describe('callAt', () => {
  const text = ".a { gap: token('space.x16'); }";

  test('an offset inside or at either edge of the argument returns the call', () => {
    expect(callAt(text, 17)?.path).toBe('space.x16');
    expect(callAt(text, 20)?.path).toBe('space.x16');
    expect(callAt(text, 26)?.path).toBe('space.x16');
  });

  test('an offset outside the quotes returns nothing', () => {
    expect(callAt(text, 16)).toBeUndefined();
    expect(callAt(text, 27)).toBeUndefined();
  });
});

describe('complete', () => {
  test('lists every path, with the value as detail and the description as documentation', () => {
    const items = complete(resolved);
    expect(items.map((i) => i.label)).toContain('space.x16');
    const x16 = items.find((i) => i.label === 'space.x16');
    expect(x16).toEqual({ label: 'space.x16', detail: '16px', documentation: 'The default gap.', deprecated: false });
  });

  test('a mode token shows every value and a deprecated one is flagged', () => {
    const page = complete(resolved).find((i) => i.label === 'bg.page');
    expect(page?.detail).toBe('#fafafa · dark #171717');
    const regular = complete(resolved).find((i) => i.label === 'content.regular');
    expect(regular?.deprecated).toBe(true);
  });
});

describe('hover', () => {
  test('shows the path, the value per mode with references resolved, and the description', () => {
    expect(hover('bg.page', resolved)).toBe(
      ['`bg.page`', '', 'base: `{gray.50}` → `#fafafa`', 'dark: `{gray.900}` → `#171717`'].join('\n')
    );
    expect(hover('space.x16', resolved)).toBe(['`space.x16`', '', 'base: `16px`', '', 'The default gap.'].join('\n'));
  });

  test('a deprecated token says so', () => {
    expect(hover('content.regular', resolved)).toContain('deprecated: use content.body');
  });

  test('an unknown path has no hover', () => {
    expect(hover('space.x17', resolved)).toBeUndefined();
  });
});

describe('diagnose', () => {
  test('an unknown path is an error with the nearest path', () => {
    const [d] = diagnose(".a { gap: token('space.x17'); }", resolved);
    expect(d).toEqual({
      call: { path: 'space.x17', start: 17, end: 26, closed: true },
      severity: 'error',
      message: 'Token "space.x17" does not exist. Did you mean "space.x16"?',
      replacement: 'space.x16',
    });
  });

  test('a path nothing is near has no suggestion', () => {
    const [d] = diagnose(".a { gap: token('zzzzzzzzzz'); }", resolved);
    expect(d?.message).toBe('Token "zzzzzzzzzz" does not exist.');
    expect(d?.replacement).toBeUndefined();
  });

  test('a deprecated path is a warning, with the replacement when the text names a token', () => {
    const [d] = diagnose(".a { color: token('content.regular'); }", resolved);
    expect(d?.severity).toBe('warning');
    expect(d?.message).toBe('Token "content.regular" is deprecated: use content.body.');
    expect(d?.replacement).toBe('content.body');
  });

  test('an open call and a known path produce nothing', () => {
    expect(diagnose(".a { gap: token('space.x16'); color: token('spa", resolved)).toEqual([]);
  });
});
