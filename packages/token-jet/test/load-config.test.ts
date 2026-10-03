import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { loadConfigFile, loadTokens } from '../src/core/load.ts';

const api = pathToFileURL(join(import.meta.dirname, '../src/index.ts')).href;

const SCHEMA_TOKENS = `import { defineSchema, pattern, slots } from '${api}';
const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const schema = defineSchema({ modes: {}, shape: { space: slots(['x4', 'x8'], spacing) } });
export default schema.defineTokens({ space: { x4: { value: '4px' }, x8: { value: '8px' } } });
`;

const LEGACY = `export default { modes: {}, tokens: { space: { $group: { type: 'dimension' }, x16: { value: '16px' } } } };
`;

function workspace(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'token-jet-load-'));
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), contents);
  }
  return dir;
}

describe('loadConfigFile', () => {
  test('reads tokens/tokens.ts and turns a schema-defined tree into a config', async () => {
    const dir = workspace({ 'tokens/tokens.ts': SCHEMA_TOKENS });
    const { file, config } = await loadConfigFile(dir);
    expect(file).toBe(join(dir, 'tokens/tokens.ts'));
    const space = loadTokens(config).tokens.map((t) => [t.path, t.tags, t.preview]);
    expect(space).toEqual([
      ['space.x4', ['spacing'], 'gap'],
      ['space.x8', ['spacing'], 'gap'],
    ]);
  });

  test('reads tokens.config.ts when it is there, even next to tokens/tokens.ts', async () => {
    const dir = workspace({ 'tokens.config.ts': LEGACY, 'tokens/tokens.ts': SCHEMA_TOKENS });
    const { file, config } = await loadConfigFile(dir);
    expect(file).toBe(join(dir, 'tokens.config.ts'));
    expect(loadTokens(config).tokens.map((t) => t.path)).toEqual(['space.x16']);
  });

  test('names both files when neither is there', async () => {
    const dir = workspace({});
    await expect(loadConfigFile(dir)).rejects.toThrow('No tokens.config.ts or tokens/tokens.ts found in');
  });

  test('names the file that has no default export', async () => {
    const dir = workspace({ 'tokens/tokens.ts': 'export const nothing = 1;\n' });
    await expect(loadConfigFile(dir)).rejects.toThrow('tokens/tokens.ts must export the config as its default export.');
  });
});
