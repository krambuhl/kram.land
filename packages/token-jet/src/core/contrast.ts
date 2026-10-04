export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*([^,\s/]+)[,\s]+([^,\s/]+)[,\s]+([^,\s/]+)(?:\s*[,/]\s*([^\s)]+))?\s*\)$/i;
const HSL = /^hsla?\(\s*([^,\s/]+)[,\s]+([^,\s/]+)[,\s]+([^,\s/]+)(?:\s*[,/]\s*([^\s)]+))?\s*\)$/i;

function channel(text: string): number {
  return text.endsWith('%') ? Number(text.slice(0, -1)) / 100 : Number(text) / 255;
}

function fraction(text: string | undefined): number {
  if (text === undefined) return 1;
  return text.endsWith('%') ? Number(text.slice(0, -1)) / 100 : Number(text);
}

function hue(text: string): number {
  const n = Number(text.replace(/deg$/i, ''));
  return ((n % 360) + 360) % 360;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

// Reads hex, rgb() and hsl() in modern and legacy syntax to channels in 0..1.
// Named colours, oklch() and lab() are not parsed; a pair must use these forms.
export function parseColor(text: string): Rgba | null {
  const hex = HEX.exec(text);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('');
    const n = (i: number) => Number.parseInt(digits.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? n(6) : 1 };
  }
  const rgb = RGB.exec(text);
  if (rgb) {
    const [r, g, b, a] = [channel(rgb[1]), channel(rgb[2]), channel(rgb[3]), fraction(rgb[4])];
    return [r, g, b, a].some(Number.isNaN) ? null : { r, g, b, a };
  }
  const hsl = HSL.exec(text);
  if (hsl) {
    const [h, s, l, a] = [hue(hsl[1]), fraction(hsl[2]), fraction(hsl[3]), fraction(hsl[4])];
    if ([h, s, l, a].some(Number.isNaN)) return null;
    const [r, g, b] = hslToRgb(h, s, l);
    return { r, g, b, a };
  }
  return null;
}

function luminance({ r, g, b }: Rgba): number {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

// A translucent foreground is seen over the background, so it is blended
// before the ratio is taken. The background is treated as opaque.
function over(fg: Rgba, bg: Rgba): Rgba {
  const mix = (f: number, b: number) => fg.a * f + (1 - fg.a) * b;
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

// WCAG 2.1 contrast ratio, rounded to two decimals.
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (fg === null) throw new Error(`"${foreground}" is not a colour token-jet can read.`);
  if (bg === null) throw new Error(`"${background}" is not a colour token-jet can read.`);
  const l1 = luminance(over(fg, bg));
  const l2 = luminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}
