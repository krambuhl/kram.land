import postcss from 'postcss';
import { describe, expect, test } from 'vitest';

import { loadTokens } from '../src/core/load.ts';
import tokenJet from '../src/postcss.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);

async function run(css: string, plugin = tokenJet({ tokens: resolved })) {
  const result = await postcss([plugin]).process(css, { from: 'test.css' });
  return { css: result.css, warnings: result.warnings().map((w) => w.text), plugin };
}

describe('postcss plugin', () => {
  test('rewrites token() to var(), with either quote, in shorthand, and more than once per declaration', async () => {
    const { css } = await run(`.a { padding: token('space.x16'); margin: token("space.x4") token('space.x16'); }`);
    expect(css).toBe(`.a { padding: var(--space-x16); margin: var(--space-x4) var(--space-x16); }`);
  });

  test('leaves a declaration without token( untouched', async () => {
    const input = `.a { padding: 16px; color: var(--x); }`;
    expect((await run(input)).css).toBe(input);
  });

  test('an unknown path is an error with the position and the nearest path', async () => {
    await expect(run(`.a {\n  gap: token('space.x17');\n}`)).rejects.toMatchObject({
      name: 'CssSyntaxError',
      line: 2,
      reason: expect.stringMatching(/Unknown token "space\.x17".*Did you mean "space\.x16"/),
    });
  });

  test('a group path is an error that says it is a group', async () => {
    await expect(run(`.a { color: token('bg'); }`)).rejects.toMatchObject({
      reason: expect.stringMatching(/"bg" is a group/),
    });
  });

  test('a deprecated path warns with the replacement and still rewrites', async () => {
    const { css, warnings } = await run(`.a { color: token('content.regular'); }`);
    expect(css).toBe(`.a { color: var(--content-regular); }`);
    expect(warnings).toEqual([expect.stringMatching(/"content\.regular" is deprecated.*use content\.body/)]);
  });

  test('records every rewritten path in a used set', async () => {
    const plugin = tokenJet({ tokens: resolved });
    await run(`.a { padding: token('space.x16'); }`, plugin);
    await run(`.b { color: token('bg.page'); gap: token('space.x16'); }`, plugin);
    expect([...plugin.used].sort()).toEqual(['bg.page', 'space.x16']);
  });

  test('a token( inside a comment or a string is left alone', async () => {
    const input = `/* token('space.x16') */ .a { content: "token('space.x16')"; }`;
    const { css } = await run(input);
    expect(css).toBe(input);
  });
});
