'use client';

import styles from './styles.module.css';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className={styles.root}>{children}</div>;
}
