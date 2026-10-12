const COUNT = 600;
const SPEED = 0.6;

interface Particle {
  x: number;
  y: number;
  age: number;
}

export default function start(canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext('2d');
  if (context === null) return () => {};
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let frame = 0;
  let time = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
  };

  const spawn = (): Particle => ({ x: Math.random() * width, y: Math.random() * height, age: Math.random() * 200 });
  const particles = Array.from({ length: COUNT }, spawn);

  const angle = (x: number, y: number) =>
    Math.sin(x * 0.004 + time * 0.0003) * 2 + Math.cos(y * 0.005 - time * 0.0002) * 2;

  const step = () => {
    time += 16;
    context.fillStyle = 'rgb(0 0 0 / 0.04)';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgb(255 255 255 / 0.35)';
    context.lineWidth = 0.6;
    context.beginPath();
    for (const p of particles) {
      const a = angle(p.x, p.y);
      const nx = p.x + Math.cos(a) * SPEED;
      const ny = p.y + Math.sin(a) * SPEED;
      context.moveTo(p.x, p.y);
      context.lineTo(nx, ny);
      p.x = nx;
      p.y = ny;
      p.age += 1;
      if (p.age > 400 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) Object.assign(p, spawn(), { age: 0 });
    }
    context.stroke();
  };

  const loop = () => {
    step();
    frame = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', resize);
  if (still) for (let i = 0; i < 240; i++) step();
  else frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
  };
}
