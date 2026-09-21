'use client';

import type { SizeToken } from 'types/tokens';

import styles from './styles.module.css';

interface AreaProps {
  width?: SizeToken;
  children: React.ReactNode;
}

export function Area({ width, children }: AreaProps) {
  return (
    <div className={styles.root}>
      <div className={styles.container} style={{ '--area-width': width } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}
