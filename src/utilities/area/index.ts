import cx from 'classnames';

import type {
  SizeX128,
  SizeX192,
  SizeX256,
  SizeX384,
  SizeX512,
  SizeX640,
  SizeX768,
  SizeX896,
  SizeX1024,
  SizeX1152,
  SizeX1280,
  SizeX1408,
  SizeX1536,
  SizeX1664,
  SizeX1792,
  SizeX1920,
} from 'generated/tokens';
import { token } from 'generated/tokens';

import styles from './styles.module.css';

// The width subset of the size scale. A spacing-sized token is not a width.
type WidthToken =
  | SizeX128
  | SizeX192
  | SizeX256
  | SizeX384
  | SizeX512
  | SizeX640
  | SizeX768
  | SizeX896
  | SizeX1024
  | SizeX1152
  | SizeX1280
  | SizeX1408
  | SizeX1536
  | SizeX1664
  | SizeX1792
  | SizeX1920;

const widthClass: Record<WidthToken, string> = {
  'var(--size-x128)': styles.widthX128,
  'var(--size-x192)': styles.widthX192,
  'var(--size-x256)': styles.widthX256,
  'var(--size-x384)': styles.widthX384,
  'var(--size-x512)': styles.widthX512,
  'var(--size-x640)': styles.widthX640,
  'var(--size-x768)': styles.widthX768,
  'var(--size-x896)': styles.widthX896,
  'var(--size-x1024)': styles.widthX1024,
  'var(--size-x1152)': styles.widthX1152,
  'var(--size-x1280)': styles.widthX1280,
  'var(--size-x1408)': styles.widthX1408,
  'var(--size-x1536)': styles.widthX1536,
  'var(--size-x1664)': styles.widthX1664,
  'var(--size-x1792)': styles.widthX1792,
  'var(--size-x1920)': styles.widthX1920,
};

export interface AreaOptions {
  width?: WidthToken;
}

export function area({ width = token('size.x1280') }: AreaOptions = {}) {
  return cx(styles.root, widthClass[width]);
}
