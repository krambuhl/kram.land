#!/usr/bin/env node
import { relative, resolve } from 'node:path';

import { DEFAULT_TYPES_FILE, writeTypes } from './vite.ts';

writeTypes(process.cwd())
  .then((scale) => {
    const file = relative(process.cwd(), resolve(DEFAULT_TYPES_FILE));
    console.log(`wrote ${file} with ${scale.names.join(', ')}`);
  })
  .catch((error: unknown) => {
    console.error(`responsive-css-modules: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
