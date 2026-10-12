import styles from './styles.module.css';

const OPEN_AT = 0.5;
const ART_DELAY = 500;
const ART_FADE = 200;
const DEAD_ZONE = 0.25;

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

  let open = false;
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

  const render = (next: boolean) => {
    open = next;
    root.setAttribute('data-settling', '');
    root.toggleAttribute('data-open', next);
    root.style.setProperty('--secret', open ? '1' : '0');
    text.inert = open;
    image.setAttribute('aria-pressed', String(open));
    if (open) showArt();
    else hideArt();
  };

  const measure = () => {
    stage.style.setProperty('--stage-top', `${Math.min(0, window.innerHeight - stage.offsetHeight)}px`);
    runway = track.offsetHeight - stage.offsetHeight;

    const rect = image.getBoundingClientRect();
    const shift = open ? Number.parseFloat(root.style.getPropertyValue('--secret-shift')) || 0 : 0;
    root.style.setProperty('--secret-shift', `${window.innerHeight / 2 - (rect.top + rect.height / 2 - shift)}px`);
    root.style.setProperty('--secret-radius', `${rect.width / 2}px`);
  };

  const openAt = () => document.documentElement.scrollHeight - window.innerHeight - runway * (1 - OPEN_AT);

  const onScroll = () => {
    const next = nextOpen(window.scrollY, openAt(), runway * DEAD_ZONE, open);
    if (next === open) return;
    if (next) measure();
    render(next);
  };

  const onClick = () => {
    if (!open) returnY = window.scrollY;
    const top = open ? Math.min(returnY, openAt() - runway * DEAD_ZONE - 1) : document.documentElement.scrollHeight;
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
