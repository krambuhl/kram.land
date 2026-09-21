'use client';

import SuperEllipse from 'react-superellipse';

import styles from './styles.module.css';

export interface ChipProps {
  children: React.ReactNode;
}

export function Chip({ children }: ChipProps) {
  return (
    <SuperEllipse r1={0.075} r2={0.5} p1={6}>
      <div className={styles.root}>{children}</div>
    </SuperEllipse>
  );
}
