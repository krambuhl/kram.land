import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { emitCss } from './emit-css.ts';
import { emitJs } from './emit-js.ts';
import { emitTypes } from './emit-types.ts';
import type { ResolvedTokens } from './load.ts';

export const DEFAULT_OUT_DIR = 'generated/tokens';

export interface OutputFile {
  path: string;
  contents: string;
}

// The three files token-jet generates from one resolved model.
export function generateFiles(resolved: ResolvedTokens): OutputFile[] {
  return [
    { path: 'tokens.css', contents: emitCss(resolved) },
    { path: 'types.ts', contents: emitTypes(resolved) },
    { path: 'index.ts', contents: emitJs(resolved) },
  ];
}

export function writeFiles(dir: string, files: readonly OutputFile[]): string[] {
  mkdirSync(dir, { recursive: true });
  return files.map((file) => {
    const target = join(dir, file.path);
    writeFileSync(target, file.contents);
    return target;
  });
}
