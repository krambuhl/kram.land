import { cssModuleClass, defineGenerate } from 'token-jet-generate';

export default defineGenerate({
  gap: {
    select: 'SpaceToken',
    template: cssModuleClass({ property: 'gap', fn: 'classNameForGap' }),
  },
  padding: {
    select: 'SpaceToken',
    template: cssModuleClass({ property: 'padding', fn: 'classNameForPadding' }),
  },
  paddingInline: {
    select: 'SpaceToken',
    template: cssModuleClass({ property: 'padding-inline', fn: 'classNameForPaddingInline' }),
  },
  paddingBlock: {
    select: 'SpaceToken',
    template: cssModuleClass({ property: 'padding-block', fn: 'classNameForPaddingBlock' }),
  },
  maxWidth: {
    select: 'SizeToken',
    template: cssModuleClass({ property: 'max-width', fn: 'classNameForMaxWidth' }),
  },
});
