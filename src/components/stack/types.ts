import type { Align, Direction } from "~/types/common";
import type { SizeToken } from "~/types/tokens";

export interface StackProps {
  direction?: Direction;
  align?: Align;
  gap?: SizeToken;
}
