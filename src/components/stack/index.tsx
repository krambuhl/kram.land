import type { Align } from 'types/common';
import type { SizeToken } from 'types/tokens';

import styles from './styles.module.css';

export interface StackProps {
  align?: Align;
  gap?: SizeToken;
  children?: React.ReactNode;
}

export function Stack({ align, gap, children }: StackProps) {
  return (
    <div className={styles.root} data-align={align} style={{ '--stack-gap': gap } as React.CSSProperties}>
      {children}
    </div>
  );
}
