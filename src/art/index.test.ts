import { describe, expect, test } from 'vitest';

import { createField } from './index.ts';

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const portrait = { x: 720, y: 450, r: 96 };
const portrait800 = { x: 400, y: 300, r: 96 };

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

  test('a blob keeps its colour for its whole life', () => {
    const field = createField(1440, 900, { anchor: portrait }, seeded(7));
    const born = new Map(field.blobs.map((b) => [b, b.color]));
    for (let i = 0; i < 400; i++) {
      field.step(16);
      for (const b of field.blobs) if (!born.has(b)) born.set(b, b.color);
    }
    const changed = field.blobs.filter((b) => born.get(b) !== b.color);
    expect(changed).toHaveLength(0);
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

  test('a moving pointer turns the blobs around it far more than distant ones', () => {
    const run = (touched: boolean, seed: number) => {
      const field = createField(800, 600, { anchor: portrait800 }, seeded(seed));
      for (let i = 0; i < 40; i++) field.step(16);
      const angle = (b: { x: number; y: number }, x: number, y: number) => Math.atan2(b.y - y, b.x - x);
      const near = field.blobs.filter((b) => Math.abs(Math.hypot(b.x - 150, b.y - 150) - 45) < 20);
      const far = field.blobs.filter((b) => Math.abs(Math.hypot(b.x - 650, b.y - 450) - 45) < 20);
      const start = new Map([...near, ...far].map((b) => [b, { x: b.x, y: b.y }]));
      for (let i = 0; i < 120; i++) {
        if (touched) field.hover({ x: 150 + (i % 2), y: 150 });
        field.step(16);
      }
      const turned = (list: typeof near, x: number, y: number) =>
        list.reduce((sum, b) => {
          const from = start.get(b) ?? b;
          const turn = angle(b, x, y) - angle(from, x, y);
          return sum + Math.atan2(Math.sin(turn), Math.cos(turn));
        }, 0) / list.length;
      return { near: turned(near, 150, 150), far: turned(far, 650, 450) };
    };
    const seeds = [8, 11, 12, 13];
    const near = seeds.map((seed) => Math.abs(run(true, seed).near - run(false, seed).near));
    const far = seeds.map((seed) => Math.abs(run(true, seed).far - run(false, seed).far));
    const mean = (list: number[]) => list.reduce((sum, x) => sum + x, 0) / list.length;
    expect(mean(near)).toBeGreaterThan(0.1);
    expect(mean(far)).toBeLessThan(mean(near) / 2);
  });

  test('a moving pointer leaves a small ring that swells the blobs near it and changes no colours', () => {
    const run = (touched: boolean) => {
      const field = createField(800, 600, { anchor: portrait800 }, seeded(9));
      for (let i = 0; i < 40; i++) field.step(16);
      const near = field.blobs.filter((b) => Math.hypot(b.x - 150, b.y - 150) < 45);
      const size = () => near.reduce((sum, b) => sum + b.r, 0) / near.length;
      if (touched) field.touch(150, 150, { x: 1, y: 0 });
      for (let i = 0; i < 8; i++) field.step(16);
      const passing = size();
      const colours = near.map((b) => b.color).join();
      for (let i = 0; i < 90; i++) field.step(16);
      return { passing, after: size(), colours };
    };
    const calm = run(false);
    const stirred = run(true);
    expect(stirred.passing).toBeGreaterThan(calm.passing * 1.03);
    expect(Math.abs(stirred.after / calm.after - 1)).toBeLessThan(0.05);
    expect(stirred.colours).toBe(calm.colours);
  });

  test('a tap swells the blobs its ring is passing, and they settle back', () => {
    const run = (tapped: boolean) => {
      const field = createField(800, 600, { anchor: portrait800 }, seeded(10));
      for (let i = 0; i < 40; i++) field.step(16);
      const ring = field.blobs.filter((b) => Math.abs(Math.hypot(b.x - 150, b.y - 150) - 100) < 15);
      const size = () => ring.reduce((sum, b) => sum + b.r, 0) / ring.length;
      if (tapped) field.touch(150, 150);
      for (let i = 0; i < 16; i++) field.step(16);
      const passing = size();
      for (let i = 0; i < 120; i++) field.step(16);
      return { passing, after: size() };
    };
    const calm = run(false);
    const tapped = run(true);
    expect(tapped.passing).toBeGreaterThan(calm.passing * 1.1);
    expect(tapped.after / calm.after).toBeGreaterThan(0.9);
    expect(tapped.after / calm.after).toBeLessThan(1.1);
  });
});
