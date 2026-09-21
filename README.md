# kram.land

A one-page personal site built with [Astro](https://astro.build). It ships HTML and CSS only, with no client-side JavaScript.

## Commands

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the dev server at `http://localhost:4321` |
| `npm run build`   | Build the static site to `dist/`                |
| `npm run preview` | Serve the built site locally                    |
| `npm run check`   | Type-check `.astro` and `.ts` files             |
| `npm run lint`    | Run ESLint                                      |

Requires Node 22.12 or later.

## Layout

- `src/pages/` holds the routes: `index.astro` and `404.astro`.
- `src/layouts/Layout.astro` holds the document head and page container.
- `src/components/` holds each component as `Name.astro` beside `Name.module.css`.
- `src/styles/tokens.css` defines the design tokens as CSS custom properties. `src/tokens/index.ts` mirrors them as `var(--…)` strings for use in component props.
- `src/assets/` holds images Astro resizes at build time. `public/` holds files served as-is.

## Styling conventions

- A variant is a class named prop + value, such as `.alignCenter`, applied with `class:list`. Variant rules sit below `.root` in the file, because they tie it on specificity.
- A token-valued prop, such as `gap`, is passed as an inline custom property with its default in CSS: `gap: var(--stack-gap, var(--size-16))`.

## Deploy

Deployed on Vercel as a static site. `vercel.json` sets the Astro framework preset.

See `AGENTS.md` for the git workflow.
