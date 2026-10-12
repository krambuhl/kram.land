const EXPONENT = 2 ** 1.35;
const SPAWN_EVERY = 140;
const GROW = 0.08;
const GAP = 4;
const REACH = 2 ** (0.5 - 1 / EXPONENT);
const RELAX = 4;

interface Blob {
  x: number;
  y: number;
  r: number;
  size: number;
  grey: number;
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
  const blobs: Blob[] = [];
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let last = 0;
  let sinceSpawn = SPAWN_EVERY;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    scale = Math.min(width, height) / 900;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  };

  const spawn = () => {
    const angle = Math.random() * Math.PI * 2;
    blobs.push({
      x: width / 2 + Math.cos(angle),
      y: height / 2 + Math.sin(angle),
      r: 0,
      size: (18 + Math.random() * 26) * Math.max(0.6, scale),
      grey: 22 + Math.random() * 30,
    });
  };

  const relax = () => {
    const cell = 64 * Math.max(0.6, scale);
    const grid = new Map<string, Blob[]>();
    for (const blob of blobs) {
      const key = `${Math.floor(blob.x / cell)},${Math.floor(blob.y / cell)}`;
      const bucket = grid.get(key);
      if (bucket) bucket.push(blob);
      else grid.set(key, [blob]);
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

  const step = (elapsed: number) => {
    sinceSpawn += elapsed;
    while (sinceSpawn >= SPAWN_EVERY) {
      sinceSpawn -= SPAWN_EVERY;
      spawn();
    }
    for (const blob of blobs) blob.r += (blob.size - blob.r) * GROW;
    for (let i = 0; i < RELAX; i++) relax();
    const reach = Math.hypot(width, height) / 2 + 60;
    for (let i = blobs.length - 1; i >= 0; i--) {
      const blob = blobs[i];
      if (Math.hypot(blob.x - width / 2, blob.y - height / 2) > reach) blobs.splice(i, 1);
    }
  };

  const draw = () => {
    const ratio = canvas.width / (width || 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    for (const blob of blobs) {
      context.setTransform(ratio * blob.r, 0, 0, ratio * blob.r, ratio * blob.x, ratio * blob.y);
      context.fillStyle = `hsl(0 0% ${blob.grey}%)`;
      context.fill(shape);
    }
  };

  const loop = (now: number) => {
    step(Math.min(64, last === 0 ? 16 : now - last));
    last = now;
    draw();
    frame = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', resize);
  if (still) {
    const count = Math.round((width * height) / (Math.PI * (34 * Math.max(0.6, scale)) ** 2));
    for (let i = 0; i < count; i++) {
      spawn();
      const blob = blobs[blobs.length - 1];
      blob.x = Math.random() * width;
      blob.y = Math.random() * height;
      blob.r = blob.size;
    }
    for (let i = 0; i < 40; i++) relax();
    draw();
  } else {
    frame = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
  };
}
