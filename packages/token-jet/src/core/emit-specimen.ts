import type { TokenType } from './config.ts';
import { emitCss } from './emit-css.ts';
import type { Token } from './flatten.ts';
import type { ResolvedTokens } from './load.ts';
import { inferType } from './metadata.ts';
import { cssVariableReference } from './names.ts';
import { parseReference, resolveValue } from './references.ts';

const PAGE_CSS = `
body { margin: 0; padding: 24px; font: 14px/1.5 system-ui, sans-serif; color: #222; background: #f4f4f4; }
h1 { font-size: 20px; margin: 0 0 16px; }
h2 { font-size: 16px; margin: 32px 0 8px; }
.mode { padding: 16px; border: 1px solid #ccc; border-radius: 8px; background: #fff; margin-bottom: 24px; }
table { border-collapse: collapse; width: 100%; table-layout: fixed; }
th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-top: 1px solid #e6e6e6; overflow: hidden; }
th { font-weight: 600; border-top: 0; }
code { font: 13px/1.5 ui-monospace, monospace; }
.swatch { display: inline-block; width: 48px; height: 24px; border: 1px solid #0003; border-radius: 4px; vertical-align: middle; }
.bar { display: block; height: 8px; background: #3b82f6; border-radius: 2px; }
.sample { font-size: 18px; }
.deprecated code { text-decoration: line-through; }
.deprecated .note { color: #b45309; }
.pair { padding: 12px; border-radius: 4px; margin: 8px 0; }
.pair.fail { outline: 2px solid #dc2626; }
`.trim();

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// The attribute that forces a mode on, as the generated css keys its scopes:
// data-mode for dark, data-<mode>="on" for any other.
function modeScope(mode: string): string {
  return mode === 'dark' ? ' data-mode="dark"' : ` data-${mode}="on"`;
}

// A preview reads the custom property rather than the literal, so the same
// row shows the right value inside every mode section.
function preview(token: Token, type: TokenType | undefined): string {
  const ref = cssVariableReference(token.path);
  switch (type) {
    case 'color':
      return `<span class="swatch" style="background: ${ref}"></span>`;
    case 'dimension':
      return `<span class="bar" style="width: ${ref}"></span>`;
    case 'fontFamily':
      return `<span class="sample" style="font-family: ${ref}">Aa Bb Cc 123</span>`;
    case 'fontWeight':
      return `<span class="sample" style="font-weight: ${ref}">Aa Bb Cc 123</span>`;
    default:
      return '';
  }
}

function row(token: Token, tokens: readonly Token[], mode: string | undefined): string {
  const raw = mode !== undefined && mode in token.modes ? token.modes[mode] : token.value;
  const literal = String(resolveValue(token.path, tokens, mode));
  const via = parseReference(raw) === null ? '' : `<code>${escape(String(raw))}</code> → `;
  const deprecated =
    token.deprecated === undefined
      ? ''
      : `<div class="note">deprecated${typeof token.deprecated === 'string' ? `: ${escape(token.deprecated)}` : ''}</div>`;
  const cells = [
    `<code>${escape(token.path)}</code>${deprecated}`,
    preview(token, inferType(token)),
    `${via}<code>${escape(literal)}</code>`,
    token.description === undefined ? '' : escape(token.description),
  ];
  const attrs = token.deprecated === undefined ? '' : ' class="deprecated"';
  return `<tr${attrs}>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
}

function section(resolved: ResolvedTokens, mode: string | undefined): string {
  const { tokens, contrast, config } = resolved;
  const name = mode ?? 'base';
  const rows = tokens.map((t) => row(t, tokens, mode)).join('\n');
  const pairs = contrast
    .filter((r) => r.mode === name)
    .map((r) => {
      const fg = cssVariableReference(r.foreground);
      const bg = cssVariableReference(r.background);
      const label = r.error ?? (r.pass ? String(r.ratio) : `${r.ratio} below ${config.contrast?.minimum}`);
      return `<p class="pair${r.pass ? '' : ' fail'}" style="color: ${fg}; background: ${bg}">${escape(r.foreground)} on ${escape(r.background)} <b>${escape(label)}</b></p>`;
    })
    .join('\n');
  return [
    `<section class="mode"${mode === undefined ? '' : modeScope(mode)}>`,
    `<h2>${escape(name)}${mode === undefined ? '' : ` <code>${escape(config.modes[mode] ?? '')}</code>`}</h2>`,
    '<table>',
    '<colgroup><col style="width: 24%"><col style="width: 28%"><col style="width: 28%"><col></colgroup>',
    '<thead><tr><th>token</th><th>preview</th><th>value</th><th>description</th></tr></thead>',
    `<tbody>\n${rows}\n</tbody>`,
    '</table>',
    pairs,
    '</section>',
  ]
    .filter((part) => part !== '')
    .join('\n');
}

// One self-contained page: the generated css inlined, no script, a section
// for the base and one per mode, with every token and contrast pair inside.
export function emitSpecimen(resolved: ResolvedTokens): string {
  const modes = [undefined, ...Object.keys(resolved.config.modes)];
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
    '<h1>tokens</h1>',
    ...modes.map((mode) => section(resolved, mode)),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
