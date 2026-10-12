const SPAWN_EVERY = 3;
const SPAWN_ATTEMPTS = 32;
const SEED_ROUNDS = 20;
const GROW = 0.08;
const GAP = 5;
const RELAX = 8;
const SMOOTH = 0.5;
const SIZE = 7;
const MOOD_PERIOD = [12000, 28000];
const SPIN = 2;
const INNER_BREATHE = 0.12;
const OUTER_BREATHE = 0.15;
const SHIFT = 16;
const BAND = 50;
const DRIFT = 0.025;
const ARMS = 3;
const JITTER = 3;
const EDGE_GROWTH = [2, 4];
const EDGE_SWELL = 3;
const SWELL_FROM = 0.85;
const RAINBOW = ['#5A4D9A', '#A067C3', '#CD361F', '#F07C31', '#E9AC38', '#5B9E47', '#58BABB', '#1079CB'];

interface Blob {
  x: number;
  y: number;
  drawX: number;
  drawY: number;
  r: number;
  extra: number;
  along: number;
  color: string;
}

interface Anchor {
  x: number;
  y: number;
  r: number;
}

export interface FieldOptions {
  anchor?: Anchor;
}

interface Field {
  blobs: Blob[];
  step(elapsed: number): void;
  breath(): { inner: number; outer: number };
}

export function createField(width: number, height: number, options: FieldOptions = {}, random = Math.random): Field {
  const { anchor = { x: width / 2, y: height / 2, r: 0 } } = options;
  const blobs: Blob[] = [];
  let sinceSpawn = 0;
  let clock = 0;
  let colorPhase = 0;

  const waves = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => ({
      rate: (Math.PI * 2) / (MOOD_PERIOD[0] + random() * (MOOD_PERIOD[1] - MOOD_PERIOD[0])),
      offset: random() * Math.PI * 2,
    }))
  );
  const mood = (k: number, at = clock) =>
    waves[k].reduce((sum, w) => sum + Math.sin(at * w.rate + w.offset), 0) / waves[k].length;
  const spinRate = (at: number) => (DRIFT / (BAND * RAINBOW.length)) * SPIN * mood(0, at);

  const HISTORY_STEP = 100;
  const history = [0];
  const phaseAgo = (age: number) => {
    const index = Math.max(0, Math.round(age / HISTORY_STEP));
    while (history.length <= index) {
      const at = -history.length * HISTORY_STEP;
      history.push(history[history.length - 1] - spinRate(at) * HISTORY_STEP);
    }
    return history[index];
  };

  const colorAt = (x: number, y: number, phase: number) => {
    const turn = Math.atan2(y - anchor.y, x - anchor.x) / (Math.PI * 2);
    const blur = ((random() - 0.5) * JITTER) / RAINBOW.length;
    const k = (((turn * ARMS + phase + blur) % 1) + 1) % 1;
    return RAINBOW[Math.floor(k * RAINBOW.length)];
  };

  const edgeReach = (ux: number, uy: number) => {
    const tx = ux > 0 ? (width - anchor.x) / ux : ux < 0 ? -anchor.x / ux : Infinity;
    const ty = uy > 0 ? (height - anchor.y) / uy : uy < 0 ? -anchor.y / uy : Infinity;
    return Math.min(tx, ty);
  };

  const smooth = (t: number) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  };

  const travelled = (b: Blob) => {
    const dx = b.x - anchor.x;
    const dy = b.y - anchor.y;
    const away = Math.hypot(dx, dy) || 0.01;
    return Math.min(1, Math.max(0, away / edgeReach(dx / away, dy / away)));
  };

  const target = (b: Blob, t: number) => SIZE + b.extra * t + EDGE_SWELL * smooth((t - SWELL_FROM) / (1 - SWELL_FROM));

  const rimShare = anchor.r / Math.max(1, Math.min(width, height) / 2);
  const along = (t: number) => Math.min(1, Math.max(0, (t - rimShare) / Math.max(0.01, 1 - rimShare)));

  const blob = (x: number, y: number, phase: number): Blob => ({
    x,
    y,
    drawX: x,
    drawY: y,
    r: 0,
    extra: EDGE_GROWTH[0] + random() * (EDGE_GROWTH[1] - EDGE_GROWTH[0]),
    along: 0,
    color: colorAt(x, y, phase),
  });

  const cell = 2 * (SIZE + EDGE_GROWTH[1] + EDGE_SWELL) + GAP;
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
        const clear = anchor.r + a.r + GAP;
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
              const reach = a.r + b.r + GAP;
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
  const count = Math.round((width * height) / (Math.PI * (typical + GAP / 2) ** 2));
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    blobs.push(blob(x, y, 0));
  }
  for (const b of blobs) {
    const t = travelled(b);
    b.r = target(b, t);
    b.along = along(t);
  }
  for (let round = 0; round < SEED_ROUNDS && settle(10) > 0.25; round++);
  for (const b of blobs) {
    const dx = b.x - anchor.x;
    const dy = b.y - anchor.y;
    const away = Math.hypot(dx, dy) || 0.01;
    const rim = anchor.r;
    b.color = colorAt(b.x, b.y, phaseAgo((away - rim) / DRIFT));
  }
  for (const b of blobs) {
    b.drawX = b.x;
    b.drawY = b.y;
  }

  return {
    blobs,
    step(elapsed) {
      sinceSpawn += elapsed;
      clock += elapsed;
      colorPhase += spinRate(clock) * elapsed;
      while (sinceSpawn >= SPAWN_EVERY) {
        sinceSpawn -= SPAWN_EVERY;
        for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
          const angle = random() * Math.PI * 2;
          const ux = Math.cos(angle);
          const uy = Math.sin(angle);
          const rim = anchor.r + GAP + 1;
          const x = anchor.x + ux * rim;
          const y = anchor.y + uy * rim;
          const crowded = blobs.some((b) => (b.x - x) ** 2 + (b.y - y) ** 2 < (Math.max(b.r, SIZE) + GAP * 0.75) ** 2);
          if (crowded) continue;
          blobs.push(blob(x, y, colorPhase));
          break;
        }
      }
      for (const b of blobs) {
        const t = travelled(b);
        b.r += (target(b, t) - b.r) * GROW;
        b.along = along(t);
      }
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
    breath: () => ({ inner: mood(1), outer: mood(2) }),
  };
}

export interface StartOptions {
  anchor?: () => Anchor;
}

export default function start(canvas: HTMLCanvasElement, options: StartOptions = {}): () => void {
  const context = canvas.getContext('2d');
  if (context === null) return () => {};
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    field = createField(width, height, { anchor: options.anchor?.() });
  };

  const draw = () => {
    const ratio = canvas.width / (width || 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    const { inner, outer } = field.breath();
    const center = options.anchor?.() ?? { x: width / 2, y: height / 2 };
    for (const blob of field.blobs) {
      const t = blob.along;
      const r = blob.r * (1 + INNER_BREATHE * inner * (1 - t) + OUTER_BREATHE * outer * t);
      const dx = blob.drawX - center.x;
      const dy = blob.drawY - center.y;
      const away = Math.hypot(dx, dy) || 1;
      const shift = (SHIFT * (inner - outer) * Math.sin(Math.PI * t)) / away;
      const x = blob.drawX + dx * shift;
      const y = blob.drawY + dy * shift;
      context.fillStyle = blob.color;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
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
