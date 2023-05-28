import { component$, Slot } from "@builder.io/qwik";
import type { StrataProps } from "./types";
import { tokens } from "~/tokens";
import { css } from "@emotion/css";

export const Strata = component$<StrataProps>(
  ({ backgroundColor = tokens.bg.base }) => {
    return (
      <section
        class={css`
          background-color: ${backgroundColor};
        `}
      >
        <Slot></Slot>
      </section>
    );
  }
);
