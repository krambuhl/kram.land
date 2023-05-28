import { component$, Slot } from "@builder.io/qwik";
import type { StackProps } from "./types";
import { tokens } from "~/tokens";
import { css } from "@emotion/css";

export const Stack = component$<StackProps>(
  ({ direction = "column", align = "left", gap = tokens.size.x16 }) => {
    return (
      <div
        class={css`
          display: flex;
          flex-direction: ${direction};
          align-items: ${align};
          gap: ${gap};
        `}
      >
        <Slot></Slot>
      </div>
    );
  }
);
