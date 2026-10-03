import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Config, Modes } from './config.ts';
import { checkContrast } from './contrast.ts';
import type { ContrastResult } from './contrast.ts';
import { flatten } from './flatten.ts';
import type { Token } from './flatten.ts';
import { matchGlob } from './glob.ts';
import { checkRoles, checkTypes } from './metadata.ts';
import { checkTypeNameCollisions, unionName } from './names.ts';
import { checkReferences } from './references.ts';
import { isDefinedTokens, schemaToConfig } from './schema.ts';
import { validate } from './validate.ts';

const CONFIG_FILE = 'tokens.config.ts';
const SCHEMA_TOKENS_FILE = 'tokens/tokens.ts';

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
  contrast: ContrastResult[];
}

// The one entry point every emitter and tool reads tokens through, so they
// cannot disagree about what exists. Runs every check in order.
export function loadTokens(config: Config<Modes>): ResolvedTokens {
  const tokens = flatten(config.tokens);
  validate(config, tokens);
  checkReferences(tokens);
  checkTypes(tokens);
  checkRoles(tokens);

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

  return { config, tokens, unions, contrast: checkContrast(config, tokens) };
}

// Imports tokens.config.ts when it is there, else tokens/tokens.ts; a schema
// export is converted to a config. Node runs the TypeScript directly, with
// no build step between the config and the generator.
export async function loadConfigFile(dir: string): Promise<{ file: string; config: Config<Modes> }> {
  const legacy = resolve(dir, CONFIG_FILE);
  const schemaTokens = resolve(dir, SCHEMA_TOKENS_FILE);
  const file = existsSync(legacy) ? legacy : schemaTokens;
  if (!existsSync(file)) {
    throw new Error(`No ${CONFIG_FILE} or ${SCHEMA_TOKENS_FILE} found in ${dir}.`);
  }
  // Node caches a module by its url for the life of the process. A version
  // query makes every load a fresh import, so a long-running caller such as
  // the vite adapter sees the config as it is on disk now.
  const url = `${pathToFileURL(file).href}?v=${Date.now()}`;
  const module = (await import(url)) as { default?: unknown };
  if (module.default === undefined) {
    throw new Error(`${relative(dir, file)} must export the config as its default export.`);
  }
  if (isDefinedTokens(module.default)) return { file, config: schemaToConfig(module.default) };
  return { file, config: module.default as Config<Modes> };
}
