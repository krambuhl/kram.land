import { resolve } from 'node:path';

import type { Declaration, Helpers } from 'postcss';
import type { Plugin } from 'vite';

import { DEFAULT_OUT_DIR, generateFiles, writeFiles } from './core/generate.ts';
import { loadConfigFile, loadTokens } from './core/load.ts';
import type { ResolvedTokens } from './core/load.ts';
import { createHandler } from './postcss.ts';
import type { DeclarationHandler } from './postcss.ts';

export interface TokenJetViteOptions {
  // Where the generated files go, relative to the vite root.
  outDir?: string;
}

// Generates the token files when vite starts, regenerates when the config
// changes, and registers the postcss plugin over the same resolved model.
// The postcss plugin reads the model through a holder, so a regeneration
// during dev is seen by the next css transform without restarting.
export default function tokenJet(options: TokenJetViteOptions = {}): Plugin {
  let root = process.cwd();
  let configFile = '';
  let handler: DeclarationHandler | undefined;

  const regenerate = async (): Promise<ResolvedTokens> => {
    const { file, config } = await loadConfigFile(root);
    configFile = file;
    const current = loadTokens(config);
    handler = createHandler(current).handler;
    writeFiles(resolve(root, options.outDir ?? DEFAULT_OUT_DIR), generateFiles(current));
    return current;
  };

  // A postcss plugin whose handler is whatever was generated last.
  const postcssPlugin = {
    postcssPlugin: 'token-jet',
    Declaration: (decl: Declaration, helpers: Helpers) => handler?.(decl, helpers),
  };

  return {
    name: 'token-jet',

    async config(userConfig) {
      root = resolve(userConfig.root ?? process.cwd());
      await regenerate();
      return {
        css: {
          postcss: {
            plugins: [
              ...(userConfig.css?.postcss && typeof userConfig.css.postcss === 'object'
                ? (userConfig.css.postcss.plugins ?? [])
                : []),
              postcssPlugin,
            ],
          },
        },
      };
    },

    configureServer(server) {
      server.watcher.add(configFile);
      server.watcher.on('change', (file) => {
        if (resolve(file) !== configFile) return;
        regenerate()
          .then(() => server.ws.send({ type: 'full-reload' }))
          .catch((error: unknown) =>
            server.config.logger.error(`token-jet: ${error instanceof Error ? error.message : String(error)}`)
          );
      });
    },
  };
}
