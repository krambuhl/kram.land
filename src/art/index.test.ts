import { describe, expect, test } from 'vitest';

import { createField } from './index.ts';

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const portrait = { x: 720, y: 450, r: 96 };

// the overlap and floor tests run the full simulation for a few hundred steps, which outlasts the 5s
// default on slower CI runners.
describe('createField', { timeout: 30_000 }, () => {
  test('starts with the screen already covered', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(1));
    const covered = field.blobs.reduce((sum, b) => sum + Math.PI * b.r ** 2, 0);
    expect(covered / (1440 * 900)).toBeGreaterThan(0.4);
  });

  test('blobs grow on their way from the portrait to the edge, and swell more right at the edge', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(3));
    for (let i = 0; i < 120; i++) field.step(16);
    const near = field.blobs.filter((b) => Math.hypot(b.x - portrait.x, b.y - portrait.y) < portrait.r + 40);
    const edge = field.blobs.filter((b) => b.x < 20 || b.x > 1420 || b.y < 20 || b.y > 880);
    const mean = (list: typeof near) => list.reduce((sum, b) => sum + b.r * 2, 0) / list.length;
    expect(mean(near)).toBeLessThan(16);
    expect(mean(edge)).toBeGreaterThan(20);
    expect(Math.max(...edge.map((b) => b.r * 2))).toBeLessThanOrEqual(56);
  });

  test('colours fall into bands, so most blobs share a colour with their nearest neighbour', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(4));
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
    expect(shared.length / sample.length).toBeGreaterThan(0.2);
  });

  test('packs against the portrait with no visible overlap as new blobs push out from its rim', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(2));
    for (let i = 0; i < 300; i++) field.step(16);
    const blobs = field.blobs;
    let worst = -Infinity;
    for (const b of blobs) {
      const dx = b.x - portrait.x;
      const dy = b.y - portrait.y;
      const away = Math.hypot(dx, dy);
      const edge = portrait.r;
      worst = Math.max(worst, edge + b.r - away);
    }
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i];
        const b = blobs[j];
        worst = Math.max(worst, a.r + b.r - Math.hypot(a.drawX - b.drawX, a.drawY - b.drawY));
      }
    }
    expect(worst).toBeLessThanOrEqual(1);
  });

  test('blobs below the floor grow larger toward the bottom and still keep their gap', () => {
    const field = createField(1440, 1150, { anchor: portrait, floor: 900 }, seeded(5));
    for (let i = 0; i < 200; i++) field.step(16);
    const mean = (list: typeof field.blobs) => list.reduce((sum, b) => sum + b.r * 2, 0) / list.length;
    const top = field.blobs.filter((b) => b.y < 20);
    const bottom = field.blobs.filter((b) => b.y > 1130);
    expect(mean(bottom)).toBeGreaterThan(mean(top) * 1.08);
    let worst = -Infinity;
    for (let i = 0; i < field.blobs.length; i++) {
      for (let j = i + 1; j < field.blobs.length; j++) {
        const a = field.blobs[i];
        const b = field.blobs[j];
        worst = Math.max(worst, a.r + b.r - Math.hypot(a.drawX - b.drawX, a.drawY - b.drawY));
      }
    }
    expect(worst).toBeLessThanOrEqual(1);
  });

  test('blobs in the top corners grow larger than those along the middle of the top edge', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(6));
    for (let i = 0; i < 200; i++) field.step(16);
    const mean = (list: typeof field.blobs) => list.reduce((sum, b) => sum + b.r * 2, 0) / list.length;
    const corners = field.blobs.filter((b) => b.y < 40 && (b.x < 40 || b.x > 1400));
    const middle = field.blobs.filter((b) => b.y < 40 && Math.abs(b.x - 720) < 200);
    expect(mean(corners)).toBeGreaterThan(mean(middle) * 1.12);
  });

  test('reshaping keeps the running field, fills new area and reflows around a moved portrait', () => {
    const field = createField(800, 600, { anchor: { x: 400, y: 300, r: 96 } }, seeded(7));
    for (let i = 0; i < 60; i++) field.step(16);
    const colours = new Map(field.blobs.map((b) => [b, b.color]));
    const moved = { x: 500, y: 340, r: 96 };
    field.reshape(1000, 700, { anchor: moved });
    const kept = field.blobs.filter((b) => colours.has(b));
    expect(kept.every((b) => b.color === colours.get(b))).toBe(true);
    expect(kept.length / colours.size).toBeGreaterThan(0.95);
    const grown = field.blobs.filter((b) => b.x > 800 || b.y > 600);
    const covered = grown.reduce((sum, b) => sum + Math.PI * b.r ** 2, 0) / (1000 * 700 - 800 * 600);
    expect(covered).toBeGreaterThan(0.3);
    for (let i = 0; i < 10; i++) field.step(16);
    const inside = field.blobs.filter((b) => Math.hypot(b.x - moved.x, b.y - moved.y) < moved.r);
    expect(inside.length).toBe(0);
  });
});
