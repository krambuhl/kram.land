import type { TokenType } from './config.ts';
import type { Token } from './flatten.ts';
import type { ResolvedTokens } from './load.ts';
import { cssVariableName } from './names.ts';
import { emitValue, parseReference, resolveValue } from './references.ts';

export interface EmitCssOptions {
  // Emit only the used tokens and what they reference.
  prune?: boolean;
  used?: ReadonlySet<string>;
}

// The mode that is a two-valued colour scheme. It alone gets the four scopes
// light, dark, auto and inverted; any other mode gets on and off.
const SCHEME_MODE = 'dark';

const SYNTAX: Record<TokenType, string> = {
  color: '<color>',
  dimension: '<length>',
  number: '<number>',
  fontWeight: '<integer>',
  duration: '<time>',
  fontFamily: '*',
};

// Indents every line of every entry, so nested blocks indent as a whole.
function indent(entries: string[]): string {
  return entries
    .flatMap((e) => e.split('\n'))
    .map((l) => `  ${l}`)
    .join('\n');
}

function block(selector: string, lines: string[]): string {
  return `${selector} {\n${indent(lines)}\n}`;
}

function property(token: Token, tokens: readonly Token[]): string {
  const type = token.type ?? token.groupType;
  const syntax = type === undefined ? '*' : SYNTAX[type];
  const lines = [`syntax: '${syntax}';`, `inherits: ${token.inherits ?? true};`];
  // `*` syntax may not carry an initial value.
  if (syntax !== '*') lines.push(`initial-value: ${String(resolveValue(token.path, tokens))};`);
  return block(`@property ${cssVariableName(token.path)}`, lines);
}

// Tokens to emit under prune: the used set closed over references.
function closure(tokens: readonly Token[], used: ReadonlySet<string>): Set<string> {
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const keep = new Set<string>();
  const visit = (path: string): void => {
    if (keep.has(path)) return;
    keep.add(path);
    const token = byPath.get(path);
    if (!token) return;
    for (const value of [token.value, ...Object.values(token.modes)]) {
      const target = parseReference(value);
      if (target !== null) visit(target);
    }
  };
  for (const path of used) visit(path);
  return keep;
}

export function emitCss(resolved: ResolvedTokens, options: EmitCssOptions = {}): string {
  const all = resolved.tokens;
  const keep = options.prune ? closure(all, options.used ?? new Set()) : null;
  const tokens = keep === null ? all : all.filter((t) => keep.has(t.path));
  const modeNames = Object.keys(resolved.config.modes);

  const out: string[] = [];

  for (const token of tokens) out.push(property(token, all));

  // Base block: plain tokens as themselves, mode tokens as their base slot.
  const base: string[] = [];
  for (const token of tokens) {
    const name = cssVariableName(token.path);
    const hasModes = Object.keys(token.modes).length > 0;
    base.push(`${hasModes ? `${name}--light` : name}: ${emitValue(token.value)};`);
  }
  out.push(block(':where(html)', base));

  for (const mode of modeNames) {
    const query = resolved.config.modes[mode];
    const withMode = tokens.filter((t) => mode in t.modes);
    if (withMode.length === 0) continue;
    const fill = withMode.map((t) => `${cssVariableName(t.path)}--${mode}: ${emitValue(t.modes[mode])};`);
    const unset = withMode.map((t) => `${cssVariableName(t.path)}--${mode}: initial;`);

    if (mode === SCHEME_MODE) {
      out.push(`@media ${query} {\n${indent([block(':where(html)', fill)])}\n}`);
      out.push(block(`[data-mode='dark']`, fill));
      out.push(block(`[data-mode='light']`, unset));
      out.push(block(`[data-mode='auto']`, unset));
      out.push(block(`[data-mode='inverted']`, fill));
      out.push(
        `@media ${query} {\n${indent([block(`[data-mode='auto']`, fill), block(`[data-mode='inverted']`, unset)])}\n}`
      );
    } else {
      out.push(`@media ${query} {\n${indent([block(':where(html)', fill)])}\n}`);
      out.push(block(`[data-${mode}='on']`, fill));
      out.push(block(`[data-${mode}='off']`, unset));
    }
  }

  // Chains: a mode token resolves through its slots in mode order, base last.
  const chains: string[] = [];
  for (const token of tokens) {
    const modes = modeNames.filter((m) => m in token.modes);
    if (modes.length === 0) continue;
    const name = cssVariableName(token.path);
    const chain = modes.reduceRight((inner, m) => `var(${name}--${m}, ${inner})`, `var(${name}--light)`);
    chains.push(`${name}: ${chain};`);
  }
  if (chains.length > 0) out.push(block('*', chains));

  return `${out.join('\n\n')}\n`;
}
