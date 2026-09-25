import type { Declaration, Helpers, Plugin } from 'postcss';

import type { ResolvedTokens } from './core/load.ts';
import { cssVariableReference } from './core/names.ts';
import { nearest } from './core/suggest.ts';

export interface TokenJetPostcssOptions {
  tokens: ResolvedTokens;
}

export interface TokenJetPostcssPlugin extends Plugin {
  // Every path rewritten so far, for the css emitter's prune.
  used: Set<string>;
}

// token('path') at the cursor, and a quoted string at the cursor. Both are
// sticky so the walk in rewrite() can test the current position.
const CALL = /\btoken\(\s*(['"])([^'"\n]+)\1\s*\)/y;
const STRING = /(['"])(?:\\.|(?!\1)[^\\])*\1/y;

// Rewrites token('path') to var(--path) in every declaration, records the
// path, warns on a deprecated path and fails on an unknown one.
export default function tokenJet(options: TokenJetPostcssOptions): TokenJetPostcssPlugin {
  const { tokens } = options.tokens;
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const paths = tokens.map((t) => t.path);
  const groups = new Set(
    tokens.flatMap((t) => t.segments.slice(0, -1).map((_, i) => t.segments.slice(0, i + 1).join('.')))
  );
  const used = new Set<string>();

  const rewrite = (decl: Declaration, helpers: Helpers): void => {
    if (!decl.value.includes('token(')) return;
    // A token() call is not a string, but a string may contain the text of
    // one. Walk the value once: at a quote that does not follow `token(`, skip
    // to its closing quote; at `token(`, rewrite the call.
    let out = '';
    let i = 0;
    const value = decl.value;
    while (i < value.length) {
      CALL.lastIndex = i;
      const call = CALL.exec(value);
      if (call !== null && call.index === i) {
        out += replaceCall(decl, helpers, call[2]);
        i += call[0].length;
        continue;
      }
      const ch = value[i];
      if (ch === '"' || ch === "'") {
        STRING.lastIndex = i;
        const str = STRING.exec(value);
        if (str !== null && str.index === i) {
          out += str[0];
          i += str[0].length;
          continue;
        }
      }
      out += ch;
      i++;
    }
    decl.value = out;
  };

  const replaceCall = (decl: Declaration, helpers: Helpers, path: string): string => {
    const token = byPath.get(path);
    if (token === undefined) {
      const hint = groups.has(path) ? `"${path}" is a group, not a token.` : suggestion(path);
      throw decl.error(`Unknown token "${path}". ${hint}`, { word: path });
    }
    if (token.deprecated !== undefined) {
      const why = typeof token.deprecated === 'string' ? `: ${token.deprecated}` : '';
      decl.warn(helpers.result, `Token "${path}" is deprecated${why}.`, { word: path });
    }
    used.add(path);
    return cssVariableReference(path);
  };

  const suggestion = (path: string): string => {
    const near = nearest(path, paths);
    return near === undefined ? '' : `Did you mean "${near}"?`;
  };

  return {
    postcssPlugin: 'token-jet',
    used,
    Declaration: rewrite,
  };
}

export const postcss = true;
