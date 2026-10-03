import { cssModuleClass, defineGenerate, storyPerToken, tsRecord } from '../../src/index.ts';

export default defineGenerate(
  {
    padding: {
      tag: 'spacing',
      template: cssModuleClass({ property: 'padding', fn: 'classNameForPadding' }),
    },
    surface: {
      tag: 'surface',
      template: cssModuleClass({ property: 'background-color', fn: 'classNameForSurface' }),
    },
    spaceValue: {
      tag: 'spacing',
      template: tsRecord({ name: 'spaceValue' }),
    },
    spaceStories: {
      tag: 'spacing',
      template: storyPerToken({
        title: 'Tokens/Space',
        render: (t) => `<div style={{ width: '${t.resolved.base}' }} />`,
      }),
    },
  },
  { tokens: './tokens/index.ts' }
);
