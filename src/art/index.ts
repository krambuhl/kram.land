const SPAWN_EVERY = 1;
const SPAWN_ATTEMPTS = 32;
// newborns need room for SPAWN_ROOM of their size and gap: less squeezes the inner
// ring, more starves the outward push that keeps the field moving.
const SPAWN_ROOM = 0.5;
const SEED_ROUNDS = 6;
// circles can't tile the plane, so seeding a full area's worth overfills the screen.
const SEED_FILL = 0.9;
const GROW = 0.08;
// the gap between neighbours scales with their size, from GAP_MIN px at radius
// GAP_FROM to GAP_MAX px at radius GAP_TO, so it reads the same at every size.
const GAP_MIN = 3.5;
const GAP_MAX = 4;
const GAP_FROM = 5;
const GAP_TO = 22;
const RELAX = 6;
const SMOOTH = 0.5;
const SIZE = 7;
const MOOD_PERIOD = [12000, 28000];
const SPIN = 3;
const INNER_BREATHE = 0.12;
const OUTER_BREATHE = 0.15;
const SHIFT = 16;
const BAND = 50;
const DRIFT = 0.025;
const ARM_COUNTS = [1, 2, 3, 5];
const ARM_HOLD = 40000;
const ARM_BLEND = 8000;
const JITTER = 3;
const EDGE_GROWTH = [2, 4];
const EDGE_SWELL = 3;
const SWELL_FROM = 0.85;
// blobs start at RAMP_START of their size on the portrait's rim and grow
// linearly to full size over RAMP_SHARE of the screen width, at least RAMP_MIN px.
const RAMP_START = 0.75;
const RAMP_SHARE = 0.25;
const RAMP_MIN = 100;
const FLOOR_SWELL = 0.4;
const FLOOR_BREATHE = 0.2;
const CORNER_SWELL = 0.25;
const CORNER_BREATHE = 0.5;
const CORNER_REACH = 0.3;
// the outer band orbits the portrait one way per field at up to ORBIT px/ms and the
// inner field the other way at ORBIT_INNER of that. a mood eases the speed between ORBIT_CALM and full.
const ORBIT = 0.026;
const ORBIT_CALM = 0.3;
const ORBIT_INNER = 0.1;
const ORBIT_FROM = 0.5;
// the orbit carries blobs away from the edges they flow in from, so each step tries
// a few points just inside the margin's outer edge and adds a blob wherever one fits.
const EDGE_ATTEMPTS = 24;
// the field runs MARGIN px past every screen edge, so refills spawn and culls happen
// out of sight.
const MARGIN = 48;
const RAINBOW = ['#5A4D9A', '#A067C3', '#CD361F', '#F07C31', '#E9AC38', '#5B9E47', '#58BABB', '#1079CB'];

interface Blob {
  x: number;
  y: number;
  drawX: number;
  drawY: number;
  r: number;
  extra: number;
  along: number;
  low: number;
  corner: number;
  color: string;
}

interface Anchor {
  x: number;
  y: number;
  r: number;
}

export interface FieldOptions {
  anchor?: Anchor;
  // blobs below this height grow up to 40% and breathe up to 20% more toward the bottom.
  floor?: number;
}

interface Field {
  blobs: Blob[];
  step(elapsed: number): void;
  // takes new bounds, anchor and floor without restarting: blobs keep their places and
  // colours, new area fills in, and the next steps reflow around a moved anchor.
  reshape(width: number, height: number, options?: FieldOptions): void;
  breath(): { inner: number; outer: number };
}

export function createField(width: number, height: number, options: FieldOptions = {}, random = Math.random): Field {
  let { anchor = { x: width / 2, y: height / 2, r: 0 }, floor = height } = options;
  const blobs: Blob[] = [];
  let sinceSpawn = 0;
  let clock = 0;
  let colorPhase = 0;

  const waves = Array.from({ length: 4 }, () =>
    Array.from({ length: 3 }, () => ({
      rate: (Math.PI * 2) / (MOOD_PERIOD[0] + random() * (MOOD_PERIOD[1] - MOOD_PERIOD[0])),
      offset: random() * Math.PI * 2,
    }))
  );
  const orbitWay = random() < 0.5 ? -1 : 1;
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

  // the arm count steps through ARM_COUNTS, and newborns dither between
  // the old and new count over ARM_BLEND so the change ripples out softly.
  const armsOrigin = random() * ARM_HOLD * ARM_COUNTS.length;
  const armsAt = (at: number) => {
    const t = at + armsOrigin;
    const stage = Math.floor(t / ARM_HOLD);
    const into = t - stage * ARM_HOLD;
    const pick = (n: number) => ARM_COUNTS[((n % ARM_COUNTS.length) + ARM_COUNTS.length) % ARM_COUNTS.length];
    return random() < smooth((into - (ARM_HOLD - ARM_BLEND)) / ARM_BLEND) ? pick(stage + 1) : pick(stage);
  };

  const colorAt = (x: number, y: number, phase: number, arms: number) => {
    const turn = Math.atan2(y - anchor.y, x - anchor.x) / (Math.PI * 2);
    const blur = ((random() - 0.5) * JITTER) / RAINBOW.length;
    const k = (((turn * arms + phase + blur) % 1) + 1) % 1;
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

  const low = (b: Blob) => (floor < height ? smooth((b.y - floor) / (height - floor)) : 0);
  // distance from a top corner over which blobs swell: CORNER_REACH of the short side, at least 160px.
  let cornerReach = Math.max(160, CORNER_REACH * Math.min(width, height));
  const corner = (b: Blob) => smooth(1 - Math.min(Math.hypot(b.x, b.y), Math.hypot(width - b.x, b.y)) / cornerReach);
  let rampLength = Math.max(RAMP_MIN, RAMP_SHARE * width);
  const rampAt = (x: number, y: number) => {
    const off = Math.hypot(x - anchor.x, y - anchor.y) - anchor.r;
    return RAMP_START + (1 - RAMP_START) * Math.min(1, Math.max(0, off / rampLength));
  };
  const ramp = (b: Blob) => rampAt(b.x, b.y);
  const newborn = SIZE * RAMP_START;
  const target = (b: Blob, t: number) =>
    ramp(b) *
    (SIZE + b.extra * t + EDGE_SWELL * smooth((t - SWELL_FROM) / (1 - SWELL_FROM))) *
    (1 + Math.max(FLOOR_SWELL * b.low, CORNER_SWELL * b.corner));

  // the breath is part of each blob's physical size, so neighbours make room for it.
  let inner = mood(1);
  let outer = mood(2);
  const breathe = (b: Blob) =>
    1 +
    INNER_BREATHE * inner * (1 - b.along) +
    OUTER_BREATHE * (1 + FLOOR_BREATHE * b.low + CORNER_BREATHE * b.corner) * outer * b.along;

  let rimShare = anchor.r / Math.max(1, Math.min(width, height) / 2);
  const along = (t: number) => Math.min(1, Math.max(0, (t - rimShare) / Math.max(0.01, 1 - rimShare)));

  const blob = (x: number, y: number, phase: number, arms: number): Blob => ({
    x,
    y,
    drawX: x,
    drawY: y,
    r: 0,
    extra: EDGE_GROWTH[0] + random() * (EDGE_GROWTH[1] - EDGE_GROWTH[0]),
    along: 0,
    low: 0,
    corner: 0,
    color: colorAt(x, y, phase, arms),
  });

  const gapFor = (r: number) =>
    GAP_MIN + (GAP_MAX - GAP_MIN) * Math.min(1, Math.max(0, (r - GAP_FROM) / (GAP_TO - GAP_FROM)));

  // the collision grid is stored as linked lists in typed arrays: head[cell] is the
  // first blob in a cell, next[i] the one after blob i.
  let head = new Int32Array(0);
  let next = new Int32Array(0);
  // a pair's reach is the sum of each blob's extent: its r plus half its gap.
  let extent = new Float64Array(0);
  const settle = (passes: number): number => {
    let moved = 0;
    // cells fit an average blob; each blob searches as many cells out as its reach needs.
    if (extent.length < blobs.length) extent = new Float64Array(blobs.length * 2);
    let widest = 0;
    let total = 0;
    for (let i = 0; i < blobs.length; i++) {
      extent[i] = blobs[i].r + gapFor(blobs[i].r) / 2;
      widest = Math.max(widest, extent[i]);
      total += extent[i];
    }
    const cell = Math.max(1, (2 * total) / Math.max(1, blobs.length));
    const columns = Math.ceil((width + 2 * MARGIN) / cell) + 2;
    const rows = Math.ceil((height + 2 * MARGIN) / cell) + 2;
    const cellOf = (x: number, y: number) => {
      const cx = Math.min(columns - 1, Math.max(0, Math.floor((x + MARGIN) / cell) + 1));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor((y + MARGIN) / cell) + 1));
      return cy * columns + cx;
    };
    if (head.length < columns * rows) head = new Int32Array(columns * rows);
    if (next.length < blobs.length) next = new Int32Array(blobs.length * 2);
    head.fill(-1, 0, columns * rows);
    for (let i = 0; i < blobs.length; i++) {
      const c = cellOf(blobs[i].x, blobs[i].y);
      next[i] = head[c];
      head[c] = i;
    }
    for (let pass = 0; pass < passes; pass++) {
      for (let i = 0; i < blobs.length; i++) {
        const a = blobs[i];
        const ax = a.x - anchor.x;
        const ay = a.y - anchor.y;
        const away = Math.hypot(ax, ay) || 0.01;
        const clear = anchor.r + a.r + gapFor(a.r);
        if (away < clear) {
          a.x = anchor.x + (ax / away) * clear;
          a.y = anchor.y + (ay / away) * clear;
        }
        const home = cellOf(a.x, a.y);
        const hx = home % columns;
        const hy = (home - hx) / columns;
        const span = Math.ceil((extent[i] + widest) / cell);
        for (let cy = Math.max(0, hy - span); cy <= Math.min(rows - 1, hy + span); cy++) {
          for (let cx = Math.max(0, hx - span); cx <= Math.min(columns - 1, hx + span); cx++) {
            for (let j = head[cy * columns + cx]; j !== -1; j = next[j]) {
              const b = blobs[j];
              if (b === a) continue;
              const ox = b.x - a.x;
              const oy = b.y - a.y;
              const reach = extent[i] + extent[j];
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

  // adds a blob at (x, y) if it fits among `near` with its full gap, coloured as a blob
  // born on the rim would be by the time it drifted this far out.
  const place = (x: number, y: number, near: Blob[]): Blob | undefined => {
    const b = blob(x, y, 0, 0);
    const t = travelled(b);
    b.low = low(b);
    b.corner = corner(b);
    b.along = along(t);
    b.r = target(b, t) * breathe(b);
    if (near.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < (o.r + b.r + gapFor((o.r + b.r) / 2)) ** 2))
      return undefined;
    const age = (Math.hypot(x - anchor.x, y - anchor.y) - anchor.r) / DRIFT;
    b.color = colorAt(x, y, colorPhase - spinRate(clock) * age, armsAt(clock - age));
    blobs.push(b);
    near.push(b);
    return b;
  };

  const typical = SIZE + (EDGE_GROWTH[0] + EDGE_GROWTH[1]) / 4;
  const count = Math.round(
    (SEED_FILL * (width + 2 * MARGIN) * (height + 2 * MARGIN)) / (Math.PI * (typical + gapFor(typical) / 2) ** 2)
  );
  // smaller blobs near the rim need proportionally more of them to cover the same area.
  for (let i = 0; i < count / RAMP_START ** 2; i++) {
    const x = random() * (width + 2 * MARGIN) - MARGIN;
    const y = random() * (height + 2 * MARGIN) - MARGIN;
    if (random() < (RAMP_START / rampAt(x, y)) ** 2) blobs.push(blob(x, y, 0, 0));
  }
  for (const b of blobs) {
    const t = travelled(b);
    b.low = low(b);
    b.corner = corner(b);
    b.along = along(t);
    b.r = target(b, t) * breathe(b);
  }
  for (let round = 0; round < SEED_ROUNDS && settle(10) > 0.25; round++);
  for (const b of blobs) {
    const dx = b.x - anchor.x;
    const dy = b.y - anchor.y;
    const away = Math.hypot(dx, dy) || 0.01;
    const rim = anchor.r;
    const age = (away - rim) / DRIFT;
    b.color = colorAt(b.x, b.y, phaseAgo(age), armsAt(-age));
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
      inner = mood(1);
      outer = mood(2);
      // spawn checks only look at blobs near the rim, the only ones a newborn can touch.
      const rimBand = anchor.r + 80;
      const nearRim = blobs.filter((b) => (b.x - anchor.x) ** 2 + (b.y - anchor.y) ** 2 < rimBand * rimBand);
      while (sinceSpawn >= SPAWN_EVERY) {
        sinceSpawn -= SPAWN_EVERY;
        for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
          const angle = random() * Math.PI * 2;
          const ux = Math.cos(angle);
          const uy = Math.sin(angle);
          const rim = anchor.r + gapFor(newborn) + 1;
          const x = anchor.x + ux * rim;
          const y = anchor.y + uy * rim;
          const crowded = nearRim.some(
            (b) => (b.x - x) ** 2 + (b.y - y) ** 2 < (b.r + SPAWN_ROOM * (newborn + gapFor(newborn))) ** 2
          );
          if (crowded) continue;
          const born = blob(x, y, colorPhase, armsAt(clock));
          blobs.push(born);
          nearRim.push(born);
          break;
        }
      }
      for (const b of blobs) {
        const t = travelled(b);
        b.low = low(b);
        b.corner = corner(b);
        b.along = along(t);
        b.r += (target(b, t) * breathe(b) - b.r) * GROW;
      }
      const turn = orbitWay * ORBIT * (ORBIT_CALM + (1 - ORBIT_CALM) * (0.5 + 0.5 * mood(3))) * elapsed;
      for (const b of blobs) {
        const dx = b.x - anchor.x;
        const dy = b.y - anchor.y;
        const away = Math.hypot(dx, dy) || 0.01;
        const speed = turn * (-ORBIT_INNER + (1 + ORBIT_INNER) * smooth((b.along - ORBIT_FROM) / (1 - ORBIT_FROM)));
        b.x -= (dy / away) * speed;
        b.y += (dx / away) * speed;
      }
      settle(RELAX);
      // refill checks only look at the blobs near the margin's edge.
      const edgeBand = 80;
      const nearEdge = blobs.filter(
        (b) =>
          b.x < edgeBand - MARGIN ||
          b.y < edgeBand - MARGIN ||
          b.x > width + MARGIN - edgeBand ||
          b.y > height + MARGIN - edgeBand
      );
      for (let attempt = 0; attempt < EDGE_ATTEMPTS; attempt++) {
        const w = width + 2 * MARGIN;
        const h = height + 2 * MARGIN;
        const around = random() * 2 * (w + h);
        const inset = SIZE - MARGIN;
        const x =
          around < w
            ? around - MARGIN
            : around < w + h
              ? width + MARGIN - SIZE
              : around < 2 * w + h
                ? around - w - h - MARGIN
                : inset;
        const y =
          around < w
            ? inset
            : around < w + h
              ? around - w - MARGIN
              : around < 2 * w + h
                ? height + MARGIN - SIZE
                : around - 2 * w - h - MARGIN;
        place(x, y, nearEdge);
      }
      for (const b of blobs) {
        b.drawX += (b.x - b.drawX) * SMOOTH;
        b.drawY += (b.y - b.drawY) * SMOOTH;
      }
      for (let i = blobs.length - 1; i >= 0; i--) {
        const { x, y } = blobs[i];
        const out = MARGIN + 60;
        if (x < -out || y < -out || x > width + out || y > height + out) blobs.splice(i, 1);
      }
    },
    reshape(nextWidth, nextHeight, changes = {}) {
      const before = { width, height };
      width = nextWidth;
      height = nextHeight;
      anchor = changes.anchor ?? anchor;
      floor = changes.floor ?? height;
      cornerReach = Math.max(160, CORNER_REACH * Math.min(width, height));
      rampLength = Math.max(RAMP_MIN, RAMP_SHARE * width);
      rimShare = anchor.r / Math.max(1, Math.min(width, height) / 2);
      const grown =
        (width + 2 * MARGIN) * (height + 2 * MARGIN) - (before.width + 2 * MARGIN) * (before.height + 2 * MARGIN);
      if (grown <= 0) return;
      const attempts = Math.ceil((4 * grown) / (Math.PI * (typical + gapFor(typical)) ** 2));
      const near = [...blobs];
      for (let attempt = 0; attempt < attempts; attempt++) {
        const x = random() * (width + 2 * MARGIN) - MARGIN;
        const y = random() * (height + 2 * MARGIN) - MARGIN;
        if (x < before.width + MARGIN && y < before.height + MARGIN) continue;
        place(x, y, near);
      }
    },
    breath: () => ({ inner, outer }),
  };
}

export interface StartOptions {
  anchor?: () => Anchor;
  floor?: () => number;
}

export default function start(canvas: HTMLCanvasElement, options: StartOptions = {}): () => void {
  const context = canvas.getContext('2d');
  if (context === null) return () => {};
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let field: Field | undefined;
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;

  let anchor = options.anchor?.();
  let floor = options.floor?.();

  // a resize reshapes the running field instead of restarting it, and a resize that
  // leaves the canvas size unchanged does nothing.
  const resize = () => {
    // cap at 2x: each step above that multiplies the pixels filled per frame.
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (nextWidth === width && nextHeight === height && canvas.width === Math.round(width * ratio)) return;
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    anchor = options.anchor?.();
    floor = options.floor?.();
    if (field === undefined) field = createField(width, height, { anchor, floor });
    else field.reshape(width, height, { anchor, floor });
  };

  // the portrait can move after the field starts, so the hole follows its measured spot.
  const follow = () => {
    const nextAnchor = options.anchor?.();
    const nextFloor = options.floor?.();
    if (nextAnchor === anchor && nextFloor === floor) return;
    anchor = nextAnchor;
    floor = nextFloor;
    field?.reshape(width, height, { anchor, floor });
  };

  const draw = () => {
    if (field === undefined) return;
    const ratio = canvas.width / (width || 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    const { inner, outer } = field.breath();
    const center = options.anchor?.() ?? { x: width / 2, y: height / 2 };
    // one path and one fill per colour instead of a fill per blob.
    for (const color of RAINBOW) {
      context.fillStyle = color;
      context.beginPath();
      for (const blob of field.blobs) {
        if (blob.color !== color) continue;
        const t = blob.along;
        const dx = blob.drawX - center.x;
        const dy = blob.drawY - center.y;
        const away = Math.hypot(dx, dy) || 1;
        const shift = (SHIFT * (inner - outer) * Math.sin(Math.PI * t)) / away;
        const x = blob.drawX + dx * shift;
        const y = blob.drawY + dy * shift;
        context.moveTo(x + blob.r, y);
        context.arc(x, y, blob.r, 0, Math.PI * 2);
      }
      context.fill();
    }
  };

  const loop = (now: number) => {
    follow();
    field?.step(Math.min(64, last === 0 ? 16 : now - last));
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
