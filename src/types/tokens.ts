import { tokens } from 'src/src/tokens'

export type SizeToken = typeof tokens.size[keyof typeof tokens.size]
export type ShadowToken = typeof tokens.shadow[keyof typeof tokens.shadow]
export type FontSizeToken = typeof tokens.fontSize[keyof typeof tokens.fontSize]
export type FontFamilyToken =
  typeof tokens.fontFamily[keyof typeof tokens.fontFamily]
export type FontWeightToken =
  typeof tokens.fontWeight[keyof typeof tokens.fontWeight]
export type LineHeightToken =
  typeof tokens.lineHeight[keyof typeof tokens.lineHeight]

/* Colors */
export type BackgroundColorToken =
  | typeof tokens.bg.base[keyof typeof tokens.bg.base]
  | typeof tokens.bg.alt[keyof typeof tokens.bg.alt]
  | typeof tokens.bg.inverted[keyof typeof tokens.bg.inverted]

export type ForegroundColorToken =
  | typeof tokens.fg.base[keyof typeof tokens.fg.base]
  | typeof tokens.fg.inverted[keyof typeof tokens.fg.inverted]

export type PrimaryColorToken =
  typeof tokens.primary.action[keyof typeof tokens.primary.action]

export type SuccessColorToken =
  typeof tokens.success.action[keyof typeof tokens.success.action]

export type WarningColorToken =
  typeof tokens.warning.action[keyof typeof tokens.warning.action]

export type CriticalColorToken =
  typeof tokens.critical.action[keyof typeof tokens.critical.action]

export type ColorToken =
  | BackgroundColorToken
  | ForegroundColorToken
  | PrimaryColorToken
  | SuccessColorToken
  | WarningColorToken
  | CriticalColorToken

export type AllTokens =
  | SizeToken
  | WidthToken
  | ShadowToken
  | FontSizeToken
  | FontFamilyToken
  | FontWeightToken
  | LineHeightToken
  | BackgroundColorToken
  | ForegroundColorToken
  | PrimaryColorToken
  | SuccessColorToken
  | WarningColorToken
  | CriticalColorToken
