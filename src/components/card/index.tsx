import type { Padding } from 'types/common';

import styles from './styles.module.css';

export interface CardProps {
  padding?: Padding;
  children: React.ReactNode;
}

export function Card({ padding, children }: CardProps) {
  return (
    <div className={styles.root} data-padding={padding}>
      {children}
    </div>
  );
}
