# token-jet

Design tokens from one typed config. `tokens.config.ts` is the only hand-written file; token-jet generates CSS custom properties, TypeScript types, a `token()` function that reads the same in CSS and TypeScript, and a manifest for tools and agents.

```ts
// tokens.config.ts
import { defineConfig } from 'token-jet';

export default defineConfig({
  modes: { dark: '(prefers-color-scheme: dark)' },
  tokens: {
    space: {
      $group: { type: 'dimension' },
      x16: { value: '16px', description: 'The default gap.' },
    },
    bg: {
      $group: { type: 'color' },
      page: { value: '#ffffff', dark: '#040404' },
    },
  },
});
```

```css
.card {
  padding: token('space.x16'); /* var(--space-x16) after the PostCSS plugin */
  background: token('bg.page');
}
```

```ts
import { token } from './generated/tokens';

token('space.x16'); // 'var(--space-x16)', typed as that literal
token('space.x17'); // type error
```

Node 22.18 or later. The config is TypeScript and is imported by Node directly, so it can use anything TypeScript allows and is type-checked like the rest of a project.

## Schema

A schema describes the shape of the token tree as values, so the tree is type-checked against it and tools can read it at runtime.

```ts
import { defineSchema, pattern, slots } from 'token-jet';

const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const color = pattern({ type: 'color', tags: ['color'], preview: 'swatch', modes: ['dark'] });

export const schema = defineSchema({
  modes: { dark: '(prefers-color-scheme: dark)' },
  shape: {
    space: slots(['x4', 'x8', 'x16'], spacing),
    page: color,
  },
});

export default schema.defineTokens({
  space: { x4: { value: '4px' }, x8: { value: '8px' }, x16: { value: '16px' } },
  page: { value: '#ffffff', dark: '#040404' },
});
```

- `pattern({ type, tags?, preview?, modes? })` describes a leaf. `type` is a token type, `tags` are free-form strings, `preview` picks how the specimen draws the token (`swatch`, `gap`, `bar`, `corner`, `text`, `paragraph`), and `modes` lists the modes every leaf of this pattern must define.
- `slots(keys, shape)` puts the same pattern or group under each key. A plain object is a group whose keys each hold their own shape.
- `defineSchema({ modes, shape })` declares the modes once. A pattern that requires a mode the schema does not declare is a type error.
- `schema.defineTokens(tree)` checks the tree against the shape: a missing slot, a key the schema lacks, a leaf without a required mode or an unknown mode key is a type error. It returns `{ schema, tokens }`.
- `schema.defineGenerate(entries)` checks each entry's `tag` against the tags in the schema and returns `{ schema, entries }`.

The CLI, the Vite adapter and the language server read `tokens/tokens.ts` when a directory has no `tokens.config.ts`; its default export is the result of `schema.defineTokens`. With both files present, `tokens.config.ts` wins, so a project can add `tokens/` before switching to it.

`schemaToConfig({ schema, tokens })` turns a defined tree into the config the rest of token-jet reads, with each leaf's `type`, `tags` and `preview` taken from its pattern. It repeats the shape checks at runtime, so a config that skipped the type check still fails on a missing slot or mode.

## Config reference

`defineConfig({ modes, tokens, types?, contrast? })` returns the config unchanged; its job is to type-check it, so a mode key on a token that is not in `modes` is a compile error.

### `modes`

An object from mode name to the media query that turns it on: `{ dark: '(prefers-color-scheme: dark)' }`. A token gives a value for a mode by using the mode's name as a key. The mode named `dark` is the colour scheme and gets four scopes in the generated CSS (`light`, `dark`, `auto`, `inverted`); any other mode gets `on` and `off`.

### `tokens`

A tree of groups and leaves. A leaf is any object with a `value` key:

| key           | type                | meaning                                                                                                 |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `value`       | `string \| number`  | The base value, emitted as written. `'{path}'` is a reference to another token and emits as `var(--…)`. |
| `<mode>`      | `string \| number`  | The value in that mode. References are allowed per mode.                                                |
| `type`        | token type          | `color`, `dimension`, `fontFamily`, `fontWeight`, `number` or `duration`. Validated against the value.  |
| `description` | `string`            | Free text; shown in the editor, the manifest, the specimen and the DTCG export.                         |
| `deprecated`  | `boolean \| string` | Marks the token on its way out. The generator keeps emitting it; every surface warns.                   |
| `inherits`    | `boolean`           | Whether the custom property inherits. Default `true`.                                                   |

A group may carry `$group: { type, role, description }`. `type` applies to every leaf below it, and a leaf may not contradict it.

`role` says what a group's tokens are for when the type alone does not: space, size and radius are all dimensions. `spacing`, `sizing`, `radius` and `fontSize` suit `dimension`; `lineHeight` suits `number`. It applies to every leaf below the group, a role that does not suit the token's type is an error, the DTCG export carries it on the group under the `token-jet` extension, and the specimen picks each token's preview by it.

A token is addressed by its full path, `space.x16`. The custom property is `--space-x16`, the TypeScript literal type is `SpaceX16`, and every group gets a union named after it (`SpaceToken`). A group key that is not a valid identifier is quoted in the config as usual.

### `types`

Extra unions as globs over paths: `types: { color: ['bg.**', 'content.**'] }` emits `ColorToken`. `*` matches one segment, `**` any depth; a pattern that matches nothing is an error, as is a union name that collides with a group's.

### `contrast`

```ts
contrast: {
  minimum: 4.5,
  pairs: [['content.regular.default', 'bg.page.default']],
}
```

Every pair is checked in the base and in every mode with the WCAG 2.1 ratio. `generate` refuses to write files while any pair is below the minimum; `check` prints every ratio.

## Generated files

`token-jet generate` writes to `generated/tokens/` (`--out` to change it):

- `tokens.css`: an `@property` per token, the base values on `:where(html)`, a slot per mode with the scopes that fill or unset it, and a `var()` chain per mode token that falls through to the base. Nothing on `:root`, so a scope wrapper can nest to any depth.
- `types.ts`: a literal type per token, a union per group and per `types` entry, `TokenPath` and `TokenMap`.
- `index.ts`: `token(path)`, typed so only a known path compiles and the return type is the exact `var()` literal.
- `manifest.json` and `manifest.schema.json`: every token with its names, values and resolved values per mode, the unions and the contrast results. The file a tool or a coding agent reads.

The folder is meant to be gitignored and regenerated by a script. Nothing in it is edited by hand.

### Modes in the browser

A scope is an attribute on any element: `data-mode="light"`, `"dark"`, `"auto"` or `"inverted"` for the colour scheme, `data-<mode>="on"` or `"off"` for any other mode. `auto` follows the OS, `inverted` opposes it, and both are expressed in CSS with media queries, so nesting them is honest without JavaScript.

## CLI

| command                               | does                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `generate [--out <dir>]`              | Write the generated files. Fails on a config error or a contrast failure.                                           |
| `check`                               | Print the contrast ratio of every pair in every mode; exit 1 if any is below the minimum.                           |
| `specimen [--out <file>]`             | Write a self-contained HTML page of every token by group, with a preview per role or type, and every contrast pair. |
| `export --dtcg [--out <file>]`        | Write the tokens as DTCG 2025.10 JSON; modes go under `$extensions['token-jet']`.                                   |
| `import --dtcg <file> [--out <file>]` | Read DTCG JSON into `tokens.config.ts` text (modes and tokens; `types` and `contrast` are added by hand).           |
| `diff <export.json>`                  | Compare the config with a DTCG export; list missing, extra and changed tokens; exit 1 on any.                       |
| `usage <files…>`                      | List every `token()` call in the files by path, flagging deprecated ones.                                           |
| `rename <from> <to> <files…>`         | Rename a token in the files, and in the config unless `<to>` already exists there.                                  |

## PostCSS plugin

`token('path')` in CSS is rewritten to `var(--path)` at build time. An unknown path fails the build with the nearest path suggested; a deprecated one warns.

```ts
import tokenJet from 'token-jet/postcss';
import { loadConfigFile, loadTokens } from 'token-jet';

const { config } = await loadConfigFile(process.cwd());
export default { plugins: [tokenJet({ tokens: loadTokens(config) })] };
```

## Vite adapter

Generates on start, regenerates and reloads when `tokens.config.ts` changes, and registers the PostCSS plugin over the same model.

```ts
import tokenJet from 'token-jet/vite';

export default { plugins: [tokenJet({ outDir: 'generated/tokens' })] };
```

`vite` is an optional peer dependency; the rest of the package does not need it.

## Programmatic use

`loadConfigFile(dir)` imports `tokens.config.ts`; `loadTokens(config)` validates it and returns the resolved model every emitter reads. `generateFiles(resolved)` returns the files without writing them; `emitCss`, `emitTypes`, `emitJs`, `emitManifest`, `emitSpecimen` and `toDtcg` are the individual emitters.
