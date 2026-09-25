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

describe('token-jet check', () => {
  const withPairs = (pairs: string) =>
    fixture.replace('  types: {', `  contrast: { minimum: 4.5, pairs: [${pairs}] },\n  types: {`);

  test('prints every pair in every mode with its ratio', () => {
    const out = run(project(withPairs("['content.body', 'bg.page']")), 'check');
    expect(out).toMatch(/content\.body on bg\.page in base: 18\.09 ok/);
    expect(out).toMatch(/content\.body on bg\.page in dark: 15\.45 ok/);
    expect(out).toMatch(/content\.body on bg\.page in contrast: 18\.09 ok/);
  });

  test('a failing pair exits 1 with the mode and ratio, and generate refuses too', () => {
    const dir = project(withPairs("['content.body', 'bg.page'], ['gray.900', 'bg.card']"));
    expect(() => run(dir, 'check')).toThrow(/exit 1.*gray\.900 on bg\.card in dark: 1\.03 below 4\.5/s);
    expect(() => run(dir, 'generate')).toThrow(/exit 1.*Contrast check failed for 2 of 6 checks/s);
    expect(existsSync(join(dir, 'generated'))).toBe(false);
  });

  test('says so when the config has no pairs', () => {
    expect(run(project(), 'check')).toMatch(/no contrast pairs/);
  });
});

describe('token-jet export', () => {
  test('--dtcg prints the json, and --out writes it', () => {
    const dir = project();
    const out = run(dir, 'export', '--dtcg');
    expect(JSON.parse(out)).toMatchObject({ space: { $type: 'dimension', x4: { $value: { value: 4, unit: 'px' } } } });
    expect(run(dir, 'export', '--dtcg', '--out', 'tokens.dtcg.json')).toMatch(/wrote tokens\.dtcg\.json/);
    expect(JSON.parse(readFileSync(join(dir, 'tokens.dtcg.json'), 'utf8'))).toEqual(JSON.parse(out));
  });

  test('without --dtcg it is an error', () => {
    expect(() => run(project(), 'export')).toThrow(/exit 1.*--dtcg/s);
  });

  test('import --dtcg turns the exported file back into a config that generates the same css', () => {
    const dir = project();
    run(dir, 'export', '--dtcg', '--out', 'tokens.dtcg.json');
    const css = () => {
      run(dir, 'generate');
      return readFileSync(join(dir, 'generated/tokens/tokens.css'), 'utf8');
    };
    const before = css();
    expect(run(dir, 'import', '--dtcg', 'tokens.dtcg.json', '--out', 'tokens.config.ts')).toMatch(
      /wrote tokens\.config\.ts/
    );
    expect(readFileSync(join(dir, 'tokens.config.ts'), 'utf8')).toMatch(/^import \{ defineConfig \} from 'token-jet';/);
    expect(css()).toBe(before);
  });
});

describe('token-jet diff', () => {
  test('an identical export exits 0, and one with a missing, an extra and a changed token exits 1 listing all three', () => {
    const dir = project();
    run(dir, 'export', '--dtcg', '--out', 'export.json');
    expect(run(dir, 'diff', 'export.json')).toMatch(/export\.json matches the config/);
    const file = JSON.parse(readFileSync(join(dir, 'export.json'), 'utf8')) as Record<string, Record<string, unknown>>;
    delete file.space.x4;
    file.space.x24 = { $value: { value: 24, unit: 'px' } };
    file.gray[900] = { $value: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' } };
    writeFileSync(join(dir, 'export.json'), JSON.stringify(file));
    expect(() => run(dir, 'diff', 'export.json')).toThrow(
      /exit 1.*space\.x4: missing from the export\n.*space\.x24: in the export only\n.*gray\.900 in base: #171717 here, #000000 in the export/s
    );
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

  test('rename to a path already in the config rewrites the calls and leaves the config alone', () => {
    writeFileSync(join(dir, 'c.css'), ".c { background: token('bg.page'); }\n");
    const before = readFileSync(join(dir, 'tokens.config.ts'), 'utf8');
    const out = run(dir, 'rename', 'bg.page', 'bg.card', 'c.css');
    expect(out).toMatch(/1 files.*bg\.card is already in the config.*bg\.page is left/);
    expect(readFileSync(join(dir, 'c.css'), 'utf8')).toContain("token('bg.card')");
    expect(readFileSync(join(dir, 'tokens.config.ts'), 'utf8')).toBe(before);
  });

  test('rename from a path not in the config is an error', () => {
    expect(() => run(dir, 'rename', 'bg.nope', 'bg.card')).toThrow(/exit 1.*bg\.nope.*does not exist/s);
  });

  test('an unknown command exits 1 with the command list', () => {
    expect(() => run(dir, 'frobnicate')).toThrow(/exit 1.*generate.*usage.*rename/s);
  });
});
