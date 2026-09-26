import type { ManifestToken } from 'token-jet';

import type { EntryContext, Template } from '../index.ts';
import { HEADER, className, selectedTypeImport, selectedTypeName } from './shared.ts';

export interface CssModuleClassOptions {
  property: string;
  fn: string;
}

export interface ClassFragment {
  token: ManifestToken;
  className: string;
}

// A rule per token in a .module.css, a .d.ts beside it, and a .ts exporting
// fn. fn maps undefined to undefined so a call drops straight into classnames().
export function cssModuleClass(options: CssModuleClassOptions): Template<ClassFragment> {
  const { property, fn } = options;
  return {
    fragment: (token) => ({ token, className: className(token) }),
    aggregate: (fragments, context: EntryContext) => {
      const stylesheet = `${context.name}.module.css`;
      const css = fragments.map((f) => `.${f.className} {\n  ${property}: token('${f.token.path}');\n}`).join('\n\n');
      const dts = [
        HEADER,
        'declare const styles: {',
        ...fragments.map((f) => `  readonly ${f.className}: string;`),
        '};',
        'export default styles;',
      ].join('\n');
      const type = selectedTypeName(context);
      const ts = [
        HEADER,
        selectedTypeImport(
          fragments.map((f) => f.token),
          context
        ),
        `import styles from './${stylesheet}';`,
        '',
        `const classes: Record<${type}, string> = {`,
        ...fragments.map((f) => `  '${f.token.reference}': styles.${f.className},`),
        '};',
        '',
        `export function ${fn}(token: ${type}): string;`,
        `export function ${fn}(token: ${type} | undefined): string | undefined;`,
        `export function ${fn}(token: ${type} | undefined): string | undefined {`,
        '  return token === undefined ? undefined : classes[token];',
        '}',
      ].join('\n');
      return [
        { path: stylesheet, contents: `${css}\n` },
        { path: `${stylesheet}.d.ts`, contents: `${dts}\n` },
        { path: `${context.name}.ts`, contents: `${ts}\n` },
      ];
    },
  };
}
