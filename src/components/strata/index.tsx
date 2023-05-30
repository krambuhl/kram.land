'use client';

import styled from 'styled-components';

import type { BgToken } from 'types/tokens';
import { tokens } from 'tokens';

export interface StrataProps {
  backgroundColor?: BgToken;
  children: React.ReactNode;
}

export const Strata = styled.section<Required<StrataProps>>`
  background-color: ${({ backgroundColor = tokens.bg.base }) => backgroundColor};
`;
