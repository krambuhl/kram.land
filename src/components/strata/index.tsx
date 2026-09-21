'use client';

import type { BgToken } from 'types/tokens';

import styles from './styles.module.css';

export interface StrataProps {
  backgroundColor?: BgToken;
  children: React.ReactNode;
}

export function Strata({ backgroundColor, children }: StrataProps) {
  return (
    <section className={styles.root} style={{ '--strata-background-color': backgroundColor } as React.CSSProperties}>
      {children}
    </section>
  );
}
