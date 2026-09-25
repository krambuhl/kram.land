import type { TokenValue } from './config.ts';
import type { Token } from './flatten.ts';
import { cssVariableReference } from './names.ts';

const REFERENCE = /^\{([^{}\s]+)\}$/;

// A value of exactly `{path}` is a reference. Anything else is a literal.
export function parseReference(value: TokenValue): string | null {
  if (typeof value !== 'string') return null;
  const match = REFERENCE.exec(value);
  return match ? match[1] : null;
}

// What the css emitter writes for a value: a var() for a reference, so the
// semantic token follows its target at runtime, or the literal as written.
export function emitValue(value: TokenValue): string {
  const target = parseReference(value);
  return target === null ? String(value) : cssVariableReference(target);
}

// Every value on a token, base and per mode, that is a reference.
function referencesOf(token: Token): { target: string; mode?: string }[] {
  const out: { target: string; mode?: string }[] = [];
  const base = parseReference(token.value);
  if (base !== null) out.push({ target: base });
  for (const [mode, value] of Object.entries(token.modes)) {
    const target = parseReference(value);
    if (target !== null) out.push({ target, mode });
  }
  return out;
}

// Checks that every reference points at a leaf that exists and that no chain
// of references loops. Cycles are reported as the path they follow.
export function checkReferences(tokens: readonly Token[]): void {
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const groups = new Set(
    tokens.flatMap((t) => t.segments.slice(0, -1).map((_, i) => t.segments.slice(0, i + 1).join('.')))
  );

  for (const token of tokens) {
    for (const { target } of referencesOf(token)) {
      if (byPath.has(target)) continue;
      if (groups.has(target)) {
        throw new Error(`Token "${token.path}" references "${target}", which is a group, not a token.`);
      }
      throw new Error(`Token "${token.path}" references "${target}", which does not exist.`);
    }
  }

  // Depth-first walk over the reference graph. Base and mode references are
  // all edges, so a cycle through a mode value is found too.
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];
  const visit = (path: string): void => {
    const s = state.get(path);
    if (s === 'done') return;
    if (s === 'visiting') {
      const cycle = [...stack.slice(stack.indexOf(path)), path];
      throw new Error(`Reference cycle: ${cycle.join(' -> ')}.`);
    }
    state.set(path, 'visiting');
    stack.push(path);
    const token = byPath.get(path);
    if (token) for (const { target } of referencesOf(token)) visit(target);
    stack.pop();
    state.set(path, 'done');
  };
  for (const token of tokens) visit(token.path);
}

// Follows references to a literal for one mode. A mode value on a token wins
// over its base value; a token with no value for the mode uses its base, and
// a reference is followed in the same mode.
export function resolveValue(path: string, tokens: readonly Token[], mode?: string): TokenValue {
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const seen = new Set<string>();
  let current = path;
  for (;;) {
    const token = byPath.get(current);
    if (!token) throw new Error(`Token "${current}" does not exist.`);
    if (seen.has(current)) throw new Error(`Reference cycle at "${current}".`);
    seen.add(current);
    const value = mode !== undefined && mode in token.modes ? token.modes[mode] : token.value;
    const target = parseReference(value);
    if (target === null) return value;
    current = target;
  }
}
