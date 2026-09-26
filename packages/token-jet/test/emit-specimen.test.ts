import { describe, expect, test } from 'vitest';

import { defineConfig } from '../src/core/config.ts';
import { emitSpecimen } from '../src/core/emit-specimen.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);
const html = emitSpecimen(resolved);

function block(page: string, path: string): string {
  const start = page.indexOf(`data-path="${path}"`);
  expect(start, path).toBeGreaterThan(-1);
  const end = page.indexOf('data-path="', start + 1);
  return page.slice(start, end < 0 ? undefined : end);
}

const roles = defineConfig({
  modes: {},
  tokens: {
    space: { $group: { type: 'dimension', role: 'spacing' }, x4: { value: '4px' } },
    size: {
      $group: { type: 'dimension', role: 'sizing' },
      x480: { value: '480px' },
      x960: { value: '960px' },
      wide: { value: '60rem' },
    },
    radius: { $group: { type: 'dimension', role: 'radius' }, sm: { value: '4px' } },
    text: { $group: { type: 'dimension', role: 'fontSize' }, md: { value: '1rem' } },
    leading: { $group: { type: 'number', role: 'lineHeight' }, body: { value: 1.5 } },
    fluid: { $group: { type: 'dimension' }, half: { value: '50%' } },
    ease: { fast: { value: '120ms', type: 'duration' } },
  },
});
const rolesPage = emitSpecimen(loadTokens(roles));

describe('emitSpecimen', () => {
  test('matches the snapshot', async () => {
    await expect(html).toMatchFileSnapshot('./__snapshots__/specimen.html');
  });

  test('is one self-contained document with the generated css and its script inlined', () => {
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('--bg-page: var(--bg-page--dark, var(--bg-page--light));');
    expect(html).not.toContain('<link');
    expect(html).not.toMatch(/<script [^>]*src=/);
    expect(html.match(/<script>/g)).toHaveLength(1);
  });

  test('lists every token once, in config order', () => {
    const paths = [...html.matchAll(/data-path="([^"]+)"/g)].map((m) => m[1]);
    expect(paths).toEqual(resolved.tokens.map((t) => t.path));
  });

  test('a section and a nav link per top-level group, with its token count, then contrast', () => {
    const sections = [...html.matchAll(/<section class="group" id="([^"]+)">/g)].map((m) => m[1]);
    expect(sections).toEqual([
      'group-space',
      'group-weight',
      'group-family',
      'group-ratio',
      'group-gray',
      'group-bg',
      'group-content',
    ]);
    expect(html).toContain('<a href="#group-space">space<span>2</span></a>');
    expect(rolesPage).not.toContain('id="contrast"');
  });

  test('a nested group gets a heading with its path', () => {
    const nested = emitSpecimen(
      loadTokens(
        defineConfig({
          modes: {},
          tokens: { font: { $group: { type: 'dimension' }, size: { body: { md: { value: '1rem' } } } } },
        })
      )
    );
    expect(nested).toContain('<h3>font.size.body</h3>');
  });

  test('a preview reads the custom property, so it follows the mode in force', () => {
    expect(block(html, 'bg.page')).toContain('<span class="swatch" style="background: var(--bg-page)"></span>');
    expect(block(html, 'family.body')).toContain('style="font-family: var(--family-body)"');
    expect(block(html, 'weight.bold')).toContain('style="font-weight: var(--weight-bold)"');
  });

  test('each role gets its own preview', () => {
    expect(block(rolesPage, 'space.x4')).toContain('<span class="spacing" style="gap: var(--space-x4)">');
    expect(block(rolesPage, 'radius.sm')).toContain('<span class="radius" style="border-radius: var(--radius-sm)">');
    expect(block(rolesPage, 'text.md')).toContain('style="font-size: var(--text-md)"');
    expect(block(rolesPage, 'leading.body')).toContain('style="line-height: var(--leading-body)"');
    expect(block(rolesPage, 'ease.fast')).toContain('style="transition-duration: var(--ease-fast)"');
  });

  test('a sizing bar is scaled to the largest token in its group, rem counted at 16px', () => {
    expect(block(rolesPage, 'size.x480')).toContain('style="width: 50%"');
    expect(block(rolesPage, 'size.x960')).toContain('style="width: 100%"');
    expect(block(rolesPage, 'size.wide')).toContain('style="width: 100%"');
  });

  test('a dimension it cannot measure falls back to the custom property, capped at the track', () => {
    expect(block(rolesPage, 'fluid.half')).toContain('style="width: min(100%, var(--fluid-half))"');
  });

  test('colours sit in a swatch grid and everything else in rows', () => {
    expect(html).toMatch(/<div class="swatches">\n<div class="token" data-path="gray\.50">/);
    expect(html).toMatch(/<div class="rows">\n<div class="token" data-path="space\.x4">/);
  });

  test('a value shows the literal per mode and the reference it came through', () => {
    const page = block(html, 'bg.page');
    expect(page).toContain('<code>{gray.50}</code> → <code class="literal">#fafafa</code>');
    expect(page).toContain(
      '<span class="mode">dark</span><code>{gray.900}</code> → <code class="literal">#171717</code>'
    );
  });

  test('a token that references a mode token shows the mode value it resolves to', () => {
    expect(block(html, 'content.body')).toMatch(/<span class="mode">dark<\/span>.*#eeeeee/);
  });

  test('a path is a button that copies the token() call', () => {
    expect(block(html, 'space.x16')).toContain(
      `<button type="button" class="path" data-copy="space.x16" title="copy token('space.x16')">space.x16</button>`
    );
    expect(html).toContain('navigator.clipboard.writeText');
  });

  test('the colour scheme mode switches auto, light or dark; any other mode auto, on or off', () => {
    expect(html).toMatch(
      /<div class="mode-control" role="group" aria-label="scheme" data-attribute="mode"><span>scheme<\/span><button[^>]*data-value="auto" aria-pressed="true">auto<\/button><button[^>]*data-value="light"[^>]*>light<\/button><button[^>]*data-value="dark"[^>]*>dark<\/button><\/div>/
    );
    expect(html).toMatch(
      /data-attribute="contrast"><span>contrast<\/span><button[^>]*data-value="auto"[^>]*>auto<\/button><button[^>]*data-value="on"[^>]*>on<\/button><button[^>]*data-value="off"[^>]*>off<\/button>/
    );
  });

  test('the filter and mode controls stay hidden until the script runs', () => {
    expect(html).toContain('<div class="controls" hidden>');
    expect(html).toContain("document.querySelector('.controls').hidden = false;");
  });

  test('a deprecated token is marked with its replacement', () => {
    const regular = block(html, 'content.regular');
    expect(html).toContain('<div class="token deprecated" data-path="content.regular">');
    expect(regular).toContain('<div class="note">deprecated: use content.body</div>');
  });

  test('a description is shown', () => {
    expect(block(html, 'space.x16')).toContain('<div class="description">The default gap.</div>');
  });

  test('a contrast pair is one card in its own colours with a ratio per mode', () => {
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
      '<div class="pair"><p style="color: var(--content-regular); background: var(--bg-page)">content.regular on bg.page</p><ul><li>base <b>21</b></li><li>dark <b>21</b></li></ul></div>'
    );
    expect(page).toContain('<a href="#contrast">contrast</a>');
  });

  test('a failing pair is marked on the card and on the mode that fails', () => {
    const c = defineConfig({
      modes: {},
      tokens: {
        bg: { $group: { type: 'color' }, page: { value: '#ffffff' } },
        content: { $group: { type: 'color' }, faint: { value: '#dddddd' } },
      },
      contrast: { minimum: 4.5, pairs: [['content.faint', 'bg.page']] },
    });
    const page = emitSpecimen(loadTokens(c));
    expect(page).toContain('<div class="pair fail">');
    expect(page).toContain('<li class="fail">base <b>1.36 below 4.5</b></li>');
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
