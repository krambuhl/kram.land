'use client';

import styled from 'styled-components';

import { tokens } from 'tokens';

export const Chip = styled.div`
  --smooth-corners: 12, 2;
  mask-image: paint(smooth-corners);
  -webkit-mask-image: paint(smooth-corners);
  background-color: ${tokens.bg.high};
  color: ${tokens.inverted.default};
  padding: ${tokens.size.x12} ${tokens.size.x16};
  border-radius: ${tokens.size.x12};
`;
