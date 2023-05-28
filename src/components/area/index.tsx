import { component$, Slot } from "@builder.io/qwik";
import type { AreaProps } from "./types";
import { tokens } from "~/tokens";
import { css } from "@emotion/css";

export const Area = component$<AreaProps>(({ width = tokens.size.x1280 }) => {
  return (
    <div
      class={css`
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <div
        class={css`
          max-width: ${width};
        `}
      >
        <Slot></Slot>
      </div>
    </div>
  );
});
