import cx from 'classnames';

import type { Align } from 'types/common';
import type { SizeToken } from 'types/tokens';

import styles from './styles.module.css';

export interface StackProps {
  align?: Align;
  gap?: SizeToken;
  children?: React.ReactNode;
}

export function Stack({ align, gap, children }: StackProps) {
  const className = cx(styles.root, {
    [styles.alignCenter]: align === 'center',
    [styles.alignEnd]: align === 'end',
  });

  return (
    <div className={className} style={{ '--stack-gap': gap } as React.CSSProperties}>
      {children}
    </div>
  );
}
