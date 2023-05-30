'use client';

import styled from 'styled-components';

import { tokens } from 'tokens';
import type { SizeToken } from 'types/tokens';

interface AreaProps {
  width?: SizeToken;
  children: React.ReactNode;
}

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Container = styled.div<Pick<AreaProps, 'width'>>`
  width: 100%;
  max-width: ${({ width = tokens.size.x1280 }) => width};
`;

export function Area({ width, children }: AreaProps) {
  return (
    <Root>
      <Container width={width}>{children}</Container>
    </Root>
  );
}
