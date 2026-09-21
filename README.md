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
| `npm run verify`   | Run every check above, then build. CI runs this |

Requires Node 22.12 or later.

## Layout

- `src/pages/` holds the routes, `index.astro` and `404.astro`. Each one composes the React components into a page, and uses Astro's `<Image>` for build-time image resizing.
- `src/layouts/Layout.astro` holds the document `<html>` and `<head>` and wraps each page in `PageContainer`. It stays in Astro: a `<head>` rendered by React gets no stylesheet links, so the page comes out unstyled.
- `src/components/` holds each component as `name/index.tsx` beside `name/styles.module.css`.
- `src/utilities/` holds style utilities: functions that return CSS Module class names to put on any element, such as `stack({ gap: tokens.size.x16 })`.
- `src/styles/tokens.css` defines the design tokens as CSS custom properties. `src/tokens/index.ts` mirrors them as `var(--…)` strings for use in component props.
- `src/assets/` holds images Astro resizes at build time. `public/` holds files served as-is.

## Styling conventions

- A variant is a class named prop + value, such as `.alignCenter`, applied with `classnames`. Variant rules sit below `.root` in the file, because they tie it on specificity.
- A token-valued prop, such as `gap`, is passed as an inline custom property with its default in CSS: `gap: var(--stack-gap, var(--size-16))`.

## Style utilities

Layout behaviour that applies to any element is a utility function, not a component. A utility returns a class string, so it composes with `classnames` in `.tsx` and `class:list` in `.astro`.

- `area({ width })` centers an element and caps its width. `stack({ gap, align })` makes an element a vertical flex stack. `spacer({ p, ph, pv })` sets padding on all sides, horizontally and vertically. `superellipse()` gives an element the site's curved shape and clips its children to it. `text({ variant, size })` sets the type style; the caller chooses the element.
- Token arguments take `tokens.size` values. Spacing accepts `x0` to `x128` and widths accept `x128` to `x1920`; the types reject anything outside those ranges.
- Utilities are not responsive. Spacing that changes at a breakpoint is written in a CSS Module, as `PageContainer` does.

## Typed CSS Modules

`npm run check` runs `cmk` first, which writes a `.d.ts` for every `*.module.css` into `generated/` (gitignored). `tsconfig.json` maps that folder in with `rootDirs`, so a class name that does not exist in the stylesheet is a type error.

## No client JavaScript

React components render at build time only. Adding a `client:*` directive to a component in a `.astro` file ships React to the browser, so none of them have one.

## Deploy

Deployed on Vercel as a static site. `vercel.json` sets the Astro framework preset.

See `AGENTS.md` for the git workflow.
