import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { CardProps } from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

export const Card = component$<CardProps>(
  ({
    padding = "default",
    color = tokens.content.default,
    backgroundColor = tokens.bg.alt,
    backgroundImage,
    backgroundGradient,
  }) => {
    useStyles$(style);

    return (
      <Root
        style={{
          "--card-padding":
            padding === "default" ? tokens.size.x32 : tokens.size.x0,
          "--card-color": color,
          "--card-background-color": backgroundColor,
          "--card-background-image": backgroundImage
            ? `url(${backgroundImage})`
            : "",
          "--card-background-gradient": backgroundGradient
            ? `linear-gradient(to bottom right, ${backgroundGradient[0]}, ${backgroundGradient[1]})`
            : "",
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);
