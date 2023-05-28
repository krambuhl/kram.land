import { component$, Slot } from "@builder.io/qwik";
import type { GridProps } from "./types";
import { css } from "@emotion/css";
import { tokens } from "~/tokens";

export const Grid = component$<GridProps>(
  ({ columns = 2, gap = tokens.size.x32 }) => {
    return (
      <div
        class={css`
          display: grid;
          gap: ${gap};

          @media (${tokens.breakpoints.lg}) {
            grid-template-columns: repeat(${columns}, 1fr);
            grid-template-rows: auto;
          }
        `}
      >
        <Slot></Slot>
      </div>
    );
  }
);
