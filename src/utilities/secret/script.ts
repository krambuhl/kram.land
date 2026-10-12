const NUDGE = 30;
const IDLE = 150;
const OPEN_KEYS = new Set(['ArrowDown', 'PageDown', ' ', 'End']);
const CLOSE_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

export function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function scrollProgress(scrollY: number, maxScroll: number, runway: number): number {
  return runway <= 0 ? 0 : clampProgress((scrollY - (maxScroll - runway)) / runway);
}

export function secretScroll(root: HTMLElement, image: HTMLElement, text: HTMLElement): () => void {
  let progress = 0;
  let scrolls = false;
  let runway = 0;
  let nudge = 0;
  let locked = false;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let touchY: number | null = null;
  let returnY = 0;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  const render = (next: number, settling: boolean) => {
    progress = next;
    root.toggleAttribute('data-settling', settling);
    root.style.setProperty('--secret', String(progress));
    text.inert = progress === 1;
    image.setAttribute('aria-pressed', String(progress >= 0.5));
  };

  const measure = () => {
    root.removeAttribute('data-secret-runway');
    const content = document.documentElement.scrollHeight;
    scrolls = content > window.innerHeight + 1;
    root.toggleAttribute('data-secret-runway', scrolls);
    runway = document.documentElement.scrollHeight - content;

    const rect = image.getBoundingClientRect();
    const shift = Number.parseFloat(root.style.getPropertyValue('--secret-shift')) || 0;
    const center = rect.top + rect.height / 2 + window.scrollY - progress * shift;
    const end = scrolls ? center - maxScroll() : center;
    root.style.setProperty('--secret-shift', `${window.innerHeight / 2 - end}px`);
    if (scrolls) render(scrollProgress(window.scrollY, maxScroll(), runway), false);
  };

  const toggle = (open: boolean) => {
    if (!scrolls) {
      render(open ? 1 : 0, true);
      return;
    }
    if (open) returnY = window.scrollY;
    window.scrollTo({ top: open ? maxScroll() : Math.min(returnY, maxScroll() - runway), behavior: 'smooth' });
  };

  const flick = (delta: number) => {
    clearTimeout(idle);
    idle = setTimeout(() => {
      nudge = 0;
      locked = false;
    }, IDLE);
    if (locked) return;
    nudge = Math.sign(delta) === Math.sign(nudge) ? nudge + delta : delta;
    if (Math.abs(nudge) < NUDGE) return;
    locked = true;
    toggle(nudge > 0);
  };

  const onWheel = (event: WheelEvent) => {
    if (scrolls) return;
    event.preventDefault();
    flick(event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0].clientY;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (scrolls || touchY === null) return;
    event.preventDefault();
    const y = event.touches[0].clientY;
    flick(touchY - y);
    touchY = y;
  };

  const onTouchEnd = () => {
    touchY = null;
  };

  const onScroll = () => {
    if (scrolls) render(scrollProgress(window.scrollY, maxScroll(), runway), false);
  };

  const onKey = (event: KeyboardEvent) => {
    if (scrolls || event.target !== document.body) return;
    if (OPEN_KEYS.has(event.key)) toggle(true);
    else if (CLOSE_KEYS.has(event.key)) toggle(false);
    else return;
    event.preventDefault();
  };

  const onClick = () => toggle(progress < 0.5);

  measure();
  image.addEventListener('click', onClick);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', measure);
  return () => {
    image.removeEventListener('click', onClick);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', measure);
  };
}
