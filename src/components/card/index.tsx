import cx from 'classnames';

import type { Padding } from 'types/common';

import styles from './styles.module.css';

export interface CardProps {
  padding?: Padding;
  children: React.ReactNode;
}

export function Card({ padding, children }: CardProps) {
  return <div className={cx(styles.root, { [styles.paddingNone]: padding === 'none' })}>{children}</div>;
}
