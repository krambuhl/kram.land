import cx from 'classnames';

import { classNameForMaxWidth } from 'generated/maxWidth';
import { token } from 'generated/tokens';
import type { SizeToken } from 'generated/tokens';

import styles from './styles.module.css';

export interface AreaOptions {
  width?: SizeToken;
}

export function area({ width = token('size.x1280') }: AreaOptions = {}) {
  return cx(styles.root, classNameForMaxWidth(width));
}
