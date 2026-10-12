import { describe, expect, test } from 'vitest';

import { createField } from './index.ts';

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const portrait = { x: 720, y: 450, r: 96 };

describe.each([
  ['superellipse', 2 ** 1.35],
  ['circle', 2],
])('createField with a %s portrait', (_, EXPONENT) => {
  const REACH = 2 ** (0.5 - 1 / EXPONENT);

  test('starts with the screen already covered', () => {
    const field = createField(1440, 900, { anchor: portrait, exponent: EXPONENT }, seeded(1));
    const covered = field.blobs.reduce((sum, b) => sum + Math.PI * b.r ** 2, 0);
    expect(covered / (1440 * 900)).toBeGreaterThan(0.4);
  });

  test('packs against the portrait and keeps a gutter between blobs as new ones push out from its rim', () => {
    const field = createField(1440, 900, { anchor: portrait, exponent: EXPONENT }, seeded(2));
    for (let i = 0; i < 300; i++) field.step(16);
    const blobs = field.blobs;
    let worst = -Infinity;
    for (const b of blobs) {
      const dx = b.x - portrait.x;
      const dy = b.y - portrait.y;
      const away = Math.hypot(dx, dy);
      const edge = portrait.r * (Math.abs(dx / away) ** EXPONENT + Math.abs(dy / away) ** EXPONENT) ** (-1 / EXPONENT);
      worst = Math.max(worst, edge + b.r - away);
    }
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i];
        const b = blobs[j];
        worst = Math.max(worst, (a.r + b.r) * REACH - Math.hypot(a.drawX - b.drawX, a.drawY - b.drawY));
      }
    }
    expect(worst).toBeLessThanOrEqual(0);
  });
});
