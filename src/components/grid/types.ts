import type { SizeToken } from "~/types/tokens";

export interface GridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: SizeToken;
}
