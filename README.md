# kram.land

A one-page personal site. Components are React, and [Astro](https://astro.build) renders them to static HTML at build time. It ships HTML and CSS only, with no client-side JavaScript.

## Commands

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start the dev server at `http://localhost:4321` |
| `npm run build`    | Build the static site to `dist/`                |
| `npm run preview`  | Serve the built site locally                    |
| `npm run check`    | Type-check `.astro` and `.ts` files             |
| `npm run lint`     | Run oxlint                                      |
| `npm run lint:css` | Run stylelint on the stylesheets                |
| `npm run format`   | Check formatting with Prettier                  |
| `npm run knip`     | Find unused files, dependencies and exports     |
| `npm test`         | Run the site tests, then every workspace's      |
| `npm run verify`   | Run every check above, then build. CI runs this |

Requires Node 22.12 or later.

## Workspace

The repo is an npm workspace. The site is the root package, and `packages/` holds packages it depends on. `packages/token-jet` is the design token generator and `packages/token-jet-generate` turns selected tokens into files through templates; the plan for both is in `packages/token-jet/PLAN.md`. Their TypeScript runs from source, which needs Node 22.18 or later.

## Layout

- `src/pages/` holds the routes, `index.astro` and `404.astro`. Each one composes the React components into a page, and uses Astro's `<Image>` for build-time image resizing.
- `src/layouts/Layout.astro` holds the document `<html>` and `<head>` and wraps each page in `Mode` and `PageContainer`. It stays in Astro: a `<head>` rendered by React gets no stylesheet links, so the page comes out unstyled.
- `src/components/` holds each component as `name/index.tsx` beside `name/styles.module.css`. A component's tests sit beside it as `name/index.test.tsx`, run by Vitest with `react-dom/server`.
- `src/utilities/` holds style utilities: functions that return CSS Module class names to put on any element, such as `stack({ gap: token('space.x16') })`.
- `tokens.config.ts` defines the design tokens. `token-jet` generates `generated/tokens/` from it before every dev, build and check: `tokens.css` (custom properties, with an `@property` per token and a slot per colour mode), `types.ts` and `index.ts` (a typed `token()`), plus `manifest.json` for tools and agents. The folder is gitignored; `npm install` generates it.
- `generate.config.ts` names the per-token class families the utilities use. `token-jet-generate` writes each entry into `generated/` as a `.module.css` with one rule per token, a `.d.ts` beside it, and a `.ts` exporting a function such as `classNameForGap(token('space.x16'))` that is typed on the entry's token union. It runs with `npm run tokens`; the Vite adapter regenerates on a change to `tokens.config.ts` only, so a change to `generate.config.ts` needs `npm run tokens` by hand.
- `src/assets/` holds images Astro resizes at build time. `public/` holds files served as-is.

## Styling conventions

- A variant is a class named prop + value, such as `.alignCenter`, applied with `classnames`. Variant rules sit below `.root` in the file, because they tie it on specificity.
- In CSS a token is `token('space.x16')`, rewritten to `var(--space-x16)` at build time; an unknown path fails the build. In TypeScript `token('space.x16')` has the type `'var(--space-x16)'`, so a prop typed as a token union accepts it and a plain string does not.

## Style utilities

Layout behaviour that applies to any element is a utility function, not a component. A utility returns a class string, so it composes with `classnames` in `.tsx` and `class:list` in `.astro`.

- `area({ width })` centers an element and caps its width. `stack({ gap, align })` makes an element a vertical flex stack. `spacer({ p, ph, pv })` sets padding on all sides, horizontally and vertically. `superellipse()` gives an element the site's curved shape and clips its children to it. `headingText({ size })` and `bodyText({ size })` set the type style; the caller chooses the element.
- The per-token classes behind `area`, `stack` and `spacer` are generated from `generate.config.ts`; the utility composes a generated class with its own `.module.css` for the rest.
- Token arguments take `token('…')` values. Spacing takes a `space` token (`x0` to `x128`) and widths take a `size` token (`x192` to `x1920`); the generated unions reject the other group.
- Utilities are not responsive. Spacing that changes at a breakpoint is written in a CSS Module, as `PageContainer` does.

## Colour modes

Every colour token has a light and a dark value. `<Mode value>` sets which one applies to its subtree by rendering `data-mode` on a wrapper, and the generated CSS keys its colour-mode scopes off that attribute. `light` and `dark` are absolute. `auto` follows the OS scheme and `inverted` opposes it; nested under `light` or `dark`, `inverted` resolves to the opposite absolute value, and `inverted` inside `inverted` is `auto` again. `Layout.astro` wraps every page in `auto`, which is also what an element with no `data-mode` ancestor gets.

## Typed CSS Modules

`npm run check` runs `cmk` first, which writes a `.d.ts` for every `*.module.css` into `generated/` (gitignored). `tsconfig.json` maps that folder in with `rootDirs`, so a class name that does not exist in the stylesheet is a type error.

## No client JavaScript

React components render at build time only. Adding a `client:*` directive to a component in a `.astro` file ships React to the browser, so none of them have one.

## Deploy

Deployed on Vercel as a static site. `vercel.json` sets the Astro framework preset.

See `AGENTS.md` for the git workflow.
