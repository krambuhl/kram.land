import { describe, expect, test } from 'vitest';

import { createField } from './index.ts';

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const REACH = 2 ** (0.5 - 1 / 2 ** 1.35);

describe('createField', () => {
  test('starts with the screen already covered', () => {
    const field = createField(1440, 900, seeded(1));
    const covered = field.blobs.reduce((sum, b) => sum + Math.PI * b.r ** 2, 0);
    expect(covered / (1440 * 900)).toBeGreaterThan(0.4);
  });

  test('keeps visible blobs from touching while new ones push out from under the portrait', () => {
    const field = createField(1440, 900, seeded(2));
    for (let i = 0; i < 300; i++) field.step(16);
    let worst = -Infinity;
    const visible = field.blobs.filter((b) => Math.hypot(b.drawX - 720, b.drawY - 450) > 96);
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i];
        const b = visible[j];
        const overlap = (a.r + b.r) * REACH - Math.hypot(a.drawX - b.drawX, a.drawY - b.drawY);
        worst = Math.max(worst, overlap);
      }
    }
    expect(worst).toBeLessThanOrEqual(0);
  });
});
