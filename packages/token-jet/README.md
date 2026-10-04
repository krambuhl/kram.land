# token-jet

Design tokens from one typed schema. `tokens/tokens.ts` is the only hand-written file; token-jet generates CSS custom properties, TypeScript types, a `token()` function that reads the same in CSS and TypeScript, and a manifest for tools and agents.

```ts
// tokens/tokens.ts
import { defineSchema, pattern } from 'token-jet';

const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const surface = pattern({ type: 'color', preview: 'swatch', modes: ['dark'] });

const schema = defineSchema({
  modes: { dark: '(prefers-color-scheme: dark)' },
  shape: {
    space: { x16: spacing },
    bg: { page: surface },
  },
});

export default schema.defineTokens({
  space: { x16: { value: '16px', description: 'The default gap.' } },
  bg: { page: { value: '#ffffff', dark: '#040404' } },
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

Node 22.18 or later. The tokens file is TypeScript and is imported by Node directly, so it can use anything TypeScript allows and is type-checked like the rest of a project.

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

Every tag becomes a union in the generated types, next to the group unions: `spacing` emits `SpacingToken`, `border-radius` emits `BorderRadiusToken`. A tag is letters, digits and dashes, starting with a letter, and a tag union named like a group union is an error. The manifest lists each token's `tags` and `preview`.

The CLI, the Vite adapter and the language server read `tokens/tokens.ts` when a directory has no `tokens.config.ts`; its default export is the result of `schema.defineTokens`. With both files present, `tokens.config.ts` wins, so a project can add `tokens/` before switching to it.

`schemaToConfig({ schema, tokens })` turns a defined tree into the config the rest of token-jet reads, with each leaf's `type`, `tags` and `preview` taken from its pattern. It repeats the shape checks at runtime, so a config that skipped the type check still fails on a missing slot or mode.

## Config reference

`schemaToConfig` turns a schema's tokens into a config, `{ modes, tokens }`, which is what every emitter and tool reads. The `Config` type describes it.

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

A token is addressed by its full path, `space.x16`. The custom property is `--space-x16`, the TypeScript literal type is `SpaceX16`, and every group gets a union named after it (`SpaceToken`). A group key that is not a valid identifier is quoted in the config as usual.

## Generated files

`token-jet generate` writes to `generated/tokens/` (`--out` to change it):

- `tokens.css`: an `@property` per token, the base values on `:where(html)`, a slot per mode with the scopes that fill or unset it, and a `var()` chain per mode token that falls through to the base. Nothing on `:root`, so a scope wrapper can nest to any depth.
- `types.ts`: a literal type per token, a union per group and per tag, `TokenPath` and `TokenMap`.
- `index.ts`: `token(path)`, typed so only a known path compiles and the return type is the exact `var()` literal.
- `manifest.json` and `manifest.schema.json`: every token with its names, values and resolved values per mode, and the unions. The file a tool or a coding agent reads.

The folder is meant to be gitignored and regenerated by a script. Nothing in it is edited by hand.

### Modes in the browser

A scope is an attribute on any element: `data-mode="light"`, `"dark"`, `"auto"` or `"inverted"` for the colour scheme, `data-<mode>="on"` or `"off"` for any other mode. `auto` follows the OS, `inverted` opposes it, and both are expressed in CSS with media queries, so nesting them is honest without JavaScript.

## CLI

| command                               | does                                                                                                                                                                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate [--out <dir>]`              | Write the generated files. Fails on a config error.                                                                                                                                                                         |
| `specimen [--out <file>]`             | Write a self-contained HTML page of every token by group, with a preview per token.                                                                                                                                         |
| `export --dtcg [--out <file>]`        | Write the tokens as DTCG 2025.10 JSON; modes, tags and previews go under `$extensions['token-jet']`.                                                                                                                        |
| `import --dtcg <file> [--out <file>]` | Read DTCG JSON into `tokens/tokens.ts` text: a schema with one pattern per type, tags and preview, and the tokens.                                                                                                          |
| `diff <export.json>`                  | Compare the config with a DTCG export; list missing, extra and changed tokens; exit 1 on any.                                                                                                                               |
| `usage <files…>`                      | List every `token()` call in the files by path, flagging deprecated ones.                                                                                                                                                   |
| `rename <from> <to> <files…>`         | Rename a token in the files, and in the config unless `<to>` already exists there. With a schema it renames the key in the shape too, when the key appears there once, and restores everything if the config stops loading. |

## PostCSS plugin

`token('path')` in CSS is rewritten to `var(--path)` at build time. An unknown path fails the build with the nearest path suggested; a deprecated one warns.

```ts
import tokenJet from 'token-jet/postcss';
import { loadConfigFile, loadTokens } from 'token-jet';

const { config } = await loadConfigFile(process.cwd());
export default { plugins: [tokenJet({ tokens: loadTokens(config) })] };
```

## Vite adapter

Generates on start, regenerates and reloads when the token config changes (anything in `tokens/` for a schema config, including modules `tokens.ts` imports), and registers the PostCSS plugin over the same model.

```ts
import tokenJet from 'token-jet/vite';

export default { plugins: [tokenJet({ outDir: 'generated/tokens' })] };
```

`vite` is an optional peer dependency; the rest of the package does not need it.

## Programmatic use

`loadConfigFile(dir)` imports `tokens.config.ts`; `loadTokens(config)` validates it and returns the resolved model every emitter reads. `generateFiles(resolved)` returns the files without writing them; `emitCss`, `emitTypes`, `emitJs`, `emitManifest`, `emitSpecimen` and `toDtcg` are the individual emitters.
