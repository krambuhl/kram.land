const EXPONENT = 2 ** 1.35;
const SPAWN_EVERY = 140;
const GROW = 0.08;
const GAP = 4;
const REACH = 2 ** (0.5 - 1 / EXPONENT);
const RELAX = 4;
const SMOOTH = 0.5;
const MIN_SIZE = 18;
const MAX_SIZE = 44;

interface Blob {
  x: number;
  y: number;
  drawX: number;
  drawY: number;
  r: number;
  size: number;
  grey: number;
}

interface Field {
  blobs: Blob[];
  step(elapsed: number): void;
}

export function createField(width: number, height: number, scale: number, random = Math.random): Field {
  const unit = Math.max(0.6, scale);
  const blobs: Blob[] = [];
  let sinceSpawn = 0;

  const blob = (x: number, y: number, grown: boolean): Blob => {
    const size = (MIN_SIZE + random() * (MAX_SIZE - MIN_SIZE)) * unit;
    return { x, y, drawX: x, drawY: y, r: grown ? size : 0, size, grey: 22 + random() * 30 };
  };

  const settle = () => {
    const cell = 2 * MAX_SIZE * unit * REACH + GAP;
    const grid = new Map<string, Blob[]>();
    for (const b of blobs) {
      const key = `${Math.floor(b.x / cell)},${Math.floor(b.y / cell)}`;
      const bucket = grid.get(key);
      if (bucket) bucket.push(b);
      else grid.set(key, [b]);
    }
    for (const a of blobs) {
      const cx = Math.floor(a.x / cell);
      const cy = Math.floor(a.y / cell);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (const b of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
            if (b === a) continue;
            const ox = b.x - a.x;
            const oy = b.y - a.y;
            const distance = Math.hypot(ox, oy) || 0.01;
            const overlap = (a.r + b.r) * REACH + GAP - distance;
            if (overlap <= 0) continue;
            const push = overlap / 2 / distance;
            a.x -= ox * push;
            a.y -= oy * push;
            b.x += ox * push;
            b.y += oy * push;
          }
        }
      }
    }
  };

  const count = Math.round((width * height) / (Math.PI * (34 * unit) ** 2));
  for (let i = 0; i < count; i++) blobs.push(blob(random() * width, random() * height, true));
  for (let i = 0; i < 60; i++) settle();
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
        const angle = random() * Math.PI * 2;
        blobs.push(blob(width / 2 + Math.cos(angle), height / 2 + Math.sin(angle), false));
      }
      for (const b of blobs) b.r += (b.size - b.r) * GROW;
      for (let i = 0; i < RELAX; i++) settle();
      for (const b of blobs) {
        b.drawX += (b.x - b.drawX) * SMOOTH;
        b.drawY += (b.y - b.drawY) * SMOOTH;
      }
      const reach = Math.hypot(width, height) / 2 + 60;
      for (let i = blobs.length - 1; i >= 0; i--) {
        if (Math.hypot(blobs[i].x - width / 2, blobs[i].y - height / 2) > reach) blobs.splice(i, 1);
      }
    },
  };
}

function unitShape(): Path2D {
  const path = new Path2D();
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = Math.sign(c) * Math.abs(c) ** (2 / EXPONENT);
    const y = Math.sign(s) * Math.abs(s) ** (2 / EXPONENT);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
}

export default function start(canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext('2d');
  if (context === null) return () => {};
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shape = unitShape();
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
    field = createField(width, height, Math.min(width, height) / 900);
  };

  const draw = () => {
    const ratio = canvas.width / (width || 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    for (const blob of field.blobs) {
      context.setTransform(ratio * blob.r, 0, 0, ratio * blob.r, ratio * blob.drawX, ratio * blob.drawY);
      context.fillStyle = `hsl(0 0% ${blob.grey}%)`;
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
