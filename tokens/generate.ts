import { cssModuleClass } from 'token-jet-generate';

import { schema } from './schema.ts';

export default schema.defineGenerate({
  gap: {
    tag: 'spacing',
    template: cssModuleClass({ property: 'gap', fn: 'classNameForGap' }),
  },
  padding: {
    tag: 'spacing',
    template: cssModuleClass({ property: 'padding', fn: 'classNameForPadding' }),
  },
  paddingInline: {
    tag: 'spacing',
    template: cssModuleClass({ property: 'padding-inline', fn: 'classNameForPaddingInline' }),
  },
  paddingBlock: {
    tag: 'spacing',
    template: cssModuleClass({ property: 'padding-block', fn: 'classNameForPaddingBlock' }),
  },
  maxWidth: {
    tag: 'sizing',
    template: cssModuleClass({ property: 'max-width', fn: 'classNameForMaxWidth' }),
  },
});
