const MOVE = 450;
const FADE = 200;
const RESEED = 250;

export function immersive(image: HTMLElement, text: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const html = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let anchor = { x: 0, y: 0, r: 0 };
  let floor = window.innerHeight;
  let stopArt: (() => void) | undefined;
  let startArt: (() => () => void) | undefined;
  let reseeding: ReturnType<typeof setTimeout> | undefined;
  let closing: ReturnType<typeof setTimeout> | undefined;

  // the art scrolls up with the portrait on open, so the canvas reaches
  // below the screen by that distance and the portrait keeps its hole.
  // measuring the open layout toggles the state with transitions held off.
  const measure = () => {
    if (!html.hasAttribute('data-immersive')) return;
    html.setAttribute('data-measuring', '');
    const rect = image.getBoundingClientRect();
    const frame = canvas.getBoundingClientRect();
    html.removeAttribute('data-immersive');
    const opened = image.getBoundingClientRect();
    html.setAttribute('data-immersive', '');
    image.getBoundingClientRect();
    html.removeAttribute('data-measuring');
    const travel = Math.max(0, rect.top - opened.top);
    canvas.style.setProperty('--travel', `${travel}px`);
    floor = canvas.clientHeight - travel;
    anchor = {
      x: rect.left + rect.width / 2 - frame.left,
      y: rect.top + rect.height / 2 - frame.top,
      r: rect.width / 2,
    };
  };

  const block = text.parentElement ?? image;

  const glide = (change: () => void) => {
    const before = image.getBoundingClientRect();
    change();
    const after = image.getBoundingClientRect();
    const dy = before.top - after.top;
    if (dy === 0 || still) return;
    block.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
      duration: MOVE,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  };

  const open = () => {
    clearTimeout(closing);
    html.removeAttribute('data-closing');
    glide(() => html.removeAttribute('data-immersive'));
    image.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    image.setAttribute('aria-expanded', 'false');
    html.setAttribute('data-closing', '');
    closing = setTimeout(
      () => {
        html.removeAttribute('data-closing');
        glide(() => html.setAttribute('data-immersive', ''));
        window.scrollTo({ top: 0 });
      },
      still ? 0 : FADE
    );
  };

  const onClick = () => (html.hasAttribute('data-immersive') ? open() : close());
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if (!html.hasAttribute('data-immersive')) close();
    else reseed();
  };
  // clears the art at once, starts a fresh field with a new seed, and fades it in.
  const reseed = () => {
    if (startArt === undefined || reseeding !== undefined) return;
    html.setAttribute('data-reseed', '');
    html.removeAttribute('data-art');
    // commits the cleared state so the fade-in starts from zero.
    canvas.getBoundingClientRect();
    stopArt?.();
    stopArt = startArt();
    html.setAttribute('data-art', '');
    reseeding = setTimeout(() => {
      html.removeAttribute('data-reseed');
      reseeding = undefined;
    }, RESEED);
  };
  // a click on the scrim around the content closes it, unless it ends a text selection.
  const onOutside = (event: MouseEvent) => {
    if (html.hasAttribute('data-immersive') || html.hasAttribute('data-closing')) return;
    if (block.contains(event.target as Node) || !window.getSelection()?.isCollapsed) return;
    close();
  };

  measure();
  import('../../art/index.ts').then(({ default: start }) => {
    startArt = () => start(canvas, { anchor: () => anchor, floor: () => floor });
    stopArt = startArt();
    html.setAttribute('data-art', '');
  });
  image.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onOutside);
  window.addEventListener('resize', measure);
  return () => {
    clearTimeout(reseeding);
    stopArt?.();
    image.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onOutside);
    window.removeEventListener('resize', measure);
  };
}
