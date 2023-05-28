import type { Padding } from "~/types/common";
import type { BgToken, SizeToken } from "~/types/tokens";

export interface AreaProps {
  padding?: Padding | SizeToken;
  width?: SizeToken;
  backgroundColor?: BgToken;
}
