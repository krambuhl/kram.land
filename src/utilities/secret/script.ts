import styles from './styles.module.css';

const OPEN_AT = 0.4;
const DEAD_ZONE = 16;

export function nextOpen(scrollY: number, openAt: number, open: boolean): boolean {
  return open ? scrollY > openAt - DEAD_ZONE : scrollY > openAt;
}

export function secretScroll(root: HTMLElement, image: HTMLElement, text: HTMLElement): () => void {
  const stage = root.parentElement;
  const track = stage?.parentElement;
  if (!stage || !track) return () => {};

  let open = false;
  let openAt = 0;
  let returnY = 0;

  const render = (next: boolean) => {
    open = next;
    root.setAttribute('data-settling', '');
    root.style.setProperty('--secret', open ? '1' : '0');
    text.inert = open;
    image.setAttribute('aria-pressed', String(open));
  };

  const measure = () => {
    stage.style.setProperty('--stage-top', `${Math.min(0, window.innerHeight - stage.offsetHeight)}px`);
    const runway = track.offsetHeight - stage.offsetHeight;
    openAt = Math.max(0, stage.offsetHeight - window.innerHeight) + runway * OPEN_AT;

    const rect = image.getBoundingClientRect();
    const shift = open ? Number.parseFloat(root.style.getPropertyValue('--secret-shift')) || 0 : 0;
    root.style.setProperty('--secret-shift', `${window.innerHeight / 2 - (rect.top + rect.height / 2 - shift)}px`);
  };

  const onScroll = () => {
    const next = nextOpen(window.scrollY, openAt, open);
    if (next === open) return;
    if (next) measure();
    render(next);
  };

  const onClick = () => {
    if (!open) returnY = window.scrollY;
    const top = open ? Math.min(returnY, openAt - DEAD_ZONE - 1) : document.documentElement.scrollHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  stage.classList.add(styles.stage);
  track.classList.add(styles.track);
  measure();
  onScroll();
  image.addEventListener('click', onClick);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  return () => {
    image.removeEventListener('click', onClick);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
  };
}
