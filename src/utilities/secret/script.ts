const RANGE = 240;
const IDLE = 150;
const DOWN_KEYS = new Set(['ArrowDown', 'PageDown', ' ', 'End']);
const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

export function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function settleTarget(progress: number): 0 | 1 {
  return progress >= 0.5 ? 1 : 0;
}

export function secretScroll(root: HTMLElement, image: HTMLElement, text: HTMLElement): () => void {
  let progress = 0;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let touchStart: { y: number; progress: number } | null = null;

  const fits = () => document.documentElement.scrollHeight <= window.innerHeight + 1;

  const measure = () => {
    const rect = image.getBoundingClientRect();
    const shift = Number.parseFloat(root.style.getPropertyValue('--secret-shift')) || 0;
    const center = rect.top + rect.height / 2 - progress * shift;
    root.style.setProperty('--secret-shift', `${window.innerHeight / 2 - center}px`);
  };

  const render = (next: number, settling: boolean) => {
    progress = next;
    root.toggleAttribute('data-settling', settling);
    root.style.setProperty('--secret', String(progress));
    text.inert = progress === 1;
  };

  const settle = () => render(settleTarget(progress), true);

  const scrub = (delta: number) => {
    render(clampProgress(progress + delta / RANGE), false);
    clearTimeout(idle);
    idle = setTimeout(settle, IDLE);
  };

  const onWheel = (event: WheelEvent) => {
    if (!fits()) return;
    event.preventDefault();
    scrub(event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStart = { y: event.touches[0].clientY, progress };
  };

  const onTouchMove = (event: TouchEvent) => {
    if (touchStart === null || !fits()) return;
    event.preventDefault();
    render(clampProgress(touchStart.progress + (touchStart.y - event.touches[0].clientY) / RANGE), false);
  };

  const onTouchEnd = () => {
    if (touchStart === null) return;
    touchStart = null;
    settle();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (DOWN_KEYS.has(event.key)) render(1, true);
    else if (UP_KEYS.has(event.key)) render(0, true);
    else return;
    event.preventDefault();
  };

  measure();
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', measure);
  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', measure);
  };
}
