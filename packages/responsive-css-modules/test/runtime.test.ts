import { describe, expect, test, vi } from 'vitest';

import { responsive, variantClass } from '../src/index.ts';

describe('variantClass', () => {
  test('names each option by kind and breakpoints', () => {
    expect(variantClass('cn', { matchMin: 'sm' })).toBe('cn--min-sm');
    expect(variantClass('cn', { matchMax: 'md' })).toBe('cn--max-md');
    expect(variantClass('cn', { matchOnly: 'base' })).toBe('cn--only-base');
    expect(variantClass('cn', { matchOnly: ['sm'] })).toBe('cn--only-sm');
    expect(variantClass('cn', { matchOnly: ['sm', 'md', 'lg'] })).toBe('cn--only-sm-md-lg');
    expect(variantClass('cn', { matchOnly: ['lg', 'base'] })).toBe('cn--only-lg-base');
  });
});

describe('responsive', () => {
  const styles = { cn: '_cn_1', 'cn--min-sm': '_cn--min-sm_1' };

  test('returns the variant class for each class in the module', () => {
    expect(responsive(styles).cn({ matchMin: 'sm' })).toBe('_cn--min-sm_1');
  });

  test('a variant that was not emitted warns and returns an empty class', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(responsive(styles).cn({ matchMax: 'sm' })).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no cn--max-sm class'));
    warn.mockRestore();
  });
});
