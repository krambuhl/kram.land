import { describe, expect, test } from 'vitest';

import { flatten } from '../src/core/flatten.ts';
import { checkReferences, emitValue, parseReference, resolveValue } from '../src/core/references.ts';

const tree = {
  gray: {
    50: { value: '#fafafa' },
    900: { value: '#171717', dark: '#0a0a0a' },
  },
  bg: {
    page: { value: '{gray.50}', dark: '{gray.900}' },
    card: { value: '{bg.page}' },
  },
  space: { x16: { value: '16px' } },
};
const tokens = flatten(tree);

describe('parseReference', () => {
  test('recognises {path} and nothing else', () => {
    expect(parseReference('{gray.50}')).toBe('gray.50');
    expect(parseReference('#fafafa')).toBeNull();
    expect(parseReference('{gray.50} ')).toBeNull();
    expect(parseReference(16)).toBeNull();
  });
});

describe('checkReferences', () => {
  test('accepts references to leaves, including per-mode references', () => {
    expect(() => checkReferences(tokens)).not.toThrow();
  });

  test('a reference to a group is an error naming the group', () => {
    const t = flatten({ ...tree, bad: { value: '{gray}' } });
    expect(() => checkReferences(t)).toThrow(/bad.*"gray".*group/);
  });

  test('a missing target is an error naming the token and the path', () => {
    const t = flatten({ ...tree, bad: { value: '{gray.100}' } });
    expect(() => checkReferences(t)).toThrow(/"bad".*"gray\.100"/);
  });

  test('a cycle is an error listing the cycle', () => {
    const t = flatten({ a: { value: '{b}' }, b: { value: '{c}' }, c: { value: '{a}' } });
    expect(() => checkReferences(t)).toThrow(/a -> b -> c -> a/);
  });

  test('a self-reference is a cycle', () => {
    const t = flatten({ a: { value: '{a}' } });
    expect(() => checkReferences(t)).toThrow(/a -> a/);
  });

  test('a cycle through a mode value is found', () => {
    const t = flatten({ a: { value: '#000', dark: '{b}' }, b: { value: '{a}' } });
    expect(() => checkReferences(t)).toThrow(/cycle/i);
  });
});

describe('emitValue', () => {
  test('a reference emits as var(), a literal emits as itself', () => {
    expect(emitValue('{gray.50}')).toBe('var(--gray-50)');
    expect(emitValue('#fafafa')).toBe('#fafafa');
    expect(emitValue(16)).toBe('16');
  });
});

describe('resolveValue', () => {
  test('follows references to a literal', () => {
    expect(resolveValue('bg.page', tokens)).toBe('#fafafa');
    expect(resolveValue('bg.card', tokens)).toBe('#fafafa');
    expect(resolveValue('space.x16', tokens)).toBe('16px');
  });

  test('follows per-mode references, falling back to the base value', () => {
    expect(resolveValue('bg.page', tokens, 'dark')).toBe('#0a0a0a');
    expect(resolveValue('bg.card', tokens, 'dark')).toBe('#0a0a0a');
    expect(resolveValue('gray.50', tokens, 'dark')).toBe('#fafafa');
  });

  test('a mode value that is a literal wins over a base reference', () => {
    const t = flatten({ a: { value: '#111' }, b: { value: '{a}', dark: '#fff' } });
    expect(resolveValue('b', t, 'dark')).toBe('#fff');
  });

  test('an unknown path is an error', () => {
    expect(() => resolveValue('nope', tokens)).toThrow(/"nope"/);
  });
});
