import type { ImageLockupProps } from './types'

import NextImage from 'next/image'
import styled from 'styled-components'

import { responsiveProp } from 'lib/responsive'
import { tokens } from 'tokens'

export const Image = styled(NextImage).attrs({
  width: 240,
  height: 240,
  sizes: '(max-width: 448px) 100vw, (max-width: 768px) 33vw, 182px',
  priority: true,
})`
  width: 100%;
  height: auto;
  aspect-ratio: 1;
`

export const StyledImageLockup = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);

  ${responsiveProp('gap', {
    xs: tokens.size.x12,
    sm: tokens.size.x20,
  })};

  ${Image} {
    width: 100%;
    border-radius: ${tokens.size.x8};
  }
`

export function ImageLockup(props: ImageLockupProps) {
  return <StyledImageLockup {...props} />
}
