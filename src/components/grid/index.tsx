'use client';

import styled from 'styled-components';

import type { SizeToken } from 'types/tokens';
import { tokens } from 'tokens';

export interface GridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: SizeToken;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  width: 100%;
  gap: ${({ gap = tokens.size.x32 }) => gap};

  @media ${tokens.breakpoints.lg} {
    grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
    grid-template-rows: auto;
  }
`;
