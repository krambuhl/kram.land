import styled from 'styled-components';

import { TextProps } from './types';

import { tokens } from 'tokens';

export const Root = styled.div<Required<Pick<TextProps, 'variant' | 'size'>>>`
  font-size: ${({ variant, size }) => tokens.fontSize[variant][size]};
  font-weight: ${({ variant }) => tokens.fontWeight[variant]};
  line-height: ${({ variant }) => tokens.lineHeight[variant]};
`;
