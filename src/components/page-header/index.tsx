'use client';

import styled from 'styled-components';

import { Stack } from 'components/stack';
import { tokens } from 'tokens';
import { Area } from 'components/area';
import { IconEye } from 'components/icon';

export const Link = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${tokens.size.x96};
  height: ${tokens.size.x96};
  background-color: ${tokens.content.default};
  fill: ${tokens.bg.mid};
  border-radius: ${tokens.size.x96};
  transition: all 0.3s ease;

  svg {
    width: ${tokens.size.x48};
    height: ${tokens.size.x48};
  }

  &:hover {
    transform: scale(1.1);
    background-color: ${tokens.content.hover};
  }

  &:active {
    transform: scale(1.2);
    background-color: ${tokens.content.pressed};
  }
`;

export function PageHeader() {
  return (
    <Stack align="center">
      <Link href="/" aria-label="Link to the home page">
        <IconEye />
      </Link>
    </Stack>
  );
}
