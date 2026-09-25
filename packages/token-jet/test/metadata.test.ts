import { describe, expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';
import { checkTypes, inferType, validateValue } from '../src/core/metadata.ts';

describe('validateValue', () => {
  test('color accepts hex, rgb(), hsl(), oklch() and named colors', () => {
    for (const v of [
      '#fff',
      '#ffffff',
      '#ffffff80',
      'rgb(0 0 0)',
      'hsl(215deg 10% 94%)',
      'oklch(0.7 0.1 178)',
      'rebeccapurple',
      'transparent',
    ]) {
      expect(validateValue('color', v), v).toBeNull();
    }
    expect(validateValue('color', '16px')).toMatch(/not a color/);
    expect(validateValue('color', 16)).toMatch(/not a color/);
  });

  test('dimension accepts a number with a length unit or 0', () => {
    for (const v of ['16px', '1rem', '0', '0px', '-4px', '1.5em', '50%', '100vw']) {
      expect(validateValue('dimension', v), v).toBeNull();
    }
    expect(validateValue('dimension', '#fff')).toMatch(/not a dimension/);
    expect(validateValue('dimension', '16')).toMatch(/not a dimension/);
  });

  test('fontWeight accepts 1 to 1000 and the keyword names', () => {
    for (const v of [400, '700', 'bold', 'normal', 'lighter'])
      expect(validateValue('fontWeight', v), String(v)).toBeNull();
    expect(validateValue('fontWeight', 1200)).toMatch(/not a fontWeight/);
  });

  test('number accepts a unitless number', () => {
    expect(validateValue('number', 1.5)).toBeNull();
    expect(validateValue('number', '1.5')).toBeNull();
    expect(validateValue('number', '1.5px')).toMatch(/not a number/);
  });

  test('duration accepts ms or s', () => {
    expect(validateValue('duration', '200ms')).toBeNull();
    expect(validateValue('duration', '0.2s')).toBeNull();
    expect(validateValue('duration', '200')).toMatch(/not a duration/);
  });

  test('fontFamily accepts any non-empty string', () => {
    expect(validateValue('fontFamily', 'Inter, sans-serif')).toBeNull();
    expect(validateValue('fontFamily', '')).toMatch(/not a fontFamily/);
  });

  test('a reference is never validated as a value', () => {
    expect(validateValue('color', '{gray.50}')).toBeNull();
  });
});

describe('inferType', () => {
  test("a leaf's own type wins, then the nearest group's, then none", () => {
    const tree = {
      bg: {
        $group: { type: 'color' as const },
        page: { value: '#fff' },
        size: { value: '1px', type: 'dimension' as const },
      },
      space: { x16: { value: '16px' } },
    };
    const types = Object.fromEntries(flatten(tree).map((t) => [t.path, inferType(t)]));
    expect(types).toEqual({ 'bg.page': 'color', 'bg.size': 'dimension', 'space.x16': undefined });
  });
});

describe('checkTypes', () => {
  test('a value that does not match its type is an error naming the token', () => {
    expect(() => checkTypes(flatten({ a: { value: '16px', type: 'color' } }))).toThrow(/"a".*16px.*not a color/);
    expect(() => checkTypes(flatten({ a: { value: '#fff', type: 'dimension' } }))).toThrow(/"a".*not a dimension/);
  });

  test('a mode value is validated against the same type', () => {
    expect(() => checkTypes(flatten({ a: { value: '#fff', dark: '16px', type: 'color' } }))).toThrow(
      /"a".*dark.*not a color/
    );
  });

  test('a group-level type applies to every leaf', () => {
    expect(() => checkTypes(flatten({ bg: { $group: { type: 'color' as const }, page: { value: '16px' } } }))).toThrow(
      /"bg\.page".*not a color/
    );
  });

  test('a reference must point at a token of the same type', () => {
    const tokens = flatten({
      space: { x16: { value: '16px', type: 'dimension' } },
      bg: { page: { value: '{space.x16}', type: 'color' } },
    });
    expect(() => checkTypes(tokens)).toThrow(/"bg\.page".*color.*"space\.x16".*dimension/);
  });

  test('a reference to an untyped token is allowed', () => {
    expect(() => checkTypes(flatten({ a: { value: '#fff' }, b: { value: '{a}', type: 'color' } }))).not.toThrow();
  });

  test('an unknown type name is an error listing the valid ones', () => {
    // @ts-expect-error 'colour' is not a token type; checkTypes guards a config built without defineConfig
    expect(() => checkTypes(flatten({ a: { value: '1', type: 'colour' } }))).toThrow(/"colour".*color.*dimension/);
  });

  test('untyped tokens are not validated', () => {
    expect(() => checkTypes(flatten({ a: { value: 'anything at all' } }))).not.toThrow();
  });
});
