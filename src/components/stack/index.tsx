'use client';

import type { Align, Direction } from 'types/common';
import type { SizeToken } from 'types/tokens';

import styles from './styles.module.css';

export interface StackProps {
  as?: React.ElementType;
  direction?: Direction;
  align?: Align;
  gap?: SizeToken;
  children?: React.ReactNode;
}

export function Stack({ as: Component = 'div', direction, align, gap, children }: StackProps) {
  return (
    <Component
      className={styles.root}
      data-direction={direction}
      data-align={align}
      style={{ '--stack-gap': gap } as React.CSSProperties}
    >
      {children}
    </Component>
  );
}
