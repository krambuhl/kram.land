export type Modes = Record<string, string>;

export type TokenValue = string | number;

export const TOKEN_TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'number', 'duration'] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

// Keys on a leaf that are not its value or a mode value.
export const METADATA_KEYS = ['type', 'description', 'deprecated', 'inherits', 'tags', 'preview'] as const;

export const PREVIEWS = ['swatch', 'gap', 'bar', 'corner', 'text', 'paragraph'] as const;
export type Preview = (typeof PREVIEWS)[number];

export interface TokenMetadata {
  type?: TokenType;
  description?: string;
  deprecated?: boolean | string;
  // Whether the custom property inherits. Defaults to true.
  inherits?: boolean;
  tags?: readonly string[];
  preview?: Preview;
}

type ModeValues<M extends Modes> = string extends keyof M
  ? { [key: string]: unknown }
  : { [K in keyof M]?: TokenValue };

// A leaf: a value plus an optional override per mode. The mode keys are the
// keys of the config's modes, so an unknown one fails to type-check.
export type TokenLeaf<M extends Modes> = { value: TokenValue } & ModeValues<M> & TokenMetadata;

// A group: every key is a token or another group.
export interface TokenTree<M extends Modes> {
  [key: string]: TokenLeaf<M> | TokenTree<M>;
}

export interface Config<M extends Modes = Modes> {
  modes: M;
  tokens: TokenTree<M>;
}
