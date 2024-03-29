'use client';

import styled from 'styled-components';

import { tokens } from 'tokens';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${tokens.size.x32};
  text-align: center;
  padding: ${tokens.size.x24} ${tokens.size.x24};
  text-align: center;
  max-width: ${tokens.size.x640};
  margin: auto;

  @media ${tokens.breakpoints.sm} {
    padding: ${tokens.size.x48} ${tokens.size.x32};
    gap: ${tokens.size.x48};
  }

  @media ${tokens.breakpoints.md} {
    padding: ${tokens.size.x64} ${tokens.size.x48};
    gap: ${tokens.size.x64};
  }

  @media ${tokens.breakpoints.lg} {
    padding: ${tokens.size.x80} ${tokens.size.x48};
    max-width: 100%;
  }
`;
