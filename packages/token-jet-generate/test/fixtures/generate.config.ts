import { cssModuleClass, defineGenerate, storyPerToken, tsRecord } from '../../src/index.ts';

export default defineGenerate(
  {
    padding: {
      select: 'SpaceToken',
      template: cssModuleClass({ property: 'padding', fn: 'classNameForPadding' }),
    },
    surface: {
      select: 'bg.*',
      template: cssModuleClass({ property: 'background-color', fn: 'classNameForSurface' }),
    },
    spaceValue: {
      select: 'SpaceToken',
      template: tsRecord({ name: 'spaceValue' }),
    },
    spaceStories: {
      select: 'SpaceToken',
      template: storyPerToken({
        title: 'Tokens/Space',
        render: (t) => `<div style={{ width: '${t.resolved.base}' }} />`,
      }),
    },
  },
  { tokens: './tokens/index.ts' }
);
