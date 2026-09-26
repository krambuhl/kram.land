import cx from 'classnames';

import { classNameForGap } from 'generated/gap';
import { token } from 'generated/tokens';
import type { SpaceToken } from 'generated/tokens';
import type { Align } from 'types/common';

import styles from './styles.module.css';

export interface StackOptions {
  align?: Align;
  gap?: SpaceToken;
}

export function stack({ align, gap = token('space.x16') }: StackOptions = {}) {
  return cx(styles.root, classNameForGap(gap), {
    [styles.alignCenter]: align === 'center',
    [styles.alignEnd]: align === 'end',
  });
}
