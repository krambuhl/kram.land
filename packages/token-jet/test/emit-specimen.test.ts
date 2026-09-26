import { describe, expect, test } from 'vitest';

import { defineConfig } from '../src/core/config.ts';
import { emitSpecimen } from '../src/core/emit-specimen.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);
const html = emitSpecimen(resolved);

describe('emitSpecimen', () => {
  test('matches the snapshot', async () => {
    await expect(html).toMatchFileSnapshot('./__snapshots__/specimen.html');
  });

  test('is one self-contained document with the generated css inlined and no script', () => {
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('--bg-page: var(--bg-page--dark, var(--bg-page--light));');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<link');
  });

  test('every token path appears in every mode section', () => {
    const sections = html.split('<section class="mode"');
    expect(sections).toHaveLength(4);
    for (const section of sections.slice(1)) {
      for (const token of resolved.tokens) expect(section).toContain(`<code>${token.path}</code>`);
    }
  });

  test('a mode section is scoped with the attribute the generated css keys on', () => {
    expect(html).toContain('<section class="mode" data-mode="dark">');
    expect(html).toContain('<section class="mode" data-contrast="on">');
    expect(html).toContain('<section class="mode">');
  });

  test('a preview reads the custom property, so it follows the section it is in', () => {
    expect(html).toContain('<span class="swatch" style="background: var(--bg-page)"></span>');
    expect(html).toContain('<span class="bar" style="width: var(--space-x16)"></span>');
    expect(html).toContain('<span class="sample" style="font-family: var(--family-body)">');
    expect(html).toContain('<span class="sample" style="font-weight: var(--weight-bold)">');
  });

  test('a value shows the literal for the mode and the reference it came through', () => {
    const dark = html.split('<section class="mode" data-mode="dark">')[1];
    expect(dark).toMatch(/<code>bg\.page<\/code>.*?\{gray\.900\}.*?#171717/s);
  });

  test('a deprecated token is marked with its replacement', () => {
    expect(html).toMatch(/<tr class="deprecated">.*?<code>content\.regular<\/code>.*?deprecated: use content\.body/s);
  });

  test('a description is shown', () => {
    expect(html).toContain('The default gap.');
  });

  test('contrast pairs render text on background with the ratio, per mode', () => {
    const c = defineConfig({
      modes: { dark: '(prefers-color-scheme: dark)' },
      tokens: {
        bg: { $group: { type: 'color' }, page: { value: '#ffffff', dark: '#000000' } },
        content: { $group: { type: 'color' }, regular: { value: '#000000', dark: '#ffffff' } },
      },
      contrast: { minimum: 4.5, pairs: [['content.regular', 'bg.page']] },
    });
    const page = emitSpecimen(loadTokens(c));
    expect(page).toContain(
      '<p class="pair" style="color: var(--content-regular); background: var(--bg-page)">content.regular on bg.page <b>21</b></p>'
    );
    expect(page.split('class="pair"')).toHaveLength(3);
  });

  test('a failing pair is marked', () => {
    const c = defineConfig({
      modes: {},
      tokens: {
        bg: { $group: { type: 'color' }, page: { value: '#ffffff' } },
        content: { $group: { type: 'color' }, faint: { value: '#dddddd' } },
      },
      contrast: { minimum: 4.5, pairs: [['content.faint', 'bg.page']] },
    });
    expect(emitSpecimen(loadTokens(c))).toMatch(/<p class="pair fail".*?<b>1\.36 below 4\.5<\/b>/);
  });

  test('escapes html in values and descriptions', () => {
    const c = defineConfig({
      modes: {},
      tokens: { a: { value: 'Inter, "Segoe UI"', type: 'fontFamily', description: 'x < y & z' } },
    });
    const page = emitSpecimen(loadTokens(c));
    expect(page).toContain('Inter, &quot;Segoe UI&quot;');
    expect(page).toContain('x &lt; y &amp; z');
  });
});
