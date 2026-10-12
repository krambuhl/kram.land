import { relative } from 'node:path';

import type { ChildNode, Plugin } from 'postcss';

import { variantClass } from './index.ts';
import { mediaQuery, rangesOf } from './scale.ts';
import type { Range } from './scale.ts';
import type { Scale } from './scale.ts';
import { PACKAGE, realPath } from './scan.ts';
import type { Usage } from './scan.ts';

export interface ResponsiveState {
  scale: Scale;
  usages: (cssFile: string) => readonly Usage[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function responsivePostcss(state: () => ResponsiveState | undefined): Plugin {
  return {
    postcssPlugin: PACKAGE,
    // Once, not OnceExit: postcss-modules hashes and exports class names in
    // OnceExit, so the variants must exist before then to be exported.
    Once(root, { AtRule }) {
      const current = state();
      const input = root.source?.input.file;
      if (current === undefined || input === undefined) return;
      const file = realPath(input);
      const additions: ChildNode[] = [];
      const done = new Set<string>();
      for (const usage of current.usages(file)) {
        const variant = variantClass(usage.className, usage.match);
        if (done.has(variant)) continue;
        done.add(variant);
        let ranges: Range[];
        try {
          ranges = rangesOf(usage.match, current.scale);
        } catch (error) {
          throw new Error(`${usage.at}: ${(error as Error).message}`, { cause: error });
        }
        const selector = new RegExp(`\\.${escapeRegExp(usage.className)}(?![\\w-])`, 'g');
        const clones: ChildNode[] = [];
        root.walkRules((rule) => {
          if (rule.selector.search(selector) < 0) return;
          let node: ChildNode = rule.clone({ selector: rule.selector.replace(selector, `.${variant}`) });
          for (let parent = rule.parent; parent?.type === 'atrule'; parent = parent.parent) {
            const wrapper = parent.clone();
            wrapper.removeAll();
            node = wrapper.append(node);
          }
          clones.push(node);
        });
        if (clones.length === 0) {
          throw new Error(`${usage.at}: .${usage.className} is not in ${relative(process.cwd(), file)}.`);
        }
        const query = mediaQuery(ranges, current.scale);
        additions.push(
          ...(query === null
            ? clones
            : [new AtRule({ name: 'media', params: query, nodes: clones, raws: { before: '\n\n', after: '\n' } })])
        );
      }
      if (additions.length > 0) root.append(...additions);
    },
  };
}
