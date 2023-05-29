import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type {
  BodyTextProps,
  DataTextProps,
  HeadingTextProps,
  TextProps,
} from "./types";
import { tokens } from "~/tokens";
import style, { Root } from "./index.css";

const Text = component$<TextProps>(
  ({ as = "span", variant = "body", size = "md" }) => {
    useStyles$(style);

    console.log(as);

    return (
      <Root
        style={{
          "--text-font-size": tokens.fontSize[variant][size],
          "--text-font-weight": tokens.fontWeight[variant],
          "--text-line-height": tokens.lineHeight[variant],
        }}
      >
        <Slot></Slot>
      </Root>
    );
  }
);

export const HeadingText = component$<HeadingTextProps>(
  ({ as = "h2", size = "md" }) => {
    return (
      <Text variant="heading" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);

export const BodyText = component$<BodyTextProps>(
  ({ as = "span", size = "md" }) => {
    return (
      <Text variant="body" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);

export const DataText = component$<DataTextProps>(
  ({ as = "pre", size = "md" }) => {
    return (
      <Text variant="data" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);
