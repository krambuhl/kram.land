# token-jet plan

token-jet turns one typed config file into a design token system: CSS custom properties, TypeScript types with glob-defined unions, a `token()` function that reads the same in CSS and TypeScript, and editor support for it. It lives in this repo as a workspace package and is built so it can be moved to its own repo and published.

## Goals

- One source of truth. `tokens.config.ts` defines every token, mode and type union. Nothing else is hand-maintained.
- Type safety end to end. An unknown token path fails to compile in TypeScript, fails the build in CSS, and is underlined in the editor.
- Easy unions. A union such as `ColorToken` is one glob pattern in the config, not a hand-written list.
- Separable. token-jet knows nothing about kram.land. The site is its first consumer, not part of it.

## Non-goals

- Generating utility classes inside token-jet. token-jet ends at tokens. Per-token class names are the job of a separate companion package, `token-jet-classnames`, described below. The site's `stack()`, `spacer()` and `area()` stay in the site.
- Responsive utilities. Spacing that changes at a breakpoint is written in a CSS Module.
- Unit conversion. Values are emitted exactly as written in the config.
- Go-to-definition and color swatches in the editor. These are deferred.

## Decisions

Each of these was settled with the repo owner before writing this plan.

| Topic             | Decision                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location          | npm workspace at `packages/token-jet`. The site depends on it by package name.                                                                                                  |
| Config format     | `export default defineConfig({ modes, tokens, types })`. The helper type-checks the config, so a mode key on a token must exist in `modes`.                                     |
| `default` key     | No special meaning. Tokens are addressed by full path only. `token('bg.page')` is an error because `bg.page` is a group.                                                        |
| Units             | Emitted as written. Space and size tokens are authored in `px`. Font-size tokens are authored in `rem` so text follows the user's font-size setting.                            |
| Generated files   | Written to `generated/tokens/`, gitignored, rebuilt by npm pre-scripts.                                                                                                         |
| TypeScript API    | `token('path')` function only. No `tokens` object.                                                                                                                              |
| Globs             | Standard semantics: `*` matches one path segment, `**` matches any depth. A pattern that matches no token is an error.                                                          |
| Type names        | A single token's type is its PascalCase path (`SpaceX16`). Every union ends in `Token` (`SpaceToken`, `BgPageToken`, `ColorToken`). A name produced by two sources is an error. |
| Modes             | Each mode emits a media-query block and an attribute selector, so the OS setting is the default and `data-mode` can force a mode.                                               |
| Integration       | Framework-agnostic core and CLI, plus a thin Vite adapter.                                                                                                                      |
| Execution         | Run from TypeScript source on Node 22.18 or later. A compile step is added at roll-off.                                                                                         |
| Tests             | Vitest inside the package, with file snapshots and type-level tests.                                                                                                            |
| Site migration    | Pipeline first with a 0-pixel diff, then the rename, then the new palette, as separate commits.                                                                                 |
| Editor support    | A language server plus a small VS Code extension. Version one does completion, hover and diagnostics.                                                                           |
| References        | A value of the form `{path}` points at another token and emits as `var(--path)`. A missing target or a cycle is an error.                                                       |
| Metadata          | A token may carry `type`, `description` and `deprecated`. `type` is validated against the value.                                                                                |
| Contrast          | The config declares semantic foreground/background pairs. The generator computes WCAG contrast for every pair in every mode and fails below the declared minimum.               |
| Interchange       | DTCG JSON is an import/export format, not the authoring format.                                                                                                                 |
| Typed properties  | Every token is also declared with `@property`, so the browser knows its syntax, whether it inherits, and its initial value.                                                     |
| Literal arguments | `token()` takes a string literal only. A computed path is a lint error, so the set of used tokens is exact and pruning is safe.                                                 |
| Figma             | The Variables REST API is Enterprise-only, so the exchange format is a plugin-exported DTCG file committed to the repo.                                                         |
| Companions        | Extra generators are separate packages built on token-jet's public API. token-jet never depends on them.                                                                        |
| Plugin readiness  | No public plugin API yet. Every emitter, built-in or companion, shares one signature so a plugin hook can be added later without rewriting any of them.                         |

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
├─ token-jet-classnames/  companion: classNameFor… generator
├─ token-jet-lsp/         language server, editor-agnostic
└─ token-jet-vscode/      launches the server for CSS files
```

`loadTokens()` is the one entry point that reads a config and returns the resolved token list. The CLI, the PostCSS plugin, the Vite adapter and the language server all call it, so they cannot disagree about what tokens exist.

The core imports nothing from Vite, PostCSS or any editor library. Adapters sit at the edge and depend on the core, never the other way round.

### Emitter contract

Every generator has the same shape:

```ts
type Emitter = (tokens: ResolvedTokens, context: EmitContext) => OutputFile[];
```

token-jet's CSS, types and JavaScript emitters are three functions of this type, run as a list. A companion package exports a function of the same type and, for now, calls it from its own CLI. If a `plugins` option is added to `defineConfig` later, built-in emitters and companions slot into it unchanged. The contract is internal until a second real companion exists to test it against.

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

Each phase is test-first: the tests in its list are written before the code that passes them. Phases 0 to 7 do not touch the site's source, so every commit in them is safe on `main`. Phase 8 onward changes the site and each commit is pixel-diffed.

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

### Phase 2: token references

A value may point at another token: `{ value: '{gray.50}' }`. The reference emits as `var(--gray-50)`, so a semantic token follows its primitive at runtime and a mode override on the primitive flows through. A reference resolves per mode: `{ value: '{gray.50}', dark: '{gray.900}' }` is allowed.

Expressions such as `{space.base} * 2` are not supported. If they are added later they are typed nodes in the config, not strings the generator parses, and they emit `calc()` when an operand is a reference. String parsing is where every existing implementation's bugs live: mixed units, negatives, and references that emit invalid CSS.

Tests first:

- A reference to a leaf emits `var(--…)`; a reference to a group is an error naming the group.
- A missing target is an error naming the token and the path it points at.
- A cycle (`a -> b -> a`) is an error listing the cycle.
- `resolveValue(path, mode)` follows references to a literal, which contrast checking needs.
- Generated types are unchanged: a reference token's type is still its own `var()` literal.

### Phase 3: metadata

A token may carry `type`, `description` and `deprecated`.

```ts
content: {
  muted: {
    default: {
      value: '#666666',
      dark: '#999999',
      type: 'color',
      description: 'Secondary text. Never for body copy.',
    },
  },
},
```

- `type` is one of `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `duration`, and the composites `typography`, `shadow`, `border` and `transition`, whose sub-values follow the DTCG 2025.10 shapes. A composite emits one custom property per sub-value. The generator validates the value against it, and a reference must point at a token of the same type. A group may declare `type` once for all its leaves.
- `description` is emitted as a JSDoc comment on the generated type, so it appears in editor hover in TypeScript. The language server shows it in CSS.
- `deprecated` is covered in the next phase.

Tests first:

- A `color` token with the value `16px` is an error. A `dimension` token with the value `#fff` is an error.
- A group-level `type` applies to every leaf and a leaf may not contradict it.
- A reference from a `color` to a `dimension` token is an error.
- The types emitter writes the description as a JSDoc comment above the alias.

### Phase 4: deprecation and lifecycle

`deprecated: true` or `deprecated: 'use content.regular.default'` marks a token on its way out. The generator keeps emitting it, and every surface warns:

- TypeScript: the alias gets `@deprecated`, so editors strike it through and `oxlint` can flag uses.
- CSS: the PostCSS plugin reports a warning with the replacement, not an error, so a deprecation never breaks a build.
- Language server: a diagnostic of warning severity, with a code action to apply the replacement when one is given.
- CLI: `token-jet usage` lists every `token()` call in a set of files by path, and flags deprecated ones. `token-jet rename <old> <new>` rewrites calls in CSS and TypeScript and moves the config entry.

A token is removed by deleting it from the config, after `usage` shows no callers.

Tests first:

- The types emitter writes `@deprecated` with the message.
- The PostCSS plugin emits a warning, not an error, for a deprecated path and includes the replacement.
- `usage` finds `token('a.b')` in `.css`, `.ts`, `.tsx` and `.astro` fixtures and reports deprecated uses.
- `rename` rewrites every occurrence in the fixtures and the config, and leaves an unrelated path alone.

### Phase 5: emitters and CLI

Tests first, as file snapshots against a fixture config:

- `emit-css`: base block, one media block per mode scoped to `:root:not([data-mode])`, one `[data-mode='x']` block per mode, only overriding tokens repeated.
- `emit-css`: an `@property` rule per token before the `:root` block. `syntax` comes from the token's type (`<color>`, `<length>`, `<number>`, `*` for font families), `inherits` is `true`, and `initial-value` is the base value. A token may set `inherits: false` in the config. Terrazzo and Style Dictionary do not emit these. They make a token animatable and give it a real default when a mode block does not declare it.
- `emit-css` with `prune: true`: only tokens in the used set, plus every token they reference, are emitted. The used set is the paths collected by the PostCSS plugin and the TypeScript reference walk. `prune` is off in development so the specimen and the editor see every token.
- `emit-types`: leaf aliases, group unions at every depth, custom unions from `types`, `AnyToken`, `TokenPath`, `TokenMap`.
- `emit-js`: the `token()` implementation.
- Type-level: `token('space.x16')` has type `'var(--space-x16)'`. `token('space.x17')` and `token('bg.page')` do not compile.

Then implement the emitters and `token-jet generate`, which writes the three files to the configured output directory.

### Phase 6: PostCSS plugin

Tests first:

- `token('space.x16')` becomes `var(--space-x16)`, with single or double quotes, inside shorthand values, and more than once per declaration.
- An unknown path throws a PostCSS error carrying the source position and a suggestion.
- A declaration without `token(` is returned untouched.
- The plugin records every path it rewrites into a used set that the CSS emitter reads when `prune` is on.

The TypeScript side has the matching rule: `token()` accepts a string literal only. `token(flag ? 'a.b' : 'a.c')` is a lint error, written as `flag ? token('a.b') : token('a.c')`. The type signature enforces most of it (`P extends TokenPath` rejects a `string`), and an oxlint or ESLint rule catches the conditional-inside-the-call shape that still satisfies the type. With both in place the used set is exact, which is what makes pruning safe: nothing has to scan source text for candidates the way Tailwind does.

### Phase 7: Vite adapter

- Generate on server start and on build start.
- Watch the config file. On change, regenerate and trigger a reload.
- Register the PostCSS plugin.

Tested with a small fixture project built through Vite's JavaScript API.

### Phase 8: migrate the site, pipeline only

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

### Phase 9: rename, then repaint

Two commits, never combined:

1. Rename to the new vocabulary (`bg.page`, `bg.base`, `bg.elevated`, `content.regular`, `content.muted`) keeping today's values. Pixel diff must be 0. The rename uses `token-jet rename` from phase 4, which is its first real run: add the new token, deprecate the old one pointing at it, rewrite the callers, delete the old one.
2. Change the values to the new palette. Pixels change on purpose and are reviewed by eye, in light and dark.

### Phase 10: contrast checking

The config declares which semantic tokens sit on which, and the minimum contrast:

```ts
contrast: {
  minimum: 4.5,
  pairs: [
    ['content.regular.default', 'bg.page.default'],
    ['content.muted.default', 'bg.page.default'],
  ],
},
```

`token-jet check` resolves both sides of every pair in every mode, computes the WCAG 2.1 contrast ratio, and fails listing each pair below the minimum with its ratio and mode. It runs as part of `generate`, so a palette that fails contrast never reaches the site.

- WCAG 2.1 is the only algorithm. WCAG 3 is a working draft whose contrast algorithm is undecided, and APCA was removed from it in 2023. Tools that ship APCA present it as guidance, never compliance.
- Every mode is checked. Terrazzo's rule checks only the default context, which lets a dark-mode failure through.
- A bad pair, such as a path that is not a colour, is reported with the other findings, not thrown, so one mistake does not hide the rest.
- A pair may name a typography token as its third member, and `largeText` is derived from that token's size and weight instead of being a boolean the author has to keep in sync.

Tests first:

- The ratio for `#000` on `#fff` is 21 and for `#767676` on `#fff` is 4.54.
- A pair that passes in light and fails in dark reports the dark mode only.
- A pair naming a non-color token is an error.
- References resolve before the ratio is computed.

### Phase 11: DTCG import and export

`token-jet export --dtcg` writes the token tree in the DTCG format's first stable version, 2025.10. That version fixes the value shapes: a colour is an object, `{ colorSpace, components, alpha?, hex? }`, and a dimension is `{ value, unit }` with only `px` and `rem` allowed. `$type`, `$description` and `$deprecated` map directly. References are `{path}`. Modes go under `$extensions['token-jet'].modes`, using the resolver module's words, `modifiers` and `contexts`, so the file reads naturally to anyone who knows the spec. `token-jet import --dtcg <file>` reads the same format into a `tokens.config.ts` skeleton.

Composite tokens (typography, shadow, border, transition) emit one custom property per sub-value, never the CSS `font` shorthand. The shorthand cannot carry `letter-spacing`, and Style Dictionary has an open bug where valid typography loses it silently.

This is the bridge to Figma and Tokens Studio, and it is not the authoring format: the config stays TypeScript so it can be type-checked. The Figma side works through a committed export, not the REST API. The Variables REST API is available only to Enterprise plans, and every syncing tool either runs as a Figma plugin or is a paid service. So the workflow is: a plugin exports DTCG JSON, the file is committed, and `token-jet diff <export.json>` reports tokens missing on either side and value mismatches, exiting non-zero so it can gate CI. Figma's `codeSyntax` field on a variable is where the `token()` path is stored, so both sides agree on identity.

Tests first:

- Export of the fixture config snapshots to a JSON file, with colours as objects and dimensions as `{ value, unit }`.
- Import of that JSON reproduces the fixture config's token tree.
- A DTCG file with a `$type` token-jet does not support is an error naming it.
- `diff` against an export with one missing token, one extra token and one changed value reports all three and exits 1; against an identical export it exits 0.

### Phase 12: specimen

`token-jet specimen` emits a static HTML page showing every token in every mode: a swatch for colors, a bar for dimensions, a sample for type, with path, value, description and deprecation. Contrast pairs render as text on background with the ratio. The page has no dependencies and can be served from `public/` or captured by a visual-regression tool, so a palette change becomes a reviewable image diff.

Tests first:

- The page snapshots for the fixture config.
- Every token path in the config appears in the page.
- A deprecated token is marked.

### Phase 13: agent manifest

`token-jet generate` also writes `generated/tokens/manifest.json`: every token with its path, `var()` name, value per mode, type, description, deprecation and replacement, plus the type unions and contrast pairs. It is the file a coding agent reads to choose `space.x16` instead of typing `15px`. It is emitted last in the pipeline so it reflects everything the other phases add.

Tests first:

- The manifest snapshots for the fixture config.
- A schema file is emitted beside it and the manifest validates against it.

### Phase 14: classnames companion

`packages/token-jet-classnames` generates typed functions that turn a token into a CSS Module class name. It replaces the per-token classes and lookup tables that `stack`, `spacer` and `area` write by hand.

```ts
// classnames.config.ts
export default defineClassNames({
  classNameForPadding: { property: 'padding', tokens: 'SpaceToken' },
  classNameForGap: { property: 'gap', tokens: 'SpaceToken' },
  classNameForMaxWidth: { property: 'max-width', tokens: 'SizeToken' },
});
```

```ts
// generated/classnames/padding.ts
export function classNameForPadding(token: SpaceToken): string;
export function classNameForPadding(token: SpaceToken | undefined): string | undefined;

classNameForPadding(token('space.x16')); // a hashed class from padding.module.css
classNameForPadding(token('size.x1024')); // type error
```

Decisions:

- Build-time generation. A class must exist in a `.module.css` file for the bundler to hash, so a runtime factory cannot work.
- The config key is the function name. Each utility sets one CSS property.
- `tokens` names a union token-jet already generates, from a group (`SpaceToken`) or from the `types` block (`ColorToken`). The `types` block stays the only place unions are defined. A narrower set is a new `types` entry, which accepts a list of paths. An unknown type name is an error that lists the valid names.
- One `.ts` and one `.module.css` per utility, imported from its own path. There is no index file, because a bundler ships a CSS Module's whole stylesheet once anything imports it, and a barrel would ship every utility's classes to every page. A declared but unused utility ships nothing.
- The companion writes a `.d.ts` beside each stylesheet. It knows every class name, so it does not depend on CSS Modules Kit.
- `undefined` in gives `undefined` out, so a call drops into `classnames(...)` without a guard.
- The options object is shaped as it would be for a plugin, so it can move into `plugins: [classNames({ ... })]` unchanged.

Tests first:

- Snapshot the emitted `.ts`, `.module.css` and `.d.ts` for a fixture config.
- An unknown type name throws and lists the valid names.
- Type-level: the function accepts every member of its union and rejects a token outside it.

Then adopt it in the site: `stack`, `spacer` and `area` call the generated functions, and their hand-written per-token classes and lookup tables are deleted. Done when the pixel diff is 0 and `npm run verify` passes.

### Phase 15: editor support

`packages/token-jet-lsp`, a Node language server over stdio:

- Finds `token('…')` calls in CSS documents.
- Completion: token paths, filtered by what has been typed, with the value as detail.
- Hover: the path, its value, each mode's value, and its description.
- Deprecation: a warning diagnostic with a code action that applies the replacement.
- Diagnostics: an unknown path, with the nearest valid path suggested.
- Reloads when the config file changes.

Tested by driving the server with LSP messages against fixture documents.

`packages/token-jet-vscode`, a launcher extension:

- Starts the server for CSS files in a workspace that contains a `tokens.config.ts`.
- Packaged as a `.vsix` and installed locally. No marketplace publishing.

### Phase 16: roll-off checklist

Not executed as part of this plan. Recorded so the package stays ready.

- Add a compile step (tsdown) producing `dist/`, and point `bin` and `exports` at it. A published package must ship JavaScript, because Node does not strip types inside `node_modules`.
- Confirm no import reaches outside `packages/token-jet`.
- Move the four packages to their own repo with history (`git subtree split`).
- Write a README with the config reference. Publish. `token-jet` is unclaimed on npm as of 2026-09-21.
- Replace the workspace dependency in kram.land with the published version.

## Later

Not scheduled. Recorded so they are not re-derived.

- **Raw-value lint.** A stylelint rule that flags `padding: 16px` or `color: #666` where a token with that value exists, and suggests it. token-jet knows every value, so the suggestion is exact. The existing `declaration-strict-value` plugin cannot do this because it does not know which tokens exist, and its property-regex approach has a long list of false positives.
- **Two consumers before roll-off.** token-jet is not published until a second real project uses it. Every API mistake found so far came from having one consumer. A second site in this account would do.
- **Config schema versioning.** A `version` field in `defineConfig` and a migration path, added the day the second consumer exists. Cheap then, painful later.

## Risks

- **Running TypeScript from source.** Node strips types only outside `node_modules`. This works in a workspace because npm links to the real path. If a tool resolves the package through the `node_modules` symlink without following it, the CLI will fail to start. Phase 0 proves this on CI and on Vercel before anything depends on it.
- **Vercel and workspaces.** The project builds from the repo root today. Phase 0 checks that a preview deploy still succeeds once workspaces exist.
- **A fresh clone has no generated files.** Until a script runs, the editor reports missing modules. `prepare` covers `npm install`. The README should say so.
- **The language server is the largest unknown.** It is sequenced last, after the core is stable, and the site does not depend on it.

## Open questions

- `area()` accepts `x128` today, but the draft config's `size` group starts at `x192` and `x128` sits in `space`. Decide in phase 8 whether `area` drops `x128` or `size` gains it. Nothing on the site uses it.
- Whether `token-jet generate --check` is worth adding. With generated files gitignored there is nothing to drift, so it is left out unless a need appears.
