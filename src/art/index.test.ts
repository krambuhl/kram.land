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

  test('blobs grow on their way from the portrait to the edge, and swell more right at the edge', () => {
    const field = createField(1440, 900, { anchor: portrait, exponent: EXPONENT }, seeded(3));
    for (let i = 0; i < 120; i++) field.step(16);
    const near = field.blobs.filter((b) => Math.hypot(b.x - portrait.x, b.y - portrait.y) < portrait.r + 40);
    const edge = field.blobs.filter((b) => b.x < 20 || b.x > 1420 || b.y < 20 || b.y > 880);
    const mean = (list: typeof near) => list.reduce((sum, b) => sum + b.r * 2, 0) / list.length;
    expect(mean(near)).toBeLessThan(16);
    expect(mean(edge)).toBeGreaterThan(20);
    expect(Math.max(...edge.map((b) => b.r * 2))).toBeLessThanOrEqual(28);
  });

  test('colours fall into bands, so most blobs share a colour with their nearest neighbour', () => {
    const field = createField(1440, 900, { anchor: portrait, exponent: EXPONENT }, seeded(4));
    for (let i = 0; i < 120; i++) field.step(16);
    const sample = field.blobs.slice(0, 400);
    const shared = sample.filter((a) => {
      let nearest = field.blobs[0];
      let best = Infinity;
      for (const b of field.blobs) {
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (b !== a && d < best) {
          best = d;
          nearest = b;
        }
      }
      return nearest.color === a.color;
    });
    expect(shared.length / sample.length).toBeGreaterThan(0.25);
  });

  test('packs against the portrait with no visible overlap as new blobs push out from its rim', () => {
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
    expect(worst).toBeLessThanOrEqual(1);
  });
});
