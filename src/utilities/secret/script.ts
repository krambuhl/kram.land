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

export function engages(progress: number, delta: number, atEnd: boolean): boolean {
  return progress > 0 || (delta > 0 && atEnd);
}

export function secretScroll(root: HTMLElement, image: HTMLElement, text: HTMLElement): () => void {
  let progress = 0;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let touchY: number | null = null;

  const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;

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

  const engage = (delta: number): boolean => {
    if (!engages(progress, delta, atEnd())) return false;
    if (progress === 0) measure();
    return true;
  };

  const scrub = (delta: number, settleLater: boolean) => {
    render(clampProgress(progress + delta / RANGE), false);
    clearTimeout(idle);
    if (settleLater) idle = setTimeout(settle, IDLE);
  };

  const onWheel = (event: WheelEvent) => {
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    if (!engage(delta)) return;
    event.preventDefault();
    scrub(delta, true);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0].clientY;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (touchY === null) return;
    const y = event.touches[0].clientY;
    const delta = touchY - y;
    touchY = y;
    if (!engage(delta)) return;
    event.preventDefault();
    scrub(delta, false);
  };

  const onTouchEnd = () => {
    touchY = null;
    if (progress > 0 && progress < 1) settle();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (DOWN_KEYS.has(event.key) && engage(1)) render(1, true);
    else if (UP_KEYS.has(event.key) && progress > 0) render(0, true);
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
