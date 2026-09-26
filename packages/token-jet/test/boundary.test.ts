import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

const packagesDir = resolve(import.meta.dirname, '../..');
const IMPORT = /^(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]/gm;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sources(path) : name.endsWith('.ts') ? [path] : [];
  });
}

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const packages = readdirSync(packagesDir)
  .map((name) => join(packagesDir, name))
  .filter((dir) => statSync(join(dir, 'src'), { throwIfNoEntry: false })?.isDirectory() === true)
  .filter((dir) => statSync(join(dir, 'package.json'), { throwIfNoEntry: false })?.isFile() === true);

describe.each(packages)('%s', (dir) => {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as PackageJson;
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
  const src = join(dir, 'src');

  test('every relative import stays inside src', () => {
    for (const file of sources(src)) {
      for (const [, specifier] of readFileSync(file, 'utf8').matchAll(IMPORT)) {
        if (!specifier.startsWith('.')) continue;
        expect(resolve(dirname(file), specifier), `${file} imports ${specifier}`).toMatch(new RegExp(`^${src}/`));
      }
    }
  });

  test('every bare import is a dependency or a peer, so a published copy resolves it', () => {
    for (const file of sources(src)) {
      for (const [, specifier] of readFileSync(file, 'utf8').matchAll(IMPORT)) {
        if (specifier.startsWith('.') || specifier.startsWith('node:')) continue;
        const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
        expect(declared.has(name), `${file} imports ${specifier}, which ${pkg.name} does not declare`).toBe(true);
      }
    }
  });
});
