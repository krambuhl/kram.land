import { component$, Slot } from "@builder.io/qwik";
import type { CardProps } from "./types";
import { tokens } from "~/tokens";
import { css } from "@emotion/css";

export const Card = component$<CardProps>(
  ({
    padding = "default",
    color = tokens.content.default,
    backgroundColor = tokens.bg.alt,
    backgroundImage,
    backgroundGradient,
  }) => {
    return (
      <div
        class={css`
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: ${tokens.radius.container};
          overflow: hidden;
          padding: ${padding === "default" ? tokens.size.x32 : tokens.size.x0};
          background-color: ${backgroundColor};
          color: ${color};
          ${backgroundImage &&
          css`
            background-image: url(${backgroundImage});
          `};
          ${backgroundGradient &&
          css`
            background-image: linear-gradient(
              to bottom right,
              ${backgroundGradient[0]},
              ${backgroundGradient[1]}
            );
          `};
        `}
      >
        <Slot></Slot>
      </div>
    );
  }
);
