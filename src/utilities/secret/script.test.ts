import { describe, expect, test } from 'vitest';

import { clampProgress, scrollProgress } from './script.ts';

describe('secret scroll progress', () => {
  test('stays between the page and the portrait view', () => {
    expect(clampProgress(-0.2)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(1.3)).toBe(1);
  });

  test('follows the scroll position through the runway at the end of the page', () => {
    expect(scrollProgress(0, 1000, 400)).toBe(0);
    expect(scrollProgress(600, 1000, 400)).toBe(0);
    expect(scrollProgress(800, 1000, 400)).toBe(0.5);
    expect(scrollProgress(1000, 1000, 400)).toBe(1);
    expect(scrollProgress(500, 1000, 0)).toBe(0);
  });
});
