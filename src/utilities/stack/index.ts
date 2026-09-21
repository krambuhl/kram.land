import cx from 'classnames';

import { tokens } from 'tokens';
import type { Align } from 'types/common';
import { toSpaceKey } from 'utilities/space';
import type { SpaceKey, SpaceToken } from 'utilities/space';

import styles from './styles.module.css';

const gapClass: Record<SpaceKey, string> = {
  x0: styles.gapX0,
  x4: styles.gapX4,
  x8: styles.gapX8,
  x12: styles.gapX12,
  x16: styles.gapX16,
  x24: styles.gapX24,
  x32: styles.gapX32,
  x48: styles.gapX48,
  x64: styles.gapX64,
  x80: styles.gapX80,
  x96: styles.gapX96,
  x128: styles.gapX128,
};

export interface StackOptions {
  align?: Align;
  gap?: SpaceToken;
}

export function stack({ align, gap = tokens.size.x16 }: StackOptions = {}) {
  return cx(styles.root, gapClass[toSpaceKey(gap)], {
    [styles.alignCenter]: align === 'center',
    [styles.alignEnd]: align === 'end',
  });
}
