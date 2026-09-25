import cx from 'classnames';

import { token } from 'generated/tokens';
import type { SpaceToken } from 'generated/tokens';
import type { Align } from 'types/common';

import styles from './styles.module.css';

// Keyed by the token literal, so a gap value maps straight to its class.
const gapClass: Record<SpaceToken, string> = {
  'var(--space-x0)': styles.gapX0,
  'var(--space-x4)': styles.gapX4,
  'var(--space-x8)': styles.gapX8,
  'var(--space-x12)': styles.gapX12,
  'var(--space-x16)': styles.gapX16,
  'var(--space-x24)': styles.gapX24,
  'var(--space-x32)': styles.gapX32,
  'var(--space-x48)': styles.gapX48,
  'var(--space-x64)': styles.gapX64,
  'var(--space-x80)': styles.gapX80,
  'var(--space-x96)': styles.gapX96,
  'var(--space-x128)': styles.gapX128,
};

export interface StackOptions {
  align?: Align;
  gap?: SpaceToken;
}

export function stack({ align, gap = token('space.x16') }: StackOptions = {}) {
  return cx(styles.root, gapClass[gap], {
    [styles.alignCenter]: align === 'center',
    [styles.alignEnd]: align === 'end',
  });
}
