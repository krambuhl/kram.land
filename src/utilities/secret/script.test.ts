import { describe, expect, test } from 'vitest';

import { clampProgress, settleTarget } from './script.ts';

describe('secret scroll progress', () => {
  test('stays between the page and the secret state', () => {
    expect(clampProgress(-0.2)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(1.3)).toBe(1);
  });

  test('settles to whichever end is closer, halfway going to the secret state', () => {
    expect(settleTarget(0.49)).toBe(0);
    expect(settleTarget(0.5)).toBe(1);
    expect(settleTarget(0.9)).toBe(1);
  });
});
