import React from 'react';

import type { BodyTextProps, DataTextProps, HeadingTextProps, TextProps } from './types';
import { tokens } from 'tokens';

import styles from './styles.module.css';

export function Text({ as: Component = 'div', variant = 'body', size = 'md', children }: TextProps) {
  return (
    <Component
      className={styles.root}
      data-variant={variant}
      style={{ '--text-font-size': tokens.fontSize[variant][size] } as React.CSSProperties}
    >
      {children}
    </Component>
  );
}

export function HeadingText({ as = 'h1', size = 'md', children }: HeadingTextProps) {
  return (
    <Text as={as} variant="heading" size={size}>
      {children}
    </Text>
  );
}

export function BodyText({ as = 'span', size = 'md', children }: BodyTextProps) {
  return (
    <Text as={as} variant="body" size={size}>
      {children}
    </Text>
  );
}

export function DataText({ as = 'pre', size = 'md', children }: DataTextProps) {
  return (
    <Text as={as} variant="data" size={size}>
      {children}
    </Text>
  );
}
