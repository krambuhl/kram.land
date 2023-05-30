'use client';

import styled from 'styled-components';

import { tokens } from 'tokens';

export const Rule = styled.hr`
  margin: ${tokens.size.x12} 0;
  height: 1px;
  width: ${tokens.size.x32};
  background: ${tokens.content.default};
`;
