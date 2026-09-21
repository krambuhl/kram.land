# token-jet plan

token-jet turns one typed config file into a design token system: CSS custom properties, TypeScript types with glob-defined unions, a `token()` function that reads the same in CSS and TypeScript, and editor support for it. It lives in this repo as a workspace package and is built so it can be moved to its own repo and published.

## Goals

- One source of truth. `tokens.config.ts` defines every token, mode and type union. Nothing else is hand-maintained.
- Type safety end to end. An unknown token path fails to compile in TypeScript, fails the build in CSS, and is underlined in the editor.
- Easy unions. A union such as `ColorToken` is one glob pattern in the config, not a hand-written list.
- Separable. token-jet knows nothing about kram.land. The site is its first consumer, not part of it.

## Non-goals

- Generating utility classes or components. token-jet ends at tokens. The site's `stack()`, `spacer()` and `area()` stay in the site and retype against the generated unions.
- Unit conversion. Values are emitted exactly as written in the config.
- Go-to-definition and color swatches in the editor. These are deferred.

## Decisions

Each of these was settled with the repo owner before writing this plan.

| Topic           | Decision                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location        | npm workspace at `packages/token-jet`. The site depends on it by package name.                                                                                                  |
| Config format   | `export default defineConfig({ modes, tokens, types })`. The helper type-checks the config, so a mode key on a token must exist in `modes`.                                     |
| `default` key   | No special meaning. Tokens are addressed by full path only. `token('bg.page')` is an error because `bg.page` is a group.                                                        |
| Units           | Emitted as written. Space and size tokens are authored in `px`. Font-size tokens are authored in `rem` so text follows the user's font-size setting.                            |
| Generated files | Written to `generated/tokens/`, gitignored, rebuilt by npm pre-scripts.                                                                                                         |
| TypeScript API  | `token('path')` function only. No `tokens` object.                                                                                                                              |
| Globs           | Standard semantics: `*` matches one path segment, `**` matches any depth. A pattern that matches no token is an error.                                                          |
| Type names      | A single token's type is its PascalCase path (`SpaceX16`). Every union ends in `Token` (`SpaceToken`, `BgPageToken`, `ColorToken`). A name produced by two sources is an error. |
| Modes           | Each mode emits a media-query block and an attribute selector, so the OS setting is the default and `data-mode` can force a mode.                                               |
| Integration     | Framework-agnostic core and CLI, plus a thin Vite adapter.                                                                                                                      |
| Execution       | Run from TypeScript source on Node 22.18 or later. A compile step is added at roll-off.                                                                                         |
| Tests           | Vitest inside the package, with file snapshots and type-level tests.                                                                                                            |
| Site migration  | Pipeline first with a 0-pixel diff, then the rename, then the new palette, as separate commits.                                                                                 |
| Editor support  | A language server plus a small VS Code extension. Version one does completion, hover and diagnostics.                                                                           |

## Architecture

```
packages/
├─ token-jet/
│  ├─ package.json        bin: token-jet, exports: ".", "./vite", "./postcss"
│  ├─ PLAN.md
│  ├─ src/
│  │  ├─ index.ts         defineConfig, loadTokens, public types
│  │  ├─ core/
│  │  │  ├─ config.ts     config types and defineConfig
│  │  │  ├─ load.ts       find and import tokens.config.ts
│  │  │  ├─ flatten.ts    token tree to a flat, ordered list of tokens
│  │  │  ├─ validate.ts   mode keys, reserved names, name collisions
│  │  │  ├─ glob.ts       path pattern matching
│  │  │  ├─ names.ts      path to CSS variable name and to type name
│  │  │  ├─ emit-css.ts
│  │  │  ├─ emit-types.ts
│  │  │  └─ emit-js.ts
│  │  ├─ cli.ts           token-jet generate
│  │  ├─ postcss.ts       the token() function in CSS
│  │  └─ vite.ts          generate on start, regenerate on config change, register postcss
│  └─ test/
├─ token-jet-lsp/         language server, editor-agnostic
└─ token-jet-vscode/      launches the server for CSS files
```

`loadTokens()` is the one entry point that reads a config and returns the resolved token list. The CLI, the PostCSS plugin, the Vite adapter and the language server all call it, so they cannot disagree about what tokens exist.

The core imports nothing from Vite, PostCSS or any editor library. Adapters sit at the edge and depend on the core, never the other way round.

## Generated output

For a token at path `space.x16` with value `16px`:

`generated/tokens/tokens.css`

```css
:root {
  --space-x16: 16px;
  --bg-page-default: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-mode]) {
    --bg-page-default: #040404;
  }
}

[data-mode='dark'] {
  --bg-page-default: #040404;
}
```

Setting `data-mode="light"` forces light with no extra rule, because any `data-mode` value disables the media-query block and leaves the base values in effect. `data-mode` works on any element, so a subtree can be themed.

`generated/tokens/types.ts`

```ts
export type SpaceX16 = 'var(--space-x16)';
export type BgPageDefault = 'var(--bg-page-default)';

export type SpaceToken = SpaceX0 | SpaceX4 | SpaceX16;
export type BgPageToken = BgPageDefault | BgPageHover | BgPagePressed;
export type BgToken = BgPageToken | BgBaseToken | BgElevatedToken;
export type ColorToken = BgToken | ContentToken;
export type AnyToken = SpaceToken | SizeToken | BgToken | ContentToken;

export type TokenPath = 'space.x16' | 'bg.page.default';
export interface TokenMap {
  'space.x16': SpaceX16;
  'bg.page.default': BgPageDefault;
}
```

`generated/tokens/index.ts`

```ts
export function token<P extends TokenPath>(path: P): TokenMap[P];
```

In CSS, the PostCSS plugin rewrites `token('space.x16')` to `var(--space-x16)`. An unknown path stops the build with the file, line and the nearest valid path.

## Phases

Each phase is test-first: the tests in its list are written before the code that passes them. Phases 0 to 4 do not touch the site's source, so every commit in them is safe on `main`. Phase 5 onward changes the site and each commit is pixel-diffed.

### Phase 0: workspace

- Add `"workspaces": ["packages/*"]` to the root `package.json`.
- Create `packages/token-jet` with its own `package.json`, `tsconfig.json` (`erasableSyntaxOnly: true`) and Vitest.
- Raise the root `engines.node` to `>=22.18.0`.
- Add `npm test -w token-jet` to `npm run verify`. Point knip, oxlint and Prettier at the workspace.

Done when `npm run verify` passes, CI passes, and the Vercel preview still builds from the workspace root.

### Phase 1: core

Tests first:

- `flatten`: a nested tree becomes an ordered list with path, value and per-mode values. A leaf is any object with a `value` key.
- `validate`: a mode key not in `modes` is an error. A token named after a reserved key is an error.
- `glob`: `bg.**` matches all nine bg tokens. `bg.*.hover` matches three. `**.default` matches every default. `bg.*` throws "matches no tokens".
- `names`: `bg.page.default` gives `--bg-page-default` and `BgPageDefault`. Two sources producing `ColorToken` throws and names both.

Then implement `config.ts`, `flatten.ts`, `validate.ts`, `glob.ts`, `names.ts` and `load.ts`.

Type-level tests: `defineConfig` rejects an unknown mode key on a token.

### Phase 2: emitters and CLI

Tests first, as file snapshots against a fixture config:

- `emit-css`: base block, one media block per mode scoped to `:root:not([data-mode])`, one `[data-mode='x']` block per mode, only overriding tokens repeated.
- `emit-types`: leaf aliases, group unions at every depth, custom unions from `types`, `AnyToken`, `TokenPath`, `TokenMap`.
- `emit-js`: the `token()` implementation.
- Type-level: `token('space.x16')` has type `'var(--space-x16)'`. `token('space.x17')` and `token('bg.page')` do not compile.

Then implement the emitters and `token-jet generate`, which writes the three files to the configured output directory.

### Phase 3: PostCSS plugin

Tests first:

- `token('space.x16')` becomes `var(--space-x16)`, with single or double quotes, inside shorthand values, and more than once per declaration.
- An unknown path throws a PostCSS error carrying the source position and a suggestion.
- A declaration without `token(` is returned untouched.

### Phase 4: Vite adapter

- Generate on server start and on build start.
- Watch the config file. On change, regenerate and trigger a reload.
- Register the PostCSS plugin.

Tested with a small fixture project built through Vite's JavaScript API.

### Phase 5: migrate the site, pipeline only

Goal: the site reads generated tokens and not one pixel changes.

- Rewrite `tokens.config.ts` with `defineConfig`. Fill it with the values the site uses today, including the groups the draft config lacks: font family, font size, font weight, line height and radius. The site's stylesheets use two color tokens and eighteen typography tokens, so typography is most of this work.
- Space and size values are written in `px`. At the default browser font size this renders identically to today's `rem` values, so the pixel diff stays at zero. Users who have changed their browser's font-size setting will see spacing stop scaling with it. This is the accepted consequence of the units decision and it lands in this commit.
- Add pre-scripts so `dev`, `build`, `check` and `lint:css` regenerate first. Add `prepare` so a fresh install has tokens.
- Register the Vite adapter in `astro.config.mjs`. Import `generated/tokens/tokens.css` in `globals.css`.
- Delete `src/styles/tokens.css` and `src/tokens/index.ts`.
- Remove `tokens.config.ts` from knip's `ignore` list. It is exempt only while nothing reads it.
- Update the usage comments at the bottom of `tokens.config.ts`, or delete them in favour of this plan. They show `token('bg.page')`, which is an error under the full-paths decision.
- stylelint: point `importFrom` at the generated file, and allow the `token` function in `function-no-unknown` and `declaration-property-value-no-unknown`.
- Retype the utilities against the generated unions. Lookup tables become `Record<SpaceToken, string>` keyed by the token literal, which removes the reverse lookup and deletes `src/utilities/space.ts`.

Done when the pixel diff is 0 at 390, 600, 800 and 1280px in light and dark, and `npm run verify` passes.

### Phase 6: rename, then repaint

Two commits, never combined:

1. Rename to the new vocabulary (`bg.page`, `bg.base`, `bg.elevated`, `content.regular`, `content.muted`) keeping today's values. Pixel diff must be 0.
2. Change the values to the new palette. Pixels change on purpose and are reviewed by eye, in light and dark.

### Phase 7: editor support

`packages/token-jet-lsp`, a Node language server over stdio:

- Finds `token('…')` calls in CSS documents.
- Completion: token paths, filtered by what has been typed, with the value as detail.
- Hover: the path, its value, and each mode's value.
- Diagnostics: an unknown path, with the nearest valid path suggested.
- Reloads when the config file changes.

Tested by driving the server with LSP messages against fixture documents.

`packages/token-jet-vscode`, a launcher extension:

- Starts the server for CSS files in a workspace that contains a `tokens.config.ts`.
- Packaged as a `.vsix` and installed locally. No marketplace publishing.

### Phase 8: roll-off checklist

Not executed as part of this plan. Recorded so the package stays ready.

- Add a compile step (tsdown) producing `dist/`, and point `bin` and `exports` at it. A published package must ship JavaScript, because Node does not strip types inside `node_modules`.
- Confirm no import reaches outside `packages/token-jet`.
- Move the three packages to their own repo with history (`git subtree split`).
- Write a README with the config reference. Publish. `token-jet` is unclaimed on npm as of 2026-09-21.
- Replace the workspace dependency in kram.land with the published version.

## Risks

- **Running TypeScript from source.** Node strips types only outside `node_modules`. This works in a workspace because npm links to the real path. If a tool resolves the package through the `node_modules` symlink without following it, the CLI will fail to start. Phase 0 proves this on CI and on Vercel before anything depends on it.
- **Vercel and workspaces.** The project builds from the repo root today. Phase 0 checks that a preview deploy still succeeds once workspaces exist.
- **A fresh clone has no generated files.** Until a script runs, the editor reports missing modules. `prepare` covers `npm install`. The README should say so.
- **The language server is the largest unknown.** It is sequenced last, after the core is stable, and the site does not depend on it.

## Open questions

- `area()` accepts `x128` today, but the draft config's `size` group starts at `x192` and `x128` sits in `space`. Decide in phase 5 whether `area` drops `x128` or `size` gains it. Nothing on the site uses it.
- Whether `token-jet generate --check` is worth adding. With generated files gitignored there is nothing to drift, so it is left out unless a need appears.
