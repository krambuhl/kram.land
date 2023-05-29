import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { CardProps } from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

function getImage({
  backgroundImage,
  backgroundGradient,
}: Pick<CardProps, "backgroundImage" | "backgroundGradient">) {
  const bg = [];

  if (backgroundImage) {
    bg.push(`url(${backgroundImage})`);
  }

  if (backgroundGradient) {
    bg.push(
      `linear-gradient(150deg, ${backgroundGradient[0]}, ${backgroundGradient[1]} 85%)`
    );
  }

  return bg.join(", ");
}

export const Card = component$<CardProps>(
  ({
    padding = "default",
    color = tokens.content.default,
    backgroundColor = tokens.bg.low,
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
          "--card-background-image": getImage({
            backgroundImage,
            backgroundGradient,
          }),
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);
