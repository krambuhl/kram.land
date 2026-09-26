import type { TokenRole, TokenType } from './config.ts';
import type { ContrastResult } from './contrast.ts';
import { emitCss } from './emit-css.ts';
import type { Token } from './flatten.ts';
import type { ResolvedTokens } from './load.ts';
import { inferType } from './metadata.ts';
import { cssVariableReference } from './names.ts';
import { parseReference, resolveValue } from './references.ts';

const SAMPLE = 'Sphinx of black quartz, judge my vow';
const PARAGRAPH = 'Line height sets the space between the lines of a paragraph, like the lines of this one.';

const PAGE_CSS = `
:root {
  color-scheme: light dark;
  --specimen-bg: light-dark(#f6f6f4, #121212);
  --specimen-panel: light-dark(#ffffff, #1b1b1b);
  --specimen-text: light-dark(#1d1d1b, #ececea);
  --specimen-muted: light-dark(#6b6b66, #9b9b96);
  --specimen-line: light-dark(#e4e4df, #2d2d2b);
  --specimen-accent: light-dark(#2f5bea, #86a2ff);
  --specimen-warn: light-dark(#a15c07, #f0b34a);
  --specimen-fail: light-dark(#c62828, #ff8080);
  --specimen-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}
:root[data-mode='dark'] { color-scheme: dark; }
:root[data-mode='light'] { color-scheme: light; }
[hidden] { display: none !important; }
* { box-sizing: border-box; }
body { margin: 0; font: 14px/1.5 system-ui, sans-serif; color: var(--specimen-text); background: var(--specimen-bg); }
code { font: 12px/1.5 var(--specimen-mono); }
.layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 100vh; }
nav { position: sticky; top: 0; align-self: start; max-height: 100vh; overflow: auto; padding: 20px 12px; border-right: 1px solid var(--specimen-line); }
nav .title { font: 600 15px/1.4 system-ui, sans-serif; padding: 0 8px 12px; }
nav a { display: flex; justify-content: space-between; gap: 8px; padding: 4px 8px; border-radius: 6px; color: inherit; text-decoration: none; font: 13px/1.5 var(--specimen-mono); }
nav a:hover { background: var(--specimen-panel); }
nav a span { color: var(--specimen-muted); }
header { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 32px; background: var(--specimen-bg); border-bottom: 1px solid var(--specimen-line); }
header h1 { font-size: 15px; margin: 0; font-weight: 600; }
header .count { color: var(--specimen-muted); }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-left: auto; }
.filter { font: inherit; width: 200px; padding: 5px 10px; color: inherit; background: var(--specimen-panel); border: 1px solid var(--specimen-line); border-radius: 6px; }
.mode-control { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border: 1px solid var(--specimen-line); border-radius: 6px; }
.mode-control > span { padding: 0 6px; color: var(--specimen-muted); font: 12px/1.5 var(--specimen-mono); }
.mode-control button { font: 12px/1.5 system-ui, sans-serif; padding: 3px 8px; color: var(--specimen-muted); background: none; border: 0; border-radius: 4px; cursor: pointer; }
.mode-control button[aria-pressed='true'] { color: var(--specimen-text); background: var(--specimen-panel); box-shadow: 0 0 0 1px var(--specimen-line); }
main { padding: 24px 32px 96px; max-width: 1120px; }
.group { margin-bottom: 48px; scroll-margin-top: 72px; }
.group > h2 { margin: 0 0 16px; font: 600 20px/1.3 var(--specimen-mono); }
.group > h2 span { color: var(--specimen-muted); font-weight: 400; font-size: 13px; margin-left: 8px; }
.subgroup { margin-bottom: 24px; }
.subgroup > h3 { margin: 0 0 8px; font: 600 12px/1.5 var(--specimen-mono); color: var(--specimen-muted); }
.rows { background: var(--specimen-panel); border: 1px solid var(--specimen-line); border-radius: 10px; }
.rows .token { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(0, 2fr) minmax(160px, 1fr); gap: 16px; align-items: center; padding: 12px 16px; border-top: 1px solid var(--specimen-line); }
.rows .token:first-child { border-top: 0; }
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.swatches .token { overflow: hidden; background: var(--specimen-panel); border: 1px solid var(--specimen-line); border-radius: 10px; }
.swatches .swatch { display: block; height: 72px; border-bottom: 1px solid var(--specimen-line); }
.swatches .meta { padding: 10px 12px; }
.path { padding: 0; font: 13px/1.4 var(--specimen-mono); color: inherit; text-align: left; background: none; border: 0; cursor: copy; }
.path:hover { color: var(--specimen-accent); text-decoration: underline; }
.description { margin-top: 2px; font-size: 12px; color: var(--specimen-muted); }
.deprecated .path { text-decoration: line-through; }
.note { margin-top: 2px; font-size: 12px; color: var(--specimen-warn); }
.values { font-size: 12px; color: var(--specimen-muted); }
.values > div { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.values .mode { margin-right: 4px; }
.values .literal { color: var(--specimen-text); }
.spacing { display: inline-flex; }
.spacing i { width: 16px; height: 16px; background: var(--specimen-accent); border-radius: 3px; }
.radius { display: block; width: 96px; height: 56px; border: 2px solid var(--specimen-accent); }
.bar { display: block; height: 8px; max-width: 100%; background: var(--specimen-accent); border-radius: 4px; }
.canvas { overflow-x: auto; padding: 16px; background: var(--specimen-panel); border: 1px solid var(--specimen-line); border-radius: 10px; }
.canvas-inner { position: relative; width: max-content; min-width: 100%; }
.canvas .token { padding: 6px 0; }
.canvas .token + .token { border-top: 1px solid var(--specimen-line); }
.canvas .label { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; position: sticky; left: 0; width: max-content; }
.canvas .values > div { display: inline; }
.canvas .bar {
  max-width: none;
  background:
    linear-gradient(to right, var(--specimen-accent) 0 var(--specimen-viewport, 100%), transparent 0),
    repeating-linear-gradient(135deg, var(--specimen-accent) 0 2px, transparent 2px 5px);
}
.wider { font: 11px/1.5 var(--specimen-mono); color: var(--specimen-fail); }
.viewport { position: absolute; top: 0; bottom: 0; left: var(--specimen-viewport); border-left: 1px dashed var(--specimen-fail); pointer-events: none; }
.viewport span { position: absolute; top: 0; left: 6px; font: 11px/1.5 var(--specimen-mono); color: var(--specimen-fail); white-space: nowrap; }
.sample { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.leading { display: block; max-width: 30ch; font-size: 13px; }
.duration { position: relative; display: block; height: 16px; }
.duration i { position: absolute; left: 0; width: 16px; height: 16px; background: var(--specimen-accent); border-radius: 50%; transition-property: left; transition-timing-function: ease-in-out; }
.token:hover .duration i { left: calc(100% - 16px); }
.pairs { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.pair { overflow: hidden; background: var(--specimen-panel); border: 1px solid var(--specimen-line); border-radius: 10px; }
.pair.fail { border-color: var(--specimen-fail); }
.pair p { margin: 0; padding: 20px 16px; font-size: 16px; }
.pair ul { margin: 0; padding: 8px 16px; list-style: none; font-size: 12px; color: var(--specimen-muted); border-top: 1px solid var(--specimen-line); }
.pair li.fail { color: var(--specimen-fail); }
.toast { position: fixed; bottom: 16px; left: 50%; padding: 6px 12px; font: 12px/1.5 var(--specimen-mono); color: var(--specimen-bg); background: var(--specimen-text); border-radius: 6px; transform: translateX(-50%); }
@media (width < 760px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  nav { display: none; }
  header, main { padding-inline: 16px; }
  .rows .token { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
`.trim();

const PAGE_SCRIPT = `
const root = document.documentElement;
document.querySelector('.controls').hidden = false;

for (const control of document.querySelectorAll('.mode-control')) {
  const attribute = 'data-' + control.dataset.attribute;
  control.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button === null) return;
    const value = button.dataset.value;
    if (value === 'auto') root.removeAttribute(attribute);
    else root.setAttribute(attribute, value);
    for (const b of control.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === button));
  });
}

const toast = document.querySelector('.toast');
let toastTimer;
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (button === null) return;
  const text = "token('" + button.dataset.copy + "')";
  try {
    await navigator.clipboard.writeText(text);
    toast.textContent = 'copied ' + text;
  } catch {
    toast.textContent = text;
  }
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1600);
});

const viewportLabels = document.querySelectorAll('.viewport span');
function markViewport() {
  root.style.setProperty('--specimen-viewport', window.innerWidth + 'px');
  for (const label of viewportLabels) label.textContent = 'viewport ' + window.innerWidth + 'px';
  for (const token of document.querySelectorAll('.canvas .token')) {
    token.querySelector('.wider').hidden = token.querySelector('.bar').offsetWidth <= window.innerWidth;
  }
}
markViewport();
window.addEventListener('resize', markViewport);
for (const line of document.querySelectorAll('.viewport')) line.hidden = false;

const filter = document.querySelector('.filter');
filter.addEventListener('input', () => {
  const query = filter.value.trim().toLowerCase();
  for (const token of document.querySelectorAll('.token')) {
    token.hidden = query !== '' && !token.dataset.path.toLowerCase().includes(query);
  }
  for (const block of document.querySelectorAll('.subgroup, .group')) {
    block.hidden = block.querySelector('.token:not([hidden])') === null;
  }
  for (const link of document.querySelectorAll('nav a')) {
    link.hidden = document.getElementById(link.hash.slice(1))?.hidden ?? false;
  }
  markViewport();
});
`.trim();

type Kind = TokenRole | TokenType | 'untyped';

interface Subgroup {
  path: string;
  tokens: Token[];
}

interface Group {
  name: string;
  id: string;
  subgroups: Subgroup[];
  count: number;
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function kindOf(token: Token): Kind {
  return token.role ?? inferType(token) ?? 'untyped';
}

function isCanvas(kind: Kind): boolean {
  return kind === 'sizing' || kind === 'dimension';
}

// Top-level groups in config order, each split by parent path so nested
// groups get their own heading. A single-segment token goes in the '' group.
function groupTokens(tokens: readonly Token[]): Group[] {
  const groups = new Map<string, Map<string, Token[]>>();
  for (const token of tokens) {
    const name = token.segments.length > 1 ? token.segments[0] : '';
    const path = token.segments.slice(0, -1).join('.');
    const subgroups = groups.get(name) ?? new Map<string, Token[]>();
    groups.set(name, subgroups);
    subgroups.set(path, [...(subgroups.get(path) ?? []), token]);
  }
  return [...groups].map(([name, subgroups]) => ({
    name,
    id: name === '' ? 'ungrouped' : `group-${name}`,
    subgroups: [...subgroups].map(([path, members]) => ({ path, tokens: members })),
    count: [...subgroups.values()].reduce((n, members) => n + members.length, 0),
  }));
}

// The base value, then each mode whose literal differs, including a mode the
// token only reaches through a reference.
function values(token: Token, tokens: readonly Token[], modes: readonly string[]): string {
  const base = String(resolveValue(token.path, tokens));
  const rows = [{ mode: undefined as string | undefined, raw: token.value, literal: base }];
  for (const mode of modes) {
    const literal = String(resolveValue(token.path, tokens, mode));
    if (mode in token.modes || literal !== base) rows.push({ mode, raw: token.modes[mode] ?? token.value, literal });
  }
  return rows
    .map(({ mode, raw, literal }) => {
      const label = mode === undefined ? '' : `<span class="mode">${escape(mode)}</span>`;
      const via = parseReference(raw) === null ? '' : `<code>${escape(String(raw))}</code> → `;
      const title = `${mode === undefined ? '' : `${mode} `}${String(raw)}${via === '' ? '' : ` → ${literal}`}`;
      return `<div title="${escape(title)}">${label}${via}<code class="literal">${escape(literal)}</code></div>`;
    })
    .join('');
}

function bar(ref: string): string {
  return `<span class="bar" style="width: ${ref}"></span>`;
}

function preview(token: Token, kind: Kind): string {
  const ref = cssVariableReference(token.path);
  switch (kind) {
    case 'color':
      return `<span class="swatch" style="background: ${ref}"></span>`;
    case 'spacing':
      return `<span class="spacing" style="gap: ${ref}"><i></i><i></i></span>`;
    case 'radius':
      return `<span class="radius" style="border-radius: ${ref}"></span>`;
    case 'fontSize':
      return `<span class="sample" style="font-size: ${ref}">${SAMPLE}</span>`;
    case 'lineHeight':
      return `<span class="leading" style="line-height: ${ref}">${PARAGRAPH}</span>`;
    case 'fontFamily':
      return `<span class="sample" style="font-family: ${ref}">${SAMPLE}</span>`;
    case 'fontWeight':
      return `<span class="sample" style="font-weight: ${ref}">${SAMPLE}</span>`;
    case 'duration':
      return `<span class="duration"><i style="transition-duration: ${ref}"></i></span>`;
    case 'sizing':
    case 'dimension':
      return bar(ref);
    default:
      return '';
  }
}

function nameCell(token: Token): string {
  const note =
    token.deprecated === undefined
      ? ''
      : `<div class="note">deprecated${typeof token.deprecated === 'string' ? `: ${escape(token.deprecated)}` : ''}</div>`;
  const description =
    token.description === undefined ? '' : `<div class="description">${escape(token.description)}</div>`;
  const path = escape(token.path);
  return `<button type="button" class="path" data-copy="${path}" title="copy token('${path}')">${path}</button>${note}${description}`;
}

type Layout = 'swatches' | 'canvas' | 'rows';

// Colours as swatches, lengths on a sideways-scrolling canvas so each bar is
// drawn at its real width instead of being capped to fit, the rest as rows.
function layoutOf(tokens: readonly Token[]): Layout {
  if (tokens.every((t) => kindOf(t) === 'color')) return 'swatches';
  if (tokens.every((t) => isCanvas(kindOf(t)))) return 'canvas';
  return 'rows';
}

function tokenBlock(token: Token, resolved: ResolvedTokens, modes: readonly string[], layout: Layout): string {
  const kind = kindOf(token);
  const classes = ['token', ...(token.deprecated === undefined ? [] : ['deprecated'])].join(' ');
  const open = `<div class="${classes}" data-path="${escape(token.path)}">`;
  const valueCell = `<div class="values">${values(token, resolved.tokens, modes)}</div>`;
  switch (layout) {
    case 'swatches':
      return `${open}${preview(token, kind)}<div class="meta">${nameCell(token)}${valueCell}</div></div>`;
    case 'canvas':
      return `${open}<div class="label">${nameCell(token)}${valueCell}<span class="wider" hidden>wider than window</span></div>${preview(token, kind)}</div>`;
    case 'rows':
      return `${open}<div>${nameCell(token)}</div><div class="preview">${preview(token, kind)}</div>${valueCell}</div>`;
  }
}

function subgroupBlock(group: Group, subgroup: Subgroup, resolved: ResolvedTokens, modes: readonly string[]): string {
  const layout = layoutOf(subgroup.tokens);
  const heading = subgroup.path === group.name || subgroup.path === '' ? '' : `<h3>${escape(subgroup.path)}</h3>`;
  const blocks = subgroup.tokens.map((t) => tokenBlock(t, resolved, modes, layout)).join('\n');
  const body =
    layout === 'canvas'
      ? `<div class="canvas"><div class="canvas-inner">\n${blocks}\n<div class="viewport" aria-hidden="true" hidden><span></span></div></div></div>`
      : `<div class="${layout}">\n${blocks}\n</div>`;
  return `<div class="subgroup">${heading}${body}</div>`;
}

function groupSection(group: Group, resolved: ResolvedTokens, modes: readonly string[]): string {
  const title = group.name === '' ? 'ungrouped' : group.name;
  return [
    `<section class="group" id="${escape(group.id)}">`,
    `<h2>${escape(title)}<span>${group.count}</span></h2>`,
    ...group.subgroups.map((s) => subgroupBlock(group, s, resolved, modes)),
    '</section>',
  ].join('\n');
}

function contrastSection(resolved: ResolvedTokens): string {
  const byPair = new Map<string, ContrastResult[]>();
  for (const result of resolved.contrast) {
    const key = `${result.foreground}\n${result.background}`;
    byPair.set(key, [...(byPair.get(key) ?? []), result]);
  }
  if (byPair.size === 0) return '';
  const minimum = resolved.config.contrast?.minimum;
  const cards = [...byPair.values()].map((results) => {
    const { foreground, background } = results[0];
    const fail = results.some((r) => !r.pass);
    const items = results
      .map((r) => {
        const label = r.error ?? (r.pass ? String(r.ratio) : `${r.ratio} below ${minimum}`);
        return `<li${r.pass ? '' : ' class="fail"'}>${escape(r.mode)} <b>${escape(label)}</b></li>`;
      })
      .join('');
    const style = `color: ${cssVariableReference(foreground)}; background: ${cssVariableReference(background)}`;
    return [
      `<div class="pair${fail ? ' fail' : ''}">`,
      `<p style="${style}">${escape(foreground)} on ${escape(background)}</p>`,
      `<ul>${items}</ul>`,
      '</div>',
    ].join('');
  });
  return [
    '<section class="group" id="contrast">',
    `<h2>contrast<span>minimum ${minimum}</span></h2>`,
    `<div class="pairs">\n${cards.join('\n')}\n</div>`,
    '</section>',
  ].join('\n');
}

// The page script sets this attribute on <html>: auto/light/dark for the
// colour scheme, auto/on/off for other modes. auto removes it so the media query decides.
function modeControl(mode: string): string {
  const scheme = mode === 'dark';
  const attribute = scheme ? 'mode' : mode;
  const heading = scheme ? 'scheme' : mode;
  const options = scheme ? ['auto', 'light', 'dark'] : ['auto', 'on', 'off'];
  const buttons = options
    .map((o) => `<button type="button" data-value="${o}" aria-pressed="${o === 'auto'}">${o}</button>`)
    .join('');
  return `<div class="mode-control" role="group" aria-label="${escape(heading)}" data-attribute="${escape(attribute)}"><span>${escape(heading)}</span>${buttons}</div>`;
}

// One self-contained page that opens from disk. Without the script every
// token still renders and the modes follow the OS; the controls need it.
export function emitSpecimen(resolved: ResolvedTokens): string {
  const modes = Object.keys(resolved.config.modes);
  const groups = groupTokens(resolved.tokens);
  const contrast = contrastSection(resolved);
  const links = [
    ...groups.map(
      (g) => `<a href="#${escape(g.id)}">${escape(g.name === '' ? 'ungrouped' : g.name)}<span>${g.count}</span></a>`
    ),
    ...(contrast === '' ? [] : ['<a href="#contrast">contrast</a>']),
  ];
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>tokens</title>',
    `<style>\n${emitCss(resolved)}\n</style>`,
    `<style>\n${PAGE_CSS}\n</style>`,
    '</head>',
    '<body>',
    '<div class="layout">',
    `<nav><div class="title">tokens</div>\n${links.join('\n')}\n</nav>`,
    '<div>',
    '<header>',
    `<h1>tokens</h1><span class="count">${resolved.tokens.length}</span>`,
    '<div class="controls" hidden>',
    '<input class="filter" type="search" placeholder="filter by path" aria-label="filter tokens by path">',
    ...modes.map(modeControl),
    '</div>',
    '</header>',
    '<main>',
    ...groups.map((g) => groupSection(g, resolved, modes)),
    contrast,
    '</main>',
    '</div>',
    '</div>',
    '<div class="toast" role="status" hidden></div>',
    `<script>\n${PAGE_SCRIPT}\n</script>`,
    '</body>',
    '</html>',
    '',
  ]
    .filter((part) => part !== '')
    .join('\n');
}
