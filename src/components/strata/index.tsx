import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { StrataProps } from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

export const Strata = component$<StrataProps>(
  ({ backgroundColor = tokens.bg.base }) => {
    useStyles$(style);

    return (
      <Root
        style={{
          "--strata-bg-color": backgroundColor,
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);
