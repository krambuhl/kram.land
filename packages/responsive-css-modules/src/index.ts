export interface ResponsiveRegister {}

type Registered<Key extends string, Fallback> = ResponsiveRegister extends Record<Key, infer T> ? T : Fallback;

export type Breakpoint = Registered<'breakpoint', string>;
export type BreakpointRange = Registered<'range', readonly string[]>;

export type Match =
  | { matchMin: Breakpoint; matchMax?: never; matchOnly?: never }
  | { matchMax: Breakpoint; matchMin?: never; matchOnly?: never }
  | { matchOnly: Breakpoint | BreakpointRange; matchMin?: never; matchMax?: never };

export type MatchOptions =
  | { matchMin: string; matchMax?: never; matchOnly?: never }
  | { matchMax: string; matchMin?: never; matchOnly?: never }
  | { matchOnly: string | readonly string[]; matchMin?: never; matchMax?: never };

export type Responsive<Styles> = { readonly [Name in keyof Styles]: (match: Match) => string };

export function variantSuffix(match: MatchOptions): string {
  if (match.matchMin !== undefined) return `min-${match.matchMin}`;
  if (match.matchMax !== undefined) return `max-${match.matchMax}`;
  const only: readonly string[] = typeof match.matchOnly === 'string' ? [match.matchOnly] : match.matchOnly;
  return only.length === 1 ? `only-${only[0]}` : `only-${only[0]}-${only[only.length - 1]}`;
}

export function variantClass(name: string, match: MatchOptions): string {
  return `${name}--${variantSuffix(match)}`;
}

export function responsive<Styles extends Readonly<Record<string, string>>>(styles: Styles): Responsive<Styles> {
  const out: Record<string, (match: Match) => string> = {};
  for (const name of Object.keys(styles)) {
    out[name] = (match) => {
      const key = variantClass(name, match);
      const value = styles[key];
      if (value !== undefined) return value;
      console.warn(`responsive-css-modules: no ${key} class; was the call written where the scanner can see it?`);
      return '';
    };
  }
  return out as Responsive<Styles>;
}
