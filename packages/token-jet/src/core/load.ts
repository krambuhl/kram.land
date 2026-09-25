import type { Config, Modes } from './config.ts';
import { flatten } from './flatten.ts';
import type { Token } from './flatten.ts';
import { matchGlob } from './glob.ts';
import { checkTypes } from './metadata.ts';
import { checkTypeNameCollisions, unionName } from './names.ts';
import { checkReferences } from './references.ts';
import { validate } from './validate.ts';

export interface Union {
  name: string;
  source: string;
  paths: string[];
}

export interface ResolvedTokens {
  config: Config<Modes>;
  tokens: Token[];
  // Every group at every depth, and every entry in the types block, as a
  // named union of token paths.
  unions: Union[];
}

// The one entry point every emitter and tool reads tokens through, so they
// cannot disagree about what exists. Runs every check in order.
export function loadTokens(config: Config<Modes>): ResolvedTokens {
  const tokens = flatten(config.tokens);
  validate(config, tokens);
  checkReferences(tokens);
  checkTypes(tokens);

  const paths = tokens.map((t) => t.path);
  const unions: Union[] = [];

  const groups = new Set<string>();
  for (const token of tokens) {
    for (let i = 1; i < token.segments.length; i++) groups.add(token.segments.slice(0, i).join('.'));
  }
  for (const group of groups) {
    unions.push({ name: unionName(group), source: `tokens.${group}`, paths: matchGlob(`${group}.**`, paths) });
  }
  for (const [name, pattern] of Object.entries(config.types ?? {})) {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const matched = [...new Set(patterns.flatMap((p) => matchGlob(p, paths)))];
    unions.push({ name: unionName(name), source: `types.${name}`, paths: matched });
  }
  checkTypeNameCollisions(unions);

  return { config, tokens, unions };
}
