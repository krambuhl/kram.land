import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';

import type { Config, Modes } from './config.ts';
import { flatten } from './flatten.ts';
import type { Token } from './flatten.ts';
import { matchGlob } from './glob.ts';
import { checkTypes } from './metadata.ts';
import { checkTypeNameCollisions, tagUnionName, unionName } from './names.ts';
import { checkReferences } from './references.ts';
import { isDefinedTokens, schemaToConfig } from './schema.ts';
import { validate } from './validate.ts';

const TOKENS_FILE = 'tokens/tokens.ts';
const TAG = /^[A-Za-z][A-Za-z0-9-]*$/;

export interface Union {
  name: string;
  source: string;
  paths: string[];
}

export interface ResolvedTokens {
  config: Config<Modes>;
  tokens: Token[];
  // Every group at every depth, and every tag, as a named union of token paths.
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
  const tagged = new Map<string, string[]>();
  for (const token of tokens) {
    for (const tag of token.tags ?? []) {
      if (!TAG.test(tag)) {
        throw new Error(
          `Token "${token.path}" has the tag "${tag}"; a tag is letters, digits and dashes, starting with a letter.`
        );
      }
      tagged.set(tag, [...(tagged.get(tag) ?? []), token.path]);
    }
  }
  for (const [tag, members] of tagged) {
    unions.push({ name: tagUnionName(tag), source: `tags.${tag}`, paths: members });
  }
  checkTypeNameCollisions(unions);

  return { config, tokens, unions };
}

// Imports the file in a worker, which starts with an empty module cache, so a
// reload sees edits to the modules it imports too. The default export comes
// back as JSON, which a config is.
function importFresh(file: string): Promise<unknown> {
  const source = [
    "import { parentPort } from 'node:worker_threads';",
    `const module = await import(${JSON.stringify(pathToFileURL(file).href)});`,
    'parentPort.postMessage(module.default === undefined ? undefined : JSON.stringify(module.default));',
  ].join('\n');
  return new Promise((resolvePromise, reject) => {
    const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(source)}`));
    worker.once('message', (message: string | undefined) => {
      resolvePromise(message === undefined ? undefined : JSON.parse(message));
      void worker.terminate();
    });
    worker.once('error', reject);
  });
}

// Imports tokens/tokens.ts and converts its default export to a config. Node
// runs the TypeScript directly, with no build step before the generator.
export async function loadConfigFile(dir: string): Promise<{ file: string; watch: string; config: Config<Modes> }> {
  const file = resolve(dir, TOKENS_FILE);
  if (!existsSync(file)) throw new Error(`No ${TOKENS_FILE} found in ${dir}.`);
  const exported = await importFresh(file);
  if (!isDefinedTokens(exported)) {
    throw new Error(`${TOKENS_FILE} must export schema.defineTokens(...) as its default export.`);
  }
  return { file, watch: dirname(file), config: schemaToConfig(exported) };
}
