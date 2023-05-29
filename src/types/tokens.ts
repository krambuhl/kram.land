import type { tokens } from '../tokens';

// Sizes
export type SizeToken = (typeof tokens.size)[keyof typeof tokens.size];
export type RadiusToken = (typeof tokens.radius)[keyof typeof tokens.radius];

// Type
export type FontFamilyToken = (typeof tokens.fontFamily)[keyof typeof tokens.fontFamily];
export type FontWeightToken = (typeof tokens.fontWeight)[keyof typeof tokens.fontWeight];
export type LineHeightToken = (typeof tokens.lineHeight)[keyof typeof tokens.lineHeight];
export type FontSizeHeadingToken = (typeof tokens.fontSize.heading)[keyof typeof tokens.fontSize.heading];
export type FontSizeBodyToken = (typeof tokens.fontSize.body)[keyof typeof tokens.fontSize.body];
export type FontSizeDataToken = (typeof tokens.fontSize.data)[keyof typeof tokens.fontSize.data];
export type FontSizeToken = FontSizeHeadingToken | FontSizeBodyToken | FontSizeDataToken;

// Colors
export type BgToken = (typeof tokens.bg)[keyof typeof tokens.bg];
export type ContentToken = (typeof tokens.content)[keyof typeof tokens.content];
export type ActionToken = (typeof tokens.action)[keyof typeof tokens.action];
export type MutedToken = (typeof tokens.muted)[keyof typeof tokens.muted];
export type InvertedToken = (typeof tokens.inverted)[keyof typeof tokens.inverted];

export type ColorToken = BgToken | ContentToken | ActionToken | MutedToken | InvertedToken;

export type AnyToken =
  | SizeToken
  | FontFamilyToken
  | FontWeightToken
  | LineHeightToken
  | FontSizeToken
  | RadiusToken
  | BgToken
  | ContentToken
  | ActionToken
  | MutedToken
  | InvertedToken;
