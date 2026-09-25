export { defineConfig } from './core/config.ts';
export type { Config, Modes, TokenLeaf, TokenTree, TokenValue, TypePattern } from './core/config.ts';
export { flatten } from './core/flatten.ts';
export type { Token } from './core/flatten.ts';
export { matchGlob } from './core/glob.ts';
export { cssVariableName, typeName, unionName } from './core/names.ts';
export { checkReferences, emitValue, parseReference, resolveValue } from './core/references.ts';
export { validate } from './core/validate.ts';
export { version } from './version.ts';
