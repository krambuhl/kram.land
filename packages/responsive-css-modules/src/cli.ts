#!/usr/bin/env node
import { relative, resolve } from 'node:path';

import { fromTokenJet } from './token-jet.ts';
import { DEFAULT_TYPES_FILE, writeTypes } from './vite.ts';

async function main(argv: readonly string[]): Promise<string> {
  if (!argv.includes('--token-jet')) {
    throw new Error('pass --token-jet [--tag <tag>] to read the breakpoints from token-jet tokens.');
  }
  const tagFlag = argv.indexOf('--tag');
  const tag = tagFlag >= 0 ? argv[tagFlag + 1] : undefined;
  if (tagFlag >= 0 && tag === undefined) throw new Error('--tag needs a tag.');
  const scale = await writeTypes(process.cwd(), { breakpoints: fromTokenJet({ tag }) });
  return `wrote ${relative(process.cwd(), resolve(DEFAULT_TYPES_FILE))} with ${scale.names.join(', ')}`;
}

main(process.argv.slice(2))
  .then((message) => console.log(message))
  .catch((error: unknown) => {
    console.error(`responsive-css-modules: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
