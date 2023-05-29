import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { StackProps } from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

export const Stack = component$<StackProps>(
  ({ direction = "column", align = "left", gap = tokens.size.x16 }) => {
    useStyles$(style);

    return (
      <Root
        style={{
          "--stack-direction": direction,
          "--stack-align": align,
          "--stack-gap": gap,
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);
