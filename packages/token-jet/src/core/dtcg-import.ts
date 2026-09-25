import { GROUP_KEY, TOKEN_TYPES } from './config.ts';
import type { Modes, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';
import { DTCG_EXTENSION } from './dtcg.ts';
import type { DtcgNode } from './dtcg.ts';
import { parseReference } from './references.ts';

export interface ImportedConfig {
  modes: Modes;
  tokens: TokenTree<Modes>;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;
const NUMBER_KEY = /^(?:0|[1-9]\d*)$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenType(value: unknown): value is TokenType {
  return typeof value === 'string' && (TOKEN_TYPES as readonly string[]).includes(value);
}

function hexByte(c: number): string {
  return Math.round(c * 255)
    .toString(16)
    .padStart(2, '0');
}

// Converts a DTCG value back to the string or number the config writes.
// A colour comes back as hex, with alpha as a fourth byte; only srgb is read.
export function fromDtcgValue(type: TokenType, value: unknown): TokenValue {
  if (typeof value === 'string' && parseReference(value) !== null) return value;
  switch (type) {
    case 'color': {
      if (!isObject(value)) return String(value);
      if (value.colorSpace !== 'srgb') {
        throw new Error(`Colour space "${String(value.colorSpace)}" is not read; token-jet reads srgb only.`);
      }
      const components = Array.isArray(value.components) ? value.components.map(Number) : [];
      const hex = typeof value.hex === 'string' ? value.hex : `#${components.map(hexByte).join('')}`;
      const alpha = typeof value.alpha === 'number' && value.alpha < 1 ? hexByte(value.alpha) : '';
      return `${hex}${alpha}`;
    }
    case 'dimension':
    case 'duration':
      return isObject(value) ? `${String(value.value)}${String(value.unit)}` : String(value);
    case 'fontFamily':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'number':
    case 'fontWeight':
      return typeof value === 'number' ? value : String(value);
  }
}

function leaf(
  node: Record<string, unknown>,
  path: string,
  groupType: TokenType | undefined,
  modes: Modes
): TokenLeaf<Modes> {
  const own = node.$type;
  if (own !== undefined && !isTokenType(own)) {
    throw new Error(`Token "${path}" has the $type "${String(own)}", which token-jet does not support.`);
  }
  const type = own ?? groupType;
  if (type === undefined) throw new Error(`Token "${path}" has no $type on it or a group above it.`);
  const out: TokenLeaf<Modes> = { value: fromDtcgValue(type, node.$value) };
  if (own !== undefined) out.type = own;
  if (typeof node.$description === 'string') out.description = node.$description;
  if (typeof node.$deprecated === 'string' || typeof node.$deprecated === 'boolean') out.deprecated = node.$deprecated;
  const extension =
    isObject(node.$extensions) && isObject(node.$extensions[DTCG_EXTENSION]) ? node.$extensions[DTCG_EXTENSION] : {};
  if (isObject(extension.modes)) {
    for (const [mode, value] of Object.entries(extension.modes)) {
      if (!(mode in modes))
        throw new Error(`Token "${path}" has a value for the mode "${mode}", which the file does not declare.`);
      out[mode] = fromDtcgValue(type, value);
    }
  }
  if (typeof extension.inherits === 'boolean') out.inherits = extension.inherits;
  return out;
}

function group(
  node: Record<string, unknown>,
  parent: string[],
  inherited: TokenType | undefined,
  modes: Modes
): TokenTree<Modes> {
  const out: TokenTree<Modes> = {};
  if (node.$type !== undefined && !isTokenType(node.$type)) {
    throw new Error(
      `Group "${parent.join('.')}" has the $type "${String(node.$type)}", which token-jet does not support.`
    );
  }
  const ownType = node.$type ?? inherited;
  if (node.$type !== undefined || typeof node.$description === 'string') {
    out[GROUP_KEY] = {
      ...(node.$type !== undefined && { type: node.$type }),
      ...(typeof node.$description === 'string' && { description: node.$description }),
    };
  }
  for (const [name, child] of Object.entries(node)) {
    if (name.startsWith('$') || !isObject(child)) continue;
    const segments = [...parent, name];
    out[name] =
      '$value' in child ? leaf(child, segments.join('.'), ownType, modes) : group(child, segments, ownType, modes);
  }
  return out;
}

// Reads a DTCG file into the modes and token tree of a config. $type and
// $description on a group become its $group; a token's mode values come
// from the token-jet extension and must name a mode the file declares.
export function fromDtcg(file: DtcgNode): ImportedConfig {
  const extension =
    isObject(file.$extensions) && isObject(file.$extensions[DTCG_EXTENSION]) ? file.$extensions[DTCG_EXTENSION] : {};
  const modes: Modes = {};
  if (isObject(extension.modes)) {
    for (const [name, query] of Object.entries(extension.modes)) modes[name] = String(query);
  }
  return { modes, tokens: group(file, [], undefined, modes) };
}

function key(name: string): string {
  return IDENT.test(name) || NUMBER_KEY.test(name) ? name : quote(name);
}

function quote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function literal(value: unknown): string {
  return typeof value === 'string' ? quote(value) : String(value);
}

function inline(record: Record<string, unknown>): string {
  return `{ ${Object.entries(record)
    .map(([k, v]) => `${key(k)}: ${literal(v)}`)
    .join(', ')} }`;
}

function block(tree: TokenTree<Modes>, depth: number): string {
  const pad = '  '.repeat(depth);
  const lines: string[] = [];
  const meta = tree[GROUP_KEY];
  if (meta !== undefined) lines.push(`${pad}${GROUP_KEY}: ${inline(meta as Record<string, unknown>)},`);
  for (const [name, node] of Object.entries(tree)) {
    if (node === undefined || name === GROUP_KEY) continue;
    if ('value' in node) {
      lines.push(`${pad}${key(name)}: ${inline(node as Record<string, unknown>)},`);
    } else {
      lines.push(`${pad}${key(name)}: {`, block(node as TokenTree<Modes>, depth + 1), `${pad}},`);
    }
  }
  return lines.join('\n');
}

// Writes the imported modes and tokens as tokens.config.ts text. A key is
// bare when it is an identifier or a plain number, quoted otherwise; a leaf
// sits on one line, a group on many.
export function renderConfig(config: ImportedConfig): string {
  const modes = Object.entries(config.modes)
    .map(([name, query]) => `    ${key(name)}: ${quote(query)},`)
    .join('\n');
  return [
    "import { defineConfig } from 'token-jet';",
    '',
    'export default defineConfig({',
    '  modes: {',
    modes,
    '  },',
    '  tokens: {',
    block(config.tokens, 2),
    '  },',
    '});',
    '',
  ].join('\n');
}
