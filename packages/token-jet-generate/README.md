# token-jet-generate

Turns a selection of tokens into files: select tokens, map each through a template, aggregate the fragments. The first use is a family of CSS Module classes with a typed function per family, so a component can say `classNameForGap(token('space.x16'))` and get a hashed class the bundler knows about.

```ts
// tokens/generate.ts
import { cssModuleClass } from 'token-jet-generate';

import { schema } from './schema.ts';

export default schema.defineGenerate({
  gap: {
    tag: 'spacing',
    template: cssModuleClass({ property: 'gap', fn: 'classNameForGap' }),
  },
});
```

`token-jet-generate [--out <dir>]` reads `tokens/tokens.ts` and `tokens/generate.ts` from the working directory and writes every entry into `generated/classnames/` by default. The default export of `tokens/generate.ts` must be the result of a token-jet schema's `defineGenerate`. Run it after `token-jet generate`, since the generated files import the tokens.

## Config

`defineGenerate(entries, { tokens? })`. Each entry is `{ tag, template }`; the key names the entry's output files.

- `tag` selects every token whose schema pattern carries that tag, across groups, and types the generated function on the tag's union (`spacing` gives `SpacingToken`). An unknown tag lists the tags that exist.
- `template` is `{ fragment(token, context), aggregate(fragments, context) }`. `fragment` runs once per selected token and `aggregate` turns the fragments into files. The token is the manifest shape: `path`, `variable`, `reference`, `type`, `value`, `modes`, `resolved`, `description`, `deprecated`.
- `tokens` is the module specifier the generated files import the token types from, written verbatim. Default `../tokens`, which resolves from the output directory to `generated/tokens`.

Two entries writing the same path is an error.

## Templates

- `cssModuleClass({ property, fn })`: `<entry>.module.css` with one rule per token (`.spaceX16 { gap: token('space.x16'); }`), `<entry>.module.css.d.ts` beside it so nothing else has to type the stylesheet, and `<entry>.ts` exporting `fn`, typed on the selection and mapping `undefined` to `undefined` so a call drops straight into `classnames()`.
- `tsRecord({ name, value? })`: `<entry>.ts` exporting a `Record` from each token's `var()` literal to a string, the resolved base value by default.
- `storyPerToken({ title, render })`: `<entry>.stories.tsx` with a default `Meta` and one story per token; `render(token)` returns JSX as text.

A template is plain TypeScript. Anything else is an object of the same shape:

```ts
const list = {
  fragment: (t) => `${t.path}=${t.resolved.base}`,
  aggregate: (lines, ctx) => [{ path: `${ctx.name}.txt`, contents: lines.join('\n') }],
};
```

## Why build-time

A class has to exist in a `.module.css` for the bundler to hash it, so the classes cannot be made at runtime, and a story file is a file. One output per entry and no index file: a bundler ships a CSS Module's whole stylesheet once anything imports it, so an entry nobody imports ships nothing.
