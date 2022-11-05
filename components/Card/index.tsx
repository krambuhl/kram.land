import styled from 'styled-components'

import { tokens } from 'tokens'

import { CardProps } from './types'

export const Card = styled.div<CardProps>`
  border: ${tokens.size.x2} solid ${tokens.bg.inverted.default};
  border-radius: ${tokens.size.x12};
  box-shadow: ${tokens.shadow.mid};
  color: ${tokens.fg.inverted.default};
  padding: ${({ padding = 'default' }) =>
    padding === 'default' ? tokens.size.x16 : tokens.size.x0};
`

export const CardPadding = styled.div`
  padding: ${tokens.size.x16};
`
