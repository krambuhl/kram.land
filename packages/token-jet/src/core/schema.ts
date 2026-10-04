import type { Config, Modes, Preview, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';

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

type RequiredModes<Shape> =
  Shape extends Pattern<TokenType, string, infer Mode>
    ? Mode
    : Shape extends Pattern
      ? never
      : { [K in keyof Shape]: RequiredModes<Shape[K]> }[keyof Shape];

type UndeclaredModes<Shape, M extends Modes> = Exclude<RequiredModes<Shape>, keyof M>;

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

export interface DefinedTokens<Shape = unknown, M extends Modes = Modes> {
  schema: Schema<Shape, M>;
  tokens: TokensFor<Shape, Extract<keyof M, string>>;
}

export interface DefinedGenerate<Shape = unknown, M extends Modes = Modes> {
  schema: Schema<Shape, M>;
  entries: Record<string, GenerateEntry<Shape>>;
}

export interface Schema<Shape = unknown, M extends Modes = Modes> {
  modes: M;
  shape: Shape;
  defineTokens(tokens: TokensFor<Shape, Extract<keyof M, string>>): DefinedTokens<Shape, M>;
  defineGenerate(entries: Record<string, GenerateEntry<Shape>>): DefinedGenerate<Shape, M>;
}

export function defineSchema<const M extends Modes, const Shape>(
  schema: { modes: M; shape: Shape } & ([UndeclaredModes<Shape, M>] extends [never]
    ? unknown
    : { undeclaredModes: UndeclaredModes<Shape, M> })
): Schema<Shape, M> {
  const { modes, shape } = schema;
  const result: Schema<Shape, M> = {
    modes,
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

function leafFor(atom: Pattern, node: unknown, path: string, modes: Modes): TokenLeaf<Modes> {
  if (!isRecord(node) || !('value' in node)) {
    throw new Error(`Token "${path}" needs a value: the schema has a ${atom.type} pattern there.`);
  }
  for (const mode of atom.modes) {
    if (!(mode in modes))
      throw new Error(`Token "${path}" requires the mode "${mode}", which the schema does not declare.`);
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

function treeFor(shape: Record<string, unknown>, node: unknown, path: string[], modes: Modes): TokenTree<Modes> {
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
      ? leafFor(child, node[key], childPath.join('.'), modes)
      : treeFor(child as Record<string, unknown>, node[key], childPath, modes);
  }
  return out;
}

export function schemaToConfig(defined: DefinedTokens): Config<Modes> {
  const { schema, tokens } = defined;
  return { modes: schema.modes, tokens: treeFor(schema.shape as Record<string, unknown>, tokens, [], schema.modes) };
}
