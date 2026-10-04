import { describe, expect, test } from 'vitest';

import { emitSpecimen } from '../src/core/emit-specimen.ts';
import { loadTokens } from '../src/core/load.ts';
import { defineSchema, pattern, schemaToConfig, slots } from '../src/core/schema.ts';
import { config as defineConfig } from './config.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);
const html = emitSpecimen(resolved);

function block(page: string, path: string): string {
  const start = page.indexOf(`data-path="${path}"`);
  expect(start, path).toBeGreaterThan(-1);
  const end = page.indexOf('data-path="', start + 1);
  return page.slice(start, end < 0 ? undefined : end);
}

const kinds = defineConfig({
  modes: {},
  tokens: {
    space: { x4: { value: '4px', type: 'dimension', preview: 'gap' } },
    size: {
      x480: { value: '480px', type: 'dimension', preview: 'bar' },
      x960: { value: '960px', type: 'dimension', preview: 'bar' },
      wide: { value: '60rem', type: 'dimension', preview: 'bar' },
    },
    radius: { sm: { value: '4px', type: 'dimension', preview: 'corner' } },
    text: { md: { value: '1rem', type: 'dimension', preview: 'text' } },
    leading: { body: { value: 1.5, type: 'number', preview: 'paragraph' } },
    fluid: { half: { value: '50%', type: 'dimension' } },
    ease: { fast: { value: '120ms', type: 'duration' } },
  },
});
const kindsPage = emitSpecimen(loadTokens(kinds));

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
    expect(kindsPage).not.toContain('id="contrast"');
  });

  test('a nested group gets a heading with its path', () => {
    const nested = emitSpecimen(
      loadTokens(
        defineConfig({
          modes: {},
          tokens: { font: { size: { body: { md: { value: '1rem', type: 'dimension' } } } } },
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

  test('each preview draws its own way', () => {
    expect(block(kindsPage, 'space.x4')).toContain('<span class="spacing" style="gap: var(--space-x4)">');
    expect(block(kindsPage, 'radius.sm')).toContain('<span class="radius" style="border-radius: var(--radius-sm)">');
    expect(block(kindsPage, 'text.md')).toContain('style="font-size: var(--text-md)"');
    expect(block(kindsPage, 'leading.body')).toContain('style="line-height: var(--leading-body)"');
    expect(block(kindsPage, 'ease.fast')).toContain('style="transition-duration: var(--ease-fast)"');
  });

  test('a sizing or plain dimension bar is drawn at its real width', () => {
    expect(block(kindsPage, 'size.x960')).toContain('<span class="bar" style="width: var(--size-x960)"></span>');
    expect(block(kindsPage, 'size.wide')).toContain('<span class="bar" style="width: var(--size-wide)"></span>');
    expect(block(kindsPage, 'fluid.half')).toContain('<span class="bar" style="width: var(--fluid-half)"></span>');
  });

  test('a bar wider than the window is tagged, with the tag and the viewport line shown by the script', () => {
    expect(block(kindsPage, 'size.x960')).toContain('<span class="wider" hidden>wider than window</span>');
    expect(kindsPage).toContain('<div class="viewport" aria-hidden="true" hidden><span></span></div>');
    expect(kindsPage).toContain("root.style.setProperty('--specimen-viewport', window.innerWidth + 'px');");
  });

  test('colours sit in a swatch grid, lengths on a scrolling canvas, everything else in rows', () => {
    expect(html).toMatch(/<div class="swatches">\n<div class="token" data-path="gray\.50">/);
    expect(html).toMatch(/<div class="rows">\n<div class="token" data-path="space\.x4">/);
    expect(kindsPage).toMatch(
      /<div class="canvas"><div class="canvas-inner">\n<div class="token" data-path="size\.x480">/
    );
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

describe('previews from the schema', () => {
  const previews = defineSchema({
    modes: {},
    shape: {
      gutter: slots(['md'], pattern({ type: 'dimension', preview: 'gap' })),
      measure: slots(['wide'], pattern({ type: 'dimension', preview: 'bar' })),
      corner: slots(['soft'], pattern({ type: 'dimension', preview: 'corner' })),
      ink: slots(['brand'], pattern({ type: 'color', preview: 'swatch' })),
      font: {
        family: pattern({ type: 'fontFamily', preview: 'text' }),
        weight: pattern({ type: 'fontWeight', preview: 'text' }),
        size: pattern({ type: 'dimension', preview: 'text' }),
        leading: pattern({ type: 'number', preview: 'paragraph' }),
      },
    },
  });
  const page = emitSpecimen(
    loadTokens(
      schemaToConfig(
        previews.defineTokens({
          gutter: { md: { value: '16px' } },
          measure: { wide: { value: '960px' } },
          corner: { soft: { value: '8px' } },
          ink: { brand: { value: '#0055ff' } },
          font: {
            family: { value: 'Inter, sans-serif' },
            weight: { value: 600 },
            size: { value: '1.25rem' },
            leading: { value: 1.4 },
          },
        })
      )
    )
  );

  test('a pattern preview picks the drawing whatever the group is called', () => {
    expect(block(page, 'gutter.md')).toContain('<span class="spacing" style="gap: var(--gutter-md)">');
    expect(block(page, 'measure.wide')).toContain('<span class="bar" style="width: var(--measure-wide)"></span>');
    expect(block(page, 'corner.soft')).toContain('<span class="radius" style="border-radius: var(--corner-soft)">');
    expect(block(page, 'ink.brand')).toContain('<span class="swatch" style="background: var(--ink-brand)"></span>');
  });

  test('a text preview draws by type: family, weight or size, and paragraph draws leading', () => {
    expect(block(page, 'font.family')).toContain('style="font-family: var(--font-family)"');
    expect(block(page, 'font.weight')).toContain('style="font-weight: var(--font-weight)"');
    expect(block(page, 'font.size')).toContain('style="font-size: var(--font-size)"');
    expect(block(page, 'font.leading')).toContain('style="line-height: var(--font-leading)"');
  });
});
