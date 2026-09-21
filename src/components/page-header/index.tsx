'use client';

import Link from 'next/link';

import { Stack } from 'components/stack';
import { IconEye } from 'components/icon';

import styles from './styles.module.css';

export function PageHeader() {
  return (
    <Stack align="center">
      <Link className={styles.link} href="/" aria-label="Link to the home page">
        <IconEye />
      </Link>
    </Stack>
  );
}
