import cx from 'classnames';

import { tokens } from 'tokens';

import styles from './styles.module.css';

const widthKeys = [
  'x128',
  'x192',
  'x256',
  'x384',
  'x512',
  'x640',
  'x768',
  'x896',
  'x1024',
  'x1152',
  'x1280',
  'x1408',
  'x1536',
  'x1664',
  'x1792',
  'x1920',
] as const;

type WidthKey = (typeof widthKeys)[number];
type WidthToken = (typeof tokens.size)[WidthKey];

const keyByToken = Object.fromEntries(widthKeys.map((key) => [tokens.size[key], key])) as Record<WidthToken, WidthKey>;

const widthClass: Record<WidthKey, string> = {
  x128: styles.widthX128,
  x192: styles.widthX192,
  x256: styles.widthX256,
  x384: styles.widthX384,
  x512: styles.widthX512,
  x640: styles.widthX640,
  x768: styles.widthX768,
  x896: styles.widthX896,
  x1024: styles.widthX1024,
  x1152: styles.widthX1152,
  x1280: styles.widthX1280,
  x1408: styles.widthX1408,
  x1536: styles.widthX1536,
  x1664: styles.widthX1664,
  x1792: styles.widthX1792,
  x1920: styles.widthX1920,
};

export interface AreaOptions {
  width?: WidthToken;
}

export function area({ width = tokens.size.x1280 }: AreaOptions = {}) {
  return cx(styles.root, widthClass[keyByToken[width]]);
}
