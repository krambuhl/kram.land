const MOVE = 450;
const FADE = 200;
const RETURN = 900;
const LIFT = 160;
const RESEED = 250;

export function immersive(image: HTMLElement, text: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const html = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // on touch the page rests LIFT px down so art shows under safari's top bar. the scroll
  // may apply late, so nothing here waits to see whether it took.
  const lift = window.matchMedia('(pointer: coarse)').matches ? LIFT : 0;
  const settle = () => {
    if (lift === 0 || !html.hasAttribute('data-immersive')) return;
    window.scrollTo(0, lift);
  };
  if (lift > 0) {
    history.scrollRestoration = 'manual';
    html.setAttribute('data-lifted', '');
    html.style.setProperty('--lift', `${lift}px`);
    settle();
  }
  let anchor = { x: 0, y: 0, r: 0 };
  let floor = window.innerHeight;
  let stopArt: (() => void) | undefined;
  let startArt: (() => () => void) | undefined;
  let reseeding = false;
  let reseedTimer: ReturnType<typeof setTimeout> | undefined;
  let closing: ReturnType<typeof setTimeout> | undefined;

  // the art scrolls up with the portrait on open and with the page after it, so the
  // canvas reaches below the screen by both distances and the portrait keeps its hole.
  // measuring the open layout toggles the state with transitions held off.
  const measure = () => {
    if (!html.hasAttribute('data-immersive')) return;
    html.setAttribute('data-measuring', '');
    const rect = image.getBoundingClientRect();
    const area = canvas.getBoundingClientRect();
    html.removeAttribute('data-immersive');
    const opened = image.getBoundingClientRect();
    const scrolls = Math.max(0, document.body.offsetHeight - window.innerHeight);
    html.setAttribute('data-immersive', '');
    image.getBoundingClientRect();
    html.removeAttribute('data-measuring');
    const travel = Math.max(0, rect.top - opened.top);
    html.style.setProperty('--travel', `${travel}px`);
    html.style.setProperty('--scrolls', `${scrolls}px`);
    // the floor is where the closed screen ends, in canvas coordinates.
    floor = window.innerHeight - area.top;
    anchor = {
      x: rect.left + rect.width / 2 - area.left,
      y: rect.top + rect.height / 2 - area.top,
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
    // the glide starts from the rest position, so the page scrolls back there while the
    // text fades, and closes once both are done or RETURN ms have passed.
    const started = performance.now();
    const rested = () => Math.abs(window.scrollY - lift) <= 1;
    if (!rested()) window.scrollTo({ top: lift, behavior: still ? 'auto' : 'smooth' });
    const finish = () => {
      const waited = performance.now() - started;
      if (!still && waited < RETURN && (waited < FADE || !rested())) {
        closing = setTimeout(finish, 16);
        return;
      }
      html.removeAttribute('data-closing');
      window.scrollTo({ top: lift });
      glide(() => html.setAttribute('data-immersive', ''));
    };
    finish();
  };

  // pageshow scrolls to the rest position and measures the portrait again.
  const onShow = () => {
    settle();
    measure();
  };
  const onClick = () => (html.hasAttribute('data-immersive') ? open() : close());
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if (!html.hasAttribute('data-immersive')) close();
    else reseed();
  };
  // clears the art at once, starts a fresh field with a new seed, and fades it in.
  const reseed = () => {
    if (startArt === undefined || reseeding) return;
    reseeding = true;
    html.setAttribute('data-reseed', '');
    html.removeAttribute('data-art');
    stopArt?.();
    // seeding blocks the main thread, so it waits for the cleared frame to paint.
    requestAnimationFrame(() => {
      reseedTimer = setTimeout(() => {
        stopArt = startArt?.();
      });
    });
  };
  // a click on the scrim around the content closes it, unless it ends a text selection.
  const onOutside = (event: MouseEvent) => {
    if (html.hasAttribute('data-immersive') || html.hasAttribute('data-closing')) return;
    if (block.contains(event.target as Node) || !window.getSelection()?.isCollapsed) return;
    close();
  };

  measure();
  // the open layout depends on the text, so it's measured again once the web fonts load.
  void document.fonts?.ready.then(measure);
  import('../../art/index.ts').then(({ default: start }) => {
    // the art is shown once it has settled. after a reseed the quick fade's flag clears
    // once that fade has run.
    const ready = () => {
      html.setAttribute('data-art', '');
      if (!reseeding) return;
      reseedTimer = setTimeout(() => {
        html.removeAttribute('data-reseed');
        reseeding = false;
      }, RESEED);
    };
    // the pointer plays with the art only while the page is closed.
    const playing = () => html.hasAttribute('data-immersive');
    startArt = () => start(canvas, { anchor: () => anchor, floor: () => floor, ready, playing });
    stopArt = startArt();
  });
  image.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onOutside);
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', onShow);
  return () => {
    clearTimeout(reseedTimer);
    stopArt?.();
    image.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onOutside);
    window.removeEventListener('resize', measure);
    window.removeEventListener('pageshow', onShow);
  };
}
