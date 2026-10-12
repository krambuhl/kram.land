import type { Config, ModeCss, Modes, Preview, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';

export interface Pattern<
  Type extends TokenType = TokenType,
  Tag extends string = string,
  Mode extends string = string,
> {
  kind: 'pattern';
  type: Type;
  tags: readonly Tag[];
  preview?: Preview;
  modes: readonly Mode[];
}

export function pattern<
  const Type extends TokenType,
  const Tag extends string = never,
  const Mode extends string = never,
>(atom: { type: Type; tags?: readonly Tag[]; preview?: Preview; modes?: readonly Mode[] }): Pattern<Type, Tag, Mode> {
  return {
    kind: 'pattern',
    type: atom.type,
    tags: atom.tags ?? [],
    ...(atom.preview !== undefined && { preview: atom.preview }),
    modes: atom.modes ?? [],
  };
}

export type Slots<Key extends string, Shape> = { [K in Key]: Shape };

export function slots<const Key extends string, Shape>(keys: readonly Key[], shape: Shape): Slots<Key, Shape> {
  return Object.fromEntries(keys.map((key) => [key, shape])) as Slots<Key, Shape>;
}

export interface LeafFields {
  value: TokenValue;
  description?: string;
  deprecated?: boolean | string;
  inherits?: boolean;
}

export type ModeValues<Mode extends string> = { [K in Mode]: TokenValue };
export type OptionalModeValues<Mode extends string> = { [K in Mode]?: TokenValue };

// Named, not inlined, so a type error prints SchemaLeaf<"dark", never> instead
// of the whole intersection. The arguments are the required and optional modes.
export type SchemaLeaf<Required extends string, Optional extends string> = LeafFields &
  ModeValues<Required> &
  OptionalModeValues<Optional>;

type Leaf<P, Mode extends string> =
  P extends Pattern<TokenType, string, infer Required> ? SchemaLeaf<Required, Exclude<Mode, Required>> : never;

export type TokensFor<Shape, Mode extends string> = Shape extends Pattern
  ? Leaf<Shape, Mode>
  : { [K in keyof Shape]: TokensFor<Shape[K], Mode> };

export type ModesOf<Shape> =
  Shape extends Pattern<TokenType, string, infer Mode>
    ? Mode
    : Shape extends Pattern
      ? never
      : { [K in keyof Shape]: ModesOf<Shape[K]> }[keyof Shape];

export type TagsOf<Shape> =
  Shape extends Pattern<TokenType, infer Tag>
    ? Tag
    : Shape extends Pattern
      ? never
      : { [K in keyof Shape]: TagsOf<Shape[K]> }[keyof Shape];

export interface GenerateEntry<Shape> {
  tag: TagsOf<Shape>;
  template: object;
}

export interface DefinedTokens<Shape = unknown> {
  schema: Schema<Shape>;
  tokens: TokensFor<Shape, ModesOf<Shape>>;
}

export interface DefinedGenerate<Shape = unknown> {
  schema: Schema<Shape>;
  entries: Record<string, GenerateEntry<Shape>>;
}

export interface Schema<Shape = unknown> {
  shape: Shape;
  defineTokens(tokens: TokensFor<Shape, ModesOf<Shape>>): DefinedTokens<Shape>;
  defineGenerate(entries: Record<string, GenerateEntry<Shape>>): DefinedGenerate<Shape>;
}

export function defineSchema<const Shape>(shape: Shape): Schema<Shape> {
  const result: Schema<Shape> = {
    shape,
    defineTokens: (tokens) => ({ schema: result, tokens }),
    defineGenerate: (entries) => ({ schema: result, entries }),
  };
  return result;
}

function isPattern(node: unknown): node is Pattern {
  return typeof node === 'object' && node !== null && (node as { kind?: unknown }).kind === 'pattern';
}

function isRecord(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

export function isDefinedTokens(value: unknown): value is DefinedTokens {
  return isRecord(value) && isRecord(value.schema) && isRecord(value.schema.shape) && isRecord(value.tokens);
}

function leafFor(atom: Pattern, node: unknown, path: string): TokenLeaf<Modes> {
  if (!isRecord(node) || !('value' in node)) {
    throw new Error(`Token "${path}" needs a value: the schema has a ${atom.type} pattern there.`);
  }
  for (const mode of atom.modes) {
    if (!(mode in node)) throw new Error(`Token "${path}" needs a value for the mode "${mode}".`);
  }
  const leaf = {
    ...node,
    type: atom.type,
    ...(atom.tags.length > 0 && { tags: atom.tags }),
    ...(atom.preview !== undefined && { preview: atom.preview }),
  };
  return leaf as unknown as TokenLeaf<Modes>;
}

function treeFor(shape: Record<string, unknown>, node: unknown, path: string[]): TokenTree<Modes> {
  const where = path.length === 0 ? 'the token tree' : `"${path.join('.')}"`;
  if (!isRecord(node)) throw new Error(`${where} must be a group: the schema has a group there.`);
  for (const key of Object.keys(node)) {
    if (!(key in shape)) throw new Error(`"${[...path, key].join('.')}" is not in the schema.`);
  }
  const out: TokenTree<Modes> = {};
  for (const [key, child] of Object.entries(shape)) {
    const childPath = [...path, key];
    if (!(key in node)) throw new Error(`"${childPath.join('.')}" is in the schema but has no token.`);
    out[key] = isPattern(child)
      ? leafFor(child, node[key], childPath.join('.'))
      : treeFor(child as Record<string, unknown>, node[key], childPath);
  }
  return out;
}

function modeNames(shape: unknown, into: Set<string>): Set<string> {
  if (isPattern(shape)) for (const mode of shape.modes) into.add(mode);
  else if (isRecord(shape)) for (const child of Object.values(shape)) modeNames(child, into);
  return into;
}

export interface CssConfig {
  modes?: Record<string, ModeCss>;
}

export function defineCss(css: CssConfig): CssConfig {
  return css;
}

// Mode names come from the patterns; what each mode does in CSS comes from
// the css config, and a mode it leaves out gets data-attribute scopes only.
export function schemaToConfig(defined: DefinedTokens, css: CssConfig = {}): Config<Modes> {
  const { schema, tokens } = defined;
  const names = modeNames(schema.shape, new Set());
  for (const name of Object.keys(css.modes ?? {})) {
    if (!names.has(name)) throw new Error(`css config implements the mode "${name}", which no pattern uses.`);
  }
  const modes: Modes = Object.fromEntries([...names].map((name) => [name, css.modes?.[name] ?? {}]));
  return { modes, tokens: treeFor(schema.shape as Record<string, unknown>, tokens, []) };
}
