import type { Padding } from "~/types/common";
import type {
  ActionToken,
  BgToken,
  ColorToken,
  ContentToken,
  InvertedToken,
  MutedToken,
} from "~/types/tokens";

export interface CardProps {
  padding?: Padding;
  color?: ContentToken | ActionToken | MutedToken | InvertedToken;
  backgroundColor?: BgToken;
  backgroundImage?: string;
  backgroundGradient?: [ColorToken, ColorToken];
}
