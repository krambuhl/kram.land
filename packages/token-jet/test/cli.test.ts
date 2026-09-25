import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeAll, describe, expect, test } from 'vitest';

const cli = join(import.meta.dirname, '../src/cli.ts');
const fixture = readFileSync(join(import.meta.dirname, 'fixtures/emit.config.ts'), 'utf8')
  // the fixture imports the package by relative path; a project imports it by name
  .replace("from '../../src/index.ts'", "from 'token-jet'");

// Runs the cli in a fresh project directory and returns stdout. A non-zero
// exit throws with stderr in the message.
function run(cwd: string, ...args: string[]): string {
  try {
    return execFileSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const e = error as { status: number; stderr: string };
    throw new Error(`exit ${e.status}: ${e.stderr}`, { cause: error });
  }
}

function project(config = fixture): string {
  const dir = mkdtempSync(join(tmpdir(), 'token-jet-'));
  writeFileSync(join(dir, 'tokens.config.ts'), config);
  // resolve 'token-jet' to this package from inside the temp project
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', type: 'module' }));
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(join(import.meta.dirname, '..'), join(dir, 'node_modules/token-jet'));
  return dir;
}

describe('token-jet generate', () => {
  let dir: string;
  beforeAll(() => {
    dir = project();
  });

  test('writes tokens.css, types.ts and index.ts to generated/tokens', () => {
    const out = run(dir, 'generate');
    for (const file of ['tokens.css', 'types.ts', 'index.ts']) {
      expect(existsSync(join(dir, 'generated/tokens', file)), file).toBe(true);
    }
    expect(out).toMatch(/3 files/);
  });

  test('the written css is the emitter output', () => {
    const css = readFileSync(join(dir, 'generated/tokens/tokens.css'), 'utf8');
    expect(css).toContain('--bg-page: var(--bg-page--dark, var(--bg-page--light));');
  });

  test('--out changes the directory', () => {
    run(dir, 'generate', '--out', 'build/t');
    expect(existsSync(join(dir, 'build/t/tokens.css'))).toBe(true);
  });

  test('a config error exits 1 with the message', () => {
    const bad = project(fixture.replace("dark: '{gray.900}'", "dark: '{gray.999}'"));
    expect(() => run(bad, 'generate')).toThrow(/exit 1.*gray\.999.*does not exist/s);
  });

  test('a missing config exits 1 and names the file it looked for', () => {
    const empty = mkdtempSync(join(tmpdir(), 'token-jet-empty-'));
    expect(() => run(empty, 'generate')).toThrow(/exit 1.*tokens\.config\.ts/s);
  });
});

describe('token-jet usage and rename', () => {
  let dir: string;
  beforeAll(() => {
    dir = project();
    writeFileSync(join(dir, 'a.css'), ".a { gap: token('space.x16'); color: token('content.regular'); }\n");
    writeFileSync(join(dir, 'b.tsx'), "export const p = token('space.x16');\n");
  });

  test('usage lists every call by path with its location, and flags deprecated ones', () => {
    const out = run(dir, 'usage', 'a.css', 'b.tsx');
    expect(out).toMatch(/space\.x16\s+2/);
    expect(out).toMatch(/content\.regular\s+1.*deprecated.*use content\.body/);
    expect(out).toContain('a.css:1:');
  });

  test('rename rewrites the calls and the config, then reports the count', () => {
    const out = run(dir, 'rename', 'content.regular', 'content.text', 'a.css', 'b.tsx');
    expect(out).toMatch(/1 files/);
    expect(readFileSync(join(dir, 'a.css'), 'utf8')).toContain("token('content.text')");
    expect(readFileSync(join(dir, 'b.tsx'), 'utf8')).not.toContain('content.text');
    const config = readFileSync(join(dir, 'tokens.config.ts'), 'utf8');
    expect(config).toMatch(/text: \{ value: '#111111'/);
    expect(config).not.toMatch(/\n\s+regular: \{/);
    // the reference from content.body moved with the key, so the config still loads
    expect(config).toContain("body: { value: '{content.text}' }");
    expect(() => run(dir, 'generate')).not.toThrow();
  });

  test('rename to an existing path is an error', () => {
    expect(() => run(dir, 'rename', 'bg.page', 'bg.card')).toThrow(/exit 1.*bg\.card.*exists/s);
  });

  test('an unknown command exits 1 with the command list', () => {
    expect(() => run(dir, 'frobnicate')).toThrow(/exit 1.*generate.*usage.*rename/s);
  });
});
