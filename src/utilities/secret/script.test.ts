import { describe, expect, test } from 'vitest';

import { nextOpen } from './script.ts';

describe('portrait view', () => {
  test('opens once the scroll passes the threshold', () => {
    expect(nextOpen(8, 9, 4, false)).toBe(false);
    expect(nextOpen(10, 9, 4, false)).toBe(true);
  });

  test('stays open through a small dead zone below the threshold, then closes', () => {
    expect(nextOpen(6, 9, 4, true)).toBe(true);
    expect(nextOpen(4, 9, 4, true)).toBe(false);
  });
});
