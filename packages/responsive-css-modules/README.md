# responsive-css-modules

Responsive variants of CSS Module classes at named breakpoints. A class is written once; a variant is emitted only when a component asks for it.

```css
/* card.module.css */
.cn {
  display: grid;
}
```

```tsx
import { responsive } from 'responsive-css-modules';

import styles from './card.module.css';

const r = responsive(styles);

<div className={styles.cn} />; // always
<div className={r.cn({ matchMin: 'sm' })} />; // sm and wider
<div className={r.cn({ matchMax: 'sm' })} />; // up to and including sm
<div className={r.cn({ matchOnly: 'md' })} />; // md only
<div className={r.cn({ matchOnly: ['sm', 'md'] })} />; // sm and md
<div className={r.cn({ matchOnly: ['base', 'lg'] })} />; // base and lg, not between
```

A call returns only the variant class, so `r.cn({ matchMin: 'sm' })` styles nothing below `sm`. Combine it with other classes as usual.

## Breakpoints

Breakpoints are an ordered list of `{ name, width }`, where `width` is where the breakpoint starts; the first one's width is ignored. `@media` cannot read custom properties, so the widths are written into the queries at build time.

| option                      | query                              |
| --------------------------- | ---------------------------------- |
| `matchMin: 'sm'`            | `(width >= sm)`                    |
| `matchMax: 'sm'`            | `(width < md)`                     |
| `matchOnly: 'sm'`           | `(sm <= width < md)`               |
| `matchOnly: ['sm', 'md']`   | `(sm <= width < lg)`               |
| `matchOnly: ['base', 'md']` | `(width < sm), (md <= width < lg)` |

A `matchOnly` list can name any breakpoints, gaps included; neighbours merge into one range and gaps become a list of queries. A list is written in breakpoint order without repeats, so `['sm', 'md']` is the class `cn--only-sm-md` and `['md', 'sm']` is a type error and a build error that names the order to write. A list that covers every breakpoint emits no query.

## How variants are found

The Vite plugin scans `src/**/*.{ts,tsx}` at startup for `responsive(styles)`, where `styles` is the default import of a `.module.css` file, and for calls on the result. An option's value can be a string literal, an array of them, or a ternary of either; anything else fails the build with the file and line. For each variant found, the postcss plugin copies every rule that names the class into the query, renaming the class `cn--min-sm`, before CSS Modules hashes the file. In dev, editing a source file rescans it and reloads the CSS modules it touches.

A wrapper passed to another component still works if the call it makes is visible to the scanner; a call the scanner never saw returns an empty class and warns in the console.

## Setup

```js
// astro.config.mjs or vite.config.js
import responsiveCssModules from 'responsive-css-modules/vite';

export default {
  plugins: [
    responsiveCssModules({
      breakpoints: [
        { name: 'base', width: '0px' },
        { name: 'sm', width: '32rem' },
        { name: 'md', width: '48rem' },
      ],
    }),
  ],
};
```

Options: `breakpoints` (required), `src` (default `src`) and `typesFile` (default `generated/responsive/breakpoints.d.ts`).

`breakpoints` can also be a source, `{ load(root), watch? }`, which the plugin loads on start and again when a file under `watch` changes.

### From token-jet

`responsive-css-modules/token-jet` reads the breakpoints from token-jet tokens, which is an optional peer dependency:

```js
import tokenJet from 'token-jet/vite';
import { fromTokenJet } from 'responsive-css-modules/token-jet';
import responsiveCssModules from 'responsive-css-modules/vite';

export default { plugins: [tokenJet(), responsiveCssModules({ breakpoints: fromTokenJet() })] };
```

`fromTokenJet({ tag })` takes the tokens tagged `media-breakpoint` by default, in the order the tokens declare them, each named by its last path segment. It watches `tokens/`.

## Types

The types file registers the breakpoint names and every ordered list of them, so an unknown breakpoint or a list out of order is a type error. The plugin writes it on start. For a type check that runs before any build, `responsive-css-modules --token-jet [--tag <tag>]` writes it from the command line.
