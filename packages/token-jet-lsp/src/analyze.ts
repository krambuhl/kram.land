import { nearest, resolveValue } from 'token-jet';
import type { ResolvedTokens, Token } from 'token-jet';

export interface Call {
  path: string;
  start: number;
  end: number;
  closed: boolean;
}

export interface Completion {
  label: string;
  detail: string;
  documentation?: string;
  deprecated: boolean;
}

export interface Finding {
  call: Call;
  severity: 'error' | 'warning';
  message: string;
  replacement?: string;
}

// A token() call with a quoted argument, closed or not, so completion works
// while the closing quote is still to come. \b keeps tokenize( out.
const CALL = /\btoken\(\s*(['"])([^'"\n]*)(\1\s*\))?/g;

export function findCalls(text: string): Call[] {
  const calls: Call[] = [];
  for (const match of text.matchAll(CALL)) {
    const start = match.index + match[0].indexOf(match[1]) + 1;
    calls.push({ path: match[2], start, end: start + match[2].length, closed: match[3] !== undefined });
  }
  return calls;
}

export function callAt(text: string, offset: number): Call | undefined {
  return findCalls(text).find((c) => c.start <= offset && offset <= c.end);
}

function values(token: Token, resolved: ResolvedTokens): { mode: string; raw: string; literal: string }[] {
  const out = [{ mode: 'base', raw: String(token.value), literal: String(resolveValue(token.path, resolved.tokens)) }];
  for (const mode of Object.keys(resolved.config.modes)) {
    if (mode in token.modes) {
      out.push({
        mode,
        raw: String(token.modes[mode]),
        literal: String(resolveValue(token.path, resolved.tokens, mode)),
      });
    }
  }
  return out;
}

export function complete(resolved: ResolvedTokens): Completion[] {
  return resolved.tokens.map((token) => ({
    label: token.path,
    detail: values(token, resolved)
      .map((v, i) => (i === 0 ? v.literal : `${v.mode} ${v.literal}`))
      .join(' · '),
    ...(token.description !== undefined && { documentation: token.description }),
    deprecated: token.deprecated !== undefined,
  }));
}

export function hover(path: string, resolved: ResolvedTokens): string | undefined {
  const token = resolved.tokens.find((t) => t.path === path);
  if (token === undefined) return undefined;
  const lines = [`\`${token.path}\``, ''];
  for (const v of values(token, resolved)) {
    lines.push(v.raw === v.literal ? `${v.mode}: \`${v.literal}\`` : `${v.mode}: \`${v.raw}\` → \`${v.literal}\``);
  }
  if (token.description !== undefined) lines.push('', token.description);
  if (token.deprecated !== undefined) {
    lines.push('', typeof token.deprecated === 'string' ? `deprecated: ${token.deprecated}` : 'deprecated');
  }
  return lines.join('\n');
}

// The deprecation text is free-form; a token it names is the replacement.
function replacementFor(deprecated: boolean | string, tokens: readonly Token[]): string | undefined {
  if (typeof deprecated !== 'string') return undefined;
  return tokens.find((t) => deprecated.includes(t.path))?.path;
}

// Only closed calls are checked; an open one is still being typed.
export function diagnose(text: string, resolved: ResolvedTokens): Finding[] {
  const byPath = new Map(resolved.tokens.map((t) => [t.path, t]));
  const paths = resolved.tokens.map((t) => t.path);
  const findings: Finding[] = [];
  for (const call of findCalls(text)) {
    if (!call.closed) continue;
    const token = byPath.get(call.path);
    if (token === undefined) {
      const suggestion = nearest(call.path, paths);
      findings.push({
        call,
        severity: 'error',
        message: `Token "${call.path}" does not exist.${suggestion === undefined ? '' : ` Did you mean "${suggestion}"?`}`,
        ...(suggestion !== undefined && { replacement: suggestion }),
      });
    } else if (token.deprecated !== undefined) {
      const why = typeof token.deprecated === 'string' ? `: ${token.deprecated}` : '';
      const replacement = replacementFor(token.deprecated, resolved.tokens);
      findings.push({
        call,
        severity: 'warning',
        message: `Token "${call.path}" is deprecated${why}.`,
        ...(replacement !== undefined && { replacement }),
      });
    }
  }
  return findings;
}
