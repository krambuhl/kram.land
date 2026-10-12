import { describe, expect, test } from 'vitest';

import { nextOpen } from './script.ts';

describe('portrait view', () => {
  test('opens once the scroll passes the threshold', () => {
    expect(nextOpen(100, 200, false)).toBe(false);
    expect(nextOpen(201, 200, false)).toBe(true);
  });

  test('stays open through a small dead zone below the threshold, then closes', () => {
    expect(nextOpen(190, 200, true)).toBe(true);
    expect(nextOpen(180, 200, true)).toBe(false);
  });
});
