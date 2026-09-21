'use client';

import SuperEllipse from 'react-superellipse';

import type Image from 'next/image';
import type { Padding } from 'types/common';
import type { ActionToken, BgToken, ColorToken, ContentToken, InvertedToken, MutedToken } from 'types/tokens';

import styles from './styles.module.css';

export interface CardProps {
  ratio?: number;
  padding?: Padding;
  color?: ContentToken | ActionToken | MutedToken | InvertedToken;
  backgroundColor?: BgToken;
  backgroundImage?: React.ReactElement<typeof Image>;
  backgroundGradient?: [ColorToken, ColorToken];
  children: React.ReactNode;
}

export function Card({
  ratio,
  padding,
  color,
  backgroundColor,
  backgroundGradient,
  backgroundImage,
  children,
}: CardProps) {
  const style = {
    '--card-ratio': ratio,
    '--card-color': color,
    '--card-background-color': backgroundColor,
    '--card-background-image': backgroundGradient && `linear-gradient(150deg, ${backgroundGradient.join(', ')})`,
  } as React.CSSProperties;

  return (
    <SuperEllipse r1={0.075} r2={0.5} p1={18}>
      <div className={styles.root} data-padding={padding} style={style}>
        {backgroundImage && <div className={styles.image}>{backgroundImage}</div>}
        <div className={styles.content}>{children}</div>
      </div>
    </SuperEllipse>
  );
}
