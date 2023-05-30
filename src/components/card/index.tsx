'use client';

import styled from 'styled-components';

import { tokens } from 'tokens';
import type { Padding } from 'types/common';
import type { ActionToken, BgToken, ColorToken, ContentToken, InvertedToken, MutedToken } from 'types/tokens';

export interface CardProps {
  padding?: Padding;
  color?: ContentToken | ActionToken | MutedToken | InvertedToken;
  backgroundColor?: BgToken;
  backgroundImage?: string;
  backgroundGradient?: [ColorToken, ColorToken];
}

function getImage({ backgroundImage, backgroundGradient }: Pick<CardProps, 'backgroundImage' | 'backgroundGradient'>) {
  const bg = [];

  if (backgroundImage) {
    bg.push(`url(${backgroundImage})`);
  }

  if (backgroundGradient) {
    bg.push(`linear-gradient(150deg, ${backgroundGradient.join(', ')}})`);
  }

  return bg.join(', ');
}

function getPadding({ padding = 'default' }: Pick<CardProps, 'padding'>) {
  switch (padding) {
    case 'none':
      return tokens.size.x0;
    case 'default':
    default:
      return tokens.size.x32;
  }
}

export const Card = styled.div<CardProps>`
  --smooth-corners: 6;

  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: ${tokens.radius.container};
  overflow: hidden;
  padding: ${getPadding};
  color: ${({ color = tokens.content.default }) => color};
  background-color: ${({ backgroundColor = tokens.bg.low }) => backgroundColor};
  background-image: ${getImage};
  background-size: cover;
  /* mask-image: paint(smooth-corners); */
  min-height: 0vh;
  aspect-ratio: 1 / 1;
`;
