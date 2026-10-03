import type { Template } from 'token-jet-generate';

type ValueType = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number' | 'duration';
type Preview = 'swatch' | 'gap' | 'bar' | 'corner' | 'text' | 'paragraph';

interface Pattern<Type extends ValueType = ValueType, Tag extends string = string, Mode extends string = string> {
  kind: 'pattern';
  type: Type;
  tags: readonly Tag[];
  preview?: Preview;
  modes: readonly Mode[];
}

export function pattern<
  const Type extends ValueType,
  const Tag extends string = never,
  const Mode extends string = never,
>(atom: { type: Type; tags?: readonly Tag[]; preview?: Preview; modes?: readonly Mode[] }): Pattern<Type, Tag, Mode> {
  return { kind: 'pattern', type: atom.type, tags: atom.tags ?? [], preview: atom.preview, modes: atom.modes ?? [] };
}

type Slots<Key extends string, Shape> = { [K in Key]: Shape };

export function slots<const Key extends string, Shape>(keys: readonly Key[], shape: Shape): Slots<Key, Shape> {
  return Object.fromEntries(keys.map((key) => [key, shape])) as Slots<Key, Shape>;
}

type TokenValue = string | number;

type Leaf<P, Mode extends string> =
  P extends Pattern<ValueType, string, infer Required>
    ? { value: TokenValue; description?: string; deprecated?: boolean | string } & {
        [K in Required]: TokenValue;
      } & { [K in Exclude<Mode, Required>]?: TokenValue }
    : never;

type TokensFor<Shape, Mode extends string> = Shape extends Pattern
  ? Leaf<Shape, Mode>
  : { [K in keyof Shape]: TokensFor<Shape[K], Mode> };

type Modes = Record<string, string>;

type RequiredModes<Shape> =
  Shape extends Pattern<ValueType, string, infer Mode>
    ? Mode
    : Shape extends Pattern
      ? never
      : { [K in keyof Shape]: RequiredModes<Shape[K]> }[keyof Shape];

type UndeclaredModes<Shape, M extends Modes> = Exclude<RequiredModes<Shape>, keyof M>;

type TagsOf<Shape> =
  Shape extends Pattern<ValueType, infer Tag>
    ? Tag
    : Shape extends Pattern
      ? never
      : { [K in keyof Shape]: TagsOf<Shape[K]> }[keyof Shape];

interface GenerateEntry<Shape> {
  tag: TagsOf<Shape>;
  template: Template;
}

interface Schema<Shape, M extends Modes> {
  modes: M;
  shape: Shape;
  defineTokens(tokens: TokensFor<Shape, Extract<keyof M, string>>): {
    schema: Schema<Shape, M>;
    tokens: TokensFor<Shape, Extract<keyof M, string>>;
  };
  defineGenerate(entries: Record<string, GenerateEntry<Shape>>): {
    schema: Schema<Shape, M>;
    entries: Record<string, GenerateEntry<Shape>>;
  };
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
