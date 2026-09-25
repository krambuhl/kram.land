import { describe, expect, test } from 'vitest';

import { emitCss } from '../src/core/emit-css.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);

describe('emitCss', () => {
  const css = emitCss(resolved);

  test('matches the snapshot', async () => {
    await expect(css).toMatchFileSnapshot('./__snapshots__/tokens.css');
  });

  test('a token with no mode values is a single declaration on :where(html)', () => {
    expect(css).toMatch(/:where\(html\) \{[^}]*--space-x16: 16px;/);
    expect(css).not.toContain('--space-x16--');
  });

  test('a scheme-mode token gets a light slot, a dark slot under four scopes, and a chain', () => {
    expect(css).toContain('--bg-page--light: var(--gray-50);');
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\) \{\s*:where\(html\) \{[^}]*--bg-page--dark: var\(--gray-900\);/
    );
    expect(css).toMatch(/\[data-mode='dark'\] \{[^}]*--bg-page--dark: var\(--gray-900\);/);
    expect(css).toMatch(/\[data-mode='light'\] \{[^}]*--bg-page--dark: initial;/);
    expect(css).toMatch(/\[data-mode='auto'\] \{[^}]*--bg-page--dark: initial;/);
    expect(css).toMatch(/\[data-mode='inverted'\] \{[^}]*--bg-page--dark: var\(--gray-900\);/);
    expect(css).toContain('--bg-page: var(--bg-page--dark, var(--bg-page--light));');
  });

  test('a non-scheme mode gets an os media block and on/off scopes, no inverted', () => {
    expect(css).toMatch(/@media \(prefers-contrast: more\) \{\s*:where\(html\) \{[^}]*--bg-card--contrast: #000000;/);
    expect(css).toMatch(/\[data-contrast='on'\] \{[^}]*--bg-card--contrast: #000000;/);
    expect(css).toMatch(/\[data-contrast='off'\] \{[^}]*--bg-card--contrast: initial;/);
    expect(css).not.toContain("[data-contrast='inverted']");
  });

  test('a token with two modes chains the slots in mode order, base last', () => {
    expect(css).toContain('--bg-card: var(--bg-card--dark, var(--bg-card--contrast, var(--bg-card--light)));');
  });

  test('every token gets an @property before the base block', () => {
    const at = css.indexOf('@property');
    const base = css.indexOf(':where(html)');
    expect(at).toBeGreaterThanOrEqual(0);
    expect(at).toBeLessThan(base);
    expect(css).toContain(
      "@property --space-x16 {\n  syntax: '<length>';\n  inherits: true;\n  initial-value: 16px;\n}"
    );
    expect(css).toContain(
      "@property --bg-page {\n  syntax: '<color>';\n  inherits: true;\n  initial-value: #fafafa;\n}"
    );
    expect(css).toContain("@property --weight-bold {\n  syntax: '<integer>';");
    expect(css).toContain("@property --ratio-golden {\n  syntax: '<number>';\n  inherits: false;");
    expect(css).toContain("@property --family-body {\n  syntax: '*';\n  inherits: true;\n}");
  });

  test('a reference token gets the resolved literal as its initial-value', () => {
    expect(css).toContain(
      "@property --content-body {\n  syntax: '<color>';\n  inherits: true;\n  initial-value: #111111;\n}"
    );
  });

  test('prune keeps used tokens and what they reference, drops the rest', () => {
    const pruned = emitCss(resolved, { prune: true, used: new Set(['bg.page']) });
    expect(pruned).toContain('--bg-page');
    expect(pruned).toContain('--gray-50');
    expect(pruned).toContain('--gray-900');
    expect(pruned).not.toContain('--space-x16');
    expect(pruned).not.toContain('--bg-card');
  });
});
