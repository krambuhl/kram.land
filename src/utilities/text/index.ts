import cx from 'classnames';

import type { FontVariant, Size } from 'types/common';

import styles from './styles.module.css';

const sizeClass: Record<FontVariant, Record<Size, string>> = {
  body: {
    xs: styles.bodyXs,
    sm: styles.bodySm,
    md: styles.bodyMd,
    lg: styles.bodyLg,
    xl: styles.bodyXl,
  },
  heading: {
    xs: styles.headingXs,
    sm: styles.headingSm,
    md: styles.headingMd,
    lg: styles.headingLg,
    xl: styles.headingXl,
  },
};

export interface TextOptions {
  variant?: FontVariant;
  size?: Size;
}

export function text({ variant = 'body', size = 'md' }: TextOptions = {}) {
  return cx(styles.root, sizeClass[variant][size], { [styles.variantHeading]: variant === 'heading' });
}
