import type { SizeToken, WidthToken } from 'types/tokens'

import { PropertiesHyphen } from 'csstype'

import { CoreComponent } from 'types/core'

export interface GridProps extends CoreComponent {
  gap?: SizeToken
  columns?: PropertiesHyphen['grid-template-columns']
  rows?: PropertiesHyphen['grid-template-rows']
}

export interface AutoGridProps extends CoreComponent {
  gap?: SizeToken
  width: WidthToken
}
