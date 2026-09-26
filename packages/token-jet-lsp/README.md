# token-jet-lsp

A language server for `token('…')` calls in CSS. It reads `tokens.config.ts` from the workspace root and gives an editor:

- Completion inside the quotes: every path, with its value per mode as the detail and the description as documentation. The edit replaces the whole quoted argument, so a half-typed path with dots completes cleanly.
- Hover: the path, its value in the base and in each mode with references resolved, the description, and the deprecation if any.
- Diagnostics: an unknown path is an error naming the nearest existing one; a deprecated path is a warning. Each carries a quick fix that replaces the path when a replacement is known.
- Reload: the config file is watched, and open documents are re-checked when it changes. A config that fails to load is reported as a diagnostic on each open document rather than taking the server down.

## Running

The server speaks LSP over stdio:

```
token-jet-lsp --stdio
```

or `node node_modules/token-jet-lsp/dist/server.js --stdio` from the workspace root. It takes the first workspace folder (or `rootUri`) as the root and looks for `tokens.config.ts` there.

### Zed

The `token-jet-zed` extension in this repository launches the server for CSS buffers using the workspace's own copy: install it with `zed: install dev extension`.

### Other editors

Any client that can start a stdio language server for CSS works. Point it at the command above with the workspace root as the root URI.

## Library

`token-jet-lsp` exports the analysis without the protocol: `findCalls`, `callAt`, `complete`, `hover` and `diagnose` operate on document text and a resolved token model from `token-jet`, and are what the server maps onto LSP messages.
