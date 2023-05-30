'use client';

import styled from 'styled-components';

import type { Align, Direction } from 'types/common';
import type { SizeToken } from 'types/tokens';
import { tokens } from 'tokens';

export interface StackProps {
  direction?: Direction;
  align?: Align;
  gap?: SizeToken;
}

export const Stack = styled.div<StackProps>`
  display: flex;
  flex-direction: ${({ direction = 'column' }) => direction};
  align-items: ${({ align = 'start' }) => align};
  gap: ${({ gap = tokens.size.x16 }) => gap};
`;
