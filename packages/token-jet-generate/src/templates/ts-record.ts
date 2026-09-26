import type { ManifestToken } from 'token-jet';

import type { EntryContext, Template } from '../index.ts';
import { HEADER, selectedTypeImport, selectedTypeName } from './shared.ts';

export interface TsRecordOptions {
  name: string;
  value?: (token: ManifestToken) => string;
}

export interface RecordFragment {
  token: ManifestToken;
  value: string;
}

export function tsRecord(options: TsRecordOptions): Template<RecordFragment> {
  const { name, value = (token) => String(token.resolved.base) } = options;
  return {
    fragment: (token) => ({ token, value: value(token) }),
    aggregate: (fragments, context: EntryContext) => {
      const type = selectedTypeName(context);
      const ts = [
        HEADER,
        selectedTypeImport(
          fragments.map((f) => f.token),
          context
        ),
        '',
        `export const ${name}: Record<${type}, string> = {`,
        ...fragments.map((f) => `  '${f.token.reference}': '${f.value.replace(/'/g, "\\'")}',`),
        '};',
      ].join('\n');
      return [{ path: `${context.name}.ts`, contents: `${ts}\n` }];
    },
  };
}
