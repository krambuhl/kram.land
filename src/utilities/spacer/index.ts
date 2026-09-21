import cx from 'classnames';

import { toSpaceKey } from 'utilities/space';
import type { SpaceKey, SpaceToken } from 'utilities/space';

import styles from './styles.module.css';

const pClass: Record<SpaceKey, string> = {
  x0: styles.pX0,
  x4: styles.pX4,
  x8: styles.pX8,
  x12: styles.pX12,
  x16: styles.pX16,
  x24: styles.pX24,
  x32: styles.pX32,
  x48: styles.pX48,
  x64: styles.pX64,
  x80: styles.pX80,
  x96: styles.pX96,
  x128: styles.pX128,
};

const phClass: Record<SpaceKey, string> = {
  x0: styles.phX0,
  x4: styles.phX4,
  x8: styles.phX8,
  x12: styles.phX12,
  x16: styles.phX16,
  x24: styles.phX24,
  x32: styles.phX32,
  x48: styles.phX48,
  x64: styles.phX64,
  x80: styles.phX80,
  x96: styles.phX96,
  x128: styles.phX128,
};

const pvClass: Record<SpaceKey, string> = {
  x0: styles.pvX0,
  x4: styles.pvX4,
  x8: styles.pvX8,
  x12: styles.pvX12,
  x16: styles.pvX16,
  x24: styles.pvX24,
  x32: styles.pvX32,
  x48: styles.pvX48,
  x64: styles.pvX64,
  x80: styles.pvX80,
  x96: styles.pvX96,
  x128: styles.pvX128,
};

export interface SpacerOptions {
  p?: SpaceToken;
  ph?: SpaceToken;
  pv?: SpaceToken;
}

export function spacer({ p, ph, pv }: SpacerOptions) {
  return cx(p && pClass[toSpaceKey(p)], ph && phClass[toSpaceKey(ph)], pv && pvClass[toSpaceKey(pv)]);
}
