import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { GridProps } from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

export const Grid = component$<GridProps>(
  ({ columns = 2, gap = tokens.size.x32 }) => {
    useStyles$(style);

    return (
      <Root
        style={{
          "--grid-columns": columns,
          "--grid-gap": gap,
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);
