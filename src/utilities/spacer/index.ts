import cx from 'classnames';

import type { SpaceToken } from 'generated/tokens';

import styles from './styles.module.css';

const pClass: Record<SpaceToken, string> = {
  'var(--space-x0)': styles.pX0,
  'var(--space-x4)': styles.pX4,
  'var(--space-x8)': styles.pX8,
  'var(--space-x12)': styles.pX12,
  'var(--space-x16)': styles.pX16,
  'var(--space-x24)': styles.pX24,
  'var(--space-x32)': styles.pX32,
  'var(--space-x48)': styles.pX48,
  'var(--space-x64)': styles.pX64,
  'var(--space-x80)': styles.pX80,
  'var(--space-x96)': styles.pX96,
  'var(--space-x128)': styles.pX128,
};

const phClass: Record<SpaceToken, string> = {
  'var(--space-x0)': styles.phX0,
  'var(--space-x4)': styles.phX4,
  'var(--space-x8)': styles.phX8,
  'var(--space-x12)': styles.phX12,
  'var(--space-x16)': styles.phX16,
  'var(--space-x24)': styles.phX24,
  'var(--space-x32)': styles.phX32,
  'var(--space-x48)': styles.phX48,
  'var(--space-x64)': styles.phX64,
  'var(--space-x80)': styles.phX80,
  'var(--space-x96)': styles.phX96,
  'var(--space-x128)': styles.phX128,
};

const pvClass: Record<SpaceToken, string> = {
  'var(--space-x0)': styles.pvX0,
  'var(--space-x4)': styles.pvX4,
  'var(--space-x8)': styles.pvX8,
  'var(--space-x12)': styles.pvX12,
  'var(--space-x16)': styles.pvX16,
  'var(--space-x24)': styles.pvX24,
  'var(--space-x32)': styles.pvX32,
  'var(--space-x48)': styles.pvX48,
  'var(--space-x64)': styles.pvX64,
  'var(--space-x80)': styles.pvX80,
  'var(--space-x96)': styles.pvX96,
  'var(--space-x128)': styles.pvX128,
};

export interface SpacerOptions {
  p?: SpaceToken;
  ph?: SpaceToken;
  pv?: SpaceToken;
}

export function spacer({ p, ph, pv }: SpacerOptions) {
  return cx(p && pClass[p], ph && phClass[ph], pv && pvClass[pv]);
}
