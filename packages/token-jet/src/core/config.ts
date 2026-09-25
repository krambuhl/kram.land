export type Modes = Record<string, string>;

export type TokenValue = string | number;

export const TOKEN_TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'number', 'duration'] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

// Keys on a leaf that are not its value or a mode value.
export const METADATA_KEYS = ['type', 'description', 'deprecated', 'inherits'] as const;
// The key a group's metadata lives under.
export const GROUP_KEY = '$group';

export interface TokenMetadata {
  type?: TokenType;
  description?: string;
  deprecated?: boolean | string;
  // Whether the custom property inherits. Defaults to true.
  inherits?: boolean;
}

// A leaf: a value plus an optional override per mode. The mode keys are the
// keys of the config's modes, so an unknown one fails to type-check.
export type TokenLeaf<M extends Modes> = { value: TokenValue } & { [K in keyof M]?: TokenValue } & TokenMetadata;

// Metadata a group may carry. `type` is inherited by every leaf below it.
interface GroupMetadata {
  type?: TokenType;
  description?: string;
}

// A group's metadata lives under one reserved key, `$group`, so it can never
// collide with a child and TypeScript can give it a narrower type than the
// index signature allows for children. An interface, not a type alias: an
// intersection of an index signature with a named key makes TypeScript pick
// the wrong branch for nested groups.
export interface TokenTree<M extends Modes> {
  $group?: GroupMetadata;
  [key: string]: TokenLeaf<M> | TokenTree<M> | GroupMetadata | undefined;
}

// A union in the types block: one glob or a list of globs.
export type TypePattern = string | string[];

export interface ContrastConfig {
  minimum: number;
  pairs: readonly (readonly [foreground: string, background: string])[];
}

export interface Config<M extends Modes = Modes> {
  modes: M;
  tokens: TokenTree<M>;
  types?: Record<string, TypePattern>;
  contrast?: ContrastConfig;
}

export function defineConfig<const M extends Modes>(config: Config<M>): Config<M> {
  return config;
}
