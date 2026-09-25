import cx from 'classnames';

import type { SpaceToken } from 'utilities/space';

import styles from './styles.module.css';

const pClass: Record<SpaceToken, string> = {
  'var(--size-x0)': styles.pX0,
  'var(--size-x4)': styles.pX4,
  'var(--size-x8)': styles.pX8,
  'var(--size-x12)': styles.pX12,
  'var(--size-x16)': styles.pX16,
  'var(--size-x24)': styles.pX24,
  'var(--size-x32)': styles.pX32,
  'var(--size-x48)': styles.pX48,
  'var(--size-x64)': styles.pX64,
  'var(--size-x80)': styles.pX80,
  'var(--size-x96)': styles.pX96,
  'var(--size-x128)': styles.pX128,
};

const phClass: Record<SpaceToken, string> = {
  'var(--size-x0)': styles.phX0,
  'var(--size-x4)': styles.phX4,
  'var(--size-x8)': styles.phX8,
  'var(--size-x12)': styles.phX12,
  'var(--size-x16)': styles.phX16,
  'var(--size-x24)': styles.phX24,
  'var(--size-x32)': styles.phX32,
  'var(--size-x48)': styles.phX48,
  'var(--size-x64)': styles.phX64,
  'var(--size-x80)': styles.phX80,
  'var(--size-x96)': styles.phX96,
  'var(--size-x128)': styles.phX128,
};

const pvClass: Record<SpaceToken, string> = {
  'var(--size-x0)': styles.pvX0,
  'var(--size-x4)': styles.pvX4,
  'var(--size-x8)': styles.pvX8,
  'var(--size-x12)': styles.pvX12,
  'var(--size-x16)': styles.pvX16,
  'var(--size-x24)': styles.pvX24,
  'var(--size-x32)': styles.pvX32,
  'var(--size-x48)': styles.pvX48,
  'var(--size-x64)': styles.pvX64,
  'var(--size-x80)': styles.pvX80,
  'var(--size-x96)': styles.pvX96,
  'var(--size-x128)': styles.pvX128,
};

export interface SpacerOptions {
  p?: SpaceToken;
  ph?: SpaceToken;
  pv?: SpaceToken;
}

export function spacer({ p, ph, pv }: SpacerOptions) {
  return cx(p && pClass[p], ph && phClass[ph], pv && pvClass[pv]);
}
