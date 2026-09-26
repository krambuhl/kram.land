import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { formatContrastFailures } from './contrast.ts';
import { emitCss } from './emit-css.ts';
import { emitJs } from './emit-js.ts';
import { MANIFEST_SCHEMA, MANIFEST_SCHEMA_FILE, emitManifest } from './emit-manifest.ts';
import { emitTypes } from './emit-types.ts';
import type { ResolvedTokens } from './load.ts';

export const DEFAULT_OUT_DIR = 'generated/tokens';

export interface OutputFile {
  path: string;
  contents: string;
}

// The files token-jet generates from one resolved model.
export function generateFiles(resolved: ResolvedTokens): OutputFile[] {
  if (resolved.contrast.some((r) => !r.pass)) {
    throw new Error(formatContrastFailures(resolved.contrast, resolved.config.contrast?.minimum ?? 0));
  }
  return [
    { path: 'tokens.css', contents: emitCss(resolved) },
    { path: 'types.ts', contents: emitTypes(resolved) },
    { path: 'index.ts', contents: emitJs(resolved) },
    { path: 'manifest.json', contents: `${JSON.stringify(emitManifest(resolved), null, 2)}\n` },
    { path: MANIFEST_SCHEMA_FILE, contents: `${JSON.stringify(MANIFEST_SCHEMA, null, 2)}\n` },
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
