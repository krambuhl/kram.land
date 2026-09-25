import { describe, expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';
import { validate } from '../src/core/validate.ts';
import config from './fixtures/basic.config.ts';

describe('validate', () => {
  test('accepts the fixture', () => {
    expect(() => validate(config, flatten(config.tokens))).not.toThrow();
  });

  test('a mode key that is not in modes is an error naming the token and the key', () => {
    const bad = { ...config, tokens: { bg: { page: { value: '#fff', drak: '#000' } } } };
    expect(() => validate(bad, flatten(bad.tokens))).toThrow(/bg\.page.*drak/);
  });

  test('a token or group named after a reserved key is an error', () => {
    const value = { ...config, tokens: { space: { value: { value: '1px' } } } };
    expect(() => validate(value, flatten(value.tokens))).toThrow(/reserved.*value/);
    const mode = { ...config, tokens: { space: { dark: { value: '1px' } } } };
    expect(() => validate(mode, flatten(mode.tokens))).toThrow(/reserved.*dark/);
  });

  test('a group with no leaves is an error', () => {
    const empty = { ...config, tokens: { space: {} } };
    expect(() => validate(empty, flatten(empty.tokens))).toThrow(/space.*no tokens/);
  });
});

describe('validate with metadata', () => {
  test('metadata keys on a leaf are not mistaken for mode values', () => {
    const c = {
      ...config,
      tokens: { a: { value: '#fff', type: 'color' as const, description: 'x', deprecated: true } },
    };
    expect(() => validate(c, flatten(c.tokens))).not.toThrow();
  });

  test("a group's type is not mistaken for a child", () => {
    const c = { ...config, tokens: { bg: { $group: { type: 'color' as const }, page: { value: '#fff' } } } };
    expect(() => validate(c, flatten(c.tokens))).not.toThrow();
  });

  test('a group with only metadata has no tokens', () => {
    const c = { ...config, tokens: { bg: { $group: { type: 'color' as const } } } };
    expect(() => validate(c, flatten(c.tokens))).toThrow(/bg.*no tokens/);
  });
});
