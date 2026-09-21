import cx from 'classnames';

import type { Size } from 'types/common';

import styles from './styles.module.css';

const bodySizeClass: Record<Size, string> = {
  xs: styles.bodyXs,
  sm: styles.bodySm,
  md: styles.bodyMd,
  lg: styles.bodyLg,
  xl: styles.bodyXl,
};

const headingSizeClass: Record<Size, string> = {
  xs: styles.headingXs,
  sm: styles.headingSm,
  md: styles.headingMd,
  lg: styles.headingLg,
  xl: styles.headingXl,
};

interface TextOptions {
  size?: Size;
}

export function bodyText({ size = 'md' }: TextOptions = {}) {
  return cx(styles.root, styles.body, bodySizeClass[size]);
}

export function headingText({ size = 'md' }: TextOptions = {}) {
  return cx(styles.root, styles.heading, headingSizeClass[size]);
}
