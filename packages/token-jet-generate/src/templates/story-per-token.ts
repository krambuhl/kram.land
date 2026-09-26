import { typeName } from 'token-jet';
import type { ManifestToken } from 'token-jet';

import type { EntryContext, Template } from '../index.ts';
import { HEADER } from './shared.ts';

export interface StoryPerTokenOptions {
  title: string;
  render: (token: ManifestToken) => string;
}

// One CSF story per token. render returns JSX as text; the bundler compiles
// the file, this package only writes it.
export function storyPerToken(options: StoryPerTokenOptions): Template<string> {
  const { title, render } = options;
  return {
    fragment: (token) =>
      [
        `export const ${typeName(token.path)}: StoryObj = {`,
        `  name: '${token.path}',`,
        `  render: () => ${render(token)},`,
        '};',
      ].join('\n'),
    aggregate: (fragments, context: EntryContext) => {
      const tsx = [
        HEADER,
        "import type { Meta, StoryObj } from '@storybook/react';",
        '',
        `const meta: Meta = { title: '${title}' };`,
        'export default meta;',
        '',
        fragments.join('\n\n'),
      ].join('\n');
      return [{ path: `${context.name}.stories.tsx`, contents: `${tsx}\n` }];
    },
  };
}
