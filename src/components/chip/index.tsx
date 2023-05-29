import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { ChipProps } from "./types";
import style, { Root } from "./index.css";

export const Chip = component$<ChipProps>(() => {
  useStyles$(style);

  return (
    <Root>
      <Slot></Slot>
    </Root>
  );
});
