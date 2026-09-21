'use client';

import type { SizeToken } from 'types/tokens';

import styles from './styles.module.css';

export interface GridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: SizeToken;
  children?: React.ReactNode;
}

export function Grid({ columns, gap, children }: GridProps) {
  return (
    <div className={styles.root} data-columns={columns} style={{ '--grid-gap': gap } as React.CSSProperties}>
      {children}
    </div>
  );
}
