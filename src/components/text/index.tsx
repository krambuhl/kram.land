'use client';

import React from 'react';
import styled from 'styled-components';

import type { BodyTextProps, DataTextProps, HeadingTextProps, TextProps } from './types';
import { tokens } from 'tokens';

export const Text = styled.div<Pick<TextProps, 'variant' | 'size'>>`
  font-size: ${({ variant = 'body', size = 'md' }) => tokens.fontSize[variant][size]};
  font-weight: ${({ variant = 'body' }) => tokens.fontWeight[variant]};
  line-height: ${({ variant = 'body' }) => tokens.lineHeight[variant]};

  strong {
    font-weight: 700;
  }

  abbr {
    text-decoration: underline dotted;
  }
`;

export function HeadingText({ as = 'h1', size = 'md', children }: HeadingTextProps) {
  return (
    <Text as={as} variant="heading" size={size}>
      {children}
    </Text>
  );
}

export function BodyText({ as = 'span', size = 'md', children }: BodyTextProps) {
  return (
    <Text as={as} variant="body" size={size}>
      {children}
    </Text>
  );
}

export function DataText({ as = 'pre', size = 'md', children }: DataTextProps) {
  return (
    <Text as={as} variant="data" size={size}>
      {children}
    </Text>
  );
}
