'use client';

import styled from 'styled-components';
import SuperEllipse from 'react-superellipse';

import type Image from 'next/image';
import { tokens } from 'tokens';
import type { Padding } from 'types/common';
import type { ActionToken, BgToken, ColorToken, ContentToken, InvertedToken, MutedToken } from 'types/tokens';

export interface CardProps {
  ratio?: number;
  padding?: Padding;
  color?: ContentToken | ActionToken | MutedToken | InvertedToken;
  backgroundColor?: BgToken;
  backgroundImage?: React.ReactElement<typeof Image>;
  backgroundGradient?: [ColorToken, ColorToken];
  children: React.ReactNode;
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

export const Root = styled.div<CardProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: ${tokens.radius.container};
  overflow: hidden;
  padding: ${getPadding};
  color: ${({ color = tokens.content.default }) => color};
  background-color: ${({ backgroundColor = tokens.bg.low }) => backgroundColor};
  background-image: ${({ backgroundGradient }) =>
    backgroundGradient ? `linear-gradient(150deg, ${backgroundGradient.join(', ')})` : undefined};
  background-size: cover;
  aspect-ratio: ${({ ratio = 2 / 1 }) => ratio};
`;

export const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ContentWrapper = styled.div`
  z-index: 1;
`;

export function Card({
  ratio,
  padding,
  color,
  backgroundColor,
  backgroundGradient,
  backgroundImage,
  children,
}: CardProps) {
  return (
    <SuperEllipse r1={0.075} r2={0.5} p1={18}>
      <Root
        ratio={ratio}
        padding={padding}
        color={color}
        backgroundColor={backgroundColor}
        backgroundGradient={backgroundGradient}
      >
        {backgroundImage && <ImageWrapper>{backgroundImage}</ImageWrapper>}
        <ContentWrapper>{children}</ContentWrapper>
      </Root>
    </SuperEllipse>
  );
}
