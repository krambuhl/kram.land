import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

import { loadConfigFile, loadTokens } from 'token-jet';
import type { Plugin } from 'vite';

import { responsivePostcss } from './postcss.ts';
import { scaleFromTokens, typesFile } from './scale.ts';
import type { Scale } from './scale.ts';
import { PACKAGE, realPath, scanDirectory, scanSource } from './scan.ts';
import type { Usage } from './scan.ts';

export const DEFAULT_TYPES_FILE = 'generated/responsive/breakpoints.d.ts';

export interface ResponsiveOptions {
  src?: string;
  tag?: string;
  typesFile?: string;
}

export async function writeTypes(root: string, options: ResponsiveOptions = {}): Promise<Scale> {
  const { config } = await loadConfigFile(root);
  const scale = scaleFromTokens(loadTokens(config), options.tag);
  const file = resolve(root, options.typesFile ?? DEFAULT_TYPES_FILE);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typesFile(scale));
  return scale;
}

function inside(file: string, dir: string): boolean {
  return file === dir || file.startsWith(`${dir}${sep}`);
}

export default function tokenJetResponsive(options: ResponsiveOptions = {}): Plugin {
  let root = process.cwd();
  let src = root;
  let scale: Scale | undefined;
  let byFile = new Map<string, Usage[]>();
  let byCss = new Map<string, Usage[]>();

  const index = () => {
    byCss = new Map();
    for (const usages of byFile.values()) {
      for (const usage of usages) {
        const css = realPath(usage.css);
        byCss.set(css, [...(byCss.get(css) ?? []), usage]);
      }
    }
  };

  const postcssPlugin = responsivePostcss(() =>
    scale === undefined ? undefined : { scale, usages: (file) => byCss.get(file) ?? [] }
  );

  return {
    name: PACKAGE,

    async config(userConfig) {
      root = resolve(userConfig.root ?? process.cwd());
      src = resolve(root, options.src ?? 'src');
      scale = await writeTypes(root, options);
      byFile = scanDirectory(src, root);
      index();
      return { css: { postcss: { plugins: [postcssPlugin] } } };
    },

    configureServer(server) {
      const tokensDir = resolve(root, 'tokens');
      const reload = (cssFiles: Iterable<string>) => {
        let any = false;
        for (const css of cssFiles) {
          for (const module of server.moduleGraph.getModulesByFile(css) ?? []) {
            server.moduleGraph.invalidateModule(module);
            any = true;
          }
        }
        if (any) server.ws.send({ type: 'full-reload' });
      };
      const report = (error: unknown) =>
        server.config.logger.error(`${PACKAGE}: ${error instanceof Error ? error.message : String(error)}`);

      server.watcher.on('all', (event, path) => {
        const file = resolve(path);
        if (inside(file, tokensDir)) {
          writeTypes(root, options)
            .then((next) => {
              scale = next;
              reload(byCss.keys());
            })
            .catch(report);
          return;
        }
        if (!inside(file, src) || !/\.(?:ts|tsx)$/.test(file) || file.endsWith('.d.ts')) return;
        if (event !== 'add' && event !== 'change' && event !== 'unlink') return;
        const before = (byFile.get(file) ?? []).map((u) => u.css);
        try {
          if (event === 'unlink') byFile.delete(file);
          else byFile.set(file, scanSource(file, readFileSync(file, 'utf8'), root));
        } catch (error) {
          report(error);
          return;
        }
        index();
        reload(new Set([...before, ...(byFile.get(file) ?? []).map((u) => u.css)].map(realPath)));
      });
    },
  };
}
