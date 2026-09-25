import cx from 'classnames';

import { token } from 'generated/tokens';
import type { Align } from 'types/common';
import type { SpaceToken } from 'utilities/space';

import styles from './styles.module.css';

// Keyed by the token literal, so a gap value maps straight to its class.
const gapClass: Record<SpaceToken, string> = {
  'var(--size-x0)': styles.gapX0,
  'var(--size-x4)': styles.gapX4,
  'var(--size-x8)': styles.gapX8,
  'var(--size-x12)': styles.gapX12,
  'var(--size-x16)': styles.gapX16,
  'var(--size-x24)': styles.gapX24,
  'var(--size-x32)': styles.gapX32,
  'var(--size-x48)': styles.gapX48,
  'var(--size-x64)': styles.gapX64,
  'var(--size-x80)': styles.gapX80,
  'var(--size-x96)': styles.gapX96,
  'var(--size-x128)': styles.gapX128,
};

export interface StackOptions {
  align?: Align;
  gap?: SpaceToken;
}

export function stack({ align, gap = token('size.x16') }: StackOptions = {}) {
  return cx(styles.root, gapClass[gap], {
    [styles.alignCenter]: align === 'center',
    [styles.alignEnd]: align === 'end',
  });
}
