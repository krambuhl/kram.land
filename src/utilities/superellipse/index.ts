import styles from './styles.module.css';

const CURVE = 1.35;

export function superellipse() {
  return styles.root;
}

export function superellipseExponent(): number {
  const supported = typeof CSS !== 'undefined' && CSS.supports('corner-shape', `superellipse(${CURVE})`);
  return supported ? 2 ** CURVE : 2;
}
