# token-jet-generate

Turns a selection of tokens into files: select tokens, map each through a template, aggregate the fragments. The first use is a family of CSS Module classes with a typed function per family, so a component can say `classNameForGap(token('space.x16'))` and get a hashed class the bundler knows about.

```ts
// generate.config.ts
import { cssModuleClass, defineGenerate } from 'token-jet-generate';

export default defineGenerate({
  gap: {
    select: 'SpaceToken',
    template: cssModuleClass({ property: 'gap', fn: 'classNameForGap' }),
  },
});
```

`token-jet-generate [--out <dir>]` reads `tokens.config.ts` and `generate.config.ts` from the working directory and writes every entry into `generated/` by default. Run it after `token-jet generate`, since the generated files import the tokens.

## Config

`defineGenerate(entries, { tokens? })`. Each entry is `{ select, template }`; the key names the entry's output files.

- `select` is a union token-jet emits, from a group (`SpaceToken`) or from the `types` block (`ColorToken`), or a glob over token paths (`bg.*`). An unknown name lists the unions that exist.
- `template` is `{ fragment(token, context), aggregate(fragments, context) }`. `fragment` runs once per selected token and `aggregate` turns the fragments into files. The token is the manifest shape: `path`, `variable`, `reference`, `type`, `value`, `modes`, `resolved`, `description`, `deprecated`.
- `tokens` is the module specifier the generated files import the token types from, written verbatim. Default `./tokens`, which resolves from the output directory to `generated/tokens`.

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
