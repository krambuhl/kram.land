import { GROUP_KEY, METADATA_KEYS } from './config.ts';
import type { Modes, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';
import { parseColor } from './contrast.ts';
import { isLeaf } from './flatten.ts';
import type { ResolvedTokens } from './load.ts';
import { parseReference } from './references.ts';

export const DTCG_EXTENSION = 'token-jet';

export interface DtcgColor {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha?: number;
  hex: string;
}

export interface DtcgUnitValue {
  value: number;
  unit: string;
}

export type DtcgValue = string | number | string[] | DtcgColor | DtcgUnitValue;
export type DtcgNode = Record<string, unknown>;
export type DtcgFile = DtcgNode;

const DIMENSION = /^(-?(?:\d+|\d*\.\d+))(px|rem)$/;
const DURATION = /^(-?(?:\d+|\d*\.\d+))(ms|s)$/;
const metadataKeys: ReadonlySet<string> = new Set(METADATA_KEYS);

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function hexByte(c: number): string {
  return Math.round(c * 255)
    .toString(16)
    .padStart(2, '0');
}

// Converts one value to the shape DTCG 2025.10 requires for its type. A
// value the format cannot carry, such as a % dimension or a named colour,
// is an error naming the token.
export function toDtcgValue(type: TokenType, value: TokenValue, path: string): DtcgValue {
  if (parseReference(value) !== null) return String(value);
  const text = String(value);
  switch (type) {
    case 'color': {
      const c = parseColor(text);
      if (c === null) {
        throw new Error(
          `Token "${path}" has the colour "${text}", which cannot be exported; write it as hex, rgb() or hsl().`
        );
      }
      return {
        colorSpace: 'srgb',
        components: [round(c.r), round(c.g), round(c.b)],
        ...(c.a < 1 && { alpha: round(c.a) }),
        hex: `#${hexByte(c.r)}${hexByte(c.g)}${hexByte(c.b)}`,
      };
    }
    case 'dimension': {
      if (text === '0') return { value: 0, unit: 'px' };
      const m = DIMENSION.exec(text);
      if (m === null) throw new Error(`Token "${path}" has the dimension "${text}"; DTCG allows px or rem only.`);
      return { value: Number(m[1]), unit: m[2] };
    }
    case 'duration': {
      const m = DURATION.exec(text);
      if (m === null) throw new Error(`Token "${path}" has the duration "${text}"; DTCG allows ms or s only.`);
      return { value: Number(m[1]), unit: m[2] };
    }
    case 'number':
      return Number(text);
    case 'fontWeight':
      return Number.isNaN(Number(text)) ? text : Number(text);
    case 'fontFamily': {
      const families = text.split(',').map((f) => f.trim());
      return families.length === 1 ? families[0] : families;
    }
  }
}

// A leaf writes $type only when it differs from the group's.
function leaf(node: TokenLeaf<Modes>, segments: string[], groupType: TokenType | undefined): DtcgNode {
  const path = segments.join('.');
  const type = node.type ?? groupType;
  if (type === undefined) throw new Error(`Token "${path}" has no type; set one on it or on its group to export it.`);
  const out: DtcgNode = {};
  if (node.type !== undefined && node.type !== groupType) out.$type = node.type;
  out.$value = toDtcgValue(type, node.value, path);
  if (node.description !== undefined) out.$description = node.description;
  if (node.deprecated !== undefined) out.$deprecated = node.deprecated;
  const modes: Record<string, DtcgValue> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key !== 'value' && !metadataKeys.has(key)) modes[key] = toDtcgValue(type, value as TokenValue, path);
  }
  const extension: Record<string, unknown> = {};
  if (Object.keys(modes).length > 0) extension.modes = modes;
  if (node.inherits !== undefined) extension.inherits = node.inherits;
  if (Object.keys(extension).length > 0) out.$extensions = { [DTCG_EXTENSION]: extension };
  return out;
}

function group(tree: TokenTree<Modes>, parent: string[], inherited: TokenType | undefined): DtcgNode {
  const out: DtcgNode = {};
  const meta = tree.$group;
  const ownType = meta?.type ?? inherited;
  if (meta?.type !== undefined) out.$type = meta.type;
  if (meta?.description !== undefined) out.$description = meta.description;
  for (const [key, node] of Object.entries(tree)) {
    if (key === GROUP_KEY || typeof node !== 'object' || node === null) continue;
    const segments = [...parent, key];
    out[key] = isLeaf(node) ? leaf(node, segments, ownType) : group(node as TokenTree<Modes>, segments, ownType);
  }
  return out;
}

// The token tree as a DTCG 2025.10 file. The format has no modes, so each
// mode's media query sits at the root and each token's mode values sit on
// the token, both under the token-jet extension.
export function toDtcg(resolved: ResolvedTokens): DtcgFile {
  const { config } = resolved;
  return {
    $extensions: { [DTCG_EXTENSION]: { modes: config.modes } },
    ...group(config.tokens, [], undefined),
  };
}
