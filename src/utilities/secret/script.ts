import styles from './styles.module.css';

const OPEN_AT = 0.5;
const ART_DELAY = 500;
const ART_FADE = 200;
const DEAD_ZONE = 0.25;

export function scrubProgress(scrollY: number, bottom: number, runway: number): number {
  return runway <= 0 ? 0 : Math.min(1, Math.max(0, (scrollY - (bottom - runway)) / runway));
}

export function nextOpen(scrollY: number, openAt: number, deadZone: number, open: boolean): boolean {
  return open ? scrollY > openAt - deadZone : scrollY > openAt;
}

export function secretScroll(
  root: HTMLElement,
  image: HTMLElement,
  text: HTMLElement,
  canvas: HTMLCanvasElement
): () => void {
  const stage = root.parentElement;
  const track = stage?.parentElement;
  if (!stage || !track) return () => {};

  const coarse = window.matchMedia('(pointer: coarse)');
  let open = false;
  let progress = 0;
  let runway = 0;
  let returnY = 0;
  let stopArt: (() => void) | undefined;
  let artTimer: ReturnType<typeof setTimeout> | undefined;

  const showArt = () => {
    clearTimeout(artTimer);
    artTimer = setTimeout(async () => {
      const { default: start } = await import('../../art/index.ts');
      if (!open) return;
      stopArt ??= start(canvas);
      root.setAttribute('data-art', '');
    }, ART_DELAY);
  };

  const hideArt = () => {
    clearTimeout(artTimer);
    root.removeAttribute('data-art');
    artTimer = setTimeout(() => {
      stopArt?.();
      stopArt = undefined;
    }, ART_FADE);
  };

  const render = (next: number, settling: boolean) => {
    progress = next;
    root.toggleAttribute('data-settling', settling);
    root.style.setProperty('--secret', String(progress));
    const nowOpen = progress >= 0.98;
    if (nowOpen === open) return;
    open = nowOpen;
    root.toggleAttribute('data-open', open);
    text.inert = open;
    image.setAttribute('aria-pressed', String(open));
    if (open) showArt();
    else hideArt();
  };

  const measure = () => {
    stage.style.setProperty('--stage-top', `${Math.min(0, window.innerHeight - stage.offsetHeight)}px`);
    runway = track.offsetHeight - stage.offsetHeight;

    const rect = image.getBoundingClientRect();
    const shift = progress * (Number.parseFloat(root.style.getPropertyValue('--secret-shift')) || 0);
    root.style.setProperty('--secret-shift', `${window.innerHeight / 2 - (rect.top + rect.height / 2 - shift)}px`);
  };

  const bottom = () => document.documentElement.scrollHeight - window.innerHeight;
  const openAt = () => bottom() - runway * (1 - OPEN_AT);

  const onScroll = () => {
    if (coarse.matches) {
      const next = scrubProgress(window.scrollY, bottom(), runway);
      if (progress === 0 && next > 0) measure();
      render(next, false);
      return;
    }
    const next = nextOpen(window.scrollY, openAt(), runway * DEAD_ZONE, open);
    if (next === open) return;
    if (next) measure();
    render(next ? 1 : 0, true);
  };

  const onClick = () => {
    if (!open) returnY = window.scrollY;
    const close = coarse.matches ? bottom() - runway : openAt() - runway * DEAD_ZONE - 1;
    const top = open ? Math.min(returnY, close) : document.documentElement.scrollHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  stage.classList.add(styles.stage);
  track.classList.add(styles.track);
  measure();
  onScroll();
  image.addEventListener('click', onClick);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.visualViewport?.addEventListener('resize', measure);
  return () => {
    hideArt();
    image.removeEventListener('click', onClick);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    window.visualViewport?.removeEventListener('resize', measure);
  };
}
