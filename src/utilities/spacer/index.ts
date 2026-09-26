import cx from 'classnames';

import { classNameForPadding } from 'generated/padding';
import { classNameForPaddingBlock } from 'generated/paddingBlock';
import { classNameForPaddingInline } from 'generated/paddingInline';
import type { SpaceToken } from 'generated/tokens';

export interface SpacerOptions {
  p?: SpaceToken;
  ph?: SpaceToken;
  pv?: SpaceToken;
}

export function spacer({ p, ph, pv }: SpacerOptions) {
  return cx(classNameForPadding(p), classNameForPaddingInline(ph), classNameForPaddingBlock(pv));
}
