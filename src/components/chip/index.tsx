'use client';

import SuperEllipse from 'react-superellipse';
import styled from 'styled-components';

import { tokens } from 'tokens';

export interface ChipProps {
  children: React.ReactNode;
}

export const Root = styled.div`
  background-color: ${tokens.bg.high};
  color: ${tokens.inverted.default};
  padding: ${tokens.size.x12} ${tokens.size.x24};
  border-radius: ${tokens.radius.md};
  white-space: nowrap;
`;

export function Chip({ children }: ChipProps) {
  return (
    <SuperEllipse r1={0.075} r2={0.5} p1={6}>
      <Root>{children}</Root>
    </SuperEllipse>
  );
}
