import { TOKEN_TYPES } from './config.ts';
import type { TokenType, TokenValue } from './config.ts';
import type { Token } from './flatten.ts';
import { parseReference } from './references.ts';

const COLOR_FUNCTIONS = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/;
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAMED_COLOR = /^[a-z]+$/i;
const DIMENSION = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cap|ic|lh|rlh|dvh|dvw|svh|svw|lvh|lvw)$/;
const NUMBER = /^-?(?:\d+|\d*\.\d+)$/;
const DURATION = /^-?(?:\d+|\d*\.\d+)(?:ms|s)$/;
const FONT_WEIGHT_KEYWORDS = new Set(['normal', 'bold', 'lighter', 'bolder']);

// Returns null when the value fits the type, or a reason when it does not.
// A reference is never validated here; its target is checked separately.
export function validateValue(type: TokenType, value: TokenValue): string | null {
  if (parseReference(value) !== null) return null;
  const text = String(value);
  switch (type) {
    case 'color':
      return HEX.test(text) || COLOR_FUNCTIONS.test(text) || NAMED_COLOR.test(text) ? null : `"${text}" is not a color`;
    case 'dimension':
      return DIMENSION.test(text) || text === '0' ? null : `"${text}" is not a dimension`;
    case 'fontWeight': {
      const n = Number(text);
      return FONT_WEIGHT_KEYWORDS.has(text) || (Number.isInteger(n) && n >= 1 && n <= 1000)
        ? null
        : `"${text}" is not a fontWeight`;
    }
    case 'number':
      return NUMBER.test(text) ? null : `"${text}" is not a number`;
    case 'duration':
      return DURATION.test(text) ? null : `"${text}" is not a duration`;
    case 'fontFamily':
      return text.trim().length > 0 ? null : `"${text}" is not a fontFamily`;
  }
}

// A leaf's own type, else the nearest group's, else none.
export function inferType(token: Token): TokenType | undefined {
  return token.type ?? token.groupType;
}

// Validates every typed token's values, base and per mode, and checks that a
// reference points at a token of the same type when both are typed.
export function checkTypes(tokens: readonly Token[]): void {
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const valid: ReadonlySet<string> = new Set(TOKEN_TYPES);

  for (const token of tokens) {
    const type = inferType(token);
    if (type === undefined) continue;
    if (!valid.has(type)) {
      throw new Error(`Token "${token.path}" has type "${type}". Valid types are ${TOKEN_TYPES.join(', ')}.`);
    }
    const base = validateValue(type, token.value);
    if (base !== null) throw new Error(`Token "${token.path}": ${base}.`);
    for (const [mode, value] of Object.entries(token.modes)) {
      const reason = validateValue(type, value);
      if (reason !== null) throw new Error(`Token "${token.path}" in mode "${mode}": ${reason}.`);
    }
    for (const value of [token.value, ...Object.values(token.modes)]) {
      const target = parseReference(value);
      if (target === null) continue;
      const targetToken = byPath.get(target);
      const targetType = targetToken === undefined ? undefined : inferType(targetToken);
      if (targetType !== undefined && targetType !== type) {
        throw new Error(
          `Token "${token.path}" has type ${type} but references "${target}", which has type ${targetType}.`
        );
      }
    }
  }
}
