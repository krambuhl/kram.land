const SUPERELLIPSE = 2 ** 1.35;
const SPAWN_EVERY = 3;
const SPAWN_ATTEMPTS = 32;
const SEED_ROUNDS = 20;
const GROW = 0.08;
const GAP = 5;
const RELAX = 8;
const SMOOTH = 0.5;
const SIZE = 7;
const EDGE_GROWTH = [2, 4];
const RAINBOW = ['#5A4D9A', '#A067C3', '#CD361F', '#F07C31', '#E9AC38', '#5B9E47', '#58BABB', '#1079CB'];

interface Blob {
  x: number;
  y: number;
  drawX: number;
  drawY: number;
  r: number;
  extra: number;
  color: string;
}

interface Anchor {
  x: number;
  y: number;
  r: number;
}

function extent(exponent: number, ux: number, uy: number): number {
  return (Math.abs(ux) ** exponent + Math.abs(uy) ** exponent) ** (-1 / exponent);
}

export interface FieldOptions {
  anchor?: Anchor;
  exponent?: number;
}

interface Field {
  blobs: Blob[];
  step(elapsed: number): void;
}

export function createField(width: number, height: number, options: FieldOptions = {}, random = Math.random): Field {
  const { anchor = { x: width / 2, y: height / 2, r: 0 }, exponent = SUPERELLIPSE } = options;
  const reachFactor = 2 ** (0.5 - 1 / exponent);
  const blobs: Blob[] = [];
  let sinceSpawn = 0;

  const edgeReach = (ux: number, uy: number) => {
    const tx = ux > 0 ? (width - anchor.x) / ux : ux < 0 ? -anchor.x / ux : Infinity;
    const ty = uy > 0 ? (height - anchor.y) / uy : uy < 0 ? -anchor.y / uy : Infinity;
    return Math.min(tx, ty);
  };

  const target = (b: Blob) => {
    const dx = b.x - anchor.x;
    const dy = b.y - anchor.y;
    const away = Math.hypot(dx, dy) || 0.01;
    const travelled = Math.min(1, Math.max(0, away / edgeReach(dx / away, dy / away)));
    return SIZE + b.extra * travelled;
  };

  const blob = (x: number, y: number): Blob => ({
    x,
    y,
    drawX: x,
    drawY: y,
    r: 0,
    extra: EDGE_GROWTH[0] + random() * (EDGE_GROWTH[1] - EDGE_GROWTH[0]),
    color: RAINBOW[Math.floor(random() * RAINBOW.length)],
  });

  const cell = 2 * (SIZE + EDGE_GROWTH[1]) * reachFactor + GAP;
  const columns = Math.ceil(width / cell) + 2;
  const rows = Math.ceil(height / cell) + 2;
  const cellOf = (x: number, y: number) => {
    const cx = Math.min(columns - 1, Math.max(0, Math.floor(x / cell) + 1));
    const cy = Math.min(rows - 1, Math.max(0, Math.floor(y / cell) + 1));
    return cy * columns + cx;
  };

  const settle = (passes: number): number => {
    let moved = 0;
    const grid: Blob[][] = Array.from({ length: columns * rows }, () => []);
    for (const b of blobs) grid[cellOf(b.x, b.y)].push(b);
    for (let pass = 0; pass < passes; pass++) {
      for (const a of blobs) {
        const ax = a.x - anchor.x;
        const ay = a.y - anchor.y;
        const away = Math.hypot(ax, ay) || 0.01;
        const clear = anchor.r * extent(exponent, ax / away, ay / away) + a.r * reachFactor + GAP;
        if (away < clear) {
          a.x = anchor.x + (ax / away) * clear;
          a.y = anchor.y + (ay / away) * clear;
        }
        const home = cellOf(a.x, a.y);
        const hx = home % columns;
        const hy = (home - hx) / columns;
        for (let cy = Math.max(0, hy - 1); cy <= Math.min(rows - 1, hy + 1); cy++) {
          for (let cx = Math.max(0, hx - 1); cx <= Math.min(columns - 1, hx + 1); cx++) {
            for (const b of grid[cy * columns + cx]) {
              if (b === a) continue;
              const ox = b.x - a.x;
              const oy = b.y - a.y;
              const reach = (a.r + b.r) * reachFactor + GAP;
              const squared = ox * ox + oy * oy;
              if (squared >= reach * reach) continue;
              const distance = Math.sqrt(squared) || 0.01;
              const push = (reach - distance) / 2 / distance;
              moved = Math.max(moved, reach - distance);
              a.x -= ox * push;
              a.y -= oy * push;
              b.x += ox * push;
              b.y += oy * push;
            }
          }
        }
      }
    }
    return moved;
  };

  const typical = SIZE + (EDGE_GROWTH[0] + EDGE_GROWTH[1]) / 4;
  const count = Math.round((width * height) / (Math.PI * (typical * reachFactor + GAP / 2) ** 2));
  for (let i = 0; i < count; i++) blobs.push(blob(random() * width, random() * height));
  for (const b of blobs) b.r = target(b);
  for (let round = 0; round < SEED_ROUNDS && settle(10) > 0.25; round++);
  for (const b of blobs) {
    b.drawX = b.x;
    b.drawY = b.y;
  }

  return {
    blobs,
    step(elapsed) {
      sinceSpawn += elapsed;
      while (sinceSpawn >= SPAWN_EVERY) {
        sinceSpawn -= SPAWN_EVERY;
        for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
          const angle = random() * Math.PI * 2;
          const ux = Math.cos(angle);
          const uy = Math.sin(angle);
          const rim = anchor.r * extent(exponent, ux, uy) + GAP + 1;
          const x = anchor.x + ux * rim;
          const y = anchor.y + uy * rim;
          const crowded = blobs.some(
            (b) => (b.x - x) ** 2 + (b.y - y) ** 2 < (Math.max(b.r, SIZE) * reachFactor + GAP / 2) ** 2
          );
          if (crowded) continue;
          blobs.push(blob(x, y));
          break;
        }
      }
      for (const b of blobs) b.r += (target(b) - b.r) * GROW;
      settle(RELAX);
      for (const b of blobs) {
        b.drawX += (b.x - b.drawX) * SMOOTH;
        b.drawY += (b.y - b.drawY) * SMOOTH;
      }
      for (let i = blobs.length - 1; i >= 0; i--) {
        const { x, y } = blobs[i];
        if (x < -60 || y < -60 || x > width + 60 || y > height + 60) blobs.splice(i, 1);
      }
    },
  };
}

function unitShape(exponent: number): Path2D {
  const path = new Path2D();
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = Math.sign(c) * Math.abs(c) ** (2 / exponent);
    const y = Math.sign(s) * Math.abs(s) ** (2 / exponent);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
}

export interface StartOptions {
  anchor?: () => Anchor;
  exponent?: number;
}

export default function start(canvas: HTMLCanvasElement, options: StartOptions = {}): () => void {
  const context = canvas.getContext('2d');
  if (context === null) return () => {};
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const exponent = options.exponent ?? SUPERELLIPSE;
  const shape = unitShape(exponent);
  let field: Field;
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    field = createField(width, height, { anchor: options.anchor?.(), exponent });
  };

  const draw = () => {
    const ratio = canvas.width / (width || 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    for (const blob of field.blobs) {
      context.setTransform(ratio * blob.r, 0, 0, ratio * blob.r, ratio * blob.drawX, ratio * blob.drawY);
      context.fillStyle = blob.color;
      context.fill(shape);
    }
  };

  const loop = (now: number) => {
    field.step(Math.min(64, last === 0 ? 16 : now - last));
    last = now;
    draw();
    frame = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', resize);
  if (still) draw();
  else frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
  };
}
