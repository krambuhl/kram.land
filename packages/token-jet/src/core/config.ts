export type Modes = Record<string, string>;

export type TokenValue = string | number;

// A leaf: a value plus an optional override per mode. The mode keys are the
// keys of the config's modes, so an unknown one fails to type-check.
export type TokenLeaf<M extends Modes> = { value: TokenValue } & { [K in keyof M]?: TokenValue };

export type TokenTree<M extends Modes> = {
  [key: string]: TokenLeaf<M> | TokenTree<M>;
};

// A union in the types block: one glob or a list of globs.
export type TypePattern = string | string[];

export interface Config<M extends Modes = Modes> {
  modes: M;
  tokens: TokenTree<M>;
  types?: Record<string, TypePattern>;
}

export function defineConfig<const M extends Modes>(config: Config<M>): Config<M> {
  return config;
}
