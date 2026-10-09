# token-jet-responsive-css-modules

Responsive variants of CSS Module classes at token-jet breakpoints. A class is written once; a variant is emitted only when a component asks for it.

```css
/* card.module.css */
.cn {
  display: grid;
}
```

```tsx
import { responsive } from 'token-jet-responsive-css-modules';

import styles from './card.module.css';

const r = responsive(styles);

<div className={styles.cn} />; // always
<div className={r.cn({ matchMin: 'sm' })} />; // sm and wider
<div className={r.cn({ matchMax: 'sm' })} />; // up to and including sm
<div className={r.cn({ matchOnly: 'md' })} />; // md only
<div className={r.cn({ matchOnly: ['sm', 'md'] })} />; // sm through md
```

A call returns only the variant class, so `r.cn({ matchMin: 'sm' })` styles nothing below `sm`. Combine it with other classes as usual.

## Breakpoints

Breakpoints are the tokens tagged `media-breakpoint`, in the order the tokens declare them. Each is named by its last path segment, and its value is where it starts; the first one's value is ignored. `@media` cannot read custom properties, so the values are written into the queries at build time.

| option                    | query                |
| ------------------------- | -------------------- |
| `matchMin: 'sm'`          | `(width >= sm)`      |
| `matchMax: 'sm'`          | `(width < md)`       |
| `matchOnly: 'sm'`         | `(sm <= width < md)` |
| `matchOnly: ['sm', 'md']` | `(sm <= width < lg)` |

A `matchOnly` list must be a contiguous run. A range that covers every breakpoint emits no query.

## How variants are found

The Vite plugin scans `src/**/*.{ts,tsx}` at startup for `responsive(styles)`, where `styles` is the default import of a `.module.css` file, and for calls on the result. An option's value can be a string literal, an array of them, or a ternary of either; anything else fails the build with the file and line. For each variant found, the postcss plugin copies every rule that names the class into the query, renaming the class `cn--min-sm`, before CSS Modules hashes the file. In dev, editing a source file rescans it and reloads the CSS modules it touches.

A wrapper passed to another component still works if the call it makes is visible to the scanner; a call the scanner never saw returns an empty class and warns in the console.

## Setup

```js
// astro.config.mjs or vite.config.js
import tokenJet from 'token-jet/vite';
import tokenJetResponsive from 'token-jet-responsive-css-modules/vite';

export default { plugins: [tokenJet(), tokenJetResponsive()] };
```

Options: `src` (default `src`), `tag` (default `media-breakpoint`) and `typesFile` (default `generated/responsive/breakpoints.d.ts`).

The types file registers the breakpoint names and every contiguous run, so an unknown breakpoint or a gap is a type error. The plugin writes it on start, and `token-jet-responsive-css-modules` writes it from the command line for type checks that run before a build.
