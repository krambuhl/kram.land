import React from 'react';

import type { BodyTextProps, DataTextProps, HeadingTextProps, TextProps } from './types';
import { Root } from './styles';

function Text({ as = 'span', variant = 'body', size = 'md', children }: TextProps) {
  return (
    <Root as={as} variant={variant} size={size}>
      {children}
    </Root>
  );
}

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
